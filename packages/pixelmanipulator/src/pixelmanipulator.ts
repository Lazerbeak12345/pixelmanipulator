/** This is a cellular automata JavaScript library called PixelManipulator. For
 *  information about how to use this script, see
 *  https://github.com/Lazerbeak12345/pixelmanipulator
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
 *  along with this program.  If not, see http://www.gnu.org/licenses.
 */
import * as package_json from '../package.json'
import type { Hitbox } from './neighborhoods'
import type { Renderer, Location } from './renderers'
import * as _renderers from './renderers'
// export * as neighborhoods from './neighborhoods'
import * as _neighborhoods from './neighborhoods'
export { _neighborhoods as neighborhoods }
export * from './renderers'
function startAnimation(callback: () => void): number | ReturnType<typeof setInterval> {
  if (typeof requestAnimationFrame === 'undefined') {
    const SMALLEST_INTERVAL_POSSIBLE = 1
    return setInterval(callback, SMALLEST_INTERVAL_POSSIBLE)
  } else {
    return requestAnimationFrame(callback)
  }
}
function resumeAnimation(num: ReturnType<typeof startAnimation>, callback: () => void): ReturnType<typeof startAnimation> {
  if (typeof requestAnimationFrame === 'undefined') {
    return num
  } else {
    return requestAnimationFrame(callback)
  }
}
function cancelAnimation(num: ReturnType<typeof startAnimation>): void {
  if (typeof cancelAnimationFrame === 'undefined') {
    clearInterval(num)
  } else if (typeof num === "number") {
    cancelAnimationFrame(num)
  }
}
function boolToNumber(bool: boolean): number {
  const TRUE = 1
  const FALSE = 0
  return bool ? TRUE : FALSE
}
/** The argument to {@link ElementDataUnknown.liveCell} and
* {@link ElementDataUnknown.deadCell}
*/
export interface Rel {
  /** The X location of this pixel. */
  x: number
  /** The Y location of this pixel. */
  y: number
  /** The ID number of the current pixel. Reccommended if performance profiling
  * shows string comparision is a bottleneck.
  */
  oldId: number
  /** The ID of the element for which this is being called. (in a
  * {@link ElementDataUnknown.liveCell} that's the same as {@link Rel.oldId}, but in a
  * {@link ElementDataUnknown.deadCell} it's the id that the deadCell belongs to.
  */
  thisId: number
}
/** Much like {@link ElementDataUnknown} but all fields except {@link ElementData.madeWithRule},
* {@link ElementData.liveCell} and {@link ElementData.deadCell} are mandatory. */
export interface ElementData<T> extends ElementDataUnknownNameMandatory<T> {
  renderAs: T
  hitbox: Hitbox
}
/** Information about an element. */
export interface ElementDataUnknown<T> {
  /** The name of the element. */
  name?: string
  /** Information on how to render this element */
  renderAs?: T
  /** {@link ElementDataUnknown.deadCell} will only be called on empty
  * pixels within the hitbox of a live cell. Array of relative coordinate pairs.
  * Optional, defaults to the result of {@link neighborhoods.moore}
  * called with no arguments.
  */
  hitbox?: Hitbox
  /** Every frame of animation, pixelmanipulator iterates through each and every pixel on the screen. If this element is found, it calls this function.
  */
  liveCell?: (rel: Rel) => void
  /** Every frame of animation, pixelmanipulator iterates through each and every
  * pixel on the screen. If this element is found, it calls this function on
  * each of the locations defined in {@link ElementDataUnknown.hitbox} so long as
  * the pixel matches the value in {@link PixelManipulator.defaultId}, without
  * calling the same dead pixel twice.
  */
  deadCell?: (rel: Rel) => void
  /** If present, indicates that this element was auto-generated */
  madeWithRule?: true
}
/** Much like {@link ElementDataUnknown} but the name is mandatory. */
export interface ElementDataUnknownNameMandatory<T> extends ElementDataUnknown<T> {
  name: string
}
function _convertNumListToBf(nl: string): number {
  // While I used to use string with each digit in it, I found that since
  // there are 0-8, I could use a 9bit field (remember: off by one)
  let out = 0
  for (const item of nl) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- largest binary digit
    out |= 1 << parseInt(item)
  }
  return out
}
/** Template generators for your elements. */
export const rules = {
  /** Generates elements like conway's game of life.
  * @param p - `lifelike` needs to be able to call {@link PixelManipulator.mooreNearbyCounter}
  * @param pattern - The B/S syntax indicator of on how many cells of the same
  * type in the moore radius around each pixel should survive, and on how many
  * should be born.
  * @param loop - Should this loop around screen edges? (Passed to {@link renderers.Location.loop})
  */
  lifelike: function <T>(p: PixelManipulator<T>, pattern: string, loop?: boolean): ElementDataUnknown<T> {
    const numbers = pattern.split(/\/?[a-z]/gi)// "B",born,die
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- after the pattern
    const bfdie = _convertNumListToBf(numbers[2])
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- before the pattern
    const bflive = _convertNumListToBf(numbers[1])
    const SMALLEST_BINARY_DIGIT = 1
    const PREV_FRAME = 1
    const NO_MATCH = 0
    return {
      madeWithRule: true,
      hitbox: _neighborhoods.moore(),
      liveCell: function llive({ x, y, thisId }) {
        // if any match (of how many moore are nearby) is found, it dies
        if ((bfdie & SMALLEST_BINARY_DIGIT << p.mooreNearbyCounter({ x, y, frame: PREV_FRAME, loop }, thisId)) === NO_MATCH) {
          p.setPixel({ x, y }, p.defaultId)
        }
      },
      deadCell: function ldead({ x, y, thisId }) {
        // if any match (of how many moore are nearby) is found, it lives
        if ((bflive & SMALLEST_BINARY_DIGIT << p.mooreNearbyCounter({ x, y, frame: PREV_FRAME, loop }, thisId)) !== NO_MATCH) {
          p.setPixel({ x, y }, thisId)
        }
      }
    }
  },
  /** Generates fundamental cellular automata
  * @param p - `wolfram` needs to be able to call {@link PixelManipulator.wolframNearbyCounter}
  * @param pattern - The Rule num syntax, where the 8-bit number is translated
  * into a binary list, each where the inverted 3-binary-digit index represents
  * the state of cells in the row above. On a match, the cell becomes the state
  * specified in the initial 8-bit number.
  * @param loop - Should this loop around screen edges? (Passed to {@link PixelManipulator.wolframNearby})
  */
  wolfram: function <T>(p: PixelManipulator<T>, pattern: string, loop?: boolean): ElementDataUnknown<T> {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- after the pattern
    const binStates = parseInt(pattern.split(/Rule /gi)[1])
    const FIRST_ROW = 0
    const PREV_FRAME = 1
    return {
      madeWithRule: true,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default values
      hitbox: _neighborhoods.wolfram(1, 1),
      // The current state is used as the index in the binstates, as binstates is a bit array of every state
      liveCell: function wlive({ x, y, thisId }) {
        if (y === FIRST_ROW) return
        if (!p.wolframNewState({ x, y, frame: PREV_FRAME, loop }, binStates, thisId)) {
          p.setPixel({ x, y, loop }, p.defaultId)
        }
      },
      deadCell: function wdead({ x, y, thisId }) {
        if (p.wolframNewState({ x, y, frame: PREV_FRAME, loop }, binStates, thisId)) {
          p.setPixel({ x, y, loop }, thisId)
        }
      }
    }
  }
}
/** Sizes to set the canvases to. If a value below is absent, old value is used.
*/
export interface CanvasSizes {
  /** width of the canvas */
  canvasW?: number
  /** height of the canvas */
  canvasH?: number
}
/** A cellular automata engine */
export class PixelManipulator<T> {
  /**
  * @param renderer - The target to render things to.
  * @param width - How wide should the initial target be?
  * @param height - How tall should the initial target be?
  */
  constructor(renderer: Renderer<T>, width: number, height: number) {
    if (typeof window !== 'undefined') console.log(licence)
    this.renderer = renderer
    this.defaultId = this.addElement({
      renderAs: this.renderer.defaultRenderAs,
      hitbox: [],
      name: 'blank'
    })
    this.reset({ canvasW: width, canvasH: height })
  }

