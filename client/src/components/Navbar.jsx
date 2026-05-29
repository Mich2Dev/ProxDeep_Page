import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LayoutDashboard, Cpu, HelpCircle, Server, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const linkClass = (path) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 shadow-glow'
        : 'text-slate-400 hover:bg-[#0a0a0a] hover:text-white'
    }`;

  return (
    <nav className="bg-[#030712]/90 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg sm:text-xl tracking-wide shrink-0 font-outfit">
            <img src="/logo.png" alt="ProxDeep Logo" className="h-8 sm:h-10 w-auto object-contain" />
            <span>PROX<span className="text-blue-500">DEEP</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {user.role === 'client' && (
                  <>
                    <Link to="/dashboard" className={linkClass('/dashboard')}>
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/diagnostic" className={linkClass('/diagnostic')}>
                      <HelpCircle className="h-4 w-4" /> Diagnóstico
                    </Link>
                    <Link to="/smls" className={linkClass('/smls')}>
                      <Cpu className="h-4 w-4" /> SMLs
                    </Link>
                    <Link to="/workspace" className={linkClass('/workspace')}>
                      <Server className="h-4 w-4" /> Espacio de Trabajo
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className={linkClass('/admin')}>
                      <LayoutDashboard className="h-4 w-4" /> Panel Admin
                    </Link>
                    <Link to="/smls" className={linkClass('/smls')}>
                      <Cpu className="h-4 w-4" /> Catálogo SMLs
                    </Link>
                  </>
                )}
                <div className="h-5 w-px bg-slate-700 mx-2" />
                <span className="text-xs text-slate-400 truncate max-w-[140px]">
                  {user.company_name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="h-4 w-4" /> Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/smls" className={linkClass('/smls')}>
                  <Cpu className="h-4 w-4" /> Catálogo SMLs
                </Link>
                <div className="h-5 w-px bg-slate-700 mx-2" />
                <Link to="/login" className={linkClass('/login')}>
                  <LogIn className="h-4 w-4" /> Ingresar
                </Link>
                <Link to="/register" className="flex items-center gap-1.5 px-4 py-2 text-sm ml-1 bg-white hover:bg-slate-200 text-black font-semibold rounded-lg transition-colors">
                  <UserPlus className="h-4 w-4" /> Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white touch-target"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menú"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — full screen overlay */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#030712] px-4 pt-3 pb-6 space-y-1">
          {user ? (
            <>
              {user.role === 'client' && (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className={linkClass('/dashboard')}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link to="/diagnostic" onClick={() => setIsOpen(false)} className={linkClass('/diagnostic')}>
                    <HelpCircle className="h-4 w-4" /> Diagnóstico
                  </Link>
                  <Link to="/smls" onClick={() => setIsOpen(false)} className={linkClass('/smls')}>
                    <Cpu className="h-4 w-4" /> SMLs
                  </Link>
                  <Link to="/workspace" onClick={() => setIsOpen(false)} className={linkClass('/workspace')}>
                    <Server className="h-4 w-4" /> Espacio de Trabajo
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" onClick={() => setIsOpen(false)} className={linkClass('/admin')}>
                    <LayoutDashboard className="h-4 w-4" /> Panel Admin
                  </Link>
                  <Link to="/smls" onClick={() => setIsOpen(false)} className={linkClass('/smls')}>
                    <Cpu className="h-4 w-4" /> Catálogo SMLs
                  </Link>
                </>
              )}
              <div className="pt-3 border-t border-slate-800 mt-2">
                <p className="text-xs text-slate-500 px-3 mb-2">Sesión: {user.company_name || user.email}</p>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-3 text-sm text-red-400 hover:bg-slate-700 rounded-lg">
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/smls" onClick={() => setIsOpen(false)} className={linkClass('/smls')}>
                <Cpu className="h-4 w-4" /> Catálogo SMLs
              </Link>
              <Link to="/login" onClick={() => setIsOpen(false)} className={linkClass('/login')}>
                <LogIn className="h-4 w-4" /> Ingresar
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-3 py-3 text-sm mt-2 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                <UserPlus className="h-4 w-4" /> Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
