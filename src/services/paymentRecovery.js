const KEY = 'trainwellacademy_pending_payment';
export function readPendingPayment(user) {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY));
    return value && value.email === user?.email && typeof value.sessionToken === 'string' && value.sessionToken.startsWith('ps_') ? value : null;
  } catch { return null; }
}
export function savePendingPayment(user, sessionToken, planId) {
  sessionStorage.setItem(KEY, JSON.stringify({ email: user.email, sessionToken, planId }));
}
export const clearPendingPayment = () => sessionStorage.removeItem(KEY);
