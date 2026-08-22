// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';
import {writeFileSync} from 'node:fs';

suite('Feature: Depending on setting requireTag: Throw Error if commits without associated Git tag exist',()=>{

  test( 'Default requireTag=true => throw Error',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    _lib.gitMockCommit();
    assert(
      _lib.commonSpawnErrContains('Untagged commit found',_lib.runPkgCli()),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'Explicit requireTag=false => throw Error',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    _lib.gitMockCommit();
    writeFileSync('package.json','{"commits-to-changelog":{"requireTag":false}}');
    assert(
      _lib.runPkgCli().status===0,
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

})
