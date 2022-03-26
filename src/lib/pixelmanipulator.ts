/*  This is a cellular automata JavaScript library called PixelManipulator. For
 *  information about how to use this script, see
 *  https://github.com/Lazerbeak12345/pixelmanipulator
 *
 *  Copyright (C) 2018-2021  Nathan Fritzler
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
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { version as _version } from '../../package.json'
import { hitbox, moore, wolfram } from './neighborhoods'
function boolToNumber (bool: boolean): number {
  return bool ? 1 : 0
}
/** The location of a pixel */
export interface Location{
  x: number
  y: number
  loop?: boolean
  frame?: number
}
/** The argument to [[ElementDataUnknown.liveCell]] and
* [[ElementDataUnknown.deadCell]]
*/
export interface Rel{
  /** The X location of this pixel. */
  x: number
  /** The Y location of this pixel. */
  y: number
  /* The ID number of the current pixel. Reccommended if performance profiling
  * shows string comparision is a bottleneck.
  */
  oldId: number
  thisId: number
}
export type Color=[number, number, number, number]|[number, number, number]|[number, number]|[number]|[]
/** Much like [[ElementDataUnknown]] but all fields except [[ElementData.loop]],
* [[ElementData.liveCell]] and [[ElementData.liveCell]] are mandatory. */
export interface ElementData extends ElementDataUnknown {
  name: string
  color: Color
  hitbox: hitbox
  liveCell?: (rel: Rel) => void
  deadCell?: (rel: Rel) => void
}
/** Information about an element. */
export interface ElementDataUnknown{
  /** The name of the element. */
  name?: string
  /** The rgba color of the element. If there is less than 4 values in this
  * array, the end of the array is padded with the number 255. (if missing
  * entirely, the color is white) NOTE THAT NO TWO ELEMENTS MAY HAVE EXACTLY THE
  * SAME COLOR (Starting in version 3 this will throw an error)
  */
  color?: Color
  /** [[ElementDataUnknownNameMandatory.deadCell]] will only be called on empty
  * pixels within the hitbox of a live cell. Array of relative coordinate pairs.
  * Optional, defaults to the result of [[PixelManipulator.neighborhoods.moore]]
  * called with no arguments.
  */
  hitbox?: hitbox
  /** When present, overrules the value [[ElementDataUnknown.pattern]] suppied.
  *
  * Every frame of animation, pixelmanipulator iterates through each and every pixel on the screen. If this element is found, it calls this function.
  */
  liveCell?: (rel: Rel) => void
  /** When present, overrules the value [[ElementDataUnknown.pattern]] suppied.
  *
  * Every frame of animation, pixelmanipulator iterates through each and every
  * pixel on the screen. If this element is found, it calls this function on
  * each of the locations defined in [[ElementDataUnknown.hitbox]] so long as
  * the pixel matches the value in [[PixelManipulator.defaultId]], without
  * calling the same dead pixel twice.
  */
  deadCell?: (rel: Rel) => void
  madeWithRule?: true
}
/** Much like [[ElementDataUnknown]] but the name is mandatory. */
export interface ElementDataUnknownNameMandatory extends ElementDataUnknown{
  name: string
}
function _convertNumListToBf (nl: string): number {
  // While I used to use string with each digit in it, I found that since
  // there are 0-8, I could use a 9bit field (remember: off by one)
  let out = 0
  for (let i = 0; i < nl.length; i++) {
    const item = nl[i]
    out |= 1 << parseInt(item)
  }
  return out
}
export const rules = {
  lifelike: function (p: PixelManipulator, pattern: string, loop?: boolean): ElementDataUnknown {
    const numbers = pattern.split(/\/?[a-z]/gi)// "B",born,die
    const bfdie = _convertNumListToBf(numbers[2])
    const bflive = _convertNumListToBf(numbers[1])
    return {
      madeWithRule: true,
      hitbox: moore(),
      liveCell: function llive ({ x, y, thisId }) {
        // if any match (of how many moore are nearby) is found, it dies
        if ((bfdie & 1 << p.mooreNearbyCounter({ x, y, frame: 1, loop }, thisId)) === 0) {
          p.setPixel({ x, y }, p.defaultId)
        }
      },
      deadCell: function ldead ({ x, y, thisId }) {
        // if any match (of how many moore are nearby) is found, it lives
        if ((bflive & 1 << p.mooreNearbyCounter({ x, y, frame: 1, loop }, thisId)) > 0) {
          p.setPixel({ x, y }, thisId)
        }
      }
    }
  },
  wolfram: function (p: PixelManipulator, pattern: string, loop?: boolean): ElementDataUnknown {
    const binStates = parseInt(pattern.split(/Rule /gi)[1])
    return {
      madeWithRule: true,
      hitbox: wolfram(1, 1),
      liveCell: function wlive ({ x, y, thisId }) {
        if (y === 0) return
        // for every possible state
        for (let binDex = 0; binDex < 8; binDex++) {
          if (
            // if the state is "off". Use a bit mask and shift it
            (binStates & 1 << binDex) === 0 &&
            // if there is a wolfram match (wolfram code goes from 111 to 000)
            p.wolframNearbyCounter({ x, y, frame: 1, loop }, thisId, binDex)
          ) {
            p.setPixel({ x, y, loop }, p.defaultId)
            return// No more logic needed, it is done.
          }
        }
      },
      deadCell: function wdead ({ x, y, thisId }) {
        // for every possible state
        for (let binDex = 0; binDex < 8; binDex++) {
          if (
            // if the state is "on". Use a bit mask and shift it
            (binStates & 1 << binDex) > 0 &&
            // if there is a wolfram match (wolfram code goes from 111 to 000)
            p.wolframNearbyCounter({ x, y, frame: 1, loop }, thisId, binDex)
          ) {
            p.setPixel({ x, y, loop }, thisId)
            return// No more logic needed, it is done.
          }
        }
      }
    }
  }
}
/** Sizes to set the canvases to. If a value below is absent, old value is used.
*/
export interface CanvasSizes{
  /** width of the canvas */
  canvasW?: number
  /** height of the canvas */
  canvasH?: number
}
export abstract class Renderer {
  /** Renders a pixel on a given location. */
  abstract renderPixel (location: Location, id: number): void
  /** Reset the render target */
  abstract reset (): void
  /** Update the render target */
  abstract update (): void
  /** @param value - The new width of the canvas */
  abstract set_width (value: number): void
  /** @returns the width of the canvas */
  abstract get_width (): number
  /** @param value - The new height of the canvas */
  abstract set_height (value: number): void
  /** @returns the height of the canvas */
  abstract get_height (): number
  attachPixelManipulator (pm: PixelManipulator): void {
    this.pm = pm
  }

