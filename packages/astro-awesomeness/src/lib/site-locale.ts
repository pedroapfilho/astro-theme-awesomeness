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

const getSiteLocale = (lang = "en-US") => {
  const { language, region } = new Intl.Locale(lang).maximize();

  return {
    lang,
    ogLocale: `${language}_${region}`,
    strings: lang.toLowerCase().startsWith("pt") ? portugueseStrings : englishStrings,
  };
};

export { getSiteLocale };
