/**
 * API root including `/api`. Use for `fetch` / `fetchWithAuth` on Vercel when `VITE_API_BASE_URL`
 * is set (e.g. `https://your-api.onrender.com/api`). Omit env in dev to use relative `/api` (Vite proxy).
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).replace(/\/$/, '');
  }
  return '/api';
}
