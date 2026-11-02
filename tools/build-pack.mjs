#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isProtectedKey } from './protected-keys.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const enPath = path.join(root, 'sources', 'en-1.4.245.json')
const draftPath = process.argv[2] || path.join(root, 'sources', 'vi-draft.json')
const outPath = path.join(root, 'locales', 'vi.json')
const overridesPath = path.join(root, 'tools', 'overrides.json')
const keepPath = path.join(root, 'tools', 'keep-english.json')

function flatten(o, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(o)) {
    const name = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) flatten(value, name, out)
    else out[name] = value
  }
  return out
}

function setPath(o, key, value) {
  const parts = key.split('.')
  let cursor = o
  for (const part of parts.slice(0, -1)) cursor = cursor[part] ??= {}
  cursor[parts.at(-1)] = value
}

const en = flatten(JSON.parse(fs.readFileSync(enPath, 'utf8')))
const draft = flatten(JSON.parse(fs.readFileSync(draftPath, 'utf8')))
const reviewDir = path.join(root, 'tools', 'review')
// Load in file name order, later files win; *unified.json always loads last.
const reviewOrder = (a, b) => (a.endsWith('unified.json') - b.endsWith('unified.json')) || (a < b ? -1 : a > b ? 1 : 0)
const reviews = fs.existsSync(reviewDir)
  ? fs.readdirSync(reviewDir).filter(name => name.endsWith('.json')).sort(reviewOrder)
      .reduce((all, name) => Object.assign(all, JSON.parse(fs.readFileSync(path.join(reviewDir, name), 'utf8'))), {})
  : {}
const overrides = { ...reviews, ...JSON.parse(fs.readFileSync(overridesPath, 'utf8')) }
// Strings kept in English apply only while the English source still matches.
const keepEnglish = fs.existsSync(keepPath) ? JSON.parse(fs.readFileSync(keepPath, 'utf8')).keys ?? {} : {}

const exact = new Map(Object.entries({
  Settings: 'Cài đặt', Appearance: 'Giao diện', Language: 'Ngôn ngữ',
  Usage: 'Mức sử dụng', Agents: 'Agent', Agent: 'Agent',
  Projects: 'Dự án', Project: 'Dự án', Workspaces: 'Workspace',
  Workspace: 'Workspace', Tasks: 'Tác vụ', Task: 'Tác vụ',
  Automations: 'Tự động hóa', Plugins: 'Tiện ích', Plugin: 'Tiện ích',
  Install: 'Cài đặt', Uninstall: 'Gỡ cài đặt', Enable: 'Bật', Disable: 'Tắt',
  Add: 'Thêm', Remove: 'Xóa', Create: 'Tạo', Delete: 'Xóa',
  Open: 'Mở', Close: 'Đóng', Show: 'Hiện', Hide: 'Ẩn', Save: 'Lưu',
  Cancel: 'Hủy', Continue: 'Tiếp tục', Back: 'Quay lại', Retry: 'Thử lại',
  Refresh: 'Làm mới', Search: 'Tìm kiếm', Copy: 'Sao chép', Paste: 'Dán',
  Edit: 'Sửa', View: 'Xem', Update: 'Cập nhật', Error: 'Lỗi',
  Warning: 'Cảnh báo', Done: 'Hoàn tất', Permissions: 'Quyền truy cập',
  Accounts: 'Tài khoản', Account: 'Tài khoản', Provider: 'Nhà cung cấp',
  Files: 'Tệp', File: 'Tệp', Folder: 'Thư mục', Download: 'Tải xuống',
  Upload: 'Tải lên', Dashboard: 'Bảng tổng quan', Terminal: 'terminal',
  Branch: 'branch', Commit: 'commit', Worktree: 'worktree',
  'Install plugin': 'Cài tiện ích', 'Git URL': 'URL Git',
  'Local folder': 'Thư mục cục bộ', 'Check for Updates...': 'Kiểm tra cập nhật…',
  'Toggle Left Sidebar': 'Bật/tắt thanh bên trái',
  'Toggle Right Sidebar': 'Bật/tắt thanh bên phải',
  'Show Status Bar': 'Hiện thanh trạng thái',
  'Open GitHub tasks': 'Mở tác vụ GitHub',
  'Search worktrees and browser tabs': 'Tìm worktree và tab trình duyệt',
  Resume: 'Tiếp tục', Tokens: 'Token', Token: 'Token',
  Upstream: 'Upstream', 'No grace': 'Không gia hạn',
  'Run Now': 'Chạy ngay', Weekdays: 'Ngày trong tuần',
  'Not now': 'Để sau', Forward: 'Tiến', 'Skip tour': 'Bỏ qua hướng dẫn',
  'Any state': 'Mọi trạng thái', 'No users': 'Không có người dùng',
  'No dates': 'Chưa có ngày', Assignees: 'Người được giao',
  'No workspace': 'Chưa có workspace',
  Metrics: 'Số liệu', 'Show chats': 'Hiện cuộc trò chuyện',
  'Search runs…': 'Tìm lượt chạy…'
}))

