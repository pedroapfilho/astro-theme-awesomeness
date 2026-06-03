import { Moon, Sun } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { Button } from "./ui/button";

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

const ThemeToggle = ({ ariaLabel = "Toggle theme" }: Props) => {
  // useSyncExternalStore avoids hydration mismatch on system preference reads.
  const prefersDark = useSyncExternalStore(subscribePrefersDark, getPrefersDark, () => false);
  const [override, setOverride] = useState<Theme | null>(() => getStoredTheme());
  const theme: Theme = override ?? (prefersDark ? "dark" : "light");

  const handleToggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    setOverride(next);
  };

  return (
    <Button aria-label={ariaLabel} onClick={handleToggleTheme} size="icon" variant="ghost">
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
};

export { ThemeToggle };
