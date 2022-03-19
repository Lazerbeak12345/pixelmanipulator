import { watch, src, dest, parallel } from 'gulp'
import { createProject } from 'gulp-typescript'
import * as typedoc from 'gulp-typedoc'
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
const demoSrcGlob = 'src/demo/*.ts'
export function demoTsc (): Stream {
  return src(demoSrcGlob)
    .pipe(tsProject())
    .pipe(dest('dist/demo'))
}
export const build = parallel(buildDocs, demoTsc)
export default build
export function buildWatch (): void {
  watch([sourceGlob, 'README.md', demoSrcGlob], { ignoreInitial: false }, build)
}
// This is called a "modeline". It's a (n)vi(m)|ex thing.
// vi: tabstop=2 shiftwidth=2 expandtab
