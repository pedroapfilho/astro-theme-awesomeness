const englishStrings = {
  next: "Next →",
  of: "of",
  page: "Page",
  pagination: "Pagination",
  previous: "← Previous",
  readingTime: "min read",
  skipLink: "Skip to content",
};

const portugueseStrings = {
  next: "Próxima →",
  of: "de",
  page: "Página",
  pagination: "Paginação",
  previous: "← Anterior",
  readingTime: "min de leitura",
  skipLink: "Pular para o conteúdo",
};

const getSiteLocale = (lang = "en-US") => ({
  lang,
  ogLocale: lang.replaceAll("-", "_"),
  strings: lang.toLowerCase().startsWith("pt") ? portugueseStrings : englishStrings,
});

export { getSiteLocale };
