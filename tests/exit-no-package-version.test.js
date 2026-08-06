// @ts-check

const { assert,test } = require('node-test-bootstrap');
const _lib = require('./_lib.js');

test( 'Exit: No version in package.json found',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson();
  _lib.gitMockRemote('htts://www.example.com');
  _lib.gitMockCommit();
  assert(_lib.commonSpawnErrContains('does not contain a version key',_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
