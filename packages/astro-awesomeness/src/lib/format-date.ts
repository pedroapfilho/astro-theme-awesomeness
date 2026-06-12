const defaultOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
};

// Hoisted so the default-arg call (the hot path) skips the JSON.stringify cache key.
const defaultFormatter = new Intl.DateTimeFormat("en-US", defaultOptions);

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (locale: string, options: Intl.DateTimeFormatOptions) => {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
};

const formatDate = (
  date: Date,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = defaultOptions,
) => {
  const isDefaultCall = locale === "en-US" && options === defaultOptions;
  if (isDefaultCall) {
    return defaultFormatter.format(date);
  }
  return getFormatter(locale, { ...defaultOptions, ...options }).format(date);
};

export { formatDate };
