import { testProp, fc } from '@fast-check/ava'
import { location2Index } from '../../src/pixelmanipulator'
import { sizeWithoutDuplicates } from '../_functions'

const wOrH = fc.integer({
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Can't have w of zero
  min: 1,
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Memory space and time saver
  max: 500
})

function listFullOfIndexes (w: number, h: number): number[] {
  const list:number[] = []
  const STEP=1
  for (let y = 0; y < h; y+=STEP) { // That we start on y matters a lot.
    for (let x = 0; x < w; x+=STEP) {
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
