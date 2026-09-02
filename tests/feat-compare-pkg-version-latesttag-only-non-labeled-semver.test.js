// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import {writeFileSync} from 'node:fs';
import * as _lib from './_lib.js';

suite('Feature: Compare pkg.version and latestTag only for possible _lib.headerDefault change only if both pass _checkNonLabeledSemver',()=>{

  test( 'pkg.version and latestTag are both non-labeled semver, pkg.version is newer => header=pkg.version',async()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    writeFileSync('package.json','{"version":"2.0.0","commits-to-changelog":{"commitMoveTag":false,"requireTag":false}}');
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'1.0.0'});
    _lib.gitMockCommit();
    _lib.runPkgCli();
    assert(
      _lib.checkHeader(await _lib.getFirstHeader(),'2.0.0'),
      'see '+tstdir
    );
    _lib.rmDir(tstdir);
  });

  test( `pkg.version is not a non-labeled semver => _settings._lib.headerDefault (current: "${_lib.headerDefault}")`,async()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    writeFileSync('package.json','{"version":"2.0.0-dev","commits-to-changelog":{"commitMoveTag":false,"requireTag":false}}');
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'1.0.0'});
    _lib.gitMockCommit();
    _lib.runPkgCli();
    assert(
      _lib.checkHeader(await _lib.getFirstHeader()),
      'see '+tstdir
    )
    _lib.rmDir(tstdir);
  });

  test( `lastTag is not a non-labeled semver =>  _settings._lib.headerDefault (current: "${_lib.headerDefault}")`,async()=> {
    const tstdir=_lib.randomTmpDir();
    _lib.cd(tstdir);
    writeFileSync('package.json','{"version":"2.0.0","commits-to-changelog":{"commitMoveTag":false,"requireTag":false}}');
    _lib.gitMockCommit();
    _lib.gitMockTag({tagname:'1.0.0-dev'});
    _lib.gitMockCommit();
    _lib.runPkgCli();
    assert(
      _lib.checkHeader(await _lib.getFirstHeader()),
      'see '+tstdir
    )
    _lib.rmDir(tstdir);
  });

})
