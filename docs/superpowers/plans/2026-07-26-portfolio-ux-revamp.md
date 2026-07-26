# Portfolio UX Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (Subagent-driven execution is unavailable in this session.)

**Goal:** Rebuild the portfolio's UX — a build-time responsive image pipeline replacing 16.2 MB of raw JPEGs, a warm-editorial design system with dark mode, a Framer Motion transition system, and an offline-capable service worker.

**Architecture:** A prebuild Node script encodes responsive AVIF/WebP/JPEG variants plus base64 LQIP placeholders into a manifest that `getStaticProps` folds into page props, so no manifest reaches the client. Presentation is driven by CSS custom properties that Tailwind extends from. Motion lives in one module consumed by every animated surface. A postbuild script scans the exported `out/` directory and emits a service worker with a real precache list.

**Tech Stack:** Next 16.2.12 (pages router, `output: 'export'`), React 19, TypeScript, Tailwind 3, sharp 0.35.3, motion 12.42.2, vitest 3.

**Spec:** `docs/superpowers/specs/2026-07-26-portfolio-ux-revamp-design.md`

## Global Constraints

- Node ≥ 22.23.1 locally and in CI (`.github/workflows/nextjs.yml` bumped from 20 to 22).
- Static export only — no server runtime. API routes are impossible; `getServerSideProps` is forbidden.
- `trailingSlash: true` stays. Every route is `/about/`, not `/about`. Service worker matching must handle both.
- Palette tokens, exact values: light `bg #FAF8F5`, `surface #FFFFFF`, `ink #1A1815`, `muted #6B655C`, `accent #9A4B2C`; dark `bg #12110F`, `surface #1B1917`, `ink #F5F2ED`, `muted #A19A90`, `accent #C97A54`.
- Type: Instrument Serif (display), Inter (body 15px/1.65), JetBrains Mono (metadata 11px uppercase, 0.11em tracking). Loaded via `next/font/google` so they self-host and work offline.
- Motion respects `prefers-reduced-motion` via `<MotionConfig reducedMotion="user">` at the app root — never per-call-site checks.
- Masonry uses CSS grid with computed row spans, never CSS `columns` — `columns` does not reflow predictably under Framer's `layout` animations.
- The `motion` package (v12.42.2) is the dependency; import from `motion/react`. Do not install `framer-motion`.
- Generated artifacts (`public/_img/`, `generated/`, `public/sw.js`) are gitignored and rebuilt in CI.
- All text must meet WCAG AA contrast in both themes: 4.5:1 body, 3:1 large.

## Plan Scope Note

Code blocks below are complete for the algorithmic units (image manifest, precache
generation, masonry math, theme resolution, `Img`, the service worker) and for all
test code. Presentational components specify exact interfaces, required tokens, and
acceptance criteria rather than reproducing every line of JSX — the design system in
Task 6 constrains those choices, and the verification steps prove them.

## File Structure

**Create**
| Path | Responsibility |
|---|---|
| `scripts/lib/image-manifest.mjs` | Pure: variant planning, content hashing, output paths. No I/O. |
| `scripts/build-images.mjs` | I/O shell: reads sources, drives sharp, writes manifest + cache |
| `scripts/lib/precache.mjs` | Pure: classify a file path into a caching strategy; build precache list |
| `scripts/build-sw.mjs` | I/O shell: scans `out/`, renders `public/sw.js` from template |
| `utils/images.ts` | Build-time manifest reader → typed `ImageRecord` |
| `components/Img.tsx` | `ImageRecord` → `<picture>` with LQIP cross-fade |
| `components/Nav.tsx` | Nav model → links; shared by sidebar and mobile menu |
| `components/ThemeToggle.tsx` | Theme switch UI |
| `components/UpdateToast.tsx` | "New version available — reload" |
| `lib/theme.ts` | Pure: resolve stored + system preference → theme |
| `lib/masonry.ts` | Pure: intrinsic dimensions → grid row span |
| `lib/motion.ts` | Durations, easings, shared variants |
| `styles/tokens.css` | Design tokens, light + dark |
| `pages/offline.tsx` | Offline fallback route |
| `public/manifest.webmanifest` | Installability |
| `tests/*.test.ts` | Vitest suites for the pure modules |

