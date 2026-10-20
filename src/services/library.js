import { request } from './api.js';

export function secureLibraryAssetUrl(url) {
  // Library media must stay on the frontend origin and use a signed route.
  // Never fall back to a public DB URL if an outdated API returns one.
  return typeof url === 'string' && /^\/v\/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(url) ? url : ''
}

function normalizeCard(card) {
  return {
    ...card,
    image: secureLibraryAssetUrl(card.image),
    link: secureLibraryAssetUrl(card.link),
  }
}

export function libraryRefreshDelay(rows) {
  let expiresAt = Infinity
  for (const row of rows) {
    for (const card of row.cards || []) {
      for (const url of [card.image, card.link]) {
        if (!secureLibraryAssetUrl(url)) continue
        try {
          const payload = url.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
          const { exp } = JSON.parse(atob(payload))
          if (Number.isFinite(exp)) expiresAt = Math.min(expiresAt, exp * 1000)
        } catch {
          // Decoding only schedules refresh; the backend verifies authorization.
        }
      }
    }
  }
  if (!Number.isFinite(expiresAt)) return null
  const remaining = expiresAt - Date.now()
  return Math.max(1000, remaining - Math.min(30000, remaining * 0.2))
}


export async function fetchLibrary() {
  // Signed links expire: always obtain fresh URLs instead of the API memory cache.
  const data = await request('/library', { cache: false });
  if (!Array.isArray(data)) throw new Error('Invalid library response.');
  return data.map(row => ({ ...row, cards: (row.cards || []).map(normalizeCard) }));
}
