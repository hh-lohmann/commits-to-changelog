#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const {existsSync}=require('node:fs');
const {EOL}=require('node:os');

let fs = require("fs"),
    exec = require("child_process").exec,
    pkg,
    commitURI,
    out;

const progName='commits-to-changelog';

/** Settings
 *  - Predefined values that may be overwritten via "commits-to-changelog" in
 *    a package.json belonging to the repo to make a changelog for
 * @param ~~name~~ - ~~short descripion~~
 */
const _settings={
  filterCommits:[],
  filterDefaults: true,
  headerDefault: 'Current',
  headerMerged: 'Include (results of) separate branch'
}

exports.testOnlyExports=function(){
  const localTestsFolder=module.path+'/tests/';
  if(process.argv[1].slice(0,localTestsFolder.length)===localTestsFolder){
    return (
      {
      _settings:_settings
      }
    )
  }
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

const _getRemoteRepoUrl=function(){
  const myBranch=spawnSync('git',['branch','--show-current'],{encoding:'utf8'}).stdout.replace(/\s/g,'');
  if(!myBranch) throw Error(progName+': Could not get name of current branch');
  const myRemote=spawnSync('git',['config','branch.'+myBranch+'.remote'],{encoding:'utf8'}).stdout.replace(/\s/g,'');
  if(!myRemote) return undefined;
  let myUrl=spawnSync('git',['remote','get-url',myRemote],{encoding:'utf8'}).stdout.replace(/\s/g,'')
  if(!myUrl) throw Error(progName+': Could not get URL for defined remote');
  try{
    myUrl=new URL(myUrl);
  }
  catch(err){
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
    res();
  });
}

const _getPackageJson=function(){
  return new Promise((res, rej) => {
    if(!existsSync('package.json')) throw Error('No package.json found');
    try{
      pkg=require(process.cwd()+'/package.json');
    }
    catch(err) {
      return rej(Error('package.json could not be loaded'));
    }
    res();
  });
}

/** Handle string containing RegExp
 *  - Especially for JSON that has no type "RegExp"
 *  - Makes both e.g. "/^exp$/" and "^exp$" to /^exp$/ (i.e. interprets
 *    unquoted "/" at start and end as RegExp delimiters)
 * @example _stringToRegExp("/^exp$/")
 * @example _stringToRegExp("^exp$")
 * @param string - The string to return as RegExp
 * @returns Resulting RegExp
 * @type {(string:string)=>RegExp}
 */
const _stringToRegExp=function(string){
  if(/^\//.test(string)) string=string.slice(1);
  if(/[^\\]\/$/.test(string)) string=string.slice(0,-1);
  return new RegExp(string);
}

const _getSettings=function(){
  return new Promise((res, rej) => {
    if(Object.hasOwn(pkg,'commits-to-changelog')){
      Object.keys(pkg['commits-to-changelog']).forEach(value=>{
        _settings[value]=pkg['commits-to-changelog'][value];
      })
      _settings.filterCommits=_settings.filterCommits.map(value=>_stringToRegExp(value));
    }
    res();
  });
}

const _getCommitURI=function(){
  return new Promise((res, rej) => {
    let remoteRepoUrl='';
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
    res();
  });
}

checkArgs()
  .then(_checkIfGitRepo)
  .then(_getPackageJson)
  .then(_getSettings)
  .then(_getCommitURI)
  .then(getCommits)
  .then(splitCommits)
  .then(formatCommits)
  .then(flagIndention)
  .then(setHeader)
  .then(evalNewestCommits)
  .then(prepareOutput)
  .then(save)
  .catch(err => {
    let errMsg = "";

    errMsg += "+--------------------------------------------+"+EOL;
    errMsg += "| There was an error creating your changelog |"+EOL;
    errMsg += "+--------------------------------------------+"+EOL;

    console.error("\x1b[31m%s\x1b[0m", errMsg);
    console.error(err + EOL);

    process.exit(1);
  });

function checkArgs() {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    return Promise.reject("Currently no command line arguments are supported");
  }
  return Promise.resolve();
}

function getCommits() {
  return new Promise((res, rej) => {
    exec("git log --topo-order --date=short --format=\"%cd~>%d~>%h~>%s~>%p\"", (err, commits) => {
      if (err) {
        return rej(err);
      }

      res(commits);
    });
  });
}

