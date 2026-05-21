import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

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
  // useSyncExternalStore avoids hydration mismatch warnings while still letting
  // us read the actual system preference on the client.
  const prefersDark = useSyncExternalStore(subscribePrefersDark, getPrefersDark, () => false);
  const [override, setOverride] = useState<Theme | null>(() => getStoredTheme());
  const theme: Theme = override ?? (prefersDark ? "dark" : "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleClick = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem("theme", next);
    setOverride(next);
  };

  return (
    <Button aria-label={ariaLabel} onClick={handleClick} size="icon" variant="ghost">
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
};

export { ThemeToggle };
