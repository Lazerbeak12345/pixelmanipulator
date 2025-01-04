/* eslint-disable max-lines -- TODO: break this into more files */

import { createApp, ref, reactive } from 'vue'
import { createPinia, defineStore } from 'pinia'
import 'bootstrap/js/dist/collapse' // For #sideAccordion

import FPSControl from 'fps-control'
import { PixelManipulator, rules, Ctx2dRenderer } from 'pixelmanipulator'
//import '@fortawesome/fontawesome-free/attribution.js'

import Footer from './components/footer/Footer.vue'
import AppSettings from './components/settings/AppSettings.vue'

import TargeterStats from './components/TargeterStats.vue'

import CustomizeName from './components/CustomizeName.vue'
import CustomColorAlpha from './components/CustomColorAlpha.vue'
import CustomizeColor from './components/CustomizeColor.vue'
import CustomSelect from './components/CustomSelect.vue'

/* Use pinia for anything where the state can't be contained entirely within one vue app yet */
const pinia = createPinia()

const footer = createApp(Footer)
footer.mount("#footer")

const useTargeterLocStore = defineStore("targeterLoc", {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- start at top-left corner
  state:()=>({ x: 0, y: 0 })
})

const targeterStatsApp = createApp(TargeterStats, {
  useTargeterLocStore
})
targeterStatsApp.use(pinia)
targeterStatsApp.mount("#targeterStats")

