// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';
import {readFileSync,writeFileSync} from 'node:fs';

const lastCommitIsChangelog=function(){
  if(_lib.commonSpawn('git log --oneline -1 --format="%D:::%s"').stdout[0].replaceAll("'",'')==='HEAD -> mock, tag: mock:::changelog') return true;
  return false;
}

suite(`Feature: Auto-commit CHANGELOG.md and move tag to include CHANGELOG.md in the tag's range`,()=>{

  test( 'With defaults: Auto-commit CHANGELOG.md and move tag',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    _lib.gitMockCommit({msg:'mock'});
    _lib.gitMockTag({tagname:'mock'});
    _lib.runPkgCli();
    assert(
      lastCommitIsChangelog(),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'linesToReadme>1: Also auto-commit README.md after updating section "Changelog"',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    writeFileSync('package.json','{"commits-to-changelog":{"linesToReadme":5}}');
    const myReadmeText='# MOCK README\n\n## Changelog\n\n';
    writeFileSync('README.md',myReadmeText);
    _lib.gitMockCommit({msg:'mock'});
    _lib.gitMockTag({tagname:'mock'});
    _lib.runPkgCli();
    assert(
      lastCommitIsChangelog()&&readFileSync('README.md',{encoding:'utf8'})!==myReadmeText,
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'commitMoveTag=true + requireTag=false: Throw',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    writeFileSync('package.json','{"commits-to-changelog":{"requireTag":false}}');
    _lib.gitMockCommit();
    _lib.gitMockTag();
    assert(
      /"requireTag" must be `true` to move tag/.test(_lib.runPkgCli().stderr[0]),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( 'commitMoveTag=false: No commit / move tag',()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    writeFileSync('package.json','{"commits-to-changelog":{"commitMoveTag":false}}');
    _lib.gitMockCommit({msg:'mock'});
    _lib.gitMockTag({tagname:'mock'});
    _lib.runPkgCli();
    assert(
      !lastCommitIsChangelog(),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

})
