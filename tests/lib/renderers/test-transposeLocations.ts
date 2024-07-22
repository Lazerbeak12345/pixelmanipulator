import { testProp, fc } from '@fast-check/ava'
import { type Arbitrary } from 'fast-check'
import { transposeLocations, type Location } from '../../../src/lib/pixelmanipulator'
const locationParam = fc.nat()
const location = fc.tuple(locationParam, locationParam).map(([x, y]) => ({ x, y }))
const listSize = fc.nat({ max: 2_500 })
function listOf<T> (itemF: () => T, len: number): T[] {
  return new Array(len).fill({}).map(itemF)
}
testProp('list of -A added to item A is list of zeros', [location, listSize], (t, loc, len) => t.deepEqual(
  transposeLocations(listOf(() => ({ x: loc.x * -1, y: loc.y * -1 }), len), loc),
  listOf(() => ({ x: 0, y: 0 }), len)))
testProp('list of A added to item A is list of 2 * A', [location, listSize], (t, loc, len) => t.deepEqual(
  transposeLocations(listOf(() => ({ x: loc.x, y: loc.y }), len), loc),
  listOf(() => ({ x: loc.x * 2, y: loc.y * 2 }), len)))
function tLFE (locs: Location[], trLoc: Location, f: (loc: Location, i: number) => void): void {
  transposeLocations(locs, trLoc).forEach(f)
}
function arrayNo0<T> (item: Arbitrary<T>): Arbitrary<T[]> {
  return fc.array(item).filter(array => array.length > 0)
}
const locations = arrayNo0(location)
const locationNo0 = location.filter(({ x, y }) => x !== 0 && y !== 0)
testProp(
  'list of * added to item |A| is greater than it was before',
  [
    locations,
    locationNo0.map(({ x, y, ...rest }) =>
      ({ x: Math.abs(x), y: Math.abs(y), ...rest }))
  ],
  (t, locs, trLoc) => { tLFE(locs, trLoc, ({ x, y }, index) => {
    const old = locs[index]
    t.true(x > old.x)
    t.true(y > old.y)
  }); }
)
testProp(
  'list of * added to item -|A| is less than it was before',
  [
    locations,
    locationNo0.map(({ x, y, ...rest }) =>
      ({ x: Math.abs(x) * -1, y: Math.abs(y) * -1, ...rest }))
  ],
  (t, locs, trLoc) => { tLFE(locs, trLoc, ({ x, y }, index) => {
    const old = locs[index]
    t.true(x < old.x)
    t.true(y < old.y)
  }); }
)
const locationWithFrame = fc.tuple(location, fc.integer()).map(([loc, frame]) => ({ frame, ...loc }))
const locationsWithFrame = arrayNo0(locationWithFrame)
testProp(
  'list of A with frames def added to B without is C with frames def',
  [
    locationsWithFrame,
    location
  ],
  (t, locs, trLoc) => { tLFE(locs, trLoc, ({ frame }, index) => t.is(frame, locs[index].frame)); }
)
const locationWithLoop = fc.tuple(location, fc.boolean()).map(([loc, loop]) => ({ loop, ...loc }))
const locationsWithLoop = arrayNo0(locationWithLoop)
testProp(
  'list of A with loop def added to B without is C with loop def',
  [
    locationsWithLoop,
    location
  ],
  (t, locs, trLoc) => { tLFE(locs, trLoc, ({ loop }, index) => t.is(loop, locs[index].loop)); }
)
testProp(
  'list of A without frames def added to B with is C with frames def',
  [
    locations,
    locationWithFrame
  ],
  (t, locs, trLoc) => { tLFE(locs, trLoc, ({ frame }) => t.is(frame, trLoc.frame)); }
)
testProp(
  'list of A without loop def added to B with is C with loop def',
  [
    locations,
    locationWithLoop
  ],
  (t, locs, trLoc) => { tLFE(locs, trLoc, ({ loop }) => t.is(loop, trLoc.loop)); }
)
testProp(
  'list of A with frames def added to B with is C with frames def and set to A frame',
  [
    locationsWithFrame,
    locationWithFrame
  ],
  (t, locs, trLoc) => { tLFE(locs, trLoc, ({ frame }, index) => t.is(frame, locs[index].frame)); }
)
testProp(
  'list of A with loop def added to B with is C with loop def and set to A frame',
  [
    locationsWithLoop,
    locationWithLoop
  ],
  (t, locs, trLoc) => { tLFE(locs, trLoc, ({ loop }, index) => t.is(loop, locs[index].loop)); }
)
// vi: tabstop=2 shiftwidth=2 expandtab
