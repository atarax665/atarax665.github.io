import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Img from "./Img";
import { modalBackdrop, modalCard } from "../lib/motion";
import { PhotoMeta } from "../layouts/PhotoLayout";

type Props = {
  photo: PhotoMeta | null;
  photos: PhotoMeta[];
  onClose: () => void;
};

/** Horizontal travel in px before a drag counts as a navigation swipe. */
const SWIPE_THRESHOLD = 60;

export default function PhotoModal({ photo, photos, onClose }: Props) {
  const [current, setCurrent] = useState<PhotoMeta | null>(photo);
  const [lastPhotoProp, setLastPhotoProp] = useState<PhotoMeta | null>(photo);
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  // The parent picks the photo, but arrow keys and swipes move within the set
  // locally. Resetting during render rather than in an effect is React's
  // documented way to adjust state when a prop changes — an effect here would
  // render the previous photo for one frame before correcting itself.
  if (photo !== lastPhotoProp) {
    setLastPhotoProp(photo);
    setCurrent(photo);
  }

  const idx = current ? photos.findIndex((p) => p.slug === current.slug) : -1;
  const hasPrev = idx > 0;
  const hasNext = idx > -1 && idx < photos.length - 1;

  const goPrev = useCallback(() => {
    if (idx > 0) setCurrent(photos[idx - 1]);
  }, [idx, photos]);

  const goNext = useCallback(() => {
    if (idx > -1 && idx < photos.length - 1) setCurrent(photos[idx + 1]);
  }, [idx, photos]);

  // Lock scroll, and remember where focus came from so it can be restored.
  useEffect(() => {
    if (!photo) return;
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      restoreFocusTo.current?.focus?.();
    };
  }, [photo]);

  // Move focus into the dialog on open so the keyboard lands somewhere useful.
  useEffect(() => {
    if (current) cardRef.current?.focus();
  }, [current !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard: navigation, dismiss, and a Tab trap so focus cannot escape to
  // the page behind the dialog.
  useEffect(() => {
    if (!current) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();

      if (e.key === "Tab") {
        const focusables = cardRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables?.length) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goPrev, goNext, onClose]);

  // Warm the neighbours so arrow/swipe navigation paints instantly.
  useEffect(() => {
    if (idx < 0) return;
    [photos[idx - 1], photos[idx + 1]].forEach((neighbour) => {
      const src = neighbour?.imageRecord?.fallback;
      if (src) {
        const img = new window.Image();
        img.src = src;
      }
    });
  }, [idx, photos]);

  const dateFmt = current
    ? new Date(`${current.date}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const tags = current
    ? ([dateFmt, current.location, current.camera, ...(current.tags ?? [])].filter(
        Boolean
      ) as string[])
    : [];

  return (
    <AnimatePresence>
      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={onClose}
        >
          <motion.div
            className="absolute inset-0 bg-black/45"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
            tabIndex={-1}
            className="relative z-10 overflow-hidden rounded-lg outline-none"
            style={{
              width: "fit-content",
              maxWidth: "min(92vw, 1080px)",
              boxShadow:
                "0 32px 80px -8px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)",
            }}
            variants={modalCard}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x > SWIPE_THRESHOLD) goPrev();
              else if (info.offset.x < -SWIPE_THRESHOLD) goNext();
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative flex items-center justify-center bg-zinc-950"
              style={{ lineHeight: 0 }}
            >
              <Img
                key={current.slug}
                record={current.imageRecord}
                alt={current.title}
                priority
                fit="contain"
                sizes="(max-width: 768px) 88vw, min(92vw, 1080px)"
                className="block"
                style={{ maxWidth: "min(88vw, 1080px)", maxHeight: "70vh" }}
              />

              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-white transition-colors duration-fast ease-out hover:bg-black/70"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M11 2L2 11M2 2l9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {hasPrev && (
                <button
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors duration-fast ease-out hover:bg-black/65"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M9 12L4 7l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              {hasNext && (
                <button
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors duration-fast ease-out hover:bg-black/65"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M5 12l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>

            <div className="bg-surface px-5 py-4">
              <div className="mb-2.5 flex items-baseline justify-between gap-4">
                <p className="font-display text-[19px] leading-tight text-ink">
                  {current.title}
                </p>
                {photos.length > 1 && (
                  <span className="meta shrink-0 tabular-nums">
                    {idx + 1} / {photos.length}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded px-2 py-0.5 text-xs text-muted"
                    style={{ backgroundColor: "var(--line)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
