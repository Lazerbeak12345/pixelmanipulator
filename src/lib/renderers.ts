export type Color=[number, number, number, number]|[number, number, number]|[number, number]|[number]|[]
/** The location of a pixel */
export interface Location{
  x: number
  y: number
  loop?: boolean
  frame?: number
}
export function location2Index ({ x, y }: Location, width: number): number {
  return ((width * y) + x)
}
export abstract class Renderer<T> {
  /** Renders a pixel on a given location. */
  abstract renderPixel (location: Location, id: number): void
  /** Reset the render target */
  abstract reset (): void
  /** Update the render target */
  abstract update (): void
  abstract defaultRenderAs: T
  renderInfo: T[] = []
  modifyElement (id: number, newRenderAs: T): T {
    if (this.renderInfo.length === id) {
      this.renderInfo.push(newRenderAs)
    } else if (this.renderInfo.length > id) {
      this.renderInfo[id] = newRenderAs
    } else throw new Error('Renderer received elements out of order!')
    return newRenderAs
  }

  private _width: number=1
  /** @param value - The new width of the canvas */
  set_width (value: number): void {
    this._width = value
  }

  /** @returns the width of the canvas */
  get_width (): number {
    return this._width
  }

  private _height: number=1
  /** @param value - The new height of the canvas */
  set_height (value: number): void {
    this._height = value
  }

  /** @returns the height of the canvas */
  get_height (): number {
    return this._height
  }
}
export class Ctx2dRenderer extends Renderer<Color> {
  constructor (canvas: HTMLCanvasElement) {
    super()
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (ctx == null) {
      throw new Error('CanvasRenderingContext2D not supported in enviroment')
    }
    this.ctx = ctx
    this.imageData = this.ctx.getImageData(0, 0, this.get_width(), this.get_height())
  }

  /** The last known image data from [[PixelManipulator.ctx]] */
  imageData: ImageData
  /** The rendering context for the canvas */
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  defaultRenderAs = [0, 0, 0, 255] as Color

  override modifyElement (id: number, newRenderAs: Color): Color {
    // allows for arrays that are too small
    while (newRenderAs.length < 4) {
      (newRenderAs as [number]).push(255)
    }
    const indexOfColor = this.renderInfo.indexOf(newRenderAs)
    if (!(indexOfColor === id || indexOfColor === -1)) {
      throw new Error(`The color ${JSON.stringify(newRenderAs)} is already in use!`)
    }
    return super.modifyElement(id, newRenderAs)
  }

  renderPixel (loc: Location, id: number): void {
    const color = this.renderInfo[id]
    if (color == null) {
      throw new Error(`Invalid ID ${id}`)
    }
    // allows for arrays that are too small
    while (color.length < 4) {
      (color as [number]).push(255)
    }
    const w = this.get_width()
    // arry.length is always going to be 4. Checking wastes time.
    const pixelOffset = location2Index(loc, w) * 4
    for (let i = 0; i < 4; ++i) {
      this.imageData.data[pixelOffset + i] = color[i]
    }
  }

  reset (): void {
    this.imageData = this.ctx.getImageData(0, 0, this.get_width(), this.get_height())
    this.ctx.imageSmoothingEnabled = false
  }

  update (): void {
    this.ctx.putImageData(this.imageData, 0, 0)
  }

  override set_width (value: number): void {
    this.canvas.width = value
    super.set_width(value)
  }

  override set_height (value: number): void {
    this.canvas.height = value
    super.set_height(value)
  }
}
export class StringRenderer extends Renderer<string> {
  defaultRenderAs = ' '
  private _chars: string[][] = []
  readonly _callback: (string: string) => void
  constructor (callback: (string: string) => void) {
    super()
    this._callback = callback
  }

  override modifyElement (id: number, newRenderAs: string): string {
    if (newRenderAs.length !== 1) { // TODO measure rendered chars, not length
      throw new Error('Element must be a single char')
    }
    return super.modifyElement(id, newRenderAs)
  }

  reset (): void {
    const w = this.get_width()
    const h = this.get_height()
    this._chars = new Array(h)
      .fill(0)
      .map(() => new Array(w).fill(this.defaultRenderAs))
  }

  renderPixel ({ x, y }: Location, id: number): void {
    this._chars[y][x] = this.renderInfo[id]
  }

  update (): void {
    this._callback(this._chars.map(l => l.join('')).join('\n'))
  }
}
/** render on two different targets (which may also be [[SplitRenderer]]) */
export class SplitRenderer<A, B> extends Renderer<{ a: A, b: B}> {
  defaultRenderAs: { a: A, b: B}
  a: Renderer<A>
  b: Renderer<B>
  constructor (a: Renderer<A>, b: Renderer<B>) {
    super()
    this.a = a
    this.b = b
    this.defaultRenderAs = {
      a: a.defaultRenderAs,
      b: b.defaultRenderAs
    }
  }

  renderPixel (loc: Location, id: number): void {
    this.a.renderPixel(loc, id)
    this.b.renderPixel(loc, id)
  }

  reset (): void {
    this.a.reset()
    this.b.reset()
  }

  update (): void {
    this.a.update()
    this.b.update()
  }

  override modifyElement (id: number, { a, b }: { a: A, b: B }): { a: A, b: B } {
    return super.modifyElement(id, {
      a: this.a.modifyElement(id, a),
      b: this.b.modifyElement(id, b)
    })
  }
}
// This is called a "modeline". It's a (n)vi(m)|ex thing.
// vi: tabstop=2 shiftwidth=2 expandtab
