#!/usr/bin/env node
/**
 * Build-time responsive image pipeline.
 *
 * Encodes every image referenced by content frontmatter into AVIF/WebP/JPEG at
 * several widths, plus a tiny blurred placeholder, and records the result in
 * generated/images.json. Runs as `prebuild`.
 *
 * Why this exists: the site is a static export, so next/image's optimizer —
 * which needs a server — is disabled. Without this, browsers download 4032px
 * originals to paint 300px tiles.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import matter from "gray-matter";
import {
  FORMATS,
  planVariants,
  contentHash,
  variantPath,
  buildSrcset,
} from "./lib/image-manifest.mjs";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC_DIR, "_img");
const MANIFEST = path.join(ROOT, "generated", "images.json");
const CACHE = path.join(ROOT, ".image-cache.json");

/** Collect every image path referenced by content frontmatter. */
async function collectSources() {
  const sources = new Set();

  const addFrom = async (dir, field) => {
    let files;
    try {
      files = await fs.readdir(path.join(ROOT, dir));
    } catch {
      return; // directory absent — nothing to collect
    }
    for (const file of files.filter((f) => f.endsWith(".md"))) {
      const raw = await fs.readFile(path.join(ROOT, dir, file), "utf8");
      const value = matter(raw).data?.[field];
      if (typeof value === "string" && value.startsWith("/")) sources.add(value);
    }
  };

  await addFrom("_photos", "image");
  await addFrom("_blogs", "photo");

  // The avatar lives in _content/about.md rather than a collection.
  try {
    const about = await fs.readFile(
      path.join(ROOT, "_content", "about.md"),
      "utf8"
    );
    const avatar = matter(about).data?.avatar;
    if (typeof avatar === "string" && avatar.startsWith("/")) {
      sources.add(avatar);
    }
  } catch {
    /* no about.md — fine */
  }

  return [...sources].sort();
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

/**
 * Intrinsic dimensions as displayed, not as stored.
 *
 * Phone photos carry EXIF orientation: a portrait shot is often stored as a
 * landscape buffer plus a "rotate 90" flag. sharp's .rotate() applies the flag
 * to the pixels, so the recorded dimensions must be swapped to match, or every
 * portrait photo gets a sideways aspect ratio in the layout.
 */
function displayDimensions(meta) {
  const swap = typeof meta.orientation === "number" && meta.orientation >= 5;
  return {
    width: swap ? meta.height : meta.width,
    height: swap ? meta.width : meta.height,
  };
}

async function processSource(src, cache) {
  const abs = path.join(PUBLIC_DIR, src.replace(/^\//, ""));

  let stat;
  try {
    stat = await fs.stat(abs);
  } catch {
    console.warn(`  ! missing, skipped: ${src}`);
    return null;
  }

  const key = `${src}:${stat.size}:${stat.mtimeMs}`;
  if (cache[src]?.key === key) return { record: cache[src].record, cached: true, bytes: 0, originalBytes: stat.size };

  const input = await fs.readFile(abs);
  const hash = contentHash(input);
  const name = path.parse(abs).name;

  const pipeline = sharp(input).rotate();
  const meta = await sharp(input).metadata();
  const { width, height } = displayDimensions(meta);

  const widths = planVariants(width);
  const dir = path.join(OUT_DIR, hash);
  await fs.mkdir(dir, { recursive: true });

  let bytes = 0;
  for (const format of FORMATS) {
    for (const w of widths) {
      const target = path.join(PUBLIC_DIR, variantPath(name, hash, w, format.ext));
      const buf = await pipeline
        .clone()
        .resize({ width: w, withoutEnlargement: true })
        .toFormat(format.ext === "jpg" ? "jpeg" : format.ext, format.options)
        .toBuffer();
      await fs.writeFile(target, buf);
      bytes += buf.length;
    }
  }

  // Low-quality placeholder: ~300 bytes, inlined as a data URI so it paints
  // with the HTML and there is never an empty box.
  const lqipBuf = await pipeline
    .clone()
    .resize({ width: 16 })
    .blur(1)
    .webp({ quality: 40 })
    .toBuffer();

  const record = {
    src,
    width,
    height,
    lqip: `data:image/webp;base64,${lqipBuf.toString("base64")}`,
    sources: FORMATS.map((f) => ({
      mime: f.mime,
      srcset: buildSrcset(name, hash, widths, f.ext),
    })),
    fallback: `/${variantPath(name, hash, widths[widths.length - 1], "jpg")}`,
  };

  cache[src] = { key, record };
  return { record, cached: false, bytes, originalBytes: stat.size };
}

const fmt = (n) =>
  n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`;

async function main() {
  const sources = await collectSources();
  if (!sources.length) {
    console.log("build-images: no sources referenced by content, nothing to do");
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });

  const cache = await readJson(CACHE, {});
  const manifest = {};
  let originalTotal = 0;
  let largestTotal = 0;
  let encoded = 0;
  let cachedCount = 0;

  for (const src of sources) {
    const result = await processSource(src, cache);
    if (!result) continue;

    manifest[src] = result.record;
    originalTotal += result.originalBytes;

    if (result.cached) {
      cachedCount += 1;
    } else {
      encoded += 1;
      console.log(
        `  ✓ ${src} → ${result.record.width}×${result.record.height}, ` +
          `${result.record.sources[0].srcset.split(",").length} widths × 3 formats`
      );
    }
  }

  // Report the AVIF weight at a realistic display width — this is what a
  // visitor actually downloads, versus the originals they download today.
  for (const record of Object.values(manifest)) {
    const avif = record.sources.find((s) => s.mime === "image/avif");
    const first = avif?.srcset.split(",")[0]?.trim().split(" ")[0];
    if (!first) continue;
    try {
      const st = await fs.stat(path.join(PUBLIC_DIR, first.replace(/^\//, "")));
      largestTotal += st.size;
    } catch {
      /* variant missing (cached run with cleared output) */
    }
  }

  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  await fs.writeFile(CACHE, JSON.stringify(cache, null, 2) + "\n");

  console.log(
    `build-images: ${encoded} encoded, ${cachedCount} cached, ` +
      `${Object.keys(manifest).length} in manifest`
  );
  console.log(
    `  originals: ${fmt(originalTotal)} → smallest AVIF set: ${fmt(largestTotal)}`
  );
}

main().catch((err) => {
  console.error("build-images failed:", err);
  process.exit(1);
});
