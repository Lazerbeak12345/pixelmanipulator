// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- Incorrect error. The type is used in the params.
export function sizeWithoutDuplicates<T> (list: T[]): number {
  return new Set(list.map(pos => JSON.stringify(pos))).size
}
// vi: tabstop=2 shiftwidth=2 expandtab
