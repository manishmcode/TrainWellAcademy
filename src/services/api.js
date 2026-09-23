import { API_ROOT } from '../config/apiBase.js';
import { clearAuthSession, getToken } from './auth.js';
// This cache deliberately lives only in JavaScript memory: a complete browser
// refresh starts a new session and fetches fresh API data.
const responseCache = new Map();

export function clearApiCache() {
  responseCache.clear();
}

async function sendRequest(path, { method, body, auth, signal, envelope }, token) {
  let response;
  try {
    response = await fetch(API_ROOT + path, {
      method, signal: signal || AbortSignal.timeout(20000),
      headers: { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Unable to reach the server. Please try again.');
  }
  if (response.status === 401 && token && path !== '/auth/change-password') clearAuthSession();
  let result;
  try { result = await response.json(); } catch { throw new Error('The server returned an invalid response.'); }
  if (!result || typeof result !== 'object') throw new Error('The server returned an invalid response.');
  if (!response.ok || result.success === false) {
    const error = new Error(result.message || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  if (envelope && (result.success !== true || !Object.hasOwn(result, 'data'))) throw new Error('The server returned an invalid response.');
  return envelope ? result.data : result;
}

export async function request(path, options = {}) {
  const { method = 'GET', body, auth = true, signal, envelope = true } = options;
  const token = auth ? getToken() : null;
  const cacheable = method.toUpperCase() === 'GET' && !signal;
  const cacheKey = `${API_ROOT}${path}|${auth ? token || 'guest' : 'public'}|${envelope}`;

  if (!cacheable) return sendRequest(path, { method, body, auth, signal, envelope }, token);

  const cached = responseCache.get(cacheKey);
  if (cached) return cached;

  const pendingResponse = sendRequest(path, { method, body, auth, signal, envelope }, token);
  responseCache.set(cacheKey, pendingResponse);
  try {
    return await pendingResponse;
  } catch (error) {
    responseCache.delete(cacheKey);
    throw error;
  }
}
export const post = (path, body, options) => request(path, { method: 'POST', body, ...options });
export const fetchPlans = () => request('/plans', { auth: false }).then(data => {
  if (!Array.isArray(data)) throw new Error('Invalid plans response.');
  return data.filter(plan => plan.is_active);
});
