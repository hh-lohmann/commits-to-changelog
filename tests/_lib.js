// @ts-check

/** @module _lib.js
 * ~~oneline description~~
 */ /** */

export {existsSync} from 'node:fs';
export {chdir as cd} from 'node:process';
import {spawnSync} from 'node:child_process';
import {existsSync,mkdirSync,rmSync,statSync,writeFileSync} from 'node:fs';
import {EOL,tmpdir} from 'node:os';
import {dirname,sep as pathSep} from 'node:path';
import {cwd,execPath as runtimeExec} from 'node:process';
import {testOnlyExports} from '../cli.js';

// @ts-ignore
const _brandMsg=testOnlyExports().brandMsg;

/** Simplify Node's spawnSync call signature / return to its common usage
 *  - i.e. stdio encoding utf8 and passing a usual command line call divided by
 *    spaces into exec / args, returning an object with status / stdout /
 *    stderr of execution where stdout / stderr as arrays of strings instead of
 *    joined lines of strings for easier consumption
 *  - quoting with single or double quotes e.g. for arguments containing spaces
 *    is supported, but quoting quotes goes beyond "common"
 *  - NB: Bun's console.log introduces ANSI codes for CLI display, these are
 *    NOT part of the returned object itself
 * @example commonSpawn('git log --oneline -10')
 * @example commonSpawn('git commit -m "Some changes"')
 * @example commonSpawn("git commit -m 'Some changes'")
 * @param commandline - Progamm call with args as it would be given on command
 *    line
 * @returns - Object with status / stdout / stderr of cli run
 * @type {(commandline:string)=>{status:number|null,stderr:string[],stdout:string[]}}
*/
export const commonSpawn=function(commandline){
  if(!commandline) throw Error(_brandMsg(`commonSpawn: Parameter "commandline" must be set`));
  if(typeof commandline!=='string') throw Error(_brandMsg(`commonSpawn: Parameter "commandline" must be a string`));
  // Normalize quotes for args with spaces: best compromise for Node vs. Bun
  const [exec, ...args]=commandline.replaceAll('"',"'").split(' ');
  for(let i=0; i<args.length; i++){
    if(['&&','||','|'].includes(args[i])) throw Error(_brandMsg(`commonSpawn: Operators like "${args[i]}" are not supported - try to combine multiple commonSpawn calls by JavaScript means`));
  }
  let argCandidate='';
  /** @type{string[]} */
  const argsChecked=[];
  args.forEach(value=>{
    if(argCandidate===''){
      if(value.slice(0,1)!==`'`) return argsChecked.push(value);
      if(value.slice(0,1)===`'`&&value.slice(-1)===`'`) return argsChecked.push(value.slice(1,-1));
      return argCandidate=value.slice(1);
    }
    if(value.slice(-1)!==`'`) return argCandidate+=' '+value;
    argsChecked.push(argCandidate+' '+value.slice(0,-1));
    return argCandidate='';
  });
  const myResult=spawnSync(exec,argsChecked,{encoding:'utf8'});
  if(myResult.error) {
    //@ts-ignore - TS may not have correct Node error signature
    let errCause=myResult.error.code;
    if(errCause==='ENOENT') errCause=`"${exec}" not found`;
    throw Error(_brandMsg(`commonSpawn: commandline not executable: "${commandline}": ${errCause}`));
  }
  return {status:myResult.status,stderr:myResult.stderr.split(EOL),stdout:myResult.stdout.split(EOL)}
}

