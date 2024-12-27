/** Various rendering targets
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

/** The location of a pixel */
export interface Location {
  /** x position */
  x: number
  /** y position */
  y: number
  /** Should this location loop around screen borders? */
  loop?: boolean
  /** Should this location be treated to be on the current frame, previous, or older?
  *
  * Current frame is zero. Higher is older - but not guarenteed to be present
  */
  frame?: number
}
/** Convert a loction to a index to reduce need for 2D arrays
* @param x - x location
* @param y - y location
* @param width - width of the canvas
*/
export function location2Index({ x, y }: Location, width: number): number {
  return ((width * y) + x)
}
/** Transpose a list of locations, using a location.
* @param locs - Locations to be transposed. If the frame or loop values are
* absent, they are set to the value in [offset]. If absent from [offset] they
* are not set.
* @param offset - Amount to transpose the locations by, represented by a
* location.
*/
export function transposeLocations(locs: Location[], offset: Location): Location[] {
  const { x, y, frame, loop } = offset
  return locs.map(loc => {
    const newLoc: Location = {
      x: loc.x + x,
      y: loc.y + y,
      frame: loc.frame ?? frame,
      loop: loc.loop ?? loop
    }
    if (newLoc.frame == null) delete newLoc.frame
    if (newLoc.loop == null) delete newLoc.loop
    return newLoc
  })
}
/** Abstract rendering type. Used by {@link pixelmanipulator.PixelManipulator} to enable rendering to
* various targets. */
export abstract class Renderer<T> {
  /** Renders a pixel on a given location on the next call to {@link Renderer.update}
  * @param location - Where to render the pixel.
  * @param id - the pixel to render.
  */
  abstract renderPixel(location: Location, id: number): void
  /** Reset the render target. */
  abstract reset(): void
  /** Update the render target. Draws all changes queued up by {@link Renderer.renderPixel}. */
  abstract update(): void
  /** The {@link pixelmanipulator.ElementData.renderAs} value for the default element */
  abstract defaultRenderAs: T
  /** Ordered by ID, the {@link pixelmanipulator.ElementData.renderAs} info for each element. */
  renderInfo: T[] = []
  /** Intentionally overridable, called when an element is modified.
  * @param id - The id of the element to modify.
  * @param newRenderAs - The new {@link pixelmanipulator.ElementData.renderAs} info.
  * @returns The value passed upstream to be stored as the actual renderAs info,
  * allowing for sanitation in this function, or one overriding it.
  */
  modifyElement(id: number, newRenderAs: T): T {
    if (this.renderInfo.length === id) {
      this.renderInfo.push(newRenderAs)
    } else if (this.renderInfo.length > id) {
      this.renderInfo[id] = newRenderAs
    } else throw new Error('Renderer received elements out of order!')
    return newRenderAs
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default value
  private _width = 1
  /** @param value - The new width of the canvas */
  set_width(value: number): void {
    this._width = value
  }

  /** @returns the width of the canvas */
  get_width(): number {
    return this._width
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default value
  private _height = 1
  /** @param value - The new height of the canvas */
  set_height(value: number): void {
    this._height = value
  }

  /** @returns the height of the canvas */
  get_height(): number {
    return this._height
  }
}
/** The color of an element */
export type Color = [number, number, number, number] | [number, number, number] | [number, number] | [number] | []
const NUMBER_OF_COLORS = 4
/** Render onto an {@link HTMLCanvasElement} using a {@link CanvasRenderingContext2D} */
export class Ctx2dRenderer extends Renderer<Color> {
  /** @param canvas - The canvas to render on, and to adjust the size of */
  constructor(canvas: HTMLCanvasElement) {
    super()
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (ctx == null) {
      throw new Error('CanvasRenderingContext2D not supported in enviroment')
    }
    this.ctx = ctx
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- top-left corner
    this.imageData = this.ctx.getImageData(0, 0, this.get_width(), this.get_height())
  }

  /** The last known image data from {@link Ctx2dRenderer.ctx} */
  imageData: ImageData
  /** The rendering context for the canvas */
  ctx: CanvasRenderingContext2D
  /** The canvas */
  canvas: HTMLCanvasElement
  /** Default color is solid black */
  defaultRenderAs = [0, 0, 0, 255] as Color // eslint-disable-line @typescript-eslint/no-magic-numbers -- top-left corner

  /** In addition to calling {@link Renderer.modifyElement}, this leftpads colors
  * with `255` and checks for dupicates.
  * @param id - Id of element
  * @param newRenderAs - The proposed color of the element.
  * @returns the actual color of the element. Always 4 long.
  */
  override modifyElement(id: number, newRenderAs: Color): Color {
    // allows for arrays that are too small
    while (newRenderAs.length < NUMBER_OF_COLORS) {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default values to 255
      (newRenderAs as number[]).push(255)
    }
    const NOT_FOUND = -1
    const indexOfColor = this.renderInfo.indexOf(newRenderAs)
    if (!(indexOfColor === id || indexOfColor === NOT_FOUND)) {
      throw new Error(`The color ${JSON.stringify(newRenderAs)} is already in use!`)
    }
    return super.modifyElement(id, newRenderAs)
  }

  /** @param loc - location of the pixel to render. Ignores {@link Location.frame} and {@link Location.loop}
  * @param id - The id of the pixel to render.
  */
  renderPixel(loc: Location, id: number): void {
    const { renderInfo: { [id]: color } } = this
    if (typeof color === "undefined") {
      throw new Error(`Invalid ID ${id}`)
    }
    // allows for arrays that are too small
    // TODO: unify this code (duplicate in above function)
    while (color.length < NUMBER_OF_COLORS) {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default values to 255
      (color as number[]).push(255)
    }
    const w = this.get_width()
    const pixelOffset = location2Index(loc, w) * NUMBER_OF_COLORS
    for (let i = 0; i < NUMBER_OF_COLORS; ++i) {
      // eslint-disable-next-line @typescript-eslint/prefer-destructuring -- destructuring is more messy here
      this.imageData.data[pixelOffset + i] = color[i]
    }
  }

  reset(): void {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- top left corner
    this.imageData = this.ctx.getImageData(0, 0, this.get_width(), this.get_height())
    this.ctx.imageSmoothingEnabled = false
  }

  update(): void {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- top left corner
    this.ctx.putImageData(this.imageData, 0, 0)
  }

  override set_width(value: number): void {
    this.canvas.width = value
    super.set_width(value)
  }

  override set_height(value: number): void {
    this.canvas.height = value
    super.set_height(value)
  }
}
/** Render to a string */
export class StringRenderer extends Renderer<string> {
  defaultRenderAs = ' '
  private _chars: string[][] = []
  /** The callback function passed to the constructor. Called on {@link StringRenderer.update} */
  readonly _callback: (string: string) => void
  /** @param callback - A function called on {@link StringRenderer.update}. Passed a
  * string with the renderable state of the {@link pixelmanipulator.PixelManipulator} */
  constructor(callback: (string: string) => void) {
    super()
    this._callback = callback
  }

  /** @param newRenderAs - The proposed character to use. Must be 1 char long and unique */
  override modifyElement(id: number, newRenderAs: string): string {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- single char is len one (if ascii)
    if (newRenderAs.length !== 1) { // TODO: measure rendered chars, not length
      throw new Error('Element must be a single char')
    }
    if (this.renderInfo.includes(newRenderAs)) {
      throw new Error(`Element ${id} must have a unique renderAs`)
    }
    return super.modifyElement(id, newRenderAs)
  }

  reset(): void {
    const w = this.get_width()
    const h = this.get_height()
    this._chars = new Array(h)
      .fill([])
      .map(() => new Array<string>(w).fill(this.defaultRenderAs))
  }

  /** @param x - X location of pixel
  * @param y - y location of pixel
  * @param id - The id of the pixel
  */
  renderPixel({ x, y }: Location, id: number): void {
    const { renderInfo: { [id]: char } } = this
    this._chars[y][x] = char
  }

  update(): void {
    this._callback(this._chars.map(l => l.join('')).join('\n'))
  }
}
/** render on two different targets (which may also be {@link SplitRenderer}) */
export class SplitRenderer<A, B> extends Renderer<{ a: A, b: B }> {
  defaultRenderAs: { a: A, b: B }
  a: Renderer<A>
  b: Renderer<B>
  constructor(a: Renderer<A>, b: Renderer<B>) {
    super()
    this.a = a
    this.b = b
    this.defaultRenderAs = {
      a: a.defaultRenderAs,
      b: b.defaultRenderAs
    }
  }

  renderPixel(loc: Location, id: number): void {
    this.a.renderPixel(loc, id)
    this.b.renderPixel(loc, id)
  }

  reset(): void {
    this.a.reset()
    this.b.reset()
  }

  update(): void {
    this.a.update()
    this.b.update()
  }

  override modifyElement(id: number, { a, b }: { a: A, b: B }): { a: A, b: B } {
    return super.modifyElement(id, {
      a: this.a.modifyElement(id, a),
      b: this.b.modifyElement(id, b)
    })
  }
}
// This is called a "modeline". It's a (n)vi(m)|ex thing.
// vi: tabstop=2 shiftwidth=2 expandtab
