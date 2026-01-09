import React, { createContext, useContext, useState } from 'react';
import { loginRequest } from '../features/auth/services/authService';

type AuthContextType = {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, selectedRole?: number) => Promise<{ status: number; data: any }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Leer estado inicial desde localStorage de forma síncrona (buscar en múltiples claves)
const getInitialToken = () => {
  try {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('authToken') ||
      null
    );
  } catch (e) { return null; }
};
const getInitialUser = () => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user') || localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getInitialToken());
  const [user, setUser] = useState<any | null>(getInitialUser());

  const isAuthenticated = Boolean(token);

  const login = async (email: string, password: string, selectedRole?: number) => {
    const res = await loginRequest(email, password, selectedRole);

    if (res?.status === 200 && res.data?.token) {
      const newToken = res.data.token;
      const newUser = res.data.user ?? null;

      setToken(newToken);
      setUser(newUser);

      try {
        // Persistir en claves compatibles con todo el frontend
        localStorage.setItem('token', newToken);
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('auth_user', JSON.stringify(newUser));
      } catch (e) {
        // ignore storage errors
      }
    }

    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      // limpiar todas las claves usadas
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_user');
    } catch (e) { /* ignore */ }
    // opcional: redirect
    if (typeof window !== 'undefined') window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};