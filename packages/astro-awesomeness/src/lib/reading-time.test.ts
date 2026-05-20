import { describe, expect, it } from "vitest";

import { readingTime } from "./reading-time";

describe("readingTime", () => {
  it("returns 1 minute for short text", () => {
    expect(readingTime("Hello world.")).toEqual({ minutes: 1, words: 2 });
  });
  it("scales by words at 200 wpm", () => {
    const text = "word ".repeat(400).trim();
    expect(readingTime(text)).toEqual({ minutes: 2, words: 400 });
  });
  it("strips HTML tags before counting", () => {
    expect(readingTime("<p>Hello <strong>world</strong>.</p>")).toEqual({
      minutes: 1,
      words: 2,
    });
  });
  it("counts markdown text", () => {
    expect(readingTime("# Title\n\nSome body **text** here.")).toEqual({
      minutes: 1,
      words: 5,
    });
  });
});
