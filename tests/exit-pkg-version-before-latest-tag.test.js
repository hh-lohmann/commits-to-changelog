// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';
import {writeFileSync} from 'node:fs';

test( 'Exit: Package version falls before latest tag',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  writeFileSync('package.json','{"version":"1.0.0","commits-to-changelog":{"requireTag":false}}');
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
