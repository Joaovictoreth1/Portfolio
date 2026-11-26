/** @typedef {'dark' | 'light'} Theme */
/** @typedef {'pt' | 'en'} Language */
/** @typedef {{ theme: Theme, language: Language }} Preferences */
/** @typedef {() => Pick<Storage, 'getItem' | 'setItem'>} StorageProvider */

/** @param {StorageProvider} provideStorage @returns {Preferences} */
export function readPreferences(provideStorage) {
  try {
    const storage = provideStorage();
    const theme = storage.getItem('theme');
    const language = storage.getItem('language');
    return {
      theme: theme === 'light' ? 'light' : 'dark',
      language: language === 'en' ? 'en' : 'pt',
    };
  } catch {
    return { theme: 'dark', language: 'pt' };
  }
}

/**
 * @template {keyof Preferences} K
 * @param {StorageProvider} provideStorage
 * @param {K} key
 * @param {Preferences[K]} value
 */
export function savePreference(provideStorage, key, value) {
  try {
    provideStorage().setItem(key, value);
  } catch {
    // The setting still applies for this visit.
  }
}

/** @param {Theme} theme @returns {Theme} */
export function nextTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}

/** @param {Language} language @returns {Language} */
export function nextLanguage(language) {
  return language === 'pt' ? 'en' : 'pt';
}
