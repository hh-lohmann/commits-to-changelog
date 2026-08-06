// @ts-check

const { assert, test } = require('node-test-bootstrap');
const _lib = require('./_lib.js');

test('Exit: Started with args other than "--stage"',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson();
  assert(_lib.commonSpawnErrContains('unsupported argument',_lib.runPkgCli([crypto.randomUUID()])));
  _lib.rmDir(tstdir);
});