  getPixelManipulator (): PixelManipulator {
    if (this.pm == null) {
      throw new Error('This operation requires the renderer to be attached to a PixelManipulator instance')
    }
    return this.pm
  }

  private pm: PixelManipulator | null = null
}
export class Ctx2dRenderer extends Renderer {
  // TODO idToColor
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
  renderPixel ({ x, y }: Location, id: number): void {
    const pm = this.getPixelManipulator()
    const color = pm.idToColor(id)
    if (color == null) {
      throw new Error('Invalid ID')
    }
    // allows for arrays that are too small
    while (color.length < 4) {
      (color as [number]).push(255)
    }
    const w = this.get_width()
    // arry.length is always going to be 4. Checking wastes time.
    const pixelOffset = ((w * y) + x) * 4
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

  private _width: number=1
  set_width (value: number): void {
    this.canvas.width = value
    this._width = value
  }

  get_width (): number {
    return this._width
  }

  private _height: number=1
  set_height (value: number): void {
    this.canvas.height = value
    this._height = value
  }

  get_height (): number {
    return this._height
  }
}
/** A cellular automata engine */
export class PixelManipulator {
  constructor (renderer: Renderer, width: number, height: number) {
    this.renderer = renderer
    this.renderer.attachPixelManipulator(this)
    this.reset({ canvasW: width, canvasH: height })
  }

  renderer: Renderer
  /**
  * This is the number that indicates what animation frame the iterate function
  * is being called with.
  *
  * \> You can use this to mannually stop the iterations like so:
  * \> `cancelAnimationFrame(this.loopint)` (not reccommended)
  */
  loopint=0
  /**
  * A low-level listing of the availiable elements.
  *
  * Format is much like the argument to
  * [[PixelManipulator.addMultipleElements]], but is not sanitized.
  */
  elements: ElementData[]=[
    {
      color: [0, 0, 0, 255],
      hitbox: [],
      name: 'blank'
    }
  ]

