import test from 'ava'
import { testProp, fc } from 'ava-fast-check'
import { neighborhoods } from '../../../src/lib/pixelmanipulator'
const { moore } = neighborhoods

test('default args have a specific output', t => t.snapshot(moore()))
test('default radius', t => t.deepEqual(moore(), moore(1)))
const radius = fc.nat({ max: 25 }) // This spends memory and time, so limit it.
testProp('provided radius size', [radius], (t, r) =>
  t.is(moore(r).length, Math.pow((2 * r) + 1, 2) - 1)) // Keep in mind includeSelf is false
testProp('provided radius has no duplicates', [radius], (t, r) => {
  const list = moore(r).map(pos => JSON.stringify(pos))
  const set = new Set(list)
  t.is(list.length, set.size)
})
testProp('provided radius all within bounds', [radius.map(num => ++num)], (t, r) =>
  moore(r).forEach(({ x, y }) => {
    t.true(-1 * r <= x, 'left bound')
    t.true(x <= r, 'right bound')
    t.true(-1 * r <= y, 'top bound')
    t.true(y <= r, 'bottom bound')
  }))
testProp('default includeSelf', [radius], (t, r) => t.deepEqual(moore(r), moore(r, false)))
const includeSelf = fc.boolean()
testProp('provided includeSelf?', [radius, includeSelf], (t, r, i) => {
  const selfCount = moore(r, i).filter(({ x, y }) => x === 0 && y === 0).length
  if (i) {
    t.is(selfCount, 1, 'Exactly one pixel should match the self location')
  } else {
    t.is(selfCount, 0, 'No pixels on self')
  }
})
testProp('provided includeSelf size', [radius, includeSelf], (t, r, i) =>
  t.is(moore(r, i).length, Math.pow((2 * r) + 1, 2) - (i ? 0 : 1)))
testProp('provided includeSelf has no duplicates', [radius, includeSelf], (t, r, i) => {
  const list = moore(r, i).map(pos => JSON.stringify(pos))
  const set = new Set(list)
  t.is(list.length, set.size)
})
const rAndIWithNoZero = fc.tuple(radius, includeSelf)
  .map(([r, i]) => (i ? [r, i] : [++r, i]) as [number, boolean])
testProp('provided includeSelf all within bounds', [rAndIWithNoZero], (t, [r, i]) =>
  moore(r, i).forEach(({ x, y }) => {
    t.true(-1 * r <= x, 'left bound')
    t.true(x <= r, 'right bound')
    t.true(-1 * r <= y, 'top bound')
    t.true(y <= r, 'bottom bound')
  }))
testProp('provided includeSelf all within Chebyshev distance', [rAndIWithNoZero], (t, [r, i]) =>
  moore(r, i).forEach(({ x, y }) =>
    t.true(Math.max(Math.abs(x), Math.abs(y)) <= r)))
// vi: tabstop=2 shiftwidth=2 expandtab
