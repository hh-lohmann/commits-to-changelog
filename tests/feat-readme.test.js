// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';
import {writeFileSync} from 'node:fs';
import {testOnlyExports} from '../cli.js'

const getReadmeFirstChangelogEntry=function(readmeContent=['']){
  for(let i=0;i<readmeContent.length;i++){
    if(/^  \* \(/i.test(readmeContent[i])) return readmeContent[i];
  }
}

suite('Feature: Write newest changelog entries also to README.md',()=>{
  suite('Setting linesToReadme: Type',()=>{

    test( 'linesToReadme must not be a float number',()=> {
      const tstdir=_lib.randomTmpDir();
      _lib.cd(tstdir);
      _lib.gitMockCommit();
      writeFileSync('package.json','{"commits-to-changelog":{"linesToReadme":0.1}}');
      assert(
        _lib.commonSpawnErrContains('must be a positive integer',_lib.runPkgCli()),
        'see '+tstdir
      );
      _lib.rmDir(tstdir);
    });

    test( 'linesToReadme must not be a negative integer',()=> {
      const tstdir=_lib.randomTmpDir();
      _lib.cd(tstdir);
      _lib.gitMockCommit();
      writeFileSync('package.json','{"commits-to-changelog":{"linesToReadme":-1}}');
      assert(
        _lib.commonSpawnErrContains('must be a positive integer',_lib.runPkgCli()),
        'see '+tstdir
      );
      _lib.rmDir(tstdir);
    });

    test( 'linesToReadme must not be a string containing no integer',()=> {
      const tstdir=_lib.randomTmpDir();
      _lib.cd(tstdir);
      _lib.gitMockCommit();
      writeFileSync('package.json','{"commits-to-changelog":{"linesToReadme":"pure string"}}');
      assert(
        _lib.commonSpawnErrContains('must be a positive integer',_lib.runPkgCli()),
        'see '+tstdir
      );
      _lib.rmDir(tstdir);
    });

    test( 'linesToReadme can be string containing only a postive integer',()=> {
      const tstdir=_lib.randomTmpDir();
      _lib.cd(tstdir);
      _lib.gitMockCommit();
      writeFileSync('package.json','{"commits-to-changelog":{"linesToReadme":"1"}}');
      assert(
        _lib.runPkgCli().status===0,
        'see '+tstdir
      );
      _lib.rmDir(tstdir);
    });

    test( 'linesToReadme can be number representing a postive integer',()=> {
      const tstdir=_lib.randomTmpDir();
      _lib.cd(tstdir);
      _lib.gitMockCommit();
      writeFileSync('package.json','{"commits-to-changelog":{"linesToReadme":1}}');
      assert(
        _lib.runPkgCli().status===0,
        'see '+tstdir
      );
      _lib.rmDir(tstdir);
    });

  })
  test( 'If no tag is given: Use date',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    _lib.gitMockCommit();
    writeFileSync('README.md','# Mock README\n\n## Changelog\n\n');
    writeFileSync('package.json','{"commits-to-changelog":{"linesToReadme":5}}');
    _lib.runPkgCli();
    const readmeContent=testOnlyExports()?.fileToArr('README.md');
    assert(
      getReadmeFirstChangelogEntry(readmeContent)?.indexOf(`  * (${new Date().toISOString().slice(0,10)})`)!==-1,
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });
})
