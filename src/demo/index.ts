import { PixelManipulator, Color, version, rules, Ctx2dRenderer } from '../lib/pixelmanipulator'

const canvas = document.getElementById('canvas') as HTMLCanvasElement

/// Grey overlay lines over the canvas
const smallxline = document.getElementById('smallxline')
const smallyline = document.getElementById('smallyline')
/// Grey box showing where zoom elm is looking at
const selectorBoxElm = document.getElementById('selectorBox')

const customizer = document.getElementById('customizer')
/// Select the element to customize
const customSelect = document.getElementById('customSelect')
/// Change the color
const customizeColor = document.getElementById('customizeColor')
const customizeColorAlpha = document.getElementById('customColorAlpha')
/// Name for the alpha field of the color
const customizeColorAlphaText = document.getElementById('customColorAlphaText')
/// Name of element
const customizeName = document.getElementById('customizeName')

/// Zoomed in canvas
const zoom = document.getElementById('zoom') as HTMLCanvasElement

/// Grey overlay over zoom canvas
const largexlineElm = document.getElementById('largexline')
const largeylineElm = document.getElementById('largeyline')
const largexline1Elm = document.getElementById('largexline1')
const largeyline1Elm = document.getElementById('largeyline1')

/// Actions box button.
const resetBtn = document.getElementById('reset')
const playBtn = document.getElementById('play')
const pauseBtn = document.getElementById('pause')
const oneFrameAtATime = document.getElementById('oneFrameAtATime')

/// Sizes for render canvas
const widthE = document.getElementById('width')
const heightE = document.getElementById('height')
/// Sizes for zoom canvas
const zhE = document.getElementById('zoomHeightElm')
const zwE = document.getElementById('zoomWidthElm')

/// Element placed on normal-click
const normalSelect = document.getElementById('normalSelect')
/// The button to fill canvas with normal elm of given percent
const normalFill = document.getElementById('normalFill')
/// The percent of normal elm to fill canvas with when normalFill clicked
const normalFillP = document.getElementById('normalFillP')

/// Element placed on ctrl-click
const ctrlSelect = document.getElementById('ctrlSelect')
/// The button to fill canvas with ctrl elm of given percent
const ctrlFill = document.getElementById('ctrlFill')
/// The percent of ctrl elm to fill canvas with when normalFill clicked
const ctrlFillP = document.getElementById('ctrlFillP')

/// Element placed on alt-click
const altSelect = document.getElementById('altSelect')
/// The button to fill canvas with alt elm of given percent
const altFill = document.getElementById('altFill')
/// The percent of alt elm to fill canvas with when normalFill clicked
const altFillP = document.getElementById('altFillP')

/// Hide targeter lines
const shtargeterElm = document.getElementById('shtargeter')
/// Hide focus box
const shfocusboxElm = document.getElementById('shfocusbox')
/// Hide pixelCounter
const pixelCounter = document.getElementById('pixelCounter')
/// Show element customizer
const customizeT = document.getElementById('customizeT')

/// Version of backend
const backendversion = document.getElementById('backendversion')

/// Text element for pixel totals
const pixelCounterT = document.getElementById('pixelCounterT')

const selectorboxSty = selectorBoxElm?.style
const largexlinesty = largexlineElm?.style
const largexline1sty = largexline1Elm?.style
const largeyline1sty = largeyline1Elm?.style
const largeylinesty = largeylineElm?.style
const elmdrops = document.getElementsByClassName('elmDrop')

if (canvas == null) throw new Error('canvas could not be found!')
const p: PixelManipulator<Color> = new PixelManipulator(
  new Ctx2dRenderer(canvas),
  1, 1 // The width and height are changed later
)
const timedebug = true
let framecount = 0

