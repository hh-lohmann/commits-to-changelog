// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';

test( 'Exit: No package.json found',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.gitInitMock();
  assert(_lib.commonSpawnErrContains(/No package.json/,_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
