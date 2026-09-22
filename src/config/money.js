export function formatMoney(value, currency = 'EUR') {
  if (!Number.isFinite(Number(value))) return '—';
  try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(value)); }
  catch { return `${Number(value).toFixed(2)} ${currency}`; }
}
