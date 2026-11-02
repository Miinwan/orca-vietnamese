#!/usr/bin/env node
// Validate review files with the same rules as build-pack.mjs.
// Usage: node tools/check-review.mjs [tools/review/<name>.json ...]
// With no arguments, checks every file in tools/review and tools/overrides.json.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isProtectedKey } from './protected-keys.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const reviewDir = path.join(root, 'tools', 'review')
const files = process.argv.length > 2
  ? process.argv.slice(2)
  : [...fs.readdirSync(reviewDir).filter(name => name.endsWith('.json')).sort().map(name => path.join(reviewDir, name)),
     path.join(root, 'tools', 'overrides.json')]

function flatten(o, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(o)) {
    const name = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) flatten(value, name, out)
    else out[name] = value
  }
  return out
}

const en = flatten(JSON.parse(fs.readFileSync(path.join(root, 'sources', 'en-1.4.245.json'), 'utf8')))
const keepPath = path.join(root, 'tools', 'keep-english.json')
const keepEnglish = fs.existsSync(keepPath) ? JSON.parse(fs.readFileSync(keepPath, 'utf8')).keys ?? {} : {}
const ph = /\{\{\s*[\w.]+\s*\}\}|\{[a-zA-Z][a-zA-Z0-9_]*\}/g
const protectedToken = /`[^`]+`|https?:\/\/[^\s)]+|\/[a-z][\w-]*(?:\s|$)|<\/?[a-z][^>]*>/gi
const keepTerms = [
  /\bOrca\b/i, /\bClaude\b/i, /\bCodex\b/i, /\bGemini\b/i,
  /\bAntigravity\b/i, /\bGit\b/i, /\bSSH\b/i, /\bMCP\b/i,
  /\bworktrees?\b/i, /\bbranch(?:es)?\b/i, /\bcommits?\b/i,
  /\bterminals?\b/i, /\bupstream\b/i, /\bfork\b/i,
  /\brebase\b/i, /\borigin\b/i, /\bstag(?:e|ed|ing)\b/i,
  /\bcheckout\b/i
]
const sorted = (text, re) => [...text.matchAll(re)].map(x => x[0].replace(/\s+/g, '').trim()).sort().join('|')

let failed = false
for (const file of files) {
  const review = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'))
  const problems = []
  const warnings = { staleKeys: 0, protectedKeys: 0, keptEnglishKeys: 0 }
  let longLabels = 0
  for (const [key, text] of Object.entries(review)) {
    const original = en[key]
    const fail = reason => problems.push(`${key}: ${reason}`)
    // Keys Orca has removed do not affect the build, so they only warn
    if (typeof original !== 'string') { warnings.staleKeys++; continue }
    // build-pack skips protected and kept English keys, so they only warn
    if (isProtectedKey(key)) { warnings.protectedKeys++; continue }
    if (keepEnglish[key]?.en === original) { warnings.keptEnglishKeys++; continue }
    if (typeof text !== 'string' || !text.trim()) { fail('empty value'); continue }
    if (text !== text.normalize('NFC')) fail('not NFC normalized')
    const core = original.trim()
    if (text.trim() !== text) fail('leading or trailing whitespace (the build restores the original spacing)')
    if (sorted(core, ph) !== sorted(text, ph)) fail('sai placeholder')
    if (sorted(core, protectedToken) !== sorted(text, protectedToken)) fail('protected tokens differ (`...`, URL, /command, HTML tag)')
    if ((core.match(/\n/g)?.length ?? 0) !== (text.match(/\n/g)?.length ?? 0)) fail('line count differs')
    const lost = keepTerms.find(re => re.test(core) && !re.test(text))
    if (lost) fail(`missing kept term ${lost}`)
    // The unified file may restore a proper name so Orca shows the English text
    if (text === core && !file.endsWith('unified.json')) fail('same as the source, add the key to tools/keep-english.json with a reason')
    if (core.length <= 24 && text.length > Math.max(core.length * 1.4, core.length + 6)) longLabels++
  }
  console.log(JSON.stringify({ file: path.relative(root, path.resolve(file)), keys: Object.keys(review).length, errors: problems.length, longLabels, ...warnings }))
  for (const line of problems.slice(0, 50)) console.log('ERROR ' + line)
  if (problems.length) failed = true
}
process.exit(failed ? 1 : 0)
