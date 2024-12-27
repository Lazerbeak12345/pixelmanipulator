import test from 'ava'
import { testProp, fc } from '@fast-check/ava'
import { neighborhoods } from '../../../src/lib/pixelmanipulator'
import { sizeWithoutDuplicates } from '../_functions'
const { wolfram } = neighborhoods


test('default args have a specific output', t => t.snapshot(wolfram()))
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- clearly to compare to default
test('default radius', t => t.deepEqual(wolfram(), wolfram(1)))

const MAX_RAD_SIZE = 2_000
const radius = fc.nat({ max: MAX_RAD_SIZE }) // This spends memory and time, so limit it.

// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- this is the math that someone prooved for this
testProp('provided radius size', [radius], (t, r) => t.is(wolfram(r).length, 2 * r + 1))
testProp('provided radius all within bounds', [radius], (t, r) => {
  wolfram(r).forEach(pos => {
    t.true(-r <= pos.x, 'left bound')
    t.true(pos.x <= r, 'right bound')
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- wrapped around is known value?
    t.is(pos.y, -1, 'y value')
  });
})
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- clearly to compare to default
testProp('default y', [radius], (t, r) => t.deepEqual(wolfram(r), wolfram(r, -1)))
const yProp = fc.integer()
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- this is the math that someone prooved for this
testProp('provided y size', [radius, yProp], (t, r, y) => t.is(wolfram(r, y).length, 2 * r + 1))
testProp('provided y all within bounds', [radius, yProp], (t, r, y) => {
  wolfram(r, y).forEach(pos => {
    t.true(-r <= pos.x, 'left bound')
    t.true(pos.x <= r, 'right bound')
    t.is(pos.y, y, 'y value')
  });
})
testProp('default includeSelf', [radius, yProp], (t, r, y) => t.deepEqual(wolfram(r, y), wolfram(r, y, true)))
const includeSelf = fc.boolean()
testProp('provided includeSelf size', [radius, yProp, includeSelf], (t, r, y, i) =>
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- this is the math that someone prooved for this
  t.is(wolfram(r, y, i).length, 2 * r + (i ? 1 : 0)))
testProp('provided includeSelf?', [radius, yProp, includeSelf], (t, r, y, i) => {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers,@typescript-eslint/prefer-destructuring  -- clearly to compare to zero, destructuring doesn't work in this case
  const selfCount = wolfram(r, y, i).filter(pos => pos.x === 0 && pos.y === y).length
  if (i) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Clearly asserting comparing to const
    t.is(selfCount, 1, 'Exactly one pixel should match the self location')
  } else {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Clearly asserting comparing to const
    t.is(selfCount, 0, 'No pixels on self')
  }
})
testProp('has no duplicates', [radius, yProp, includeSelf], (t, r, y, i) => {
  const list = wolfram(r, y, i)
  t.is(list.length, sizeWithoutDuplicates(list))
})
testProp(
  'provided includeSelf all within bounds',
  [fc.tuple(radius, yProp, includeSelf)
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Ensure we the radius is never zero?
    .map<[number, number, boolean]>(([r, y, i]) => [r, y, (r === 0 && !i) || i])],
  (t, [r, y, i]) => {
    // TODO this is a bug with the above map as workaround. fc.pre throws, but ava catches when fc should.
    // fc.pre(!(r === 0 && !i)) // Would result in a length of zero
    wolfram(r, y, i).forEach(pos => {
      t.true(-r <= pos.x, 'left bound')
      t.true(pos.x <= r, 'right bound')
      t.is(pos.y, y, 'y value')
    })
  }
)
// vi: tabstop=2 shiftwidth=2 expandtab
