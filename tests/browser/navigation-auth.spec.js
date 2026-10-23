import { test, expect } from '@playwright/test';

const jwt = exp => `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;

async function seedSession(page, token) {
  await page.addInitScript(token => {
    localStorage.setItem('trainwellacademy_token', token);
    localStorage.setItem('trainwellacademy_user', JSON.stringify({ id: 7, email: 'member@example.com' }));
  }, token);
}

async function mockApi(page, { status = 200, html = false, active = true } = {}) {
  await page.route('**/trainwellacademy-api/**', route => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } });
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith('/plans') || path.endsWith('/library') ? [] : { has_active_plan: active };
    return route.fulfill({ status, headers: { 'access-control-allow-origin': '*' }, contentType: html ? 'text/html' : 'application/json', body: html ? '<h1>Unauthorized</h1>' : JSON.stringify({ success: status < 400, message: 'Session rejected', data }) });
  });
}

test('internal links navigate without reload and support history and hash scrolling', async ({ page }) => {
  await mockApi(page);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('header nav')).toBeAttached();
  await page.evaluate(() => { window.navigationMarker = 'same-document'; });
  await page.locator('footer').getByRole('link', { name: 'Privacy Policy', exact: true }).click();
  await expect(page).toHaveURL(/\/privacy\//);
  expect(await page.evaluate(() => window.navigationMarker)).toBe('same-document');
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('link', { name: 'EXPLORE COURSES' }).click();
  await expect(page).toHaveURL(/#courses$/);
  await expect(page.locator('#courses')).toBeInViewport();
  expect(errors).toEqual([]);
});

test('guest library and malformed or expired tokens redirect to login', async ({ page }) => {
  await mockApi(page);
  await page.goto('/library/');
  await expect(page).toHaveURL(/\/login\//);
  for (const token of ['invalid-token', jwt(1)]) {
    await page.evaluate(token => localStorage.setItem('trainwellacademy_token', token), token);
    await page.goto('/library/');
    await expect(page).toHaveURL(/\/login\//);
    expect(await page.evaluate(() => localStorage.getItem('trainwellacademy_token'))).toBeNull();
  }
});

for (const html of [false, true]) {
  test(`server-rejected token redirects to login (${html ? 'HTML' : 'JSON'} 401)`, async ({ page }) => {
    await seedSession(page, jwt(4102444800));
    await mockApi(page, { status: 401, html });
    await page.goto('/library/');
    await expect(page).toHaveURL(/\/login\//);
    expect(await page.evaluate(() => localStorage.getItem('trainwellacademy_token'))).toBeNull();
  });
}

test('token expiry redirects an open page without another API request', async ({ page }) => {
  await page.clock.install();
  const now = Date.now();
  await seedSession(page, jwt(Math.floor(now / 1000) + 60));
  await mockApi(page);
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Open profile' })).toBeVisible();
  await page.clock.fastForward(61000);
  await expect(page).toHaveURL(/\/login\//);
});

test('valid long-lived token stays logged in and inactive membership goes to pricing', async ({ page }) => {
  await seedSession(page, jwt(4102444800));
  await mockApi(page, { active: false });
  await page.goto('/library/');
  await expect(page).toHaveURL(/\/pricing\//);
  await expect(page.getByRole('link', { name: 'Open profile' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('trainwellacademy_token'))).toBeTruthy();
});
