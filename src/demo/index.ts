import { PixelManipulator, Color, version, rules, Ctx2dRenderer } from '../lib/pixelmanipulator'

const canvas = document.getElementById('canvas') as HTMLCanvasElement

/// Grey overlay lines over the canvas
const smallxline = document.getElementById('smallxline') as HTMLDivElement
const smallyline = document.getElementById('smallyline') as HTMLDivElement
/// Grey box showing where zoom elm is looking at
const selectorBox = document.getElementById('selectorBox') as HTMLDivElement

const customizer = document.getElementById('customizer') as HTMLDivElement
/// Select the element to customize
const customSelect = document.getElementById('customSelect') as HTMLSelectElement
/// Change the color
const customizeColor = document.getElementById('customizeColor') as HTMLInputElement
const customizeColorAlpha = document.getElementById('customColorAlpha') as HTMLInputElement
/// Name for the alpha field of the color
const customizeColorAlphaText = document.getElementById('customColorAlphaText') as HTMLSpanElement
/// Name of element
const customizeName = document.getElementById('customizeName') as HTMLInputElement

/// Zoomed in canvas
const zoom = document.getElementById('zoom') as HTMLCanvasElement

/// Grey overlay over zoom canvas
const largexline = document.getElementById('largexline') as HTMLDivElement
const largeyline = document.getElementById('largeyline') as HTMLDivElement
const largexline1 = document.getElementById('largexline1') as HTMLDivElement
const largeyline1 = document.getElementById('largeyline1') as HTMLDivElement

/// Actions box button.
const resetBtn = document.getElementById('reset') as HTMLButtonElement
const playBtn = document.getElementById('play') as HTMLButtonElement
const pauseBtn = document.getElementById('pause') as HTMLButtonElement
const oneFrameAtATime = document.getElementById('oneFrameAtATime') as HTMLButtonElement

/// Sizes for render canvas
const widthE = document.getElementById('width') as HTMLInputElement
const heightE = document.getElementById('height') as HTMLInputElement
/// Sizes for zoom canvas
const zoomHeightElm = document.getElementById('zoomHeightElm') as HTMLInputElement
const zoomWidthElm = document.getElementById('zoomWidthElm') as HTMLInputElement

/// Element placed on normal-click
const normalSelect = document.getElementById('normalSelect') as HTMLSelectElement
/// The button to fill canvas with normal elm of given percent
const normalFill = document.getElementById('normalFill') as HTMLButtonElement
/// The percent of normal elm to fill canvas with when normalFill clicked
const normalFillP = document.getElementById('normalFillP') as HTMLInputElement

/// Element placed on ctrl-click
const ctrlSelect = document.getElementById('ctrlSelect') as HTMLSelectElement
/// The button to fill canvas with ctrl elm of given percent
const ctrlFill = document.getElementById('ctrlFill') as HTMLButtonElement
/// The percent of ctrl elm to fill canvas with when ctrlFill clicked
const ctrlFillP = document.getElementById('ctrlFillP') as HTMLInputElement

/// Element placed on alt-click
const altSelect = document.getElementById('altSelect') as HTMLSelectElement
/// The button to fill canvas with alt elm of given percent
const altFill = document.getElementById('altFill') as HTMLButtonElement
/// The percent of alt elm to fill canvas with when altFill clicked
const altFillP = document.getElementById('altFillP') as HTMLInputElement

/// Hide targeter lines
const shtargeter = document.getElementById('shtargeter') as HTMLInputElement
/// Hide focus box
const shfocusbox = document.getElementById('shfocusbox') as HTMLInputElement
/// Hide pixelCounter
const pixelCounterT = document.getElementById('pixelCounterT') as HTMLInputElement
/// Show element customizer
const customizeT = document.getElementById('customizeT') as HTMLInputElement

/// Version of backend
const backendversion = document.getElementById('backendversion') as HTMLSpanElement

/// Text element for pixel totals
const pixelCounter = document.getElementById('pixelCounter') as HTMLDivElement

