import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

const output = '.lighthouse';
const url = 'http://127.0.0.1:8041';
const server = spawn(
  'python3',
  ['-m', 'http.server', '8041', '--bind', '127.0.0.1'],
  {
    stdio: ['ignore', 'ignore', 'inherit'],
  },
);

try {
  for (let attempt = 0; ; attempt++) {
    if (server.exitCode !== null)
      throw new Error('Lighthouse HTTP server failed to start');
    const ready = await fetch(url).then(
      (response) => response.ok,
      () => false,
    );
    if (ready) break;
    if (attempt === 40) throw new Error('Lighthouse HTTP server did not start');
    await setTimeout(250);
  }

  await mkdir(output, { recursive: true });
  for (const preset of ['mobile', 'desktop']) {
    const path = `${output}/${preset}.json`;
    const lighthouse = spawn(
      process.execPath,
      [
        'node_modules/lighthouse/cli/index.js',
        url,
        '--quiet',
        '--output=json',
        `--output-path=${path}`,
        '--chrome-flags=--headless --no-sandbox',
        ...(preset === 'desktop' ? ['--preset=desktop'] : []),
      ],
      {
        stdio: 'inherit',
        env: { ...process.env, CHROME_PATH: chromium.executablePath() },
      },
    );
    await new Promise((resolve, reject) => {
      lighthouse.once('error', reject);
      lighthouse.once('exit', (code) =>
        code === 0
          ? resolve(undefined)
          : reject(new Error(`Lighthouse exited with ${code}`)),
      );
    });
    const report = JSON.parse(await readFile(path, 'utf8'));
    for (const [name, minimum] of Object.entries({
      performance: 0.9,
      accessibility: 0.95,
      'best-practices': 0.95,
      seo: 0.95,
    })) {
      const score = Number(report.categories[name]?.score);
      console.log(
        `${preset} ${name}: ${Math.round(score * 100)} (minimum ${minimum * 100})`,
      );
      if (!Number.isFinite(score) || score < minimum) process.exitCode = 1;
    }
  }
} finally {
  server.kill();
}
