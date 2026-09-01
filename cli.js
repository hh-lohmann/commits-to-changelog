#!/usr/bin/env node

// @ts-check

import {exec,spawnSync} from 'node:child_process';
import {appendFileSync, existsSync,readFileSync,writeFile,writeFileSync} from 'node:fs';
import {EOL} from 'node:os';
import {sep} from 'node:path';
import {open } from 'node:fs/promises';

/** @type{any} */
let pkg;
/** @type{string} */
let commitURI;
/** @type{string} */
let out;

const progName='commits-to-changelog';
const _progState={
  dateGroups:{
    when:'',
    isodate:'',
    _used:[''],
    getHeader(date=''){
      if(!isIsoDate(date)) throw Error(progName+': _progState.dateGroups.getHeader: Parameter "date": must be a valid ISO date');
      if(this._used.includes(date)) return '';
      if(!this.when) return '';
      if(this.when==='after'&&new Date(date).valueOf()<=new Date(this.isodate).valueOf()) return '';
      if(this.when==='before'&&new Date(date).valueOf()>=new Date(this.isodate).valueOf()) return '';
      this._used.push(date);
      return date;
    }
  },
  referenceLinks:{
    /** @type{{[key:string]:string}} */
    _list:{},
    /** @type{(label:string,link:string)=>any} */
    add(label='',link=''){
      if(typeof label!=='string') throw Error(progName+': _progState.referenceLinks.add: Parameter "label": must be a string');
      if(typeof link!=='string') throw Error(progName+': _progState.referenceLinks.add: Parameter "link": must be a string');
      if(this._list.hasOwnProperty(label)) return;
      this._list[label]=link;
    },
    /** @type{()=>string} */
    getDefList(){
      return Object.keys(this._list).map(value=>`[${value}]: ${this._list[value]}`).join(EOL);
    }
  }
}

/** Settings
 *  - Predefined values that may be overwritten via "commits-to-changelog" in
 *    a package.json belonging to the repo to make a changelog for
 * @type{{[key:string]:any}}
 */
const _settings={
  defaultDateToday: false,
  filterCommits:[],
  filterDefaults: true,
  headerDefault: 'Current',
  linesToReadme: 0,
  referenceLinks: true,
  requireTag: true,
  /** @type{undefined|false|string} */
  useDateGroups: 'never',
  useNotes: true
}

export const testOnlyExports=function(){
  const callPathParts=process.argv[1].split(sep);
  if(callPathParts.slice(-2,-1)[0]!=='tests') return;
  if(!callPathParts.includes(progName)) return;
  return (
    {
      brandMsg:brandMsg,
      fileToArr:_fileToArr,
      progName:progName,
      _settings:_settings,
      _stringToRegExp:_stringToRegExp
    }
  )
}

/** Brand a message string by prefixing "<brand>: "
 *  - Mainly for branding with name of current script / module
 * @param msg: String: the message to brand
 * @param brand: Optional: string: brand to prefix, default: name of current
 *    script / module
 * @type {(msg:string,brand?:string)=>string}
*/
const brandMsg=function(msg,brand){
  if(!msg) msg='(no message)';
  if(!brand) brand=import.meta.filename.split(sep).slice(-1)[0];
  return brand+': '+msg;
}

/** Check if given textline is a Markdown header with given headertext
 *  - headertext = string or RegExp without atx-heading + ' '
 *    - ! strings are handled verbatim as strings
 *    - for RegExp flags like `/i` for "ignore case" are effective
 * @example _checkIsMarkdownHeader('Examples')
 * @example _checkIsMarkdownHeader('^.*Examples.*$')
 * @param textline - verbatim textline, possibly empty line
 * @param headertext - see above
 * @returns boolean
 * @type {(textline:string,headertext:string|RegExp)=>boolean}
 */
