import { test, expect } from '@playwright/test';

const token = `header.${Buffer.from(JSON.stringify({ exp: 4102444800 })).toString('base64url')}.signature`;
const user = { id: 7, name: 'Sample Member', email: 'member@example.com', is_admin: false };
const plans = [{ id: 1, name: 'Starter', price: '29', currency: 'EUR', is_active: true, features: [] }, { id: 2, name: 'Complete', price: '97', currency: 'EUR', is_active: true, features: [{ name: 'Live classes', is_included: true }] }];
const dashboard = { firstname: 'Sample', lastname: 'Member', email: user.email, user_meta: { display_name: 'Sample Member' }, has_active_plan: true, subscriptions: [{ id: 1, plan_id: 2, plan_name: 'Complete', price: 97, currency: 'EUR', status: 'active', payment_status: 'paid', starts_at: '2020-01-01', ends_at: '2099-01-01', payment_reference: 'test-payment', billing_frequency: 'monthly' }], payments: [{ payment_id: 'test-payment', price: 97, status: 'paid', date: '2026-01-01' }], country: 'DE', address: 'Example Street 1', city: 'Berlin', postal_code: '10115', phone: '+4915123456789' };
const session = { id: 1, name: 'Live strength session', class_date: '2020-01-01T10:00:00Z', end_date: '2099-01-01T11:00:00Z', end_time: '11:00', timezone: 'UTC', is_active: true, plan_ids: [2], url: 'https://example.com/meeting' };

async function signIn(page, admin = false, expired = false) {
  await page.addInitScript(({ user, token, admin, expired }) => {
    if (sessionStorage.getItem('fixture-initialized')) return;
    sessionStorage.setItem('fixture-initialized', 'true');
    localStorage.setItem('trainwellacademy_token', expired ? 'invalid-token' : token);
    localStorage.setItem('trainwellacademy_user', JSON.stringify({ ...user, is_admin: admin }));
  }, { user, token, admin, expired });
}

async function api(page, options = {}) {
  const calls = [];
  await page.route('**/trainwellacademy-api/**', async route => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    const path = new URL(request.url()).pathname.split('/trainwellacademy-api')[1];
    const body = request.postDataJSON(); calls.push({ path, body, method: request.method(), authorization: request.headers().authorization });
    let data, status = 200, message = 'Success';
    if (options.fail === path) { status = options.status || 500; message = options.message || 'Test API failure'; }
    else if (path === '/plans') data = options.emptyPlans ? [] : plans;
    else if (path === '/auth/login' || path === '/auth/signup') data = { token, user: { ...user, is_admin: !!options.admin } };
    else if (path === '/user/dashboard') data = { ...dashboard, ...options.dashboard };
    else if (path === '/user/profile' || path === '/auth/change-password') data = null;
    else if (path === '/library') data = options.emptyLibrary ? [] : [{ title: 'Strength', cards: [{ title: 'Foundations resource', image: '/assets/sepa.webp', link: 'https://example.com/resource.pdf' }] }];
    else if (path === '/classes' && request.method() === 'GET') data = options.emptyClasses ? [] : [session];
    else if (path.startsWith('/classes/') && path.endsWith('/join')) data = { join_path: '/classes/1/join/test-token', expires_in: 60 };
    else if (path.startsWith('/classes')) data = { ...session, ...body };
    else if (path === '/subscriptions/validate-iban') data = { valid: !options.invalidIban, message: 'Invalid IBAN' };
    else if (path === '/subscriptions/create-payment-session') data = { sessionToken: 'ps_test' };
    else if (path === '/subscriptions/submit-payment') data = { sessionToken: 'ps_test', status: 'PENDING', subscriptionActive: false };
    else if (path === '/subscriptions/verify-payment') data = options.payment || { status: 'COMPLETED', subscriptionActive: true };
    else if (path === '/subscriptions/unsubscribe') { data = { status: 'cancelled' }; message = 'Cancellation request received'; }
    else { status = 404; message = `Unexpected fixture request: ${path}`; }
    await route.fulfill({ status, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: JSON.stringify({ success: status < 400, message, data }) });
  });
  return calls;
}

async function fillCheckout(page) {
  const fields = { email: user.email, firstName: 'Sample', lastName: 'Member', phone: '+4915123456789', street: 'Example Street 1', city: 'Berlin', postcode: '10115', ibanHolder: 'Sample Member', iban: 'DE89 3704 0044 0532 0130 00' };
  await page.locator('select[name="country"]').selectOption('DE');
  for (const [name, value] of Object.entries(fields)) {
    const field = page.locator(`[name="${name}"]`);
    if (!await field.getAttribute('readonly') && !await field.evaluate(node => node.readOnly)) await field.fill(value);
  }
  if (await page.locator('[name="password"]').count()) {
    await page.locator('[name="password"]').fill('StrongPassword123');
    await page.locator('[name="confirmPassword"]').fill('StrongPassword123');
  }
  await page.locator('input[type="checkbox"]').check();
}

