// @ts-check

import { assert,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';

test('Exit: Currently no args',()=> {
  const tstdir=_lib.randomTmpDir();
  _lib.cd(tstdir);
  _lib.mkPackageJson();
  assert(_lib.commonSpawnErrContains('Currently no command line arguments',_lib.runPkgCli([crypto.randomUUID()])));
  _lib.rmDir(tstdir);
});
