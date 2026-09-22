import { request } from './api.js';
export const fetchDashboard = () => request('/user/dashboard');
export function hasActivePlan(data) {
  if (typeof data?.has_active_plan === 'boolean') return data.has_active_plan;
  return (data?.subscriptions || []).some(sub => {
    const status = String(sub.status).trim().toLowerCase();
    return !sub.cancelled_at && !['cancelled', 'canceled', 'expired', 'failed'].includes(status)
      && (!sub.ends_at || new Date(sub.ends_at).getTime() > Date.now())
      && (!sub.starts_at || new Date(sub.starts_at).getTime() <= Date.now())
      && (status === 'active' || ['active', 'paid'].includes(String(sub.payment_status).trim().toLowerCase()));
  });
}
