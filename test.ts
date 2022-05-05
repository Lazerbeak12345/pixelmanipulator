import test from 'ava'
import { version, licence } from './src/lib/pixelmanipulator'

test('ava is working', t => {
  t.pass()
})
test('licence includes version number', t => {
  t.assert(licence.includes(version))
})
