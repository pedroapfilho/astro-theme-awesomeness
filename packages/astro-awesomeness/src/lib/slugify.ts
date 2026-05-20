const slugify = (input: string) =>
  input
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/gv, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s\-]/gv, "")
    .trim()
    .replaceAll(/[\s\-]+/gv, "-")
    .replaceAll(/^-+|-+$/gv, "");

export { slugify };
