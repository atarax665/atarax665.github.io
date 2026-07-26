import { promises as fs } from "fs";
import path from "path";

/**
 * One image's build-time encoding result, produced by scripts/build-images.mjs.
 * Passed to components as a prop via getStaticProps so the full manifest never
 * reaches the client bundle.
 */
export type ImageRecord = {
  /** Original public path, e.g. "/photos/Malaiyo.jpg" */
  src: string;
  /** Intrinsic width as displayed (EXIF orientation already applied) */
  width: number;
  /** Intrinsic height as displayed */
  height: number;
  /** Blurred 16px placeholder as a data: URI */
  lqip: string;
  /** Ordered best-first for <picture> */
  sources: { mime: string; srcset: string }[];
  /** Largest JPEG variant, for the <img src> fallback */
  fallback: string;
};

type Manifest = Record<string, ImageRecord>;

let cached: Manifest | null = null;

/**
 * Read the generated manifest. Server/build-time only — this uses fs and must
 * only ever be reached through getStaticProps.
 */
async function loadManifest(): Promise<Manifest> {
  if (cached) return cached;
  try {
    const file = path.join(process.cwd(), "generated", "images.json");
    cached = JSON.parse(await fs.readFile(file, "utf8")) as Manifest;
  } catch {
    // Manifest absent means `npm run images` has not run. Degrade to an empty
    // manifest rather than failing the build; Img renders nothing and the
    // missing images are obvious.
    console.warn(
      "images: generated/images.json not found — run `npm run images`"
    );
    cached = {};
  }
  return cached;
}

/** Look up one image. Returns null for sources the pipeline did not process. */
export async function getImage(src?: string): Promise<ImageRecord | null> {
  if (!src) return null;
  const manifest = await loadManifest();
  return manifest[src] ?? null;
}
