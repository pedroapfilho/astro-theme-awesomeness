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

export { colorSchemeMediaQuery, colorSchemeStorageKey, getColorSchemeScript, resolveColorScheme };
export type { ColorScheme, ResolvedColorScheme };
