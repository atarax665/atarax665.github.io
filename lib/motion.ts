import type { Variants, Transition } from "motion/react";

/**
 * The single source of truth for motion.
 *
 * Every animated surface imports from here. Components defining their own
 * durations is how animation systems drift into feeling inconsistent, so they
 * do not.
 *
 * Reduced motion is handled globally by <MotionConfig reducedMotion="user">
 * in _app.tsx plus the media query in tokens.css — not by per-call-site checks.
 */

/** Seconds, matching the CSS custom properties in styles/tokens.css. */
export const DURATION = {
  fast: 0.14,
  base: 0.26,
  slow: 0.48,
} as const;

/** Matches --ease-out. Decelerating, so motion settles rather than stopping. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const easeOut = (duration: number = DURATION.base): Transition => ({
  duration,
  ease: EASE_OUT,
});

/**
 * Layout reflow, used when the grid refilters. Spring rather than duration so
 * tiles travelling different distances all feel like the same physical system.
 */
export const LAYOUT_SPRING: Transition = {
  type: "spring",
  stiffness: 340,
  damping: 34,
  mass: 0.9,
};

/** Content entering: rise slightly while fading in. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: easeOut(DURATION.slow) },
  exit: { opacity: 0, y: -8, transition: easeOut(DURATION.fast) },
};

/** Parent that staggers its children's entrance. */
export const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0.04 },
  },
};

/** Whole-page crossfade between routes. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: easeOut(DURATION.base) },
  exit: { opacity: 0, y: -6, transition: easeOut(DURATION.fast) },
};

/** Lightbox backdrop: opacity and blur ramp together. */
export const modalBackdrop: Variants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: {
    opacity: 1,
    backdropFilter: "blur(24px)",
    transition: easeOut(DURATION.base),
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: easeOut(DURATION.fast),
  },
};

/** Lightbox card: scales up slightly as it fades in. */
export const modalCard: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...easeOut(DURATION.base), delay: 0.02 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: easeOut(DURATION.fast),
  },
};
