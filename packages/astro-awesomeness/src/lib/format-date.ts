const defaultOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
};

const formatDate = (
  date: Date,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = defaultOptions,
) => new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);

export { formatDate };
