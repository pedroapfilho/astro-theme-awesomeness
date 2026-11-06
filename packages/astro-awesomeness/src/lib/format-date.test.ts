import { describe, expect, it } from "vitest";

import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("formats a UTC calendar date in the given locale", () => {
    expect(formatDate(new Date("2026-05-20T00:00:00Z"), "en-US")).toBe("May 20, 2026");
    expect(formatDate(new Date("2026-05-20T00:00:00Z"), "pt-BR")).toMatch(/20 de maio de 2026/iv);
  });
});
