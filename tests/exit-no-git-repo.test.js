// @ts-check

const { assert,test } = require('node-test-bootstrap');
const _lib = require('./_lib.js');

test( 'Exit: Not in a Git repo',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson();
  assert(_lib.commonSpawnErrContains('Not a Git repository',_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
