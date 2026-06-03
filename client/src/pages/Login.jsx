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
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      <div className="w-full max-w-[1000px] bg-slate-900/40 backdrop-blur-2xl border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10">
        
        {/* Left Panel - Branding */}
        <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-between relative overflow-hidden border-r border-slate-800/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent"></div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="ProxDeep Logo" className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <span className="text-2xl font-bold text-white tracking-tight">PROXDEEP</span>
            </Link>
          </div>

          <div className="relative z-10 mt-12 md:mt-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
              Acceso al <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Panel Corporativo</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              Gestione sus Nodos Cognitivos, supervise métricas de uso locales y administre permisos de acceso desde su consola centralizada de alta seguridad.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/50 backdrop-blur-sm">
                <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-medium">Conexión cifrada de extremo a extremo</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/50 backdrop-blur-sm">
                <Network className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm font-medium">Acceso directo a infraestructura Air-Gapped</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-12 md:mt-8">
            <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} ProxDeep. Enterprise AI.</p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-slate-950/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
            <p className="text-slate-400 text-sm">Ingrese sus credenciales corporativas para continuar.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Correo Electrónico Corporativo</label>
              <input
                type="email"
                required
                className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                placeholder="nombre@su-empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Contraseña</label>
              <input
                type="password"
                required
                className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Acceder a la Consola'
                )}
              </span>
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-8">
            ¿No tiene un nodo asignado?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Solicite un Diagnóstico</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
