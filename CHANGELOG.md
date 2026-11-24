# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.1] - 2026-11-24

### Added

- Translations for the rest of the strings added in Orca 1.4.272, including Bot settings, items and paired servers, the worker dock, native chat questions and queued messages, Antigravity sign-in choices, the app rail, memory and disk notices, release channels and chat deletion.

### Changed

- Translations for the 130 strings whose English changed in Orca 1.4.272. Interrupted chats that resume after a restart are now called agents.
- Coverage is 21,615 of 24,700 strings, with 903 kept in English on purpose, 2,182 protected by Orca and none missing.

### Fixed

- Clearer wording in several Bot templates and messages: leaked secrets, alerts that fire, the sign-in address to paste, and the Replies setting of a group.

## [1.6.0] - 2026-11-24

### Added

- Translations for the strings Orca 1.4.272 shows from its main process: the new Bot templates, their skills and schedules, Bot failure and tool sign-in messages, group attachments, Bot notices, app connector lines and chat deletion.
- `check-pack.mjs` reports coverage the way Orca counts it, for the main process catalog and the full catalog, and fails when the main process catalog is under the 80% Orca needs to offer the pack. `tools/main-catalog-keys.mjs` reads that catalog from an Orca install.

### Changed

- The pack now requires Orca 1.4.272 or newer.
- Protected keys follow the protected copy list of Orca 1.4.272.
- Coverage is 21,013 of 24,700 strings, with 884 kept in English on purpose, 2,182 protected by Orca and 621 not translated yet. The main process catalog is 98% covered.

### Fixed

- Tiếng Việt showed as unavailable in Orca 1.4.272, because the pack covered only 53% of the main process catalog.

### Removed

- Translations for the 113 strings Orca 1.4.272 no longer uses.

## [1.5.1] - 2026-11-21

### Changed

- The manifest uses format 2 and no longer sets a publisher, so Orca takes it from the GitHub owner and the pack can be listed in the Orca community catalog.

## [1.5.0] - 2026-11-21

### Added

- Translations for the strings added or changed in Orca 1.4.266, including Bots (setup, who can ask, webhooks, connectors, import and automations), native chat, Workspace Cleanup, voice cleanup, uninstall, Antigravity accounts, agent CLI updates and the new sidebar items.

### Changed

- The pack now requires Orca 1.4.266 or newer.
- Protected keys follow the protected copy list of Orca 1.4.266, which adds the bot access prompts.
- Coverage is 20,744 of 23,650 strings, with 870 kept in English on purpose, 2,036 protected by Orca and none missing.

### Removed

- Translations for the 423 strings Orca 1.4.266 no longer uses.

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

[Unreleased]: https://github.com/Miinwan/orca-vietnamese/compare/v1.6.1...HEAD
[1.6.1]: https://github.com/Miinwan/orca-vietnamese/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/Miinwan/orca-vietnamese/compare/v1.5.1...v1.6.0
[1.5.1]: https://github.com/Miinwan/orca-vietnamese/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/Miinwan/orca-vietnamese/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Miinwan/orca-vietnamese/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Miinwan/orca-vietnamese/releases/tag/v1.3.0
