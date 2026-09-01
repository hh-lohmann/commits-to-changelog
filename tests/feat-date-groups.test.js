// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import * as _lib from './_lib.js';

const changelogHadDateHeader=function(isodate=new Date().toISOString().slice(0,10)){
  if(readFileSync('CHANGELOG.md',{encoding:'utf8'}).match(new RegExp(`\\n## \\*${isodate}\\*`))===null) return false;
  return true;
}

const mkMockRepoCommits_2022_02_22=function(tstdir=''){
  if(!tstdir) throw Error('No tstdir passed');
  _lib.commonSpawn('git clone '+dirname(process.argv[1])+'/fixtures/repo-mock-two-commits-2022-02-22-only-oldest-tagged.bundle '+tstdir);
  _lib.commonSpawn('git remote remove origin');
}

suite('Feature: Use commit date to group commits (additionally to tags)',()=>{

  test( 'useDateGroups:[default:"never"] => no grouping by date',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    mkMockRepoCommits_2022_02_22(tstdir);
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'1.0.0'});  
    _lib.runPkgCli();
    assert(
      !changelogHadDateHeader('2022-02-22'),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'useDateGroups:false => no grouping by date',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    mkMockRepoCommits_2022_02_22(tstdir);
    writeFileSync('package.json','{"commits-to-changelog":{"useDateGroups": false}}');
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'1.0.0'});  
    _lib.runPkgCli();
    assert(
      !changelogHadDateHeader('2022-02-22'),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'useDateGroups:always => group also by date',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    mkMockRepoCommits_2022_02_22(tstdir);
    writeFileSync('package.json','{"commits-to-changelog":{"useDateGroups": "always"}}');
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'1.0.0'});  
    _lib.runPkgCli();
    assert(
      changelogHadDateHeader('2022-02-22'),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'useDateGroups:after:<isodate> => group also by date after <isodate>',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    mkMockRepoCommits_2022_02_22(tstdir);
    writeFileSync('package.json','{"commits-to-changelog":{"useDateGroups": "after:2022-02-22"}}');
    _lib.gitMockCommit();
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'1.0.0'});  
    _lib.runPkgCli();
    assert(
     changelogHadDateHeader()&&!changelogHadDateHeader('2022-02-22'),
     'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'useDateGroups:before:<isodate> => group also by date before <isodate>',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    mkMockRepoCommits_2022_02_22(tstdir);
    writeFileSync('package.json','{"commits-to-changelog":{"useDateGroups": "before:2022-02-23"}}');
    _lib.gitMockCommit();
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'1.0.0'});  
    _lib.runPkgCli();
    assert(
     !changelogHadDateHeader()&&changelogHadDateHeader('2022-02-22'),
     'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'Throw on invalid value useDateGroups',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    _lib.gitInitMock();
    writeFileSync('package.json','{"commits-to-changelog":{"useDateGroups": "'+crypto.randomUUID()+'"}}');
    assert(
     /useDateGroups[^\n]+must be one of/.test(_lib.runPkgCli().stderr[0]),
     'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'Throw on invalid <isodate> for useDateGroups:after',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    _lib.gitInitMock();
    writeFileSync('package.json','{"commits-to-changelog":{"useDateGroups": "after:INVALID"}}');
    assert(
      /useDateGroups[^\n]+after:[^\n]+does not contain a valid ISO date/.test(_lib.runPkgCli().stderr[0]),
     'see '+tstdir
    )
    _lib.rmDir(tstdir);
  });

  test( 'Throw on invalid <isodate> for useDateGroups:before',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    _lib.gitInitMock();
    writeFileSync('package.json','{"commits-to-changelog":{"useDateGroups": "before:INVALID"}}');
    assert(
      /useDateGroups[^\n]+before:[^\n]+does not contain a valid ISO date/.test(_lib.runPkgCli().stderr[0]),
     'see '+tstdir
    )
    _lib.rmDir(tstdir);
  });

})
