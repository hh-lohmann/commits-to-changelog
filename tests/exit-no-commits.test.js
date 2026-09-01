// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';

test( 'Exit: No commits found',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson();
  _lib.gitMockRemote('https:///www.example.com');
  _lib.gitMockCommit();
  _lib.commonSpawn('git branch -m mock tmp');
  _lib.commonSpawn('git checkout --orphan mock');
  _lib.commonSpawn('git config branch.mock.remote mock');
  assert(_lib.commonSpawnErrContains('does not have any commits yet',_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
