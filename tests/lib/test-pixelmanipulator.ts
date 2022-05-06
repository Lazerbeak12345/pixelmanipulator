import test from 'ava'
import { version, licence } from '../../src/lib/pixelmanipulator'
import * as package_json from '../../package.json'
import * as package_lock_json from '../../package-lock.json'

test('ava is probabbly working', t => {
  t.pass()
})
test('version numbers match', t => {
  t.assert(licence.includes(version), 'licence includes version')
  t.is(version, package_json.version, 'package json matches version')
  // This one I actually keep forgetting to do
  t.is(version, package_lock_json.version, 'package lock matches version')
})
