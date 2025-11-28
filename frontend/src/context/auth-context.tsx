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

// Leer estado inicial desde localStorage de forma síncrona
const getInitialToken = () => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  } catch (e) { return null; }
};
const getInitialUser = () => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('auth_user');
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

      // actualizar estado SÍNCRONO antes de devolver para que guards/routers encuentren el token
      setToken(newToken);
      setUser(newUser);

      try {
        localStorage.setItem('auth_token', newToken);
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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } catch (e) { /* ignore */ }
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