const _checkIsMarkdownHeader=function(textline,headertext){
  if(typeof textline==='undefined') throw Error(progName+': _checkIsMarkdownHeader: No textline passed');
  if(!headertext) throw Error(progName+': _checkIsMarkdownHeader: No headertext passed');
  if(typeof textline!=='string') throw Error(progName+': _checkIsMarkdownHeader: Parameter "textline" must be a string');
  if(typeof headertext!=='string'&&headertext.constructor.name!=='RegExp') throw Error(progName+': _checkIsMarkdownHeader: Parameter "headertext" must be a string or a RegExp');
  const headertextFlags=typeof headertext==='string'?'':headertext.flags;
  let headertextSource=typeof headertext==='string'?headertext:headertext.source;
  if(headertextSource.startsWith('^')) headertextSource=headertextSource.slice(1);
  return new RegExp('^#{1,6} '+headertextSource,headertextFlags).test(textline);
}

/** Check if textsample marks first line not belonging to current section
 *  - textsample instead of line to allow especially HTML comments that belong
 *    not to the current section if not followed by an empty line
 *    - ! multiline HTML comments have to be made to a oneliner before passing
 *      them in a textsample
 * @example _checkIsMarkdownSectionEnd([firstline,secondline])
 * @param textsample - Array of lines
 * @returns Index of (first) section end in textsample with special cases "-2"
 *  = no matching section end, "-1" = empty sample = EOF = implicit section end
 *    - Allows to determine the start position of a confirmed section end
 *    - Check if ">-2" for a simple "section end found"
 * @type {(textsample:string[])=>number}
 */
