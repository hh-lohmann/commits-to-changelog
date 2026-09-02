// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import {writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import * as _lib from './_lib.js';

const mkMockRepoCommits_2022_02_22=function(tstdir=''){
  if(!tstdir) throw Error('No tstdir passed');
  _lib.commonSpawn('git clone '+dirname(process.argv[1])+'/fixtures/repo-mock-two-commits-2022-02-22-only-oldest-tagged.bundle '+tstdir);
  _lib.commonSpawn('git remote remove origin');

}

suite('Feature: Use date of commit as group date also if no tag is given (modulo setting defaultDateToday)',()=>{

  test( 'defaultDateToday default false: commit.date',async()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    mkMockRepoCommits_2022_02_22(tstdir);
    writeFileSync('package.json','{"version":"2.0.0","commits-to-changelog":{"commitMoveTag":false,"requireTag":false}}');
    _lib.runPkgCli();
    assert(
       await _lib.getFirstHeader()===`## ${_lib.headerDefault} (2022-02-22)`,
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'defaultDateToday explicitly true: "today"',async()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    mkMockRepoCommits_2022_02_22(tstdir);
    writeFileSync('package.json','{"version":"2.0.0","commits-to-changelog":{"commitMoveTag":false,"requireTag":false,"defaultDateToday":true}}');
    _lib.runPkgCli();
    assert(
       await _lib.getFirstHeader()===`## ${_lib.headerDefault} (${new Date().toISOString().slice(0,10)})`,
      'see '+tstdir
    )
    _lib.rmDir(tstdir);
  });

})
