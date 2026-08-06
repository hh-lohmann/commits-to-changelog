###### npm package

# commits-to-changelog

Create an unopionated CHANGELOG.md from Git commit history

* Requires a package.json file in the repo for which a CHANGELOG.md should be created to retrieve version information, but the repo need not be really a Node package, see [Details](#details)
* If a [Git remote](#git-working-with-remotes-showing-your-remotes) is defined with an HTTPS URL this will be used (with some cleanup) for commit links (the remote is usually a GitHub repo from which the project is cloned from / pushes to, also GitLab / Bitbucket are possible)
* If Git tags exist these will be used for structuring the changes.
* Commits of merged branches are summarized with a title line "Implemented" (see [Examples](#examples))
* Does explicitly not do any magic based on things [Conventional Commits](#conventional-commits) to keep it compatible with less organized repos, but of course you should use commit conventions.

> Note that this is a fork of the ingenious [git-to-changelog](#git-to-changelog) with [some adjustments](#details).

*[hh lohmann &lt;hh.lohmann@gmail.com&gt;](mailto:hh.lohmann@gmail.com?subject=commits-to-changelog)*

<!-- see https://hh-lohmann.github.io/github-readme-pages-switch -->
<p align="center" id="github_readme_pages_switch" style="display:none;">
  <b><i>This page may be displayed more optimal in its
  <a href="https://hh-lohmann.github.io/commits-to-changelog">GitHub Pages view</a>
  </i></b>
</p>


## Synopsis

CLI without parameters

```sh
commits-to-changelog
```


## Parameters

no parameters


## Returns

no return


## Examples

## Sample Output

See the [CHANGELOG](https://github.com/Grafluxe/git-to-changelog/blob/master/CHANGELOG.md) of [git-to-changelog](#git-to-changelog), the project from which the code here was forked.


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

If the merge's commit message has the form `Merge branch '<branch name>'` it will be replaced by `Implement '<branch-name>'`, e.g.

```sh
* dddb03a (HEAD -> master, origin/master) Merge branch 'fix/unclear-error'
...
```

as

```markdown
- Implement 'fix/unclear-error'
...
```



## Dependencies

* [compare-versions](#compare-versions) to resolve sometimes complex version numbers for being smaller or greater (e.g. [pre-release versions](#semantic-versioning-pre-release-versions))


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

* Node's package.json file concept is used to retrieve / store a version information for the repo for which a CHANGELOG.md should be created, but this boils down to just requiring a valid version string, e.g.
  ```json
  {
    "version": "1.2.3"
  }
  ```


* The (initial) code here is forked from [git-to-changelog](#git-to-changelog) that is already a very good solution, but due to a hardwired search path '../../package.json' - mimicking npm's way of structuring a `node_modules` folder - does not work with pnpm, and while fixing this some other little things were changed / improved (see [CHANGELOG](https://github.com/hh-lohmann/commits-to-changelog/blob/release/CHANGELOG.md)) and made the initial little fix grow into an own project


## Source Code

  * GitHub: <https://github.com/hh-lohmann/commits-to-changelog>


## License

  * MIT (see [LICENSE.txt](LICENSE.txt))


## References

### compare-versions
  * npm registry: <https://www.npmjs.com/package/compare-versions>
  * npmx: <https://npmx.dev/package/compare-versions>
  * repo: <https://github.com/omichelsen/compare-versions>

### Conventional Commits
  * <https://www.conventionalcommits.org>

### git-to-changelog
  * npm registry: <https://www.npmjs.com/package/git-to-changelog>
  * npmx: <https://npmx.dev/package/git-to-changelog>
  * repo: <https://github.com/Grafluxe/git-to-changelog>

### Git: Working with Remotes: Showing Your Remotes
  * <https://git-scm.com/book/ms/v2/Git-Basics-Working-with-Remotes#_showing_your_remotes>

### Semantic Versioning: Pre-release versions
  * <https://semver.org/#spec-item-9>


<!-- see https://hh-lohmann.github.io/html-endspacer -->
<p id="endspacer" data-version="0.2.0" title="Endspacer - helps to align scrolling and positioning link targets | Scroll up to content or click / touch to jump to page top" align="center"><a href="#top"><img alt="Endspacer: './markdown-assets/endspacer.png' missing - see https://hh-lohmann.github.io/html-endspacer" src="./markdown-assets/endspacer.png" height="1000" width="100%"><br>[top]</a></p>
