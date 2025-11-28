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
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};