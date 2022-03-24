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
export interface xycoord{
  x: number
  y: number
}
export type hitbox=xycoord[]
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
}
export type Color=[number, number, number, number]|[number, number, number]|[number, number]|[number]|[]
/** Much like [[ElementDataUnknown]] but all fields except [[ElementData.loop]],
* [[ElementData.liveCell]] and [[ElementData.liveCell]] are mandatory. */
export interface ElementData extends ElementDataUnknown {
  name: string
  color: Color
  pattern?: string
  loop?: boolean
  hitbox: hitbox
  liveCell?: (rel: Rel) => void
  deadCell?: (rel: Rel) => void
  number: number
}
/** Information about an element. */
export interface ElementDataUnknown{
  [index: string]: string|number[]|boolean|hitbox|((rel: Rel) => void)|number|undefined
  /** The name of the element. */
  name?: string
  /** The rgba color of the element. If there is less than 4 values in this
  * array, the end of the array is padded with the number 255. (if missing
  * entirely, the color is white) NOTE THAT NO TWO ELEMENTS MAY HAVE EXACTLY THE
  * SAME COLOR (Starting in version 3 this will throw an error)
  */
  color?: Color
  /**
  * A simple way of automatically generating values for
  * [[ElementDataUnknown.livecell]] and [[ElementDataUnknown.deadcell]]
  *
  * There are two types of patterns:
  *
  * ## Lifelike
  *
  * One can initialize an instance of Conway's Game of Life by doing the
  * following:
  *
  * ```ts
  * p.addElement("Conway's Game Of Life",{
  *   color:[0,255,0,255],
  *   pattern:"B3/S23"
  * })
  * ```
  *
  * This uses the moore neighborhood (see
  * [[PixelManipulator.neighborhoods.moore]]) to calculate the quantity of
  * nearby cells of this same type. The non-case sensative pattern you see above
  * can be read as "A cell is born (or switches from an off state to an on
  * state) if there are exactly three nearby neighbors of this same cell type,
  * and it will survive (or continue to stay as an on state) if there are
  * exactly two or exactly three cells of this same type nearby."
  *
  * This can accept any number of numbers for either input, as long as they
  * are whole numbers from zero(0) to eight(8), due to the fact that that is
  * the physical limit.
  *
  * \> Note that the presence of the number 9 will fail silently, and act as if
  * \> that digit is not present.
  *
  * ## Wolfram
  *
  * Uses the Wolfram neighborhood to calculate the previous state. See
  * [[PixelManipulator.neighborhoods.wolfram]]
  *
  * ```ts
  * p.addElement("Rule 30",{
  *   color:[255,0,255,255],
  *   pattern:"Rule 30",
  * })
  * ```
  *
  * The pattern must start with the word (not case sensitive) "Rule" followed by
  * a space. It then must be followed by a number from 0 to 255.
  *
  * This number will be transalated into a binary string. In the case of the
  * example above, "`00011110`."
  *
  * Wolfram Rules don't use the Moore area formula, they use the Wolfram
  * area formula.
  *
  * ```txt
  * XXX
  *  O
  * ```
  *
  * This remarkably different formula relies that per each frame, only one line
  * changes at a time. Each cell, as shown above, depends on the 1(same element
  * type present) or 0(same element type not present) state of the cells
  * directly, and to either side above this cell.
  *
  * We then iterate through each digit of the above number, while counting up
  * from `000` in binary. (For example, `000` and `0`, `001` and `0`, `010` and
  * `0`, `011` and `1`, etc).
  *
  * If the three-digit binary number correctly matches the state of the cells
  * above this one, then the state of this cell becomes the value of the
  * corrosponding digit in the long binary string. (for example, if it matches
  * in a `000` pattern than it remains dead., but if it matches in a `011`
  * pattern, then the cell becomes alive.)
  */
  pattern?: string
  /** Assuming that [[ElementDataUnknownNameMandatory.pattern]]
  * is present, should this pattern loop?
  */
  loop?: boolean
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
  /** Ignored by [[PixelManipulator.addElement]], this is the unique, constant
  * reference number to this element. */
  number?: number
}
/** Much like [[ElementDataUnknown]] but the name is mandatory. */
export interface ElementDataUnknownNameMandatory extends ElementDataUnknown{
  name: string
}
interface templatea{
  __index__: Function
  _convertNumListToBf: Function
  __LIVE__: Function
  __DEAD__: Function
}
interface templateb{
  __index__: Function
  __LIVE__: Function
  __DEAD__: Function
}
const templates: {
  [index: string]: templatea|templateb
} = { // an object containing the different templates that are currently in the system
  __LIFE__: { // Things like Conway's Game of Life
    _convertNumListToBf: function (nl: number[]): number {
      // While I used to use string with each digit in it, I found that since
      // there are 0-8, I could use a 9bit field (remember: off by one)
      let out = 0
      for (let i = 0; i < nl.length; i++) {
        const item = nl[i]
        out |= 1 << item
      }
      return out
    },
    __index__: function (this: templatea, p: PixelManipulator, elm: number, data: ElementData) {
      if (typeof data.pattern === 'undefined' || data.pattern.search(/B\d{0,9}\/S\d{0,9}/gi) <= -1) {
        return []
      }
      const numbers = data.pattern.split(/\/?[a-z]/gi)// "B",born,die
      data.loop = typeof data.loop !== 'undefined' ? data.loop : true
      if (typeof data.hitbox !== 'undefined') { data.hitbox = p.neighborhoods.moore() }
      console.log('Life Pattern found: ', data.name, data)
      return [
        this.__LIVE__(
          p,
          this._convertNumListToBf(numbers[2]),
          data.loop,
          elm
        ),
        this.__DEAD__(
          p,
          this._convertNumListToBf(numbers[1]),
          data.loop,
          elm
        )
      ]
    },
    __LIVE__: function (p: PixelManipulator, bfdie: number, loop: boolean|undefined, elm: number) {
      return function llive ({ x, y }: Rel) {
        // if any match (of how many moore are nearby) is found, it dies
        if ((bfdie & 1 << p.mooreNearbyCounter({ x, y, frame: 1, loop }, elm)) === 0) {
          p.setPixel({ x, y }, p.defaultId)
        }
      }
    },
    __DEAD__: function (p: PixelManipulator, bflive: number, loop: boolean|undefined, elm: number) {
      return function ldead ({ x, y }: Rel) {
        // if any match (of how many moore are nearby) is found, it lives
        if ((bflive & 1 << p.mooreNearbyCounter({ x, y, frame: 1, loop }, elm)) > 0) {
          p.setPixel({ x, y }, elm)
        }
      }
    }
  },
  __WOLFRAM__: {
    __index__: function (p: PixelManipulator, elm: number, data: ElementData) {
      if (typeof data.pattern === 'undefined' || data.pattern.search(/Rule \d*/gi) <= -1) {
        return []
      }
      const binStates = parseInt(data.pattern.split(/Rule /gi)[1])
      data.loop = typeof data.loop !== 'undefined' ? data.loop : false
      if (typeof data.hitbox === 'undefined') { data.hitbox = p.neighborhoods.wolfram(1, 1) }
      console.log('Wolfram pattern found: ', data.name, data)
      return [
        this.__LIVE__(p, elm, binStates, data.loop),
        this.__DEAD__(p, elm, binStates, data.loop)
      ]
    },
    __LIVE__: function (p: PixelManipulator, elm: number, binStates: number, loop?: boolean) {
      return function wlive ({ x, y }: Rel) {
        if (y === 0) return
        // for every possible state
        for (let binDex = 0; binDex < 8; binDex++) {
          if (
            // if the state is "off". Use a bit mask and shift it
            (binStates & 1 << binDex) === 0 &&
            // if there is a wolfram match (wolfram code goes from 111 to 000)
            p.wolframNearbyCounter({ x, y, frame: 1, loop }, elm, binDex)
          ) {
            p.setPixel({ x, y, loop }, p.defaultId)
            return// No more logic needed, it is done.
          }
        }
      }
    },
    __DEAD__: function (p: PixelManipulator, elm: number, binStates: number, loop?: boolean) {
      return function wdead ({ x, y }: Rel) {
        // for every possible state
        for (let binDex = 0; binDex < 8; binDex++) {
          if (
            // if the state is "on". Use a bit mask and shift it
            (binStates & 1 << binDex) > 0 &&
            // if there is a wolfram match (wolfram code goes from 111 to 000)
            p.wolframNearbyCounter({ x, y, frame: 1, loop }, elm, binDex)
          ) {
            p.setPixel({ x, y, loop }, elm)
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
  /** width of the zoom canvas (size in zoomed pixels) */
  zoomW?: number
  /** height of the zoom canvas (size in zoomed pixels) */
  zoomH?: number
}
/** A cellular automata engine */
export class PixelManipulator {
  /**
  * This is the number that indicates what animation frame the iterate function
  * is being called with.
  *
  * \> You can use this to mannually stop the iterations like so:
  * \> `cancelAnimationFrame(this.loopint)` (not reccommended)
  */
  loopint=0
  /**
  * The X coordinate of where the center of the [[PixelManipulator.zoomelm]] is
  * windowed at.
  */
  zoomX=0
  /**
  * The Y coordinate of where the center of the [[PixelManipulator.zoomelm]] is
  * windowed at.
  */
  zoomY=0
  _width=1// Must be at least one pixel for startup to work
  _height=1
  /**
  * A low-level listing of the availiable elements.
  *
  * \> This has been around since late version 0!
  *
  * Format is much like the argument to
  * [[PixelManipulator.addMultipleElements]], but is not sanitized.
  *
  * Includes a `number` value that serves as the element's ID number and a `name`
  * value for convenience in making general components of elements. See [[ElementData.number]]
  *
  * \> Warning! Does not respect the [[PixelManipulator.nameAliases]] object!
  */
  elementTypeMap: Map<string, ElementData>=new Map([
    [
      'blank',
      {
        color: [0, 0, 0, 255],
        number: 0, // Index in this.elementNumList
        hitbox: [],
        name: 'blank'
      }
    ]
  ])

  /**
  * A list of all string-names in [[PixelManipulator.elementTypeMap]], in order
  * of ID number.
  */
  elementNumList=['blank']
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
  * How many times bigger should the zoom elm be as compared to the actual size found in the normal canvas?
  */
  zoomScaleFactor=20
  /** The color of the lines drawn on the zoom elm. */
  zoomctxStrokeStyle='gray'
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
  /**
  * An object containing several functions to generate lists of relative positions
  * for a neighborhood hitbox.
  *
  * See [[hitbox]].
  */
  neighborhoods={
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
    * ```txt
    * XXX
    *  O
    * ```
    */
    wolfram: function (radius?: number, yval?: number, includeSelf?: boolean): hitbox {
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
    },
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
    * ```txt
    * XXX
    * XOX
    * XXX
    * ```
    */
    moore: function (radius?: number, includeSelf?: boolean): hitbox {
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
    },
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
    * ```txt
    *  X
    * XOX
    *  X
    * ```
    */
    vonNeumann: function (radius?: number, includeSelf?: boolean): hitbox {
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
    },
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
    euclidean: function (radius?: number, includeSelf?: boolean): hitbox {
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
  }

  /** Gets called after a call to [[PixelManipulator.modifyElement]]. The ID is
  * passed as the only argument.
  */
  onElementModified: (id: number) => void=function () {}
  _canvas: undefined|HTMLCanvasElement
  /** @returns the width of the canvas */
  get_width (): number {
    return this._width
  }

  /** @param value - The new width of the canvas */
  set_width (value: number): void {
    if (typeof this._canvas !== 'undefined') { this._canvas.width = value }
    this._width = value
  }

  /** @returns the height of the canvas */
  get_height (): number {
    return this._height
  }

  /** @param value - The new height of the canvas */
  set_height (value: number): void {
    if (typeof this._canvas !== 'undefined') { this._canvas.height = value }
    this._height = value
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
    data.number = this.elementNumList.length
    this.elementNumList.push(elm)
    // Must be this value exactly for modifyElement to work
    const tmpData: ElementDataUnknown = {
      name: elm,
      number: data.number,
      color: data.color
    }
    this.elementTypeMap.set(elm, tmpData as ElementData) // hitbox must be undefined for modifyElement to be able to correctly assign it
    this.modifyElement(data.number, data as ElementDataUnknown)
    return data.number
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
    const name = this.elementNumList[id]
    if (typeof name === 'undefined') {
      throw new Error(`Invalid ID ${id}`)
    }
    const oldData: ElementDataUnknown = this.elementTypeMap.get(name) as ElementData
    this.elementTypeMap.delete(name) // Needs to be gone for color check
    if (typeof data.name !== 'undefined' && data.name !== oldData.name) {
      this.aliasElements(oldData as ElementData, data as ElementDataUnknownNameMandatory)
      this.elementNumList[id] = data.name
    }
    if (typeof data.color !== 'undefined') {
      while (data.color.length < 4) {
        (data.color as [number]).push(255)
      }
      if (typeof this.colorToId(data.color) !== 'undefined') {
        throw new Error(`The color ${data.color.toString()} is already in use!`)
      }
    }
    if (typeof data.loop !== 'undefined' && typeof data.pattern === 'undefined') { data.pattern = oldData.pattern }
    for (const di in data) {
      if (Object.prototype.hasOwnProperty.call(data, di)) {
        oldData[di] = data[di]
      }
    }
    if (typeof data.pattern === 'string') {
      const hb = oldData.hitbox
      const lc = oldData.liveCell
      const dc = oldData.deadCell
      // Even if it's undefined. If it's undefined the template will fill it.
      oldData.hitbox = data.hitbox
      oldData.liveCell = data.liveCell
      oldData.deadCell = data.deadCell
      for (const tempNam in templates) {
        const out = templates[tempNam].__index__(this, id, oldData)
        if (out.length === 0) continue// if the output was [], then go on.
        // Checking if `data` has the cell update functions because we _want_ to
        // override the ones in `oldData`
        if (typeof data.liveCell === 'undefined' && typeof out[0] === 'function') { oldData.liveCell = out[0] }
        if (typeof data.deadCell === 'undefined' && typeof out[1] === 'function') { oldData.deadCell = out[1] }
      }
      // In case nothing matches the pattern
      if (typeof oldData.hitbox === 'undefined' && typeof hb !== 'undefined') { oldData.hitbox = hb }
      // These functions come in pairs. If either are defined, don't use the old
      // ones.
      if (
        typeof oldData.liveCell === 'undefined' &&
        typeof oldData.deadCell === 'undefined'
      ) {
        if (typeof lc !== 'undefined') { oldData.liveCell = lc }
        if (typeof dc !== 'undefined') { oldData.deadCell = dc }
      }
    }
    if (typeof oldData.hitbox === 'undefined') { oldData.hitbox = this.neighborhoods.moore() }
    this.elementTypeMap.set((oldData as ElementData).name, oldData as ElementData) // These casts might be dangerous.
    this.onElementModified(id)
  };

  /** Takes the old data object and the new one. (currently only accesses
  * [[ElementDataUnknownNameMandatory.name]])
  *
  * Adds element to [[PixelManipulator.nameAliases]], and ensures no alias loops are present.
  */
  aliasElements (oldData: ElementDataUnknownNameMandatory, newData: ElementDataUnknownNameMandatory): void {
    if (this.elementTypeMap.has(newData.name)) {
      throw new Error('The name ' + newData.name + ' is already in use!')
    }
    this.nameAliases.delete(newData.name)
    this.nameAliases.set(oldData.name, newData.name)
  };

  /**
  * @param name - Name of the (possibly aliased) element.
  * @returns The element from [[PixelManipulator.elementTypeMap]], respecting
  * aliases in [[PixelManipulator.nameAliases]], or [[undefined]] if not found.
  */
  getElementByName (name: string): ElementData|undefined {
    let unaliased: string|undefined = name
    while (typeof unaliased !== 'undefined') {
      name = unaliased
      unaliased = this.nameAliases.get(name)
    }
    return this.elementTypeMap.get(name)
  };

  /**
  *
  * @param loop - Should this check wrap around canvas edges?
  *
  * @returns Name of element at passed-in location. See [[ElementData.name]]
  */
  whatIs (loc: Location): string {
    return this.elementNumList[this.getPixelId(loc)]
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
    const w = this.get_width()
    const h = this.get_height()
    this.set_width(canvasSizes.canvasW ?? w)
    this.set_height(canvasSizes.canvasH ?? h)
    if (typeof this.zoomelm !== 'undefined') {
      this.zoomelm.width = (canvasSizes.zoomW ?? this.zoomelm.width / this.zoomScaleFactor) * this.zoomScaleFactor
      this.zoomelm.height = (canvasSizes.zoomH ?? this.zoomelm.height / this.zoomScaleFactor) * this.zoomScaleFactor
    }
    this.updateData()
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        this.setPixel({ x, y }, this.defaultId)
      }
    }
    this.update()
    if (this.ctx !== null && typeof this.imageData !== 'undefined') {
      this.ctx.putImageData(this.imageData, 0, 0)
    }
  };

  /** pause canvas iterations
  * Sets [[PixelManipulator.mode]] to `"paused"` and cancels the animation frame
  * referenced in [[PixelManipulator.loopint]]
  */
  pause (): void {
    this.mode = 'paused'
    window.cancelAnimationFrame(this.loopint)
  };

  /**
  * Initially a click envent handler from mid to late version 0 all the way to
  * early version 1, zoom takes in an object that contains `x` and `y`. If these
  * values are missing, the last values (saved at [[PixelManipulator.zoomX]] and
  * [[PixelManipulator.zoomY]], respectivly) are used.
  *
  * Also renders a grid on the zoom element.
  *
  * @param e - Tells pixelmanipulator where to focus the center of the zoomElm (or
  * zoom-box).
  */
  zoom (e?: {
    /** Position to center the zoom elm on. (If absent, uses
    * [[PixelManipulator.zoomX]]) */
    x?: number
    /** Position to center the zoom elm on. (If absent, uses
    * [[PixelManipulator.zoomY]]) */
    y?: number
  }): void {
    if (typeof this.zoomelm === 'undefined' || typeof this.zoomelm.height === 'undefined') return
    if (typeof e === 'undefined') e = {}
    e.x = e.x ?? this.zoomX
    e.y = e.y ?? this.zoomY
    if (e.x >= 0 && e.y >= 0) {
      this.zoomX = e.x
      this.zoomY = e.y
    }
    if (this.get_height() < 2) this.set_height(400)// it would be pointless to have a canvas this small
    if (this.get_width() < 2) this.set_width(400)
    if (typeof this._canvas !== 'undefined' && this.zoomctx !== null) {
      this.zoomctx.clearRect(0, 0, this.zoomelm.width, this.zoomelm.height)// clear the screen
      this.zoomctx.drawImage(this._canvas, // draw the selected section of the canvas onto the zoom canvas
        (this.zoomX - Math.floor(this.zoomScaleFactor / 2)),
        (this.zoomY - Math.floor(this.zoomScaleFactor / 2)),
        Math.floor(this.zoomelm.width / this.zoomScaleFactor), Math.floor(this.zoomelm.height / this.zoomScaleFactor),
        0, 0,
        this.zoomelm.width, this.zoomelm.height)
      this.zoomctx.beginPath()// draw the grid
      for (let i = 1; i < (this.zoomelm.width / this.zoomScaleFactor); i++) {
        this.zoomctx.moveTo(i * this.zoomScaleFactor, 0)
        this.zoomctx.lineTo(i * this.zoomScaleFactor, this.zoomelm.height)
      }
      for (let i = 1; i < (this.zoomelm.height / this.zoomScaleFactor); i++) {
        this.zoomctx.moveTo(0, i * this.zoomScaleFactor)
        this.zoomctx.lineTo(this.zoomelm.width, i * this.zoomScaleFactor)
      }
      this.zoomctx.stroke()
    }
  };

  colorToId (colors: Color): number|undefined {
    for (let i = 0; i < this.elementNumList.length; i++) {
      if (this.compareColors(colors, this.idToColor(i))) {
        return i
      }
    }
    return undefined
  };

  idToColor (id: number): Color|undefined {
    return this.getElementByName(this.elementNumList[id])?.color
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
  * Applies any changes made with [[PixelManipulator.setPixel]] to the canvas,
  * and shows them on the [[PixelManipulator.zoomelm]] if it is present.
  *
  * In the demo, this is used to show changes the users make when they click on
  * the zoomElm.
  *
  * \> calls [[PixelManipulator.zoom]] automatically, but only if there is a zoom
  * \> elm
  */
  update (): void {
    if (this.ctx !== null && typeof this.imageData !== 'undefined') { this.ctx.putImageData(this.imageData, 0, 0) }
    if (typeof this.zoomelm !== 'undefined') this.zoom()
  };

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
      case 'string': tmp = this.getElementByName(id)?.number; break
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
    return this.neighborhoods.moore()
      .map(rel => ({ x: x + rel.x, y: y + rel.y, frame, loop }))
      .map(loc => this.confirmElm(loc, name))
      .map(boolToNumber)
      .reduce((a, b) => a + b)
  }

  /** @param loop - Should this check wrap around canvas edges?
  * @param name - element to look for
  * @param bindex - Either a string like `"001"` to match to, or the same encoded as a number.
  * @returns Number of elements in moore radius */
  wolframNearbyCounter ({ x, y, frame, loop }: Location, name: number, binDex: number|string): boolean {
    if (typeof binDex === 'string') {
      // Old format was a string of ones and zeros, three long. Use bitshifts to make it better.
      binDex = boolToNumber(binDex[0] === '1') << 2 | boolToNumber(binDex[1] === '1') << 1 | boolToNumber(binDex[2] === '1') << 0
    }
    loop = loop ?? false // one-dimentional detectors by default don't loop around edges
    return this.neighborhoods.wolfram()
      .map(rel => ({ x: x + rel.x, y: y + rel.y, frame, loop }))
      .map(loc => this.confirmElm(loc, name))
      .map((elm, i) => elm === (((binDex as number) & 1 << (2 - i)) > 0))
      .reduce((a, b) => a && b)
  }

  /** Draws a pixel to a given location **without adding it to
  * [[PixelManipulator.currentElements]]**.
  *
  * The sole purpose of this function is to allow future seperation between what
  * the render target is, and the current enviroment.
  *
  * \> If you want to try somethin' real hacky, overriding this function *might*
  * \> be enough to change what the render target _is_. I'd love to see if anyone
  * \> give this a try.
  */
  renderPixel (x: number, y: number, id: number): void {
    const color = this.idToColor(id)
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
    if (typeof this.imageData !== 'undefined') {
      for (let i = 0; i < 4; ++i) {
        this.imageData.data[pixelOffset + i] = color[i]
      }
    }
  };

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
      if (this.getElementByName(ident) == null) {
        throw new Error('Color name ' + ident + ' invalid!')
      }
      const tmp = this.getElementByName(ident)
      if (typeof tmp === 'undefined') {
        throw new Error(`Color ${ident} is invalid`)
      }
      id = tmp.number
    } else if (typeof ident === 'number') {
      id = ident
    } else if (typeof ident === 'object') {
      const tmp = this.colorToId(ident)
      if (typeof tmp === 'undefined') {
        throw new Error(`Color ${id} is invalid`)
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
    this.renderPixel(x, y, id)
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
    const typedUpdatedDead = new Array<Uint8Array>(this.elementNumList.length)
    this.pixelCounts = {}
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) { // iterate through x and y
        const currentPixId = this.getPixelId({ x, y, frame: 1 })
        if (currentPixId === this.defaultId) continue
        const currentPix = this.elementNumList[currentPixId]
        const elm = this.getElementByName(currentPix)
        if (typeof elm === 'undefined') {
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
            oldId: currentPixId
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
              oldId: this.defaultId
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

  /** The last known image data from [[PixelManipulator.ctx]] */
  imageData: ImageData|undefined
  /** The rendering context for the canvas */
  ctx: CanvasRenderingContext2D|null=null
  /**
  * A List of [[Uint32Array]]s each the length of width times height of the
  * canvas. Frame 0 is the new frame, frame one is the prior, etc. Each item
  * holds the element id of each element on screen, from left to right, top to
  * bottom.
  */
  frames: Uint32Array[]=[new Uint32Array(0), new Uint32Array(0)]
  /** The zoom-ed in render target */
  zoomelm: HTMLCanvasElement|undefined
  /** The rendering context for [[PixelManipulator.zoomelm]] */
  zoomctx: CanvasRenderingContext2D|null=null
  /**
  * Defines the starting values of the library and is run on
  * [[PixelManipulator.reset]]
  */
  updateData (): void {
    const w = this.get_width()
    const h = this.get_height()
    this.frames[0] = new Uint32Array(w * h)
    this.frames[1] = new Uint32Array(w * h)
    if (this.ctx !== null) {
      this.imageData = this.ctx.getImageData(0, 0, w, h)
      this.ctx.imageSmoothingEnabled = false
    }
    if (this.zoomctx !== null) {
      this.zoomctx.imageSmoothingEnabled = false
      this.zoomctx.strokeStyle = this.zoomctxStrokeStyle
    }
  };

  /** Tells PixelManipulator what canvas(es) to use.
  *
  * This function calls [[PixelManipulator.updateData]] automatically.
  *
  * @param e - An object holding the canvas(es) to use.
  */
  canvasPrep (e: {
    /** An html5 canvas to render on. (To scale) */
    canvas: HTMLCanvasElement
    /** An html5 canvas, zoomed-in. A movable, scaled viewport. */
    zoom?: HTMLCanvasElement
  }): void {
    // Use e.canvas for the normal canvas, and e.zoom for the zoomed-in canvas. (at least e.canvas is required)
    this._canvas = e.canvas
    if (this._canvas != null) {
      this.ctx = this._canvas.getContext('2d')
    }
    if (typeof e.zoom !== 'undefined') {
      this.zoomelm = e.zoom
      this.zoomctx = this.zoomelm.getContext('2d')
    }
    this.updateData()
    if (typeof e.zoom !== 'undefined' && typeof this.zoomelm !== 'undefined') {
      this.zoom({ // zoom at the center
        x: Math.floor(this.zoomelm.width / 2) - (Math.floor(this.zoomelm.width / 2) * this.zoomScaleFactor),
        y: Math.floor(this.zoomelm.height / 2) - (Math.floor(this.zoomelm.height / 2) * this.zoomScaleFactor)
      })
    }
  };
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
