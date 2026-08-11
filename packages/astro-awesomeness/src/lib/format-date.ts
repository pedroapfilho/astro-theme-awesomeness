const defaultOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (key: string, locale: string, options: Intl.DateTimeFormatOptions) => {
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
};

const formatDate = (date: Date, locale: string = "en-US", options?: Intl.DateTimeFormatOptions) => {
  if (!options) {
    return getFormatter(locale, locale, defaultOptions).format(date);
  }
  const merged = { ...defaultOptions, ...options };
  return getFormatter(`${locale}:${JSON.stringify(merged)}`, locale, merged).format(date);
};

export { formatDate };
