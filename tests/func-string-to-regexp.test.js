// @ts-check

import { assert,suite,test } from 'node-test-bootstrap';
import {before} from 'node:test';
import * as _lib from './_lib.js';
import {testOnlyExports} from '../cli.js';


const stringsNoFlagsNoStartEnd=['abc','/abc/'];
const stringsNoFlagsNoStartEndMatch=['abc','6abc','abc7','6abc7'];
const stringsNoFlagsNoStartEndMatchNot=['ab'];

const stringsNoFlagsWithStart=['^abc','/^abc/'];
const stringsNoFlagsWithStartMatch=['abc','abc7'];
const stringsNoFlagsWithStartMatchNot=['ab','6abc','6abc7'];

const stringsNoFlagsWithEnd=['abc$','/abc$/'];
const stringsNoFlagsWithEndMatch=['abc','6abc'];
const stringsNoFlagsWithEndMatchNot=['ab','abc7','6abc7'];

const stringsNoFlagsWithStartAndEnd=['^abc$','/^abc$/'];
const stringsNoFlagsWithStartAndEndMatch=['abc'];
const stringsNoFlagsWithStartAndEndMatchNot=['ab','6abc','abc7','6abc7'];

const stringsQuotedSlashLeft=['\/abc','/\/abc/'];
const stringsQuotedSlashLeftMatch=['/abc','6/abc'];
const stringsQuotedSlashLeftMatchNot=['abc','6abc','/6abc'];

const stringsQuotedSlashRight=['abc\/','/abc\//'];
const stringsQuotedSlashRightMatch=['abc/','6abc/','abc/7'];
const stringsQuotedSlashRightMatchNot=['abc','abc7'];

const stringsWithFlags=['abc/i','/abc/i' ];
const stringsWithFlagsMatch=['abc','aBc','6abc','6Abc','abc7','abC7'];
const stringsWithFlagsMatchNot=['ab'];

suite('Function _stringToRegExp: Handle string containing RegExp',()=>{

  suite(`Returns for flagless strings without start / end "${stringsNoFlagsNoStartEnd.join('", "')}"`,()=> {

    test(`are RegExps`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsNoStartEnd){
            if(testOnlyExports()?._stringToRegExp(value).constructor.name!=='RegExp') return false;
          }
          return true;
        })()
      );
    });

    test(`match strings "${stringsNoFlagsNoStartEndMatch.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsNoStartEnd){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsNoFlagsNoStartEndMatch){
              if(myRegExp&&!compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

    test(`not match strings "${stringsNoFlagsNoStartEndMatchNot.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsNoStartEnd){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsNoFlagsNoStartEndMatchNot){
              if(myRegExp&&compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

  });

  suite(`Returns for flagless strings with start (caret) "${stringsNoFlagsWithStart.join('", "')}"`,()=> {

    test(`are RegExps`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsWithStart){
            if(testOnlyExports()?._stringToRegExp(value).constructor.name!=='RegExp') return false;
          }
          return true;
        })()
      );
    });

    test(`match strings "${stringsNoFlagsWithStartMatch.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsWithStart){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsNoFlagsWithStartMatch){
              if(myRegExp&&!compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

    test(`not match strings "${stringsNoFlagsWithStartMatchNot.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsWithStart){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsNoFlagsWithStartMatchNot){
              if(myRegExp&&compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

  });

  suite(`Returns for flagless strings with end (dollar) "${stringsNoFlagsWithEnd.join('", "')}"`,()=> {

    test(`are RegExps`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsWithEnd){
            if(testOnlyExports()?._stringToRegExp(value).constructor.name!=='RegExp') return false;
          }
          return true;
        })()
      );
    });

    test(`match strings "${stringsNoFlagsWithEndMatch.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsWithEnd){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsNoFlagsWithEndMatch){
              if(myRegExp&&!compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

    test(`not match strings "${stringsNoFlagsWithEndMatchNot.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsWithEnd){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsNoFlagsWithEndMatchNot){
              if(myRegExp&&compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

  });

  suite(`Returns for flagless strings with start (caret) and end (dollar) "${stringsNoFlagsWithStartAndEnd.join('", "')}"`,()=> {

    test(`are RegExps`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsWithStartAndEnd){
            if(testOnlyExports()?._stringToRegExp(value).constructor.name!=='RegExp') return false;
          }
          return true;
        })()
      );
    });

    test(`match strings "${stringsNoFlagsWithStartAndEndMatch.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsWithStartAndEnd){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsNoFlagsWithStartAndEndMatch){
              if(myRegExp&&!compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

    test(`not match strings "${stringsNoFlagsWithStartAndEndMatchNot.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsNoFlagsWithStartAndEnd){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsNoFlagsWithStartAndEndMatchNot){
              if(myRegExp&&compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

  });

  suite(`Returns for strings with quoted slash left "${stringsQuotedSlashLeft.join('", "')}"`,()=> {

    test(`are RegExps`,()=> {
      assert(
        (()=>{
          for(const value of stringsQuotedSlashLeft){
            if(testOnlyExports()?._stringToRegExp(value).constructor.name!=='RegExp') return false;
          }
          return true;
        })()
      );
    });

    test(`match strings "${stringsQuotedSlashLeftMatch.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsQuotedSlashLeft){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsQuotedSlashLeftMatch){
              if(myRegExp&&!compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

    test(`not match strings "${stringsQuotedSlashLeftMatchNot.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsQuotedSlashLeft){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsQuotedSlashLeftMatchNot){
              if(myRegExp&&compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

  });

  suite(`Returns for strings with quoted slash right "${stringsQuotedSlashRight.join('", "')}"`,()=> {

    test(`are RegExps`,()=> {
      assert(
        (()=>{
          for(const value of stringsQuotedSlashRight){
            if(testOnlyExports()?._stringToRegExp(value).constructor.name!=='RegExp') return false;
          }
          return true;
        })()
      );
    });

    test(`match strings "${stringsQuotedSlashRightMatch.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsQuotedSlashRight){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsQuotedSlashRightMatch){
              if(myRegExp&&!compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

    test(`not match strings "${stringsQuotedSlashRightMatchNot.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsQuotedSlashRight){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsQuotedSlashRightMatchNot){
              if(myRegExp&&compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

  });

  suite(`Returns for strings with flags "${stringsWithFlags.join('", "')}"`,()=> {

    test(`are RegExps`,()=> {
      assert(
        (()=>{
          for(const value of stringsWithFlags){
            if(testOnlyExports()?._stringToRegExp(value).constructor.name!=='RegExp') return false;
          }
          return true;
        })()
      );
    });

    test(`match strings "${stringsWithFlagsMatch.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsWithFlags){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsWithFlagsMatch){
              if(myRegExp&&!compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

    test(`not match strings "${stringsWithFlagsMatchNot.join('", "')}"`,()=> {
      assert(
        (()=>{
          for(const value of stringsWithFlags){
            const myRegExp=testOnlyExports()?._stringToRegExp(value);
            if(myRegExp&&myRegExp.constructor.name!=='RegExp') return false;
            for(const compare of stringsWithFlagsMatchNot){
              if(myRegExp&&compare.match(myRegExp)) return false;
            }
          }
          return true;
        })()
      );
    });

  });

})
