# Changelog

## 2.6.2 (2026-09-02)

- [README: Update example for multiple Git tags][8761a07]

## 2.6.1 (2026-09-01)

- [README wording, typos][31dda8d]

## 2.6.0 (2026-09-01)

- [Feature: Print commit links as Markdown reference-style links][d98596a]

## 2.5.0 (2026-09-01)

- [Feature: Use commit date to group commits (additionally to tags)][a74b4b0]

## 2.4.1 (2026-09-01)

- [README: wording][630785a]

## 2.4.0 (2026-09-01)

- [Feature: Support Git notes][8e56011]

## 2.3.0 (2026-09-01)

- [Feature: Use commit date as group date if no tag is given (opt with setting to "current date")][67ee0b3]

## 2.2.2 (2026-09-01)

- [README: Clarify: Independent of special commit conventions][8393cb6]
- [README: Fix: Description of used date (commit date)][58ecc19]

## 2.2.1 (2026-08-26)

- [Fix: Handling RegExp in settings, especially flags][68f67a8]

## 2.2.0 (2026-08-26)

- [Deprecate: "Merged Branches" (intentional "no-ff" merges)][d905fc2]
- [README: Clarify: Any kind of tag naming possible][325d502]
- [README: clarify special handling for merged branches][3ccd7eb]

## 2.1.0 (2026-08-22)

- [README: Clarify: Git remote must be defined for current branch to be used][be7b6ec]
  - *Note:* **! Wrong commit message (not changeable): Must be "*README: Git tags: No dfference for lightweight vs. annotated branches*"**
- [Feature: Support multiple tags on the same commit][5677df6]

## 2.0.1 (2026-08-22)

- [README: Clarify: Git remote must be defined for current branch to be used][d639f01]

## 2.0.0 (2026-08-22)

- [Feature: Require tag (depending on setting requireTag): Reject creating a Changelog if commits without associated Git tag exist][4bba2cc]

## 1.6.2 (2026-08-22)

- [Feature: Write newest changelog entries also to README.md: add: Write HTML comment informing that content was inserted by commits-to-changelog][b6f8f5c]
- [Feature: Write newest changelog entries also to README.md: display if no tag asscociated: only date][c17d281]
- [fix: internal handling of EOF while searching for a section "Changelog" in README.md][4ec3fe0]
- [Feature: Write newest changelog entries also to README.md: fix: reject string containing more than a positive integer as value for "linesToReadme"][6d596e9]
- [Feature: Write newest changelog entries also to README.md: clarify: linesToReadme = 0 /  false / undefined leaves an existing section "Changelog" untouched][9ebf79a]

## 1.6.1 (2026-08-21)

- [Filter commits: optional default filtering case insensitive][44acc69]

## 1.6.0 (2026-08-21)

- [Typo][39a7a81]
- [Update README][cfadf7a]
- [Feature: Allow to have no package.json at all][e89db26]
- [Feature: Allow non-semver tags][ee36b3f]
- [Feature: Allow to have no package.json version = use package.json version only if given][e6aed9f]
- [Feature: Compare pkg.version and latestTag only for possible headerDefault change only if both are non-labeled SemVer][12bf3fc]

## 1.5.1 (2026-08-20)

- [HOTFIX: Internal execution control did not work with global installation][7db530c]

## 1.5.0 (2026-08-20)

- [Feature: Write newest changelog entries also to README.md in same directory if this has a section Changelog (case insensitive), number of entries via setting, default: 0 = do not try to write to README.md][6e11061]

## 1.4.2 (2026-08-15)

- [Fix getting lastest tag: avoid wrong order / wrong branch = allowing multiple branches and restrospective tags][ee5dbd0]
- [Change module system from CommonJS to ESM][317abad]

## 1.4.1 (2026-08-13)

- [Feature: Replace dependency compare-versions by own function][ac95b03]

## 1.4.0 (2026-08-12)

- [Filter commits: Exclude commits / commit types via RegExp against commit messages][e5fec88]

## 1.3.0 (2026-08-11)

- [Revert undocumented optional argument --stage (was just formally inherited from git-to-changelog)][d47f424]
- [Feature: Read settings from package.json][f835279]

## 1.2.0 (2026-08-11)

- [Change title for merged branches from opionated "Implement" to more neutral "Include (results of) separate branch"][905ee21]
- [Improve error handling][b80d4aa]

## 1.1.0 (2026-08-11)

- [Change default title for group of commits from "Latest" to more neutral "Current"][e2e12a0]
- [README: Clarify: Existing CHANGELOG.md will be overwritten][47ddd8f]
- [README: Clarify handling of merged branches][c235acd]

## 1.0.2 (2026-08-06)

- [Small fixes][4b661d6]

## 1.0.1 (2026-08-01)

- [Fix: Crash comparePkgVersion if no pkgVers available][680a39b]
- [Get commitURI from "git remote" instead of package.json][79be1eb]

