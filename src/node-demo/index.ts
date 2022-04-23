/** To run me
*
* 1. Clone this repo.
* 2. `npm i`
* 3. `npm run node-demo`
*/
import { PixelManipulator, rules, StringRenderer } from '../lib/pixelmanipulator'

const renderer = new StringRenderer(str => {
  console.clear()
  console.log(str)
})
renderer.defaultRenderAs = '`'
const p = new PixelManipulator(renderer, process.stdout.columns, process.stdout.rows - 1)
const bbd = p.addElement({
  name: "Brian's Brain (dying)",
  renderAs: '#',
  liveCell: loc => p.setPixel(loc, p.defaultId)
})
const bbo = p.addElement({
  ...rules.lifelike(p, 'B2/S'),
  name: "Brian's Brain (on)",
  renderAs: '0',
  liveCell: loc => p.setPixel(loc, bbd)
})
p.randomlyFill(bbo)
setInterval(() => p.iterate(), 1000 / 15)
// vim: tabstop=2 shiftwidth=2 expandtab
