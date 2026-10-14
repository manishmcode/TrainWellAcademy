import test from 'node:test';
import assert from 'node:assert/strict';
import { hasActivePlan } from '../src/services/account.js';
import { paymentOutcome, normalizeIban } from '../src/services/checkout.js';
import { formatMoney } from '../src/config/money.js';

test('membership fails closed for cancelled, expired, future and failed subscriptions', () => {
  const active = { status: 'active', starts_at: '2020-01-01', ends_at: '2099-01-01' };
  assert.equal(hasActivePlan({ subscriptions: [active] }), true);
  for (const change of [{ cancelled_at: '2026-01-01' }, { ends_at: '2020-01-02' }, { starts_at: '2098-01-01' }, { status: 'failed', payment_status: 'paid' }]) {
    assert.equal(hasActivePlan({ subscriptions: [{ ...active, ...change }] }), false);
  }
  assert.equal(hasActivePlan({ has_active_plan: false, subscriptions: [active] }), false);
  assert.equal(hasActivePlan({ user_meta: { subscription_status: 'active' } }), false);
});
test('successful envelope alone never completes payment', () => {
  assert.equal(paymentOutcome({ success: true }), 'pending');
  assert.equal(paymentOutcome({ status: 'PENDING_ASYNC', subscriptionActive: false }), 'pending');
  assert.equal(paymentOutcome({ status: 'FAILED', subscriptionActive: true }), 'failed');
  assert.equal(paymentOutcome({ status: 'COMPLETED' }), 'complete');
  assert.equal(paymentOutcome({ subscriptionActive: true }), 'complete');
  assert.equal(normalizeIban('de89 3704 0044'), 'DE8937040044');
});
test('checkout formats the plan amount and currency', () => {
  assert.equal(formatMoney(97, 'EUR'), '€97.00');
  assert.equal(formatMoney(59.5, 'GBP'), '£59.50');
});
