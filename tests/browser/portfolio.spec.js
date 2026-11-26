import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('persists theme and language across reloads', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Alternar tema claro' }).click();
  await page.getByRole('button', { name: 'Mudar para inglês' }).click();
  await expect(page.getByRole('heading', { name: 'My Skills' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('button', { name: 'Toggle light theme' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page).toHaveTitle('João Victor Barros das Merces | Portfolio');
  await page.getByRole('button', { name: 'Switch to Portuguese' }).click();
  await page.getByRole('button', { name: 'Alternar tema claro' }).click();
  await expect(
    page.getByRole('heading', { name: 'Minhas Habilidades' }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('renders when storage throws', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('blocked');
      },
    });
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Minhas Habilidades' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Mudar para inglês' }).click();
  await expect(page.getByRole('heading', { name: 'My Skills' })).toBeVisible();
});

test('copies the address with keyboard access and restores focus after Escape', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const email = page.getByRole('link', { name: 'Email', exact: true });
  await email.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Meu endereço de email:' });
  await expect(dialog).toBeVisible();
  const address = await dialog.getByRole('link').innerText();
  await expect(dialog.getByRole('button', { name: 'Copiar' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog.getByRole('status')).toHaveText('Email copiado!');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    address,
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(email).toBeFocused();
});

test('gives localized fallback feedback if clipboard permission is denied', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: () =>
          Promise.reject(new DOMException('denied', 'NotAllowedError')),
      },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Mudar para inglês' }).click();
  await page.getByRole('link', { name: 'Email', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'My email address:' });
  await dialog.getByRole('button', { name: 'Copy' }).click();
  await expect(dialog.getByRole('status')).toHaveText(
    'Could not copy. Select the address to copy it manually.',
  );
  await expect(dialog.getByRole('link')).toHaveAttribute('href', /^mailto:/);
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toBeHidden();
});

for (const theme of ['dark', 'light']) {
  test(`has no WCAG A/AA axe violations in ${theme} theme or its contact dialog`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    if (theme === 'light')
      await page.getByRole('button', { name: 'Alternar tema claro' }).click();
    const scan = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
    expect((await scan()).violations).toEqual([]);
    await page.getByRole('link', { name: 'Email', exact: true }).click();
    expect((await scan()).violations).toEqual([]);
  });
}

test('renders without JavaScript at mobile width', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto(new URL('/', baseURL).href);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Email', exact: true }),
    ).toHaveAttribute('href', /^mailto:/);
    await expect(page.locator('#preferences')).toBeHidden();
    await expect(page.locator('#skills li')).toHaveCount(5);
    await expect(
      page.getByRole('heading', { name: 'Java', exact: true }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});

test('loads only local resources under CSP and honors reduced motion on a short mobile screen', async ({
  page,
}) => {
  const errors = /** @type {string[]} */ ([]);
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  const requests = /** @type {string[]} */ ([]);
  page.on('request', (request) => requests.push(request.url()));
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const email = page.getByRole('link', { name: 'Email', exact: true });
  await email.scrollIntoViewIfNeeded();
  await expect(email).toBeInViewport();
  await expect(page.locator('.hero-background')).toHaveCSS(
    'background-image',
    /hero-still\.webp/,
  );
  await expect(page.locator('h1')).toHaveCSS('animation-name', 'none');
  expect(
    requests.every((url) => new URL(url).origin === new URL(page.url()).origin),
  ).toBe(true);
  expect(errors).toEqual([]);
});
