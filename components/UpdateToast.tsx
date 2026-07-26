import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { easeOut } from "../lib/motion";

/**
 * Registers the service worker and surfaces updates.
 *
 * A silent swap would leave a visitor on stale HTML until they happened to
 * reload, so a new version is announced and applied on their say-so instead.
 */
export default function UpdateToast() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    let registration: ServiceWorkerRegistration | undefined;

    const onLoad = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js");

        // An update found after an existing worker is already controlling the
        // page means the content changed underneath the visitor.
        registration.addEventListener("updatefound", () => {
          const installing = registration!.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaiting(installing);
            }
          });
        });
      } catch {
        // Registration failing is not fatal — the site works without it.
      }
    };

    // React effects usually run after `load` has already fired, so waiting on
    // the event alone means registration silently never happens.
    if (document.readyState === "complete") {
      onLoad();
      return;
    }
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    return () =>
      navigator.serviceWorker.removeEventListener("controllerchange", onChange);
  }, []);

  return (
    <AnimatePresence>
      {waiting && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={easeOut()}
          role="status"
          className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 shadow-lg"
        >
          <span className="text-sm text-ink">A new version is available.</span>
          <button
            onClick={() => waiting.postMessage("SKIP_WAITING")}
            className="meta text-accent transition-opacity duration-fast ease-out hover:opacity-70"
          >
            Reload
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
