import type { z } from "zod";

type JsonValue = z.infer<ReturnType<typeof z.json>>;

type Json = JsonValue | undefined;

const show = (value: Json): string => (value === undefined ? "absent" : JSON.stringify(value));

const surplus = (items: Array<string>, others: Array<string>): Array<string> => {
  const unmatched = new Map<string, number>();

  for (const item of others) {
    unmatched.set(item, (unmatched.get(item) ?? 0) + 1);
  }

  return items.filter((item) => {
    const count = unmatched.get(item) ?? 0;
    unmatched.set(item, count - 1);

    return count <= 0;
  });
};

const diffArrays = (path: string, before: Array<Json>, after: Array<Json>): Array<string> => {
  const left = before.map(show);
  const right = after.map(show);
  const removed = surplus(left, right);
  const added = surplus(right, left);

  if (removed.length === 0 && added.length === 0) {
    return left.join("\n") === right.join("\n") ? [] : [`${path}: order changed`];
  }

  return [
    ...removed.map((item) => `${path}: - ${item}`),
    ...added.map((item) => `${path}: + ${item}`),
  ];
};

const isObject = (value: Json): value is Record<string, JsonValue> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const diff = (before: Json, after: Json, path = ""): Array<string> => {
  if (Array.isArray(before) && Array.isArray(after)) {
    return diffArrays(path, before, after);
  }

  if (isObject(before) && isObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

    return [...keys]
      .toSorted()
      .flatMap((key) => diff(before[key], after[key], path === "" ? key : `${path} ${key}`));
  }

  return show(before) === show(after) ? [] : [`${path}: ${show(before)} -> ${show(after)}`];
};

export { diff };
