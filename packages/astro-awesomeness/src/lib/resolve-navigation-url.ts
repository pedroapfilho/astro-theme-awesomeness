const resolveNavigationUrl = (value: string, baseUrl: string): string | null => {
  try {
    const url = new URL(value, baseUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
};

export { resolveNavigationUrl };
