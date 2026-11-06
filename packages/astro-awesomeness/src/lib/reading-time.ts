const WORDS_PER_MINUTE = 200;

const readingMinutes = (input: string): number => {
  const stripped = input
    .replaceAll(/<[^>]*>/gv, "")
    .replaceAll(/[#*_`>\-]/gv, " ")
    .replaceAll(/\s+/gv, " ")
    .trim();

  const words = stripped.length === 0 ? 0 : stripped.split(" ").length;

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

export { readingMinutes };
