/**
 * Pure helpers for building the service worker's precache list and deciding a
 * caching strategy per request. Kept free of I/O so it can be unit-tested and
 * inlined verbatim into the generated worker.
 */

/**
 * Which caching strategy a path belongs to.
 * - immutable: content-hashed, safe to cache forever
 * - document:  HTML, must stay fresh
 * - data:      JSON, tolerable slightly stale
 * - other:     everything else
 */
export function classify(path) {
  if (path.startsWith("/_next/static/") || path.startsWith("/_img/")) {
    return "immutable";
  }
  if (path.endsWith(".html")) return "document";
  if (path.endsWith(".json")) return "data";
  return "other";
}

/**
 * Reduce a request URL to the route key used in the cache.
 *
 * next.config.js sets `trailingSlash: true`, so every route is exported as
 * `/about/index.html` and served at `/about/`. A request for `/about` must map
 * onto the same entry, or the worker misses on every un-slashed link.
 */
export function normalizeRoute(url) {
  const { pathname } = new URL(url, "https://placeholder.invalid");
  if (pathname === "" || pathname === "/") return "/";
  // A path whose last segment has an extension is a file, not a route.
  const last = pathname.split("/").pop();
  if (last && last.includes(".")) return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

/**
 * Turn a list of exported file paths into the set the worker precaches at
 * install time: every route document plus the JS/CSS/font shell.
 *
 * Image variants are deliberately excluded — precaching every AVIF at every
 * width would download megabytes on first visit, defeating the point. They are
 * cached on demand instead, and cache-first thereafter.
 */
export function buildPrecacheList(files) {
  const out = new Set();

  for (const file of files) {
    if (file.endsWith(".map")) continue;
    if (file === "/sw.js") continue;
    if (file.startsWith("/_img/")) continue;

    if (file.endsWith("/index.html")) {
      const route = file.slice(0, -"index.html".length);
      out.add(route === "" ? "/" : route);
      continue;
    }
    if (file.endsWith(".html")) continue; // non-route html, skip

    if (file.startsWith("/_next/static/")) {
      out.add(file);
      continue;
    }
    if (file.endsWith(".json") || file.endsWith(".webmanifest")) {
      out.add(file);
    }
  }

  return [...out];
}
