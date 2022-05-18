import test from 'ava'
import { testProp, fc } from 'ava-fast-check'
import { neighborhoods } from '../../../src/lib/pixelmanipulator'
const { vonNeumann, moore } = neighborhoods
test('default args have a specific output', t => t.snapshot(vonNeumann()))
test('default radius', t => t.deepEqual(vonNeumann(), vonNeumann(1)))
const radius = fc.nat({ max: 62 })
testProp('provided radius has no duplicates', [radius], (t, r) => {
  const list = vonNeumann(r).map(pos => JSON.stringify(pos))
  t.is(list.length, new Set(list).size)
})
testProp('provided radius all within moore radius', [radius.filter(num => num > 0)], (t, r) => {
  const m = moore(r).map(pos => JSON.stringify(pos))
  vonNeumann(r).forEach(pos =>
    t.true(m.includes(JSON.stringify(pos))))
})
function makeGrid (r: number): boolean[][] {
  return new Array(r * 2 + 1)
    .fill([])
    .map(_ => new Array(r * 2 + 1).fill(false))
}
/* function grid2String (grid: boolean[][]): string {
  return grid.map(row => row.map(cell => cell ? '#' : ' ').join('')).join('\n')
} */
function fillGrid (grid: boolean[][], r: number, includeSelf?: boolean): void {
  vonNeumann(r, includeSelf).forEach(({ x, y }) => {
    grid[y + r][x + r] = true
  })
}
function makeAndFillGrid (r: number, includeSelf?: boolean): boolean[][] {
  const grid = makeGrid(r)
  fillGrid(grid, r, includeSelf ?? true)
  return grid
}
testProp('empty slots on left and right are equal', [radius], (t, r) => {
  makeAndFillGrid(r).forEach((row, index) => {
    let leftSide = 0
    let rightSide = 0
    let countingLeft = true
    row.forEach(cell => {
      if (cell) countingLeft = false
      else if (countingLeft) leftSide++
      else rightSide++
    })
    t.is(leftSide, rightSide, `row number ${index}`)
  })
})
testProp(
  'empty slots on left start at radius, then decrease to zero at halfway going back up to radius, all one at a time',
  [radius],
  (t, r) => {
    let currentDepth = r
    const counts = makeAndFillGrid(r).map(row => {
      let count = 0
      for (let i = 0, cell = row[0]; i < row.length; cell = row[++i]) {
        if (cell) break
        count++
      }
      return count
    })
    counts.forEach((num, i) => {
      if (i <= r) {
        t.is(num, currentDepth)
        if (i !== r) currentDepth--
      } else {
        t.is(num, ++currentDepth)
      }
    })
  }
)
testProp('default includeSelf', [radius], (t, r) => t.deepEqual(vonNeumann(r), vonNeumann(r, false)))
const includeSelf = fc.boolean()
testProp('size', [radius, includeSelf], (t, r, i) => {
  const list = vonNeumann(r, i)
  const equation = Math.pow(r, 2) + Math.pow(r + 1, 2) - (i ? 0 : 1)
  t.is(list.length, equation)
})
testProp('includeSelf means 0,0 is included any given radius', [radius, includeSelf], (t, r, i) => {
  const list = vonNeumann(r, i).map(pos => JSON.stringify(pos))
  const includes00 = list.includes(JSON.stringify({ x: 0, y: 0 }))
  if (i) {
    t.true(includes00)
  } else {
    t.false(includes00)
  }
})
// vi: tabstop=2 shiftwidth=2 expandtab
