/*  This is a cellular automata JavaScript library called PixelManipulator. For information about how to use this script, see https://github.com/Lazerbeak12345/pixelmanipulator
    Copyright (C) 2018-2021  Nathan Fritzler

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
interface xycoord{
  x: number
  y: number
}
type hitbox=xycoord[]
function boolToNumber (bool: boolean): number {
  return bool ? 1 : 0
}
export interface Rel{
  x: number
  y: number
  mooreNearbyCounter: mooreNearbyCounter
  wolframNearbyCounter: wolframNearbyCounter
  oldId: number
}
export type Color=[number, number, number, number]|[number, number, number]|[number, number]|[number]|[]
interface ElementData{
  [index: string]: string|number[]|boolean|hitbox|((rel: Rel) => void)|number|undefined
  name: string
  color: Color
  pattern?: string
  loop?: boolean
  hitbox: hitbox
  liveCell?: (rel: Rel) => void
  deadCell?: (rel: Rel) => void
  number: number
}
interface ElementDataUnknown{
  [index: string]: string|number[]|boolean|hitbox|((rel: Rel) => void)|number|undefined
  name?: string
  color?: Color
  pattern?: string
  loop?: boolean
  hitbox?: hitbox
  liveCell?: (rel: Rel) => void
  deadCell?: (rel: Rel) => void
  number?: number
}
interface ElementDataUnknownNameMandatory{
  name: string
  color?: Color
  pattern?: string
  loop?: boolean
  hitbox?: hitbox
  liveCell?: (rel: Rel) => void
  deadCell?: (rel: Rel) => void
  number?: number
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
      return function llive (rel: Rel) {
        // if any match (of how many moore are nearby) is found, it dies
        if ((bfdie & 1 << rel.mooreNearbyCounter(rel.x, rel.y, elm, loop)) === 0) {
          p.setPixel(rel.x, rel.y, p.defaultId)
        }
      }
    },
    __DEAD__: function (p: PixelManipulator, bflive: number, loop: boolean|undefined, elm: number) {
      return function ldead (rel: Rel) {
        if ((bflive & 1 << rel.mooreNearbyCounter(rel.x, rel.y, elm, loop)) > 0) { p.setPixel(rel.x, rel.y, elm) }// if any match (of how many moore are nearby) is found, it lives
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
      return function wlive (rel: Rel) {
        if (rel.y === 0) return
        for (let binDex = 0; binDex < 8; binDex++) { // for every possible state
          if ((binStates & 1 << binDex) === 0) { // if the state is "off". Use a bit mask and shift it
            if (rel.wolframNearbyCounter(rel.x, rel.y, elm, binDex, loop)) { // if there is a wolfram match (wolfram code goes from 111 to 000)
              p.setPixel(rel.x, rel.y, p.defaultId, loop)
              return// No more logic needed, it is done.
            }
          }
        }
      }
    },
    __DEAD__: function (p: PixelManipulator, elm: number, binStates: number, loop?: boolean) {
      return function wdead (rel: Rel) {
        for (let binDex = 0; binDex < 8; binDex++) { // for every possible state
          if ((binStates & 1 << binDex) > 0) { // if the state is "on". Use a bit mask and shift it
            if (rel.wolframNearbyCounter(rel.x, rel.y, elm, binDex, loop)) { // if there is a wolfram match (wolfram code goes from 111 to 000)
              p.setPixel(rel.x, rel.y, elm, loop)
              return// No more logic needed, it is done.
            }
          }
        }
      }
    }
  }
}
type whatIs=(x: number, y: number, loop: boolean) => string
interface canvasSizes{
  canvasW?: number
  canvasH?: number
  zoomW?: number
  zoomH?: number
}
type getPixelId=(x: number, y: number, loop?: boolean) => number
type getPixel=(x: number, y: number, loop: boolean) => number[]
type confirmElm=(
  x: number,
  y: number,
  name: string|number|number[],
  loop?: boolean
) => boolean
type mooreNearbyCounter=(
  x: number,
  y: number,
  name: string|number|number[],
  loop?: boolean
) => number
type wolframNearbyCounter=(
  x: number,
  y: number,
  name: string|number|number[],
  binDex: string|number,
  loop?: boolean
) => boolean
export class PixelManipulator {
  loopint=0
  zoomX=0
  zoomY=0
  _width=1// Must be at least one pixel for startup to work
  _height=1
  row=0
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

  elementNumList=['blank']
  nameAliases: Map<string, string>=new Map()

  mode='paused'
  zoomScaleFactor=20
  zoomctxStrokeStyle='gray'
  defaultId=0
  onIterate: () => void=() => {}
  onAfterIterate: () => void=function () {}
  neighborhoods={
    // Area is f(x)=2x-1
    wolfram: function (radius?: number, yval?: number, includeSelf?: boolean): hitbox {
      if (typeof radius === 'undefined') { radius = 1 }
      if (typeof yval === 'undefined') { yval = -1 }
      const output = [{ x: 0, y: yval }]
      if (typeof includeSelf === 'undefined' || includeSelf) {
        output.push({ x: 0, y: yval })
      }
      for (let i = radius; i > 0; i--) {
        output.push({ x: -1 * i, y: yval })
        output.push({ x: i, y: yval })
      }
      return output
    },
    // Area is f(x)=(2r+1)^2
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
    // Area is f(x)=r^2+(r+1)^2
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
    // Area is not quite that of a circle. TODO
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

  onElementModified: (id: number) => void=function () {}
  get_width (): number {
    return this._width
  }

  _canvas: undefined|HTMLCanvasElement
  set_width (value: number): void {
    if (typeof this._canvas !== 'undefined') { this._canvas.width = value }
    this._width = value
  };

  get_height (): number {
    return this._height
  };

  set_height (value: number): void {
    if (typeof this._canvas !== 'undefined') { this._canvas.height = value }
    this._height = value
  };

  /// fills the screen with value, at an optional given percent
  randomlyFill (value: string|number|number[], pr?: number): void {
    pr = pr ?? 15
    const w = this.get_width()
    const h = this.get_height()
    for (let xPos = 0; xPos < w; xPos++) {
      for (let yPos = 0; yPos < h; yPos++) { // iterate through x and y
        if (Math.random() * 100 < pr) { this.setPixel(xPos, yPos, value) }
      }
    }
  };

  // adds multiple elements
  addMultipleElements (map: {[index: string]: ElementDataUnknown}): void {
    for (const elm in map) {
      map[elm].name = elm
      this.addElement(map[elm] as ElementDataUnknownNameMandatory)
    }
  };

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

  aliasElements (oldData: ElementDataUnknownNameMandatory, newData: ElementDataUnknownNameMandatory): void {
    if (this.elementTypeMap.has(newData.name)) {
      throw new Error('The name ' + newData.name + ' is already in use!')
    }
    this.nameAliases.delete(newData.name)
    this.nameAliases.set(oldData.name, newData.name)
  };

  getElementByName (name: string): ElementData|undefined {
    let unaliased: string|undefined = name
    while (typeof unaliased !== 'undefined') {
      name = unaliased
      unaliased = this.nameAliases.get(name)
    }
    return this.elementTypeMap.get(name)
  };

  // Generator for whatIs
  __WhatIs (getPixelId: getPixelId): whatIs {
    return (x, y, loop) => { // return the name of an element in a given location
      return this.elementNumList[getPixelId(x, y, loop)]
    }
  };

  // Start iterations on all of the elements on the canvas
  play (canvasSizes?: canvasSizes): void {
    // console.log("play");
    if (this.mode === 'playing') this.reset(canvasSizes)
    this.mode = 'playing'
    this.loopint = window.requestAnimationFrame(() => {
      void this.iterate()
    })
  };

  // reset (and resize) the canvas(es)
  reset (canvasSizes?: canvasSizes): void {
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
        this.setPixel(x, y, this.defaultId)
      }
    }
    this.update()
    if (this.ctx !== null && typeof this.imageData !== 'undefined') {
      this.ctx.putImageData(this.imageData, 0, 0)
    }
  };

  // pause canvas iterations
  pause (): void {
    this.mode = 'paused'
    window.cancelAnimationFrame(this.loopint)
  };

  zoom (e?: {x?: number, y?: number}): void { // This tells pixelmanipulator where to focus the center of the zoomElm
    // console.log("zoom",e);
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

  colorToId (colors: number[]): number|undefined {
    for (let i = 0; i < this.elementNumList.length; i++) {
      if (this.compareColors(colors, this.idToColor(i))) {
        return i
      }
    }
    return undefined
  };

  idToColor (id: number): number[]|undefined {
    return this.getElementByName(this.elementNumList[id])?.color
  };

  // Generates getPixelId and getOldPixelId instances
  __GetPixelId=function (this: PixelManipulator, d: Uint32Array): getPixelId {
    return (x, y, loop) => { // get the rgba value of the element at given position, handeling for looping(defaults to true)
      const w = this.get_width()
      const h = this.get_height()
      loop = typeof loop !== 'undefined' ? loop : true
      if (loop) {
        x %= w
        if (x < 0)x += w
        y %= h
        if (y < 0)y += h
      } else if (x < 0 || x >= w || y < 0 || x >= h) { return this.defaultId }
      return d[(w * y) + x]
    }
  }

  // Generates getPixel and getOldPixel instances
  __GetPixel (getPixelId: getPixelId): getPixel {
    // get the rgba value of the element at given position, handeling for looping(defaults to true)
    return (x, y, loop) => {
      const tmp = this.idToColor(getPixelId(x, y, loop))
      if (typeof tmp === 'undefined') {
        throw new Error("Can't get pixel color from pixel id in get pixel (should never happen).")
      }
      return tmp
    }
  };

  update (): void { // applies changes made by setPixel to the graphical canvas(es)
    if (this.ctx !== null && typeof this.imageData !== 'undefined') { this.ctx.putImageData(this.imageData, 0, 0) }
    if (typeof this.zoomelm !== 'undefined') this.zoom()
  };

  compareColors (a?: number[], b?: number[]): boolean {
    if (typeof a === 'undefined') { a = [] }
    if (typeof b === 'undefined') { b = [] }
    return (a[0] ?? 0) === (b[0] ?? 0) && (a[1] ?? 0) === (b[1] ?? 0) && (a[2] ?? 0) === (b[2] ?? 0) && (a[3] ?? 255) === (b[3] ?? 255)
  };

  // Generates confirmElm and confirmOldElm instances, based of of the respective instances made by __GetPixel
  __ConfirmElm (getPixelId: getPixelId): confirmElm {
    return (x, y, id, loop) => { // returns a boolean as to weather the inputted element name matches the selected location
      // console.log("confirmElm",x,y,name,loop);
      let tmp: number|undefined
      switch (typeof id) {
        case 'string': tmp = this.getElementByName(id)?.number; break
        case 'object': tmp = this.colorToId(id); break
        case 'number': tmp = id
      }
      if (typeof tmp === 'undefined') {
        throw new Error(`color ${id.toString()} invalid!`)
      }
      return getPixelId(x, y, loop) === tmp
    }
  };

  // Generate mooreNearbyCounter
  __MooreNearbyCounter (f: confirmElm): mooreNearbyCounter {
    // console.log("MooreNearbyCounter");
    // var specialConfirm=this.__ConfirmElm(f);
    return function mooreNearbyCounter (x, y, name, loop) { // Count how many cells of this name match in a moore radius
      // console.log("mooreNearbyCounter");
      return boolToNumber(f(x - 1, y - 1, name, loop)) +// nw
        boolToNumber(f(x - 1, y, name, loop)) + // w
        boolToNumber(f(x - 1, y + 1, name, loop)) + // sw
        boolToNumber(f(x, y - 1, name, loop)) + // n
        boolToNumber(f(x, y + 1, name, loop)) + // s
        boolToNumber(f(x + 1, y - 1, name, loop)) + // ne
        boolToNumber(f(x + 1, y, name, loop)) + // e
        boolToNumber(f(x + 1, y + 1, name, loop)) // se
    }
  };

  // Generate wolframNearbyCounter
  __WolframNearbyCounter (f: confirmElm): wolframNearbyCounter {
    // console.log("WolframNearbygetOldPixel");
    return function wolframNearbyCounter (x, y, name, binDex, loop) { // determine if the three cells above a given cell match an inputted element query
      // console.log("wolframNearby");
      if (typeof binDex === 'string') {
        // Old format was a string of ones and zeros, three long. Use bitshifts to make it better.
        binDex = boolToNumber(binDex[0] === '1') << 2 | boolToNumber(binDex[1] === '1') << 1 | boolToNumber(binDex[2] === '1') << 0
      }
      loop = typeof loop !== 'undefined' ? loop : false// one-dimentional detectors by default don't loop around edges
      // the three spots above (nw,n,ne)
      return f(x - 1, y - 1, name, loop) === ((binDex & 1 << 2) > 0) &&
        f(x, y - 1, name, loop) === ((binDex & 1 << 1) > 0) &&
        f(x + 1, y - 1, name, loop) === ((binDex & 1 << 0) > 0)
    }
  };

  renderPixel (x: number, y: number, id: number): void {
    const color = this.idToColor(id)
    if (typeof color === 'undefined') {
      throw new Error('Invalid ID')
    }
    // allows for arrays that are too small
    while (color.length < 4) {
      color.push(255)
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

  /// places given pixel at the x and y position, handling for loop (default loop is true)
  setPixel (x: number, y: number, arry: string|number|number[], loop?: boolean): void {
    // console.log("rawSetPixel",x,y,name,loop);
    loop = loop ?? true
    let id = 0
    if (typeof arry === 'string') {
      if (typeof this.getElementByName(arry) === 'undefined') { throw new Error('Color name ' + arry + ' invalid!') }
      const tmp = this.getElementByName(arry)
      if (typeof tmp === 'undefined') {
        throw new Error(`Color ${arry} is invalid`)
      }
      id = tmp.number
    } else if (typeof arry === 'number') { id = arry } else if (typeof arry === 'object') {
      const tmp = this.colorToId(arry)
      if (typeof tmp === 'undefined') {
        throw new Error(`Color ${id} is invalid`)
      }
      id = tmp
    } else throw new Error(`Color type ${typeof arry} is invalid!`)
    const w = this.get_width()
    const h = this.get_height()
    if (loop) {
      x %= w
      if (x < 0)x += w
      y %= h
      if (y < 0)y += h
    } else if (x < 0 || x >= w || y < 0 || y >= h) return // if it can't loop, and it's outside of the boundaries, exit
    this.renderPixel(x, y, id)
    this.currentElements[(w * y) + x] = id
  };

  pixelCounts: {
    [index: number]: number
  }={}

  // single frame of animation. Media functions pass this into setInterval
  async iterate (): Promise<void> {
    // console.log("iterate");
    this.onIterate()
    this.oldElements.set(this.currentElements)
    const getOldPixelId = this.__GetPixelId(this.oldElements)
    const confirmOldElm = this.__ConfirmElm(getOldPixelId)
    const w = this.get_width()
    const h = this.get_height()
    const rel = {
      x: 0,
      y: 0,
      oldId: this.defaultId,
      getOldPixelId: getOldPixelId,
      confirmOldElm: confirmOldElm,
      getOldPixel: this.__GetPixel(getOldPixelId),
      whatIsOld: this.__WhatIs(getOldPixelId),
      mooreNearbyCounter: this.__MooreNearbyCounter(confirmOldElm),
      wolframNearbyCounter: this.__WolframNearbyCounter(confirmOldElm)
    }
    const typedUpdatedDead = new Array<Uint8Array>(this.elementNumList.length)
    this.pixelCounts = {}
    const promises = []
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) { // iterate through x and y
        const currentPixId = rel.getOldPixelId(x, y)
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
          promises.push(
            Promise.resolve({
              ...rel,
              y,
              x,
              oldId: currentPixId
            })
              .then(elm.liveCell)
          )
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
            let rx = (x + pixel.x) % w
            if (rx < 0) rx += w
            let ry = (y + pixel.y) % h
            if (ry < 0)ry += h
            const index = Math.floor((w * ry + rx) / 8)
            const oldValue = typedUpdatedDead[currentPixId][index]
            const bitMask = 1 << (rx % 8)
            if ((oldValue & bitMask) > 0) { continue }
            // I timed it, and confirmOldElm is slower than all the math above.
            if (!rel.confirmOldElm(rx, ry, this.defaultId)) { continue }
            promises.push(
              Promise.resolve({ ...rel, x: rx, y: ry })
                .then(elm.deadCell)
            )
            typedUpdatedDead[currentPixId][index] = oldValue | bitMask
          }
        }
      }
    }
    await Promise.all(promises)
    if (this.mode === 'playing') {
      this.loopint = window.requestAnimationFrame(() => {
        void this.iterate()
      })
    }
    this.onAfterIterate()
    return await new Promise(() => this.update())
  };

  imageData: ImageData|undefined
  ctx: CanvasRenderingContext2D|null=null
  currentElements: Uint32Array=new Uint32Array(0)
  oldElements: Uint32Array=new Uint32Array(0)
  zoomelm: HTMLCanvasElement|undefined
  zoomctx: CanvasRenderingContext2D|null=null
  getPixelId: getPixelId=this.__GetPixelId(this.oldElements)
  getPixel: getPixel|undefined
  confirmElm: confirmElm=this.__ConfirmElm(this.getPixelId)
  whatIs: whatIs|undefined
  updateData (): void { // defines the starting values of the library and is run on `p.reset();`
    // console.log("updateData");
    const w = this.get_width()
    const h = this.get_height()
    this.currentElements = new Uint32Array(w * h)
    this.oldElements = new Uint32Array(w * h)
    if (this.ctx !== null) {
      this.imageData = this.ctx.getImageData(0, 0, w, h)
      this.ctx.imageSmoothingEnabled = false
    }
    if (this.zoomctx !== null) {
      this.zoomctx.imageSmoothingEnabled = false
      this.zoomctx.strokeStyle = this.zoomctxStrokeStyle
    }
    this.getPixelId = this.__GetPixelId(this.currentElements)
    this.getPixel = this.__GetPixel(this.getPixelId)
    this.confirmElm = this.__ConfirmElm(this.getPixelId)
    this.whatIs = this.__WhatIs(this.getPixelId)
  };

  /// Tells PixelManipulator what canvas(es) to use.
  canvasPrep (e: {canvas: HTMLCanvasElement, zoom?: HTMLCanvasElement}): void {
    // Use e.canvas for the normal canvas, and e.zoom for the zoomed-in canvas. (at least e.canvas is required)
    this._canvas = e.canvas
    if (typeof this._canvas !== 'undefined') { this.ctx = this._canvas.getContext('2d') }
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
export const version = '4.5.2'
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