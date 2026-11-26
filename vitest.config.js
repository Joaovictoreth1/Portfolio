import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/preferences.js', 'src/clipboard.js'],
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 90,
        perFile: true,
      },
    },
  },
});
