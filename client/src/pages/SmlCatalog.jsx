import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, Search, Rocket, Tag, Box, Server, Shield } from 'lucide-react';
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
  }, [API_URL, fetchWithAuth, user]);

  const filtered = smls.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* HEADER SECTION */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-900/30">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 39.5h40M39.5 0v40' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E\")" }}></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center sm:text-left">
          
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-slate-900 border border-slate-700 rounded-full text-xs font-semibold text-slate-300 mb-6 shadow-sm">
            <Box className="h-3.5 w-3.5 text-blue-400" />
            Modelos de Lenguaje Optimizados
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Catálogo <span className="text-blue-500">ProxDeep</span>
          </h1>
          
          <p className="text-sm sm:text-lg text-slate-400 max-w-3xl leading-relaxed mx-auto sm:mx-0">
            Explore nuestra biblioteca de Small Language Models (SMLs) calibrados para industrias específicas. Modelos de alto rendimiento diseñados para ejecutarse exclusivamente dentro de su red corporativa.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* ACTIVE MODELS ALERT */}
        {activeSmlIds.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2 justify-center sm:justify-start">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              SMLs Aprovisionados en su Nodo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {smls.filter(s => activeSmlIds.includes(s.id)).map((sml) => (
                <div key={`active-${sml.id}`} className="bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors"></div>
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                      <Server className="h-3 w-3" /> Producción (VRAM)
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">{sml.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{sml.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FILTERS (MOBILE OPTIMIZED HORIZONTAL SCROLL) */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10 items-center justify-between bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm w-full">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition-all shadow-inner"
              placeholder="Buscar por nombre, tipo o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-nowrap lg:flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 text-slate-400">
            <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium">Sincronizando catálogo con el nodo central...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-center text-sm font-medium">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/50">
            <Cpu className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-300 mb-2">Sin resultados</h3>
            <p className="text-sm text-slate-500">No encontramos modelos corporativos bajo esos criterios.</p>
          </div>
        )}

        {/* GRID SMLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sml) => (
            <div key={sml.id} className={`group bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1 ${!sml.is_active ? 'opacity-50 grayscale' : ''}`}>
              <div>
                <div className="flex items-start justify-between mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Tag className="h-3 w-3" /> {sml.category}
                  </span>
                  <span className={`h-2 w-2 rounded-full shadow-sm ${sml.is_active ? 'bg-emerald-500' : 'bg-slate-600'}`} title={sml.is_active ? 'Nodo Activo' : 'Nodo Inactivo'} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{sml.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-3">{sml.description}</p>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-950 rounded-xl text-xs sm:text-sm text-slate-300 font-medium mb-5 border border-slate-800/80">
                  <Shield className="h-4 w-4 text-indigo-400" />
                  <span className="flex-1">Arquitectura Base:</span>
                  <span className="text-white font-bold">{sml.base_model_type}</span>
                </div>
                
                <Link 
                  to={user ? "/diagnostic" : "/register"} 
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-transparent border border-blue-600/50 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl font-bold transition-all text-sm sm:text-base"
                >
                  <Rocket className="h-4 w-4" />
                  Solicitar Auditoría y Despliegue
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmlCatalog;
