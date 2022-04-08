import { PixelManipulator, version, rules, Ctx2dRenderer } from '../lib/pixelmanipulator'
import '@fortawesome/fontawesome-free/attribution.js'

/**
* The X coordinate of where the center of [[zoom]] is windowed at.
*/
let zoomX = 10
/**
* The Y coordinate of where the center of the [[zoom]] is windowed at.
*/
let zoomY = 10
function updateBox (): void {
  selectorboxSty.width = `${zoom.width / zoomScaleFactor}px`
  selectorboxSty.height = `${zoom.height / zoomScaleFactor}px`
  selectorboxSty.left = `${zoomX - (zoom.width / (2 * zoomScaleFactor))}px`
  selectorboxSty.top = `${zoomY - (zoom.height / (2 * zoomScaleFactor))}px`
}
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
  if (zoomctx == null) return
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
function updateSmallLines (e: MouseEvent|{ pageX: number, pageY: number }): void {
  smallxline.style.left = `${e.pageX}px`
  smallyline.style.top = `${e.pageY}px`
  oldZoom()
  if (zoomctx == null || !(shtargeter.checked ?? true)) return
  zoomctx.imageSmoothingEnabled = false
  zoomctx.fillStyle = '#88888888'
  const x = e.pageX - zoomX + (zoomScaleFactor / 2)
  const y = e.pageY - zoomY + (zoomScaleFactor / 2)
  zoomctx.fillRect(x * zoomScaleFactor, 0, zoomScaleFactor, y * zoomScaleFactor)
  const zh = zoom.height
  zoomctx.fillRect(x * zoomScaleFactor, zoomScaleFactor + y * zoomScaleFactor, zoomScaleFactor, zh - (y * zoomScaleFactor))
  zoomctx.fillRect(0, y * zoomScaleFactor, x * zoomScaleFactor, zoomScaleFactor)
  const zw = zoom.width
  zoomctx.fillRect(zoomScaleFactor + x * zoomScaleFactor, y * zoomScaleFactor, zw - (x * zoomScaleFactor), zoomScaleFactor)
}
let framecount = 0
let lasttime: number
function beforeIterate (): void {
  if (timedebug) lasttime = performance.now()
  framecount++
}
function afterIterate<T> (p: PixelManipulator<T>): void {
  if (pixelCounterT.checked ?? true) {
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
const canvas = document.getElementById('canvas') as HTMLCanvasElement
canvas.addEventListener('click', updateBox)
canvas.addEventListener('click', (event) =>
  oldZoom({
    x: event.offsetX,
    y: event.offsetY
  }))
canvas.addEventListener('mousemove', updateSmallLines)
const p = new PixelManipulator(
  new Ctx2dRenderer(canvas),
  1, 1 // The width and height are changed later
)

function selectorClicked (e: MouseEvent): void {
  oldZoom({
    x: e.pageX,
    y: e.pageY
  })
  updateBox()
}
function boxHoverOrClick (e: MouseEvent): void {
  updateSmallLines(e)
}
/// Grey overlay lines over the canvas
const smallxline = document.getElementById('smallxline') as HTMLDivElement
smallxline.addEventListener('mousemove', updateSmallLines)
smallxline.addEventListener('click', selectorClicked)
const smallyline = document.getElementById('smallyline') as HTMLDivElement
smallyline.addEventListener('mousemove', updateSmallLines)
smallyline.addEventListener('click', selectorClicked)
/// Grey box showing where zoom elm is looking at
const selectorBox = document.getElementById('selectorBox') as HTMLDivElement
selectorBox.addEventListener('click', selectorClicked)
selectorBox.addEventListener('mousemove', boxHoverOrClick)
selectorBox.addEventListener('click', boxHoverOrClick)
const selectorboxSty = selectorBox.style

function updateCustomizer (): void {
  const elm = p.getElementByName(customSelect.value)
  if (elm == null) return
  customizeColor.value = '#' +
    (elm.renderAs[0] ?? 255).toString(16).padStart(2, '0') +
    (elm.renderAs[1] ?? 255).toString(16).padStart(2, '0') +
    (elm.renderAs[2] ?? 255).toString(16).padStart(2, '0')
  const alphaVal = (elm.renderAs[3] ?? 255).toString()
  customizeColorAlpha.value = alphaVal// Raw alpha value
  customizeColorAlphaText.innerText = alphaVal
  customizeName.value = elm.name
}
function changeColor (): void {
  console.log('change color')
  const num = p.nameToId(customSelect.value)
  if (num === -1) return
  const matches = customizeColor.value.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i)
  if (matches == null) return
  p.modifyElement(num, {
    renderAs: [
      // The 0th is just the whole string
      parseInt(matches[1], 16),
      parseInt(matches[2], 16),
      parseInt(matches[3], 16),
      parseInt(customizeColorAlpha.value)
    ]
  })
}
const customizer = document.getElementById('customizer') as HTMLDivElement
/// Select the element to customize
const customSelect = document.getElementById('customSelect') as HTMLSelectElement
customSelect.addEventListener('change', () => updateCustomizer())
/// Change the color
const customizeColor = document.getElementById('customizeColor') as HTMLInputElement
customizeColor.addEventListener('change', changeColor)
const customizeColorAlpha = document.getElementById('customColorAlpha') as HTMLInputElement
customizeColorAlpha.addEventListener('change', changeColor)
/// Name for the alpha field of the color
const customizeColorAlphaText = document.getElementById('customColorAlphaText') as HTMLSpanElement
/// Name of element
const customizeName = document.getElementById('customizeName') as HTMLInputElement
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

function zoomClick (e: MouseEvent): void {
  const zoomPos = {
    x: Math.floor(e.offsetX / zoomScaleFactor) +
      Math.floor(zoomX - (zoomScaleFactor / 2)),
    y: Math.floor(e.offsetY / zoomScaleFactor) +
      Math.floor(zoomY - (zoomScaleFactor / 2))
  }
  let active: string
  if (e.ctrlKey) {
    active = ctrlSelect.value
  } else if (e.altKey) {
    active = altSelect.value
  } else {
    active = normalSelect.value
  }
  let pixel: string|number
  if (p.confirmElm(zoomPos, active)) pixel = p.defaultId
  else pixel = active
  p.setPixel(zoomPos, pixel)
  p.update()
  oldZoom()
}
/// Zoomed in canvas
const zoom = document.getElementById('zoom') as HTMLCanvasElement
zoom.addEventListener('click', zoomClick)
zoom.addEventListener('drag', zoomClick)
zoom.addEventListener('mousemove', e => {
  const x = Math.floor(e.offsetX / zoomScaleFactor)
  const y = Math.floor(e.offsetY / zoomScaleFactor)
  updateSmallLines({
    pageX: x + zoomX - (zoom.width / (2 * zoomScaleFactor)),
    pageY: y + zoomY - (zoom.width / (2 * zoomScaleFactor))
  })
})

/// Actions box button.
const resetBtn = document.getElementById('reset') as HTMLButtonElement
resetBtn.addEventListener('click', function () {
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
  this.disabled = false
  pauseBtn.disabled = true
  framecount = 0
  p.iterate() // this will prevent new user confusion by showing the zoom box when the page loads
})
const playBtn = document.getElementById('play') as HTMLButtonElement
playBtn.addEventListener('click', function (this: HTMLButtonElement) {
  p.play()
  this.disabled = true
  pauseBtn.disabled = false
  oneFrameAtATime.disabled = true
})
const pauseBtn = document.getElementById('pause') as HTMLButtonElement
pauseBtn.addEventListener('click', function (this: HTMLButtonElement) {
  this.disabled = true
  playBtn.disabled = false
  oneFrameAtATime.disabled = false
  p.pause()
})
const oneFrameAtATime = document.getElementById('oneFrameAtATime') as HTMLButtonElement
oneFrameAtATime.addEventListener('click', () => p.iterate())

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
normalFill.addEventListener('click', () => {
  p.randomlyFill(
    normalSelect.value,
    parseInt(normalFillP.value) ?? 15
  )
  p.update() // needed after any changes are made
  oldZoom()
})
/// The percent of normal elm to fill canvas with when normalFill clicked
const normalFillP = document.getElementById('normalFillP') as HTMLInputElement

/// Element placed on ctrl-click
const ctrlSelect = document.getElementById('ctrlSelect') as HTMLSelectElement
/// The button to fill canvas with ctrl elm of given percent
const ctrlFill = document.getElementById('ctrlFill') as HTMLButtonElement
ctrlFill.addEventListener('click', () => {
  p.randomlyFill(
    ctrlSelect.value,
    parseInt(ctrlFillP.value) ?? 15
  )
  p.update()
  oldZoom()
})
/// The percent of ctrl elm to fill canvas with when ctrlFill clicked
const ctrlFillP = document.getElementById('ctrlFillP') as HTMLInputElement

/// Element placed on alt-click
const altSelect = document.getElementById('altSelect') as HTMLSelectElement
/// The button to fill canvas with alt elm of given percent
const altFill = document.getElementById('altFill') as HTMLButtonElement
altFill.addEventListener('click', () => {
  p.randomlyFill(
    altSelect.value,
    parseInt(altFillP.value) ?? 15
  )
  p.update()
  oldZoom()
})
/// The percent of alt elm to fill canvas with when altFill clicked
const altFillP = document.getElementById('altFillP') as HTMLInputElement

/// Show targeter lines
const shtargeter = document.getElementById('shtargeter') as HTMLInputElement
shtargeter.addEventListener('click', function () {
  const state = this.checked ?? true ? 'visible' : 'hidden'
  smallxline.style.visibility = state
  smallyline.style.visibility = state
})
/// Hide focus box
const shfocusbox = document.getElementById('shfocusbox') as HTMLInputElement
shfocusbox.addEventListener('click', function () {
  const state = this.checked ?? true ? 'visible' : 'hidden'
  selectorBox.style.visibility = state
})
/// Hide pixelCounter
const pixelCounterT = document.getElementById('pixelCounterT') as HTMLInputElement
/// Show element customizer
const customizeT = document.getElementById('customizeT') as HTMLInputElement
customizeT.addEventListener('click', function (this: HTMLInputElement) {
  if (this.checked) {
    customizer.classList.remove('visually-hidden')
    updateCustomizer()
  } else customizer.classList.add('visually-hidden')
})

/// Version of backend
const backendversion = document.getElementById('backendversion') as HTMLSpanElement
backendversion.innerText = version

/// Text element for pixel totals
const pixelCounter = document.getElementById('pixelCounter') as HTMLDivElement

const elmdrops = document.getElementsByClassName('elmDrop')

const timedebug = true

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
    liveCell: loc => p.setPixel(loc, p.defaultId)
  },
  "Brian's Brain (on)": {
    ...rules.lifelike(p, 'B2/S'), // same pattern as seeds
    renderAs: [0, 0, 254, 255], // not quite blue
    // All cells that were "on" go into the "dying" state, which is not counted as an "on" cell in the neighbor count, and prevents any cell from being born there.
    liveCell: loc => p.setPixel(loc, "Brian's Brain (dying)")
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
p.onIterate = () => beforeIterate()
p.onAfterIterate = () => {
  oldZoom()
  afterIterate(p)
}
lasttime = performance.now()
resetBtn.click()
// vim: tabstop=2 shiftwidth=2 expandtab
