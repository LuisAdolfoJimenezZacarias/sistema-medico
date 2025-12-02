const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export async function loginRequest(email: string, password: string, selectedRole?: number) {
  const body = { email, password: (password ?? '').trim(), selectedRole };
  console.log('[authService] POST', `${API_URL}/auth/login`, { email, password: body.password ? '***' : null, selectedRole });

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const json = await res.json().catch(() => null);
    console.log('[authService] response', res.status, json);
    return { status: res.status, data: json };
  } catch (err) {
    console.error('[authService] fetch error', err);
    return { status: 0, data: { message: 'Network error', detail: String(err) } };
  }
}

export const saveAuth = (token: string, user: any) => {
  // Persistir en múltiples claves para compatibilidad con el frontend
  try {
    const t = String(token ?? '');
    localStorage.setItem('token', t);
    localStorage.setItem('auth_token', t);
    localStorage.setItem('authToken', t);
    localStorage.setItem('user', JSON.stringify(user ?? {}));
    localStorage.setItem('auth_user', JSON.stringify(user ?? {}));
  } catch (e) {
    // noop
  }
};

export const clearAuth = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_user');
  } catch (e) { /* noop */ }
};
