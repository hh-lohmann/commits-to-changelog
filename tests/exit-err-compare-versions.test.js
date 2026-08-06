// @ts-check

const { assert,test } = require('node-test-bootstrap');
const _lib = require('./_lib.js');

test( 'Exit: Error comparing versions',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson([['version','invalid']]);
  _lib.gitMockRemote('htts://www.example.com');
  _lib.gitMockCommit();
  assert(_lib.commonSpawnErrContains(/package version [^\n]+ cannot be processed/,_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
