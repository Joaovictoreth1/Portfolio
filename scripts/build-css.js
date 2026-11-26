import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  [
    'node_modules/tailwindcss/lib/cli.js',
    '-i',
    './src/styles.css',
    '-o',
    './assets/site.css',
    '--minify',
  ],
  {
    stdio: 'inherit',
    // Tailwind 3 bundles its own Browserslist data; a database refresh cannot change it.
    env: { ...process.env, BROWSERSLIST_IGNORE_OLD_DATA: '1' },
  },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
