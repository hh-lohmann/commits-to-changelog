// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';

test( 'Do: Run without defined remote',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson([['version','1.0.0']]);
  _lib.gitMockCommit();
  assert(_lib.runPkgCli().status===0);
  _lib.rmDir(tstdir);
});
