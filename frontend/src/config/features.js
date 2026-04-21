/**
 * Feature flags (kill switches). Set any `VITE_ENABLE_*` to "false" in `.env` to disable
 * without editing page code — see `frontend/.env.example` and `README.md`.
 */
export const FEATURES = {
  REVIEWS: import.meta.env.VITE_ENABLE_REVIEWS !== 'false',
  REMINDERS: import.meta.env.VITE_ENABLE_REMINDERS !== 'false',
  PROMOS: import.meta.env.VITE_ENABLE_PROMOS !== 'false',
  ADMIN_STATS: import.meta.env.VITE_ENABLE_ADMIN_STATS !== 'false',
};
