import { describe, expect, it } from "vitest";

import { readingMinutes } from "./reading-time";

describe("readingMinutes", () => {
  it("returns 1 minute for short text", () => {
    expect(readingMinutes("Hello world.")).toBe(1);
  });
  it("scales by words at 200 wpm", () => {
    expect(readingMinutes("word ".repeat(400).trim())).toBe(2);
    expect(readingMinutes("word ".repeat(401).trim())).toBe(3);
  });
  it("ignores HTML tags and markdown markers", () => {
    expect(readingMinutes(`<p>${"word ".repeat(200)}</p>`)).toBe(1);
    expect(readingMinutes(`# ${"**word** ".repeat(200)}`)).toBe(1);
  });
});