  /** An instanace of the object that shows the state to the user. */
  renderer: Renderer<T>
  /**
  * This is the number that indicates what animation frame the iterate function
  * is being called with.
  *
  * You can use this to mannually stop the iterations like so:
  * `cancelAnimationFrame(this.loopint)` (not reccommended)
  */
  loopint: ReturnType<typeof startAnimation> = 0 // eslint-disable-line @typescript-eslint/no-magic-numbers -- default value
  /**
  * A low-level listing of the availiable elements.
  *
  * Format is much like the argument to
  * {@link PixelManipulator.addMultipleElements}, but is not sanitized.
  */
  readonly elements: Array<ElementData<T>> = []

  /**
  * A mapping from old names for elements to new names for elements.
  *
  * Allows a user to modify the name of an element at runtime.
  */
  nameAliases = new Map<string, string>()
  /**
  * A string indicating weather it is currently animating or not.
  *
  * It is `"playing"` if it is currently animating, or `"paused"` if not
  * currently animating.
  *
  * This has been around since early version 0, and once was the `innerText`
  * value of a pause/play button!
  */
  mode: 'playing' | 'paused' = 'paused'
  /**
  * The elm that pixelmanipulator will fill the screen with upon initialization,
  * and what elements should return to when they are "dead". Default value is
  * 0, an element with the color `#000F`
  *
  * If you update this, be sure to update {@link renderers.Renderer.defaultRenderAs} in {@link PixelManipulator.renderer}
  */
  defaultId: number
  /** Called before {@link PixelManipulator.iterate} does its work.
  * @returns false to postposne iteration.
  */
  onIterate: () => (boolean | undefined) = () => undefined // eslint-disable-line @typescript-eslint/class-methods-use-this -- event handler
  /** Called after {@link PixelManipulator.iterate} does its work. */
  onAfterIterate: () => undefined = () => undefined // eslint-disable-line @typescript-eslint/class-methods-use-this -- event handler