const _checkIsMarkdownSectionEnd=function(textsample){
  if(typeof textsample==='undefined') throw Error(progName+': _checkIsMarkdownSectionEnd: No textsample passed');
  if(textsample.constructor.name!=='Array') throw Error(progName+': _checkIsMarkdownSectionEnd: Parameter "textsample" must be an array');
  let possiblyMatchingIndex=-1;
  if(textsample.length===0) return possiblyMatchingIndex;
  for(let i=0;i<textsample.length;i++){
    ++possiblyMatchingIndex;
    if(/^ {0,3}<!--[ \n\S]*-->/.test(textsample[i])){
      --possiblyMatchingIndex;
      continue;
    }
    if(/^ {0,3}#+ \w/.test(textsample[i])) return possiblyMatchingIndex;
    // slightly overgenerating RegExp for HTML tags
    // (note that the internet is full of undergenerating ones)
    if(/^ {0,3}<[a-z]+[ \S]*>/.test(textsample[i])) return possiblyMatchingIndex;
  }
  return -2;
}

/** Check if a string is a non-labeled SemVer
 * - non-labeled = purely 'major.minor.patch'
 * - NB: as function to give it a clear semantic
 * @example _checkNonLabeledSemver('5.3.77')
 * @param version - string: Version string to check
 * @returns boolean
 * @type {(version:string)=>boolean}
 */
const _checkNonLabeledSemver=function(version){
  if(!version) throw Error(progName+': _checkNonLabeledSemver: No version passed');
  if(typeof version!=='string') throw Error(progName+': _checkNonLabeledSemver: Parameter "version" must be a string');
  if(new RegExp(/^[0-9]+\.+[0-9]+\.+[0-9]+$/).test(version)) return true;
  return false;
}

/** Check if given Markdown file has a section identified by given headertext
 *  - headertext = string or RegExp without atx-heading + ' '
 *    - ! strings are handled verbatim as strings
 *    - for RegExp flags like `/i` for "ignore case" are effective
 * @example _checkMarkdownHasSection('README.md',/Changelog/i)
 * @example _checkMarkdownHasSection('README.md','Changelog')
 * @param mdFile - Markdown file
 * @param headertext - see above
 * @returns Promise: boolean
 * @type {(mdFile:string,headertext:string|RegExp)=>Promise<boolean>}
 */
const _checkMarkdownHasSection=async function(mdFile,headertext){
  if(!mdFile) throw Error(progName+': _checkMarkdownHasSection: No mdFile passed');
  if(!headertext) throw Error(progName+': _checkMarkdownHasSection: No headertext passed');
  if(typeof mdFile!=='string') throw Error(progName+': _checkMarkdownHasSection: Parameter "mdFile" must be a string');
  if(typeof headertext!=='string'&&headertext.constructor.name!=='RegExp') throw Error(progName+': _checkMarkdownHasSection: Parameter "headertext" must be a string or a RegExp');
  if(!existsSync(mdFile)) throw Error(progName+`: _checkMarkdownHasSection: Requested file "${mdFile}" not found`);
  for await (const line of (await open(mdFile)).readLines({encoding:'utf8'})) {
    if(_checkIsMarkdownHeader(line,headertext)) return true;
  }
  return false;
}

/** Compare two non-labeled SemVer strings
 *  - non-labeled => _checkNonLabeledSemver()
 * @example _compareSemver('1.5.1','1.5.0')
 * @param semver1 - string: First SemVer string for comparison
 * @param semver2 - string: Second SemVer string for comparison
 * @returns number: 0: equal, 1: semver1 newer, 2: semver2 newer
 * @type {(semver1:string,semver2:string)=>0|1|2}
 */
const _compareSemver=function(semver1,semver2){
  [semver1,semver2].forEach((value,index)=>{
    if(!value) throw Error(progName+`: _compareSemver: Parameter "semver${index+1}" not set`);
    if(typeof value!=='string') throw Error(progName+`: _compareSemver: Parameter "semver${index+1}" must be a string`);
    if(!_checkNonLabeledSemver(value)) throw Error(progName+`: _compareSemver: Parameter "semver${index+1}" must be a non-labeled SemVer "major.minor.patch"`);
  })
  const segments_1=semver1.split('.');
  const segments_2=semver2.split('.');
  for(let i=0;i<3;i++){
    if(segments_1[i]>segments_2[i]) return 1;
    if(segments_1[i]<segments_2[i]) return 2;
  }
  return 0;
}

/** Read utf8 text file into an array with lines as entries
 * @example fileToArr('CHANGELOG.md')
 * @example fileToArr('CHANGELOG.md','last')
 * @param file - name / path of file to read
 * @param removeEmptyLines - Optional: Remove empty lines: 'all' / 'last' /
 *    'none' (default)
 * @returns array with file lines as entries
 * @type {(file:string,removeEmptyLines?:'all'|'last'|'none')=>string[]}
 */
const _fileToArr=function(file,removeEmptyLines){
  if(typeof file==='undefined') throw Error(brandMsg(`fileToArr: Parameter "file" must not be undefined`));
  if(typeof file!=='string') throw Error(brandMsg(`fileToArr: Parameter "file" must be a string`));
  if(file==='') throw Error(brandMsg(`fileToArr: Parameter "file" must not be empty`));
  if(!existsSync(file)) throw Error(brandMsg(`fileToArr: Passed file not retrievable: "${file}"`));
  const removeEmptyLinesVals=['all','last','none'];
  if(!removeEmptyLines) removeEmptyLines='none';
  if(!removeEmptyLinesVals.includes(removeEmptyLines)) throw Error(brandMsg(`fileToArr: Parameter "removeEmptyLines" must be one of "${removeEmptyLinesVals.join('" / "')}"`));
  const fileLines=
    readFileSync(file,{encoding:'utf8'})
    .split(EOL)
  ;
  if(removeEmptyLines==='all') return fileLines.filter(value=>value!=='');
  if(removeEmptyLines==='last') return fileLines.slice(0,-1);
  return fileLines;
}
/** Get Markdown before and after a section identified by given headertext
 *  - "before" including the matching headertext line
 *  - headertext = string or RegExp without atx-heading + ' '
 *    - ! strings are handled verbatim as strings
 *    - for RegExp flags like `/i` for "ignore case" are effective
 * @example _getMarkdownBeforeAfterSection('README.md',/Changelog/i)
 * @example _getMarkdownBeforeAfterSection('README.md','Changelog')
 * @param mdFile - Markdown file to read
 * @param headertext - see above
 * @param startPos - Optional: Position in mdFile to start from, default: 0
 * @returns Promise: Object with keys 'found' / 'before' / 'after'
 * @type {(mdFile:string,headertext:string|RegExp,startPos?:number)=>Promise<{found:boolean,before:string,after:string}>}
 */
const _getMarkdownBeforeAfterSection=async function(mdFile,headertext,startPos=0){
  if(!mdFile) throw Error(progName+': _getMarkdownBeforeAfterSection: No mdFile passed');
  if(!headertext) throw Error(progName+': _getMarkdownBeforeAfterSection: No headertext passed');
  if(typeof mdFile!=='string') throw Error(progName+': _getMarkdownBeforeAfterSection: Parameter "mdFile" must be a string');
  if(typeof headertext!=='string'&&headertext.constructor.name!=='RegExp') throw Error(progName+': _getMarkdownBeforeAfterSection: Parameter "headertext" must be a string or a RegExp');
  if(!existsSync(mdFile)) throw Error(progName+`: _getMarkdownBeforeAfterSection: Requested file "${mdFile}" not found`);
  const myResult={found:false,before:'',after:''};
  let bytePos=startPos;
  for await (const line of (await open(mdFile)).readLines({encoding:'utf8',start:startPos})) {
    myResult.before+=line+EOL;
    bytePos+=line.length+EOL.length;
    if(_checkIsMarkdownHeader(line,headertext)){
      myResult.found=true;
      break;
    }
  }
  if(myResult.found){
    const posSectionEnd=await _getPosMarkdownSectionEnd(mdFile,bytePos);
    if(posSectionEnd<1) return myResult;
    for await (const line of (await open(mdFile)).readLines({encoding:'utf8',start:posSectionEnd})) {
      myResult.after+=line+EOL;
      bytePos+=line.length+EOL.length;
    }
  }
  if(!myResult.found) myResult.before=myResult.after='';
  return myResult;
}

/** Get position of next section end in Markdown file
 *  - E.g. to read file contents until or from that position
 * @example _getPosMarkdownSectionEnd('README.md')
 * @example _getPosMarkdownSectionEnd('README.md',0)
 * @example _getPosMarkdownSectionEnd('README.md',306)
 * @param mdFile - Markdown file to search in
 * @param startPos - Optional: Position in mdFile to start, default: 0
 * @returns Byte position of found section end, "-1" for EOF as trivial
 *    section end
 * @type {(mdFile:string,startPos?:number)=>Promise<number>}
 */
const _getPosMarkdownSectionEnd=async function(mdFile,startPos=0){
  let bytePos=startPos;
  /** @type{(result:number)=>number} */
  const calcMatchingBytePos=function(result=-2){
    for(let i=result;i>-1&&i<textsample.length;i++){
      bytePos-=(textsample[i].length+EOL.length);
    }
    return bytePos;
  }
  let result=-2;
  /** @type {string[]} */
  let textsample=[];
  for await (const line of (await open(mdFile)).readLines({encoding:'utf8',start:startPos})) {
    if(textsample.length===2){
      result=_checkIsMarkdownSectionEnd(textsample);
      if(result>-2) return calcMatchingBytePos(result);
      textsample=[textsample[1],line];
    }
    if(textsample.length===1) textsample=[textsample[0],line];
    if(textsample.length===0) textsample=[line];
    bytePos+=line.length+EOL.length;
  }
  /** @type {string|undefined } */
  let removedLine;
  while(textsample.length>0){
    result=_checkIsMarkdownSectionEnd(textsample);
    if(result>-2) return calcMatchingBytePos(result);
    removedLine=textsample.pop();
    if(removedLine)bytePos-=removedLine.length;
  }
  return -1;
}

/** @type{()=>string|undefined} */
const _getRemoteRepoUrl=function(){
  const myBranch=spawnSync('git',['branch','--show-current'],{encoding:'utf8'}).stdout.replace(/\s/g,'');
  if(!myBranch) throw Error(progName+': Could not get name of current branch');
  const myRemote=spawnSync('git',['config','branch.'+myBranch+'.remote'],{encoding:'utf8'}).stdout.replace(/\s/g,'');
  if(!myRemote) return undefined;
  /** @type{any} */
  let myUrl=spawnSync('git',['remote','get-url',myRemote],{encoding:'utf8'}).stdout.replace(/\s/g,'')
  if(!myUrl) throw Error(progName+': Could not get URL for defined remote');
  try{
    myUrl=new URL(myUrl);
  }
  catch(/** @type{any}*/err){
    let errCode=Object.hasOwn(err,'code')?` (code: ${err.code})`:'';
    throw Error(progName+': Invalid remote URL'+errCode);
  }
  if(myUrl.pathname==='/') return myUrl.origin;
  if(myUrl.pathname.slice(-4)==='.git') myUrl.pathname=myUrl.pathname.slice(0,myUrl.pathname.length-4);
  return myUrl.origin+myUrl.pathname;
}

const _checkIfGitRepo=function(){
  return new Promise((res, rej) => {
    if(spawnSync('git',['branch','--show-current'],{encoding:'utf8'}).stderr.includes('not a git repository')) rej(Error('Not a Git repository'));
    res(true);
  });
}

const _getPackageJson=function(){
  return new Promise((res, rej) => {
    // if(!existsSync('package.json')) throw Error('No package.json found');
    if(!existsSync('package.json')) res(false);
    import(process.cwd()+'/package.json',{with:{type:'json'}})
    .then(result=>{
      pkg=result.default;
      res(true);
    })
    .catch(err=>rej(Error('package.json could not be loaded')))
  });
}

/** Handle string containing RegExp
 *  - Especially for JSON that has no type "RegExp"
 *  - Makes both e.g. "/^exp$/" and "^exp$" to /^exp$/ (but not e.g.
 *    "/^exp$" or "^exp$/", i.e. interprets *pairs* of unquoted "/" at
 *    start and end as RegExp delimiters)
 *  - Recognizes RegExp flags d / g / i / m / s / u / v / y
 *    - e.g. "/exp/i" or "exp/i"
 * @example _stringToRegExp("/^exp$/")
 * @example _stringToRegExp("^exp$")
 * @example _stringToRegExp("/^exp$/i")
 * @example _stringToRegExp("^exp$/i")
 * @param string - The string to return as RegExp
 * @returns Resulting RegExp
 * @type {(string:string)=>RegExp}
 */
const _stringToRegExp=function(string){
  if(!string) throw Error(progName+': _stringToRegExp: No parameter passed');
  if(typeof string!=='string') throw Error(progName+': _stringToRegExp: Parameter "string" must be a string or a RegExp');
  const chkIfFlags=function(string=''){
    const knownFlags=['d','g','i','m','s','u','v','y'];
    knownFlags.forEach(value=>{
      string=string.replace(value,'');
    });
    if(string==='') return true;
    return false;
  }
  const mask={
    masks:
      [
        ['\\/','--ßläsh--']
      ],
    mask(string='',from=0,to=1){
      this.masks.forEach(value=>{
        string=string.replaceAll(value[from],value[to]);
      })
      return string;
    },
    off(string=''){return this.mask(string,1,0)},
    on(string=''){return this.mask(string,0,1)}
  };
  const myParts=mask.on(string).split('/');
  if(myParts.length===1) return new RegExp(string);
  if(myParts[0]===''){
    if(myParts[myParts.length-1]==='') return new RegExp(myParts.slice(1,-1).join('/'));
    if(chkIfFlags(myParts[myParts.length-1])) return new RegExp(myParts.slice(1,-1).join('/'),myParts[myParts.length-1]);
    return new RegExp(string);
  }
  if(myParts[myParts.length-1]==='') return new RegExp(string);
  if(chkIfFlags(myParts[myParts.length-1])) return new RegExp(myParts.slice(0,-1).join('/'),myParts[myParts.length-1]);
  return new RegExp(string);
}

const _getSettings=function(){
  return new Promise((res, rej) => {
    if(pkg){
      if(Object.hasOwn(pkg,'commits-to-changelog')){
        Object.keys(pkg['commits-to-changelog']).forEach(value=>{
          _settings[value]=pkg['commits-to-changelog'][value];
        })
        _settings.filterCommits=_settings.filterCommits.map(/** @type{(value:string)=>RegExp} */ value=>_stringToRegExp(value));
      }
    }
    if(_settings.filterDefaults) [ /^bump version$/i, /^changelog$/i, /^dev:/i, /^[Hh]ousekeeping/i, /^planning/i, /[Rr]efactoring/i, /tests/i ].forEach(value=>{_settings.filterCommits.push(value)});
    res(true);
  });
}

const _evalUseDateGroups=function(){
  return new Promise((res, rej) => {
    if(!_settings.useDateGroups) return res('true');
    if(_settings.useDateGroups==='never') return res('true');
    const settingDefault='never';
    const settingAllowedNoDate=['never','always'];
    if(settingAllowedNoDate.includes(_settings.useDateGroups)){
      _progState.dateGroups.when=_settings.useDateGroups;
      return res(true);
    }
    const settingAllowedWithDate=['after','before'];
    if(!settingAllowedWithDate.includes(_settings.useDateGroups.split(':')[0])) throw Error(progName+`: Setting "useDateGroups" must be one of "${settingAllowedNoDate.concat(settingAllowedWithDate.map(value=>value+':<isodate>')).filter(value=>value!==settingDefault).join('" / "')}" / "${settingDefault}" (default)`);
    _settings.useDateGroups.split(':').forEach(/**@type{(value:string,index:number)=>any}*/(value,index)=>{
      if(index===0) _progState.dateGroups.when=value;
      if(index===1) {
        if(!isIsoDate(value)) throw Error(progName+': Setting "useDateGroups": "'+_settings.useDateGroups+'" does not contain a valid ISO date');
        _progState.dateGroups.isodate=value;
      }
    });
    res('true');
  });
}

const _getCommitURI=function(){
  return new Promise((res, rej) => {
    let remoteRepoUrl;
    try{
      remoteRepoUrl=_getRemoteRepoUrl();
    }
    catch(err){
      rej(err);
    }
    if (remoteRepoUrl) {
      let dir = (remoteRepoUrl.includes("bitbucket") ? "/commits/" : "/commit/");
      commitURI = remoteRepoUrl + dir;
    }
    res(true);
  });
}

/** @type{(err:string|Error)=>void} */
const _errConsole=function(err){
  console.log();
  console.log('+--------------------------------------------+');
  console.log('| There was an error creating your changelog |');
  console.log('+--------------------------------------------+');
  console.error(err.toString());
  console.log();
}

if(process.argv[1].split(sep).slice(-1)[0]==='cli.js'){
  checkArgs()
    .then(_checkIfGitRepo)
    .then(_getPackageJson)
    .then(_getSettings)
    .then(_evalUseDateGroups)
    .then(_getCommitURI)
    .then(getCommits)
    .then(splitCommits)
    .then(formatCommits)
    .then((res)=>{
      _linesToReadme(res)
      .catch(err=>_errConsole(err));
      return res;
    })
    .then(flagIndention)
    .then(setHeader)
    .then(evalNewestCommits)
    .then(prepareOutput)
    .then(save)
    .catch(err => {
      _errConsole(err);
      process.exit(1);
    });
}

function checkArgs() {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    return Promise.reject("Currently no command line arguments are supported");
  }
  return Promise.resolve();
}

