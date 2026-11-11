// Protected keys in Orca 1.4.256: a language pack may not replace these strings.
// Mirrors shared/plugins/artifacts/plugin-language-pack-artifact.js,
// shared/plugins/languages/plugin-protected-copy.js and
// shared/plugins/languages/plugin-translatable-chrome.js in the Orca install.
// tools/protected-copy-keys.json is a verbatim copy of
// shared/plugins/languages/protected-copy-keys.json from the same install.
// When Orca changes either list, update these files and rebuild.
import fs from 'node:fs'

const PROTECTED_ROOT = 'auto.components.settings.'
const PROTECTED_MODULE = /^plugin/i
const PLURAL_SUFFIX = /_(?:zero|one|two|few|many|other)$/

// Security surfaces, destructive confirmations and native message boxes.
// A key is protected when it, its plural base or any parent is listed.
const protectedCopy = JSON.parse(fs.readFileSync(new URL('./protected-copy-keys.json', import.meta.url), 'utf8'))
export const PROTECTED_COPY_KEYS = new Set(protectedCopy.keys)
export const PROTECTED_COPY_PREFIXES = protectedCopy.prefixes

// Exceptions Orca allows inside auto.components.settings.plugin*.
export const TRANSLATABLE_PLUGIN_CHROME = new Set([
  'auto.components.settings.PluginsSettingsSection.title',
  'auto.components.settings.PluginsSettingsSection.systemLabel',
  'auto.components.settings.PluginsSettingsSection.install',
  'auto.components.settings.PluginsSettingsSection.loading',
  'auto.components.settings.PluginsSettingsSection.empty',
  'auto.components.settings.PluginsSettingsSection.emptyTitle',
  'auto.components.settings.PluginsSettingsSection.noInstalledResults',
  'auto.components.settings.PluginsSettingsSection.noInstalledResultsTitle',
  'auto.components.settings.PluginMarketplaceBrowser.manageSources',
  'auto.components.settings.PluginMarketplaceBrowser.addSource',
  'auto.components.settings.PluginMarketplaceBrowser.refresh',
  'auto.components.settings.PluginMarketplaceBrowser.refreshing',
  'auto.components.settings.PluginMarketplaceBrowser.loading',
  'auto.components.settings.PluginMarketplaceBrowser.tryAgain',
  'auto.components.settings.PluginMarketplaceBrowser.clearSearch',
  'auto.components.settings.PluginMarketplaceBrowser.empty',
  'auto.components.settings.PluginMarketplaceBrowser.emptyTitle',
  'auto.components.settings.PluginMarketplaceBrowser.noInstalled',
  'auto.components.settings.PluginMarketplaceBrowser.noInstalledTitle',
  'auto.components.settings.PluginMarketplaceBrowser.noResults',
  'auto.components.settings.PluginMarketplaceBrowser.noResultsTitle',
  'auto.components.settings.PluginMarketplaceBrowser.noSourcesTitle',
  'auto.components.settings.PluginDevelopmentSection.title',
  'auto.components.settings.PluginDevelopmentSection.add',
  'auto.components.settings.PluginDevelopmentSection.remove',
  'auto.components.settings.PluginDevelopmentSection.pathLabel',
  'auto.components.settings.PluginDevelopmentSection.pathRequired',
  'auto.components.settings.PluginDevelopmentSection.placeholder',
  'auto.components.settings.plugins.search.title',
  'auto.components.settings.plugins.search.description',
  'auto.components.settings.plugins.search.install',
  'auto.components.settings.plugins.search.permissions',
  'auto.components.settings.plugins.search.logs',
  'auto.components.settings.plugins.search.development'
])

function isProtectedCopy(key) {
  if (PROTECTED_COPY_PREFIXES.some(prefix => key.startsWith(prefix))) return true
  for (let candidate = key; candidate;) {
    if (PROTECTED_COPY_KEYS.has(candidate) || PROTECTED_COPY_KEYS.has(candidate.replace(PLURAL_SUFFIX, ''))) return true
    const parent = candidate.lastIndexOf('.')
    candidate = parent === -1 ? '' : candidate.slice(0, parent)
  }
  return false
}

export function isProtectedKey(key) {
  if (isProtectedCopy(key)) return true
  if (!key.startsWith(PROTECTED_ROOT)) return false
  if (TRANSLATABLE_PLUGIN_CHROME.has(key)) return false
  return PROTECTED_MODULE.test(key.slice(PROTECTED_ROOT.length))
}
