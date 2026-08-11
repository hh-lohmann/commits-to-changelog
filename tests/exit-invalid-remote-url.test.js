// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';

test( 'Exit: Invalid remote URL',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson();
  _lib.gitMockCommit();
  _lib.gitMockRemote(crypto.randomUUID());
  assert(_lib.commonSpawnErrContains('Invalid remote URL',_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
