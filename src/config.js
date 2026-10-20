// Override this when the API runs in a remote Codespace.
export const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3080').replace(/\/+$/, '');
