/** To run me
*
* 1. Clone this repo, then run the following commands at the root of the monorepo.
* 2. `pnpm i`
* 3. `pnpm build`
* 4. `pnpm node-demo`
*/
import { PixelManipulator, rules, StringRenderer } from 'pixelmanipulator'

const renderer = new StringRenderer(str => {
  console.clear()
  console.log(str)
})
renderer.defaultRenderAs = '`'
// make space for cursor
const EMPTY_ROW_HEIGHT = 1
const p = new PixelManipulator(renderer, process.stdout.columns, process.stdout.rows - EMPTY_ROW_HEIGHT)
const bbd = p.addElement({
  name: "Brian's Brain (dying)",
  renderAs: '#',
  liveCell: loc => { p.setPixel(loc, p.defaultId); }
})
const bbo = p.addElement({
  ...rules.lifelike(p, 'B2/S'),
  name: "Brian's Brain (on)",
  renderAs: '0',
  liveCell: loc => { p.setPixel(loc, bbd); }
})
p.randomlyFill(bbo)
const MILLISECOND_PER_SECOND = 1000
const FRAME_PER_SECOND_SCALOR = 15
setInterval(() => { p.iterate(); }, MILLISECOND_PER_SECOND / FRAME_PER_SECOND_SCALOR)
// vim: tabstop=2 shiftwidth=2 expandtab
