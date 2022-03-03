import { watch, src, dest, series, parallel } from 'gulp'
import { createProject } from 'gulp-typescript'
import * as typedoc from 'gulp-typedoc'
import { rollup } from 'rollup'
type Stream=NodeJS.ReadWriteStream
const tsProject = createProject('tsconfig.json')
const sourceGlob = 'src/lib/*'
export function buildDocs (): Stream {
  return src(sourceGlob)
    .pipe(typedoc({
      name: 'PixelManipulator',
      exclude: 'gulpfile.ts',
      out: 'dist/docs',
      media: 'media'
    }))// For whatever reason, this doesn't work with gulp-typescript very well
}
export function buildEs (): Stream {
  return src(sourceGlob)
    .pipe(tsProject())
    .pipe(dest('dist/lib'))
}
export const buildEsAndDocs = parallel(buildEs, buildDocs)
async function rollupToUmd (): Promise<void> {
  const bundle = await rollup({
    input: 'dist/lib/pixelmanipulator.js'
  })
  await bundle.write({
    file: 'dist/umd/pixelmanipulator.js',
    format: 'umd',
    name: 'pixelmanipulator'
  })
  return await bundle.close()
}
function postRollup (): Stream {
  return src('dist/lib/*.d.ts')
    .pipe(dest('dist/umd'))
}
export const buildUmd = series(buildEsAndDocs, rollupToUmd, postRollup)
const demoSrcGlob = 'src/demo/*.ts'
export function demoTsc (): Stream {
  return src(demoSrcGlob)
    .pipe(tsProject())
    .pipe(dest('dist/demo'))
}
export const buildDemo = series(buildUmd, demoTsc)
export const build = buildDemo
export default build
export function buildWatch (): void {
  watch([sourceGlob, demoSrcGlob], { ignoreInitial: false }, build)
}
export function buildWatchLib (): void {
  watch(sourceGlob, { ignoreInitial: false }, buildUmd)
}
// This is called a "modeline". It's a (n)vi(m)|ex thing.
// vi: tabstop=2 shiftwidth=2 expandtab
