/** Several functions to generate lists of relative positions
 *  for a neighborhood hitbox.
 *
 *  Copyright (C) 2018-2024  Nathan Fritzler
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see http://www.gnu.org/licenses/
 */
import type { Location } from './renderers'
/** A list of locations, usually relative around a pixel. */
export type Hitbox = Location[]
/** A rect between two points
* @param topLeft - The top left corner
* @param bottomRight - The bottom right corner
* @returns A hitbox shaped like a rectangle between the corners.
*/
export function rect(topLeft: Location, bottomRight: Location): Location[] {
  const output: Hitbox = []
  const STEP = 1
  for (let { x } = topLeft; x <= bottomRight.x; x+= STEP) {
    for (let { y } = topLeft; y <= bottomRight.y; y+= STEP) {
      output.push({ x, y })
    }
  }
  return output
}
/** Makes a wolfram neighborhood.
*
* Locations intentionally ordered to reflect use in higher-order functions.
*
* Area is f(x)=2x+1
*
* @param radius - Count of how many to the right and left to include. Defaults
* @param y - Count of how many to offset the y value by. Defaults to -1.
* @param includeSelf - Should this include the center pixel? Defaults to true.
* @returns A hitbox shaped like this under defaults:
*
* ```
* XXX
*  O
* ```
*/
export function wolfram(radius?: number, y?: number, includeSelf?: boolean): Hitbox {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default value
  const _radius = radius ?? 1;
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default value
  const _y = y ?? -1;
  const _includeSelf = includeSelf ?? true
  const output: Hitbox = []
  const START = 0
  const STEP = 1
  for (let i = _radius; i > START; i-= STEP) {
    output.push({ x: -i, y: _y })
  }
  if (_includeSelf) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- center
    output.push({ x: 0, y: _y })
  }
  for (let i = _radius; i > START; i-= STEP) {
    output.push({ x: i, y: _y })
  }
  return output
}
/** Makes a moore neighborhood.
*
* Area is f(x)=-1+(2r+1)^2 if `includeSelf` is `false` or undefined, f(x)=(2r+1)^2 if it is `true`
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
export function moore(radius?: number, includeSelf?: boolean): Hitbox {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default value
  const _radius = radius ?? 1
  const _includeSelf = includeSelf ?? false
  // Note: no need to calculate the Chebyshev distance. All pixels in this
  // range are "magically" within.
  const r = rect({
    x: -_radius,
    y: -_radius
  }, {
    x: _radius,
    y: _radius
  })
  if (_includeSelf) return r
  return r.filter(({ x, y }) => !(x === 0 && y === 0)) // eslint-disable-line @typescript-eslint/no-magic-numbers -- center is zeros
  // And to think that this used to be hard... Perhaps they had a different
  // goal? Or just weren't using higher-order algorithims?
}
/** Makes a vonNeumann neighborhood.
*
* Area is f(x)=r^2+(r+1)^2 assuming `includeSelf` is true
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
*
* if `radius` is `2` it looks like this:
*
* ```
*   X
*  XXX
* XXOXX
*  XXX
*   X
* ```
*/
export function vonNeumann(radius?: number, includeSelf?: boolean): Hitbox {
  // A Von Neumann neighborhood of a given distance always fits inside of a
  // Moore neighborhood of the same. (This is a bit brute-force)
  const DEFAULT_RADIUS = 1
  const _radius = radius ?? DEFAULT_RADIUS
  return moore(_radius, includeSelf).filter(({ x, y }) =>
    (Math.abs(x) + Math.abs(y) <= _radius)) // Taxicab distance
}
/** Makes a euclidean neighborhood.
*
* Area is not quite that of a circle. TODO find math for exact value.
*
* @param radius - Count of how many rings around the center to include. defaults
* to 1.
* @param includeSelf - Should this include the center pixel? Defaults to false.
* @returns A hitbox where all pixels fit within a circle of the given
* radius, where the precise euclidean distance is `<=` the radias.
*/
export function euclidean(radius?: number, includeSelf?: boolean): Hitbox {
  // A circle of a given diameter always fits inside of a square of the same
  // side-length. (This is a bit brute-force)
  const DEFAULT_RADIUS = 1
  return moore(radius, includeSelf).filter(({ x, y }) =>
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- pythagorean theorum
    (Math.sqrt((x ** 2) + (y ** 2)) <= (radius ?? DEFAULT_RADIUS))) // Euclidean distance
}
// TODO https://www.npmjs.com/package/compute-minkowski-distance ?
// TODO Non-Euclidean distance algorithim?
// This is called a "modeline". It's a (n)vi(m)|ex thing.
// vi: tabstop=2 shiftwidth=2 expandtab