function getCommits() {
  return new Promise((res, rej) => {
    let fields=['cd','D','h','s','p'];
    if(_settings.useNotes) fields.push('N');
    exec(`git log --topo-order --date=short --format="${fields.map(value=>'%'+value).join('~>')}"`, (err, commits) => {
      if (err) {
        return rej(err);
      }

      res(commits);
    });
  });
}

/** @type{(commits:string)=>Promise<string[]>} */
function splitCommits(commits) {
  return Promise.resolve(commits.trim().split(EOL).filter(value=>value!==''));
}

/** @type{(commits:string[])=>Promise<object[]>} */
function formatCommits(commits) {
  /** @type{string} */
  let prevParent;

  return Promise.resolve(commits.map(/**@type{(commit:string)=>Object}*/commit => {
    let [date, refNames, hash, subject, parents, notes] = commit.split("~>");
    let mergeCommitStart = false;
    let mergeCommitEnd = false;
    let tag=null;
    tag=refNames.split(', ').filter(value=>value.startsWith('tag: ')).map(value=>value.split('tag: ')[1]).sort().join(' / ');

    if(_settings.headerMerged&&parents.split(' ').length>1){
      mergeCommitStart = true;
      prevParent = parents.slice(0, parents.indexOf(" "));
      subject = subject.replace(/^Merge branch ('.+?').*/, _settings.headerMerged+' $1');
    } else if (hash == prevParent) {
      mergeCommitEnd = true;
    }

    subject = encodeHTML(subject);

    return {date, tag, hash, subject, mergeCommitStart, mergeCommitEnd, notes};
  }));
}

