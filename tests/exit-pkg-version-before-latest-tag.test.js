// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';

test( 'Exit: Package version falls before latest tag',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson([['version','1.0.0']]);
  _lib.gitMockRemote('htts://www.example.com');
  _lib.gitMockCommit();
  _lib.gitMockTag({tagname:'2.0.0'});
  _lib.gitMockCommit();
  assert(
    _lib.commonSpawnErrContains('has a SemVer value that falls before',_lib.runPkgCli()),
    'see '+tstdir
  );
  _lib.rmDir(tstdir);
});
