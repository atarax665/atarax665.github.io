/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages. Replaces the `next export` command, which
  // Next 16 removed.
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  // Next's image optimizer needs a server. Our images are pre-encoded at build
  // time by scripts/build-images.mjs and rendered via components/Img.tsx.
  images: { unoptimized: true },
}

module.exports = nextConfig
