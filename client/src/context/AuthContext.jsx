import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to decode JWT without external library
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('sovereign_token');
    if (storedToken) {
      const decoded = parseJwt(storedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setUser({
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          company_name: decoded.company_name
        });
      } else {
        localStorage.removeItem('sovereign_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Fallo al iniciar sesión.');
      }

      localStorage.setItem('sovereign_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, role, companyName) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, company_name: companyName })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Error al registrarse.');
      }

      localStorage.setItem('sovereign_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('sovereign_token');
    setToken(null);
    setUser(null);
  };

  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });
    
    if (res.status === 401 || res.status === 403) {
      // Token expired or invalid, auto logout
      logout();
    }
    
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchWithAuth, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