  /**
  * A mapping from old names for elements to new names for elements.
  *
  * Allows a user to modify the name of an element at runtime.
  */
  nameAliases: Map<string, string>=new Map()
  /**
  * A string indicating weather it is currently animating or not.
  *
  * It is `"playing"` if it is currently animating, or `"paused"` if not
  * currently animating.
  *
  * \> This has been around since early version 0, and once was the `innerText`
  * \> value of a pause/play button!
  */
  mode: 'playing'|'paused'='paused'
  /**
  * The elm that pixelmanipulator will fill the screen with upon initialization,
  * and what elements should return to when they are "dead". Default value is
  * 0, an element with the color `#000F`
  */
  defaultId=0
  /** Called before [[PixelManipulator.iterate]] does its work. */
  onIterate: () => void=() => {}
  /** Called after [[PixelManipulator.iterate]] does its work. */
  onAfterIterate: () => void=function () {}

  /** Gets called after a call to [[PixelManipulator.modifyElement]]. The ID is
  * passed as the only argument.
  */
  onElementModified: (id: number) => void=function () {}
  /** @returns the width of the canvas */
  get_width (): number {
    return this.renderer.get_width()
  }

  /** @param value - The new width of the canvas */
  set_width (value: number): void {
    this.renderer.set_width(value)
  }

  /** @returns the height of the canvas */
  get_height (): number {
    return this.renderer.get_height()
  }

  /** @param value - The new height of the canvas */
  set_height (value: number): void {
    this.renderer.set_height(value)
  }