  /** Gets called after a call to {@link PixelManipulator.modifyElement}. The ID is
  * passed as the only argument.
  * @param id - The element that was modified.
  */
  onElementModified: (id: number) => void = () => undefined // eslint-disable-line @typescript-eslint/class-methods-use-this -- event handler
  /** @returns the width of the canvas */
  get_width(): number {
    return this.renderer.get_width()
  }

  /** @param value - The new width of the canvas */
  set_width(value: number): void {
    this.renderer.set_width(value)
  }

  /** @returns the height of the canvas */
  get_height(): number {
    return this.renderer.get_height()
  }

  /** @param value - The new height of the canvas */
  set_height(value: number): void {
    this.renderer.set_height(value)
  }

  /** fills the screen with value, at an optional given percent
  * @param value - The element to put on the screen
  * @param pr - The percent as a number from 1 to 100, defaulting at 15
  */
  randomlyFill(value: string | number, pr?: number): void {
    const DEFAULT_PERCENT = 15
    const MAX_PERCENT = 100
    pr ??= DEFAULT_PERCENT
    const w = this.get_width()
    const h = this.get_height()
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) { // iterate through x and y
        if (Math.random() * MAX_PERCENT < pr) { this.setPixel({ x, y }, value) }
      }
    }
  }

  /** Adds multiple elements.
  *
  * @param elements - Index is the element name, value is the element data (and
  * does not require the name). Value is passed to
  * {@link PixelManipulator.addElement}
  */
  addMultipleElements(elements: Record<string, ElementDataUnknown<T>>): void {
    Object.keys(elements).forEach(name =>
      this.addElement({ name, ...elements[name] })
    )
  }

  /** Add an element with the given element data
  * @param data - The details about the element.
  * @returns The generated {@link PixelManipulator.elements} index
  */
  addElement(
    data: ElementDataUnknownNameMandatory<T>
  ): number { // adds a single element
    const { name, renderAs } = data
    if (typeof name === 'undefined') throw new Error('Name is required for element')
    if (typeof data.name === 'undefined') data.name = name
    // @ts-expect-error renderAs might be undefined here, but it's fixed in the call to this.modifyElement below
    this.elements.push({ name, renderAs })
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- last item in list
    this.modifyElement(this.elements.length - 1, data)
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- last item in list (might not be the same as before modifyElement was called)
    return this.elements.length - 1
  }

  /**
  * @param id - How to identify what element to modify.
  * @param data - Values to apply to the pre-existing element.
  *
  * Automatically calls {@link PixelManipulator.aliasElements} if
  * {@link ElementDataUnknown.name} is present in `data`
  */
  modifyElement(id: number, data: ElementDataUnknown<T>): void {
    const oldData: Omit<ElementData<T>, "hitbox"> | ElementData<T> = this.elements[id]
    if (typeof data.name !== 'undefined' && data.name !== oldData.name) {
      this.aliasElements(oldData.name, data.name)
    }
    const newData = {
      hitbox: _neighborhoods.moore(),
      ...oldData,
      ...data,
    }
    newData.renderAs = this.renderer.modifyElement(id, newData.renderAs)
    this.elements[id] = newData
    this.onElementModified(id)
  }

  /**
  * @param oldName - The old {@link ElementData.name}
  * @param newName - The new {@link ElementData.name}
  *
  * Adds the name to {@link PixelManipulator.nameAliases}, and ensures no alias
  * loops are present.
  */
  aliasElements(oldName: string, newName: string): void {
    // Intentionally ignores aliases when checking for duplicate name.
    if (this.elements.find(elm => elm.name === newName) != null) {
      throw new Error('The name ' + newName + ' is already in use!')
    }
    this.nameAliases.delete(newName)
    this.nameAliases.set(oldName, newName)
  }

  /** Respecting aliases, convert an element name into its number.
  * @param name - name of element
  * @returns The number of the element
  */
  nameToId(name: string): number {
    let unaliased: string | undefined = name
    while (typeof unaliased !== 'undefined') {
      name = unaliased
      unaliased = this.nameAliases.get(name)
    }
    return this.elements.findIndex(elm => elm.name === name)
  }

  /**
  * @param name - Name of the (possibly aliased) element.
  * @returns The element from {@link PixelManipulator.elements}, respecting
  * aliases in {@link PixelManipulator.nameAliases}, or {@link undefined} if not found.
  */
  getElementByName(name: string): ElementData<T> | undefined {
    return this.elements[this.nameToId(name)]
  }

  /**
  * @param loc - Location of the element.
  * @returns Name of element at passed-in location. See {@link ElementData.name}
  */
  whatIs(loc: Location): string {
    return this.elements[this.getPixelId(loc)].name
  }

  /** Start iterations on all of the elements on the canvas.
  * Sets {@link PixelManipulator.mode} to `"playing"`, and requests a new animation
  * frame, saving it in {@link PixelManipulator.loopint}.
  *
  * @param canvasSizes - If {@link PixelManipulator.mode} is already `"playing"` then
  * canvasSizes is passed to {@link PixelManipulator.reset}. Otherwise reset is not
  * called.
  */
  play(canvasSizes?: CanvasSizes): void {
    if (this.mode === 'playing') this.reset(canvasSizes)
    this.mode = 'playing'
    this.loopint = startAnimation(() => {
      this.iterate()
    })
  }

  /** Reset, resize and initialize the canvas(es).
  * Calls {@link PixelManipulator.pause} then
  * {@link PixelManipulator.update}. Resets all internal state, excluding the
  * element definitions.
  *
  * @param canvasSizes - Allows one to change the size of the canvases during
  * the reset.
  */
  reset(canvasSizes?: CanvasSizes): void {
    const CURRENT_FRAME = 0
    const NEXT_FRAME = 1
    const MAX_PERCENT = 100
    if (typeof canvasSizes === 'undefined') { canvasSizes = {} }
    this.pause()
    const w = canvasSizes.canvasW ?? this.get_width()
    const h = canvasSizes.canvasH ?? this.get_height()
    this.set_width(w)
    this.set_height(h)
    this.frames[CURRENT_FRAME] = new Uint32Array(w * h)
    this.frames[NEXT_FRAME] = new Uint32Array(w * h)
    this.renderer.reset()
    this.randomlyFill(this.defaultId, MAX_PERCENT)
    this.update()
  }

  /** pause canvas iterations
  * Sets {@link PixelManipulator.mode} to `"paused"` and cancels the animation frame
  * referenced in {@link PixelManipulator.loopint}
  */
  pause(): void {
    this.mode = 'paused'
    cancelAnimation(this.loopint)
  }

  /**
  * @param loc - Location of the pixel (could be out of bounds).
  * @returns null if out-of-bounds when loop setting is false, or the location (loop set to false).
  */
  locationBoundsCheck(loc: Location): null | Location { // eslint-disable-line complexity -- close enough for me tbh
    const LEFTMOST = 0
    const TOPMOST = 0

    const w = this.get_width()
    const h = this.get_height()

    const overflowLeft = loc.x < LEFTMOST
    const overflowRight = loc.x >= w
    const overflowTop = loc.y < TOPMOST
    const overflowBottom = loc.y >= h

    if (loc.loop ?? true) {
      loc.x %= w
      loc.y %= h

      if (overflowLeft) loc.x += w
      if (overflowTop) loc.y += h

      loc.loop = false
    } else if (overflowLeft || overflowRight || overflowTop || overflowBottom) {
      return null
    }
    return loc
  }

  /**
  * @param loc - Location of the pixel
  * @returns the element id at a given location
  */
  getPixelId(loc: Location): number {
    const fixedLoc = this.locationBoundsCheck(loc)
    if (fixedLoc == null) return this.defaultId
    const w = this.get_width()
    const CURRENT_FRAME = 0 // TODO: dedupe this const
    return this.frames[fixedLoc.frame ?? CURRENT_FRAME][_renderers.location2Index(fixedLoc, w)]
  }

  /**
  * Applies any changes made with {@link renderers.Renderer.renderPixel} on {@link PixelManipulator.renderer} to the canvas
  */
  update(): void {
    this.renderer.update()
  }

  /**
  * @param loc - Where to confirm the element
  * @param id - The elm you expect it to be
  * @returns Does the cell at `loc` match `ident`?
  */
  confirmElm(loc: Location, id: number | string): boolean {
    return this.getPixelId(loc) === (typeof id === 'string' ? this.nameToId(id) : id)
  }

  /** Calculate the total number of elements within an area
  * @param area - The locations to total up.
  * @param search - The element to look for
  * @returns The total
  */
  totalWithin(area: Location[], search: number | string): number {
    return area
      .filter(loc => this.confirmElm(loc, search))
      .length
  }

  private static readonly _moore = _neighborhoods.moore()
  /** @param name - element to look for
  * @param center - location of the center of the moore area
  * @returns Number of matching elements in moore radius */
  mooreNearbyCounter(center: Location, search: number | string): number {
    return this.totalWithin(_renderers.transposeLocations(PixelManipulator._moore, center), search)
  }

  /** @param area - The Area to search within
  * @param ruleNum - A bitfield of what states a pixel should live or die on.
  * @param search - The element to search for
  * @see {@link PixelManipulator.wolframNewState} for higher-level tool
  * @see {@link PixelManipulator.fundamentalStatesWithin} for lower-level tool
  * @returns The state that the bitfied says this pixel should be in the next frame.
  */
  fundamentalNewState(area: Location[], ruleNum: number, search: number | string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 1 is largest binary digit, nonzero if matches
    return (ruleNum & 1 << this.fundamentalStatesWithin(area, search)) !== 0
  }

  /** @param area - Locations to look at.
  * @param search - Locations to mark as a true bit.
  * @see {@link PixelManipulator.fundamentalNewState} for higher-level tool
  * @returns number as a bitfied array, in order of the items in area, from left to right.
  *
  * That means that `(fundamentalStatesWithin([loc], search) & 1) === boolToNumber(confirmElm(loc, search))`
  *
  * You may want to see [this page](https://www.wolframscience.com/nks/notes-5-2--general-rules-for-multidimensional-cellular-automata/)
  * for more details on how this might be used.
  */
  fundamentalStatesWithin(area: Location[], search: number | string): number {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 1 is the SMALLEST_BINARY_DIGIT
    return area.map(loc => boolToNumber(this.confirmElm(loc, search))).reduce((res, x) => res << 1 | x)
  }

  private static readonly _wolfram = _neighborhoods.wolfram()

  /** @param loc - The pixel to change. (Defaults {@link renderers.Location.loop} to false)
  * @param ruleNum - A bitfield of what states a pixel should live or die on.
  * @param search - The element to search for
  * @see {@link PixelManipulator.fundamentalNewState} for more general tool.
  * @returns The state that the bitfied says this pixel should be in the next frame.
  */
  wolframNewState(loc: Location, ruleNum: number, search: number | string): boolean {
    // one-dimentional detectors by default don't loop around edges
    loc.loop ??= false
    return this.fundamentalNewState(
      _renderers.transposeLocations(PixelManipulator._wolfram, loc),
      ruleNum,
      search
    )
  }

  /**
  * @param current - "Current" pixel location. (Defaults {@link renderers.Location.loop} to false)
  * @param search - element to look for
  * @see {@link PixelManipulator.fundamentalStatesWithin} for lower-level tool
  * @returns Number used as bit area to indicate occupied cells
  */
  wolframNearby(current: Location, search: number | string): number {
    // one-dimentional detectors by default don't loop around edges
    current.loop ??= false
    return this.fundamentalStatesWithin(
      _renderers.transposeLocations(PixelManipulator._wolfram, current),
      search
    )
  }

  /** Counter tool used in slower wolfram algorithim.
  * @deprecated Replaced with {@link PixelManipulator.wolframNearby} for use in faster
  * algorithms
  * @param current - "Current" pixel location
  * @param name - element to look for
  * @param bindex - Either a string like `"001"` to match to, or the same
  * encoded as a number.
  * @returns Number of elements in wolfram radius */
  wolframNearbyCounter(current: Location, name: number | string, binDex: number | string): boolean {
    if (typeof binDex === 'string') {
      // Old format was a string of ones and zeros, three long.
      binDex = parseInt(binDex, 2)
    }
    return this.wolframNearby(current, name) === binDex
  }

  /** Set a pixel in a given location.
  *
  * @param x - X position.
  * @param y - Y position.
  * @param ident - Value to identify the element.
  *
  * - If a string, it assumes it's an element name.
  * - If a number, it assumes it's an element ID
  *
  * @param loop - Defaults to {@link true}. Wraps `x` and `y` around canvas borders.
  */
  setPixel(loc: Location, ident: string | number): void {
    const NOT_FOUND = -1
    let id = 0
    if (typeof ident === 'string') {
      id = this.nameToId(ident)
      if (id === NOT_FOUND) {
        throw new Error(`Element name ${ident} is invalid`)
      }
    } else {
      id = ident
    }
    const fixedLoc = this.locationBoundsCheck(loc)
    if (fixedLoc == null) return
    this.renderer.renderPixel(fixedLoc, id)
    const w = this.get_width()
    const CURRENT_FRAME = 0
    this.frames[CURRENT_FRAME][_renderers.location2Index(fixedLoc, w)] = id
  }

  /** Number of pixels per element in the last frame */
  pixelCounts: Record<number, number> = {}

  /** A single frame of animation. Media functions pass this into
  * {@link requestAnimationFrame}.
  *
  * Be careful! Calling this while {@link PixelManipulator.mode} is `"playing"`
  * might cause two concurrent calls to this function. If any of your automata
  * have "hidden state" - that is they don't represent every detail about
  * themselves as data within the pixels - it might cause conflicts.
  */
  iterate(): void { // eslint-disable-line complexity -- TODO: break this down a bit
    if (this.onIterate() ?? true) {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- last item in list
      for (let frame = this.frames.length - 1; frame >= 0; frame--) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- nonzero
        if (frame > 0) {
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- next is minus one
          const nextFrame = frame - 1
          this.frames[frame].set(this.frames[nextFrame])
        }
      }
      const w = this.get_width()
      const h = this.get_height()
      const typedUpdatedDead = new Array<Uint8Array>(this.elements.length)
      this.pixelCounts = {}
      const NEXT_FRAME = 1
      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) { // iterate through x and y
          const currentPixId = this.getPixelId({ x, y, frame: NEXT_FRAME })
          if (currentPixId === this.defaultId) continue
          const { elements: { [currentPixId]: elm } } = this
          if (typeof elm === "undefined") {
            throw new Error(
              'This isn\'t supposed to happen, but the internal pixel buffer was ' +
              'currupted. This is likely a bug, or a symptom of improper direct ' +
              'access to the current memory buffer'
            )
          }
          if (typeof elm.liveCell !== "undefined") {
            elm.liveCell({
              x,
              y,
              oldId: currentPixId,
              thisId: currentPixId
            })
          }
          if (typeof this.pixelCounts[currentPixId] === "undefined") {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- starting at 1
            this.pixelCounts[currentPixId] = 1
          } else this.pixelCounts[currentPixId]++
          if (typeof elm.deadCell !== "undefined") {
            const UPDATED_SIZE = 8 // TODO: this is a guess. document this better, or rewrite this.
            typedUpdatedDead[currentPixId] ??= new Uint8Array(Math.ceil((w * h) / UPDATED_SIZE));
            elm.hitbox.forEach(pixel => {
              // We are looping, so it can't be null. Eslint doesn't like non-null assertions, so we must do this.
              const hblocStupidFallback: Location = {
                x: x + pixel.x,
                y: y + pixel.y
              }
              const hbLoc: Location = this.locationBoundsCheck(hblocStupidFallback) ?? hblocStupidFallback;
              const index = Math.floor(_renderers.location2Index(hbLoc, w) / UPDATED_SIZE)
              const { [currentPixId]: { [index]: oldValue } } = typedUpdatedDead
              // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- SMALLEST_BINARY_DIGIT
              const bitMask = 1 << (hbLoc.x % UPDATED_SIZE)
              // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- compare to zero
              if ((oldValue & bitMask) !== 0) { return }
              // I timed it, and confirmOldElm is slower than all the math above.
              if (!this.confirmElm({ x: hbLoc.x, y: hbLoc.y, frame: NEXT_FRAME }, this.defaultId)) {
                return
              }
              if (typeof elm.deadCell !== "undefined") {
                elm.deadCell({
                  x: hbLoc.x,
                  y: hbLoc.y,
                  oldId: this.defaultId,
                  thisId: currentPixId
                })
              }
              typedUpdatedDead[currentPixId][index] = oldValue | bitMask
            })
          }
        }
      }
      this.update()
      this.onAfterIterate()
    }
    if (this.mode === 'playing') {
      this.loopint = resumeAnimation(this.loopint, () => {
        this.iterate()
      })
    }
  }

  /**
  * A List of {@link Uint32Array}s each the length of width times height of the
  * canvas. Frame 0 is the new frame, frame one is the prior, etc. Each item
  * holds the element id of each element on screen, from left to right, top to
  * bottom.
  */
  frames: Uint32Array[] = [new Uint32Array(0), new Uint32Array(0)] // eslint-disable-line @typescript-eslint/no-magic-numbers -- default values
}// end class PixelManipulator
/** Version of library **for logging purposes only**. Uses semver. */
export const { version } = package_json
/** Licence disclaimer for PixelManipulator */
export const licence = 'PixelManipulator v' + version + ' Copyright (C) ' +
  '2018-2024 Nathan Fritzler\nThis program comes with ABSOLUTELY NO ' +
  'WARRANTY\nThis is free software, and you are welcome to redistribute it\n' +
  'under certain conditions, as according to the GNU GENERAL PUBLIC LICENSE ' +
  'version 3 or later.'
// This is called a "modeline". It's a (n)vi(m)|ex thing.
// vi: tabstop=2 shiftwidth=2 expandtab
