import test from 'ava'
import { testProp, fc } from '@fast-check/ava'
import { neighborhoods } from '../../src/pixelmanipulator'
import { sizeWithoutDuplicates } from '../_functions'
const { moore } = neighborhoods

test('default args have a specific output', t => t.snapshot(moore()))
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- compare to default
test('default radius', t => t.deepEqual(moore(), moore(1)))
const MAX_RAD_SIZE = 25
const radius = fc.nat({ max: MAX_RAD_SIZE }) // This spends memory and time, so limit it.
testProp('provided radius size', [radius], (t, r) =>
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- well-known equation
  t.is(moore(r).length, Math.pow((2 * r) + 1, 2) - 1) // Keep in mind includeSelf is false
)
testProp('provided radius all within bounds', [radius.map(num => ++num)], (t, r) => {
  moore(r).forEach(({ x, y }) => {
    t.true(-r <= x, 'left bound')
    t.true(x <= r, 'right bound')
    t.true(-r <= y, 'top bound')
    t.true(y <= r, 'bottom bound')
  });
})
testProp('default includeSelf', [radius], (t, r) => t.deepEqual(moore(r), moore(r, false)))
const includeSelf = fc.boolean()
testProp('provided includeSelf?', [radius, includeSelf], (t, r, i) => {
  const { length: selfCount } = moore(r, i).filter(({ x, y }) =>
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- comparing to zero
    x === 0 && y === 0
  )
  if (i) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- asserting expected values
    t.is(selfCount, 1, 'Exactly one pixel should match the self location')
  } else {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- asserting expected values
    t.is(selfCount, 0, 'No pixels on self')
  }
})
testProp('provided includeSelf size', [radius, includeSelf], (t, r, i) =>
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- well-known equation
  t.is(moore(r, i).length, Math.pow((2 * r) + 1, 2) - (i ? 0 : 1))
)
testProp('has no duplicates', [radius, includeSelf], (t, r, i) => {
  const list = moore(r, i)
  t.is(list.length, sizeWithoutDuplicates(list))
})
const rAndIWithNoZero = fc.tuple(radius, includeSelf).map(([r, i]) =>
  (i ? [r, i] : [++r, i]) as [number, boolean])
testProp('provided includeSelf all within bounds', [rAndIWithNoZero], (t, [r, i]) => {
  moore(r, i).forEach(({ x, y }) => {
    t.true(-r <= x, 'left bound')
    t.true(x <= r, 'right bound')
    t.true(-r <= y, 'top bound')
    t.true(y <= r, 'bottom bound')
  });
})
testProp('provided includeSelf all within Chebyshev distance', [rAndIWithNoZero], (t, [r, i]) => {
  moore(r, i).forEach(({ x, y }) =>
    t.true(Math.max(Math.abs(x), Math.abs(y)) <= r));
})
// vi: tabstop=2 shiftwidth=2 expandtab