**Modify:** `package.json`, `next.config.js`, `tailwind.config.js`, `.gitignore`, `.github/workflows/nextjs.yml`, `pages/_app.tsx`, `pages/_document.tsx`, `pages/index.tsx`, all `pages/*/index.tsx` and `pages/*/[slug].tsx`, `components/{Sidebar,GridItem,PhotoModal,WorkoutModal,WorkoutHeatmap,BlogCard}.tsx`, `layouts/{MainLayout,PhotoLayout,BlogPost,PageLayout}.tsx`, `utils/content.ts`

**Delete:** `pages/api/hello.ts` (impossible under static export), `layouts/Grid.tsx` (unused)

---

### Task 1: Foundation — Next 16 upgrade and build config

**Files:** Modify `package.json`, `next.config.js`, `.github/workflows/nextjs.yml`, `.gitignore`; Delete `pages/api/hello.ts`

**Interfaces:**
- Produces: a working `npm run build` emitting `out/`, on Next 16 with `output: 'export'`.

- [ ] **Step 1: Confirm Node 22 is active**

Run: `node -v` → expect `v22.x`. If not: `nvm use 22`.

- [ ] **Step 2: Upgrade dependencies**

```bash
npm install next@16.2.12 react@^19 react-dom@^19
npm install -D @types/react@^19 @types/react-dom@^19 eslint-config-next@16.2.12
```

- [ ] **Step 3: Switch to `output: 'export'`**

`next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true },
}
module.exports = nextConfig
```

- [ ] **Step 4: Update build scripts**

In `package.json`, `next export` is removed in Next 16:
```json
"build": "next build",
"export": "next build",
"deploy": "npm run build && touch out/.nojekyll"
```

- [ ] **Step 5: Delete the dead API route**

```bash
git rm pages/api/hello.ts
```
Static export cannot serve API routes; this file has never worked in production.

- [ ] **Step 6: Bump CI Node to 22**

`.github/workflows/nextjs.yml`: `node-version: "20"` → `node-version: "22"`. Remove any `next export` invocation from the build step.

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: succeeds; `out/index.html`, `out/about/index.html`, `out/blog/index.html`, `out/photos/malaiyo/index.html` all exist.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "build: upgrade to Next 16, output: export, drop dead API route"
```

---

### Task 2: Image manifest core logic

**Files:** Create `scripts/lib/image-manifest.mjs`, `tests/image-manifest.test.ts`; Modify `package.json`

**Interfaces:**
- Produces:
  - `planVariants(intrinsicWidth: number): number[]` — widths to emit, never upscaling
  - `contentHash(buffer: Buffer): string` — 8-char hex
  - `variantPath(name: string, hash: string, width: number, ext: string): string` — `_img/<hash>/<name>-<w>.<ext>`
  - `WIDTHS: number[]`, `FORMATS: {ext, mime, options}[]`

- [ ] **Step 1: Install test tooling**

```bash
npm install -D vitest@^3
```
Add to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 2: Write the failing tests**

`tests/image-manifest.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { planVariants, contentHash, variantPath, WIDTHS } from '../scripts/lib/image-manifest.mjs'

describe('planVariants', () => {
  it('returns all widths at or below the intrinsic width', () => {
    expect(planVariants(2048)).toEqual([320, 640, 960, 1440, 2048])
  })
  it('never upscales beyond the source, but does emit the native width', () => {
    expect(planVariants(800)).toEqual([320, 640, 800])
  })
  it('always emits at least one width for tiny sources', () => {
    expect(planVariants(100)).toEqual([100])
  })
  it('includes the intrinsic width when it falls between steps', () => {
    expect(planVariants(1000)).toEqual([320, 640, 960, 1000])
  })
})

describe('contentHash', () => {
  it('is stable for identical input', () => {
    expect(contentHash(Buffer.from('a'))).toBe(contentHash(Buffer.from('a')))
  })
  it('differs for different input', () => {
    expect(contentHash(Buffer.from('a'))).not.toBe(contentHash(Buffer.from('b')))
  })
  it('is 8 hex characters', () => {
    expect(contentHash(Buffer.from('a'))).toMatch(/^[0-9a-f]{8}$/)
  })
})

