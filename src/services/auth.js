const TOKEN = 'trainwellacademy_token';
const USER = 'trainwellacademy_user';
export function clearAuthSession() {
  localStorage.removeItem(TOKEN);
  localStorage.removeItem(USER);
  localStorage.removeItem('trainwellacademy_has_active_plan');
  sessionStorage.removeItem('trainwellacademy_pending_payment');
  document.cookie = `${TOKEN}=; path=/; max-age=0; SameSite=Lax`;
  window.dispatchEvent(new Event('authchange'));
}
export function getToken() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN);
  if (!token) return null;
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part));
    if (!payload.exp || payload.exp * 1000 <= Date.now()) throw new Error('Expired session');
    return token;
  } catch { clearAuthSession(); return null; }
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem(USER)) || null; } catch { return null; }
}
export function hasActiveSubscription(user) {
  let metadata = user?.user_meta;
  if (typeof metadata === 'string') {
    try { metadata = JSON.parse(metadata); } catch { metadata = null; }
  }

  const status = String(metadata?.subscription_status ?? user?.subscription_status ?? '').trim().toLowerCase();
  const planId = metadata?.plan_id ?? user?.plan_id;

  return status === 'active' && Number(planId) > 0;
}
export function saveUser(user) { localStorage.setItem(USER, JSON.stringify(user)); }
export function saveAuthSession({ token, user }) {
  if (!token || !user) throw new Error('The server returned an invalid session.');
  localStorage.setItem(TOKEN, token);
  saveUser(user);
  document.cookie = `${TOKEN}=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  window.dispatchEvent(new Event('authchange'));
}