/** @type{(subject:string)=>string} */
function encodeHTML(subject) {
  return subject
    .replace(/&/g, "&amp;")         // Encode ampersands
    .replace(/</g, "&lt;")          // Encode less-than symbols
    .replace(/\\$/, "\\\\")         // Escape back-slash if it's the last char
    .replace(/]/g, "\\]")           // Escape right-brackets
    .replace(/(?!.*])\[/g, "&#91;") // Encode left-brackets (if no right-brackets are present)
    .replace(/`/g, "\\`");          // Escape back-ticks
}

/** @type{(subject:string)=>boolean} */
const _filterOutCommit=function(subject){
  for(const filter of _settings.filterCommits){
    if(new RegExp(filter).test(subject)) return true;
  }
  return false;
}

/** @type{(commits:any[])=>Promise<void>} */
async function _linesToReadme(formattedCommits) {
  if(!_settings.linesToReadme) return;
  let linesToCheck=parseInt(_settings.linesToReadme);
  if(`${parseInt(linesToCheck.toString())}`!==`${_settings.linesToReadme}`) linesToCheck=-1;
  if(isNaN(linesToCheck)||linesToCheck<0) throw Error(progName+': _linesToReadme: Setting "linesToReadme" must be a positive integer or a string containing (only) a positive integer');
  if(linesToCheck<1) return;
  if(!existsSync('README.md')) throw Error(progName+': _linesToReadme: No "README.md" given');
  const markdownBeforeAfter=await _getMarkdownBeforeAfterSection('README.md',/Changelog/i);
  if(!markdownBeforeAfter.found) throw Error(progName+': _linesToReadme: No section "Changelog" (case insensitive) in README.md found');
  writeFileSync('README.md',markdownBeforeAfter.before);
  appendFileSync('README.md',EOL);
  appendFileSync('README.md',`<!--Section content auto-generated by commits-to-changelog (https://npmjs.com/commits-to-changelog) at ${new Date().toISOString()} -->${EOL}`);
  appendFileSync('README.md',`*Last ${_settings.linesToReadme} changes - see [CHANGELOG file](CHANGELOG.md) for full list and details*${EOL}`);
  appendFileSync('README.md',EOL);
  let tag='';
  let versionStamp='';
  for(let i=0;i<linesToCheck&&i<formattedCommits.length;i++){
    if(formattedCommits[i].tag) tag=formattedCommits[i].tag;
    versionStamp=tag?tag:formattedCommits[i].date;
    if(_filterOutCommit(formattedCommits[i].subject)){
      linesToCheck++;
      continue;
    }
    appendFileSync('README.md',`  * (${versionStamp}) ${formattedCommits[i].subject}${EOL}`);
  }
  appendFileSync('README.md',EOL+EOL);
  appendFileSync('README.md',markdownBeforeAfter.after);
}

