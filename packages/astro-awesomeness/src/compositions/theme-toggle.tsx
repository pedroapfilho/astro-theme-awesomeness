import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "../components/button";

type Theme = "light" | "dark";

const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return null;
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

const setStoredTheme = (next: Theme) => {
  window.localStorage.setItem("theme", next);
  for (const listener of storedThemeListeners) {
    listener();
  }
};

const getPrefersDark = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const subscribePrefersDark = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }
  const media = window.matchMedia("(prefers-color-scheme: dark)");
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
  const theme: Theme = override ?? (prefersDark ? "dark" : "light");

  const handleToggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    setStoredTheme(next);
  };

  return (
    <Button
      aria-label={ariaLabel}
      className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0"
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