const selectorboxSty = selectorBox.style
const largexlinesty = largexline.style
const largexline1sty = largexline1.style
const largeyline1sty = largeyline1.style
const largeylinesty = largeyline.style
const elmdrops = document.getElementsByClassName('elmDrop')

const p = new PixelManipulator(
  new Ctx2dRenderer(canvas),
  1, 1 // The width and height are changed later
)
const timedebug = true
let framecount = 0

backendversion.innerText = version

const zoomctx = zoom.getContext('2d')
if (zoomctx == null) {
  throw new Error('rendering context not supported')
}
/**
* How many times bigger should the zoom elm be as compared to the actual size found in the normal canvas?
*/
const zoomScaleFactor = 20
oldZoom({ // zoom at the center
  x: Math.floor(zoom.width / 2) -
    (Math.floor(zoom.width / 2) * zoomScaleFactor),
  y: Math.floor(zoom.height / 2) -
    (Math.floor(zoom.height / 2) * zoomScaleFactor)
})

function updateBox (): void {
  selectorboxSty.width = `${zoom.width / zoomScaleFactor}px`
  selectorboxSty.height = `${zoom.height / zoomScaleFactor}px`
  selectorboxSty.left = `${zoomX - (zoom.width / (2 * zoomScaleFactor))}px`
  selectorboxSty.top = `${zoomY - (zoom.height / (2 * zoomScaleFactor))}px`
}
interface PageLoc{
  pageX: number
  pageY: number
}
function updateSmallLines (e: MouseEvent|PageLoc): void {
  smallxline.style.left = `${e.pageX}px`
  smallyline.style.top = `${e.pageY}px`
  const x = e.pageX - zoomX + (zoomScaleFactor / 2)
  const y = e.pageY - zoomY + (zoomScaleFactor / 2)
  if (
    e.pageX < ((zoom.width / (2 * zoomScaleFactor)) + zoomX) &&
    e.pageX > ((zoom.width / (-2 * zoomScaleFactor)) + zoomX)
  ) {
    // for when the line is inside the box, but the cursor isn't.
    updateLargeLinesX(x, y)
  } else updateLargeLinesX(-1, y)
  if (
    e.pageY < ((zoom.height / (2 * zoomScaleFactor)) + zoomY) &&
    e.pageY > ((zoom.height / (-2 * zoomScaleFactor)) + zoomY)
  ) {
    updateLargeLinesY(x, y)
  } else updateLargeLinesY(x, -1)
}
function updateLargeLinesX (x: number, y: number): void {
  const zh = zoom.height
  const zw = zoom.width
  let h = zh - ((1 + y) * zoomScaleFactor)
  let t = zoomScaleFactor * (y + 1)
  let h2 = y * zoomScaleFactor
  const rightVal = zw - zoomScaleFactor * (x + 1)
  if (y < 0 || y > zh / zoomScaleFactor) {
    h = zh
    t = 0
    h2 = 0
  }

  largexlinesty.width = `${zoomScaleFactor}px`
  largexlinesty.height = `${h}px`
  largexlinesty.right = `${rightVal}px`
  largexlinesty.top = `${t}px`

  largexline1sty.width = `${zoomScaleFactor}px`
  largexline1sty.height = `${h2}px`
  largexline1sty.right = `${rightVal}px`
  largexline1sty.top = '0'
}
function updateLargeLinesY (x: number, y: number): void {
  const zw = zoom.width
  let w = zw - ((1 + x) * zoomScaleFactor)
  let l = zw - zoomScaleFactor * x
  let w2 = x * zoomScaleFactor
  if (x < 0 || x > zw / zoomScaleFactor) {
    w = zw
    l = 0
    w2 = 0
  }

  largeylinesty.height = `${zoomScaleFactor}px`
  largeylinesty.width = `${w}px`
  largeylinesty.top = `${zoomScaleFactor * y}px`
  largeylinesty.right = '0'

  largeyline1sty.height = `${zoomScaleFactor}px`
  largeyline1sty.width = `${w2}px`
  largeyline1sty.top = `${zoomScaleFactor * y}px`
  largeyline1sty.right = `${l}px`
}
function selectorClicked (e: MouseEvent): void {
  oldZoom({
    x: e.pageX,
    y: e.pageY
  })
  updateBox()
}
function updateBothLargeLines (e: MouseEvent): void {
  const x = Math.floor(e.offsetX / zoomScaleFactor)
  const y = Math.floor(e.offsetY / zoomScaleFactor)
  updateSmallLines({
    pageX: x + zoomX - (zoom.width / (2 * zoomScaleFactor)),
    pageY: y + zoomY - (zoom.width / (2 * zoomScaleFactor))
  })
}
function bigLineGotHovered (e: MouseEvent): void {
  // get the element out of the way so the canvas below will A: still be clickable and B: move this elm to the correct place
  if (e.target != null) (e.target as HTMLDivElement).style.height = '0'
}
function boxHoverOrClick (e: MouseEvent): void {
  updateSmallLines(e)
  updateLargeLinesX(e.offsetX, e.offsetY)
  updateLargeLinesY(e.offsetX, e.offsetY)
};
function rgb2hex (color: Color): string {
  return '#' +
    (color[0] ?? 255).toString(16).padStart(2, '0') +
    (color[1] ?? 255).toString(16).padStart(2, '0') +
    (color[2] ?? 255).toString(16).padStart(2, '0')
}
function hex2rgba (hex: string, alpha: number): Color|null {
  const matches = hex.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i)
  if (matches == null) return null
  const output: Color = [
    // The 0th is just the whole string
    parseInt(matches[1], 16),
    parseInt(matches[2], 16),
    parseInt(matches[3], 16)
  ]
  if (alpha != null) output.push(alpha)
  return output
}
function updateCustomizer (): void {
  const elm = p.getElementByName(customSelect.value)
  if (elm == null) return
  customizeColor.value = rgb2hex(elm.renderAs)
  const alphaVal = (elm.renderAs[3] ?? 255).toString()
  customizeColorAlpha.value = alphaVal// Raw alpha value
  customizeColorAlphaText.innerText = alphaVal
  customizeName.value = elm.name
}
zoom.addEventListener('click', zoomClick)
zoom.addEventListener('drag', zoomClick)
canvas.addEventListener('click', updateBox)
canvas.addEventListener('click', (event) =>
  oldZoom({
    x: event.offsetX,
    y: event.offsetY
  }))
