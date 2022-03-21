import { PixelManipulator, Color, version } from '../lib/pixelmanipulator'

const canvas = document.getElementById('canvas')

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

/// Within are elements only shown if there is a pattern in use
const customizeSection = document.getElementById('customizePatternSection')
/// Should this pattern loop?
const customizeLoop = document.getElementById('customizeLoop')

/// Zoomed in canvas
const zoom = document.getElementById('zoom')

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

const p: PixelManipulator = new PixelManipulator()
const timedebug = true
let framecount = 0

if (backendversion != null) backendversion.innerText = version
if (canvas == null) throw new Error('canvas could not be found!')
p.canvasPrep(zoom == null
  ? { canvas: canvas as HTMLCanvasElement }
  : {
      zoom: zoom as HTMLCanvasElement,
      canvas: canvas as HTMLCanvasElement
    })

function updateBox (): void {
  if (selectorboxSty != null && p.zoomelm != null) {
    selectorboxSty.width = `${p.zoomelm.width / p.zoomScaleFactor}px`
    selectorboxSty.height = `${p.zoomelm.height / p.zoomScaleFactor}px`
    selectorboxSty.left = `${p.zoomX - (p.zoomelm.width / (2 * p.zoomScaleFactor))}px`
    selectorboxSty.top = `${p.zoomY - (p.zoomelm.height / (2 * p.zoomScaleFactor))}px`
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
  const x = e.pageX - p.zoomX + (p.zoomScaleFactor / 2)
  const y = e.pageY - p.zoomY + (p.zoomScaleFactor / 2)
  if (p.zoomelm == null) return
  if (
    e.pageX < ((p.zoomelm.width / (2 * p.zoomScaleFactor)) + p.zoomX) &&
    e.pageX > ((p.zoomelm.width / (-2 * p.zoomScaleFactor)) + p.zoomX)
  ) {
    // for when the line is inside the box, but the cursor isn't.
    updateLargeLinesX(x, y)
  } else updateLargeLinesX(-1, y)
  if (
    e.pageY < ((p.zoomelm.height / (2 * p.zoomScaleFactor)) + p.zoomY) &&
    e.pageY > ((p.zoomelm.height / (-2 * p.zoomScaleFactor)) + p.zoomY)
  ) {
    updateLargeLinesY(x, y)
  } else updateLargeLinesY(x, -1)
}
function updateLargeLinesX (x: number, y: number): void {
  if (p.zoomelm == null) return
  const zh = p.zoomelm.height
  const zw = p.zoomelm.width
  const zsf = p.zoomScaleFactor
  let h = zh - ((1 + y) * zsf)
  let t = zsf * (y + 1)
  let h2 = y * zsf
  const rightVal = zw - zsf * (x + 1)
  if (y < 0 || y > zh / zsf) {
    h = zh
    t = 0
    h2 = 0
  }

  if (largexlinesty != null) {
    largexlinesty.width = `${p.zoomScaleFactor}px`
    largexlinesty.height = `${h}px`
    largexlinesty.right = `${rightVal}px`
    largexlinesty.top = `${t}px`
  }

  if (largexline1sty != null) {
    largexline1sty.width = `${p.zoomScaleFactor}px`
    largexline1sty.height = `${h2}px`
    largexline1sty.right = `${rightVal}px`
    largexline1sty.top = '0'
  }
}
function updateLargeLinesY (x: number, y: number): void {
  if (p.zoomelm == null) return
  const zw = p.zoomelm.width
  const zsf = p.zoomScaleFactor
  let w = zw - ((1 + x) * zsf)
  let l = zw - zsf * x
  let w2 = x * zsf
  if (x < 0 || x > zw / zsf) {
    w = zw
    l = 0
    w2 = 0
  }

  if (largeylinesty != null) {
    largeylinesty.height = `${p.zoomScaleFactor}px`
    largeylinesty.width = `${w}px`
    largeylinesty.top = `${p.zoomScaleFactor * y}px`
    largeylinesty.right = '0'
  }

  if (largeyline1sty != null) {
    largeyline1sty.height = `${p.zoomScaleFactor}px`
    largeyline1sty.width = `${w2}px`
    largeyline1sty.top = `${p.zoomScaleFactor * y}px`
    largeyline1sty.right = `${l}px`
  }
}
function selectorClicked (e: MouseEvent): void {
  p.zoom({
    x: e.pageX,
    y: e.pageY
  })
  updateBox()
}
function updateBothLargeLines (e: MouseEvent): void {
  const x = Math.floor(e.offsetX / p.zoomScaleFactor)
  const y = Math.floor(e.offsetY / p.zoomScaleFactor)
  if (p.zoomelm != null) {
    updateSmallLines({
      pageX: x + p.zoomX - (p.zoomelm.width / (2 * p.zoomScaleFactor)),
      pageY: y + p.zoomY - (p.zoomelm.width / (2 * p.zoomScaleFactor))
    })
  }
};
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
  const elm = p.elementTypeMap.get((customSelect as HTMLSelectElement).value)
  if (elm == null) return
  if (customizeColor != null) (customizeColor as HTMLInputElement).value = rgb2hex(elm.color)
  const alphaVal = (elm.color[3] ?? 255).toString()
  if (customizeColorAlpha != null) (customizeColorAlpha as HTMLInputElement).value = alphaVal// Raw alpha value
  if (customizeColorAlphaText != null) (customizeColorAlphaText as HTMLSpanElement).innerText = alphaVal
  if (customizeName != null) (customizeName as HTMLInputElement).value = elm.name
  if (customizeSection != null) {
    if (typeof elm.pattern === 'string') {
      customizeSection.classList.remove('hidden')
      if (customizeLoop != null) (customizeLoop as HTMLInputElement).checked = elm.loop ?? false
    } else customizeSection.classList.add('hidden')
  }
}
if (p.zoomelm != null) {
  p.zoomelm.addEventListener('click', zoomClick)
  p.zoomelm.addEventListener('drag', zoomClick)
}
canvas.addEventListener('click', updateBox)
canvas.addEventListener('click', (event) =>
  p.zoom({
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
if (p.zoomelm != null) p.zoomelm.addEventListener('mousemove', updateBothLargeLines)
if (largexlineElm != null) largexlineElm.addEventListener('mousemove', bigLineGotHovered)
if (largexline1Elm != null) largexline1Elm.addEventListener('mousemove', bigLineGotHovered)
if (largeylineElm != null)largeylineElm.addEventListener('mousemove', bigLineGotHovered)
if (largeyline1Elm != null)largeyline1Elm.addEventListener('mousemove', bigLineGotHovered)
if (customizeName != null) {
  customizeName.addEventListener('change', function (this: HTMLInputElement) {
    console.log('change name', this.value)
    const num = p.elementTypeMap.get((customSelect as HTMLSelectElement).value)?.number
    if (num != null) {
      p.modifyElement(num, {
        name: this.value
      })
    }
    updateCustomizer()
  })
}
function changeColor (): void {
  console.log('change color')
  const num = p.elementTypeMap.get((customSelect as HTMLSelectElement).value)?.number
  const color = hex2rgba((customizeColor as HTMLInputElement).value, parseInt((customizeColorAlpha as HTMLInputElement).value))
  if (num != null && color != null) {
    p.modifyElement(num, {
      color
    })
  }
}
if (customizeColor != null) customizeColor.addEventListener('change', changeColor)
if (customizeColorAlpha != null) customizeColorAlpha.addEventListener('change', changeColor)
if (customizeLoop != null) {
  customizeLoop.addEventListener('change', function (this: HTMLInputElement) {
    console.group('change loop', this.checked)
    const num = p.elementTypeMap.get((customSelect as HTMLSelectElement).value)?.number
    if (num != null) {
      p.modifyElement(num, {
        loop: this.checked
      })
    }
    console.groupEnd()
  })
}
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
p.zoomX = 10
p.zoomY = 10
p.addMultipleElements({
  Acid: {
    color: [110, 162, 10, 255],
    // current Pixel Matches
    liveCell: rel => {
      const randsAcid = new Uint8Array(3)
      window.crypto.getRandomValues(randsAcid)
      const newx = rel.x + (randsAcid[0] % 3) - 1
      let newy = rel.y + randsAcid[1] % 4
      const h = p.get_height()
      while ((newy >= h || p.confirmElm(newx, newy, rel.oldId, false)) && newy - 1 >= rel.y) newy--
      if (!p.confirmElm(newx, newy, rel.oldId, false)) {
        p.setPixel(rel.x, rel.y, p.defaultId, false)
        p.setPixel(newx, newy, rel.oldId, false)
      } else if (randsAcid[2] % 100 === 0)p.setPixel(newx, newy, p.defaultId)
    }
  },
  Blocks: {
    // does nothing
    color: [127, 127, 127, 255]
  },
  "Brian's Brain (dying)": {
    // not quite white
    color: [254, 254, 254, 255],
    // Cells that were in the dying state go into the off state
    liveCell: rel => p.setPixel(rel.x, rel.y, p.defaultId, false)
  },
  "Brian's Brain (on)": {
    color: [0, 0, 254, 255], // not quite blue
    // All cells that were "on" go into the "dying" state, which is not counted as an "on" cell in the neighbor count, and prevents any cell from being born there.
    liveCell: rel => p.setPixel(rel.x, rel.y, "Brian's Brain (dying)", false),
    pattern: 'B2/S' // same pattern as seeds
  },
  Seeds: {
    color: [194, 178, 128],
    pattern: 'B2/S'
  },
  "Conway's Game Of Life": {
    color: [0, 255, 0, 255],
    pattern: 'B3/S23' // born on 3, survives on 2 or 3
  },
  'Wireworld Conductor': {
    color: [67, 75, 77, 255],
    liveCell: rel => {
      const num = p.getElementByName('Wireworld Electricity')?.number
      if (num == null) return
      const conductorNearbyTotal = rel.mooreNearbyCounter(rel.x, rel.y, num)
      // copper stays as copper unless it has just one or two neighbours that are electron heads,in which case it becomes an electron head
      if (conductorNearbyTotal === 1 || conductorNearbyTotal === 2) p.setPixel(rel.x, rel.y, num)
    }
  },
  'Wireworld Electricity': {
    color: [148, 133, 0, 255],
    liveCell: rel => p.setPixel(rel.x, rel.y, 'Wireworld FadingElectricity', false)
  },
  'Wireworld FadingElectricity': {
    color: [148, 133, 0, 254],
    liveCell: rel => p.setPixel(rel.x, rel.y, 'Wireworld Conductor', false)
  },
  Highlife: {
    color: [0, 255, 128, 255],
    pattern: 'B36/S23' // born on 3 or 6, survives on 2 or 3
  },
  "No-loop Conway's Game Of Life": {
    color: [0, 150, 0, 255],
    pattern: 'B3/S23', // same as Conway's Game Of Life, but with a no-loop boolean
    loop: false
  },
  'Rule 30': {
    color: [255, 0, 255, 255],
    pattern: 'Rule 30'
  },
  'Rule 90': {
    color: [147, 112, 219, 255],
    pattern: 'Rule 90'
  },
  'Rule 110': {
    color: [128, 0, 128, 255],
    pattern: 'Rule 110'
  },
  'Rule 184': {
    color: [255, 51, 153, 255],
    pattern: 'Rule 184'
  },
  Water: {
    color: [23, 103, 167, 255],
    liveCell: (rel) => {
      const randsWater = new Uint8Array(2)
      window.crypto.getRandomValues(randsWater)
      const newx = rel.x + (randsWater[0] % 3) - 1
      let newy = rel.y + randsWater[1] % 4
      const h = p.get_height()
      while ((newy >= h || !p.confirmElm(newx, newy, p.defaultId, false)) && newy - 1 >= rel.y) newy--
      if (p.confirmElm(newx, newy, p.defaultId, false)) {
        p.setPixel(rel.x, rel.y, p.defaultId, false)
        p.setPixel(newx, newy, rel.oldId, false)
      }
    }
  }
})
function onZoomClick (e: MouseEvent, rel: {x: number, y: number}): string { // an event-like function that returns what should be set where the zoom ctx was clicked
  let active = ''
  if (e.ctrlKey && ctrlSelect != null) active = (ctrlSelect as HTMLSelectElement).value
  else if (e.altKey && altSelect != null) active = (altSelect as HTMLSelectElement).value
  else if (normalSelect != null) active = (normalSelect as HTMLSelectElement).value
  if (p.confirmElm(rel.x, rel.y, active)) active = p.elementNumList[p.defaultId]
  return active
}
function zoomClick (e: MouseEvent): void {
  const zoomXPos =
    Math.floor(e.offsetX / p.zoomScaleFactor) +
    Math.floor(p.zoomX - (p.zoomScaleFactor / 2))
  const zoomYPos =
    Math.floor(e.offsetY / p.zoomScaleFactor) +
    Math.floor(p.zoomY - (p.zoomScaleFactor / 2))
  p.setPixel(zoomXPos, zoomYPos, onZoomClick(e, { x: zoomXPos, y: zoomYPos }))
  p.update()
  p.zoom()
}
let lasttime = performance.now()
p.onIterate = () => {
  if (timedebug) lasttime = performance.now()
  framecount++
}
if (pixelCounterT != null && pixelCounter != null) {
  p.onAfterIterate = () => {
    if (!(pixelCounterT as HTMLInputElement).checked) {
      let text = ''
      for (const id in p.pixelCounts) {
        const elm = p.elementNumList[parseInt(id)]
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
      p.reset(zwE == null || zhE == null
        ? {
            canvasW,
            canvasH
          }
        : {
            canvasW,
            canvasH,
            zoomW: parseInt((zwE as HTMLInputElement).value),
            zoomH: parseInt((zhE as HTMLInputElement).value)
          }) // Reccomended to have a function here that sets the canvas size here (or earlier), due to how startup works.
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
  })
}
if (ctrlFill != null && ctrlSelect != null && ctrlFillP != null) {
  ctrlFill.addEventListener('click', () => {
    p.randomlyFill(
      (ctrlSelect as HTMLSelectElement).value,
      parseInt((ctrlFillP as HTMLInputElement).value) ?? 15
    )
    p.update()
  })
}
if (altFill != null && altSelect != null && altFillP != null) {
  altFill.addEventListener('click', () => {
    p.randomlyFill(
      (altSelect as HTMLSelectElement).value,
      parseInt((altFillP as HTMLInputElement).value) ?? 15
    )
    p.update()
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
    for (let ni = 0; ni < p.elementNumList.length; ni++) {
      const elementName = p.elementNumList[ni]
      const newElement = document.createElement('option')
      newElement.innerText = elementName
      elmdrops[i].appendChild(newElement)
    }
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
