import { watch, src, dest, series, parallel } from 'gulp'
import { createProject } from 'gulp-typescript'
import * as typedoc from 'gulp-typedoc'
import * as babel from 'gulp-babel'
import terser from 'gulp-terser'
import { rollup } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
// import commonjs from '@rollup/plugin-commonjs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const commonjs = require('@rollup/plugin-commonjs')
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
export function buildBabel (): Stream {
  return src('dist/lib/*.js')
    .pipe(babel())
    .pipe(src('dist/lib/*.d.ts'))
    .pipe(dest('dist/babel/'))
}
const umdOutput = 'dist/umd/pixelmanipulator.js'
async function rollupToUmd (): Promise<void> {
  const bundle = await rollup({
    input: 'dist/babel/pixelmanipulator.js',
    external: /core-js/
  })
  await bundle.write({
    file: umdOutput,
    format: 'umd',
    name: 'pixelmanipulator'
  })
  return await bundle.close()
}
const bundleOutput = 'dist/bundle/pixelmanipulator.js'
async function rollupToBundle (): Promise<void> {
  const bundle = await rollup({
    input: 'dist/babel/pixelmanipulator.js',
    plugins: [
      resolve(),
      commonjs()
    ]
  })
  await bundle.write({
    file: bundleOutput,
    format: 'umd',
    name: 'pixelmanipulator'
  })
  return await bundle.close()
}
const doRollup = parallel(rollupToUmd, rollupToBundle)
function minifyUmd (): Stream {
  return src(umdOutput)
    .pipe(terser())
    .pipe(dest('dist/umd/min'))
}
function minifyBundle (): Stream {
  return src(bundleOutput)
    .pipe(terser())
    .pipe(dest('dist/bundle/min'))
}
const minify = parallel(minifyUmd, minifyBundle)
function moveRollupTypes (): Stream {
  return src('dist/babel/*.d.ts')
    .pipe(dest('dist/umd'))
    .pipe(dest('dist/bundle'))
    .pipe(dest('dist/umd/min'))
    .pipe(dest('dist/bundle/min'))
}
export const buildUmd = series(buildEsAndDocs, buildBabel, doRollup, minify, moveRollupTypes)
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
  watch([sourceGlob, 'README.md', demoSrcGlob], { ignoreInitial: false }, build)
}
export function buildWatchLib (): void {
  watch([sourceGlob, 'README.md'], { ignoreInitial: false }, buildUmd)
}
// This is called a "modeline". It's a (n)vi(m)|ex thing.
// vi: tabstop=2 shiftwidth=2 expandtab
