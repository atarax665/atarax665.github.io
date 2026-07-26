import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import Img from "./Img";
import { rowSpan } from "../lib/masonry";
import { LAYOUT_SPRING, fadeRise } from "../lib/motion";
import type { ImageRecord } from "../utils/images";

export type GridItemType = "photo" | "blog" | "text" | "link";

export type GridItemData = {
  id: string;
  type: GridItemType;
  title?: string;
  description?: string;
  image?: string;
  imageRecord?: ImageRecord | null;
  href?: string;
  content?: string;
  date?: string;
  onClick?: () => void;
};

/** Rows an article card occupies — fixed, since it has no intrinsic ratio. */
const ARTICLE_SPAN = 13;

const GridItem = ({
  item,
  columnWidth,
  priority = false,
}: {
  item: GridItemData;
  columnWidth: number;
  /** Eager-load this tile. Set on the first row so the LCP image is not lazy. */
  priority?: boolean;
}) => {
  const span =
    item.type === "photo" && item.imageRecord
      ? rowSpan(item.imageRecord.width, item.imageRecord.height, columnWidth)
      : ARTICLE_SPAN;

  const content =
    item.type === "photo" && item.imageRecord ? (
      <figure className="relative m-0 h-full w-full overflow-hidden rounded-lg bg-surface">
        <Img
          record={item.imageRecord}
          alt={item.title || "Photo"}
          ratio={false}
          priority={priority}
          className="h-full w-full"
          imgClassName="transition-transform duration-slow ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        {item.title && (
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-3 pb-2.5 pt-8">
            <span className="font-display text-[15px] leading-snug text-white">
              {item.title}
            </span>
          </figcaption>
        )}
      </figure>
    ) : (
      <article className="flex h-full w-full flex-col justify-between rounded-lg border border-line bg-surface p-4 transition-colors duration-base ease-out group-hover:border-accent/40">
        <div>
          {item.title && (
            <h3 className="font-display mb-1.5 line-clamp-3 text-[17px] leading-snug text-ink">
              {item.title}
            </h3>
          )}
          {item.description && (
            <p className="line-clamp-4 text-[13px] leading-relaxed text-muted">
              {item.description}
            </p>
          )}
          {item.content && (
            <p className="line-clamp-4 text-[13px] leading-relaxed text-muted">
              {item.content}
            </p>
          )}
        </div>
        {item.date && (
          <p className="meta mt-3">
            {new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </article>
    );

  // `group` drives the image zoom on hover. This replaces the old
  // `hover:opacity-75`, which faded the caption along with the photo.
  const className = "group relative block";
  const style = { gridRowEnd: `span ${span}` };

  // `layout` is what makes tiles glide to new positions when the filter
  // changes instead of teleporting. It needs a stable key, which the caller
  // supplies from item.id.
  const motionProps = {
    layout: true as const,
    variants: fadeRise,
    transition: LAYOUT_SPRING,
    className,
    style,
  };

  // href + onClick together: the click opens the lightbox, while the href keeps
  // right-click "Open in new tab" working.
  if (item.href && item.onClick) {
    return (
      <motion.a
        {...motionProps}
        href={item.href}
        onClick={(e) => {
          e.preventDefault();
          item.onClick!();
        }}
      >
        {content}
      </motion.a>
    );
  }

  if (item.href) {
    return (
      <Link href={item.href} legacyBehavior passHref>
        <motion.a {...motionProps}>{content}</motion.a>
      </Link>
    );
  }

  return (
    <motion.div
      {...motionProps}
      className={`${className}${item.onClick ? " cursor-pointer" : ""}`}
      onClick={item.onClick}
    >
      {content}
    </motion.div>
  );
};

export default GridItem;
