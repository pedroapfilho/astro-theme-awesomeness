import { describe, expect, it } from "vitest";

import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("formats a Date in en-US by default", () => {
    expect(formatDate(new Date("2026-05-20T00:00:00Z"))).toBe("May 20, 2026");
  });
  it("respects locale", () => {
    expect(formatDate(new Date("2026-05-20T00:00:00Z"), "pt-BR")).toMatch(/20 de maio de 2026/iv);
  });
  it("respects custom options", () => {
    expect(
      formatDate(new Date("2026-05-20T00:00:00Z"), "en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    ).toBe("May 20, 2026");
  });
});
