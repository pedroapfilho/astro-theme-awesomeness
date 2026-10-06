import { describe, expect, it } from "vitest";

import { getSiteLocale } from "./site-locale";

describe("getSiteLocale", () => {
  it("defaults to US English when Astro has no configured locale", () => {
    expect(getSiteLocale(undefined)).toEqual({
      lang: "en-US",
      ogLocale: "en_US",
      strings: {
        next: "Next →",
        of: "of",
        page: "Page",
        pagination: "Pagination",
        previous: "← Previous",
        readingTime: "min read",
        skipLink: "Skip to content",
      },
    });
  });

  it.each(["pt", "pt-BR", "pt-PT", "pt-Latn-BR"])(
    "derives Portuguese chrome from %s without replacing its locale",
    (lang) => {
      expect(getSiteLocale(lang)).toEqual({
        lang,
        ogLocale: lang.replaceAll("-", "_"),
        strings: {
          next: "Próxima →",
          of: "de",
          page: "Página",
          pagination: "Paginação",
          previous: "← Anterior",
          readingTime: "min de leitura",
          skipLink: "Pular para o conteúdo",
        },
      });
    },
  );

  it("keeps unsupported language tags for document, Open Graph, and Intl formatting", () => {
    const locale = getSiteLocale("de-DE");
    expect(locale.lang).toBe("de-DE");
    expect(locale.ogLocale).toBe("de_DE");
    expect(locale.strings).toEqual(getSiteLocale().strings);
    expect(
      new Intl.DateTimeFormat(locale.lang, {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
        year: "numeric",
      }).format(new Date("2026-05-20T00:00:00Z")),
    ).toBe("20. Mai 2026");
  });
});
