import { describe, expect, it } from "vitest";

import { categoryLabel } from "./category-label";
import { createPostUrl } from "./post-url";

const DEFAULT = "sem-categoria";

describe("categoryLabel", () => {
  it("decodes the named entities the WordPress migrations emit", () => {
    expect(categoryLabel("Arte &amp; Design")).toBe("Arte & Design");
    expect(categoryLabel("Casas &hellip;")).toBe("Casas \u2026");
    expect(categoryLabel("&lt;tag&gt; &quot;x&quot; &rsquo;")).toBe('<tag> "x" \u2019');
    expect(categoryLabel("Ano &ndash; Fim")).toBe("Ano \u2013 Fim");
  });

  it("matches named entities case-insensitively", () => {
    expect(categoryLabel("A &AMP; B")).toBe("A & B");
  });

  it("decodes decimal and hexadecimal numeric entities", () => {
    expect(categoryLabel("&#65;")).toBe("A");
    expect(categoryLabel("&#x2013;")).toBe("\u2013");
    expect(categoryLabel("&#X2013;")).toBe("\u2013");
  });

  it("leaves an encoded em-dash encoded in both numeric forms", () => {
    expect(categoryLabel("A &#8212; B")).toBe("A &#8212; B");
    expect(categoryLabel("A &#x2014; B")).toBe("A &#x2014; B");
  });

  it("leaves out-of-range code points alone instead of throwing", () => {
    expect(() => categoryLabel("&#99999999999;")).not.toThrow();
    expect(categoryLabel("&#99999999999;")).toBe("&#99999999999;");
    expect(categoryLabel("&#x110000;")).toBe("&#x110000;");
  });

  it("does not resolve inherited Object.prototype keys", () => {
    expect(categoryLabel("&constructor;")).toBe("&constructor;");
    expect(categoryLabel("&toString;")).toBe("&toString;");
    expect(categoryLabel("&hasOwnProperty;")).toBe("&hasOwnProperty;");
  });

  it("passes unknown entities and plain text through unchanged", () => {
    expect(categoryLabel("&bogus;")).toBe("&bogus;");
    expect(categoryLabel("Arquitetura")).toBe("Arquitetura");
    expect(categoryLabel("")).toBe("");
  });

  it("stays display-only: decoding a name must not change the URL it resolves to", () => {
    const encodedMap = { "Arte &amp; Design": "arte-e-design" };
    const { postUrl } = createPostUrl(encodedMap, DEFAULT);
    const post = { data: { categories: ["Arte &amp; Design"] }, id: "casa" };
    expect(postUrl(post)).toBe("/arte-e-design/casa/");
    expect(Object.hasOwn(encodedMap, categoryLabel("Arte &amp; Design"))).toBe(false);
  });
});
