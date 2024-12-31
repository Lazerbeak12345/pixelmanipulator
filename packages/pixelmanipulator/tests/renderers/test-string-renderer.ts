import test from 'ava'
import { testProp, fc } from '@fast-check/ava'
import { StringRenderer } from '../../src/renderers'
const it = test
const propIt = testProp

test('default constructor works', t =>
  t.notThrows(() => {
    const sr = new StringRenderer(() => t.fail("Should not be called."))
    t.is(sr.defaultRenderAs, ' ') // eslint demands we do something with the resulting object
  })
)
it('calls the callback when update is called', t => {
  const sr = new StringRenderer(s => {
    t.is(s, '', "string is empty on the simple case")
  })
  sr.update()
})

const MAX_DEM_SIZE = 1000

function noZeros(a: number): number {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- convert to valid nums
  return a === 0 ? 1 : a
}

const w = fc.nat({ max: MAX_DEM_SIZE }).map(noZeros)
const h = fc.nat({ max: MAX_DEM_SIZE }).map(noZeros)

propIt("provides a string of the correct size", [w, h], (t, w, h) => {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- plan num
  t.plan(1 + h)
  const sr = new StringRenderer(s => {
    const rows = s.split('\n')
    t.is(rows.length, h, `height '${s}' len ${s.length}`)
    rows.forEach((row, i) => t.is(row.length, w, `row ${i} width`))
  })
  sr.set_width(w)
  sr.set_height(h)
  sr.reset() // This replaces the internal state, which is what is getting passed to the above assertion.
  sr.update() // triggers a render, which calls the callback
}, {
  examples: [
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- example
    [1, 1]
  ]
})

type StrDataBools = [number, number, boolean[][]]
propIt("can handle any string data", [
  fc.tuple(w, h).chain(([w, h]) => fc.tuple(
    fc.constant(w),
    fc.constant(h),
    fc.array(
      fc.array(fc.boolean(), { maxLength: w, minLength: w }),
      { minLength: h, maxLength: h }
    )
  )),
  fc.string()
], (t, [w, h, data], str) => {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- plan num
  t.plan(1)
  const sr = new StringRenderer(s => {
    t.is(s, data.map(row =>
      row.map(data => data ? str : sr.defaultRenderAs).join('')
    ).join('\n'))
  })
  sr.set_width(w)
  sr.set_height(h)
  if (str === sr.defaultRenderAs) {
    sr.defaultRenderAs = "#"
  }
  // Arguably bad API design. TODO: Renderers should have a better registration API, even though renderers are internal
  sr.modifyElement(sr.renderInfo.length, sr.defaultRenderAs)
  const { renderInfo: { length: strIdx } } = sr
  sr.modifyElement(strIdx, str)
  sr.reset()
  data.forEach((row, y) => {
    row.forEach((bool, x) => {
      if (bool) sr.renderPixel({ x, y }, strIdx)
    })
  })
  sr.update()
}, {
  examples: [
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- example
    [[1, 1, [[true]]] as StrDataBools, "#"],
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- example
    [[1, 1, [[false]]] as StrDataBools, "#"],
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- example
    [[1, 3, [[false], [false], [false]]] as StrDataBools, " "],
  ]
})

propIt("only allows unique chars in modifyElement", [fc.string()], (t, str) => {
  const sr = new StringRenderer(() => t.fail("Should not be called."))
  if (str === sr.defaultRenderAs) {
    sr.defaultRenderAs = "#"
  }
  sr.modifyElement(sr.renderInfo.length, sr.defaultRenderAs)
  sr.modifyElement(sr.renderInfo.length, str)
  t.throws(() => {
    sr.modifyElement(sr.renderInfo.length, str)
  }, {
    message: 'Element 2 must have a unique renderAs'
  })
}, {
  examples: [
    [' '] // Same as defaultRenderAs
  ]
})
