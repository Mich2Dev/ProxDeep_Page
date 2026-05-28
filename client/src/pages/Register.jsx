import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await register(email, password, role, role === 'client' ? companyName : null);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Error al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-7 w-7 text-indigo-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Crear Cuenta</h1>
            <p className="text-sm text-slate-400">Regístrate en la plataforma</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Perfil</label>
            <div className="grid grid-cols-2 gap-3">
              {['client', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                    role === r
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {r === 'client' ? 'Cliente (Empresa)' : 'Administrador'}
                </button>
              ))}
            </div>
          </div>

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

          {role === 'client' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre de la Empresa</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Acme Corporation S.A."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-400 text-center">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
