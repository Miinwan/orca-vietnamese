#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isProtectedKey } from './protected-keys.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const en = JSON.parse(fs.readFileSync(path.join(root, 'sources/en-1.4.256.json')))
const catalogPath = path.join(root, 'locales/vi.json')
const raw = fs.readFileSync(catalogPath)
if (raw.byteLength > 5 * 1024 * 1024) throw new Error('Catalog is larger than 5 MB')
const vi = JSON.parse(raw.toString('utf8'))
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'orca-plugin.json')))

if (manifest.contributes?.languagePacks?.[0]?.locale !== 'vi' ||
    manifest.contributes.languagePacks[0].path !== 'locales/vi.json') {
  throw new Error('Manifest does not point to locales/vi.json')
}
const displayName = manifest.contributes.languagePacks[0].displayName
if (displayName !== undefined &&
    (typeof displayName !== 'string' || !displayName.trim() || displayName.trim().length > 80)) {
  throw new Error('displayName must be a string of 1 to 80 characters')
}

let entries = 0
let translated = 0
const placeholder = /\{\{\s*[\w.]+\s*\}\}|\{[a-zA-Z][\w.]*\}/g
// String rules from shared/plugins/languages/plugin-translation-string-policy.js in Orca 1.4.256
const forbidden = /[\x00-\x09\x0b-\x1f\x7f-\x9f\u2028\u2029\ufeff]|\p{Bidi_Control}/u
const lengthLimit = english => Math.min(8192, Math.max(64, 4 * english.length))
function walk(current, source, prefix = '', depth = 0) {
  if (depth > 16) throw new Error(`Too deep: ${prefix}`)
  for (const [key, value] of Object.entries(current)) {
    entries++
    if (!key || key.length > 128 || /[.\x00-\x1f]/.test(key) ||
        ['__proto__', 'prototype', 'constructor'].includes(key)) {
      throw new Error(`Invalid key: ${prefix}.${key}`)
    }
    const location = prefix ? `${prefix}.${key}` : key
    const english = source?.[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      walk(value, english, location, depth + 1)
      continue
    }
    if (typeof value !== 'string' || !value.trim() || value.length > 8192 ||
        typeof english !== 'string') throw new Error(`Invalid value: ${location}`)
    if (isProtectedKey(location)) {
      throw new Error(`Protected key: ${location}`)
    }
    if (forbidden.test(value)) throw new Error(`Control or bidi character: ${location}`)
    if (value.includes('\n') && !english.includes('\n')) throw new Error(`Adds a line break: ${location}`)
    if (value.length > lengthLimit(english)) throw new Error(`Longer than ${lengthLimit(english)} characters: ${location}`)
    const a = [...english.matchAll(placeholder)].map(x => x[0].replace(/\s+/g, '')).sort()
    const b = [...value.matchAll(placeholder)].map(x => x[0].replace(/\s+/g, '')).sort()
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`Sai placeholder: ${location}`)
    translated++
  }
}
walk(vi, en)
// Orca 1.4.256 allows at most 50,000 entries, nested nodes included
if (entries > 50000) throw new Error(`More than 50,000 entries: ${entries}`)
console.log(JSON.stringify({ translated, catalogEntries: entries, maxEntries: 50000, displayName: displayName ?? null }, null, 2))
