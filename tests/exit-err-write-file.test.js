// @ts-check

const { assert,test } = require('node-test-bootstrap');
const _lib = require('./_lib.js');
const {writeFileSync} = require('node:fs');


test( 'Exit: Error writing CHANGELOG.md file',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson([['version','1.0.0']]);
  _lib.gitMockRemote('htts://www.example.com');
  _lib.gitMockCommit();
  writeFileSync('CHANGELOG.md', 'mock', {mode:'444'});
  assert(_lib.commonSpawnErrContains(/.\/CHANGELOG.md/,_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
