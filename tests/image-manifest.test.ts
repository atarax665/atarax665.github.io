import { describe, it, expect } from "vitest";
import {
  planVariants,
  contentHash,
  variantPath,
  buildSrcset,
} from "../scripts/lib/image-manifest.mjs";

describe("planVariants", () => {
  it("returns all standard widths for a source at the largest step", () => {
    expect(planVariants(2048)).toEqual([320, 640, 960, 1440, 2048]);
  });

  it("never upscales beyond the source, but does emit the native width", () => {
    expect(planVariants(800)).toEqual([320, 640, 800]);
  });

  it("emits a single variant for a source smaller than the first step", () => {
    expect(planVariants(100)).toEqual([100]);
  });

  it("includes the native width when it falls between steps", () => {
    expect(planVariants(1000)).toEqual([320, 640, 960, 1000]);
  });

  it("does not duplicate the native width when it equals a step", () => {
    expect(planVariants(640)).toEqual([320, 640]);
  });

  it("caps at 2048 for very large sources", () => {
    expect(planVariants(4032)).toEqual([320, 640, 960, 1440, 2048]);
  });
});

describe("contentHash", () => {
  it("is stable for identical input", () => {
    expect(contentHash(Buffer.from("a"))).toBe(contentHash(Buffer.from("a")));
  });

  it("differs for different input", () => {
    expect(contentHash(Buffer.from("a"))).not.toBe(
      contentHash(Buffer.from("b"))
    );
  });

  it("is 8 hex characters", () => {
    expect(contentHash(Buffer.from("a"))).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe("variantPath", () => {
  it("builds a hashed, width-suffixed path", () => {
    expect(variantPath("Malaiyo", "deadbeef", 640, "avif")).toBe(
      "_img/deadbeef/Malaiyo-640.avif"
    );
  });
});

describe("buildSrcset", () => {
  it("joins variants as absolute paths with w descriptors", () => {
    expect(buildSrcset("Malaiyo", "deadbeef", [320, 640], "avif")).toBe(
      "/_img/deadbeef/Malaiyo-320.avif 320w, /_img/deadbeef/Malaiyo-640.avif 640w"
    );
  });
});
