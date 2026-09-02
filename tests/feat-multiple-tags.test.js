// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';
import {writeFileSync} from 'node:fs';

suite('Feature: Support multiple tags on the same commit',()=>{

  test( 'Single tag "single-tag" should outcome as header "single-tag"',async()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'single-tag'});
    writeFileSync('package.json','{"commits-to-changelog":{"commitMoveTag":false}}');
    _lib.runPkgCli();
    assert(
      await _lib.getFirstHeader()===`## single-tag (${new Date().toISOString().slice(0,10)})`,
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'Multiple tags "one-tag" and "another-tag" should outcome as sorted header "another-tag / one-tag"',async()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'one-tag'});
    _lib.gitMockTag({tagname:'another-tag'});
    writeFileSync('package.json','{"commits-to-changelog":{"commitMoveTag":false}}');
    _lib.runPkgCli();
    assert(
      await _lib.getFirstHeader()===`## another-tag / one-tag (${new Date().toISOString().slice(0,10)})`,
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

})
