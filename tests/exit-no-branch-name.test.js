// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';

test( 'Exit: No branch name found',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson();
  _lib.gitMockCommit();
  const lastCommitSHA=_lib.commonSpawn('git log -1 --format="%H"').stdout[0];
  _lib.commonSpawn('git checkout '+lastCommitSHA);
  assert(_lib.commonSpawnErrContains('Could not get name of current branch',_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
