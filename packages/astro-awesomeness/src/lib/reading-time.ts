const WORDS_PER_MINUTE = 200;

const readingTime = (input: string) => {
  const stripped = input
    .replaceAll(/<[^>]*>/gv, "")
    .replaceAll(/[#*_`>\-]/gv, " ")
    .replaceAll(/\s+/gv, " ")
    .trim();
  const words = stripped.length === 0 ? 0 : stripped.split(" ").length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return { minutes, words };
};

export { readingTime };
