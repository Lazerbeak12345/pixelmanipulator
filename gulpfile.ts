import { watch, src, dest, series } from 'gulp'
import { createProject } from 'gulp-typescript'
import { rollup, RollupOutput } from 'rollup'
type Stream=NodeJS.ReadWriteStream
const tsProject = createProject(
  'tsconfig.json',
  {
    // Must be overriden or else this gulpfile won't run
    module: 'es6',
    moduleResolution: 'node'
  }
)
const sourceGlob = 'src/*'
export function buildEs (): Stream {
  return src(sourceGlob)
    .pipe(tsProject())
    .pipe(dest('dist/es'))
}
async function useRollup (): Promise<RollupOutput> {
  const bundle = await rollup({
    input: 'dist/es/pixelmanipulator.js'
  })
  return await bundle.write({
    file: 'dist/umd/pixelmanipulator.js',
    format: 'umd',
    name: 'pixelmanipulator'
  })
}
function postRollup (): Stream {
  return src('dist/es/*.d.ts')
    .pipe(dest('dist/umd'))
}
export const buildUmd = series(buildEs, useRollup, postRollup)
export const build = buildUmd
export default build
export function buildWatch (): void {
  watch(sourceGlob, { ignoreInitial: false }, build)
}
