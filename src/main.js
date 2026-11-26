import { copyAddress } from './clipboard.js';
import {
  nextLanguage,
  nextTheme,
  readPreferences,
  savePreference,
} from './preferences.js';
import { translations } from './translations.js';

/** @typedef {keyof typeof translations.pt} Message */

const { documentElement } = document;
const provideStorage = () => window.localStorage;
const preferences = readPreferences(provideStorage);
const controls = document.getElementById('preferences');
const themeToggle = document.getElementById('theme-toggle');
const languageToggle = document.getElementById('lang-toggle');
const dialog = document.getElementById('emailModal');
const email = document.getElementById('emailButton');
const emailAddress = document.getElementById('emailAddress');
const close = document.getElementById('closeEmail');
const copy = document.getElementById('copyButton');
const status = document.getElementById('copyStatus');

/** @param {string | null} key */
function message(key) {
  const dictionary = translations[preferences.language];
  return key && Object.hasOwn(dictionary, key)
    ? dictionary[/** @type {Message} */ (key)]
    : null;
}

function applyLanguage() {
  documentElement.lang = preferences.language === 'pt' ? 'pt-BR' : 'en';
  document.title = translations[preferences.language].pageTitle;
  if (languageToggle) {
    const languageCode = preferences.language.toUpperCase();
    languageToggle.textContent = languageCode;
    languageToggle.setAttribute(
      'aria-label',
      `${languageCode} — ${translations[preferences.language].languageToggle}`,
    );
  }
  document
    .querySelectorAll('[data-lang], [data-label], [data-alt]')
    .forEach((element) => {
      const text = message(element.getAttribute('data-lang'));
      const label = message(element.getAttribute('data-label'));
      const alt = message(element.getAttribute('data-alt'));
      if (text) element.textContent = text;
      if (label) element.setAttribute('aria-label', label);
      if (alt) element.setAttribute('alt', alt);
    });
}

function applyTheme() {
  documentElement.dataset.theme = preferences.theme;
  themeToggle?.setAttribute(
    'aria-pressed',
    String(preferences.theme === 'light'),
  );
}

applyTheme();
applyLanguage();
if (controls) controls.hidden = false;
themeToggle?.addEventListener('click', () => {
  preferences.theme = nextTheme(preferences.theme);
  applyTheme();
  savePreference(provideStorage, 'theme', preferences.theme);
});
languageToggle?.addEventListener('click', () => {
  preferences.language = nextLanguage(preferences.language);
  applyLanguage();
  savePreference(provideStorage, 'language', preferences.language);
});

if (
  dialog instanceof HTMLDialogElement &&
  email &&
  emailAddress &&
  close &&
  copy &&
  status
) {
  let latestRequest = 0;
  email.setAttribute('aria-haspopup', 'dialog');
  email.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    latestRequest++;
    status.textContent = '';
    dialog.showModal();
    copy.focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => email.focus());
  copy.addEventListener('click', async () => {
    const request = ++latestRequest;
    const result = await copyAddress(
      navigator.clipboard,
      emailAddress.textContent.trim(),
    );
    if (dialog.open && request === latestRequest) {
      status.textContent = translations[preferences.language][result];
    }
  });
}

if (
  'IntersectionObserver' in window &&
  !matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.1 },
  );
  document
    .querySelectorAll('.fade-in-up')
    .forEach((element) => observer.observe(element));
}
