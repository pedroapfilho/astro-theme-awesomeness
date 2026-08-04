// An unset shell variable reaches a CI build as "" rather than undefined, so an
// empty value has to count as missing or the failure surfaces much later, inside
// the content loader's HTTP call.
const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

export { requireEnv };
