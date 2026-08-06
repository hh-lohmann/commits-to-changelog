// @ts-check

const { assert,test } = require('node-test-bootstrap');
const _lib = require('./_lib.js');

test( 'Run: Without defined remote',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson([['version','1.0.0']]);
  _lib.gitMockCommit();
  assert(_lib.runPkgCli().status===0);
  _lib.rmDir(tstdir);
});
