type HasTags = { data: { tags: Array<string> }; slug: string };

const getRelatedPosts = <T extends HasTags>(current: T, all: Array<T>, n: number) => {
  const currentTagSet = new Set(current.data.tags);
  const scored: Array<{ post: T; score: number }> = [];

  for (const post of all) {
    if (post.slug === current.slug) {
      continue;
    }
    let score = 0;
    for (const tag of post.data.tags) {
      if (currentTagSet.has(tag)) {
        score++;
      }
    }
    scored.push({ post, score });
  }

  return scored
    .toSorted((x, y) => y.score - x.score)
    .slice(0, n)
    .map(({ post }) => post);
};

export { getRelatedPosts };
