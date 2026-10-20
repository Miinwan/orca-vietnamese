#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const en = JSON.parse(fs.readFileSync(path.join(root, 'sources/en-1.4.230.json')))
const catalogPath = path.join(root, 'locales/vi.json')
const raw = fs.readFileSync(catalogPath)
if (raw.byteLength > 5 * 1024 * 1024) throw new Error('Catalog is larger than 5 MB')
const vi = JSON.parse(raw.toString('utf8'))
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'orca-plugin.json')))

if (manifest.contributes?.languagePacks?.[0]?.locale !== 'vi' ||
    manifest.contributes.languagePacks[0].path !== 'locales/vi.json') {
  throw new Error('Manifest does not point to locales/vi.json')
}

let entries = 0
let translated = 0
const placeholder = /\{\{\s*[\w.]+\s*\}\}|\{[a-zA-Z][a-zA-Z0-9_]*\}/g
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
    if (/^auto\.components\.settings\.plugin/i.test(location)) {
      throw new Error(`Protected key: ${location}`)
    }
    const a = [...english.matchAll(placeholder)].map(x => x[0].replace(/\s+/g, '')).sort()
    const b = [...value.matchAll(placeholder)].map(x => x[0].replace(/\s+/g, '')).sort()
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`Sai placeholder: ${location}`)
    translated++
  }
}
walk(vi, en)
if (entries > 20000) throw new Error(`More than 20,000 entries: ${entries}`)
console.log(JSON.stringify({ translated, catalogEntries: entries, maxEntries: 20000 }, null, 2))
