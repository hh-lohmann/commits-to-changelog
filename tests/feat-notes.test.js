// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';
import {readFileSync,writeFileSync} from 'node:fs';

/** @type{(tstdir:string)=>boolean} */
const setAndCheck=function(tstdir){
  _lib.cd(tstdir);
  _lib.gitMockCommit();
  _lib.gitMockTag();
  _lib.commonSpawn('git notes add -m "mock"');
  _lib.runPkgCli();
  return /\n  - \*Note:\* /.test(readFileSync('CHANGELOG.md',{encoding:'utf8'}))
}

suite('Feature: Support Git notes depending on setting "useNotes"',()=>{

  test( 'Default useNotes=true: Include existing notes in Changelog',()=> {
    const tstdir=_lib.randomTmpDir();
    assert(
      setAndCheck(tstdir),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'Explicit useNotes=false: No notes in Changelog',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    writeFileSync('package.json','{"commits-to-changelog":{"useNotes":false}}');
    assert(
      !setAndCheck(tstdir),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

})
