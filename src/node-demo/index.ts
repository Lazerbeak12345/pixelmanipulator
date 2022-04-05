import { PixelManipulator, rules, StringRenderer } from '../lib/pixelmanipulator'

const renderer = new StringRenderer(console.log)
renderer.defaultRenderAs = '`'
const p = new PixelManipulator(renderer, process.stdout.columns, process.stdout.rows - 1)
const bbd = p.addElement({
  name: "Brian's Brain (dying)",
  renderAs: '#',
  liveCell: loc => p.setPixel(loc, p.defaultId)
})
const bbo = p.addElement({
  ...rules.lifelike(p, 'B2/S'),
  name: "Brian's Brain (dying)",
  renderAs: '0',
  liveCell: loc => p.setPixel(loc, bbd)
})
p.randomlyFill(bbo)
setInterval(() => p.iterate(), 1000 / 15)
// vim: tabstop=2 shiftwidth=2 expandtab
