import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { pageTransition } from "../lib/motion";
import UpdateToast from "../components/UpdateToast";

/**
 * Fonts are self-hosted by next/font at build time: no CDN request, no layout
 * shift from a late swap, and they remain available offline under the service
 * worker.
 */
const serif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <div className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      {/* reducedMotion="user" makes every animation in the app honour
          prefers-reduced-motion without any component checking for it. */}
      <MotionConfig reducedMotion="user">
        {/* mode="wait" so the outgoing page finishes before the next enters,
            which avoids the two overlapping mid-crossfade. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={router.asPath}
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
        {/* Registers the service worker and announces new deploys. */}
        <UpdateToast />
      </MotionConfig>
    </div>
  );
}
