/** Maps `value` into [-count / 2, count / 2): the shortest way round a ring of `count`. */
export function wrap(value: number, count: number): number {
  if (count <= 0) return 0
  const half = count / 2
  return ((((value + half) % count) + count) % count) - half
}

/** Index of `value` on a ring of `count`, from 0 to count - 1. */
export function ringIndex(value: number, count: number): number {
  if (count <= 0) return 0
  return ((Math.round(value) % count) + count) % count
}
