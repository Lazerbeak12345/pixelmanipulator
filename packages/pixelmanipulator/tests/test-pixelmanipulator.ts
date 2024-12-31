import test from 'ava'
import { version, licence } from '../src/pixelmanipulator'
import * as package_json from '../package.json'

test('ava is probabbly working', t => {
  t.pass()
})
test('version numbers match', t => {
  t.assert(licence.includes(version), 'licence includes version')
  t.is(version, package_json.version, 'package json matches version')
  // TODO: pnpm lockfile doesn't include version.
  // This one I actually keep forgetting to do
  // t.is(version, package_lock_json.version, 'package lock matches version')
})
// vi: tabstop=2 shiftwidth=2 expandtab