/** Check if stderr in the return of a commonSpawn() contains a given string
 * @example commonSpawnErrContains('did not match','git commit "wip"')
 * @param search - String or RegExp: string / pattern to search for
 * @param commonSpawnReturn - The return of a commonSpawn() run
 * @returns - true or false
 * @type {(search:string|RegExp,commonSpawnReturn:{[key: string]:any})=>boolean}
*/
export const commonSpawnErrContains=function(search,commonSpawnReturn){
  const argsRequired=['search','commonSpawnReturn'];
  for(let i=0; i<argsRequired.length; i++){
    if(typeof arguments[i]==='undefined') throw Error(_brandMsg(`commonSpawnErrContains: Parameter "${argsRequired[i]}" must be set`));
  }
  if(typeof search!=='string'&&search.constructor.name!=='RegExp') throw Error(_brandMsg(`commonSpawnErrContains: Parameter "search" must be a string or a RegExp`));
  if(search==='') throw Error(_brandMsg(`commonSpawnErrContains: Parameter "search" must not be empty`));
  if(commonSpawnReturn.constructor.name!=='Object') throw Error(_brandMsg(`commonSpawnErrContains: Parameter "commonSpawnReturn" must be an object returned by a commonSpawn run`));
  return commonSpawnReturnContains(search,commonSpawnReturn,'stderr');
}

/** Check if stdout in the return of a commonSpawn() contains a given string
 * @example commonSpawnOutContains('did not match','git commit "wip"')
 * @param search - String or RegExp: string / pattern to search for
 * @param commonSpawnReturn - The return of a commonSpawn() run
 * @returns - true or false
 * @type {(search:string|RegExp,commonSpawnReturn:{[key: string]:any})=>boolean}
*/
export const commonSpawnOutContains=function(search,commonSpawnReturn){
  const argsRequired=['search','commonSpawnReturn'];
  for(let i=0; i<argsRequired.length; i++){
    if(typeof arguments[i]==='undefined') throw Error(_brandMsg(`commonSpawnOutContains: Parameter "${argsRequired[i]}" must be set`));
  }
  if(typeof search!=='string'&&search.constructor.name!=='RegExp') throw Error(_brandMsg(`commonSpawnOutContains: Parameter "search" must be a string or a RegExp`));
  if(search==='') throw Error(_brandMsg(`commonSpawnOutContains: Parameter "search" must not be empty`));
  if(commonSpawnReturn.constructor.name!=='Object') throw Error(_brandMsg(`commonSpawnOutContains: Parameter "commonSpawnReturn" must be an object returned by a commonSpawn run`));
  return commonSpawnReturnContains(search,commonSpawnReturn,'stdout');
}


/** Check if stderr and / or stdout in the return of a commonSpawn() contains a given string
 * @example
 *    commonSpawnReturnContains('no changes','git commit -m "wip"')
 * @example
 *    commonSpawnReturnContains('no changes','git commit -m "wip"','stdout')
 * @example
 *    commonSpawnReturnContains('did not match','git commit "wip"','stderr')
 * @param search - String or RegExp: string / pattern to search for
 * @param commonSpawnReturn - The return of a commonSpawn() run
 * @param stream - Stream to search: 'stderr' / 'stderr' / 'all' [default]
 * @returns - true or false
 * @type {(search:string|RegExp,commonSpawnReturn:{[key:string]:any},stream?:string)=>boolean}
*/
export const commonSpawnReturnContains=function(search,commonSpawnReturn,stream='all'){
  const streamTypes=['stderr','stdout','all'];
  const argsRequired=['search','commonSpawnReturn'];
  for(let i=0; i<argsRequired.length; i++){
    if(typeof arguments[i]==='undefined') throw Error(_brandMsg(`commonSpawnReturnContains: Parameter "${argsRequired[i]}" must be set`));
  }
  if(typeof search!=='string'&&search.constructor.name!=='RegExp') throw Error(_brandMsg(`commonSpawnReturnContains: Parameter "search" must be a string or a RegExp`));
  if(search==='') throw Error(_brandMsg(`commonSpawnReturnContains: Parameter "search" must not be empty`));
  if(commonSpawnReturn.constructor.name!=='Object') throw Error(_brandMsg(`commonSpawnReturnContains: Parameter "commonSpawnReturn" must be an object returned by a commonSpawn run`));
  if(!streamTypes.includes(stream)) throw Error(_brandMsg(`commonSpawnReturnContains: Parameter "stream" must be one of ${streamTypes.map(value=>`"${value}"`).join(' / ')}`));
  const searchInternal=typeof search==='string'?new RegExp(search):search;
  const streamsToSearch=(stream!=='all'?stream:'stderr,stdout').split(',');
  for(let i=0; i<streamsToSearch.length; i++){
    if(!Object.hasOwn(commonSpawnReturn,streamsToSearch[i])) throw Error(_brandMsg(`commonSpawnReturnContains: Return of commonSpawn lacks property "${streamsToSearch[i]}"`));
    if(commonSpawnReturn[streamsToSearch[i]].constructor.name!=='Array') throw Error(_brandMsg(`commonSpawnReturnContains: Property "${streamsToSearch[i]}" in return of commonSpawn is not an array`));
    for(let j=0; j<commonSpawnReturn[streamsToSearch[i]].length; j++){
      if(typeof commonSpawnReturn[streamsToSearch[i]][j]!=='string') throw Error(_brandMsg(`commonSpawnReturnContains: Entry "${j}" of property "${streamsToSearch[i]}" in return of commonSpawn is not a string`));
      if(searchInternal.test(commonSpawnReturn[streamsToSearch[i]][j])) return true;
    }
  }
  return false;
}


