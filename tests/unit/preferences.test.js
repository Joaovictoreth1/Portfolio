import { describe, expect, it, vi } from 'vitest';
import {
  nextLanguage,
  nextTheme,
  readPreferences,
  savePreference,
} from '../../src/preferences.js';

describe('portfolio preferences', () => {
  it.each([
    { stored: [null, null], expected: { theme: 'dark', language: 'pt' } },
    { stored: ['dark', 'pt'], expected: { theme: 'dark', language: 'pt' } },
    { stored: ['light', 'en'], expected: { theme: 'light', language: 'en' } },
    {
      stored: ['sepia', 'constructor'],
      expected: { theme: 'dark', language: 'pt' },
    },
  ])(
    'normalizes persisted values $stored',
    ({ stored: [theme, language], expected }) => {
      const getItem = vi.fn((/** @type {string} */ key) =>
        key === 'theme' ? theme : language,
      );
      expect(readPreferences(() => ({ getItem, setItem: vi.fn() }))).toEqual(
        expected,
      );
      expect(getItem.mock.calls).toEqual([['theme'], ['language']]);
    },
  );

  it('defaults when storage access throws', () => {
    expect(
      readPreferences(() => {
        throw new Error('blocked');
      }),
    ).toEqual({ theme: 'dark', language: 'pt' });
  });

  it('persists one preference at a time and tolerates a write failure', () => {
    const setItem = vi.fn().mockImplementationOnce(() => {
      throw new Error('quota');
    });
    const provider = () => ({ getItem: vi.fn(), setItem });
    expect(() => savePreference(provider, 'theme', 'light')).not.toThrow();
    savePreference(provider, 'language', 'en');
    expect(setItem.mock.calls).toEqual([
      ['theme', 'light'],
      ['language', 'en'],
    ]);
  });

  it('toggles each supported theme and language in both directions', () => {
    expect(nextTheme('dark')).toBe('light');
    expect(nextTheme('light')).toBe('dark');
    expect(nextLanguage('pt')).toBe('en');
    expect(nextLanguage('en')).toBe('pt');
  });
});
