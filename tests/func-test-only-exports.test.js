// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import * as _lib from './_lib.js';
import {readdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {testOnlyExports} from '../cli.js';

suite('Function: testOnlyExports: Restricted export of internals for testing',()=>{

  test( `Export object if imported by file in path "../${testOnlyExports()?.progName}/{..}/tests/"`,()=> {
    assert(
      typeof testOnlyExports()?.progName==='string'
      &&testOnlyExports()?.progName!==''
    );
  });

  test( `Export undefined if imported by file *not* in path "../${testOnlyExports()?.progName}/{..}/tests/"`,
    /** !! stdout may contain shell colorings etc., therefore
     *  `includes('undefined')` instead of `==='undefined'`
     */
    async function(){
      const execDir=process.cwd();
      const tstdir=_lib.randomTmpDir();
      _lib.cd(tstdir);
      writeFileSync(
        'test.js',
        `import {testOnlyExports} from '${execDir}/cli.js';\n`
        +`console.log(testOnlyExports());\n`
      );
      assert(
        _lib.commonSpawn(`${process.argv[0]} test.js`).stdout[0].includes('undefined'),
        'see '+tstdir
      );
      _lib.rmDir(tstdir);
    }
  );

})