/** @type{(commits:any[])=>Promise<string[]>} */
function flagIndention(formattedCommits) {
  return Promise.resolve(formattedCommits.map((commit, i) => {
    if (i > 0) {
      let prevCommit = formattedCommits[i - 1];

      if (commit.tag || commit.mergeCommitStart || commit.mergeCommitEnd) {
        commit.indent = false;
      } else if (prevCommit.mergeCommitStart || prevCommit.indent) {
        commit.indent = true;
      } else {
        commit.indent = false;
      }
    } else {
      commit.indent = false;
    }

    return commit;
  }));
}

/** @type{(commits:any[])=>Promise<string[]>} */
function setHeader(formattedCommits) {
  out = "# Changelog"+EOL;

  return Promise.resolve(formattedCommits);
}

/** @type{(commits:any[])=>Promise<string[]>} */
function evalNewestCommits(formattedCommits) {
  return new Promise((res, rej) => {
    if (!formattedCommits[0].tag) {
      if(_settings.requireTag) throw Error(progName+': Untagged commit found (use setting "requireTag:false" to allow untagged commits)');
      let header=_progState.dateGroups.getHeader(formattedCommits[0].date);
      if(!header) header=_settings.headerDefault;
      if(pkg&&pkg.version&&_checkNonLabeledSemver(pkg.version)){
        const latestTag=spawnSync('git',['describe','--tags','--abbrev=0'],{encoding:'utf8'}).stdout.split(EOL)[0];
        if(latestTag&&_checkNonLabeledSemver(latestTag)){
          if(_compareSemver(pkg.version,latestTag)===2) rej(`Your package version (${pkg.version}) has a SemVer value that falls before your latest tag (${latestTag}).`);
          if(pkg.version!==latestTag) header=pkg.version;
        }
      }
      out+=_mkGroupHeader(
        header,
        _settings.defaultDateToday?new Date().toISOString().slice(0,10):formattedCommits[0].date
      );
    }
    res(formattedCommits);
  });
}

