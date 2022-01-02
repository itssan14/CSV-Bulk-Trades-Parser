export const identity = x => x;
export const noop = () => {};
export function pipe(...fns) {
  return x => fns.reduce((v, f) => f(v), x);
}

type swap = { [key: string]: unknown };
export function swapKeyValueOfObject(obj: swap = {}): swap {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [value, key])
  );
}