## 1.0.0 (2026-07-31)

- [Fork from git-to-changelog with fix hardwired path '../../package.json' to process.cwd()+'/package.json'][957d477]


[8761a07]: https://github.com/hh-lohmann/commits-to-changelog/commit/8761a07
[31dda8d]: https://github.com/hh-lohmann/commits-to-changelog/commit/31dda8d
[d98596a]: https://github.com/hh-lohmann/commits-to-changelog/commit/d98596a
[a74b4b0]: https://github.com/hh-lohmann/commits-to-changelog/commit/a74b4b0
[630785a]: https://github.com/hh-lohmann/commits-to-changelog/commit/630785a
[8e56011]: https://github.com/hh-lohmann/commits-to-changelog/commit/8e56011
[67ee0b3]: https://github.com/hh-lohmann/commits-to-changelog/commit/67ee0b3
[8393cb6]: https://github.com/hh-lohmann/commits-to-changelog/commit/8393cb6
[58ecc19]: https://github.com/hh-lohmann/commits-to-changelog/commit/58ecc19
[68f67a8]: https://github.com/hh-lohmann/commits-to-changelog/commit/68f67a8
[d905fc2]: https://github.com/hh-lohmann/commits-to-changelog/commit/d905fc2
[325d502]: https://github.com/hh-lohmann/commits-to-changelog/commit/325d502
[3ccd7eb]: https://github.com/hh-lohmann/commits-to-changelog/commit/3ccd7eb
[be7b6ec]: https://github.com/hh-lohmann/commits-to-changelog/commit/be7b6ec
[5677df6]: https://github.com/hh-lohmann/commits-to-changelog/commit/5677df6
[d639f01]: https://github.com/hh-lohmann/commits-to-changelog/commit/d639f01
[4bba2cc]: https://github.com/hh-lohmann/commits-to-changelog/commit/4bba2cc
[b6f8f5c]: https://github.com/hh-lohmann/commits-to-changelog/commit/b6f8f5c
[c17d281]: https://github.com/hh-lohmann/commits-to-changelog/commit/c17d281
[4ec3fe0]: https://github.com/hh-lohmann/commits-to-changelog/commit/4ec3fe0
[6d596e9]: https://github.com/hh-lohmann/commits-to-changelog/commit/6d596e9
[9ebf79a]: https://github.com/hh-lohmann/commits-to-changelog/commit/9ebf79a
[44acc69]: https://github.com/hh-lohmann/commits-to-changelog/commit/44acc69
[39a7a81]: https://github.com/hh-lohmann/commits-to-changelog/commit/39a7a81
[cfadf7a]: https://github.com/hh-lohmann/commits-to-changelog/commit/cfadf7a
[e89db26]: https://github.com/hh-lohmann/commits-to-changelog/commit/e89db26
[ee36b3f]: https://github.com/hh-lohmann/commits-to-changelog/commit/ee36b3f
[e6aed9f]: https://github.com/hh-lohmann/commits-to-changelog/commit/e6aed9f
[12bf3fc]: https://github.com/hh-lohmann/commits-to-changelog/commit/12bf3fc
[7db530c]: https://github.com/hh-lohmann/commits-to-changelog/commit/7db530c
[6e11061]: https://github.com/hh-lohmann/commits-to-changelog/commit/6e11061
[ee5dbd0]: https://github.com/hh-lohmann/commits-to-changelog/commit/ee5dbd0
[317abad]: https://github.com/hh-lohmann/commits-to-changelog/commit/317abad
[ac95b03]: https://github.com/hh-lohmann/commits-to-changelog/commit/ac95b03
[e5fec88]: https://github.com/hh-lohmann/commits-to-changelog/commit/e5fec88
[d47f424]: https://github.com/hh-lohmann/commits-to-changelog/commit/d47f424
[f835279]: https://github.com/hh-lohmann/commits-to-changelog/commit/f835279
[905ee21]: https://github.com/hh-lohmann/commits-to-changelog/commit/905ee21
[b80d4aa]: https://github.com/hh-lohmann/commits-to-changelog/commit/b80d4aa
[e2e12a0]: https://github.com/hh-lohmann/commits-to-changelog/commit/e2e12a0
[47ddd8f]: https://github.com/hh-lohmann/commits-to-changelog/commit/47ddd8f
[c235acd]: https://github.com/hh-lohmann/commits-to-changelog/commit/c235acd
[4b661d6]: https://github.com/hh-lohmann/commits-to-changelog/commit/4b661d6
[680a39b]: https://github.com/hh-lohmann/commits-to-changelog/commit/680a39b
[79be1eb]: https://github.com/hh-lohmann/commits-to-changelog/commit/79be1eb
[957d477]: https://github.com/hh-lohmann/commits-to-changelog/commit/957d477
