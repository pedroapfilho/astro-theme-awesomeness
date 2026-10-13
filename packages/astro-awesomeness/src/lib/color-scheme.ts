type ResolvedColorScheme = "light" | "dark";
type ColorScheme = "auto" | ResolvedColorScheme;

const colorSchemeStorageKey = "theme";
const colorSchemeMediaQuery = "(prefers-color-scheme: dark)";

const resolveColorScheme = (stored: string | null, prefersDark: boolean): ResolvedColorScheme => {
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return prefersDark ? "dark" : "light";
};

const getColorSchemeScript = () => `(() => {
  const resolve = ${resolveColorScheme.toString()};
  const stored = localStorage.getItem(${JSON.stringify(colorSchemeStorageKey)});
  const prefersDark = window.matchMedia(${JSON.stringify(colorSchemeMediaQuery)}).matches;
  document.documentElement.classList.toggle("dark", resolve(stored, prefersDark) === "dark");
})();`;

const themeColorScript = `(() => {
  const meta = document.querySelector('meta[name="theme-color"]');
  const sync = () => meta.setAttribute("content", getComputedStyle(document.body).backgroundColor);
  addEventListener("load", sync);
  new MutationObserver(sync).observe(document.documentElement, { attributeFilter: ["class"] });
})();`;

export {
  colorSchemeMediaQuery,
  colorSchemeStorageKey,
  getColorSchemeScript,
  resolveColorScheme,
  themeColorScript,
};
export type { ColorScheme, ResolvedColorScheme };