function normalize(source, target) {
  if (exact.has(source)) return exact.get(source)
  let text = target.normalize('NFC').trim()
  const replacements = [
    [/chống trọng lực/gi, 'Antigravity', /Antigravity/i],
    [/cá voi sát thủ/gi, 'Orca', /Orca/i],
    [/cây (?:làm việc|công việc)|cây công tác/gi, 'worktree', /\bworktrees?\b|\bworking-tree\b/i],
    [/nhánh/gi, 'branch', /\bbranch(?:es)?\b/i],
    [/cam kết/gi, 'commit', /\b(?:un)?committed\b|\bcommitting\b|\bcommits?\b/i],
    [/thiết bị đầu cuối|đầu cuối/gi, 'terminal', /\bterminals?\b/i],
    [/đại lý/gi, 'Agent', /\bagents?\b/i],
    [/tác nhân/gi, 'Agent', /\bagents?\b/i],
    [/song tử/gi, 'Gemini', /Gemini/i],
    [/trình cắm/gi, 'tiện ích', /\bplugins?\b/i],
    [/sơ yếu lý lịch/gi, 'tiếp tục', /\bresume\b/i],
    [/mã thông báo/gi, 'token', /\btokens?\b/i],
    [/chuyến tham quan/gi, 'hướng dẫn', /\btour\b/i],
    [/tiểu bang/gi, 'trạng thái', /\bstates?\b/i],
    [/sự duyên dáng/gi, 'thời gian gia hạn', /\bgrace\b/i],
    [/trình đại lý phụ|các? (?:đại lý|tác nhân) phụ|(?:đại lý|tác nhân) phụ/gi, 'Agent phụ', /\bsubagents?\b/i],
    [/thanh toán/gi, 'checkout', /\bcheckout\b/i],
    [/yêu cầu kéo/gi, 'Pull Request', /\bpull requests?\b/i],
    [/yêu cầu kéo hoặc (?:yêu cầu )?hợp nhất/gi, 'Pull Request hoặc Merge Request', /\bpull or merge requests?\b/i],
    [/yêu cầu hợp nhất/gi, 'Merge Request', /\bmerge requests?\b/i],
    [/kho lưu trữ/gi, 'kho mã', /\brepo(?:s|sitory|sitories)?\b/i],
    [/\bplugins?\b/gi, 'tiện ích', /\bplugins?\b/i],
    [/(?:các )?đường ống/gi, 'pipeline', /\bpipelines?\b/i],
    [/(?:các )?vấn đề/gi, 'issue', /\bissues?\b/i],
    [/(?:các )?không gian làm việc/gi, 'workspace', /\bworkspaces?\b/i]
  ]
  for (const [pattern, replacement, sourcePattern] of replacements) {
    if (sourcePattern.test(source)) text = text.replace(pattern, replacement)
  }
  for (const name of ['Orca', 'Claude', 'Codex', 'Gemini', 'Antigravity', 'Git', 'SSH', 'MCP']) {
    if (new RegExp(`\\b${name}\\b`, 'i').test(source)) {
      text = text.replace(new RegExp(`\\b${name}\\b`, 'gi'), name)
    }
  }
  if (/\bagy\b/i.test(source)) text = text.replace(/\bagy\b/gi, 'agy')
  if (/^[a-zà-ỹ]/u.test(text) && /^[A-Z]/.test(source)) {
    text = text[0].toLocaleUpperCase('vi') + text.slice(1)
  }
  return text
}

