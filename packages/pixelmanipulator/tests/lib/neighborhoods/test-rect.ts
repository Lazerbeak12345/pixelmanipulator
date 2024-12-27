import { testProp, fc } from '@fast-check/ava'
import { neighborhoods } from '../../../src/lib/pixelmanipulator'
import { sizeWithoutDuplicates } from '../_functions'
const { rect } = neighborhoods

const MAX_RECT_SIZE = 250
// Maximums provided to ensure reasonable time and memory is spent
const tlBr = fc.tuple(
  fc.integer(),
  fc.integer(),
  fc.nat({ max: MAX_RECT_SIZE }),
  fc.nat({ max: MAX_RECT_SIZE })
).map(([x, y, w, h]) => [
  { x, y },
  {
    x: x + w,
    y: y + h
  }
])

testProp('rect\'s size output is the area', [tlBr], (t, [topLeft, bottomRight]) => {
  // (0,0) to (1,1) is area of 4
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- starting is at 0,0, meaning width is off by one
  const w = bottomRight.x - topLeft.x + 1
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- starting is at 0,0, meaning height is off by one
  const h = bottomRight.y - topLeft.y + 1
  t.is(rect(topLeft, bottomRight).length, w * h)
})
testProp('return from rect has no duplicates', [tlBr], (t, [topLeft, bottomRight]) => {
  const list = rect(topLeft, bottomRight)
  t.is(list.length, sizeWithoutDuplicates(list))
})
testProp('return from rect keeps all values within bounds', [tlBr], (t, [topLeft, bottomRight]) =>
  { rect(topLeft, bottomRight).forEach(pos => {
    t.true(topLeft.x <= pos.x && pos.x <= bottomRight.x)
    t.true(topLeft.y <= pos.y && pos.y <= bottomRight.y)
  }); })
// vi: tabstop=2 shiftwidth=2 expandtab
