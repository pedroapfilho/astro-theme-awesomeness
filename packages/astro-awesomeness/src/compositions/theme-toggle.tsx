import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

import { Button } from "../components/button";
import {
  colorSchemeMediaQuery,
  colorSchemeStorageKey,
  resolveColorScheme,
  type ResolvedColorScheme,
} from "../lib/color-scheme";

const getStoredTheme = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(colorSchemeStorageKey);
};

const storedThemeListeners = new Set<() => void>();

const subscribeStoredTheme = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }
  storedThemeListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    storedThemeListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
};

const setStoredTheme = (next: ResolvedColorScheme) => {
  window.localStorage.setItem(colorSchemeStorageKey, next);
  for (const listener of storedThemeListeners) {
    listener();
  }
};

const getPrefersDark = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(colorSchemeMediaQuery).matches;
};

const subscribePrefersDark = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }
  const media = window.matchMedia(colorSchemeMediaQuery);
  media.addEventListener("change", callback);
  return () => {
    media.removeEventListener("change", callback);
  };
};

type Props = {
  ariaLabel?: string;
};

const subscribeHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

const ThemeToggle = ({ ariaLabel = "Toggle theme" }: Props) => {
  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const prefersDark = useSyncExternalStore(subscribePrefersDark, getPrefersDark, () => false);
  const override = useSyncExternalStore(subscribeStoredTheme, getStoredTheme, () => null);
  const theme = resolveColorScheme(override, prefersDark);

  useEffect(() => {
    if (isHydrated) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [isHydrated, theme]);

  const handleToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setStoredTheme(next);
  };

  return (
    <Button
      aria-label={ariaLabel}
      disabled={!isHydrated}
      onClick={handleToggleTheme}
      size="icon"
      variant="ghost"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
};

export { ThemeToggle };
