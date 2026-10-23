import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from '../src/services/api.js';
import { consumeLoginRedirect, getToken } from '../src/services/auth.js';
const values = new Map();
globalThis.localStorage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
globalThis.sessionStorage = { removeItem: () => {} };
globalThis.document = { cookie: '' };
globalThis.window = { dispatchEvent: () => {} };
const token = `header.${Buffer.from(JSON.stringify({ exp: 4102444800 })).toString('base64url')}.signature`;
test('401 clears expired server sessions; membership 403 preserves login', async () => {
  const original = globalThis.fetch;
  try {
    for (const status of [403, 401]) {
      values.set('trainwellacademy_token', token);
      globalThis.fetch = async () => ({ ok: false, status, json: async () => ({ success: false, message: 'Access denied' }) });
      await assert.rejects(request('/library'), /Access denied/);
      assert.equal(values.has('trainwellacademy_token'), status === 403);
    }
  } finally { globalThis.fetch = original; }
});
test('transport rejects HTML and malformed success envelopes', async () => {
  const original = globalThis.fetch;
  try {
    for (const result of [null, {}, { success: true }]) {
      globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => result });
      await assert.rejects(request('/plans', { auth: false }), /invalid response/);
    }
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => { throw new Error('HTML'); } });
    await assert.rejects(request('/plans', { auth: false }), /invalid response/);
  } finally { globalThis.fetch = original; }
});

test('expired and malformed tokens clear the session and request a login redirect', () => {
  const jwt = payload => `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;
  for (const invalid of ['invalid-token', jwt({ exp: 1 }), jwt({ exp: 'invalid' }), jwt({ exp: '4102444800' }), jwt({})]) {
    values.set('trainwellacademy_token', invalid);
    values.set('trainwellacademy_user', '{}');
    assert.equal(getToken(), null);
    assert.equal(values.has('trainwellacademy_token'), false);
    assert.equal(values.has('trainwellacademy_user'), false);
    assert.equal(consumeLoginRedirect(), true);
    assert.equal(consumeLoginRedirect(), false);
  }
});

test('non-JSON 401 and password endpoint 401 invalidate the session', async () => {
  const original = globalThis.fetch;
  try {
    for (const path of ['/library', '/auth/change-password']) {
      values.set('trainwellacademy_token', token);
      consumeLoginRedirect();
      globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => { throw new Error('HTML'); } });
      await assert.rejects(request(path, { cache: false }), error => error.status === 401);
      assert.equal(values.has('trainwellacademy_token'), false);
      assert.equal(consumeLoginRedirect(), true);
    }
  } finally { globalThis.fetch = original; }
});

test('a late 401 for an old token preserves the newer session', async () => {
  const original = globalThis.fetch;
  const newerToken = `header.${Buffer.from(JSON.stringify({ exp: 4102444799 })).toString('base64url')}.signature`;
  try {
    values.set('trainwellacademy_token', token);
    consumeLoginRedirect();
    globalThis.fetch = async () => {
      values.set('trainwellacademy_token', newerToken);
      return { ok: false, status: 401, json: async () => ({ success: false, message: 'Old session expired' }) };
    };
    await assert.rejects(request('/library', { cache: false }), /Old session expired/);
    assert.equal(values.get('trainwellacademy_token'), newerToken);
    assert.equal(consumeLoginRedirect(), false);
  } finally { globalThis.fetch = original; }
});
