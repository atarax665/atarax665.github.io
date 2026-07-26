import { createHash } from "node:crypto";

/**
 * Pure planning logic for the build-time image pipeline. No I/O lives here so
 * it stays testable; scripts/build-images.mjs is the shell that does the work.
 */

/** Responsive breakpoints we encode. 2048 is the ceiling — beyond it, file size
 *  grows faster than any visible benefit on the layouts we render. */
export const WIDTHS = [320, 640, 960, 1440, 2048];

/** Ordered best-first: <picture> picks the first type the browser supports. */
export const FORMATS = [
  { ext: "avif", mime: "image/avif", options: { quality: 50 } },
  { ext: "webp", mime: "image/webp", options: { quality: 72 } },
  { ext: "jpg", mime: "image/jpeg", options: { quality: 78, mozjpeg: true } },
];

/**
 * Widths to emit for a source of the given intrinsic width.
 *
 * Upscaling is never useful — it costs bytes and adds no detail — so we take
 * the standard steps below the source width, then add the source's own width
 * when it falls between steps so the largest variant is always sharp.
 */
export function planVariants(intrinsicWidth) {
  const below = WIDTHS.filter((w) => w < intrinsicWidth);
  if (WIDTHS.includes(intrinsicWidth)) return [...below, intrinsicWidth];
  // Source is larger than every step: cap at the largest step.
  if (below.length === WIDTHS.length) return [...WIDTHS];
  // Source sits between steps (or below the smallest): include it as the max.
  return [...below, intrinsicWidth];
}

/** Short content hash, used to build immutable asset paths. */
export function contentHash(buffer) {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 8);
}

/** Public path (no leading slash) for one encoded variant. */
export function variantPath(name, hash, width, ext) {
  return `_img/${hash}/${name}-${width}.${ext}`;
}

/** A `srcset` value: absolute paths with `w` descriptors. */
export function buildSrcset(name, hash, widths, ext) {
  return widths
    .map((w) => `/${variantPath(name, hash, w, ext)} ${w}w`)
    .join(", ");
}
