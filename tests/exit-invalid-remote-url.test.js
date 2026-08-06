// @ts-check

const { assert,test } = require('node-test-bootstrap');
const _lib = require('./_lib.js');

test( 'Exit: Invalid remote URL',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson();
  _lib.gitMockCommit();
  _lib.gitMockRemote(crypto.randomUUID());
  assert(_lib.commonSpawnErrContains('Invalid remote URL',_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
