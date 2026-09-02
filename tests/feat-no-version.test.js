// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';
import {writeFileSync} from 'node:fs';

test('Feature: Allow to have no package.json version',()=>{
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  writeFileSync('package.json','{"commits-to-changelog":{"commitMoveTag":false,"requireTag":false}}');
  _lib.gitMockCommit();
  ;
  assert(
    _lib.runPkgCli().status===0,
    'see '+tstdir
  );
  _lib.rmDir(tstdir);
});
