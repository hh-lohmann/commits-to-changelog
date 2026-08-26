// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import {writeFileSync} from 'node:fs';
import * as _lib from './_lib.js';
import { testOnlyExports } from '../cli.js';

// @ts-ignore
const fileToArr=testOnlyExports().fileToArr;

const testSetup=function(headerMerged='',commitMsg=''){
  const myResult={tstdir:'',changelogLines:['']};
  myResult.tstdir=_lib.randomTmpDir();
  _lib.cd(myResult.tstdir);
  writeFileSync('package.json',`{"commits-to-changelog":{"headerMerged":"${headerMerged}"}}`);
  _lib.gitMockCommit();
  _lib.commonSpawn('git checkout -b sub');
  _lib.gitMockCommit({branch:'sub'});
  _lib.commonSpawn('git checkout mock');
  _lib.commonSpawn(`git merge sub --no-ff -m "${commitMsg}"`);
  _lib.gitMockCommit();
  _lib.gitMockTag({tagname:'1.0.0'});
  _lib.runPkgCli();
  myResult.changelogLines=fileToArr('CHANGELOG.md','last');
  return myResult;
}

suite('Feature: If setting "headerMerged" is set: Render "no-ff" merged branches as indented blocks with merge message as title',()=>{

  suite('"headerMerged" not set: Render merge message and commits as normal lines',()=>{

    test('Render as normal lines',()=> {
      const mySetup=testSetup('',`Merge branch 'sub'`);
      _lib.cd(mySetup.tstdir);
      assert(
        (()=>{
          if(/^  - /.test(mySetup.changelogLines[6])) return false;
          return true;
        })(),
        'see '+mySetup.tstdir
      );
      _lib.rmDir(mySetup.tstdir);
    });

    test(`Render merge message "Merge branch '<branch name>'" as given as normal line`,()=> {
      const mySetup=testSetup('',`Merge branch 'sub'`);
      _lib.cd(mySetup.tstdir);
      assert(
        (()=>{
          if(mySetup.changelogLines[5]!==`- Merge branch 'sub'`) return false;
          return true;
        })(),
        'see '+mySetup.tstdir
      );
      _lib.rmDir(mySetup.tstdir);
    });

    test(`Render merge message NOT "Merge branch '<branch name>'" as given as normal line`,()=> {
      const mySetup=testSetup('',`sub`);
      _lib.cd(mySetup.tstdir);
      assert(
        (()=>{
          if(mySetup.changelogLines[5]!=='- sub') return false;
          return true;
        })(),
        'see '+mySetup.tstdir
      );
      _lib.rmDir(mySetup.tstdir);
    });

  })

  suite('"headerMerged" set: Render indented blocks with merge message as title',()=>{

    test('Render as indented block',()=> {
      const mySetup=testSetup('myHeaderMerged',`Merge branch 'sub'`);
      _lib.cd(mySetup.tstdir);
      assert(
        (()=>{
          if(!/^- /.test(mySetup.changelogLines[5])) return false;
          if(!/^  - /.test(mySetup.changelogLines[6])) return false;
          if(!/^- /.test(mySetup.changelogLines[7])) return false;
          return true;
        })(),
        'see '+mySetup.tstdir
      );
      _lib.rmDir(mySetup.tstdir);
    });

    test(`Merge message "Merge branch '<branch name>'" => title "myHeaderMerged '<branch name>'"`,()=> {
      const mySetup=testSetup('myHeaderMerged',`Merge branch 'sub'`);
      _lib.cd(mySetup.tstdir);
      assert(
        (()=>{
          if(mySetup.changelogLines[5]!==`- myHeaderMerged 'sub'`) return false;
          return true;
        })(),
        'see '+mySetup.tstdir
      );
      _lib.rmDir(mySetup.tstdir);
    });

    test(`Merge message NOT "Merge branch '<branch name>'" => title "<branch name>"`,()=> {
      const mySetup=testSetup('myHeaderMerged',`sub`);
      _lib.cd(mySetup.tstdir);
      assert(
        (()=>{
          if(mySetup.changelogLines[5]!=='- sub') return false;
          return true;
        })(),
        'see '+mySetup.tstdir
      );
      _lib.rmDir(mySetup.tstdir);
    });

  })

})
