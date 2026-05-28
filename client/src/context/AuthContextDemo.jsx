import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  MOCK_USER, MOCK_TOKEN, MOCK_SMLS, MOCK_NEED, MOCK_PROPOSAL
} from '../mockData';

const AuthContext = createContext(null);

// In demo mode, VITE_DEMO_MODE=true bypasses all API calls
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) { return null; }
};

// Mock fetch that returns demo data without any network calls
const mockFetch = (url) => {
  const path = url.replace(API_URL, '');
  let data = [];

  if (path.includes('/smls'))          data = MOCK_SMLS;
  else if (path.includes('/client-needs')) data = [MOCK_NEED];
  else if (path.includes('/proposals'))    data = [MOCK_PROPOSAL];
  else if (path.includes('/users'))        data = [];
  else if (path.includes('/auth/login') || path.includes('/auth/register')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ token: MOCK_TOKEN, user: MOCK_USER }),
      status: 200,
    });
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
    status: 200,
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      // Auto-login as demo user
      const storedRole = localStorage.getItem('proxdeep_demo_role');
      if (storedRole === 'loggedin') {
        setToken(MOCK_TOKEN);
        setUser(MOCK_USER);
      }
      setLoading(false);
      return;
    }

    const storedToken = localStorage.getItem('sovereign_token');
    if (storedToken) {
      const decoded = parseJwt(storedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setUser({ id: decoded.id, email: decoded.email, role: decoded.role, company_name: decoded.company_name });
      } else {
        localStorage.removeItem('sovereign_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (DEMO_MODE) {
      localStorage.setItem('proxdeep_demo_role', 'loggedin');
      setToken(MOCK_TOKEN);
      setUser(MOCK_USER);
      return MOCK_USER;
    }
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Fallo al iniciar sesión.');
      localStorage.setItem('sovereign_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) { throw error; }
  };

  const register = async (email, password, role, companyName) => {
    if (DEMO_MODE) {
      const demoUser = { ...MOCK_USER, email, company_name: companyName || 'Tu Empresa' };
      localStorage.setItem('proxdeep_demo_role', 'loggedin');
      setToken(MOCK_TOKEN);
      setUser(demoUser);
      return demoUser;
    }
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, company_name: companyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Error al registrarse.');
      localStorage.setItem('sovereign_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) { throw error; }
  };

  const logout = () => {
    localStorage.removeItem('sovereign_token');
    localStorage.removeItem('proxdeep_demo_role');
    setToken(null);
    setUser(null);
  };

  const fetchWithAuth = async (url, options = {}) => {
    if (DEMO_MODE) return mockFetch(url);

    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) logout();
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchWithAuth, API_URL, DEMO_MODE }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
