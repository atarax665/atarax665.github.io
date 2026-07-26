# Portfolio UX Revamp — Design

**Date:** 2026-07-26
**Repo:** `atarax665.github.io` (Next.js static export → GitHub Pages, custom domain)
**Status:** Approved, ready for implementation planning

---

## 1. Problem

The site works but four things undermine it.

**Images are unoptimised.** `next.config.js` sets `images: { unoptimized: true }` (forced by static
export), so photos are served at native resolution. Nine photos totalling **16.2 MB** — sources are
4032×2268 or 2268×4032 — render into 140–320 px grid tiles. There are no modern formats, no
responsive variants, and no placeholders, so tiles sit blank and then pop.

**Transitions are effectively absent.** `hover:opacity-75` on tiles (which ghosts the entire tile,
text included), `transition-colors` on links, and nothing else. `PhotoModal` mounts and unmounts
with no enter or exit. The filter tabs swap the DOM instantly. No route transitions. Nothing
animates on first paint.

**The grid fights the content.** `auto-rows-[140px]` with `col-span-2 row-span-2` on the first item
crops portrait photos to near-square, discarding most of the frame. Aspect ratio is never consulted.

**No offline story.** No service worker, no manifest. Every visit is a cold network fetch.

Secondary: no dark mode; default system font stack, so the site has no typographic identity;
`pages/api/hello.ts` is dead code (API routes cannot exist in a static export); `layouts/Grid.tsx`
is unused; the nav list is duplicated between `Sidebar.tsx` and the mobile menu in `MainLayout.tsx`;
neither modal traps focus.

## 2. Decisions taken

| Decision | Choice | Rationale |
|---|---|---|
| Visual scope | Distinctive redesign | Keep the sidebar architecture, give the site a real identity |
| Aesthetic | Warm editorial | Content is a Varanasi photo essay plus writing and books; warmth suits it and separates it from monochrome dev portfolios |
| Homepage layout | A — refined sidebar + aspect-aware masonry | Preserves the familiar shape; fixes cropping and typography |
| Motion | Framer Motion, installed as the `motion` package v12.42.2, importing from `motion/react` (`framer-motion` is the legacy alias for the same code) | `layout` prop gives grid reflow reliably; hand-rolled FLIP is fiddly. ~40–50 KB gzipped is trivial against 16 MB of images removed |
| Framework | Next 16.2.12, pages router retained | Security patches and a modern build without an App Router rewrite |
| Node | Local upgrade to 22 LTS | Next 16 and sharp 0.35 both require ≥ 20.9; Node 18 reached end-of-life April 2025 |

Rejected: full layout rethink (high iteration cost); chronological journal layout (sparse with 9
photos and 1 article); App Router migration (roughly triples the work for benefits a static site of
this size will not use); CSS-only motion (grid reflow is the hard case and Framer solves it
directly); `next-pwa` (unmaintained for this configuration — a hand-written worker is smaller and
auditable).

## 3. Architecture

Seven units, each with a single responsibility and an explicit interface.

| Unit | Input → Output | Runs |
|---|---|---|
| `scripts/build-images.mjs` | source JPEGs → variants + `generated/images.json` | prebuild (node) |
| `utils/images.ts` | manifest → typed `ImageRecord` | build-time, server only |
| `components/Img.tsx` | `ImageRecord` → `<picture>` with LQIP fade | runtime |
| `styles/tokens.css` | — → CSS custom properties, light + dark | stylesheet |
| `lib/motion.ts` | — → durations, easings, shared variants | runtime |
| `scripts/build-sw.mjs` | `out/` → precache manifest → `public/sw.js` | post-build |
| `components/Nav.tsx` | nav model → links | runtime, shared desktop + mobile |

**Load-bearing decision:** the image manifest never reaches the client. `getStaticProps` enriches
each photo's meta with its `ImageRecord` and passes it as a prop. `Img` receives everything it needs
without any manifest in the client bundle.

## 4. Image pipeline

`scripts/build-images.mjs` runs as the `prebuild` script. It resolves sources from the `image` field
of `_photos/*.md` and the `photo` field of `_blogs/*.md` frontmatter.

