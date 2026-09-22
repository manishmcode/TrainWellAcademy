export function resolveApiConfig(base = 'https://trainwellacademy.net', prefix = '/trainwellacademy-api') {
  const origin = (base.trim() || 'https://trainwellacademy.net').replace(/\/+$/, '');
  const normalized = '/' + prefix.replace(/^\/+|\/+$/g, '');
  return { API_ROOT: origin.endsWith(normalized) ? origin : origin + (normalized === '/' ? '' : normalized) };
}
export const { API_ROOT } = resolveApiConfig(import.meta.env?.VITE_API_BASE_URL || (import.meta.env?.DEV ? 'http://localhost:4000' : undefined), import.meta.env?.VITE_API_PREFIX);
