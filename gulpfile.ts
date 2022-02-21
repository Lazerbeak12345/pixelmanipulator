import { watch, src, dest, series } from 'gulp'
import { createProject } from "gulp-typescript";
import { rollup } from 'rollup';
const tsProject = createProject(
	"tsconfig.json",
	{
		// Must be overriden or else this gulpfile won't run
		"module":"es6",
		"moduleResolution":"node",
	}
);
const source_glob="src/*";
export function build_es(){
	return src(source_glob)
		.pipe(tsProject())
		.pipe(dest("dist/es"));
}
async function use_rollup(){
	const bundle = await rollup({
		input: 'dist/es/pixelmanipulator.js'
	});
	return bundle.write({
		file: 'dist/umd/pixelmanipulator.js',
		format: 'umd',
		name: 'pixelmanipulator'
	});
}
function post_rollup(){
	return src("dist/es/*.d.ts")
		.pipe(dest("dist/umd"))
}
export const build_umd=series(build_es,use_rollup,post_rollup)
export const build=build_umd
export default build
export function build_watch(){
	watch(source_glob,{ignoreInitial:false},build)
}