  /// fills the screen with value, at an optional given percent
  randomlyFill (value: string|number|Color, pr?: number): void {
    pr = pr ?? 15
    const w = this.get_width()
    const h = this.get_height()
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) { // iterate through x and y
        if (Math.random() * 100 < pr) { this.setPixel({ x, y }, value) }
      }
    }
  };

  /** Adds multiple elements.
  *
  * ```ts
  * p.addMultipleElements({
  *   "Conway's Game of Life":{
  *     color:[0,255,0],
  *     pattern:"B3/S23"
  *   },
  *   "Highlife":{
  *     color:[0,255,128],
  *     pattern:"B36/S23" //born on 3 or 6, survives on 2 or 3
  *   }
  * })
  * ```
  *
  * @param elements - Index is the element name, value is the element data (and
  * does not require the name). Value is passed to
  * [[PixelManipulator.addElement]]
  */
  addMultipleElements (elements: {[index: string]: ElementDataUnknown}): void {
    for (const elm in elements) {
      elements[elm].name = elm
      this.addElement(elements[elm] as ElementDataUnknownNameMandatory)
    }
  };

  /** Add an element with the given element data
  *
  * Example for Conway's game of life:
  *
  * ```ts
  * p.addElement({
  *   name:"Conway's Game Of Life",
  *   color:[0,255,0],
  *   pattern:"B3/S23"
  * })
  * ```
  *
  * @returns The generated [[ElementData.number]]
  */
  addElement (
    data: ElementDataUnknownNameMandatory
  ): number { // adds a single element
    const elm = data.name// name of the element
    if (typeof elm === 'undefined') throw new Error('Name is required for element')
    if (typeof data.name === 'undefined') data.name = elm
    if (typeof data.color === 'undefined') data.color = [255, 255, 255, 255]// color of the element
    // Must be this value exactly for modifyElement to work
    const tmpData: ElementDataUnknown = {
      name: elm,
      color: data.color
    }
    this.elements.push(tmpData as ElementData)
    this.modifyElement(this.elements.length - 1, data as ElementDataUnknown)
    return this.elements.length - 1
  };

  /** Any values present in the object will be applied to the pre-existing
  * element.
  *
  * Automatically calls [[PixelManipulator.aliasElements]] if
  * [[ElementDataUnknown.name]] is present in the object.
  *
  * If [[ElementDataUnknown.pattern]] is present, it will intelegently replace
  * the [[ElementDataUnknown.liveCell]] and [[ElementDataUnknown.deadCell]]
  * callbacks.
  */
  modifyElement (id: number, data: ElementDataUnknown): void {
    const oldData = this.elements[id]
    if (typeof data.name !== 'undefined' && data.name !== oldData.name) {
      this.aliasElements(oldData, data as ElementDataUnknownNameMandatory)
    }
    if (typeof data.color !== 'undefined') {
      while (data.color.length < 4) {
        (data.color as [number]).push(255)
      }
      if (this.colorToId(data.color) !== id) {
        throw new Error(`The color ${data.color.toString()} is already in use!`)
      }
    }
    if (data.hitbox == null) {
      data.hitbox = moore()
    }
    oldData.name = data.name ?? oldData.name
    oldData.color = data.color ?? oldData.color
    oldData.hitbox = data.hitbox ?? oldData.hitbox
    oldData.liveCell = data.liveCell ?? oldData.liveCell
    oldData.deadCell = data.deadCell ?? oldData.deadCell
    oldData.madeWithRule = data.madeWithRule ?? oldData.madeWithRule
    this.elements[id] = oldData
    this.onElementModified(id)
  };

  /** Takes the old data object and the new one. (currently only accesses
  * [[ElementDataUnknownNameMandatory.name]])
  *
  * Adds element to [[PixelManipulator.nameAliases]], and ensures no alias loops are present.
  */
  aliasElements (oldData: ElementDataUnknownNameMandatory, newData: ElementDataUnknownNameMandatory): void {
    // Intentionally ignores aliases when checking for duplicate name.
    if (this.elements.find(elm => elm.name === newData.name) != null) {
      throw new Error('The name ' + newData.name + ' is already in use!')
    }
    this.nameAliases.delete(newData.name)
    this.nameAliases.set(oldData.name, newData.name)
  };

  /** Respecting aliases, convert an element name into its number. */
  nameToId (name: string): number {
    let unaliased: string|undefined = name
    while (typeof unaliased !== 'undefined') {
      name = unaliased
      unaliased = this.nameAliases.get(name)
    }
    return this.elements.findIndex(elm => elm.name === name)
  }

  /**
  * @param name - Name of the (possibly aliased) element.
  * @returns The element from [[PixelManipulator.elementTypeMap]], respecting
  * aliases in [[PixelManipulator.nameAliases]], or [[undefined]] if not found.
  */
  getElementByName (name: string): ElementData|undefined {
    return this.elements[this.nameToId(name)]
  }

  /**
  *
  * @param loop - Should this check wrap around canvas edges?
  *
  * @returns Name of element at passed-in location. See [[ElementData.name]]
  */
  whatIs (loc: Location): string {
    return this.elements[this.getPixelId(loc)].name
  }

  /** Start iterations on all of the elements on the canvas.
  * Sets [[PixelManipulator.mode]] to `"playing"`, and requests a new animation
  * frame, saving it in [[PixelManipulator.loopint]].
  *
  * @param canvasSizes - If [[PixelManipulator.mode]] is already `"playing"` then
  * canvasSizes is passed to [[PixelManipulator.reset]]. Otherwise reset is not
  * called.
  */
  play (canvasSizes?: CanvasSizes): void {
    if (this.mode === 'playing') this.reset(canvasSizes)
    this.mode = 'playing'
    this.loopint = window.requestAnimationFrame(() => {
      this.iterate()
    })
  };

  /** Reset, resize and initialize the canvas(es).
  * Calls [[PixelManipulator.pause]] [[PixelManipulator.updateData]]
  * [[PixelManipulator.update]] resets all internal state, excluding the
  * element definitions.
  */
  reset (canvasSizes?: CanvasSizes): void {
    if (typeof canvasSizes === 'undefined') { canvasSizes = {} }
    this.pause()
    const w = canvasSizes.canvasW ?? this.get_width()
    const h = canvasSizes.canvasH ?? this.get_height()
    this.set_width(w)
    this.set_height(h)
    this.frames[0] = new Uint32Array(w * h)
    this.frames[1] = new Uint32Array(w * h)
    this.renderer.reset()
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        this.setPixel({ x, y }, this.defaultId)
      }
    }
    this.update()
  }

  /** pause canvas iterations
  * Sets [[PixelManipulator.mode]] to `"paused"` and cancels the animation frame
  * referenced in [[PixelManipulator.loopint]]
  */
  pause (): void {
    this.mode = 'paused'
    window.cancelAnimationFrame(this.loopint)
  };

  colorToId (colors: Color): number|undefined {
    return this.elements.findIndex(elm => this.compareColors(colors, elm.color))
  };

  idToColor (id: number): Color|undefined {
    return this.elements[id]?.color
  };

  /**
  * @returns the [[ElementData.number]] of the element at a given location
  *
  * \> Keep in mind that [[PixelManipulator.setPixel]] in the current frame can
  * \> effect the result of this function.
  */
  getPixelId ({ x, y, frame, loop }: Location): number {
    const w = this.get_width()
    const h = this.get_height()
    if (loop ?? true) {
      x %= w
      if (x < 0)x += w
      y %= h
      if (y < 0)y += h
    } else if (x < 0 || x >= w || y < 0 || x >= h) {
      return this.defaultId
    }
    return this.frames[frame ?? 0][(w * y) + x]
  }

  /**
  * @returns the [[ElementData.color]] of the element at a given location
  *
  * \> Keep in mind that [[PixelManipulator.setPixel]] in the current frame can
  * \> effect the result of this function.
  */
  getPixel (loc: Location): Color {
    const tmp = this.idToColor(this.getPixelId(loc))
    if (typeof tmp === 'undefined') {
      throw new Error("Can't get pixel color from pixel id in get pixel (should never happen).")
    }
    return tmp
  }

  /**
  * Applies any changes made with [[PixelManipulator.setPixel]] to the canvas
  */
  update (): void {
    this.renderer.update()
  }

  compareColors (a?: number[], b?: number[]): boolean {
    if (typeof a === 'undefined') { a = [] }
    if (typeof b === 'undefined') { b = [] }
    return (a[0] ?? 0) === (b[0] ?? 0) && (a[1] ?? 0) === (b[1] ?? 0) && (a[2] ?? 0) === (b[2] ?? 0) && (a[3] ?? 255) === (b[3] ?? 255)
  };

  /**
  * @returns Does the cell at `x` and `y` position match `ident`?
  *
  * \> Keep in mind that [[PixelManipulator.setPixel]] in the current frame can
  * \> effect the result of this function.
  */
  confirmElm (loc: Location, id: number|string|Color): boolean {
    let tmp: number|undefined
    switch (typeof id) {
      case 'string': tmp = this.nameToId(id); break
      case 'object': tmp = this.colorToId(id); break
      case 'number': tmp = id
    }
    if (tmp == null) {
      throw new Error(`color ${id.toString()} invalid!`)
    }
    return this.getPixelId(loc) === tmp
  }

  /** @param loop - Should this check wrap around canvas edges?
  * @param name - element to look for
  * @returns Number of elements in moore radius */
  mooreNearbyCounter ({ x, y, frame, loop }: Location, name: number|string|Color): number {
    return moore()
      .map(rel => ({ x: x + rel.x, y: y + rel.y, frame, loop }))
      .map(loc => this.confirmElm(loc, name))
      .map(boolToNumber)
      .reduce((a, b) => a + b)
  }

  /** @param loop - Should this check wrap around canvas edges?
  * @param name - element to look for
  * @param bindex - Either a string like `"001"` to match to, or the same encoded as a number.
  * @returns Number of elements in moore radius */
  wolframNearbyCounter ({ x, y, frame, loop }: Location, name: number|string|Color, binDex: number|string): boolean {
    if (typeof binDex === 'string') {
      // Old format was a string of ones and zeros, three long. Use bitshifts to make it better.
      binDex = boolToNumber(binDex[0] === '1') << 2 | boolToNumber(binDex[1] === '1') << 1 | boolToNumber(binDex[2] === '1') << 0
    }
    loop = loop ?? false // one-dimentional detectors by default don't loop around edges
    return wolfram()
      .map(rel => ({ x: x + rel.x, y: y + rel.y, frame, loop }))
      .map(loc => this.confirmElm(loc, name))
      .map((elm, i) => elm === (((binDex as number) & 1 << (2 - i)) > 0))
      .reduce((a, b) => a && b)
  }

  /** Set a pixel in a given location.
  *
  * @param x - X position.
  * @param y - Y position.
  * @param ident - Value to identify the element.
  *
  * - If a string, it assumes it's an element name.
  * - If a number, it assumes it's an element ID
  * - If an array, it assumes it's an 4-long color array.
  *
  * @param loop - Defaults to [[true]]. Wraps `x` and `y` around canvas borders.
  */
  setPixel ({ x, y, loop }: Location, ident: string|number|Color): void {
    let id = 0
    if (typeof ident === 'string') {
      id = this.nameToId(ident)
      if (id === -1) {
        throw new Error(`Element name ${ident} is invalid`)
      }
    } else if (typeof ident === 'number') {
      id = ident
    } else if (typeof ident === 'object') {
      const tmp = this.colorToId(ident)
      if (typeof tmp === 'undefined') {
        throw new Error(`Color ${JSON.stringify(ident)} is invalid`)
      }
      id = tmp
    } else throw new Error(`Color type ${typeof ident} is invalid!`)
    const w = this.get_width()
    const h = this.get_height()
    if (loop ?? true) {
      x %= w
      if (x < 0)x += w
      y %= h
      if (y < 0)y += h
    } else if (x < 0 || x >= w || y < 0 || y >= h) return // if it can't loop, and it's outside of the boundaries, exit
    this.renderer.renderPixel({ x, y }, id)
    this.frames[0][(w * y) + x] = id
  };

  pixelCounts: {
    [index: number]: number
  }={}

  /** A single frame of animation. Media functions pass this into
  * [[requestAnimationFrame]].
  *
  * \> Be careful! Calling this while [[PixelManipulator.mode]] is `"playing"`
  * \> might cause two concurrent calls to this function. If any of your automata
  * \> have "hidden state" - that is they don't represent every detail about
  * \> themselves as data within the pixels - it might cause conflicts. I haven't
  * \> seen any issues caused by this thus far, but it still bears a warning.
  */
  iterate (): void {
    // console.log("iterate");
    this.onIterate()
    for (let frame = this.frames.length - 1; frame >= 0; frame--) {
      if (frame > 0) {
        this.frames[frame].set(this.frames[frame - 1])
      }
    }
    const w = this.get_width()
    const h = this.get_height()
    const typedUpdatedDead = new Array<Uint8Array>(this.elements.length)
    this.pixelCounts = {}
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) { // iterate through x and y
        const currentPixId = this.getPixelId({ x, y, frame: 1 })
        if (currentPixId === this.defaultId) continue
        const elm = this.elements[currentPixId]
        if (elm == null) {
          throw new Error(
            'This isn\'t supposed to happen, but the internal pixel buffer was ' +
            'currupted. This is likely a bug, or a symptom of improper direct ' +
            'access to the current memory buffer'
          )
        }
        if (typeof elm.liveCell === 'function') {
          elm.liveCell({
            x,
            y,
            oldId: currentPixId,
            thisId: currentPixId
          })
        }
        if (typeof this.pixelCounts[currentPixId] === 'undefined') {
          this.pixelCounts[currentPixId] = 1
        } else this.pixelCounts[currentPixId]++
        if (typeof elm.deadCell === 'function') {
          if (typeof typedUpdatedDead[currentPixId] === 'undefined') {
            typedUpdatedDead[currentPixId] = new Uint8Array(Math.ceil((w * h) / 8))
          }
          for (let hi = 0; hi < elm.hitbox.length; hi++) {
            const pixel = elm.hitbox[hi]
            let hbx = (x + pixel.x) % w
            if (hbx < 0) hbx += w
            let hby = (y + pixel.y) % h
            if (hby < 0) hby += h
            const index = Math.floor((w * hby + hbx) / 8)
            const oldValue = typedUpdatedDead[currentPixId][index]
            const bitMask = 1 << (hbx % 8)
            if ((oldValue & bitMask) > 0) { continue }
            // I timed it, and confirmOldElm is slower than all the math above.
            if (!this.confirmElm({ x: hbx, y: hby, frame: 1 }, this.defaultId)) {
              continue
            }
            elm.deadCell({
              x: hbx,
              y: hby,
              oldId: this.defaultId,
              thisId: currentPixId
            })
            typedUpdatedDead[currentPixId][index] = oldValue | bitMask
          }
        }
      }
    }
    this.update()
    this.onAfterIterate()
    if (this.mode === 'playing') {
      this.loopint = window.requestAnimationFrame(() => {
        this.iterate()
      })
    }
  };

  /**
  * A List of [[Uint32Array]]s each the length of width times height of the
  * canvas. Frame 0 is the new frame, frame one is the prior, etc. Each item
  * holds the element id of each element on screen, from left to right, top to
  * bottom.
  */
  frames: Uint32Array[]=[new Uint32Array(0), new Uint32Array(0)]
}// end class PixelManipulator
/** Version of library **for logging purposes only**. Uses semver. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const version = _version as string
/** Licence disclaimer for PixelManipulator */
export const licence = 'PixelManipulator v' + version + ' Copyright (C) ' +
  '2018-2021 Nathan Fritzler\nThis program comes with ABSOLUTELY NO ' +
  'WARRANTY\nThis is free software, and you are welcome to redistribute it\n' +
  'under certain conditions, as according to the GNU GENERAL PUBLIC LICENSE ' +
  'version 3 or later.'
if (typeof window === 'undefined') {
  console.warn(
    'This enviroment has not been tested, and is officially not supported.\n' +
    'Good luck.'
  )
} else console.log(licence)
// This is called a "modeline". It's a (n)vi(m)|ex thing.
// vi: tabstop=2 shiftwidth=2 expandtab
