// One pagination contract for "/" (page 1) and /blog/page/[page] (pages 2+):
// if the page size or URL scheme drifts between the two routes, posts get
// skipped/duplicated or the homepage links to a route that was never built.
const PAGE_SIZE = 5;

const urlForPage = (n: number) => (n === 1 ? "/" : `/blog/page/${n}`);

export { PAGE_SIZE, urlForPage };