/** Init Git with branch "mock" in current directory to use with mocks
 *  - Does nothing if Git with branch "mock" already exists
 *  - Exits with error if Git is already inited without checked out branch
 *    being = "mock" => working in wrong directory?
 * @param branch - Name of branch to use for new repo / accept in existing
 *    repo (repo itself may have random name), default: mock
 * @returns -
 * @type {(branch?:string)=>void}
 */
export const gitInitMock=function(branch='mock'){
  if(typeof branch!=='string') throw Error(_brandMsg(`gitInitMock: Parameter "branch" must be a string`));
  if(existsSync('.git')&&statSync('.git').isFile()) throw Error(_brandMsg('gitInitMock: File ".git" detected - erroneously processing in a Git worktree?'));
  if(commonSpawn('git rev-parse --show-toplevel').stdout[0]===cwd()&&commonSpawn('git branch --show-current').stdout[0]!==branch) throw Error(_brandMsg('gitInitMock: Git repo detected that does not seem to be a mock repo - erroneously processing in a real Git repo?'));
  commonSpawn('git init -b '+branch);
}

/** Return fs-safe zoneless variant of ISO datetime (with ms)
 *  - fs-safe = File system invalid character ":" replaced by "-" and
 *    possibly upper vs. lower case critical "T" by "--"
 *  - zoneless: Not relative to UTC / GMT / Zulu time but absolute local
 *    time and accordingly without timezone designator "Z" at the end
 * @example _mkFsSafeZonelessIsoDatetime()
 * @example _mkFsSafeZonelessIsoDatetime('1981-04-22T09:30')
 * @example _mkFsSafeZonelessIsoDatetime(new Date(new Date().setMonth(10)))
 * @param datetime - Optional: datetime to use, possible value types are
 *    those of "new Date()"; default: '' = implicit "now"
 * @returns string: fs-safe ISO datetime with ms
 * @type {(date?:Date|string|number)=>string}
 */
const _mkFsSafeZonelessIsoDatetime=function(datetime){
  if(typeof datetime==='undefined') datetime='';
  if(new Date(datetime).toString()==='Invalid Date') throw Error(_brandMsg(`_mkFsSafeZonelessIsoDatetime: Passed "datetime" value is invalid`));
  return(
    new Date(
      new Date(datetime).valueOf()
      -new Date(datetime).getTimezoneOffset()*60*1000
    )
    .toISOString()
    .slice(0,-1)
    .replace('T','--')
    .replaceAll(':','-')
    .replace('.','-')
  );
}

/** Fixed date in past to use for Git mocks: 500 days back
 *  - ! Should be a constant, but does only work as function (maybe due
 *    to timing with asyncish test runner?)
*/
const _dateInPast=function(){return new Date().valueOf()-1000*60*60*24*500;}

