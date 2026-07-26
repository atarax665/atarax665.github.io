import { describe, it, expect } from "vitest";
import {
  classify,
  normalizeRoute,
  buildPrecacheList,
} from "../scripts/lib/precache.mjs";

describe("classify", () => {
  it("treats hashed next static assets as immutable", () => {
    expect(classify("/_next/static/chunks/main-abc123.js")).toBe("immutable");
  });

  it("treats generated image variants as immutable", () => {
    expect(classify("/_img/deadbeef/Malaiyo-640.avif")).toBe("immutable");
  });

  it("treats self-hosted fonts as immutable", () => {
    expect(classify("/_next/static/media/inter-abc.woff2")).toBe("immutable");
  });

  it("treats html as a document", () => {
    expect(classify("/about/index.html")).toBe("document");
    expect(classify("/index.html")).toBe("document");
  });

  it("treats json as data", () => {
    expect(classify("/data/workouts.json")).toBe("data");
  });

  it("treats anything else as other", () => {
    expect(classify("/avatar.jpeg")).toBe("other");
  });
});

describe("normalizeRoute", () => {
  it("adds the trailing slash the export uses", () => {
    expect(normalizeRoute("https://x.dev/about")).toBe("/about/");
  });

  it("leaves an already-trailing-slashed route alone", () => {
    expect(normalizeRoute("https://x.dev/about/")).toBe("/about/");
  });

  it("maps the root to a single slash", () => {
    expect(normalizeRoute("https://x.dev/")).toBe("/");
    expect(normalizeRoute("https://x.dev")).toBe("/");
  });

  it("strips query and hash", () => {
    expect(normalizeRoute("https://x.dev/about/?x=1#y")).toBe("/about/");
  });

  it("does not add a slash to file-like paths", () => {
    expect(normalizeRoute("https://x.dev/_img/a/b-320.avif")).toBe(
      "/_img/a/b-320.avif"
    );
  });
});

describe("buildPrecacheList", () => {
  it("maps index.html files to their route form", () => {
    const list = buildPrecacheList([
      "/index.html",
      "/offline/index.html",
      "/about/index.html",
    ]);
    expect(list).toContain("/");
    expect(list).toContain("/offline/");
    expect(list).toContain("/about/");
  });

  it("includes hashed static assets", () => {
    expect(buildPrecacheList(["/_next/static/a.js"])).toContain(
      "/_next/static/a.js"
    );
  });

  it("excludes source maps", () => {
    expect(buildPrecacheList(["/_next/static/a.js.map"])).not.toContain(
      "/_next/static/a.js.map"
    );
  });

  it("excludes the service worker itself to avoid a caching loop", () => {
    expect(buildPrecacheList(["/sw.js"])).not.toContain("/sw.js");
  });

  it("does not precache large image variants, which are cached on demand", () => {
    expect(buildPrecacheList(["/_img/abc/Photo-2048.avif"])).not.toContain(
      "/_img/abc/Photo-2048.avif"
    );
  });

  it("deduplicates", () => {
    const list = buildPrecacheList(["/index.html", "/index.html"]);
    expect(list.filter((p) => p === "/")).toHaveLength(1);
  });
});
