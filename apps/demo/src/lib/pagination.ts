const PAGE_SIZE = 5;

const urlForPage = (n: number) => (n === 1 ? "/" : `/blog/page/${n}`);

export { PAGE_SIZE, urlForPage };
