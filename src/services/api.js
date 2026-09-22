import { API_ROOT } from '../config/apiBase.js';
import { clearAuthSession, getToken } from './auth.js';
export async function request(path, { method = 'GET', body, auth = true, signal, envelope = true } = {}) {
  const token = auth ? getToken() : null;
  let response;
  try {
    response = await fetch(API_ROOT + path, {
      method, signal: signal || AbortSignal.timeout(20000),
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
export const post = (path, body, options) => request(path, { method: 'POST', body, ...options });
export const fetchPlans = () => request('/plans', { auth: false }).then(data => {
  if (!Array.isArray(data)) throw new Error('Invalid plans response.');
  return data.filter(plan => plan.is_active);
});
