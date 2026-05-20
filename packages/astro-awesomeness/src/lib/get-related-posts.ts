type HasTags = { data: { tags: Array<string> }; slug: string };

const countShared = (a: Array<string>, b: Array<string>) => {
  const setB = new Set(b);
  return a.filter((tag) => setB.has(tag)).length;
};

const getRelatedPosts = <T extends HasTags>(current: T, all: Array<T>, n: number) =>
  all
    .filter((post) => post.slug !== current.slug)
    .map((post) => ({
      post,
      score: countShared(current.data.tags, post.data.tags),
    }))
    .toSorted((x, y) => y.score - x.score)
    .slice(0, n)
    .map(({ post }) => post);

export { getRelatedPosts };