test('public routes hydrate, assets load and unknown routes return 404', async ({ page, request }) => {
  await api(page);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/', '/pricing/', '/imprint/', '/privacy-policy/', '/terms-conditions/', '/unsubscribe/']) {
    const response = await page.goto(path); expect(response.status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  }
  expect(errors).toEqual([]);
  const missing = await request.get('/missing-page'); expect(missing.status()).toBe(404);
  expect((await request.get('/assets/missing.js')).status()).toBe(404);
  expect((await request.get('/trainwellacademy-api/missing')).status()).toBe(404);
  expect((await request.get('/assets/sepa.webp')).status()).toBe(200);
  expect((await request.get('/')).headers()['x-content-type-options']).toBe('nosniff');
  expect(await (await request.get('/profile/')).text()).toContain('<div id="root"></div>');
});

test('guest and expired sessions are redirected without private content', async ({ page }) => {
  await api(page);
  await page.goto('/library/'); await expect(page).toHaveURL(/\/pricing\//);
  await page.goto('/profile/'); await expect(page).toHaveURL(/\/login\//);
  await signIn(page, false, true);
  await page.goto('/library/'); await expect(page).toHaveURL(/\/pricing\//);
  expect(await page.evaluate(() => localStorage.getItem('trainwellacademy_token'))).toBeNull();
});

test('inactive membership and dashboard failures do not grant library access', async ({ page }) => {
  await signIn(page);
  const state = { dashboard: { has_active_plan: false } }; await api(page, state);
  await page.goto('/library/'); await expect(page).toHaveURL(/\/pricing\//);
  state.fail = '/user/dashboard';
  await page.goto('/library/'); await expect(page.getByRole('alert')).toContainText('Test API failure');
  expect(page.url()).toContain('/library/');
  state.status = 401;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page).toHaveURL(/\/pricing\//);
});

test('login errors, successful login and signup password validation', async ({ page }) => {
  const state = { fail: '/auth/login', status: 401, message: 'Invalid credentials' }; const calls = await api(page, state);
  await page.goto('/signup/');
  for (const [name, value] of Object.entries({ firstName: 'Sample', lastName: 'Member', email: user.email, password: 'StrongPassword123', confirmPassword: 'DifferentPassword123' })) await page.locator(`[name="${name}"]`).fill(value);
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByRole('alert')).toContainText('Passwords do not match');
  expect(calls.filter(call => call.path === '/auth/signup')).toHaveLength(0);
  await page.goto('/login/');
  await page.locator('[name="email"]').fill(user.email); await page.locator('[name="password"]').fill('StrongPassword123');
  await page.locator('form button[type="submit"]').click(); await expect(page.getByRole('alert')).toContainText('Invalid credentials');
  state.fail = null; await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/library\//); await expect(page.getByText('Foundations resource')).toBeVisible();
});

test('profile retains original panels while saving details, passwords and logging out', async ({ page }) => {
  await signIn(page); const calls = await api(page);
  await page.goto('/profile/'); await expect(page.locator('[name="firstName"]')).toHaveValue('Sample');
  await page.locator('[name="displayName"]').fill('Updated Member');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved successfully');
  expect(calls.find(call => call.path === '/user/profile').body.display_name).toBe('Updated Member');
  await expect(page.getByRole('heading', { name: 'Updated Member' })).toBeVisible();
  await page.getByRole('button', { name: 'Payments', exact: true }).click(); await expect(page.locator('tbody')).toContainText('test-payment');
  await page.getByRole('button', { name: 'My subscriptions', exact: true }).click(); await expect(page.locator('dl')).toContainText('€97.00');
  await page.getByRole('button', { name: 'Change Password', exact: true }).click();
  await page.locator('[name="current"]').fill('OldPassword123'); await page.locator('[name="next"]').fill('NewPassword123'); await page.locator('[name="confirm"]').fill('Different123');
  await page.getByRole('button', { name: 'Update Password', exact: true }).click(); await expect(page.getByRole('status')).toContainText('Passwords do not match');
  await page.locator('[name="confirm"]').fill('NewPassword123'); await page.getByRole('button', { name: 'Update Password', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Password updated successfully');
  await page.getByRole('link', { name: 'Log Out', exact: true }).click(); await expect(page).toHaveURL(/\/login\/?$/);
  expect(await page.evaluate(() => localStorage.getItem('trainwellacademy_token'))).toBeNull();
});

test('selected plan price and guest checkout use the API sequence', async ({ page }) => {
  const calls = await api(page);
  await page.goto('/pricing/'); await page.getByRole('button', { name: 'CHOOSE COMPLETE' }).click();
  await expect(page.locator('aside')).toContainText('€97.00');
  await fillCheckout(page); await page.getByRole('button', { name: 'COMPLETE YOUR ORDER NOW' }).click();
  await expect(page).toHaveURL(/\/profile\//);
  const create = calls.find(call => call.path === '/subscriptions/create-payment-session');
  expect(create.body.plan_id).toBe(2); expect(create.body.amount).toBe(97); expect(create.authorization).toBe(`Bearer ${token}`);
  expect(calls.find(call => call.path === '/subscriptions/submit-payment').body.iban).toBe('DE89370400440532013000');
  expect(calls.filter(call => call.path === '/auth/signup')).toHaveLength(1);
});

test('pending payment survives refresh and retries verification without resubmitting', async ({ page }) => {
  await signIn(page);
  const state = { payment: { status: 'PENDING', subscriptionActive: false } }; const calls = await api(page, state);
  await page.goto('/checkout/'); await fillCheckout(page);
  await page.getByRole('button', { name: 'COMPLETE YOUR ORDER NOW' }).click();
  await expect(page.getByRole('status')).toContainText('Your payment is pending');
  await page.reload(); await expect(page.getByRole('button', { name: 'CHECK PAYMENT STATUS' })).toBeEnabled();
  state.payment = { status: 'COMPLETED', subscriptionActive: true };
  await page.getByRole('button', { name: 'CHECK PAYMENT STATUS' }).click(); await expect(page).toHaveURL(/\/profile\//);
  expect(calls.filter(call => call.path === '/subscriptions/submit-payment')).toHaveLength(1);
  expect(calls.filter(call => call.path === '/subscriptions/create-payment-session')).toHaveLength(1);
});

test('invalid IBAN and API failures cannot complete an order', async ({ page }) => {
  const state = { invalidIban: true }; const calls = await api(page, state);
  await page.goto('/checkout/'); await fillCheckout(page);
  await page.getByRole('button', { name: 'COMPLETE YOUR ORDER NOW' }).click(); await expect(page.getByRole('alert')).toContainText('Invalid IBAN');
  expect(calls.filter(call => call.path === '/auth/signup')).toHaveLength(0);
  state.invalidIban = false; state.fail = '/subscriptions/create-payment-session';
  await page.getByRole('button', { name: 'COMPLETE YOUR ORDER NOW' }).click(); await expect(page.getByRole('alert')).toContainText('Test API failure');
  expect(calls.filter(call => call.path === '/subscriptions/submit-payment')).toHaveLength(0);
});

test('library cards and live classes retain links and eligibility errors', async ({ page }) => {
  await signIn(page); const state = {}; await api(page, state);
  await page.goto('/library/'); await expect(page.getByRole('link', { name: 'OPEN RESOURCE' })).toHaveAttribute('href', 'https://example.com/resource.pdf');
  await page.getByRole('button', { name: 'LIVE CLASSES', exact: true }).click();
  await expect(page.getByRole('heading', { name: session.name })).toBeVisible();
  await page.getByRole('button', { name: 'Join class', exact: true }).click(); await expect(page.getByRole('link', { name: 'Open live class' })).toHaveAttribute('href', /\/classes\/1\/join\/test-token$/);
  state.fail = '/classes/1/join'; state.status = 403;
  await page.getByRole('button', { name: 'Join class', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('Test API failure');
  expect(await page.evaluate(() => localStorage.getItem('trainwellacademy_token'))).toBeTruthy();
});

test('admin redirects, class date validation, create and edit', async ({ page }) => {
  await signIn(page, true); const calls = await api(page);
  await page.goto('/pricing/'); await expect(page).toHaveURL(/\/live-classes\//);
  await page.locator('[name="name"]').fill('New class'); await page.locator('[name="url"]').fill('https://example.com/new-class');
  await page.locator('[name="class_date"]').fill('2030-01-01T12:00'); await page.locator('[name="end_date"]').fill('2030-01-01T11:00');
  await page.locator('[name="plan_ids"][value="2"]').check();
  await page.getByRole('button', { name: 'Save class', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('End must be after start');
  await page.locator('[name="end_date"]').fill('2030-01-01T13:00'); await page.getByRole('button', { name: 'Save class', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Class saved successfully');
  expect(calls.find(call => call.path === '/classes' && call.method === 'POST').body.plan_ids).toEqual([2]);
  await page.getByRole('button', { name: 'Edit', exact: true }).click(); await expect(page.locator('[name="name"]')).toHaveValue(session.name);
  await page.getByRole('button', { name: 'Save class', exact: true }).click(); await expect(page.getByRole('status')).toContainText('Class saved successfully');
  expect(calls.some(call => call.path === '/classes/1' && call.method === 'PUT')).toBe(true);
});

test('unsubscribe sends only requested bank suffix and displays backend result', async ({ page }) => {
  const calls = await api(page); await page.goto('/unsubscribe/');
  for (const [name, value] of Object.entries({ firstName: 'Sample', lastName: 'Member', email: user.email, iban: '13000' })) await page.locator(`[name="${name}"]`).fill(value);
  await page.locator('input[type="checkbox"]').check();
  await page.locator('form button[type="submit"]').click(); await expect(page.getByText('Cancellation request received')).toBeVisible();
  expect(calls.find(call => call.path === '/subscriptions/unsubscribe').body).toEqual({ first_name: 'Sample', last_name: 'Member', email: user.email, iban_last_5: '13000', is_unsubscribe: true });
});
