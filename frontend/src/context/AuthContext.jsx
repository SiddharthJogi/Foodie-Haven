import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from '../config/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      const { user: savedUser, token: savedToken } = JSON.parse(saved);
      setUser(savedUser || null);
      setToken(savedToken || null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  const login = async (username, password, isRegister = false) => {
    const endpoint = isRegister ? 'api/auth/register' : 'api/auth/login';
    const payload = { username, password };
    const res = await axios.post(endpoint, payload);
    if (isRegister) {
      // After register, immediately log in
      const loginRes = await axios.post('api/auth/login', payload);
      const data = loginRes.data;
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('auth', JSON.stringify({ user: data.user, token: data.token }));
    } else {
      const data = res.data;
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('auth', JSON.stringify({ user: data.user, token: data.token }));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth');
  };

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


