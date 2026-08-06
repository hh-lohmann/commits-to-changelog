// @ts-check

const { assert,test } = require('node-test-bootstrap');
const _lib = require('./_lib.js');

test( 'Exit: No URL for defined remote found',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson();
  _lib.gitMockCommit();
  _lib.gitMockRemote();
  assert(_lib.commonSpawnErrContains('Could not get URL for defined remote',_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