const ph = /\{\{\s*[\w.]+\s*\}\}|\{[a-zA-Z][a-zA-Z0-9_]*\}/g
const protectedToken = /`[^`]+`|https?:\/\/[^\s)]+|\/[a-z][\w-]*(?:\s|$)|<\/?[a-z][^>]*>/gi
function tokens(text) { return [...text.matchAll(protectedToken)].map(x => x[0].trim()).sort() }
const keepTerms = [
  /\bOrca\b/i, /\bClaude\b/i, /\bCodex\b/i, /\bGemini\b/i,
  /\bAntigravity\b/i, /\bGit\b/i, /\bSSH\b/i, /\bMCP\b/i,
  /\bworktrees?\b/i, /\bbranch(?:es)?\b/i, /\bcommits?\b/i,
  /\bterminals?\b/i, /\bupstream\b/i, /\bfork\b/i,
  /\brebase\b/i, /\borigin\b/i, /\bstag(?:e|ed|ing)\b/i,
  /\bcheckout\b/i
]
function lostTerm(source, target) {
  return keepTerms.some(pattern => pattern.test(source) && !pattern.test(target))
}
const entries = {}
const stats = { total: Object.values(en).filter(v => typeof v === 'string').length, protected: 0, eligible: 0, translated: 0, keptEnglish: 0, keepStale: 0, unchanged: 0, missing: 0, invalid: 0 }
const missing = []
for (const [key, original] of Object.entries(en)) {
  if (typeof original !== 'string') continue
  if (isProtectedKey(key) || original.length > 8192) { stats.protected++; continue }
  stats.eligible++
  const keep = keepEnglish[key]
  if (keep && keep.en === original) { stats.keptEnglish++; continue }
  if (keep) stats.keepStale++
  const leading = original.match(/^\s*/u)?.[0] ?? ''
  const trailing = original.match(/\s*$/u)?.[0] ?? ''
  const sourceCore = original.slice(leading.length, original.length - trailing.length)
  const candidate = overrides[key] ?? draft[key]
  if (typeof candidate !== 'string' || !candidate.trim()) { stats.missing++; missing.push(key); continue }
  const translatedCore = (overrides[key] ?? normalize(sourceCore, candidate)).trim()
  const text = leading + translatedCore + trailing
  const expected = [...original.matchAll(ph)].map(x => x[0].replace(/\s+/g, '')).sort()
  const actual = [...text.matchAll(ph)].map(x => x[0].replace(/\s+/g, '')).sort()
  if (JSON.stringify(expected) !== JSON.stringify(actual) ||
      JSON.stringify(tokens(original)) !== JSON.stringify(tokens(text)) ||
      (original.match(/\n/g)?.length ?? 0) !== (text.match(/\n/g)?.length ?? 0) ||
      lostTerm(original, text) || text.length > 8192) {
    stats.invalid++; missing.push(key); continue
  }
  if (text === original) {
    stats.unchanged++; missing.push(key); continue
  }
  entries[key] = text
  stats.translated++
}

const nested = {}
for (const [key, value] of Object.entries(entries)) setPath(nested, key, value)
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(nested, null, 2) + '\n')
fs.writeFileSync(path.join(root, 'sources', 'missing-1.4.245.txt'), missing.join('\n') + '\n')
const pct = (a, b) => (a / b * 100).toFixed(2) + '%'
console.log(JSON.stringify({
  ...stats,
  coverage: pct(stats.translated, stats.total),
  translatedOfEligible: pct(stats.translated, stats.eligible),
  doneOfEligible: pct(stats.translated + stats.keptEnglish, stats.eligible)
}, null, 2))
