import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, Search, Rocket, Tag, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

const SmlCatalog = () => {
  const { fetchWithAuth, API_URL, user } = useAuth();
  const [smls, setSmls] = useState([]);
  const [activeSmlIds, setActiveSmlIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [categories, setCategories] = useState(['Todos']);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/smls`);
        if (!res.ok) throw new Error('No se pudo cargar el catálogo.');
        const data = await res.json();
        setSmls(data);
        setCategories(['Todos', ...new Set(data.map((s) => s.category))]);

        if (user) {
          const propRes = await fetchWithAuth(`${API_URL}/proposals`);
          if (propRes.ok) {
            const proposals = await propRes.json();
            const accepted = proposals.find(p => p.status === 'accepted');
            if (accepted && accepted.recommended_sml_ids) {
              let ids = [];
              try { ids = JSON.parse(accepted.recommended_sml_ids); } catch(e) { ids = accepted.recommended_sml_ids; }
              setActiveSmlIds(Array.isArray(ids) ? ids : []);
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = smls.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b1426] border border-[#06b6d4]/30 rounded-full text-xs font-semibold text-[#06b6d4] mb-4 shadow-glow">
          <Box className="h-4 w-4" />
          The Open Source Power
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Catálogo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]">ProxDeep</span></h1>
        <p className="text-lg text-slate-400 max-w-2xl">Descubre cientos de Modelos de Lenguaje Pequeños (SMLs) optimizados para industrias específicas, listos para desplegarse en tu infraestructura privada con un clic.</p>
      </div>

      {activeSmlIds.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            SMLs Aprovisionados en tu Nodo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {smls.filter(s => activeSmlIds.includes(s.id)).map((sml) => (
              <div key={`active-${sml.id}`} className="bg-gradient-to-br from-emerald-900/30 to-[#050b14] border border-emerald-500/50 rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4">
                    <Rocket className="h-3 w-3" /> En VRAM
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">{sml.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{sml.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between bg-[#0b1426]/50 p-4 rounded-2xl border border-[#1e3a8a]/30">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
          <input
            type="text"
            className="w-full bg-[#050b14] border border-[#1e3a8a] text-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] placeholder-slate-500 transition-all shadow-inner"
            placeholder="Buscar por nombre, base o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#0ea5e9] to-[#3b82f6] text-white shadow-glowBlue scale-105 border-transparent'
                  : 'bg-[#050b14] border border-[#1e3a8a]/50 text-slate-400 hover:text-[#06b6d4] hover:border-[#06b6d4]/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <div className="h-12 w-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin mb-4 shadow-glow"></div>
          <p className="text-lg font-medium">Sincronizando modelos...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-center">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-24 bg-[#0b1426]/30 rounded-3xl border border-[#1e3a8a]/20">
          <Cpu className="h-16 w-16 mx-auto mb-4 text-slate-700" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">Sin resultados</h3>
          <p className="text-slate-500">No encontramos modelos que coincidan con tu búsqueda.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((sml) => (
          <div key={sml.id} className={`group bg-[#0b1426] border border-[#1e3a8a]/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#06b6d4]/60 hover:shadow-glow hover:-translate-y-1 ${!sml.is_active ? 'opacity-50 grayscale' : ''}`}>
            <div>
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20">
                  <Tag className="h-3 w-3" /> {sml.category}
                </span>
                <span className={`h-2.5 w-2.5 rounded-full shadow-glow ${sml.is_active ? 'bg-emerald-400' : 'bg-slate-600'}`} title={sml.is_active ? 'Activo' : 'Inactivo'} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#06b6d4] transition-colors">{sml.name}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-3">{sml.description}</p>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#050b14] rounded-xl text-xs text-slate-300 font-medium mb-4 border border-[#1e3a8a]/30">
                <Cpu className="h-4 w-4 text-[#3b82f6]" />
                <span className="flex-1">Arquitectura Base:</span>
                <span className="text-white font-bold">{sml.base_model_type}</span>
              </div>
              
              <Link 
                to={user ? "/diagnostic" : "/register"} 
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-transparent border border-[#06b6d4]/50 hover:bg-[#06b6d4]/10 text-[#06b6d4] hover:text-white rounded-xl font-bold transition-all"
              >
                <Rocket className="h-4 w-4" />
                Solicitar Despliegue
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmlCatalog;