/** @type{(tag:string,date:string)=>string} */
const _mkGroupHeader=function(header,date){
  let myTitle=header!==date?`${header} (${date})`:`*${header}*`;
  return EOL+`## ${myTitle}`+EOL+EOL;
}

/** @type{(subject:string,hash:string)=>string} */
const _mkCommitLink=function(subject,hash){
  if(!_settings.referenceLinks) return `[${subject}](${commitURI + hash})`;
  _progState.referenceLinks.add(hash,commitURI + hash);
  return `[${subject}][${hash}]`;
}

/** @type{(formattedCommits:any[])=>Promise<boolean>} */
function prepareOutput(formattedCommits) {
  formattedCommits.forEach(commit => {
    let header=commit.tag?commit.tag:'';
    if(!header) header=_progState.dateGroups.getHeader(commit.date);
    if(header) out+=_mkGroupHeader(header,commit.date);

    for(const filter of _settings.filterCommits){
      if(new RegExp(filter).test(commit.subject)) return;
    }

    if (commit.indent) {
      out += "  ";
    }

    if (commitURI) {
      out += '- '+_mkCommitLink(commit.subject,commit.hash)+EOL;
    } else {
      out += `- ${commit.subject}`+EOL;
    }

    if(commit.notes) out+=`  - *Note:* ${commit.notes}`+EOL;

  });

  if(_settings.referenceLinks) out+=EOL+EOL+_progState.referenceLinks.getDefList()+EOL;

  return Promise.resolve(true);
}