For each source:

- **Widths** 320, 640, 960, 1440, 2048 — never upscaled beyond the source width
- **Formats** AVIF (q50), WebP (q72), JPEG (q78); `<picture>` selects per browser support
- **Output** `public/_img/<contenthash>/<name>-<width>.<ext>` — content-hashed paths mean the
  service worker can cache them immutably with no invalidation logic
- **LQIP** 16px-wide blurred WebP, base64 (~300 bytes), applied as a CSS background beneath the
  image and cross-faded out once `img.decode()` resolves
- **Intrinsic dimensions** recorded, so `Img` always emits `width`/`height` (zero CLS) and the
  masonry grid sizes cells to true aspect ratio
- **Incremental** — a side cache keyed on source mtime and size makes re-runs instant when nothing
  changed

`public/_img/` and `generated/` are gitignored and rebuilt in CI.

`Img` replaces every `next/image` call site. Under `unoptimized: true`, `next/image` currently adds
wrapper markup and no optimisation, so this removes code rather than adding it. `Img` falls back to
a plain `<img>` for sources absent from the manifest (the avatar).

**Target:** homepage transfer drops from 16.2 MB to roughly 300–500 KB. Basis: re-encoding the
existing photos to 1000 px wide during design produced 84–177 KB per file against 1.1–2.7 MB
originals, before AVIF and before sizing to actual display dimensions.

## 5. Design system

`styles/tokens.css` defines colour, spacing, radius, type-scale and motion tokens as CSS custom
properties. `tailwind.config.js` extends *from* those variables, so utilities and hand-written CSS
cannot drift apart.

Palette:

| Token | Light | Dark |
|---|---|---|
| `bg` | `#FAF8F5` | `#12110F` |
| `surface` | `#FFFFFF` | `#1B1917` |
| `ink` | `#1A1815` | `#F5F2ED` |
| `muted` | `#6B655C` | `#A19A90` |
| `accent` | `#9A4B2C` | `#C97A54` |

Type: Instrument Serif (display), Inter (body, 15px/1.65), JetBrains Mono (metadata, 11px uppercase
with 0.11em tracking). Loaded through `next/font/google`, which downloads and self-hosts at build
time — no CDN request, and they work offline under the service worker.

Dark mode via `data-theme` on `<html>`, defaulting to `prefers-color-scheme`, overridable by a
sidebar toggle persisted to `localStorage`. An inline script in `_document.tsx` sets the attribute
before first paint to prevent a flash of the wrong theme.

Contrast: every foreground/background pairing above must meet WCAG AA (4.5:1 for body text, 3:1 for
large text) in both themes. Verified during implementation, not assumed.

## 6. Layout

Layout A. The sidebar keeps its position and width but gains the serif name, a real hierarchy
between name/title/location, an accent dot marking the active nav item, mono contact links, and the
theme toggle.

Home replaces the 14px gray intro paragraph with a serif opening statement at ~25px, adds mono
filter tabs with a sliding underline, and renders the aspect-aware masonry.

**Every page is restyled**, not just home: about, blog index, blog post, now, bookshelf, workout,
contact, and individual photo pages. Applying the system everywhere is the point of having one.

## 7. Motion

`lib/motion.ts` is the sole definition of durations and easings. `<MotionConfig reducedMotion="user">`
at the app root honours `prefers-reduced-motion` by construction rather than by remembering to check
at each call site.

- Grid tiles carry `layout`; switching filter tabs makes them glide rather than teleport
- `AnimatePresence` drives modal enter/exit, with backdrop blur ramping in alongside
- Staggered fade-and-rise on mount; `whileInView` for below-the-fold rows
- Route changes fade via `AnimatePresence mode="wait"` in `_app.tsx`
- Tile hover scales the image inside an overflow-hidden frame, replacing `hover:opacity-75`

`PhotoModal` and `WorkoutModal` additionally gain a focus trap with focus restore on close, touch
swipe navigation, and preloading of the two adjacent photos.

## 8. Service worker

`scripts/build-sw.mjs` runs after the export, scans `out/`, and writes `public/sw.js` containing a
real precache manifest and a version derived from the build hash. Roughly 100 lines, hand-written,
no dependency.