if (backendversion != null) backendversion.innerText = version
if (zoom == null) {
  throw new Error('zoom canvas could not be found')
}
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
  if (selectorboxSty != null && zoom != null) {
    selectorboxSty.width = `${zoom.width / zoomScaleFactor}px`
    selectorboxSty.height = `${zoom.height / zoomScaleFactor}px`
    selectorboxSty.left = `${zoomX - (zoom.width / (2 * zoomScaleFactor))}px`
    selectorboxSty.top = `${zoomY - (zoom.height / (2 * zoomScaleFactor))}px`
  }
}
interface PageLoc{
  pageX: number
  pageY: number
}
function updateSmallLines (e: MouseEvent|PageLoc): void {
  if (smallxline != null && smallyline != null) {
    smallxline.style.left = `${e.pageX}px`
    smallyline.style.top = `${e.pageY}px`
  }
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

  if (largexlinesty != null) {
    largexlinesty.width = `${zoomScaleFactor}px`
    largexlinesty.height = `${h}px`
    largexlinesty.right = `${rightVal}px`
    largexlinesty.top = `${t}px`
  }

  if (largexline1sty != null) {
    largexline1sty.width = `${zoomScaleFactor}px`
    largexline1sty.height = `${h2}px`
    largexline1sty.right = `${rightVal}px`
    largexline1sty.top = '0'
  }
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

  if (largeylinesty != null) {
    largeylinesty.height = `${zoomScaleFactor}px`
    largeylinesty.width = `${w}px`
    largeylinesty.top = `${zoomScaleFactor * y}px`
    largeylinesty.right = '0'
  }

  if (largeyline1sty != null) {
    largeyline1sty.height = `${zoomScaleFactor}px`
    largeyline1sty.width = `${w2}px`
    largeyline1sty.top = `${zoomScaleFactor * y}px`
    largeyline1sty.right = `${l}px`
  }
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
  if (customSelect == null) return
  const elm = p.getElementByName((customSelect as HTMLSelectElement).value)
  if (elm == null) return
  if (customizeColor != null) (customizeColor as HTMLInputElement).value = rgb2hex(elm.renderAs)
  const alphaVal = (elm.renderAs[3] ?? 255).toString()
  if (customizeColorAlpha != null) (customizeColorAlpha as HTMLInputElement).value = alphaVal// Raw alpha value
  if (customizeColorAlphaText != null) (customizeColorAlphaText as HTMLSpanElement).innerText = alphaVal
  if (customizeName != null) (customizeName as HTMLInputElement).value = elm.name
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
if (selectorBoxElm != null) {
  selectorBoxElm.addEventListener('click', selectorClicked)
  selectorBoxElm.addEventListener('mousemove', boxHoverOrClick)
  selectorBoxElm.addEventListener('click', boxHoverOrClick)
}
if (smallxline != null) {
  smallxline.addEventListener('mousemove', updateSmallLines)
  smallxline.addEventListener('click', selectorClicked)
}
if (smallyline != null) {
  smallyline.addEventListener('mousemove', updateSmallLines)
  smallyline.addEventListener('click', selectorClicked)
}
zoom.addEventListener('mousemove', updateBothLargeLines)
if (largexlineElm != null) largexlineElm.addEventListener('mousemove', bigLineGotHovered)
if (largexline1Elm != null) largexline1Elm.addEventListener('mousemove', bigLineGotHovered)
if (largeylineElm != null)largeylineElm.addEventListener('mousemove', bigLineGotHovered)
if (largeyline1Elm != null)largeyline1Elm.addEventListener('mousemove', bigLineGotHovered)
if (customizeName != null) {
  customizeName.addEventListener('change', function (this: HTMLInputElement) {
    console.log('change name', this.value)
    const num = p.nameToId((customSelect as HTMLSelectElement).value)
    if (num > -1) {
      p.modifyElement(num, {
        name: this.value
      })
    }
    updateCustomizer()
  })
}
function changeColor (): void {
  console.log('change color')
  const num = p.nameToId((customSelect as HTMLSelectElement).value)
  const renderAs = hex2rgba((customizeColor as HTMLInputElement).value, parseInt((customizeColorAlpha as HTMLInputElement).value))
  if (num > -1 && renderAs != null) {
    p.modifyElement(num, {
      renderAs
    })
  }
}
if (customizeColor != null) customizeColor.addEventListener('change', changeColor)
if (customizeColorAlpha != null) customizeColorAlpha.addEventListener('change', changeColor)
if (shtargeterElm != null) {
  shtargeterElm.addEventListener('click', function (this: HTMLInputElement) {
    const state = this.checked ? 'hidden' : 'visible'
    if (smallxline != null) smallxline.style.visibility = state
    if (smallyline != null) smallyline.style.visibility = state
    if (largexlineElm != null) largexlineElm.style.visibility = state
    if (largexline1Elm != null) largexline1Elm.style.visibility = state
    if (largeylineElm != null) largeylineElm.style.visibility = state
    if (largeyline1Elm != null) largeyline1Elm.style.visibility = state
  })
}
if (shfocusboxElm != null) {
  shfocusboxElm.addEventListener('click', function (this: HTMLInputElement) {
    const state = this.checked ? 'hidden' : 'visible'
    if (selectorBoxElm != null) selectorBoxElm.style.visibility = state
  })
}
if (customSelect != null) customSelect.addEventListener('change', () => updateCustomizer())
if (customizeT != null) {
  customizeT.addEventListener('click', function (this: HTMLInputElement) {
    if (customizer == null) return
    if (this.checked) {
      customizer.classList.remove('hidden')
      updateCustomizer()
    } else customizer.classList.add('hidden')
  })
}
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
  if (e.ctrlKey && ctrlSelect != null) {
    active = (ctrlSelect as HTMLSelectElement).value
  } else if (e.altKey && altSelect != null) {
    active = (altSelect as HTMLSelectElement).value
  } else if (normalSelect != null) {
    active = (normalSelect as HTMLSelectElement).value
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
if (pixelCounterT != null && pixelCounter != null) {
  p.onAfterIterate = () => {
    oldZoom()
    if (!(pixelCounterT as HTMLInputElement).checked) {
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
}
if (playBtn != null) {
  playBtn.addEventListener('click', function (this: HTMLButtonElement) {
    p.play()
    this.disabled = true
    if (pauseBtn != null) (pauseBtn as HTMLButtonElement).disabled = false
  });
  (playBtn as HTMLButtonElement).disabled = false
}
if (oneFrameAtATime != null) {
  oneFrameAtATime.addEventListener('click', () => p.iterate())
}
if (resetBtn != null) {
  resetBtn.addEventListener('click', () => {
    if (widthE != null && heightE != null) {
      const canvasW = parseInt((widthE as HTMLInputElement).value)
      const canvasH = parseInt((heightE as HTMLInputElement).value)
      const zoomW = parseInt((zwE as HTMLInputElement).value)
      const zoomH = parseInt((zhE as HTMLInputElement).value)
      p.reset({
        canvasW,
        canvasH
      })
      // Reccomended to have a function here that sets the canvas size here (or earlier), due to how startup works.
      zoom.width = (zoomW ?? zoom.width / zoomScaleFactor) * zoomScaleFactor
      zoom.height = (zoomH ?? zoom.height / zoomScaleFactor) * zoomScaleFactor
    }
    updateBox()
    if (playBtn != null) (playBtn as HTMLButtonElement).disabled = false
    if (oneFrameAtATime != null) (oneFrameAtATime as HTMLButtonElement).disabled = false
    if (resetBtn != null) (resetBtn as HTMLButtonElement).disabled = false
    if (pauseBtn != null) (pauseBtn as HTMLButtonElement).disabled = true
    framecount = 0
    p.iterate() // this will prevent new user confusion by showing the zoom box when the page loads
  })
  resetBtn.click()
}
if (pauseBtn != null) {
  pauseBtn.addEventListener('click', function (this: HTMLButtonElement) {
    this.disabled = true
    if (playBtn != null) (playBtn as HTMLButtonElement).disabled = false
    p.pause()
  })
}
if (normalFill != null && normalSelect != null && normalFillP != null) {
  normalFill.addEventListener('click', () => {
    p.randomlyFill(
      (normalSelect as HTMLSelectElement).value,
      parseInt((normalFillP as HTMLInputElement).value) ?? 15
    )
    p.update() // needed after any changes are made
    oldZoom()
  })
}
if (ctrlFill != null && ctrlSelect != null && ctrlFillP != null) {
  ctrlFill.addEventListener('click', () => {
    p.randomlyFill(
      (ctrlSelect as HTMLSelectElement).value,
      parseInt((ctrlFillP as HTMLInputElement).value) ?? 15
    )
    p.update()
    oldZoom()
  })
}
if (altFill != null && altSelect != null && altFillP != null) {
  altFill.addEventListener('click', () => {
    p.randomlyFill(
      (altSelect as HTMLSelectElement).value,
      parseInt((altFillP as HTMLInputElement).value) ?? 15
    )
    p.update()
    oldZoom()
  })
}
p.onElementModified = () => {
  let nsv
  let csv
  let asv
  let cusv
  if (normalSelect != null) {
    nsv = (normalSelect as HTMLSelectElement).value
    if (nsv.length === 0) nsv = "Conway's Game Of Life"
  }
  if (ctrlSelect != null) {
    csv = (ctrlSelect as HTMLSelectElement).value
    if (csv.length === 0) csv = 'Blocks'
  }
  if (altSelect != null) {
    asv = (altSelect as HTMLSelectElement).value
    if (asv.length === 0) asv = 'Water'
  }
  if (customSelect != null) {
    cusv = (customSelect as HTMLSelectElement).value
    if (cusv.length === 0) cusv = "Conway's Game Of Life"
  }
  for (let i = 0; i < elmdrops.length; i++) {
    elmdrops[i].innerHTML = ''
    p.elements.forEach(elm => {
      const newElement = document.createElement('option')
      newElement.innerText = elm.name
      elmdrops[i].appendChild(newElement)
    })
  }
  // Restore that selection, accounting for aliases
  if (nsv != null) (normalSelect as HTMLSelectElement).value = p.getElementByName(nsv)?.name ?? ''
  if (csv != null) (ctrlSelect as HTMLSelectElement).value = p.getElementByName(csv)?.name ?? ''
  if (asv != null) (altSelect as HTMLSelectElement).value = p.getElementByName(asv)?.name ?? ''
  if (cusv != null) {
    (customSelect as HTMLSelectElement).value = p.getElementByName(cusv)?.name ?? ''
    if ((customSelect as HTMLSelectElement).value != null)updateCustomizer()
  }
}
if (customSelect != null) p.onElementModified(parseInt((customSelect as HTMLSelectElement).value)) // Call it once to fill in dropdowns
// vim: tabstop=2 shiftwidth=2 expandtab
