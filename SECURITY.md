# Security Policy

## Threat model

This pack is data. `orca-plugin.json` declares no capabilities and `locales/vi.json` holds only strings. It runs no code inside Orca, and the scripts in `tools/` run only when you build the pack yourself.

A language pack can still mislead a reader through its text, for example a confirmation that says something other than what the button does. Orca protects its plugin install dialog and trust prompts from language packs for this reason.

## Supported versions

Fixes are applied to the latest release.

## Reporting a vulnerability

Please do **not** open a public issue. Use [GitHub Private Vulnerability Reporting](https://github.com/Miinwan/orca-vietnamese/security/advisories/new) and include the affected string keys and steps to reproduce.
