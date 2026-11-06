const formatters = new Map<string, Intl.DateTimeFormat>();

const formatDate = (date: Date, locale: string): string => {
  let formatter = formatters.get(locale);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      timeZone: "UTC",
      year: "numeric",
    });
    formatters.set(locale, formatter);
  }

  return formatter.format(date);
};

export { formatDate };
