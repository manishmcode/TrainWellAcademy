import { post } from './api.js';
export const normalizeIban = value => value.replace(/\s+/g, '').toUpperCase();
export function paymentOutcome(result) {
  const status = String(result?.status || '').trim().toUpperCase();
  if (['DECLINED','FAILED','CANCELLED','CANCELED','REJECTED'].includes(status)) return 'failed';
  if (result?.subscriptionActive === true || ['APPROVED','COMPLETED','ACTIVE'].includes(status)) return 'complete';
  return 'pending';
}
export const validateIban = iban => post('/subscriptions/validate-iban', { iban });
export const createPaymentSession = body => post('/subscriptions/create-payment-session', body);
export const submitPayment = body => post('/subscriptions/submit-payment', body);
export const verifyPayment = session_token => post('/subscriptions/verify-payment', { session_token });