function save() {
  return new Promise((res, rej) => {
    writeFile("./CHANGELOG.md", out, err => {
      if (err) {
        return rej(err);
      }

      res(true);
    });
  });
}

/** Formally an ISO date "yyyy-mm-dd"
 *  - ! not checking if possible real date, i.e not excluding february 30th etc.
 */
export const isIsoDate=function(string=''){
  if(!string) return false;
  const myParts=string.split('-');
  if(myParts.length!==3) return false;
  /** @type{{[key:number]:number}} */
  const fieldLengths={
    0:4,
    1:2,
    2:2
  }
  /** @type{{[key:number]:number}} */
  const maxVals={
    1:12,
    2:31
  }
  for(let i=0;i<myParts.length;i++){
    if(myParts[i].length!==fieldLengths[i]) return false;
    // @ts-ignore
    if(isNaN(myParts[i])) return false;
    if(parseInt(myParts[i])<1) return false;
    if(Object.hasOwn(maxVals,i)&&parseInt(myParts[i])>maxVals[i]) return false;
  }
  return true;
}

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
  if(!commandline) throw Error(brandMsg(`commonSpawn: Parameter "commandline" must be set`));
  if(typeof commandline!=='string') throw Error(brandMsg(`commonSpawn: Parameter "commandline" must be a string`));
  // Normalize quotes for args with spaces: best compromise for Node vs. Bun
  const [exec, ...args]=commandline.replaceAll('"',"'").split(' ');
  for(let i=0; i<args.length; i++){
    if(['&&','||','|'].includes(args[i])) throw Error(brandMsg(`commonSpawn: Operators like "${args[i]}" are not supported - try to combine multiple commonSpawn calls by JavaScript means`));
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
    throw Error(brandMsg(`commonSpawn: commandline not executable: "${commandline}": ${errCause}`));
  }
  return {status:myResult.status,stderr:myResult.stderr.split(EOL),stdout:myResult.stdout.split(EOL)}
}
