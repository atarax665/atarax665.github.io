import React, { useEffect, useState } from "react";
import Image from "next/image";
import { PhotoMeta } from "../layouts/PhotoLayout";

type Props = {
  photo: PhotoMeta | null;
  photos: PhotoMeta[];
  onClose: () => void;
};

export default function PhotoModal({ photo, photos, onClose }: Props) {
  const [current, setCurrent] = useState<PhotoMeta | null>(photo);

  useEffect(() => { setCurrent(photo); }, [photo]);

  useEffect(() => {
    if (!photo) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [photo]);

  useEffect(() => {
    if (!current) return;
    const idx = photos.findIndex((p) => p.slug === current.slug);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowLeft"  && idx > 0)                  setCurrent(photos[idx - 1]);
      if (e.key === "ArrowRight" && idx < photos.length - 1)  setCurrent(photos[idx + 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, photos, onClose]);

  if (!current) return null;

  const idx     = photos.findIndex((p) => p.slug === current.slug);
  const hasPrev = idx > 0;
  const hasNext = idx < photos.length - 1;

  const dateFmt = new Date(current.date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const tags: string[] = [
    dateFmt,
    current.location,
    current.camera,
    ...(current.tags ?? []),
  ].filter(Boolean) as string[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      {/* Heavy frosted-glass backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl" />

      {/* Card — shrinks to image width */}
      <div
        className="relative z-10 rounded-2xl overflow-hidden"
        style={{
          width: "fit-content",
          maxWidth: "min(92vw, 1080px)",
          boxShadow: "0 32px 80px -8px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Image area ── */}
        {/* flex + justify-center so the image is always centred regardless of aspect ratio */}
        <div
          className="relative flex items-center justify-center bg-zinc-950"
          style={{ lineHeight: 0 }}
        >
          <Image
            src={current.image}
            alt={current.title}
            width={1600}
            height={1200}
            priority
            sizes="(max-width: 768px) 88vw, min(92vw, 1080px)"
            className="block w-auto h-auto"
            style={{ maxWidth: "min(88vw, 1080px)", maxHeight: "70vh" }}
          />

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 bg-black/40 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M11 2L2 11M2 2l9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Counter */}
          {photos.length > 1 && (
            <span className="absolute top-3 left-3 text-white/75 text-xs bg-black/35 px-2 py-0.5 rounded-full tabular-nums select-none">
              {idx + 1} / {photos.length}
            </span>
          )}

          {/* Prev */}
          {hasPrev && (
            <button
              aria-label="Previous"
              onClick={(e) => { e.stopPropagation(); setCurrent(photos[idx - 1]); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/65 text-white rounded-full p-2 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 12L4 7l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Next */}
          {hasNext && (
            <button
              aria-label="Next"
              onClick={(e) => { e.stopPropagation(); setCurrent(photos[idx + 1]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/65 text-white rounded-full p-2 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 12l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Meta strip ── */}
        <div className="bg-white px-5 py-3.5">
          <div className="flex items-baseline justify-between gap-4 mb-2.5">
            <p className="text-sm text-gray-900">{current.title}</p>
            {photos.length > 1 && (
              <span className="text-xs text-gray-400 tabular-nums shrink-0">
                {idx + 1} / {photos.length}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
