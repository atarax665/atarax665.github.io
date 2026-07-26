import { Html, Head, Main, NextScript } from "next/document";
import { NO_FLASH_SCRIPT } from "../lib/theme";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/avatar.jpeg" type="image/jpeg" />
        <link rel="manifest" href="/manifest.webmanifest" />
        {/* Match each theme's --bg so the browser chrome blends with the page. */}
        <meta
          name="theme-color"
          content="#FAF8F5"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#12110F"
          media="(prefers-color-scheme: dark)"
        />
        {/* Img fades from its placeholder on decode via JS. Without JS, onLoad
            never fires, so force images visible rather than leaving a page of
            invisible photos. */}
        <noscript>
          <style>{`.img-fade { opacity: 1 !important; }`}</style>
        </noscript>
      </Head>
      <body>
        {/* Must be synchronous and before <Main> so the theme attribute is set
            before first paint — a deferred script produces a visible flash of
            the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
