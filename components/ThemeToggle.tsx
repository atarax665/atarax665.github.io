import React, { useSyncExternalStore } from "react";
import { THEME_KEY, type Theme } from "../lib/theme";

/**
 * Light/dark switch.
 *
 * The source of truth is the `data-theme` attribute the boot script sets on
 * <html> before first paint, which makes it genuinely external state — hence
 * useSyncExternalStore rather than mirroring it into React state via an
 * effect. A MutationObserver keeps the button in sync even if something else
 * changes the theme.
 */

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const getSnapshot = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

// Nothing is known about the visitor's theme when rendering on the server, so
// report null and render a neutral icon until hydration.
const getServerSnapshot = (): Theme | null => null;

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private browsing can reject writes; the theme still applies to this
      // page, it just will not persist.
    }
  };

  const label =
    theme === null
      ? "Toggle theme"
      : theme === "dark"
        ? "Switch to light theme"
        : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors duration-fast ease-out hover:bg-line hover:text-ink ${className}`}
    >
      {theme === "dark" ? (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M7.5 1v1.6M7.5 12.4V14M14 7.5h-1.6M2.6 7.5H1M12.1 2.9l-1.1 1.1M4 11l-1.1 1.1M12.1 12.1L11 11M4 4L2.9 2.9"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <path
            d="M13 9.3A5.8 5.8 0 015.7 2 5.8 5.8 0 1013 9.3z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
