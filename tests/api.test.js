import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from '../src/services/api.js';
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
