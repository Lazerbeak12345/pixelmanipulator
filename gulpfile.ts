import { watch, src, dest, series, parallel } from 'gulp'
import { createProject } from 'gulp-typescript'
import babel from 'gulp-babel'
import { rollup } from 'rollup'
type Stream=NodeJS.ReadWriteStream
const tsProject = createProject('tsconfig.json')
const sourceGlob = 'src/lib/*'
export function buildTypes (): Stream {
  return src(sourceGlob)
    .pipe(tsProject())
    .pipe(dest('dist/lib'))
}
export function buildEsOnly (): Stream {
  return src(sourceGlob)
    .pipe(babel())
    .pipe(dest('dist/lib'))
}
export const buildEs = parallel(buildTypes, buildEsOnly)
async function rollupToUmd (): Promise<void> {
  const bundle = await rollup({
    input: 'dist/lib/pixelmanipulator.js'
    // For now, rollup won't try to resolve non-local imports anyway, so
    // it will just give an error message.
    // external: [/node_modules/]
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
export const buildUmd = series(buildEs, rollupToUmd, postRollup)
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
