import type { z } from "zod";

type JsonValue = z.infer<ReturnType<typeof z.json>>;

type Json = JsonValue | undefined;

const show = (value: Json): string => (value === undefined ? "absent" : JSON.stringify(value));

const diffArrays = (path: string, before: Array<Json>, after: Array<Json>): Array<string> => {
  const left = before.map(show);
  const right = after.map(show);
  const kept = new Set(right);
  const known = new Set(left);
  const removed = left.filter((item) => !kept.has(item));
  const added = right.filter((item) => !known.has(item));

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