function splitCommits(commits) {
  return Promise.resolve(commits.trim().split(EOL));
}

function formatCommits(commits) {
  let prevParent;

  return Promise.resolve(commits.map(commit => {
    let [date, refNames, hash, subject, parents] = commit.split("~>"),
        mergeCommitStart = false,
        mergeCommitEnd = false,
        validTag,
        tag;

    if (refNames && refNames.includes("tag:")) {
      validTag = refNames.match(/tag: v?(\d{1,}\.\d{1,}\.\d{1,}[^,)]*)/);

      if (validTag) {
        tag = validTag[1].trim();
      }
    } else {
      tag = null;
    }

    if (parents && parents.includes(" ")) {
      mergeCommitStart = true;
      prevParent = parents.slice(0, parents.indexOf(" "));
      subject = subject.replace(/^Merge branch ('.+?').*/, _settings.headerMerged+'$1');
    } else if (hash == prevParent) {
      mergeCommitEnd = true;
    }

    subject = encodeHTML(subject);

    return {date, tag, hash, subject, mergeCommitStart, mergeCommitEnd};
  }));
}

function encodeHTML(subject) {
  return subject
    .replace(/&/g, "&amp;")         // Encode ampersands
    .replace(/</g, "&lt;")          // Encode less-than symbols
    .replace(/\\$/, "\\\\")         // Escape back-slash if it's the last char
    .replace(/]/g, "\\]")           // Escape right-brackets
    .replace(/(?!.*])\[/g, "&#91;") // Encode left-brackets (if no right-brackets are present)
    .replace(/`/g, "\\`");          // Escape back-ticks
}

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

function setHeader(formattedCommits) {
  out = "# Changelog"+EOL;

  return Promise.resolve(formattedCommits);
}

function evalNewestCommits(formattedCommits) {
  return new Promise((res, rej) => {
    exec("git log --tags -1 --format=\"%d\"", (err, commit) => {
      if (err) {
        return rej(err);
      }

      let pkgVers = pkg.version,
          tag,
          latestTag = "0.0.0";

      tag = commit.match(/tag: v?(\d{1,}\.\d{1,}\.\d{1,}[^,)]*)/);

      if (tag) {
        latestTag = tag[1].trim();
      }

      if(!pkgVers) return rej('The package.json for the current project does not contain a version key');

      let comparePkgVersLatestTag;
      try{
        comparePkgVersLatestTag=_compareSemver(pkgVers,latestTag);
      }
      catch(err){
        return rej(`Your package version (${pkgVers}) cannot be processed: ${err.message}`);
      }
      if(comparePkgVersLatestTag===2){
        return rej(`Your package version (${pkgVers}) has a SemVer value that falls before your latest tag (${latestTag}).`);
      }

      if (!formattedCommits[0].tag) {
        out += EOL+`## ${pkgVers === latestTag ? _settings.headerDefault : pkgVers} (${getToday()})`+EOL+EOL;
      }

      res(formattedCommits);
    });
  });
}

function getToday() {
  let date = new Date();

  return `${date.getFullYear()}-${prepend0(date.getMonth() + 1)}-${prepend0(date.getDate())}`;
}

function prepend0(val) {
  return (val < 10 ? "0" + val : val);
}

function prepareOutput(formattedCommits) {
  if(_settings.filterDefaults) [ /^bump version$/, /^changelog$/, /^dev:/, /^[Hh]ousekeeping/, /^planning/, /[Rr]efactoring/, /tests/ ].forEach(value=>{_settings.filterCommits.push(value)});
  formattedCommits.forEach(commit => {
    if (commit.tag) {
      out += EOL+`## ${commit.tag} (${commit.date})`+EOL+EOL;
    }

    for(const filter of _settings.filterCommits){
      if(new RegExp(filter).test(commit.subject)) return;
    }

    if (commit.indent) {
      out += "  ";
    }

    if (commitURI) {
      out += `- [${commit.subject}](${commitURI + commit.hash})`+EOL;
    } else {
      out += `- ${commit.subject}`+EOL;
    }
  });

  return Promise.resolve();
}

function save() {
  return new Promise((res, rej) => {
    fs.writeFile("./CHANGELOG.md", out, err => {
      if (err) {
        return rej(err);
      }

      res();
    });
  });
}
