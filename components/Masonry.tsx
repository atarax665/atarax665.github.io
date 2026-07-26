import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { GAP, ROW_HEIGHT } from "../lib/masonry";
import { staggerParent } from "../lib/motion";

/**
 * Aspect-ratio-preserving masonry built on CSS grid.
 *
 * Rows are deliberately tiny (8px) and each tile spans as many as its aspect
 * ratio needs, which lets photos keep their true shape instead of being
 * cropped into fixed-height cells.
 *
 * CSS `columns` would be simpler, but it does not reflow predictably under
 * Framer Motion's `layout` animations, and fluid reflow when filtering is a
 * requirement here.
 *
 * Children are responsible for their own row spans; this component measures
 * the column width and hands it down via render prop.
 */
export default function Masonry({
  children,
  className = "",
}: {
  children: (columnWidth: number) => React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Seeded with the desktop column width so the first server-rendered paint is
  // close to correct; the observer corrects it on mount for other breakpoints.
  const [columnWidth, setColumnWidth] = useState(276);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      // Computed grid tracks are already resolved to pixels, so the first
      // track is the real column width at the current breakpoint.
      const tracks = getComputedStyle(el).gridTemplateColumns.split(" ");
      const first = parseFloat(tracks[0]);
      if (Number.isFinite(first) && first > 0) setColumnWidth(first);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      variants={staggerParent}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 ${className}`}
      style={{
        gridAutoRows: `${ROW_HEIGHT}px`,
        gap: `${GAP}px`,
        // Without `dense`, a tall tile leaves a hole beside it that later
        // shorter tiles refuse to fill, and the grid ends up visibly gappy.
        gridAutoFlow: "row dense",
      }}
    >
      {children(columnWidth)}
    </motion.div>
  );
}
