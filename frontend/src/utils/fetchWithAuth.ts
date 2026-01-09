import { isTokenExpired } from './authHelpers';

function normalizeToken(raw?: string | null) {
  if (!raw) return null;
  let t = String(raw).trim();
  if (/^".*"$/.test(t)) t = t.slice(1, -1); // quitar comillas si existen
  t = t.replace(/^Bearer\s+/i, ''); // quitar prefijo si lo tiene
  return t || null;
}

function readStoredToken(): string | null {
  try {
    const raw =
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('authToken') ||
      (() => {
        const u = localStorage.getItem('user');
        if (!u) return null;
        try { const parsed = JSON.parse(u); return parsed?.token ?? parsed?.accessToken ?? null; } catch { return null; }
      })();
    return normalizeToken(raw);
  } catch {
    return null;
  }
}

export { readStoredToken };

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const token = readStoredToken();

  if (token && isTokenExpired(token)) {
    // limpiar y forzar login
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_user');
    } catch {}
    if (typeof window !== 'undefined') window.location.href = '/login';
    return Promise.reject(new Error('Token expired (client)'));
  }

  const headers = { ...(init.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    // limpiar y forzar login
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_user');
    } catch {}
    const json = await res.json().catch(() => ({}));
    if (typeof window !== 'undefined') window.location.href = '/login';
    return Promise.reject(new Error(json?.message || 'Unauthorized'));
  }

  return res;
}