###### npm package

# commits-to-changelog

Create an unopionated CHANGELOG.md from the Git commit history of Node packages

* If the project's package.json has a `repository` defined this will be used for commit links.
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

Merged commits with Git's default subject naming convention are summarized under a title line `Implement '<branch-name>'`, e.g.

```sh
git log --graph --oneline
*   dddb03a (HEAD -> master, origin/master)  Merge branch 'feat/additional-validation' into master
|\
| * 1027df0 Update inline docs
| * f6f8cd1 Update error e041 message
| * 67e294b Add error e040
|/
* 8c6a1cc Add support for admin-only routes
* 4bd8518 Update token hash to include encoded user name
```

will be

```markdown
- Implement 'feat/additional-validation'
  - Update inline docs
  - Update error e041 message
  - Add error e040
- Add support for admin-only routes
- Update token hash to include encoded user name
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

With [git-to-changelog](#git-to-changelog) there already was a very good solution, but due to a hardwired search path '../../package.json' - mimicking npm's way of structuring a `node_modules` folder - one that does not work with pnpm.


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

### Semantic Versioning: Pre-release versions
  * <https://semver.org/#spec-item-9>


<!-- see https://hh-lohmann.github.io/html-endspacer -->
<p id="endspacer" data-version="0.2.0" title="Endspacer - helps to align scrolling and positioning link targets | Scroll up to content or click / touch to jump to page top" align="center"><a href="#top"><img alt="Endspacer: './markdown-assets/endspacer.png' missing - see https://hh-lohmann.github.io/html-endspacer" src="./markdown-assets/endspacer.png" height="1000" width="100%"><br>[top]</a></p>
