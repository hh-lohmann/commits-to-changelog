###### npm package

# commits-to-changelog

Create an unopionated CHANGELOG.md from Git commit history (see [Details](#details))

* Creates CHANGELOG.md on each run from scratch, i.e. an existing on will be overwritten
* Optionally writes defined number of lines from the start of CHANGELOG.md also to an existing section with heading "Changelog" (or "CHANGELOG" or any preferred case) in README.md (see [linesToReadme](#linestoreadme) under [Settings](#settings))
* Commits that are rather not relevant for users, e.g. "bump version" / changelog" / addressing "tests" (full list see [filterDefaults](#filterdefaults) under [settings](#settings)), are filtered out by default, further commits / commit types to filter out can be [defined](#filtercommits) as as [setting](#settings)
  * I.e. no pressure to spoof commits or history to get a nice CHANGELOG
* Special handling of [Merged Branches](#merged-branches)
* Does explicitly not do any magic based on things [Conventional Commits](#conventional-commits) to keep it compatible with less organized repos, but of course you should use commit conventions.

*[hh lohmann &lt;hh.lohmann@gmail.com&gt;](mailto:hh.lohmann@gmail.com?subject=commits-to-changelog)*

<!-- see https://hh-lohmann.github.io/github-readme-pages-switch -->
<p align="center" id="github_readme_pages_switch" style="display:none;">
  <b><i>This page may be displayed more optimal in its
  <a href="https://hh-lohmann.github.io/commits-to-changelog">GitHub Pages view</a>
  </i></b>
</p>


## Changelog

*Last 5 changes - see [CHANGELOG file](CHANGELOG.md) for full list and details*

  * (1.6.0) Typo
  * (1.6.0) Update README
  * (1.6.0) Feature: Allow to have no package.json at all
  * (1.6.0) Feature: Allow non-semver tags
  * (1.6.0) Feature: Allow to have no package.json version = use package.json version only if given


## Synopsis

CLI without parameters

```sh
commits-to-changelog
```


## Parameters

no parameters


## Settings

Default settings can be overwritten by key-value pairs in an object as value for a key "commits-to-changelog" in a package.json belonging to the repo for which a CHANGELOG.md should be created, e.g.

```json
// package.json
{
  "version": "...",
  "commits-to-changelog": {
    "headerDefault": "Latest",
    "headerMerged": "Implement",
    "linesToReadme": "5"
  },
  "dependencies": {
    "...": "..."
  }
}
```

### Possible Settings

#### filterCommits
Array of RegExp: Filter out commits / commit types identified by a message matching one of the RegExps in the array
  * Default: undefined
  * Cf. [filterDefaults](#filterdefaults)
  * May be used for types of commits identified by message patterns or exact commits to exclude from a sensible CHANGELOG
  * Since JSON has no own type for them, RegExps have to be defined as strings, unlike vanilla JavaScript filterCommits does handle e.g. `^exp$` exactly like `/^exp$/` (i,e. interprets unquoted `/` at start and end as RegExp delimiters, not as literal `/` part of the RegExp)

#### filterDefaults
Boolean: Filter out commit types that are rather not relevant for users by matching commit messages against RegExps `/^bump version$/`, `/^changelog$/`, `/^dev:/`, `/^[Hh]ousekeeping/`, `/^planning/`, `/[Rr]efactoring/`, `/tests/`
  * Default: true
  * Own / additional RegExps via [filterCommits](#filtercommits)

#### headerDefault
String to use as header for listing commits that do not belong to a defined Git tag
  * Default: "Current"

#### headerMerged
String to use as header for listing [Merged Branches](#merged-branches) with a commit message of the form `Merge branch '<branch name>'`
  * Default: "Include (results of) separate branch"

#### linesToReadme
Write defined number of lines from the start of CHANGELOG.md also to an existing section with heading "Changelog" (or "CHANGELOG" or any preferred case) in README.md
  * Existing section content is overwritten
  * Short entry form with link to full CHANGELOG.md
  * If "0" or undefined: Do not write to README.md
  * Default: "0"
  * Throws errors if greater "0" but no README.md or no section "Changelog" (case insensitive) was found in README.md


## Returns

no return


## Examples

### Sample CHANGELOG.md

See the [CHANGELOG.md](https://github.com/hh-lohmann/commits-to-changelog/blob/release/CHANGELOG.md) of this project


### Sample for optionally writing to a section "Changelog" in README.md

See the section [Changelog](#changelog) in this file (cf. details for optional setting [linesToReadme](#linestoreadme) under [Settings](#settings))


### Merged Branches

Branches that were merged as an explicit commit (i.e. no fast-forward) are listed as indented blocks with the message of the merge commit as a title line, e.g.

```sh
* dddb03a (HEAD -> master, origin/master) fix/unclear-error
|\
| * f6f8cd1 Update error message
|/
* 4bd8518 Update token hash to include encoded user name
```

as

```markdown
- fix/unclear-error
  - Update error message
- Update token hash to include encoded user name
```

If the merge's commit message has the form `Merge branch '<branch name>'` it will be replaced by `Include (results of) separate branch '<branch-name>'`, e.g.

```sh
* dddb03a (HEAD -> master, origin/master) Merge branch 'fix/unclear-error'
...
```

as

```markdown
- Include (results of) separate branch 'fix/unclear-error'
...
```



## Dependencies

none


## Installation

CLIs should be installed systemwide ("global"). Strip off the `-g` parameter or replace it by a `-D` (as development dependency, `-d` for Bun) to explicitly restrict to a repo bounded usage.

Pick for your preferred package manager:

```shell
  npm i -g commits-to-changelog
```

```shell
  pnpm i -g commits-to-changelog
```

```shell
  bun i -g commits-to-changelog
```

```shell
  # For Yarn you should double check docs for your and / or
  # current Yarn version, newer versions do not treat `i package_name`
  # as an alias for `add ...` and exclude global installations
  yarn add commits-to-changelog
```


## Details

The resulting CHANGELOG.md has the simple structure

```
# Changelog

## {groupheader} ({date})

- [{commit-subject}]({commit-link})
- [{commit-subject}]({commit-link})

## {groupheader} ({date})

- [{commit-subject}]({commit-link})
- [{commit-subject}]({commit-link})

(...)

```

where `# Changelog` is the **title**, a Markdown [atx heading](#commonmark-spec-atx-headings) (i.e. using "#") of level 1 with the text "Changelog", followed by an empty line, and lists of commits that are **grouped** by

  1. if given: a Git tag they are associated with
  2. if no Git tag associated: an existing package.json version if this is [a non-labeled SemVer](#non-labeled-semver) and is newer than an existing previous tag that is also a non-labeled SemVer
  3. if none of the above applies: the [headerDefault](#headerdefault) (see [Settings](#settings))

so that the applicable Git tag / package.json version or the headerDefault becomes the `{groupheader}` that together with the date of the Git tag or else the current date constitutes a Markdown heading of level 2 under which **associated commits** are listed as

  1. if a [Git remote](#git-working-with-remotes-showing-your-remotes) is given: a link `[{commit-subject}]({commit-link})` formed by the [subject](#git-commmit-subject) of the commit and the remote entry for the commit what is usually a page including a [Git diff](#git-diff) for the commit
  1. if no Git remote is given: the subject of the commit only

Besides the existence and characteristics of Git tags, a possible package.json and Git remote defintions the actually resulting CHANGELOG.md can be shaped by [Settings](#settings).


## Source Code

  * GitHub: <https://github.com/hh-lohmann/commits-to-changelog>


## Prior Work

The (initial) code here is forked from [git-to-changelog](#git-to-changelog), an already very good solution, but due to a hardwired search path '../../package.json' - mimicking npm's way of structuring a `node_modules` folder - not usable with pnpm, and while fixing this some other little things were changed / improved (see [CHANGELOG](https://hh-lohmann.github.io/commits-to-changelog/CHANGELOG)) and made the initial little fix grow into an own project


## License

  * MIT (see [LICENSE.txt](LICENSE.txt))


## References

### CommonMark Spec: ATX headings
  * <https://spec.commonmark.org/0.31.2/#atx-headings>

### Conventional Commits
  * <https://www.conventionalcommits.org>

### Git commmit subject
  * The first line of a commit message that is separated from the body of the message by an empty line (identical to the whole message if this have empty line)
  * cf. Git's example for a commit_template: <https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration#_commit_template>

### Git: diff
  * <https://git-scm.com/docs/git-diff>

### Git: Working with Remotes: Showing Your Remotes
  * <https://git-scm.com/book/ms/v2/Git-Basics-Working-with-Remotes#_showing_your_remotes>

### git-to-changelog
  * npm registry: <https://www.npmjs.com/package/git-to-changelog>
  * npmx: <https://npmx.dev/package/git-to-changelog>
  * repo: <https://github.com/Grafluxe/git-to-changelog>

### Non-labeled SemVer
  * A semantic version (SemVer) that has *no* "labels for pre-release and build metadata (...) as extensions to the MAJOR.MINOR.PATCH format"
  * <https://semver.org/#:~#:~:text=Additional%20labels%20for%20pre%2Drelease%20and%20build%20metadata%20are%20available>


<!-- see https://hh-lohmann.github.io/html-endspacer -->
<p id="endspacer" data-version="0.2.0" title="Endspacer - helps to align scrolling and positioning link targets | Scroll up to content or click / touch to jump to page top" align="center"><a href="#top"><img alt="Endspacer: './markdown-assets/endspacer.png' missing - see https://hh-lohmann.github.io/html-endspacer" src="./markdown-assets/endspacer.png" height="1000" width="100%"><br>[top]</a></p>


