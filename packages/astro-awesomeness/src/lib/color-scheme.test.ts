import { runInNewContext } from "node:vm";

import { describe, expect, it, vi } from "vitest";

import {
  colorSchemeMediaQuery,
  getColorSchemeScript,
  colorSchemeStorageKey,
  resolveColorScheme,
} from "./color-scheme";

describe("color scheme policy", () => {
  it.each([
    { expected: "light", prefersDark: true, stored: "light" },
    { expected: "dark", prefersDark: false, stored: "dark" },
    { expected: "light", prefersDark: false, stored: null },
    { expected: "dark", prefersDark: true, stored: null },
    { expected: "light", prefersDark: false, stored: "invalid" },
    { expected: "dark", prefersDark: true, stored: "invalid" },
  ])(
    "resolves $stored with prefersDark=$prefersDark to $expected",
    ({ expected, prefersDark, stored }) => {
      expect(resolveColorScheme(stored, prefersDark)).toBe(expected);

      const toggle = vi.fn();
      const getItem = vi.fn(() => stored);
      const matchMedia = vi.fn(() => ({ matches: prefersDark }));

      runInNewContext(getColorSchemeScript(), {
        document: { documentElement: { classList: { toggle } } },
        localStorage: { getItem },
        window: { matchMedia },
      });

      expect(getItem).toHaveBeenCalledExactlyOnceWith(colorSchemeStorageKey);
      expect(matchMedia).toHaveBeenCalledExactlyOnceWith(colorSchemeMediaQuery);
      expect(toggle).toHaveBeenCalledExactlyOnceWith("dark", expected === "dark");
    },
  );
});
