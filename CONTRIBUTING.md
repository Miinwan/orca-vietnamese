# Contributing

Bad translations and text that overflows are the most useful reports. Open an issue with a screenshot, or send a fix.

## Fixing a translation

1. Find the key of the string in `locales/vi.json` or `sources/en-1.4.245.json`.
2. Add the translation to `tools/overrides.json` as a flat key, for example `menu.settings`. This file has the highest priority. To keep a string in English, add its key to `tools/keep-english.json` with a reason group.
3. Follow [the glossary](docs/glossary.md).
4. Rebuild and check:

   ```sh
   python3 tools/merge-drafts.py
   node tools/build-pack.mjs
   python3 tools/unify-terms.py && node tools/build-pack.mjs
   node tools/check-pack.mjs
   node tools/check-review.mjs
   python3 tools/check-consistency.py
   ```

`build-pack.mjs` prints how many strings are translated, kept, protected, missing and rejected. Missing and rejected keys go to `sources/missing-1.4.245.txt`.

The build needs Node.js 22 or newer and Python 3.11 or newer. It has no dependencies to install.

## Updating for a new Orca release

1. Copy the new English catalog into `sources/` and point `tools/build-pack.mjs` at it.
2. Update `tools/protected-keys.mjs` if Orca changed its protected list.
3. Add the new strings as a file in `tools/review/`.
4. Raise `engines.orca` and `version` in `orca-plugin.json`, then update `CHANGELOG.md`.

## Pull requests

Keep each pull request to one change, and commit `locales/vi.json` together with its sources so the catalog stays in step with the build. Commit messages are one short imperative line in English.
