import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle, ArrowLeft, Network, Lock, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row w-full font-sans">
      
      {/* Left Panel - Branding (Hidden on small mobile, visible on sm and up, split on md) */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="ProxDeep Logo" className="h-10 sm:h-12 w-auto object-contain" />
            <span className="text-2xl font-bold text-white tracking-tight">PROXDEEP</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Acceso al <br/> <span className="text-blue-400">Panel Corporativo</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Gestione sus Nodos Cognitivos, supervise métricas de uso locales y administre permisos de acceso desde su consola centralizada.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-sm">Conexión cifrada de extremo a extremo.</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <Network className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span className="text-sm">Acceso directo a su infraestructura Air-Gapped.</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} ProxDeep. Enterprise AI.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative min-h-screen md:min-h-0">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden absolute top-6 left-6 right-6 flex justify-between items-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="ProxDeep Logo" className="h-8 sm:h-10 w-auto object-contain" />
            <span className="text-xl font-bold text-white tracking-tight">PROXDEEP</span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10 mt-12 md:mt-0">
          
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Iniciar Sesión</h2>
            <p className="text-slate-400">Ingrese sus credenciales corporativas.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-300">Correo Electrónico Corporativo</label>
              <input
                type="email"
                required
                className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                placeholder="nombre@su-empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-300">Contraseña</label>
              </div>
              <input
                type="password"
                required
                className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                'Acceder a la Consola'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">
            ¿No tiene un nodo asignado?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Solicite un Diagnóstico</Link>
          </p>

          {/* Demo Helpers */}
          <div className="mt-8 p-4 bg-slate-900/30 border border-slate-800/50 rounded-xl">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Credenciales de Acceso (Demo)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Cliente:</span>
                <code className="text-blue-400 font-medium">client@acme.com / password123</code>
              </div>
              <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Admin:</span>
                <code className="text-emerald-400 font-medium">admin@soberana.ia / password123</code>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
