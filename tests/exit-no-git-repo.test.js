// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';

test( 'Exit: Not in a Git repo',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson();
  assert(_lib.commonSpawnErrContains('Not a Git repository',_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
