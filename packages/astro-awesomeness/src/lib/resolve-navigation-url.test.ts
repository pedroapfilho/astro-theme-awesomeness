import { describe, expect, it } from "vitest";

import { resolveNavigationUrl } from "./resolve-navigation-url";

const baseUrl = "https://example.com/blog/current";

describe("resolveNavigationUrl", () => {
  it.each([
    ["/posts/hello?ref=search#comments", "https://example.com/posts/hello?ref=search#comments"],
    ["../archive", "https://example.com/archive"],
    ["https://other.example/post", "https://other.example/post"],
    ["http://other.example/post", "http://other.example/post"],
  ])("resolves a web URL: %s", (value, expected) => {
    expect(resolveNavigationUrl(value, baseUrl)).toBe(expected);
  });

  const unsafeScheme = ["java", "script:alert(1)"].join("");

  it.each([unsafeScheme, "data:text/html,hello", "mailto:hello@example.com", "http://["])(
    "rejects a non-web or malformed URL: %s",
    (value) => {
      expect(resolveNavigationUrl(value, baseUrl)).toBeNull();
    },
  );
});
