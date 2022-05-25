import { testProp, fc } from 'ava-fast-check'
import { location2Index } from '../../../src/lib/pixelmanipulator'
import { sizeWithoutDuplicates } from '../_functions'

const wOrH = fc.integer({
  min: 1, // Can't have w of zero
  max: 500 // Memory space and time saver
})

function listFullOfIndexes (w: number, h: number): number[] {
  const list = []
  for (let y = 0; y < h; y++) { // That we start on y matters a lot.
    for (let x = 0; x < w; x++) {
      list.push(location2Index({ x, y }, w))
    }
  }
  return list
}

testProp('returns no duplicates', [wOrH, wOrH], (t, w, h) => {
  const list = listFullOfIndexes(w, h)
  t.is(list.length, sizeWithoutDuplicates(list), 'Check for duplicates.')
  t.is(list.length, w * h, 'Size is w * h')
})
// Not a need right now
// test.todo('index2Location is an opposite')
testProp('order is correct', [wOrH, wOrH], (t, w, h) => {
  const list = listFullOfIndexes(w, h)
  const example = new Array(w * h).fill(NaN).map((_, index) => index)
  t.deepEqual(list, example)
})
// vi: tabstop=2 shiftwidth=2 expandtab
