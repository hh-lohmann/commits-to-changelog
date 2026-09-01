// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import {readFileSync,writeFileSync} from 'node:fs';
import * as _lib from './_lib.js';
import {testOnlyExports} from '../cli.js';

// @ts-ignore: Should fail only in edge cases
const _fileToArr=testOnlyExports().fileToArr;

const myRemote='https://www.example.com';

/** @type(as:'inline'|'reference')=>boolean^ */
const _validateChangelogLinkAs=function(as){
  const changelogLines=_fileToArr('CHANGELOG.md');
  const myHash=_lib.commonSpawn('git log --format="%h"').stdout[0].replaceAll("'",'');
  const myLink=`${myRemote}/commit/${myHash}`;
  let mySearch='- [mock]';
  if(as==='inline') mySearch+=`(${myLink})`;
  if(as==='reference') mySearch+=`[${myHash}]`;
  if(changelogLines[4].replace(mySearch,'')!=='') return false
  if(as==='reference'){
    if(changelogLines[5]!=='') return false;
    if(changelogLines[6]!=='') return false;
    if(changelogLines[7]!==`[${myHash}]: ${myLink}`) return false;
  }
  if(changelogLines[changelogLines.length-1]!=='') return false;
  return true;
}


suite('Feature: Print commit links as Markdown reference-style links',()=>{

  test( 'referenceLinks:[default:true] => reference-style links',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    _lib.gitMockRemote(myRemote);
    _lib.gitMockCommit({msg:'mock'});
    _lib.gitMockTag({tagname:'mock'});
    _lib.runPkgCli();
    assert(
      _validateChangelogLinkAs('reference'),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'referenceLinks:false => inline links',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    writeFileSync('package.json','{"commits-to-changelog":{"referenceLinks": false}}');
    _lib.gitMockRemote(myRemote);
    _lib.gitMockCommit({msg:'mock'});
    _lib.gitMockTag({tagname:'mock'});
    _lib.runPkgCli();
    assert(
      _validateChangelogLinkAs('inline'),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

})