describe('variantPath', () => {
  it('builds a hashed, width-suffixed path', () => {
    expect(variantPath('Malaiyo', 'deadbeef', 640, 'avif'))
      .toBe('_img/deadbeef/Malaiyo-640.avif')
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement**

`scripts/lib/image-manifest.mjs`:
```js
import { createHash } from 'node:crypto'

export const WIDTHS = [320, 640, 960, 1440, 2048]

export const FORMATS = [
  { ext: 'avif', mime: 'image/avif', options: { quality: 50 } },
  { ext: 'webp', mime: 'image/webp', options: { quality: 72 } },
  { ext: 'jpg',  mime: 'image/jpeg', options: { quality: 78, mozjpeg: true } },
]

/** Widths to emit for a source, never upscaling past its intrinsic width. */
export function planVariants(intrinsicWidth) {
  const below = WIDTHS.filter((w) => w < intrinsicWidth)
  if (WIDTHS.includes(intrinsicWidth)) return [...below, intrinsicWidth]
  return below.length ? [...below, intrinsicWidth] : [intrinsicWidth]
}

export function contentHash(buffer) {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 8)
}

export function variantPath(name, hash, width, ext) {
  return `_img/${hash}/${name}-${width}.${ext}`
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test` → Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: image manifest planning logic with tests"
```

---

### Task 3: Image build script

**Files:** Create `scripts/build-images.mjs`; Modify `package.json`, `.gitignore`

**Interfaces:**
- Consumes: `planVariants`, `contentHash`, `variantPath`, `FORMATS` from Task 2.
- Produces: `generated/images.json` — `Record<string, ImageRecord>` keyed by public source path (e.g. `/photos/Malaiyo.jpg`), where
  ```ts
  ImageRecord = {
    src: string            // original public path
    width: number          // intrinsic
    height: number         // intrinsic
    lqip: string           // data: URI, base64 webp
    sources: { mime: string; srcset: string }[]   // ordered avif, webp, jpeg
    fallback: string       // largest jpeg path, for <img src>
  }
  ```

- [ ] **Step 1: Install sharp**

```bash
npm install -D sharp@0.35.3 gray-matter
```

- [ ] **Step 2: Gitignore generated artifacts**

Append to `.gitignore`:
```
# generated image pipeline output
/public/_img/
/generated/
/public/sw.js
.image-cache.json
```

- [ ] **Step 3: Implement the build script**

`scripts/build-images.mjs` — resolves sources from `_photos/*.md` (`image` field) and `_blogs/*.md` (`photo` field), plus `_content/about.md` (`avatar`). For each source: read, hash, check `.image-cache.json` for an unchanged mtime+size entry and skip if hit; otherwise emit every `planVariants(width) × FORMATS` combination into `public/<variantPath(...)>`, generate a 16px blurred WebP LQIP as a data URI, and record intrinsic dimensions. Writes `generated/images.json` and updates `.image-cache.json`.

Key requirements, all load-bearing:
- `sharp(src).rotate()` before resize — respects EXIF orientation, otherwise portrait phone photos come out sideways
- `withoutEnlargement: true` on resize as a second guard
- srcset entries are `` `/${path} ${width}w` `` — leading slash, `w` descriptor
- LQIP: `.resize(16).blur(1).webp({ quality: 40 }).toBuffer()` → `data:image/webp;base64,${b64}`
- Sources ordered AVIF → WebP → JPEG so `<picture>` picks the best supported
- Log per-file byte savings and a total at the end — this is the evidence for the verification step

- [ ] **Step 4: Wire into the build**

`package.json`: `"prebuild": "node scripts/build-images.mjs"`, and add `"images": "node scripts/build-images.mjs"` for manual runs.

- [ ] **Step 5: Run it**

Run: `npm run images`
Expected: `generated/images.json` exists with 10 entries (9 photos + avatar); `public/_img/` populated; console reports total bytes before/after.

- [ ] **Step 6: Verify correctness of output**

```bash
node -e "const m=require('./generated/images.json'); const r=m['/photos/Malaiyo.jpg']; console.log(r.width, r.height, r.sources.length, r.lqip.slice(0,30), r.sources[0].srcset)"
```
Expected: three source entries, an `lqip` beginning `data:image/webp;base64,`, and a srcset of the form `/_img/<hash>/Malaiyo-320.avif 320w, ...`.

For dimensions, assert the *post-rotation* values rather than a number guessed in advance — `sips` reports stored pixel dimensions, which differ from displayed dimensions when EXIF orientation is set. The check is that `height > width` for `Malaiyo.jpg` (a portrait phone photo) and that the recorded ratio matches how the browser renders it in Step 6 of Task 4. A landscape result here means `.rotate()` was omitted.

- [ ] **Step 7: Verify idempotence**

Run `npm run images` again. Expected: reports all files cached, completes in under a second.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: build-time responsive image pipeline"
```

---

### Task 4: Image consumption — `utils/images.ts` and `Img`

**Files:** Create `utils/images.ts`, `components/Img.tsx`; Modify `utils/content.ts`, `pages/index.tsx`, `components/{GridItem,PhotoModal,BlogCard,Sidebar}.tsx`, `layouts/{PhotoLayout,BlogPost,MainLayout}.tsx`

**Interfaces:**
- Consumes: `generated/images.json` from Task 3.
- Produces:
  - `utils/images.ts`: `export type ImageRecord = {...}` (as Task 3); `getImage(src: string): ImageRecord | null`
  - `components/Img.tsx`: `<Img record={ImageRecord} alt={string} sizes={string} priority?={boolean} className?={string} />`
- `getPhotos()` and `getBlogPosts()` in `utils/content.ts` gain `meta.imageRecord: ImageRecord | null` on each item.

- [ ] **Step 1: Implement `utils/images.ts`**

Reads the manifest once at module load (build-time only — this module must never be imported into client code paths other than through `getStaticProps` results). Returns `null` for unknown sources so `Img` can fall back.

- [ ] **Step 2: Implement `Img`**

Renders:
```tsx
<picture>
  {record.sources.map(s => <source key={s.mime} type={s.mime} srcSet={s.srcset} sizes={sizes} />)}
  <img
    src={record.fallback}
    width={record.width}
    height={record.height}
    alt={alt}
    loading={priority ? 'eager' : 'lazy'}
    decoding="async"
    fetchPriority={priority ? 'high' : 'auto'}
    onLoad={handleLoaded}
    style={{ backgroundImage: loaded ? undefined : `url(${record.lqip})`, backgroundSize: 'cover' }}
    className={...}
  />
</picture>
```
`handleLoaded` sets state that fades opacity from the LQIP background to the decoded image over `--motion-slow`. On mount, if `imgRef.current?.complete` is already true (cache hit), set loaded immediately — otherwise cached images stay stuck behind the placeholder.

`width`/`height` are always emitted, giving zero CLS.

- [ ] **Step 3: Thread records through `getStaticProps`**

In `utils/content.ts`, enrich each photo and blog post meta with `imageRecord: getImage(meta.image)`. This keeps the manifest out of the client bundle.

- [ ] **Step 4: Replace every `next/image` call site**

`GridItem`, `PhotoModal`, `BlogCard`, `Sidebar`, `PhotoLayout`, `BlogPost`, `MainLayout`. Delete the `next/image` imports.

- [ ] **Step 5: Verify build and measure**

```bash
npm run build
du -sh out/_img
node -e "/* sum bytes of images referenced by out/index.html */"
```
Expected: homepage image bytes at largest breakpoint well under 1 MB; under 500 KB at mobile sizes.

- [ ] **Step 6: Verify visually**

`npx serve out -l 3000`, open `/`, confirm: no layout shift on load, placeholders visible then cross-fading, portrait photos not sideways.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: Img component replacing next/image, manifest threaded via getStaticProps"
```

---

### Task 5: Design system — tokens, fonts, dark mode

**Files:** Create `styles/tokens.css`, `lib/theme.ts`, `components/ThemeToggle.tsx`, `tests/theme.test.ts`; Modify `styles/globals.css`, `tailwind.config.js`, `pages/_app.tsx`, `pages/_document.tsx`

**Interfaces:**
- Produces:
  - `lib/theme.ts`: `type Theme = 'light' | 'dark'`; `resolveTheme(stored: string | null, prefersDark: boolean): Theme`; `THEME_KEY = 'theme'`
  - CSS vars: `--bg --surface --ink --muted --accent --line`, `--motion-fast --motion-base --motion-slow`, `--ease-out --ease-spring`
  - Tailwind colors `bg/surface/ink/muted/accent/line` mapped to those vars

- [ ] **Step 1: Write the failing theme tests**

`tests/theme.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { resolveTheme } from '../lib/theme'

describe('resolveTheme', () => {
  it('honours an explicit stored light preference over system dark', () => {
    expect(resolveTheme('light', true)).toBe('light')
  })
  it('honours an explicit stored dark preference over system light', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
  })
  it('falls back to system dark when nothing is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark')
  })
  it('falls back to system light when nothing is stored', () => {
    expect(resolveTheme(null, false)).toBe('light')
  })
  it('ignores a corrupt stored value and uses the system preference', () => {
    expect(resolveTheme('banana', true)).toBe('dark')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test` → FAIL, module not found.

- [ ] **Step 3: Implement `lib/theme.ts`**

```ts
export type Theme = 'light' | 'dark'
export const THEME_KEY = 'theme'

export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') return stored
  return prefersDark ? 'dark' : 'light'
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test` → PASS, 5 tests.

- [ ] **Step 5: Write `styles/tokens.css`**

`:root` holds the light palette and motion tokens; `:root[data-theme='dark']` overrides the colour tokens with the dark values from Global Constraints. Motion tokens: `--motion-fast: 140ms`, `--motion-base: 260ms`, `--motion-slow: 480ms`, `--ease-out: cubic-bezier(.22,1,.36,1)`.

- [ ] **Step 6: Wire Tailwind to the tokens**

`tailwind.config.js`: `theme.extend.colors = { bg: 'var(--bg)', surface: 'var(--surface)', ink: 'var(--ink)', muted: 'var(--muted)', accent: 'var(--accent)', line: 'var(--line)' }`. Update the `typography` block to use `var(--ink)` / `var(--muted)` instead of hardcoded grays, so prose follows the theme.

- [ ] **Step 7: Load fonts**

`pages/_app.tsx`: `next/font/google` for `Instrument_Serif` (weight 400), `Inter`, `JetBrains_Mono`, each with a CSS variable (`--font-serif`, `--font-sans`, `--font-mono`), applied to a wrapper element.

- [ ] **Step 8: No-flash theme script**

`pages/_document.tsx`, in `<Head>`, a blocking inline script that reads `localStorage.theme`, falls back to `matchMedia('(prefers-color-scheme: dark)')`, and sets `document.documentElement.dataset.theme` before first paint. Must be inline and synchronous — a deferred script produces a visible flash.

- [ ] **Step 9: Theme toggle**

`components/ThemeToggle.tsx` — reads current theme from the DOM attribute on mount (never from state initialised during SSR, which would hydrate wrong), writes both `document.documentElement.dataset.theme` and `localStorage`.

- [ ] **Step 10: Verify**

Build and serve. Confirm: no flash on hard reload in either theme; toggling persists across reload; system preference respected when storage is empty; contrast checked against WCAG AA with browser devtools.

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "feat: design tokens, self-hosted fonts, dark mode with no-flash init"
```

---

### Task 6: Masonry math

**Files:** Create `lib/masonry.ts`, `tests/masonry.test.ts`

**Interfaces:**
- Produces: `rowSpan(width: number, height: number, columnWidth: number, rowHeight: number, gap: number): number`

- [ ] **Step 1: Write the failing tests**

`tests/masonry.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { rowSpan } from '../lib/masonry'

// 8px rows, 16px gap, 300px columns
describe('rowSpan', () => {
  it('spans proportionally for a square image', () => {
    // 300x300 rendered => 300px tall => ceil((300+16)/(8+16)) = 14
    expect(rowSpan(1000, 1000, 300, 8, 16)).toBe(14)
  })
  it('spans more rows for a portrait image than a landscape one', () => {
    const portrait = rowSpan(2268, 4032, 300, 8, 16)
    const landscape = rowSpan(4032, 2268, 300, 8, 16)
    expect(portrait).toBeGreaterThan(landscape)
  })
  it('never returns less than one row', () => {
    expect(rowSpan(4000, 1, 300, 8, 16)).toBeGreaterThanOrEqual(1)
  })
  it('is independent of absolute pixel size for a fixed aspect ratio', () => {
    expect(rowSpan(1000, 2000, 300, 8, 16)).toBe(rowSpan(2000, 4000, 300, 8, 16))
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test` → FAIL.

- [ ] **Step 3: Implement**

```ts
/**
 * Rows a tile must span in a grid whose rows are `rowHeight` tall separated by `gap`,
 * so the tile renders at its true aspect ratio in a `columnWidth`-wide column.
 */
export function rowSpan(
  width: number, height: number,
  columnWidth: number, rowHeight: number, gap: number,
): number {
  const renderedHeight = (height / width) * columnWidth
  return Math.max(1, Math.ceil((renderedHeight + gap) / (rowHeight + gap)))
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test` → PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: aspect-ratio-preserving masonry row span calculation"
```

---

### Task 7: Layout A — sidebar, shared nav, masonry grid

**Files:** Create `components/Nav.tsx`; Modify `components/{Sidebar,GridItem}.tsx`, `layouts/MainLayout.tsx`, `pages/index.tsx`; Delete `layouts/Grid.tsx`

**Interfaces:**
- Consumes: `rowSpan` (Task 6), `Img` (Task 4), tokens (Task 5).
- Produces: `<Nav items={NavigationItem[]} onNavigate?={() => void} variant={'sidebar' | 'mobile'} />`

- [ ] **Step 1: Extract `Nav`**

One component rendering the nav list with active-state detection (including the existing `/blog` prefix rule), consumed by both `Sidebar` and the mobile menu in `MainLayout`. Removes the current duplication.

- [ ] **Step 2: Restyle the sidebar**

Serif name at 21px, title and location beneath in sans/mono, accent dot marking the active item, mono contact links, `ThemeToggle` at the bottom. Tokens only — no hardcoded grays.

- [ ] **Step 3: Rebuild the grid as aspect-aware masonry**

`pages/index.tsx`: CSS grid with `grid-auto-rows: 8px` and `gap: 16px`; each photo tile gets `gridRowEnd: span ${rowSpan(...)}`. Column width is measured with a `ResizeObserver` on the grid container so spans stay correct across breakpoints. Article tiles get a fixed span.

- [ ] **Step 4: Restyle `GridItem`**

Photo tiles: overflow-hidden frame, caption over a gradient, image scales on hover (`transform`, not `opacity` — the current `hover:opacity-75` ghosts the caption text too). Article tiles: surface background, `line` border, serif title, mono date.

- [ ] **Step 5: Delete dead code**

```bash
git rm layouts/Grid.tsx
```

- [ ] **Step 6: Verify**

Build, serve, inspect at 375px / 768px / 1440px: portrait photos render tall and uncropped, no overlap, no gaps at the bottom of columns, captions legible in both themes.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: layout A — shared nav, restyled sidebar, aspect-aware masonry"
```

---

### Task 8: Restyle remaining pages

**Files:** Modify `layouts/{PageLayout,PhotoLayout,BlogPost}.tsx`, `components/{BlogCard,WorkoutHeatmap,WorkoutModal}.tsx`, `pages/blog/index.tsx`, `pages/workout/index.tsx`

- [ ] **Step 1: Prose pages** — `PageLayout` (about, now, bookshelf, contact): serif h1, token-driven prose, mono "last updated".
- [ ] **Step 2: Blog index and `BlogCard`** — serif titles, mono dates, `Img` for cover images.
- [ ] **Step 3: `BlogPost`** — serif h1, mono date line, `Img` hero, token prose.
- [ ] **Step 4: `PhotoLayout`** — serif title, mono EXIF strip, `Img` at full width.
- [ ] **Step 5: Workout page** — heatmap cell colours re-derived from tokens so they work in dark mode; the current `bg-sky-300` / `bg-emerald-300` / `bg-amber-300` are light-theme-only.
- [ ] **Step 6: Verify** — visit every route in both themes; no hardcoded gray survives (`grep -rn "text-gray-\|bg-gray-" components layouts pages` returns nothing).
- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: apply design system across all pages"
```

---

### Task 9: Motion system

**Files:** Create `lib/motion.ts`; Modify `pages/_app.tsx`, `pages/index.tsx`, `components/{GridItem,PhotoModal,WorkoutModal}.tsx`

**Interfaces:**
- Produces: `DURATION = { fast, base, slow }`, `EASE_OUT`, `fadeRise`, `staggerParent`, `modalBackdrop`, `modalCard`, `pageTransition`

- [ ] **Step 1: Install motion**

```bash
npm install motion@12.42.2
```

- [ ] **Step 2: Define the motion module**

`lib/motion.ts` holds every duration, easing, and variant. No component defines its own timings — that is how animation systems drift.

- [ ] **Step 3: Root config and page transitions**

`pages/_app.tsx`: wrap in `<MotionConfig reducedMotion="user">`, and `<AnimatePresence mode="wait">` keyed on `router.asPath` for route fades.

- [ ] **Step 4: Grid stagger and reflow**

`pages/index.tsx`: `staggerParent` on the grid, `fadeRise` on tiles, `layout` on each tile so filter changes glide. Tiles need stable `key`s (`item.id` already exists) or `layout` cannot track them.

- [ ] **Step 5: Filter tab underline**

Replace the static border with a shared `layoutId` element that slides between tabs.

- [ ] **Step 6: Modal enter/exit**

`AnimatePresence` around `PhotoModal` and `WorkoutModal`; backdrop opacity plus `backdrop-blur` ramp, card scale-and-fade.

- [ ] **Step 7: Verify**

Filter switching glides rather than teleports; modals animate both directions; route changes fade. Then enable `prefers-reduced-motion: reduce` in devtools and confirm all of it becomes instant.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: unified motion system with reduced-motion support"
```

---

### Task 10: Modal accessibility and gestures

**Files:** Modify `components/{PhotoModal,WorkoutModal}.tsx`

- [ ] **Step 1: Focus trap** — on open, store `document.activeElement`, move focus into the dialog, cycle Tab within it; on close, restore focus to the stored element.
- [ ] **Step 2: Dialog semantics** — `role="dialog"`, `aria-modal="true"`, `aria-label` from the photo title.
- [ ] **Step 3: Swipe** — pointer events on the image area; horizontal drag past 60px navigates. Must not hijack vertical scroll.
- [ ] **Step 4: Neighbour preload** — on open or navigate, construct `new Image()` for the previous and next photos' fallback sources so navigation is instant.
- [ ] **Step 5: Verify** — keyboard-only: open, Tab cycles inside, Escape closes, focus returns to the originating tile. Touch: swipe both directions.
- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: modal focus trap, swipe navigation, neighbour preloading"
```

---

### Task 11: Service worker and offline

**Files:** Create `scripts/lib/precache.mjs`, `scripts/build-sw.mjs`, `tests/precache.test.ts`, `pages/offline.tsx`, `public/manifest.webmanifest`, `components/UpdateToast.tsx`; Modify `package.json`, `pages/_app.tsx`, `pages/_document.tsx`

**Interfaces:**
- Produces:
  - `classify(path: string): 'immutable' | 'document' | 'data' | 'other'`
  - `normalizeRoute(url: string): string` — trailing-slash-tolerant route key
  - `buildPrecacheList(files: string[]): string[]`

- [ ] **Step 1: Write the failing precache tests**

`tests/precache.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { classify, normalizeRoute, buildPrecacheList } from '../scripts/lib/precache.mjs'

describe('classify', () => {
  it('treats hashed next static assets as immutable', () => {
    expect(classify('/_next/static/chunks/main-abc123.js')).toBe('immutable')
  })
  it('treats generated image variants as immutable', () => {
    expect(classify('/_img/deadbeef/Malaiyo-640.avif')).toBe('immutable')
  })
  it('treats html as a document', () => {
    expect(classify('/about/index.html')).toBe('document')
  })
  it('treats json as data', () => {
    expect(classify('/data/workouts.json')).toBe('data')
  })
})

describe('normalizeRoute', () => {
  it('adds the trailing slash the export uses', () => {
    expect(normalizeRoute('https://x.dev/about')).toBe('/about/')
  })
  it('leaves an already-trailing-slashed route alone', () => {
    expect(normalizeRoute('https://x.dev/about/')).toBe('/about/')
  })
  it('maps the root to a single slash', () => {
    expect(normalizeRoute('https://x.dev/')).toBe('/')
  })
  it('strips query and hash', () => {
    expect(normalizeRoute('https://x.dev/about/?x=1#y')).toBe('/about/')
  })
})

describe('buildPrecacheList', () => {
  it('includes the offline page and the root document', () => {
    const list = buildPrecacheList(['/index.html', '/offline/index.html', '/_next/static/a.js'])
    expect(list).toContain('/')
    expect(list).toContain('/offline/')
  })
  it('excludes source maps', () => {
    expect(buildPrecacheList(['/_next/static/a.js.map'])).not.toContain('/_next/static/a.js.map')
  })
})
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement `scripts/lib/precache.mjs`** to satisfy exactly those cases.

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS, 10 tests.

- [ ] **Step 5: Implement `scripts/build-sw.mjs`**

Runs post-build, walks `out/`, calls `buildPrecacheList`, derives a version from a hash of the list, and writes `public/sw.js` **and** `out/sw.js` (the export has already happened, so writing only to `public/` would miss this build). Strategies per Global Constraints: documents network-first → cache → `/offline/`; `immutable` cache-first; `data` stale-while-revalidate. `activate` deletes caches whose name does not match the current version.

- [ ] **Step 6: Offline page and manifest**

`pages/offline.tsx` — a themed, self-contained page. `public/manifest.webmanifest` with name, theme colours matching the tokens, and icons.

- [ ] **Step 7: Register with an update path**

`pages/_app.tsx` registers `/sw.js` on `load`. On `updatefound` → new worker `installed` with an existing controller, render `UpdateToast`. The toast's action posts `SKIP_WAITING` and reloads on `controllerchange`.

- [ ] **Step 8: Wire the build**

`package.json`: `"postbuild": "node scripts/build-sw.mjs"`. Check whether `next-sitemap` already occupies `postbuild` and chain both if so.

- [ ] **Step 9: Verify offline — the real test**

```bash
npm run build && npx serve out -l 3000
```
Load `http://localhost:3000`, browse to two other routes, then **stop the server** and reload. Expected: the visited pages and their images still render; an unvisited route shows the offline page. This is the acceptance criterion for the whole task.

- [ ] **Step 10: Verify the update flow**

Rebuild with a visible copy change, reload, confirm the toast appears and reloading picks up the new content rather than serving stale HTML.

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "feat: offline-capable service worker with precache and update flow"
```

---

### Task 12: Cleanup and final verification

- [ ] **Step 1: Confirm deletions landed** — `pages/api/hello.ts` and `layouts/Grid.tsx` gone; `grep -rn "next/image" components layouts pages` returns nothing.
- [ ] **Step 2: Lint and typecheck** — `npm run lint` and `npx tsc --noEmit` both clean.
- [ ] **Step 3: Full test suite** — `npm test`, all suites pass.
- [ ] **Step 4: Measure the payload** — record homepage transfer bytes before (16.2 MB baseline) and after; report actual numbers.
- [ ] **Step 5: Lighthouse** — run against the built output; record performance and accessibility scores.
- [ ] **Step 6: Cross-page visual pass** — every route, both themes, three viewport widths.
- [ ] **Step 7: Update the spec** with measured results.
- [ ] **Step 8: Final commit**

```bash
git add -A && git commit -m "chore: final cleanup and verification results"
```

---

## Verification Summary

The plan is complete when every item holds, with evidence:

| Claim | Evidence required |
|---|---|
| Payload reduced | Measured before/after byte counts |
| No layout shift | CLS 0 in Lighthouse |
| Offline works | Server stopped, page still renders |
| Reduced motion honoured | Devtools emulation, animation instant |
| Modals accessible | Keyboard-only walkthrough completes |
| Themes correct | Every route screenshotted in both |
| Nothing regressed | Build, lint, typecheck, tests all clean |
