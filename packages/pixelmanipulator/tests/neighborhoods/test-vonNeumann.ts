import test from 'ava'
import { testProp, fc } from '@fast-check/ava'
import { neighborhoods } from '../../src/pixelmanipulator'
import { sizeWithoutDuplicates } from '../_functions'
const { vonNeumann, moore } = neighborhoods
test('default args have a specific output', t => t.snapshot(vonNeumann()))
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- comparing to default
test('default radius', t => t.deepEqual(vonNeumann(), vonNeumann(1)))

const MAX_RAD_SIZE = 31 // too high means we run out of ram. I'm talking in the order of gigibytes here. It also means it's too slow.
// TODO: is this broken?
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- moore doesn't return anything on zero. zero is an odd special case.
const radius = fc.nat({ max: MAX_RAD_SIZE }).filter(num=>num>0)

testProp('provided radius all within moore radius', [radius], (t, r) => {
  const m = new Set(moore(r).map(pos => JSON.stringify(pos)))
  vonNeumann(r).forEach(pos =>
    t.true(m.has(JSON.stringify(pos))))
})
function makeGrid(r: number): boolean[][] {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- well known math formula
  return new Array(r * 2 + 1)
    .fill([])
    .map(_ =>
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- well known math formula
      new Array<false>(r * 2 + 1).fill(false)
    )
}
/* function grid2String (grid: boolean[][]): string {
  return grid.map(row => row.map(cell => cell ? '#' : ' ').join('')).join('\n')
} */
function fillGrid(grid: boolean[][], r: number, includeSelf?: boolean): void {
  vonNeumann(r, includeSelf).forEach(({ x, y }) => {
    // eslint-disable-next-line no-param-reassign -- we are expected to modify the given table
    grid[y + r][x + r] = true
  })
}
function makeAndFillGrid(r: number, includeSelf?: boolean): boolean[][] {
  const grid = makeGrid(r)
  fillGrid(grid, r, includeSelf ?? true)
  return grid
}
testProp('empty slots on left and right are equal', [radius], (t, r) => {
  makeAndFillGrid(r).forEach((row, index) => {
    let leftSide = 0
    let rightSide = 0
    let countingLeft = true
    const STEP = 1
    row.forEach(cell => {
      if (cell) countingLeft = false
      else if (countingLeft) leftSide+=STEP
      else rightSide+=STEP
    })
    t.is(leftSide, rightSide, `row number ${index}`)
  })
})
testProp(
  'empty slots on left start at radius, then decrease to zero at halfway going back up to radius, all one at a time',
  [radius],
  (t, r) => {
    let currentDepth = r
    const STEP=1
    const counts = makeAndFillGrid(r).map(row => {
      let count = 0
      for (let i = 0; i < row.length; i+=STEP) {
        const { [i]: cell } = row;
        if (cell) break
        count+=STEP
      }
      return count
    })
    counts.forEach((num, i) => {
      if (i <= r) {
        t.is(num, currentDepth)
        if (i !== r) currentDepth-=STEP
      } else {
        currentDepth+=STEP
        t.is(num, currentDepth)
      }
    })
  }
)
testProp('default includeSelf', [radius], (t, r) => t.deepEqual(vonNeumann(r), vonNeumann(r, false)))
const includeSelf = fc.boolean()
testProp('has no duplicates', [radius, includeSelf], (t, r, i) => {
  const list = vonNeumann(r, i)
  t.is(list.length, sizeWithoutDuplicates(list))
})
testProp('size', [radius, includeSelf], (t, r, i) => {
  const list = vonNeumann(r, i)
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- well known math equation
  const equation = (r ** 2) + ((r + 1) ** 2) - (i ? 0 : 1)
  t.is(list.length, equation)
})
testProp('includeSelf means 0,0 is included any given radius', [radius, includeSelf], (t, r, i) => {
  const list = vonNeumann(r, i).map(pos => JSON.stringify(pos))
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- origin locatioin
  const includes00 = list.includes(JSON.stringify({ x: 0, y: 0 }))
  if (i) {
    t.true(includes00)
  } else {
    t.false(includes00)
  }
})
// vi: tabstop=2 shiftwidth=2 expandtab
