// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import {after,before} from 'node:test';
import {rmSync} from 'node:fs';
import * as _lib from './_lib.js';
import {testOnlyExports} from '../cli.js';

/** @type{string[]} */
let changelogLines;
const headerLines=['# Changelog'];
const tstdir=_lib.randomTmpDir();
const validLinesReg=[/^# /,/^## .*\([0-9]{4}-[0-9]{2}-[0-9]{2}\)$/,/^- /,/^  - /];
const _validateCommitsGroup=function(){
  let i=headerLines.length;
  if(changelogLines[i++]!=='') return false;
  if(changelogLines[i++].slice(0,3)!=='## ') return false;
  if(changelogLines[i++]!=='') return false;
  if(changelogLines[i++].slice(0,2)!=='- ') return false;
  return true;
}
const _validateHeader=function(){
  for(let i=0;i<headerLines.length;i++){
    if(changelogLines[i]!==headerLines[i]) return false;
  }
  return true;
}

suite('Do: Changelog file layout',()=>{

  before(()=>{
    try{
      _lib.cd(tstdir);
      _lib.mkPackageJson([['version','1.0.0']]);
      _lib.gitMockCommit();
      _lib.commonSpawn('git checkout -b sub');
      _lib.gitMockCommit({branch:'sub'});
      _lib.gitMockCommit({branch:'sub'});
      _lib.commonSpawn('git checkout mock');
      _lib.commonSpawn('git merge sub --no-ff -m "sub"');
      _lib.gitMockTag({tagname:'1.0.0'});
      _lib.gitMockCommit();
      _lib.runPkgCli();
      changelogLines=_lib.fileToArr('CHANGELOG.md','last');
    }
    catch(err){
      console.log(err);
      process.exit();
    }
  });

  test( 'Contains only valid lines (regardless of order)',()=> {
    assert(
      (()=>{
        let lineOK=undefined;
        for(let i=0;i<changelogLines.length;i++){
          lineOK=undefined;
          if(changelogLines[i]===''){
            lineOK=true;
            continue;
          }
          for(let j=0;j<validLinesReg.length;j++){
            // if(changelogLines[i].slice(0,validLinesReg[j].length)==validLinesReg[j]){
            if(new RegExp(validLinesReg[j]).test(changelogLines[i])){
              lineOK=true;
              j=validLinesReg.length;
            }
          }
          if(!lineOK) return false;
        }
        return true;
      })(),
      'unexpected header in CHANGELOG.md, see '+tstdir
    );
  });

  test( 'Starts with header line(s) "'+headerLines.join('<br>')+'"',()=> {
    assert(
      _validateHeader(),
      'unexpected header in CHANGELOG.md, see '+tstdir
    );
  });

  test( 'Header line(s) are immediately followed by a commits group',()=> {
    assert(
      (()=>{
        if(!_validateHeader()) return false;
        if(!_validateCommitsGroup()) return false;
        return true;
      })(),
      'unexpected header in CHANGELOG.md, see '+tstdir
    );
  });

  test(`Title of group for commits after last tag starts with _settings.headerDefault (current: "${testOnlyExports()?._settings.headerDefault}") + " " if pkgVers matches last tag`,()=> {
    assert(
      (()=>{
        const searchString='## '+testOnlyExports()?._settings.headerDefault+ ' ';
        let i=headerLines.length+1;
        if(changelogLines[i].slice(0,searchString.length)!==searchString) return false;
        return true;
      })(),
      'unexpected header in CHANGELOG.md, see '+tstdir
    );
  });

  test( 'Title of group for commits after last tag is pkgVers if this does not match last tag',()=> {
    assert(
      (()=>{
        const myVersion='2.0.0';
        const versionTitle="## "+myVersion;
        let i=headerLines.length+1;
        rmSync('package.json');
        _lib.mkPackageJson([['version',myVersion]]);
        _lib.runPkgCli();
        const myChangelogLines=_lib.fileToArr('CHANGELOG.md','last');
        if(myChangelogLines[i].slice(0,versionTitle.length)!==versionTitle) return false;
        return true;
      })(),
      'unexpected header in CHANGELOG.md, see '+tstdir
    );
  });

  test( 'List commits with link to remote if a remote is defined',()=> {
    assert(
      (()=>{
        const myUrl='https://www.example.com';
        if(_lib.commonSpawn('git remote').stdout[0]==='') _lib.gitMockRemote(myUrl);
        _lib.runPkgCli();
        changelogLines=_lib.fileToArr('CHANGELOG.md','last')
        for(let i=0; i<changelogLines.length; i++){
          if(new RegExp(/^ {0,2}- /).test(changelogLines[i])&&!new RegExp(String.raw `- \[[^\[]+\]\(`).test(changelogLines[i])) return false;
        }
        return true;
      })(),
      'unexpected header in CHANGELOG.md, see '+tstdir
    );
  });

  test( 'List commits by plain subject if no remote is defined',()=> {
    assert(
      (()=>{
        _lib.commonSpawn('git remote').stdout.forEach(value => {
          _lib.commonSpawn('git remote remove '+value)
        })
        _lib.runPkgCli();
        changelogLines=_lib.fileToArr('CHANGELOG.md','last')
        for(let i=0; i<changelogLines.length; i++){
          if(new RegExp(/^ {0,2}- /).test(changelogLines[i])&&new RegExp(String.raw `- \[[^\[]+\]\(`).test(changelogLines[i])) return false;
        }
        return true;
      })(),
      'unexpected header in CHANGELOG.md, see '+tstdir
    );
  });

  test( 'Indented block for merged branch',()=> {
    assert(
      (()=>{
        if(changelogLines.pop()?.slice(0,2)!=='- ') return false;
        if(changelogLines.pop()?.slice(0,4)!=='  - ') return false;
        if(changelogLines.pop()?.slice(0,4)!=='  - ') return false;
        if(changelogLines.pop()?.slice(0,2)!=='- ') return false;
        return true;
      })(),
      'unexpected structure for merged commits in CHANGELOG.md, see '+tstdir
    );
  });

  after(()=> {
    // _lib.rmDir(tstdir);
  });

})
