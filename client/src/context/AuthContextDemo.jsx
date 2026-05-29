import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  MOCK_USER, MOCK_TOKEN, MOCK_SMLS, MOCK_NEED, MOCK_PROPOSAL
} from '../mockData';
import { AuthContext } from './AuthContext';

// AuthContextDemo is only used by AppDemo — always bypass backend
const DEMO_MODE = true;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let demoNeeds = [{ ...MOCK_NEED }];
let demoProposals = [{ ...MOCK_PROPOSAL }];

const mockResponse = (data, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  });

const buildDemoUser = (email, companyName) => {
  const role = (email || '').toLowerCase().includes('admin') ? 'admin' : 'client';
  return {
    ...MOCK_USER,
    email: email || MOCK_USER.email,
    role,
    company_name: companyName || (role === 'admin' ? 'ProxDeep Admin' : MOCK_USER.company_name),
  };
};

const mockFetch = (url, options = {}) => {
  const path = url.replace(API_URL, '').replace(/^\//, '');
  const method = (options.method || 'GET').toUpperCase();

  if (path.includes('auth/login') || path.includes('auth/register')) {
    return mockResponse({ token: MOCK_TOKEN, user: MOCK_USER });
  }

  if (path === 'smls' || path.endsWith('/smls')) {
    return mockResponse(MOCK_SMLS);
  }

  const needById = path.match(/client-needs\/(\d+)/);
  if (needById) {
    const id = Number(needById[1]);
    const need = demoNeeds.find(n => n.id === id) || { ...MOCK_NEED, id };
    return mockResponse(need);
  }

  if (path.includes('admin/client-needs') || path === 'client-needs' || path.startsWith('client-needs?')) {
    if (method === 'POST') {
      const body = options.body ? JSON.parse(options.body) : {};
      const newNeed = {
        id: demoNeeds.length + 1,
        status: 'submitted',
        created_at: new Date().toISOString(),
        ...body,
      };
      demoNeeds = [...demoNeeds, newNeed];
      return mockResponse(newNeed, true, 201);
    }
    return mockResponse([...demoNeeds]);
  }

  const proposalStatus = path.match(/proposals\/(\d+)\/status/);
  if (proposalStatus && method === 'PUT') {
    const id = Number(proposalStatus[1]);
    const body = options.body ? JSON.parse(options.body) : {};
    demoProposals = demoProposals.map(p =>
      p.id === id ? { ...p, status: body.status || p.status } : p
    );
    return mockResponse(demoProposals.find(p => p.id === id) || MOCK_PROPOSAL);
  }

  const generateAuto = path.match(/proposals\/generate_auto\/(\d+)/);
  if (generateAuto && method === 'POST') {
    const needId = Number(generateAuto[1]);
    const newProposal = {
      ...MOCK_PROPOSAL,
      id: demoProposals.length + 1,
      client_need_id: needId,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    demoProposals = [...demoProposals, newProposal];
    return mockResponse(newProposal, true, 201);
  }

  const proposalById = path.match(/proposals\/(\d+)/);
  if (proposalById) {
    const id = Number(proposalById[1]);
    const proposal = demoProposals.find(p => p.id === id) || { ...MOCK_PROPOSAL, id };
    return mockResponse(proposal);
  }

  if (path.includes('admin/proposals') || path === 'proposals' || path.startsWith('proposals?')) {
    return mockResponse([...demoProposals]);
  }

  if (path.includes('/bot/')) {
    const body = options.body ? JSON.parse(options.body) : {};
    const smlHint = body.sml_name ? ` (${body.sml_name})` : '';
    return mockResponse({
      reply: `Respuesta demo del nodo local${smlHint}: procesamiento completado sin salir de la VPC privada.`,
    });
  }

  if (path.includes('/users')) {
    return mockResponse([]);
  }

  return mockResponse({});
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem('proxdeep_demo_role');
    if (storedRole === 'loggedin') {
      setToken(MOCK_TOKEN);
      setUser(MOCK_USER);
    }
    setLoading(false);
  }, []);

  const login = async (email, _password) => {
    const demoUser = buildDemoUser(email);
    localStorage.setItem('proxdeep_demo_role', 'loggedin');
    localStorage.removeItem('sovereign_token');
    setToken(MOCK_TOKEN);
    setUser(demoUser);
    return demoUser;
  };

  const register = async (email, _password, role, companyName) => {
    const demoUser = buildDemoUser(email, companyName);
    if (role) demoUser.role = role;
    localStorage.setItem('proxdeep_demo_role', 'loggedin');
    localStorage.removeItem('sovereign_token');
    setToken(MOCK_TOKEN);
    setUser(demoUser);
    return demoUser;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('sovereign_token');
    localStorage.removeItem('proxdeep_demo_role');
    setToken(null);
    setUser(null);
  }, []);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    return mockFetch(url, options);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchWithAuth, API_URL, DEMO_MODE }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
