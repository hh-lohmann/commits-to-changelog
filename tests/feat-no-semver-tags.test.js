// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';

test('Feature: Allow to have no package.json version',()=>{
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.gitMockCommit();
  _lib.gitMockTag({tagname:'NONSEMVER'});
  ;
  assert(
    _lib.runPkgCli().status===0,
    'see '+tstdir
  );
  // _lib.rmDir(tstdir);
});
