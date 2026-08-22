// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import {writeFileSync} from 'node:fs';
import * as _lib from './_lib.js';
import {testOnlyExports} from '../cli.js';

const headerDefault=testOnlyExports()?._settings.headerDefault;

suite('Feature: Compare pkg.version and latestTag only for possible headerDefault change only if both pass _checkNonLabeledSemver',()=>{

  test( 'pkg.version and latestTag are both non-labeled semver, pkg.version is newer => header=pkg.version',async()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    writeFileSync('package.json','{"version":"2.0.0","commits-to-changelog":{"requireTag":false}}');
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'1.0.0'});
    _lib.gitMockCommit();
    _lib.runPkgCli();
    assert(
      await _lib.getFirstHeader()===`## 2.0.0 (${new Date().toISOString().slice(0,10)})`,
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( `pkg.version is not a non-labeled semver => _settings.headerDefault (current: "${headerDefault}")`,async()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    writeFileSync('package.json','{"version":"2.0.0-dev","commits-to-changelog":{"requireTag":false}}');
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'1.0.0'});
    _lib.gitMockCommit();
    _lib.runPkgCli();
    assert(
      await _lib.getFirstHeader()===`## ${headerDefault} (${new Date().toISOString().slice(0,10)})`,
      'see '+tstdir
    )
    _lib.rmDir(tstdir);
  });

  test( `lastTag is not a non-labeled semver =>  _settings.headerDefault (current: "${headerDefault}")`,async()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    writeFileSync('package.json','{"version":"2.0.0","commits-to-changelog":{"requireTag":false}}');
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'1.0.0-dev'});
    _lib.gitMockCommit();
    _lib.runPkgCli();
    assert(
      await _lib.getFirstHeader()===`## ${headerDefault} (${new Date().toISOString().slice(0,10)})`,
      'see '+tstdir
    )
    _lib.rmDir(tstdir);
  });

})
