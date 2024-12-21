import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'dist/browser.js',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'pixelmanipulator',
    sourcemap: true
  },
  plugins: [commonjs()]
}
