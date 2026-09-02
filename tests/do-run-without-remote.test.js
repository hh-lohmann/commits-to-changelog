// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';
import {writeFileSync} from 'node:fs';

test( 'Do: Run without defined remote',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  writeFileSync('package.json','{"commits-to-changelog":{"commitMoveTag":false,"requireTag":false}}');
  _lib.gitMockCommit();
  assert(_lib.runPkgCli().status===0);
  _lib.rmDir(tstdir);
});
