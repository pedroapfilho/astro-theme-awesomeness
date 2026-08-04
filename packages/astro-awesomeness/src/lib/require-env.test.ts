import { afterEach, describe, expect, it, vi } from "vitest";

import { requireEnv } from "./require-env";

const KEY = "ASTRO_AWESOMENESS_TEST_ENV";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("requireEnv", () => {
  it("returns the value when the variable is set", () => {
    vi.stubEnv(KEY, "value");
    expect(requireEnv(KEY)).toBe("value");
  });

  it("throws naming the variable when it is unset", () => {
    vi.stubEnv(KEY, undefined);
    expect(() => requireEnv(KEY)).toThrow(`Missing required env var: ${KEY}`);
  });

  it("throws when the variable is set to an empty string", () => {
    vi.stubEnv(KEY, "");
    expect(() => requireEnv(KEY)).toThrow(`Missing required env var: ${KEY}`);
  });
});
