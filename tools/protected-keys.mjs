// Protected keys in Orca 1.4.245: a language pack may not replace these strings.
// Copied from shared/plugins/artifacts/plugin-language-pack-artifact.js and
// shared/plugins/languages/plugin-translatable-chrome.js in the Orca install.
// When Orca changes the list, update this file and rebuild.

const PROTECTED_ROOT = 'auto.components.settings.'
const PROTECTED_MODULE = /^plugin/i

// Trust confirmation strings live outside settings, so the whole component is protected.
export const PROTECTED_COMPONENTS = [
  'auto.components.pluginCatalog.PluginListRow.official',
  'auto.components.editor.PluginFileTypeSuggestion',
  'components.native-chat.approval',
  'auto.components.sidebar.OrcaYamlTrustDialog',
  'auto.components.editor.IpynbViewer',
  'browser.loadFailure',
  'auto.components.browserPane.sitePermission',
  'settings.browser.sitePermissions'
]

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

export function isProtectedKey(key) {
  if (PROTECTED_COMPONENTS.some(component => key === component || key.startsWith(`${component}.`))) return true
  if (!key.startsWith(PROTECTED_ROOT)) return false
  if (TRANSLATABLE_PLUGIN_CHROME.has(key)) return false
  return PROTECTED_MODULE.test(key.slice(PROTECTED_ROOT.length))
}
