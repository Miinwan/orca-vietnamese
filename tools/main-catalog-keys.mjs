#!/usr/bin/env node
// Write tools/main-catalog-keys.json: the keys of the English catalog that Orca's main
// process bundles (out/main/chunks/en-*.js). Orca offers a language pack only when it
// covers at least 80% of this catalog, so check-pack.mjs reports coverage against it.
// Usage: node tools/main-catalog-keys.mjs [path to Orca.app or its resources folder]
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = path.resolve(process.argv[2] || '/Applications/Orca.app')
const out = [path.join(app, 'Contents', 'Resources'), app]
  .map(dir => path.join(dir, 'app.asar.unpacked', 'out'))
  .find(dir => fs.existsSync(path.join(dir, 'main', 'chunks')))
if (!out) throw new Error(`No app.asar.unpacked/out/main/chunks under ${app}`)

const chunks = path.join(out, 'main', 'chunks')
const files = fs.readdirSync(chunks).filter(name => /^en-[\w-]+\.js$/.test(name))
if (files.length !== 1) throw new Error(`Expected one English chunk in ${chunks}, found ${files.length}`)
const loaded = createRequire(import.meta.url)(path.join(chunks, files[0]))
const catalog = loaded.default ?? loaded
const { version } = JSON.parse(fs.readFileSync(path.join(out, 'package.json'), 'utf8'))

const keys = []
function walk(node, prefix) {
  for (const [key, value] of Object.entries(node)) {
    const name = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object') walk(value, name)
    else if (typeof value === 'string') keys.push(name)
  }
}
walk(catalog, '')

const target = path.join(root, 'tools', 'main-catalog-keys.json')
const note = 'Keys of the English catalog in Orca\'s main process (out/main/chunks/en-*.js). ' +
  'Orca offers a language pack only when it covers at least 80% of these strings, protected keys excluded. ' +
  'Regenerate with node tools/main-catalog-keys.mjs for each Orca release.'
fs.writeFileSync(target, JSON.stringify({ _note: note, orca: version, keys }, null, 1) + '\n')
console.log(JSON.stringify({ orca: version, chunk: files[0], keys: keys.length }))