/** Create Git mock commit
 *  - {@link _mkFsSafeZonelessIsoDatetime} with {@link _dateInPast} for
 *    filename / content / default commit message to distinguish generalized
 *    mock from details of concrete test runs
 * @example gitMockCommit()
 * @example gitMockCommit({branch:'myTestBranch'})
 * @param settings - Optional: object: Settings, currently known:
 *    - branch: Branch to accept to work in = avoid doing something in a wrong
 *      repo (repo itself may have random name); default: undefined (= leave to
 *      gitInitMock)
 *    - msg: commit message, default: {@link _mkFsSafeZonelessIsoDatetime} with
 *      {@link _dateInPast}
 * @returns -
 * @type {(settings?:{branch?:string|undefined,msg?:string})=>void}
 */
export const gitMockCommit=function(settings){
  const mockContent=_mkFsSafeZonelessIsoDatetime(_dateInPast());
  const mockFile=mockContent+'.txt';
  const defaultSettings={branch:undefined,msg:mockContent};
  if(typeof settings!=='undefined'&&settings.constructor.name!=='Object') throw Error(_brandMsg(`gitMockCommit: Parameter "settings" must be an object`));
  if(typeof settings==='undefined') settings=defaultSettings;
  else{
    Object.keys(defaultSettings).forEach(value=>{
      //@ts-ignore - no way to let TS respect the 'undefined' check above
      if(!Object.hasOwn(settings,value)) settings[value]=defaultSettings[value];
    })
  }
  if(typeof settings?.branch!=='undefined'&&typeof settings?.branch!=='string') throw Error(_brandMsg(`gitMockCommit: Option "branch" must be a string`));
  if(typeof settings?.msg!=='string') throw Error(_brandMsg(`gitMockCommit: Option "msg" must be a string`));
  gitInitMock(settings.branch);
  writeFileSync(mockFile,mockContent);
  commonSpawn('git add '+mockFile);
  commonSpawn('git commit -m "'+settings.msg+'"');
}

/** Create Git mock remote
 *  - i.e. add entries to Git config
 * @example gitMockRemote()
 * @example gitMockRemote('https://www.example.com')
 * @example gitMockRemote('/intentionally/local')
 * @param url - Optional: URL to set (no / invalid URL e.g. for testing)
 * @returns -
 * @type {(url?:string)=>void}
 */
export const gitMockRemote=function(url){
  if(typeof url!=='undefined'&&typeof url!=='string') throw Error(_brandMsg(`gitMockRemote: Parameter "url" must be a string or undefined`));
  gitInitMock();
  if(url) commonSpawn('git config remote.mock.url '+url);
  commonSpawn('git config branch.mock.remote mock');
}

/** Create Git mock tag
 *  - {@link _mkFsSafeZonelessIsoDatetime} with {@link _dateInPast} as date to
 *    distinguish generalized mock from details of concrete test runs
 * @example gitMockTag()
 * @example gitMockTag({msg:'My funny release name'})
 * @param settings - Optional: object: Settings, currently known:
 *    - branch: Branch to accept to work in = avoid doing something in a wrong
 *      repo (repo itself may have random name); default: undefined (= leave to
 *      gitInitMock)
 *    - tagname: tagname to set, default: {@link _mkFsSafeZonelessIsoDatetime}
 *       with {@link _dateInPast}
 * @returns -
 * @type {(settings?:{branch?:string|undefined,tagname:string})=>void}
 */
export const gitMockTag=function(settings){
  const defaultSettings={branch:undefined,tagname:_mkFsSafeZonelessIsoDatetime(_dateInPast())};
  if(typeof settings!=='undefined'&&settings.constructor.name!=='Object') throw Error(_brandMsg(`gitMockTag: Parameter "settings" must be an object`));
  if(typeof settings==='undefined') settings=defaultSettings;
  else{
    Object.keys(defaultSettings).forEach(value=>{
      //@ts-ignore - no way to let TS respect the 'undefined' check above
      if(!Object.hasOwn(settings,value)) settings[value]=defaultSettings[value];
    })
  }
  if(typeof settings?.branch!=='undefined'&&typeof settings?.branch!=='string') throw Error(_brandMsg(`gitMockTag: Option "branch" must be a string`));
  if(typeof settings?.tagname!=='string') throw Error(_brandMsg(`gitMockTag: Option "tagname" must be a string`));
  gitInitMock(settings.branch);
  commonSpawn('git tag '+settings.tagname);
}

