import { testProp, fc } from 'ava-fast-check'
import { neighborhoods } from '../../../src/lib/pixelmanipulator'
const { rect } = neighborhoods

// Maximums provided to ensure reasonable time and memory is spent
const tlBr = fc.tuple(
  fc.integer(),
  fc.integer(),
  fc.nat({ max: 250 }),
  fc.nat({ max: 250 })
).map(([x, y, w, h]) => [
  { x, y },
  {
    x: x + w,
    y: y + h
  }
])

testProp('rect\'s size output is the area', [tlBr], (t, [topLeft, bottomRight]) => {
  // (0,0) to (1,1) is area of 4
  const w = bottomRight.x - topLeft.x + 1
  const h = bottomRight.y - topLeft.y + 1
  t.is(rect(topLeft, bottomRight).length, w * h)
})
testProp('return from rect has no duplicates', [tlBr], (t, [topLeft, bottomRight]) => {
  const list = rect(topLeft, bottomRight).map(pos => JSON.stringify(pos))
  t.is(list.length, new Set(list).size)
})
testProp('return from rect keeps all values within bounds', [tlBr], (t, [topLeft, bottomRight]) =>
  rect(topLeft, bottomRight).forEach(pos => {
    t.true(topLeft.x <= pos.x && pos.x <= bottomRight.x)
    t.true(topLeft.y <= pos.y && pos.y <= bottomRight.y)
  }))
// vi: tabstop=2 shiftwidth=2 expandtab
