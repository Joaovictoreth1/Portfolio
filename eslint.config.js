import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  globalIgnores([
    'coverage/',
    'test-results/',
    'playwright-report/',
    '.lighthouse/',
  ]),
  js.configs.recommended,
  { files: ['**/*.js'], languageOptions: { globals: globals.node } },
  {
    files: ['src/**/*.js', 'tests/browser/*.js'],
    languageOptions: { globals: globals.browser },
  },
]);
