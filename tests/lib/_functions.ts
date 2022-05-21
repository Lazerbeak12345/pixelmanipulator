export function sizeWithoutDuplicates<T> (list: T[]): number {
  return new Set(list.map(pos => JSON.stringify(pos))).size
}
// vi: tabstop=2 shiftwidth=2 expandtab
