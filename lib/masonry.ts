/**
 * Masonry geometry for the homepage grid.
 *
 * The grid uses a small fixed row height and lets each tile span however many
 * rows its aspect ratio needs. That keeps photos uncropped while remaining a
 * real CSS grid — which matters because Framer Motion's `layout` animations
 * reflow predictably in grid but not in CSS `columns`.
 */

/** Row height in px for the masonry grid. Small = fine-grained spans. */
export const ROW_HEIGHT = 8;

/** Gap in px between grid tiles, both axes. */
export const GAP = 16;

/**
 * Number of grid rows a tile must span to render at its true aspect ratio.
 *
 * A tile spanning n rows is `n * rowHeight + (n - 1) * gap` tall, so solving
 * for n given a target height gives `(height + gap) / (rowHeight + gap)`.
 */
export function rowSpan(
  width: number,
  height: number,
  columnWidth: number,
  rowHeight: number = ROW_HEIGHT,
  gap: number = GAP
): number {
  if (!width || !height || !columnWidth) return 1;
  const renderedHeight = (height / width) * columnWidth;
  return Math.max(1, Math.ceil((renderedHeight + gap) / (rowHeight + gap)));
}
