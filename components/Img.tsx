import React, { useEffect, useRef, useState } from "react";
import type { ImageRecord } from "../utils/images";

type Props = {
  record: ImageRecord | null;
  alt: string;
  /** Required: tells the browser which srcset width to pick before layout. */
  sizes: string;
  /** Eager-load and raise fetch priority. Use only for above-the-fold images. */
  priority?: boolean;
  /** Classes for the outer frame. */
  className?: string;
  /** Classes for the <img> itself. */
  imgClassName?: string;
  fit?: "cover" | "contain";
  /**
   * Reserve space using the image's intrinsic aspect ratio. Turn off when the
   * parent already constrains height (e.g. a fixed-height tile).
   */
  ratio?: boolean;
  style?: React.CSSProperties;
};

/**
 * Renders a build-time-encoded image as a <picture> with AVIF/WebP/JPEG
 * sources, a blurred placeholder that cross-fades to the decoded image, and
 * explicit dimensions so nothing shifts during load.
 *
 * Replaces next/image, which cannot optimize anything in a static export.
 */
export default function Img({
  record,
  alt,
  sizes,
  priority = false,
  className = "",
  imgClassName = "",
  fit = "cover",
  ratio = true,
  style,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // A cached image can finish decoding before React attaches onLoad, which
  // would strand it behind the placeholder forever.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  if (!record) return null;

  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={{
        ...(ratio ? { aspectRatio: `${record.width} / ${record.height}` } : null),
        backgroundImage: loaded ? undefined : `url("${record.lqip}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }}
    >
      <picture>
        {record.sources.map((source) => (
          <source
            key={source.mime}
            type={source.mime}
            srcSet={source.srcset}
            sizes={sizes}
          />
        ))}
        <img
          ref={imgRef}
          src={record.fallback}
          width={record.width}
          height={record.height}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          // `img-fade` exists so a <noscript> rule in _document can force
          // opacity back to 1: without JS, onLoad never fires and every image
          // would stay permanently invisible.
          className={`img-fade block h-full w-full ${
            fit === "cover" ? "object-cover" : "object-contain"
          } ${imgClassName}`}
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity var(--motion-slow, 480ms) var(--ease-out, ease)",
          }}
        />
      </picture>
    </span>
  );
}