| Request | Strategy |
|---|---|
| HTML documents | network-first → cache → `/offline/` |
| `/_img/*`, `/_next/static/*`, fonts | cache-first (content-hashed, safe indefinitely) |
| `/data/workouts.json` | stale-while-revalidate |

Old cache generations are deleted on `activate`. When an update is detected, a small
"new version available — reload" toast appears rather than swapping content silently.

`trailingSlash: true` is set, so routes are `/about/` not `/about`. Route matching must handle both
forms — this is the standard way service worker routing breaks on this configuration.

Also added: `public/manifest.webmanifest` and icons for installability.

## 9. Cleanup

- Delete `pages/api/hello.ts` — API routes cannot exist in a static export; it is dead today
- Delete `layouts/Grid.tsx` — unused
- Extract the nav list duplicated between `Sidebar.tsx` and `MainLayout.tsx` into `components/Nav.tsx`
- `components/BlogCard.tsx` is still used by `pages/blog/index.tsx`; restyle, do not delete

## 10. Verification — measured results

| Check | Result |
|---|---|
| `npm run build` | Passes; 19 routes exported |
| Homepage images, mobile (~400px slots) | **17.07 MB → 265 KB (65× smaller)** |
| Homepage images, desktop (~800px slots) | **17.07 MB → 510 KB (33× smaller)** |
| Encode cost, full run | 19.6 MB of sources → 11 images × 5 widths × 3 formats |
| Incremental rebuild | 0.16 s, all cached |
| LQIP placeholder size | 231 bytes |
| EXIF orientation | Portrait sources record 2268×4032 — upright |
| Grid reflow on filter change | Spring-interpolated (584 → 570 → 533 → … → 0 px), not a snap |
| Modal enter | scale 0.96 → 1, opacity 0 → 1 over ~260 ms |
| Modal a11y | `role="dialog"`, `aria-modal`, `aria-label`, focus moves inside, scroll locked |
| Service worker | Registered and controlling; 100 precache entries |
| Offline, visited routes | Server stopped — page renders in full, images included |
| Offline, unvisited route | Falls back to the themed `/offline/` page |
| Column measurement | 276 px measured, matching the SSR seed → no reflow on mount |
| Tests | 39 passing across 4 suites |
| Typecheck | Clean |
| Lint | Clean |
| Duplicate routes | 5 removed; precache dropped 125 → 100 entries |

Not completed: a Lighthouse run. The build was verified against a local static
server rather than a Lighthouse audit; performance is evidenced by the measured
transfer sizes above instead.

## 11. Order of work

1. **Foundation** — Node 22 locally, Next 13.2.3 → 16.2.12, `next export` → `output: 'export'`, CI bumped to Node 22
2. **Image pipeline** — `build-images.mjs`, `utils/images.ts`, `Img.tsx`; replace all `next/image` call sites
3. **Design system** — tokens, fonts, dark mode, Tailwind wiring
4. **Layout** — sidebar, masonry, all page restyles
5. **Motion** — `lib/motion.ts`, grid reflow, modals, route transitions
6. **Service worker** — `build-sw.mjs`, manifest, offline page, update toast
7. **Cleanup and verification** — deletions, nav extraction, full verification pass

The image pipeline lands second deliberately: it is the largest user-visible win and every later
phase sits on top of it.

## 12. Risks

| Risk | Mitigation |
|---|---|
| Next 13 → 16 migration surfaces breaking changes | Pages router is retained, so page files are unaffected; phase 1 is isolated and verified before anything else starts |
| Service worker serves stale HTML after deploy | Network-first for documents; versioned caches purged on activate; update toast |
| AVIF encoding is slow in CI | Incremental cache keyed on mtime and size; only changed sources re-encode |
| Framer Motion `layout` animations jitter in a masonry column layout | CSS `columns` does not reflow predictably under FLIP. Use a grid-based masonry with computed row spans instead, which `layout` handles correctly |
| Dark mode flash on first paint | Blocking inline script in `_document.tsx` sets `data-theme` before paint |
