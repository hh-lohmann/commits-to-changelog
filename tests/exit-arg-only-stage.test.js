// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';

test('Exit: Started with args other than "--stage"',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson();
  assert(_lib.commonSpawnErrContains('unsupported argument',_lib.runPkgCli([crypto.randomUUID()])));
  _lib.rmDir(tstdir);
});
