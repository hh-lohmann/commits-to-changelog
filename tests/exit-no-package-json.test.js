// @ts-check

const { assert, test } = require('node-test-bootstrap');
const _lib = require('./_lib.js');

test( 'Exit: No package.json found',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  assert(_lib.commonSpawnErrContains(/Cannot find module [^\n]+package.json/,_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
