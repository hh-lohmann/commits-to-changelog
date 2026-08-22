// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';
import {writeFileSync} from 'node:fs';


test( 'Exit: Error writing CHANGELOG.md file',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  writeFileSync('package.json','{"commits-to-changelog":{"requireTag":false}}');
  _lib.gitMockRemote('htts://www.example.com');
  _lib.gitMockCommit();
  writeFileSync('CHANGELOG.md', 'mock', {mode:'444'});
  assert(_lib.commonSpawnErrContains(/.\/CHANGELOG.md/,_lib.runPkgCli()));
  _lib.rmDir(tstdir);
});
