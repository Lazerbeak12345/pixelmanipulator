/**
 * This is a cellular automata JavaScript library called PixelManipulator. For
 *  information about how to use this script, see
 *  https://github.com/Lazerbeak12345/pixelmanipulator
 *
 *  Copyright (C) 2018-2022  Nathan Fritzler
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
import { Hitbox, moore, wolfram } from './neighborhoods'
import { Renderer, Location, location2Index } from './renderers'
// export * as neighborhoods from './neighborhoods'
import * as _neighborhoods from './neighborhoods'
export { _neighborhoods as neighborhoods }
function startAnimation (callback: () => void): number {
  if (typeof requestAnimationFrame === 'undefined') {
    return window.setInterval(callback, 1)
  } else {
    return requestAnimationFrame(callback)
  }
}
function resumeAnimation (num: number, callback: () => void): number {
  if (typeof requestAnimationFrame === 'undefined') {
    return num
  } else {
    return requestAnimationFrame(callback)
  }
}
function cancelAnimation (num: number): void {
  if (typeof cancelAnimationFrame === 'undefined') {
    clearInterval(num)
  } else {
    cancelAnimationFrame(num)
  }
}
function boolToNumber (bool: boolean): number {
  return bool ? 1 : 0
}
/** The argument to [[ElementDataUnknown.liveCell]] and
* [[ElementDataUnknown.deadCell]]
*/
export interface Rel{
  /** The X location of this pixel. */
  x: number
  /** The Y location of this pixel. */
  y: number
  /** The ID number of the current pixel. Reccommended if performance profiling
  * shows string comparision is a bottleneck.
  */
  oldId: number
  /** The ID of the element for which this is being called. (in a
  * [[ElementDataUnknown.liveCell]] that's the same as [[Rel.oldId]], but in a
  * [[ElementDataUnknown.deadCell]] it's the id that the deadCell belongs to.
  */
  thisId: number
}
/** Much like [[ElementDataUnknown]] but all fields except [[ElementData.loop]],
* [[ElementData.liveCell]] and [[ElementData.liveCell]] are mandatory. */
export interface ElementData<T> extends ElementDataUnknownNameMandatory<T> {
  renderAs: T
  hitbox: Hitbox
}
/** Information about an element. */
export interface ElementDataUnknown<T>{
  /** The name of the element. */
  name?: string
  /** Information on how to render this element */
  renderAs?: T
  /** [[ElementDataUnknown.deadCell]] will only be called on empty
  * pixels within the hitbox of a live cell. Array of relative coordinate pairs.
  * Optional, defaults to the result of [[PixelManipulator.neighborhoods.moore]]
  * called with no arguments.
  */
  hitbox?: Hitbox
  /** Every frame of animation, pixelmanipulator iterates through each and every pixel on the screen. If this element is found, it calls this function.
  */
  liveCell?: (rel: Rel) => void
  /** Every frame of animation, pixelmanipulator iterates through each and every
  * pixel on the screen. If this element is found, it calls this function on
  * each of the locations defined in [[ElementDataUnknown.hitbox]] so long as
  * the pixel matches the value in [[PixelManipulator.defaultId]], without
  * calling the same dead pixel twice.
  */
  deadCell?: (rel: Rel) => void
  /** If present, indicates that this element was auto-generated */
  madeWithRule?: true
}
/** Much like [[ElementDataUnknown]] but the name is mandatory. */
export interface ElementDataUnknownNameMandatory<T> extends ElementDataUnknown<T>{
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
/** Template generators for your elements. */
export const rules = {
  /** Generates elements like conway's game of life.
  * @param p - `lifelike` needs to be able to call [[PixelManipulator.mooreNearbyCounter]]
  * @param pattern - The B/S syntax indicator of on how many cells of the same
  * type in the moore radius around each pixel should survive, and on how many
  * should be born.
  * @param loop - Should this loop around screen edges? (Passed to [[Location.loop]])
  */
  lifelike: function<T> (p: PixelManipulator<T>, pattern: string, loop?: boolean): ElementDataUnknown<T> {
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
  /** Generates fundamental cellular automata
  * @param p - `wolfram` needs to be able to call [[PixelManipulator.wolframNearbyCounter]]
  * @param pattern - The Rule num syntax, where the 8-bit number is translated
  * into a binary list, each where the inverted 3-binary-digit index represents
  * the state of cells in the row above. On a match, the cell becomes the state
  * specified in the initial 8-bit number.
  * @param loop - Should this loop around screen edges? (Passed to [[Location.loop]])
  */
  wolfram: function<T> (p: PixelManipulator<T>, pattern: string, loop?: boolean): ElementDataUnknown<T> {
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
export * from './renderers'
/** A cellular automata engine */
export class PixelManipulator<T> {
  /**
  * @param renderer - The target to render things to.
  * @param width - How wide should the initial target be?
  * @param height - How tall should the initial target be?
  */
  constructor (renderer: Renderer<T>, width: number, height: number) {
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
  * > You can use this to mannually stop the iterations like so:
  * > `cancelAnimationFrame(this.loopint)` (not reccommended)
  */
  loopint=0
  /**
  * A low-level listing of the availiable elements.
  *
  * Format is much like the argument to
  * [[PixelManipulator.addMultipleElements]], but is not sanitized.
  */
  readonly elements: Array<ElementData<T>>= []

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
  * > This has been around since early version 0, and once was the `innerText`
  * > value of a pause/play button!
  */
  mode: 'playing'|'paused'='paused'
  /**
  * The elm that pixelmanipulator will fill the screen with upon initialization,
  * and what elements should return to when they are "dead". Default value is
  * 0, an element with the color `#000F`
  *
  * If you update this, be sure to update [[PixelManipulator.renderer.defaultRenderAs]]
  */
  defaultId: number
  /** Called before [[PixelManipulator.iterate]] does its work. */
  onIterate: () => void=() => {}
  /** Called after [[PixelManipulator.iterate]] does its work. */
  onAfterIterate: () => void=function () {}

  /** Gets called after a call to [[PixelManipulator.modifyElement]]. The ID is
  * passed as the only argument.
  * @param id - The element that was modified.
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

  /** fills the screen with value, at an optional given percent
  * @param value - The element to put on the screen
  * @param pr - The percent as a number from 1 to 100, defaulting at 15
  */
  randomlyFill (value: string|number, pr?: number): void {
    pr = pr ?? 15
    const w = this.get_width()
    const h = this.get_height()
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) { // iterate through x and y
        if (Math.random() * 100 < pr) { this.setPixel({ x, y }, value) }
      }
    }
  }

  /** Adds multiple elements.
  *
  * @param elements - Index is the element name, value is the element data (and
  * does not require the name). Value is passed to
  * [[PixelManipulator.addElement]]
  */
  addMultipleElements (elements: {[index: string]: ElementDataUnknown<T>}): void {
    for (const elm in elements) {
      elements[elm].name = elm
      this.addElement(elements[elm] as ElementDataUnknownNameMandatory<T>)
    }
  }

  /** Add an element with the given element data
  * @param data - The details about the element.
  * @returns The generated [[ElementData.number]]
  */
  addElement (
    data: ElementDataUnknownNameMandatory<T>
  ): number { // adds a single element
    const elm = data.name// name of the element
    if (typeof elm === 'undefined') throw new Error('Name is required for element')
    if (typeof data.name === 'undefined') data.name = elm
    // Must be this value exactly for modifyElement to work
    const tmpData: ElementDataUnknown<T> = {
      name: elm,
      renderAs: data.renderAs
    }
    this.elements.push(tmpData as ElementData<T>)
    this.modifyElement(this.elements.length - 1, data as ElementDataUnknown<T>)
    return this.elements.length - 1
  }

  /**
  * @param id - How to identify what element to modify.
  * @param data - Values to apply to the pre-existing element.
  *
  * Automatically calls [[PixelManipulator.aliasElements]] if
  * [[ElementDataUnknown.name]] is present in `data`
  */
  modifyElement (id: number, data: ElementDataUnknown<T>): void {
    const oldData = this.elements[id]
    if (typeof data.name !== 'undefined' && data.name !== oldData.name) {
      this.aliasElements(oldData.name, data.name)
    }
    oldData.name = data.name ?? oldData.name
    oldData.renderAs = this.renderer.modifyElement(id, data.renderAs ?? oldData.renderAs)
    oldData.hitbox = data.hitbox ?? oldData.hitbox
    if (oldData.hitbox == null) {
      oldData.hitbox = moore()
    }
    oldData.liveCell = data.liveCell ?? oldData.liveCell
    oldData.deadCell = data.deadCell ?? oldData.deadCell
    oldData.madeWithRule = data.madeWithRule ?? oldData.madeWithRule
    this.elements[id] = oldData
    this.onElementModified(id)
  }

  /**
  * @param oldName - The old [[ElementData.name]]
  * @param newName - The new [[ElementData.name]]
  *
  * Adds the name to [[PixelManipulator.nameAliases]], and ensures no alias
  * loops are present.
  */
  aliasElements (oldName: string, newName: string): void {
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
  getElementByName (name: string): ElementData<T>|undefined {
    return this.elements[this.nameToId(name)]
  }

  /**
  * @param loc - Location of the element.
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
    this.loopint = startAnimation(() => {
      this.iterate()
    })
  }

  /** Reset, resize and initialize the canvas(es).
  * Calls [[PixelManipulator.pause]] [[PixelManipulator.updateData]]
  * [[PixelManipulator.update]] resets all internal state, excluding the
  * element definitions.
  *
  * @param canvasSizes - Allows one to change the size of the canvases during
  * the reset.
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
    cancelAnimation(this.loopint)
  }

  /**
  * @param x - x position
  * @param y - y position
  * @param frame - What frame should we grab it from? (default 0)
  * @param loop - should it loop around edges? (default true)
  * @returns the element id at a given location
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
    return this.frames[frame ?? 0][location2Index({ x, y }, w)]
  }

  /**
  * Applies any changes made with [[PixelManipulator.renderPixel]] to the canvas
  */
  update (): void {
    this.renderer.update()
  }

  /**
  * @param loc - Where to confirm the element
  * @param id - The elm you expect it to be
  * @returns Does the cell at `loc` match `ident`?
  */
  confirmElm (loc: Location, id: number|string): boolean {
    let tmp: number|undefined
    if (typeof id === 'string') {
      tmp = this.nameToId(id)
    } else {
      tmp = id
    }
    if (tmp == null) {
      throw new Error(`color ${id.toString()} invalid!`)
    }
    return this.getPixelId(loc) === tmp
  }

  /** @param name - element to look for
  * @param x - x location of center of moore area
  * @param y - y location of center of moore area
  * @param frame - What frame to grab it from. (default 0, reccomended 1)
  * @param loop - Should it loop around canvas edges while counting?
  * @returns Number of matching elements in moore radius */
  mooreNearbyCounter ({ x, y, frame, loop }: Location, name: number|string): number {
    return moore()
      .map(rel => ({ x: x + rel.x, y: y + rel.y, frame, loop }))
      .map(loc => this.confirmElm(loc, name))
      .map(boolToNumber)
      .reduce((a, b) => a + b)
  }

  /**
  * @param x - "Current" pixel x location
  * @param y - "Current" pixel y location
  * @param frame - What frame to measure on? (default 0, reccomended 1)
  * @param loop - Should this loop around edges when checking?
  * @param name - element to look for
  * @param bindex - Either a string like `"001"` to match to, or the same
  * encoded as a number.
  * @returns Number of elements in moore radius */
  wolframNearbyCounter ({ x, y, frame, loop }: Location, name: number|string, binDex: number|string): boolean {
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
  *
  * @param loop - Defaults to [[true]]. Wraps `x` and `y` around canvas borders.
  */
  setPixel ({ x, y, loop }: Location, ident: string|number): void {
    let id = 0
    if (typeof ident === 'string') {
      id = this.nameToId(ident)
      if (id === -1) {
        throw new Error(`Element name ${ident} is invalid`)
      }
    } else {
      id = ident
    }
    const w = this.get_width()
    const h = this.get_height()
    if (loop ?? true) {
      x %= w
      if (x < 0)x += w
      y %= h
      if (y < 0)y += h
    } else if (x < 0 || x >= w || y < 0 || y >= h) return // if it can't loop, and it's outside of the boundaries, exit
    this.renderer.renderPixel({ x, y }, id)
    this.frames[0][location2Index({ x, y }, w)] = id
  }

  /** Number of pixels per element in the last frame */
  pixelCounts: {
    [index: number]: number
  }={}

  /** A single frame of animation. Media functions pass this into
  * [[requestAnimationFrame]].
  *
  * > Be careful! Calling this while [[PixelManipulator.mode]] is `"playing"`
  * > might cause two concurrent calls to this function. If any of your automata
  * > have "hidden state" - that is they don't represent every detail about
  * > themselves as data within the pixels - it might cause conflicts.
  */
  iterate (): void {
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
        if (elm.liveCell != null) {
          elm.liveCell({
            x,
            y,
            oldId: currentPixId,
            thisId: currentPixId
          })
        }
        if (this.pixelCounts[currentPixId] == null) {
          this.pixelCounts[currentPixId] = 1
        } else this.pixelCounts[currentPixId]++
        if (elm.deadCell != null) {
          if (typedUpdatedDead[currentPixId] == null) {
            typedUpdatedDead[currentPixId] = new Uint8Array(Math.ceil((w * h) / 8))
          }
          for (let hi = 0; hi < elm.hitbox.length; hi++) {
            const pixel = elm.hitbox[hi]
            let hbx = (x + pixel.x) % w
            if (hbx < 0) hbx += w
            let hby = (y + pixel.y) % h
            if (hby < 0) hby += h
            const index = Math.floor(location2Index({
              x: hbx,
              y: hby
            }, w) / 8)
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
      this.loopint = resumeAnimation(this.loopint, () => {
        this.iterate()
      })
    }
  }

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
  '2018-2022 Nathan Fritzler\nThis program comes with ABSOLUTELY NO ' +
  'WARRANTY\nThis is free software, and you are welcome to redistribute it\n' +
  'under certain conditions, as according to the GNU GENERAL PUBLIC LICENSE ' +
  'version 3 or later.'
if (typeof window !== 'undefined') console.log(licence)
// This is called a "modeline". It's a (n)vi(m)|ex thing.
// vi: tabstop=2 shiftwidth=2 expandtab
