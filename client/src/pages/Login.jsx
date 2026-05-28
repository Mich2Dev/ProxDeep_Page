import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-7 w-7 text-indigo-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Iniciar Sesión</h1>
            <p className="text-sm text-slate-400">Accede a tu plataforma soberana</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="nombre@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-400 text-center">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Regístrate aquí</Link>
        </p>

        {/* Demo credentials helper */}
        <div className="mt-6 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Credenciales de Demo:</p>
          <p>Cliente: <code className="text-indigo-300">client@acme.com</code> / <code className="text-indigo-300">password123</code></p>
          <p>Admin: <code className="text-indigo-300">admin@soberana.ia</code> / <code className="text-indigo-300">password123</code></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
