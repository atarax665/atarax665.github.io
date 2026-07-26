import { describe, it, expect } from "vitest";
import { rowSpan } from "../lib/masonry";

// Grid geometry used by the homepage: 8px rows, 16px gaps, ~300px columns.
describe("rowSpan", () => {
  it("spans proportionally for a square image", () => {
    // 300x300 rendered => ceil((300 + 16) / (8 + 16)) = 14
    expect(rowSpan(1000, 1000, 300, 8, 16)).toBe(14);
  });

  it("spans more rows for a portrait image than a landscape one", () => {
    const portrait = rowSpan(2268, 4032, 300, 8, 16);
    const landscape = rowSpan(4032, 2268, 300, 8, 16);
    expect(portrait).toBeGreaterThan(landscape);
  });

  it("never returns less than one row", () => {
    expect(rowSpan(4000, 1, 300, 8, 16)).toBeGreaterThanOrEqual(1);
  });

  it("is independent of absolute pixel size for a fixed aspect ratio", () => {
    expect(rowSpan(1000, 2000, 300, 8, 16)).toBe(rowSpan(2000, 4000, 300, 8, 16));
  });

  it("scales with column width", () => {
    expect(rowSpan(1000, 1000, 600, 8, 16)).toBeGreaterThan(
      rowSpan(1000, 1000, 300, 8, 16)
    );
  });

  it("falls back to one row for degenerate dimensions", () => {
    expect(rowSpan(0, 0, 300, 8, 16)).toBe(1);
    expect(rowSpan(100, 100, 0, 8, 16)).toBe(1);
  });
});
