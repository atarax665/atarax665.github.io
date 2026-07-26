export type Theme = "light" | "dark";

export const THEME_KEY = "theme";

/**
 * Decide which theme to apply.
 *
 * An explicit stored choice always wins; otherwise follow the OS. Kept pure so
 * the same rule can be unit-tested and inlined into the no-flash boot script.
 */
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}

/**
 * Runs before first paint, inlined into the document head. Duplicates
 * resolveTheme's rule because it must execute before any bundle loads —
 * keep the two in sync.
 */
export const NO_FLASH_SCRIPT = `
(function(){try{
  var s = localStorage.getItem('${THEME_KEY}');
  var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = (s === 'light' || s === 'dark') ? s : (d ? 'dark' : 'light');
}catch(e){document.documentElement.dataset.theme='light';}})();
`.trim();
