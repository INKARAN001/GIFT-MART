import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      setUser(null);
    }
    return res;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchWithAuth(`${API}/auth/me`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // login - sends email and password to backend, stores JWT token
  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data; // return so Login page can check role for admin redirect
  };

  // register - sends name, email, password, phone to backend which saves to MongoDB
  const register = async (name, email, password, phone) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.errors?.[0]?.msg || 'Registration failed');
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

