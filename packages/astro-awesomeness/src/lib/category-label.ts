const NAMED_ENTITIES = {
  amp: "&",
  apos: "'",
  gt: ">",
  hellip: "\u2026",
  ldquo: "\u201c",
  lsquo: "\u2018",
  lt: "<",
  nbsp: "\u00a0",
  ndash: "\u2013",
  quot: '"',
  rdquo: "\u201d",
  rsquo: "\u2019",
} as const;

const MAX_CODE_POINT = 1_114_111;
const EM_DASH = 8212;
const HEX_RADIX = 16;
const ENTITY_PATTERN = /&(?:#(?<decimal>\d+)|#x(?<hex>[\dA-F]+)|(?<named>[A-Z]+));/giv;

const isNamedEntity = (key: string): key is keyof typeof NAMED_ENTITIES =>
  Object.hasOwn(NAMED_ENTITIES, key);

const fromCodePoint = (codePoint: number, entity: string): string =>
  Number.isInteger(codePoint) && codePoint <= MAX_CODE_POINT && codePoint !== EM_DASH
    ? String.fromCodePoint(codePoint)
    : entity;

const decodeEntity = (entity: string, decimal?: string, hex?: string, named?: string): string => {
  if (decimal !== undefined) {
    return fromCodePoint(Number(decimal), entity);
  }
  if (hex !== undefined) {
    return fromCodePoint(Number.parseInt(hex, HEX_RADIX), entity);
  }
  if (named === undefined) {
    return entity;
  }
  const key = named.toLowerCase();
  if (!isNamedEntity(key)) {
    return entity;
  }
  return NAMED_ENTITIES[key];
};

const categoryLabel = (name: string): string => name.replaceAll(ENTITY_PATTERN, decodeEntity);

export { categoryLabel };