/** Create new / modifiy existing package.json with given key value pairs
 *  - Explicitly without npm methods: should also be possible without an
 *    installed package manager (and rights on it)
 * @param keyVals: Optional: array of arrays of key value pairs to set /
 *    modify; default: empty array = create empty package.json (! overwriting
 *    an existing one)
 * @param dir: Optional: string: path for package.json, default: current path
 * @type {(keyVals?:string[][]|'#',dir?:string)=>void}
*/
export const mkPackageJson=function(keyVals,dir){
  if(typeof keyVals==='undefined'||keyVals==='#') keyVals=[];
  if(typeof dir==='undefined'||dir==='#') dir=cwd();
  if(keyVals.constructor.name!=='Array') throw Error(_brandMsg(`Parameter "keyVals" must be an array`));
  if(dir.constructor.name!=='String') throw Error(_brandMsg(`Parameter "dir" must be a string`));
  const myData={};
  keyVals.forEach(value=>{
    //@ts-ignore - TS: not easy to type array of arrays
    if(typeof value!=='object'||value.constructor.name!=='Array'||value.length!==2||typeof value[0]!=='string'||typeof value[1]!=='string') throw Error(_brandMsg('mkPackage.json: Parameter "keyVals" has to contain arrays consisting of a key string and a value string'))
    //@ts-ignore - TS: not easy to type array of arrays
    myData[value[0]]=value[1];
  })
  writeFileSync(dir+'/package.json',JSON.stringify(myData));
}

/** Root path of tested Node package (not the directory where test files reside)
 * @type {string}
*/
export const pkgdir=dirname(import.meta.dirname);

/** Create a randomly named / anonymous directory to store disposable files / (sub)directories e.g. for testing
 * @type {()=>string}
*/
export const randomTmpDir=function(){
  let myTmpPath='.';
  while(existsSync(myTmpPath)) myTmpPath=tmpdir()+'/'+crypto.randomUUID();
  try{mkdirSync(myTmpPath)}catch(/**@type{any}*/err){throw Error(`randomTmpDir: Random temporary directory could not be created (code: ${err.code})`)}
  return myTmpPath;
}

/** Remove temporary dir at root of tmpdir()
 *  - Exits with error if dir is not at root of tmpdir()
 * @param dir - Absolute path for directory at root of tmpdir() to remove
 * @returns -
 * @type {(dir:string)=>void}
 */
export const rmDir=function(dir){
  if(!dir) throw Error(_brandMsg(`rmDir: Parameter "dir" must be set`));
  if(typeof dir!=='string') throw Error(_brandMsg(`rmDir: Parameter "dir" must be a string`));
  if(dir.slice(0,tmpdir().length)!==tmpdir()) throw Error(_brandMsg(`rmDir: Parameter "dir" is not an immediate child of the system's tmp dir: "${dir}"`));
  rmSync(dir,{recursive:true});
}

/** Run cli script of tested Node package
 * @param args - Optional: array of strings: args to pass to cli, default:
 *    empty array => use "#" to state "use default"
 * @param cliFile - Optional: file name of cli script, default: "cli.js"
 * @returns - Object with status / stdout / stderr of cli run
 * @type {(args?:string[]|'#',cliFile?:string)=>{status:number|null,stderr:string[],stdout:string[]}}
*/
export const runPkgCli=function(args,cliFile){
  if(typeof args==='undefined'||args==='#') args=[];
  if(typeof cliFile==='undefined'||cliFile==='#') cliFile='cli.js';
  if(args.constructor.name!=='Array') throw Error(_brandMsg(`runPkgCli: Parameter "args" must be an array`));
  if(cliFile.constructor.name!=='String') throw Error(_brandMsg(`runPkgCli: Parameter "cliFile" must be a string`));
  const cliFilePath=pkgdir+pathSep+cliFile;
  if(!existsSync(cliFilePath)) throw Error(_brandMsg(`runPkgCli: Requested cli script does not exist: "${cliFilePath}"`));
  return commonSpawn([runtimeExec,cliFilePath,...args].join(' '));
}
