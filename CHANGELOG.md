# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2026-11-11

### Added

- Translations for the strings added or changed in Orca 1.4.256, including voice dictation, saved passwords, Git Graph, Chat UI onboarding and branch switching.
- Checks for the string rules of Orca 1.4.256: no control or bidirectional characters, no added line breaks, and at most 4 times the English length (at least 64 characters).

### Changed

- The pack now requires Orca 1.4.256 or newer.
- Protected keys follow the protected copy list of Orca 1.4.256, which also covers destructive confirmations and native message boxes.
- Coverage is 17,443 of 19,624 strings, with 792 kept in English on purpose, 1,389 protected by Orca and none missing.
- Shortcut placeholders such as `{terminal.splitRight}` are checked like other placeholders.

### Fixed

- The feature wall animations broke because their CSS was translated. That CSS now stays in English.

### Removed

- Translations for the 708 strings Orca 1.4.256 no longer uses.

## [1.3.0] - 2026-11-02

### Added

- Translations for the strings added or changed in Orca 1.4.245.
- A `displayName` of `Tiếng Việt`, so the Language list shows the name in Vietnamese.

### Changed

- The pack now requires Orca 1.4.245 or newer.
- Coverage is 17,030 of 18,316 strings, with 761 kept in English on purpose, 525 protected by Orca and none missing.
- Kept English terms are capitalized at the start of a sentence.

### Fixed

- The pack did not appear in the Language list because it covered less than the 80% of the main catalog that Orca requires.

## [1.1.0] - 2026-10-20

### Added

- First release of the language pack, built against Orca 1.4.230.

[Unreleased]: https://github.com/Miinwan/orca-vietnamese/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/Miinwan/orca-vietnamese/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Miinwan/orca-vietnamese/releases/tag/v1.3.0
