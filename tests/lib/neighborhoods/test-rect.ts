import { testProp, fc } from 'ava-fast-check'
import { neighborhoods } from '../../../src/lib/pixelmanipulator'
const { rect } = neighborhoods

testProp(
  'rect\'s size output is the area',
  // Maximums provided to ensure reasonable time and memory is spent
  [fc.integer(), fc.integer(), fc.nat({ max: 25 }), fc.nat({ max: 25 })],
  (t, x, y, w, h) => {
    const topLeft = {
      x,
      y
    }
    const bottomRight = {
      x: x + w,
      y: y + h
    }
    const expectedArea = (w + 1) * (h + 1) // (0,0) to (1,1) is area of 4
    const list = rect(topLeft, bottomRight)
    t.is(list.length, expectedArea)
  }
)
testProp(
  'return from rect has no duplicates',
  [fc.integer(), fc.integer(), fc.nat({ max: 25 }), fc.nat({ max: 25 })],
  (t, x, y, w, h) => {
    const topLeft = {
      x,
      y
    }
    const bottomRight = {
      x: x + w,
      y: y + h
    }
    const list = rect(topLeft, bottomRight).map(pos => JSON.stringify(pos))
    const set = new Set(list)
    t.is(list.length, set.size)
  }
)
testProp(
  'return from rect keeps all values within bounds',
  [fc.integer(), fc.integer(), fc.nat({ max: 25 }), fc.nat({ max: 25 })],
  (t, x, y, w, h) => {
    const topLeft = {
      x,
      y
    }
    const bottomRight = {
      x: x + w,
      y: y + h
    }
    const list = rect(topLeft, bottomRight)
    t.plan(list.length * 2)
    list.forEach(pos => {
      t.true(topLeft.x <= pos.x && pos.x <= bottomRight.x)
      t.true(topLeft.y <= pos.y && pos.y <= bottomRight.y)
    })
  }
)
// vi: tabstop=2 shiftwidth=2 expandtab