/**
* The X coordinate of where the center of [[zoom]] is windowed at.
*/
let zoomX = 10
/**
* The Y coordinate of where the center of the [[zoom]] is windowed at.
*/
let zoomY = 10
const targeterLoc = useTargeterLocStore()
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const targeterStats = document.getElementById('targeterStats') as HTMLDivElement
const ZOOM_SCALE_RAD_FACTOR = 2 // the scale factor is the radius, 1/2 the diameter
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
function oldZoom(e?: { // eslint-disable-line complexity -- TODO: too complex
  /** Position to center the zoom elm on. (If absent, uses
  * [[PixelManipulator.zoomX]]) */
  x?: number
  /** Position to center the zoom elm on. (If absent, uses
  * [[PixelManipulator.zoomY]]) */
  y?: number
}): void {
  if (zoomctx == null) return
  const { ctx: cctx } = renderer
  zoomctx.imageSmoothingEnabled = false
  zoomctx.strokeStyle = 'gray'
  zoomctx.fillStyle = '#88888888'
  cctx.strokeStyle = '#FFFFFF88'
  cctx.fillStyle = '#88888888'
  if (typeof e === 'undefined') e = {}
  e.x ??= zoomX
  e.y ??= zoomY
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- update zoom only if in bounds
  if (e.x >= 0 && e.y >= 0) {
    ({ x: zoomX, y: zoomY } = e)
  }
  if (settingsStore.shTargeter) {
    const THICKNESS = 1
    cctx.fillRect(targeterLoc.x + THICKNESS, targeterLoc.y, canvas.width, THICKNESS)
    cctx.fillRect(targeterLoc.x, targeterLoc.y + THICKNESS, THICKNESS, canvas.height)
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- left side
    cctx.fillRect(0, targeterLoc.y, targeterLoc.x, THICKNESS)
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- top side
    cctx.fillRect(targeterLoc.x, 0, THICKNESS, targeterLoc.y)
    targeterStats.classList.remove('visually-hidden')
  } else {
    targeterStats.classList.add('visually-hidden')
  }
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- top left corner
  zoomctx.clearRect(0, 0, zoom.width, zoom.height)// clear the screen
  zoomctx.drawImage(canvas, // draw the selected section of the canvas onto the zoom canvas
    (zoomX - Math.floor(zoomScaleFactor / ZOOM_SCALE_RAD_FACTOR)),
    (zoomY - Math.floor(zoomScaleFactor / ZOOM_SCALE_RAD_FACTOR)),
    Math.floor(zoom.width / zoomScaleFactor), Math.floor(zoom.height / zoomScaleFactor),
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- top left corner
    0, 0,
    zoom.width, zoom.height)
  // Render the box _after_ copying over to zoom canvas
  if (settingsStore.shFocusBox) {
    const fbw = zoom.width / zoomScaleFactor
    const fbh = zoom.height / zoomScaleFactor
    const fbx = zoomX - (zoom.width / (ZOOM_SCALE_RAD_FACTOR * zoomScaleFactor))
    const fby = zoomY - (zoom.height / (ZOOM_SCALE_RAD_FACTOR * zoomScaleFactor))
    cctx.fillRect(fbx, fby, fbw, fbh)
    if (
      targeterLoc.x >= fbx &&
      targeterLoc.x <= fbx + fbw &&
      targeterLoc.y >= fby &&
      targeterLoc.y <= fby + fbh
    ) {
      cctx.strokeRect(fbx, fby, fbw, fbh)
    }
  }
  zoomctx.beginPath()// draw the grid
  for (let i = 1; i < (zoom.width / zoomScaleFactor); i++) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- top
    zoomctx.moveTo(i * zoomScaleFactor, 0)
    zoomctx.lineTo(i * zoomScaleFactor, zoom.height)
  }
  for (let i = 1; i < (zoom.height / zoomScaleFactor); i++) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- left
    zoomctx.moveTo(0, i * zoomScaleFactor)
    zoomctx.lineTo(zoom.width, i * zoomScaleFactor)
  }
  zoomctx.stroke()
}
function updateSmallLines({ offsetX: x, offsetY: y }: MouseEvent | { offsetX: number, offsetY: number }): void {
  targeterLoc.x = x
  targeterLoc.y = y
  p.update() // Erases old lines
  oldZoom()
}
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- clearly to compare to zero
const fpsc = new FPSControl(60)
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const fps = document.getElementById('fps') as HTMLParagraphElement
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const fpsMax = document.getElementById('fpsMax') as HTMLParagraphElement
const useSettingsStore = defineStore("settings", ()=> ({
  unlimitedFps : ref(false),
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- fps default
  fpsAmount : ref(60),
  /// Sizes for render canvas
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default values
  size : reactive({ w: 150, h: 150 }),
  /// Sizes for zoom canvas
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default values
  zoomSize : reactive({ w: 20, h: 20 }),
  /// Show targeter lines
  shTargeter : ref(true),
  /// Show focus box
  shFocusBox: ref(true),
  /// Show pixelCounter
  pixelCounterT: ref(true),
}))
const settingsApp = createApp(AppSettings, {
  useSettingsStore,
  changeFps: (fpsAmount: number)=>{
    fpsc.setFPS(fpsAmount)
    fpsMax.innerText = fpsAmount.toString()
  },
  changeUnlimited: (unlimited: boolean) => {
    if (unlimited) {
      fpsMax.innerText = 'unlimited'
    } else {
      const { fpsAmount } = settingsStore
      fpsMax.innerText = fpsAmount.toString()
    }
  },
  changeTargeter: () => {
    p.update()
    oldZoom()
  },
  changePixelCounterT: (checked:boolean) => {
    if (checked) {
      pixelCounterBox.classList.remove('visually-hidden')
    } else {
      pixelCounterBox.classList.add('visually-hidden')
    }
  }
})
settingsApp.use(pinia)
settingsApp.mount("#settingsApp")
const settingsStore = useSettingsStore()
let framecount = 0
let lasttime: number = performance.now()
function beforeIterate(): false | undefined {
  if (!settingsStore.unlimitedFps && !fpsc.check()) return false
  frames.innerText = `${++framecount}`
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- convert to frames/second
  fps.innerText = (1 / ((performance.now() - lasttime) / 1000)).toFixed(3)
  lasttime = performance.now()
  return undefined
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const frames = document.getElementById('frames') as HTMLParagraphElement
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const pixelRatio = document.getElementById('pixelRatio') as HTMLDivElement
function afterIterate<T>(p: PixelManipulator<T>): void {
  pixelRatio.innerHTML = ''
  if (!settingsStore.pixelCounterT) return
  pixelCounter.innerHTML = ''
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- all but last item in render info TODO: why
  pixelRatio.style.background = `rgb(${renderer.renderInfo[p.defaultId].slice(0, -1).join(',')})`
  const area = p.get_width() * p.get_height()
  Object.keys(p.elements).forEach(idStr => {
    const id = parseInt(idStr)
    const { elements: { [id]: { name } }, pixelCounts: { [id]: count } } = p
    if (typeof count === "undefined") return
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- all but last item in render info TODO: why
    const color = 'rgb(' + renderer.renderInfo[id].slice(0, -1).join(',') + ')'
    const MAX_PERCENT = 100
    const percent = count / area * MAX_PERCENT

    const li = document.createElement('li')
    li.classList.add('list-group-item')
    {
      const icon = document.createElement('i')
      icon.classList.add('fa-solid', 'fa-square-poll-horizontal')
      icon.style.color = color
      icon.setAttribute('aria-hidden', 'true')
      li.appendChild(icon)
    }
    li.appendChild(document.createTextNode(` ${name}: `))
    {
      const span = document.createElement('span')
      span.classList.add('badge', 'bg-primary')
      span.innerText = `${count}`
      {
        const unit = document.createElement('span')
        unit.classList.add('visually-hidden')
        unit.innerText = ' pixels'
        span.appendChild(unit)
      }
      li.appendChild(span)
    }
    li.appendChild(document.createTextNode(' '))
    {
      const span = document.createElement('span')
      span.classList.add('badge', 'bg-secondary')
      span.innerText = `${Math.round(percent)}%`
      li.appendChild(span)
    }
    pixelCounter.appendChild(li)

    const ratioE = document.createElement('div')
    ratioE.classList.add('progress-bar')
    ratioE.setAttribute('role', 'progressbar')
    ratioE.style.backgroundColor = color
    ratioE.style.width = `${percent}%`
    ratioE.setAttribute('aria-valuenow', `${Math.round(percent)}`)
    ratioE.setAttribute('aria-valuetext', `${Math.round(percent)}% full of ${name}`)
    ratioE.setAttribute('aria-valuemin', '0')
    ratioE.setAttribute('aria-valuemax', '100')
    ratioE.title = `${name} : ${Math.round(percent)}%`
    pixelRatio.appendChild(ratioE)
  })
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const canvas = document.getElementById('canvas') as HTMLCanvasElement
canvas.addEventListener('click', event => {
  p.update()
  oldZoom({
    x: event.offsetX,
    y: event.offsetY
  })
})
canvas.addEventListener('mousemove', updateSmallLines)
const renderer = new Ctx2dRenderer(canvas)
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default values
const p = new PixelManipulator(renderer, 1, 1)
// The width and height are changed later

const useCustomizeStore = defineStore("customize", ()=>{
  /// Select the element to customize
  const selected = ref("Conway's Game Of Life")
  /// List of elements that should be in an elmDrop
  const elements = ref<string[]>([])
  function updateElements(): void {
    elements.value = p.elements.map(({ name }) => name)
  }
  /// Change the color
  const color = ref('')
  const alpha = ref("0")
  /// Name of element
  const name = ref("")
  return { selected, elements, updateElements, color, alpha, name }
})
const customizeStore = useCustomizeStore()
const customSelectApp = createApp(CustomSelect, {
  useCustomizeStore,
  change: ()=> { updateCustomizer(); }
})
customSelectApp.use(pinia)
customSelectApp.mount("#customSelectApp")
function updateCustomizer(): void {
  const elm = p.getElementByName(customizeStore.selected)
  if (elm == null) return
  const { renderAs, name } = elm
  const DEFAULT_DOT = 255
  const START_OF_COLOR = 0
  const ALPHA_INDEX = 3
  const HEX_VALUES_PER_DIGIT = 16
  const DIGITS_PER_DOT = 2
  customizeStore.color = `#${renderAs.slice(START_OF_COLOR, ALPHA_INDEX).map(dot =>
    dot.toString(HEX_VALUES_PER_DIGIT).padStart(DIGITS_PER_DOT, '0')
  ).join('')}`
  customizeStore.alpha = (renderAs[ALPHA_INDEX] ?? DEFAULT_DOT).toString()
  customizeStore.name = name
}
function changeColor(): void {
  console.log('change color')
  const num = p.nameToId(customizeStore.selected)
  const NOT_FOUND = -1
  if (num === NOT_FOUND) return
  const matches = /#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(customizeStore.color)
  if (matches == null) return
  // The 0th is just the whole string
  const RED_IDX = 1
  const GREEN_IDX = 2
  const BLUE_IDX = 3
  const HEX_VALUES_PER_DIGIT = 16
  p.modifyElement(num, {
    renderAs: [
      parseInt(matches[RED_IDX], HEX_VALUES_PER_DIGIT),
      parseInt(matches[GREEN_IDX], HEX_VALUES_PER_DIGIT),
      parseInt(matches[BLUE_IDX], HEX_VALUES_PER_DIGIT),
      parseInt(customizeStore.alpha)
    ]
  })
}
const customizeColorApp = createApp(CustomizeColor, {
  useCustomizeStore,
  change: changeColor,
})
customizeColorApp.use(pinia)
customizeColorApp.mount("#customizeColorApp")
const customColorAlphaApp = createApp(CustomColorAlpha, {
  useCustomizeStore,
  change: changeColor,
})
customColorAlphaApp.use(pinia)
customColorAlphaApp.mount("#customColorAlphaApp")
const customizeNameApp = createApp(CustomizeName, {
  useCustomizeStore,
  change: (name: string) => {
    console.log('change name', name)
    const num = p.nameToId(customizeStore.selected)
    const NOT_FOUND = -1
    if (num > NOT_FOUND) {
      p.modifyElement(num, { name })
    }
    updateCustomizer()
  }
})
customizeNameApp.use(pinia)
customizeNameApp.mount("#customizeNameApp")

function zoomClick(e: MouseEvent): void {
  const zoomPos = {
    x: Math.floor(e.offsetX / zoomScaleFactor) +
      Math.floor(zoomX - (zoomScaleFactor / ZOOM_SCALE_RAD_FACTOR)),
    y: Math.floor(e.offsetY / zoomScaleFactor) +
      Math.floor(zoomY - (zoomScaleFactor / ZOOM_SCALE_RAD_FACTOR))
  }
  const active: string = e.ctrlKey ?
    ctrlSelect.value :
    e.altKey ?
      altSelect.value :
      normalSelect.value
  const pixel: string | number = p.confirmElm(zoomPos, active) ? p.defaultId : active
  p.setPixel(zoomPos, pixel)
  p.update()
  oldZoom()
}
/// Zoomed in canvas
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const zoom = document.getElementById('zoom') as HTMLCanvasElement
zoom.addEventListener('click', zoomClick)
zoom.addEventListener('drag', zoomClick)
zoom.addEventListener('mousemove', e => {
  const x = Math.floor(e.offsetX / zoomScaleFactor)
  const y = Math.floor(e.offsetY / zoomScaleFactor)
  updateSmallLines({
    offsetX: x + zoomX - (zoom.width / (ZOOM_SCALE_RAD_FACTOR * zoomScaleFactor)),
    offsetY: y + zoomY - (zoom.width / (ZOOM_SCALE_RAD_FACTOR * zoomScaleFactor))
  })
})

/** Converts the pause button into a play button */
function convertPauseToPlay(): void {
  playBtn.title = 'Play'
  const playIcon = playBtn.querySelector('i')
  playIcon?.classList.replace('fa-pause', 'fa-play')
  playIcon?.setAttribute('alt', 'Play')
}
/** Converts the play button into a pause button */
function convertPlayToPause(): void {
  playBtn.title = 'Pause'
  const playIcon = playBtn.querySelector('i')
  playIcon?.classList.replace('fa-play', 'fa-pause')
  playIcon?.setAttribute('alt', 'Pause')
}
/// Actions box button.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const resetBtn = document.getElementById('reset') as HTMLButtonElement
resetBtn.addEventListener('click', function() {
  const {
    size: { w: canvasW, h: canvasH },
    zoomSize: { w: zoomW, h: zoomH }
  } = settingsStore
  p.reset({ canvasW, canvasH })
  // Reccomended to have a function here that sets the canvas size here (or earlier), due to how startup works.
  zoom.width = (Number.isNaN(zoomW) ? zoom.width / zoomScaleFactor : zoomW) * zoomScaleFactor
  zoom.height = (Number.isNaN(zoomH) ? zoom.height / zoomScaleFactor : zoomH) * zoomScaleFactor
  convertPauseToPlay()
  oneFrameAtATime.disabled = false
  this.disabled = false
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- reset it to default
  framecount = 0
  p.iterate() // this will prevent new user confusion by showing the zoom box when the page loads
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const playBtn = document.getElementById('play') as HTMLButtonElement
playBtn.addEventListener('click', () => {
  if (p.mode === 'paused') {
    p.play()
    convertPlayToPause()
    oneFrameAtATime.disabled = true
  } else {
    p.pause()
    convertPauseToPlay()
    oneFrameAtATime.disabled = false
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const oneFrameAtATime = document.getElementById('oneFrameAtATime') as HTMLButtonElement
oneFrameAtATime.addEventListener('click', () => { p.iterate(); })

/// Element placed on normal-click
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const normalSelect = document.getElementById('normalSelect') as HTMLSelectElement
/// The button to fill canvas with normal elm of given percent
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const normalFill = document.getElementById('normalFill') as HTMLButtonElement
normalFill.addEventListener('click', () => {
  const fillP = parseInt(normalFillP.value)
  p.randomlyFill(
    normalSelect.value,
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default fill percent
    Number.isNaN(fillP) ? 15 : fillP
  )
  p.update() // needed after any changes are made
  oldZoom()
})
/// The percent of normal elm to fill canvas with when normalFill clicked
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const normalFillP = document.getElementById('normalFillP') as HTMLInputElement

/// Element placed on ctrl-click
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const ctrlSelect = document.getElementById('ctrlSelect') as HTMLSelectElement
/// The button to fill canvas with ctrl elm of given percent
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const ctrlFill = document.getElementById('ctrlFill') as HTMLButtonElement
ctrlFill.addEventListener('click', () => {
  const fillP = parseInt(ctrlFillP.value)
  p.randomlyFill(
    ctrlSelect.value,
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default fill percent
    Number.isNaN(fillP) ? 15 : fillP
  )
  p.update()
  oldZoom()
})
/// The percent of ctrl elm to fill canvas with when ctrlFill clicked
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const ctrlFillP = document.getElementById('ctrlFillP') as HTMLInputElement

/// Element placed on alt-click
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const altSelect = document.getElementById('altSelect') as HTMLSelectElement
/// The button to fill canvas with alt elm of given percent
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const altFill = document.getElementById('altFill') as HTMLButtonElement
altFill.addEventListener('click', () => {
  const fillP = parseInt(altFillP.value)
  p.randomlyFill(
    altSelect.value,
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default fill percent
    Number.isNaN(fillP) ? 15 : fillP
  )
  p.update()
  oldZoom()
})
/// The percent of alt elm to fill canvas with when altFill clicked
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const altFillP = document.getElementById('altFillP') as HTMLInputElement

/// Text element for pixel totals
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const pixelCounter = document.getElementById('pixelCounter') as HTMLUListElement
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO: use a MVC tool instead (svelte, vue3, etc)
const pixelCounterBox = document.getElementById('pixelCounterBox') as HTMLUListElement

const elmdrops = document.getElementsByClassName('elmDrop')

const zoomctx = zoom.getContext('2d')
if (zoomctx == null) {
  throw new Error('rendering context not supported')
}
/**
* How many times bigger should the zoom elm be as compared to the actual size found in the normal canvas?
*/
const zoomScaleFactor = 20
oldZoom({ // zoom at the center
  x: Math.floor(zoom.width / ZOOM_SCALE_RAD_FACTOR) -
    (Math.floor(zoom.width / ZOOM_SCALE_RAD_FACTOR) * zoomScaleFactor),
  y: Math.floor(zoom.height / ZOOM_SCALE_RAD_FACTOR) -
    (Math.floor(zoom.height / ZOOM_SCALE_RAD_FACTOR) * zoomScaleFactor)
})

// eslint-disable-next-line complexity -- TODO: simplify
p.onElementModified = () => {
  let { value: nsv } = normalSelect
  let { value: csv } = ctrlSelect
  let { value: asv } = altSelect
  const { selected: cusv } = customizeStore
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- fallback if empty
  if (nsv.length === 0) nsv = "Conway's Game Of Life"
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- fallback if empty
  if (csv.length === 0) csv = 'Blocks'
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- fallback if empty
  if (asv.length === 0) asv = 'Water'
  // TODO: generalize this into components
  Array.from(elmdrops).forEach(htmlElm => {
    htmlElm.innerHTML = ''
    p.elements.forEach(elm => {
      const newElement = document.createElement('option')
      const { name } = elm
      newElement.innerText = name
      htmlElm.appendChild(newElement)
    })
  })
  // Restore that selection, accounting for aliases
  normalSelect.value = p.getElementByName(nsv)?.name ?? ''
  ctrlSelect.value = p.getElementByName(csv)?.name ?? ''
  altSelect.value = p.getElementByName(asv)?.name ?? ''
  customizeStore.updateElements()
  // TODO: abstract away the default value
  customizeStore.selected = p.getElementByName(cusv)?.name ?? "Conway's Game Of Life"

  updateCustomizer()
}
p.addMultipleElements({
  Acid: {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [110, 162, 10, 255],
    // current Pixel Matches
    // eslint-disable-next-line complexity -- don't think it matters much
    liveCell: ({ x, y, oldId }) => {
      const NO_OF_RAND_VALS = 3
      const randsAcid = new Uint8Array(NO_OF_RAND_VALS)
      window.crypto.getRandomValues(randsAcid)
      const [xRand, yRand, disapearRand] = Array.from(randsAcid)
      const LEFT_ONE = -1
      const UP_ONE = -1
      const X_RANGE = 3
      const Y_RANGE = 4
      const newLoc = {
        x: x + (xRand % X_RANGE) + LEFT_ONE,
        y: y + yRand % Y_RANGE,
        loop: false
      }
      const h = p.get_height()
      while ((newLoc.y >= h || p.confirmElm(newLoc, oldId)) && newLoc.y + UP_ONE >= y) {
        newLoc.y--
      }
      if (!p.confirmElm(newLoc, oldId)) {
        p.setPixel({ x, y, loop: false }, p.defaultId)
        p.setPixel(newLoc, oldId)
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 1 in 100 chance
      } else if (disapearRand % 100 === 0) {
        p.setPixel(newLoc, p.defaultId)
      }
    }
  },
  Blocks: {
    // does nothing
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [127, 127, 127, 255]
  },
  "Brian's Brain (dying)": {
    // not quite white
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [254, 254, 254, 255],
    // Cells that were in the dying state go into the off state
    liveCell: loc => { p.setPixel(loc, p.defaultId); }
  },
  "Brian's Brain (on)": {
    ...rules.lifelike(p, 'B2/S'), // same pattern as seeds
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [0, 0, 254, 255], // not quite blue
    // All cells that were "on" go into the "dying" state, which is not counted as an "on" cell in the neighbor count, and prevents any cell from being born there.
    liveCell: loc => { p.setPixel(loc, "Brian's Brain (dying)"); }
  },
  Seeds: {
    ...rules.lifelike(p, 'B2/S'),
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [194, 178, 128]
  },
  "Conway's Game Of Life": {
    ...rules.lifelike(p, 'B3/S23'), // born on 3, survives on 2 or 3
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [0, 255, 0, 255]
  },
  'Wireworld Conductor': {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [67, 75, 77, 255],
    liveCell: loc => {
      const num = p.nameToId('Wireworld Electricity')
      const NOT_FOUND = -1
      if (num === NOT_FOUND) return
      const { x, y } = loc
      const NEXT_FRAME = 1
      const conductorNearbyTotal = p.mooreNearbyCounter({ x, y, frame: NEXT_FRAME }, num)
      // copper stays as copper unless it has just one or two neighbours that are electron heads,in which case it becomes an electron head
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- (see above)
      const allowedNums = new Set([1, 2])
      if (allowedNums.has(conductorNearbyTotal)) {
        p.setPixel(loc, num)
      }
    }
  },
  'Wireworld Electricity': {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [148, 133, 0, 255],
    liveCell: ({ x, y }) => { p.setPixel({ x, y, loop: false }, 'Wireworld FadingElectricity'); }
  },
  'Wireworld FadingElectricity': {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [74, 61, 0, 255],
    liveCell: ({ x, y }) => { p.setPixel({ x, y, loop: false }, 'Wireworld Conductor'); }
  },
  Highlife: {
    ...rules.lifelike(p, 'B36/S23'), // born on 3 or 6, survives on 2 or 3
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [0, 255, 128, 255]
  },
  "No-loop Conway's Game Of Life": {
    ...rules.lifelike(p, 'B3/S23', false), // same as Conway's Game Of Life, but with a no-loop boolean
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [0, 150, 0, 255]
  },
  'Rule 30': {
    ...rules.wolfram(p, 'Rule 30', false),
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [255, 0, 255, 255]
  },
  'Rule 90': {
    ...rules.wolfram(p, 'Rule 90', false),
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [147, 112, 219, 255]
  },
  'Rule 110': {
    ...rules.wolfram(p, 'Rule 110', false),
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [128, 0, 128, 255]
  },
  'Rule 184': {
    ...rules.wolfram(p, 'Rule 184', false),
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [255, 51, 153, 255]
  },
  Water: {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- color
    renderAs: [23, 103, 167, 255],
    liveCell: ({ x, y, oldId }) => {
      const NO_OF_RAND_VALS = 2
      const randsWater = new Uint8Array(NO_OF_RAND_VALS)
      window.crypto.getRandomValues(randsWater)
      const [xRand, yRand] = Array.from(randsWater)
      const X_RANGE = 3
      const Y_RANGE = 4
      const LEFT_ONE = -1
      const UP_ONE = -1
      const newLoc = {
        x: x + (xRand % X_RANGE) + LEFT_ONE,
        y: y + yRand % Y_RANGE,
        loop: false
      }
      const h = p.get_height()
      while ((newLoc.y >= h || !p.confirmElm(newLoc, p.defaultId)) && newLoc.y + UP_ONE >= y) {
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
