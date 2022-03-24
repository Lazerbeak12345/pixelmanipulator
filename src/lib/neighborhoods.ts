/**
* An object containing several functions to generate lists of relative positions
* for a neighborhood hitbox.
*
* See [[hitbox]].
*/
export interface xycoord{
  x: number
  y: number
}
export type hitbox=xycoord[]
/**
* Makes a wolfram neighborhood.
*
* Area is f(x)=2x-1
*
* @param radius - Count of how many to the right and left to include. Defaults
* @param yval - Count of how many to offset the y value by. Defaults to -1.
* @param includeSelf - Should this include the center pixel? Defaults to true.
* @returns A hitbox shaped like this under defaults:
*
* ```
* XXX
*  O
* ```
*/
export function wolfram (radius?: number, yval?: number, includeSelf?: boolean): hitbox {
  if (typeof radius === 'undefined') { radius = 1 }
  if (typeof yval === 'undefined') { yval = -1 }
  const output = []
  for (let i = radius; i > 0; i--) {
    output.push({ x: -1 * i, y: yval })
  }
  if (typeof includeSelf === 'undefined' || includeSelf) {
    output.push({ x: 0, y: yval })
  }
  for (let i = radius; i > 0; i--) {
    output.push({ x: i, y: yval })
  }
  return output
}
/**
* Makes a moore neighborhood.
*
* Area is f(x)=(2r+1)^2
*
* @param radius - Count of how many rings around the center to include defaults
* to 1.
* @param includeSelf - Should this include the center pixel? Defaults to false.
* @returns A hitbox shaped like this under defaults:
*
* ```
* XXX
* XOX
* XXX
* ```
*/
export function moore (radius?: number, includeSelf?: boolean): hitbox {
  if (typeof radius === 'undefined') { radius = 1 }
  if (typeof includeSelf === 'undefined') { includeSelf = false }
  const output: hitbox = []
  // Note: no need to calculate the Chebyshev distance. All pixels in this
  // range are "magically" within.
  for (let x = -1 * radius; x <= radius; x++) {
    for (let y = -1 * radius; y <= radius; y++) {
      if (includeSelf || !(x === 0 && y === 0)) { output.push({ x: x, y: y }) }
    }
  }
  return output
  // And to think that this used to be hard... Perhaps they had a different
  // goal? Or just weren't using higher-order algorithims?
}
/**
* Makes a vonNeumann neighborhood.
*
* Area is f(x)=r^2+(r+1)^2
*
* @param radius - Count of how many rings around the center to include. defaults
* to 1.
* @param includeSelf - Should this include the center pixel? Defaults to false.
* @returns A hitbox shaped like this under defaults:
*
* ```
*  X
* XOX
*  X
* ```
*/
export function vonNeumann (radius?: number, includeSelf?: boolean): hitbox {
  if (typeof radius === 'undefined') { radius = 1 }
  if (typeof includeSelf === 'undefined') { includeSelf = false }
  const output: hitbox = []
  // A Von Neumann neighborhood of a given distance always fits inside of a
  // Moore neighborhood of the same. (This is a bit brute-force)
  for (let x = -1 * radius; x <= radius; x++) {
    for (let y = -1 * radius; y <= radius; y++) {
      if (
        (includeSelf || !(x === 0 && y === 0)) &&
        (Math.abs(x) + Math.abs(y) <= radius) // Taxicab distance
      ) { output.push({ x: x, y: y }) }
    }
  }
  return output
}
/**
* Makes a euclidean neighborhood.
*
* Area is not quite that of a circle. TODO find math for exact value.
*
* @param radius - Count of how many rings around the center to include. defaults
* to 1.
* @param includeSelf - Should this include the center pixel? Defaults to false.
* @returns A hitbox where all pixels fit within a circle of the given
* radius, where the precise euclidean distance is `<=` the radias.
*/
export function euclidean (radius?: number, includeSelf?: boolean): hitbox {
  if (typeof radius === 'undefined') { radius = 1 }
  if (typeof includeSelf === 'undefined') { includeSelf = false }
  const output: hitbox = []
  // A circle of a given diameter always fits inside of a square of the same
  // side-length. (This is a bit brute-force)
  for (let x = -1 * radius; x <= radius; x++) {
    for (let y = -1 * radius; y <= radius; y++) {
      if (
        (includeSelf || !(x === 0 && y === 0)) &&
        (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) <= radius) // Euclidean distance
      ) { output.push({ x: x, y: y }) }
    }
  }
  return output
}
// TODO https://www.npmjs.com/package/compute-minkowski-distance ?
// TODO Non-Euclidean distance algorithim?
// This is called a "modeline". It's a (n)vi(m)|ex thing.
// vi: tabstop=2 shiftwidth=2 expandtab