canvas.addEventListener('mousemove', updateSmallLines)
selectorBox.addEventListener('click', selectorClicked)
selectorBox.addEventListener('mousemove', boxHoverOrClick)
selectorBox.addEventListener('click', boxHoverOrClick)
smallxline.addEventListener('mousemove', updateSmallLines)
smallxline.addEventListener('click', selectorClicked)
smallyline.addEventListener('mousemove', updateSmallLines)
smallyline.addEventListener('click', selectorClicked)
zoom.addEventListener('mousemove', updateBothLargeLines)
largexline.addEventListener('mousemove', bigLineGotHovered)
largexline1.addEventListener('mousemove', bigLineGotHovered)
largeyline.addEventListener('mousemove', bigLineGotHovered)
largeyline1.addEventListener('mousemove', bigLineGotHovered)
customizeName.addEventListener('change', function (this: HTMLInputElement) {
  console.log('change name', this.value)
  const num = p.nameToId(customSelect.value)
  if (num > -1) {
    p.modifyElement(num, {
      name: this.value
    })
  }
  updateCustomizer()
})
function changeColor (): void {
  console.log('change color')
  const num = p.nameToId(customSelect.value)
  const renderAs = hex2rgba(customizeColor.value, parseInt(customizeColorAlpha.value))
  if (num > -1 && renderAs != null) {
    p.modifyElement(num, {
      renderAs
    })
  }
}
customizeColor.addEventListener('change', changeColor)
customizeColorAlpha.addEventListener('change', changeColor)
shtargeter.addEventListener('click', function () {
  const state = this.checked ? 'hidden' : 'visible'
  smallxline.style.visibility = state
  smallyline.style.visibility = state
  largexline.style.visibility = state
  largexline1.style.visibility = state
  largeyline.style.visibility = state
  largeyline1.style.visibility = state
})
shfocusbox.addEventListener('click', function () {
  const state = this.checked ? 'hidden' : 'visible'
  selectorBox.style.visibility = state
})
customSelect.addEventListener('change', () => updateCustomizer())
customizeT.addEventListener('click', function (this: HTMLInputElement) {
  if (this.checked) {
    customizer.classList.remove('hidden')
    updateCustomizer()
  } else customizer.classList.add('hidden')
})
/**
* The X coordinate of where the center of [[zoom]] is windowed at.
*/
let zoomX = 10
/**
* The Y coordinate of where the center of the [[zoom]] is windowed at.
*/
let zoomY = 10
p.addMultipleElements({
  Acid: {
    renderAs: [110, 162, 10, 255],
    // current Pixel Matches
    liveCell: ({ x, y, oldId }) => {
      const randsAcid = new Uint8Array(3)
      window.crypto.getRandomValues(randsAcid)
      const newLoc = {
        x: x + (randsAcid[0] % 3) - 1,
        y: y + randsAcid[1] % 4,
        loop: false
      }
      const h = p.get_height()
      while ((newLoc.y >= h || p.confirmElm(newLoc, oldId)) && newLoc.y - 1 >= y) {
        newLoc.y--
      }
      if (!p.confirmElm(newLoc, oldId)) {
        p.setPixel({ x, y, loop: false }, p.defaultId)
        p.setPixel(newLoc, oldId)
      } else if (randsAcid[2] % 100 === 0) {
        p.setPixel(newLoc, p.defaultId)
      }
    }
  },
  Blocks: {
    // does nothing
    renderAs: [127, 127, 127, 255]
  },
  "Brian's Brain (dying)": {
    // not quite white
    renderAs: [254, 254, 254, 255],
    // Cells that were in the dying state go into the off state
    liveCell: ({ x, y }) => p.setPixel({ x, y, loop: false }, p.defaultId)
  },
  "Brian's Brain (on)": {
    ...rules.lifelike(p, 'B2/S'), // same pattern as seeds
    renderAs: [0, 0, 254, 255], // not quite blue
    // All cells that were "on" go into the "dying" state, which is not counted as an "on" cell in the neighbor count, and prevents any cell from being born there.
    liveCell: ({ x, y }) => p.setPixel({ x, y, loop: false }, "Brian's Brain (dying)")
  },
  Seeds: {
    ...rules.lifelike(p, 'B2/S'),
    renderAs: [194, 178, 128]
  },
  "Conway's Game Of Life": {
    ...rules.lifelike(p, 'B3/S23'), // born on 3, survives on 2 or 3
    renderAs: [0, 255, 0, 255]
  },
  'Wireworld Conductor': {
    renderAs: [67, 75, 77, 255],
    liveCell: loc => {
      const num = p.nameToId('Wireworld Electricity')
      if (num === -1) return
      const { x, y } = loc
      const conductorNearbyTotal = p.mooreNearbyCounter({ x, y, frame: 1 }, num)
      // copper stays as copper unless it has just one or two neighbours that are electron heads,in which case it becomes an electron head
      if (conductorNearbyTotal === 1 || conductorNearbyTotal === 2) {
        p.setPixel(loc, num)
      }
    }
  },
  'Wireworld Electricity': {
    renderAs: [148, 133, 0, 255],
    liveCell: ({ x, y }) => p.setPixel({ x, y, loop: false }, 'Wireworld FadingElectricity')
  },
  'Wireworld FadingElectricity': {
    renderAs: [148, 133, 0, 254],
    liveCell: ({ x, y }) => p.setPixel({ x, y, loop: false }, 'Wireworld Conductor')
  },
  Highlife: {
    ...rules.lifelike(p, 'B36/S23'), // born on 3 or 6, survives on 2 or 3
    renderAs: [0, 255, 128, 255]
  },
  "No-loop Conway's Game Of Life": {
    ...rules.lifelike(p, 'B3/S23', false), // same as Conway's Game Of Life, but with a no-loop boolean
    renderAs: [0, 150, 0, 255]
  },
  'Rule 30': {
    ...rules.wolfram(p, 'Rule 30', false),
    renderAs: [255, 0, 255, 255]
  },
  'Rule 90': {
    ...rules.wolfram(p, 'Rule 90', false),
    renderAs: [147, 112, 219, 255]
  },
  'Rule 110': {
    ...rules.wolfram(p, 'Rule 110', false),
    renderAs: [128, 0, 128, 255]
  },
  'Rule 184': {
    ...rules.wolfram(p, 'Rule 184', false),
    renderAs: [255, 51, 153, 255]
  },
  Water: {
    renderAs: [23, 103, 167, 255],
    liveCell: ({ x, y, oldId }) => {
      const randsWater = new Uint8Array(2)
      window.crypto.getRandomValues(randsWater)
      const newLoc = {
        x: x + (randsWater[0] % 3) - 1,
        y: y + randsWater[1] % 4,
        loop: false
      }
      const h = p.get_height()
      while ((newLoc.y >= h || !p.confirmElm(newLoc, p.defaultId)) && newLoc.y - 1 >= y) {
        newLoc.y--
      }
      if (p.confirmElm(newLoc, p.defaultId)) {
        p.setPixel({ x, y, loop: false }, p.defaultId)
        p.setPixel(newLoc, oldId)
      }
    }
  }
})
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
function oldZoom (e?: {
  /** Position to center the zoom elm on. (If absent, uses
  * [[PixelManipulator.zoomX]]) */
  x?: number
  /** Position to center the zoom elm on. (If absent, uses
  * [[PixelManipulator.zoomY]]) */
  y?: number
}): void {
  if (zoomctx == null) return
  zoomctx.imageSmoothingEnabled = false
  zoomctx.strokeStyle = 'gray'
  if (typeof e === 'undefined') e = {}
  e.x = e.x ?? zoomX
  e.y = e.y ?? zoomY
  if (e.x >= 0 && e.y >= 0) {
    zoomX = e.x
    zoomY = e.y
  }
  if (zoomctx !== null) {
    zoomctx.clearRect(0, 0, zoom.width, zoom.height)// clear the screen
    zoomctx.drawImage(canvas, // draw the selected section of the canvas onto the zoom canvas
      (zoomX - Math.floor(zoomScaleFactor / 2)),
      (zoomY - Math.floor(zoomScaleFactor / 2)),
      Math.floor(zoom.width / zoomScaleFactor), Math.floor(zoom.height / zoomScaleFactor),
      0, 0,
      zoom.width, zoom.height)
    zoomctx.beginPath()// draw the grid
    for (let i = 1; i < (zoom.width / zoomScaleFactor); i++) {
      zoomctx.moveTo(i * zoomScaleFactor, 0)
      zoomctx.lineTo(i * zoomScaleFactor, zoom.height)
    }
    for (let i = 1; i < (zoom.height / zoomScaleFactor); i++) {
      zoomctx.moveTo(0, i * zoomScaleFactor)
      zoomctx.lineTo(zoom.width, i * zoomScaleFactor)
    }
    zoomctx.stroke()
  }
}
/** an event-like function that returns what should be set where the zoom ctx
* was clicked */
function onZoomClick (e: MouseEvent, rel: {x: number, y: number}): string|number {
  let active: string|number = p.defaultId
  if (e.ctrlKey) {
    active = ctrlSelect.value
  } else if (e.altKey) {
    active = altSelect.value
  } else {
    active = normalSelect.value
  }
  if (p.confirmElm(rel, active)) return p.defaultId
  return active
}
function zoomClick (e: MouseEvent): void {
  const zoomPos = {
    x: Math.floor(e.offsetX / zoomScaleFactor) +
      Math.floor(zoomX - (zoomScaleFactor / 2)),
    y: Math.floor(e.offsetY / zoomScaleFactor) +
      Math.floor(zoomY - (zoomScaleFactor / 2))
  }
  p.setPixel(zoomPos, onZoomClick(e, zoomPos))
  p.update()
  oldZoom()
}
let lasttime = performance.now()
p.onIterate = () => {
  if (timedebug) lasttime = performance.now()
  framecount++
}
p.onAfterIterate = () => {
  oldZoom()
  if (!pixelCounterT.checked) {
    let text = ''
    for (const id in p.pixelCounts) {
      const elm = p.elements[parseInt(id)].name
      text += `${elm} : ${p.pixelCounts[id]}\n`
    }
    text += `\n\nFrames:${framecount}`
    if (timedebug) text += `\nFps:${1 / ((performance.now() - lasttime) / 1000)}`
    pixelCounter.innerText = text
  } else pixelCounter.innerText = ''
}
pixelCounterT.addEventListener('click', p.onAfterIterate)
playBtn.addEventListener('click', function (this: HTMLButtonElement) {
  p.play()
  this.disabled = true
  pauseBtn.disabled = false
})
playBtn.disabled = false
oneFrameAtATime.addEventListener('click', () => p.iterate())
resetBtn.addEventListener('click', () => {
  const canvasW = parseInt(widthE.value)
  const canvasH = parseInt(heightE.value)
  const zoomW = parseInt(zoomWidthElm.value)
  const zoomH = parseInt(zoomHeightElm.value)
  p.reset({
    canvasW,
    canvasH
  })
  // Reccomended to have a function here that sets the canvas size here (or earlier), due to how startup works.
  zoom.width = (zoomW ?? zoom.width / zoomScaleFactor) * zoomScaleFactor
  zoom.height = (zoomH ?? zoom.height / zoomScaleFactor) * zoomScaleFactor
  updateBox()
  playBtn.disabled = false
  oneFrameAtATime.disabled = false
  resetBtn.disabled = false
  pauseBtn.disabled = true
  framecount = 0
  p.iterate() // this will prevent new user confusion by showing the zoom box when the page loads
})
resetBtn.click()
pauseBtn.addEventListener('click', function (this: HTMLButtonElement) {
  this.disabled = true
  playBtn.disabled = false
  p.pause()
})
normalFill.addEventListener('click', () => {
  p.randomlyFill(
    normalSelect.value,
    parseInt(normalFillP.value) ?? 15
  )
  p.update() // needed after any changes are made
  oldZoom()
})
ctrlFill.addEventListener('click', () => {
  p.randomlyFill(
    ctrlSelect.value,
    parseInt(ctrlFillP.value) ?? 15
  )
  p.update()
  oldZoom()
})
altFill.addEventListener('click', () => {
  p.randomlyFill(
    altSelect.value,
    parseInt(altFillP.value) ?? 15
  )
  p.update()
  oldZoom()
})
p.onElementModified = () => {
  let nsv = normalSelect.value
  let csv = ctrlSelect.value
  let asv = altSelect.value
  let cusv = customSelect.value
  if (nsv.length === 0) nsv = "Conway's Game Of Life"
  if (csv.length === 0) csv = 'Blocks'
  if (asv.length === 0) asv = 'Water'
  if (cusv.length === 0) cusv = "Conway's Game Of Life"
  for (let i = 0; i < elmdrops.length; i++) {
    elmdrops[i].innerHTML = ''
    p.elements.forEach(elm => {
      const newElement = document.createElement('option')
      newElement.innerText = elm.name
      elmdrops[i].appendChild(newElement)
    })
  }
  // Restore that selection, accounting for aliases
  normalSelect.value = p.getElementByName(nsv)?.name ?? ''
  ctrlSelect.value = p.getElementByName(csv)?.name ?? ''
  altSelect.value = p.getElementByName(asv)?.name ?? ''
  customSelect.value = p.getElementByName(cusv)?.name ?? ''
  updateCustomizer()
}
p.onElementModified(parseInt(customSelect.value)) // Call it once to fill in dropdowns
// vim: tabstop=2 shiftwidth=2 expandtab
