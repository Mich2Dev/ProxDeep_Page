import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Cpu, Check, AlertCircle, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const { fetchWithAuth, API_URL } = useAuth();
  const [needs, setNeeds] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [smls, setSmls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('needs');
  const [error, setError] = useState(null);
  const [generatingFor, setGeneratingFor] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [nRes, pRes, sRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/admin/client-needs`),
        fetchWithAuth(`${API_URL}/admin/proposals`),
        fetchWithAuth(`${API_URL}/smls`),
      ]);
      setNeeds(await nRes.json());
      setProposals(await pRes.json());
      setSmls(await sRes.json());
    } catch (err) {
      setError('Error cargando datos del panel de administración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const generateProposal = async (needId) => {
    setGeneratingFor(needId);
    setError(null);
    try {
      const res = await fetchWithAuth(`${API_URL}/proposals/generate_auto/${needId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error generando propuesta.');
      await load();
      setActiveTab('proposals'); // Switch to proposals tab to show the result
    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingFor(null);
    }
  };

  const tabs = [
    { id: 'needs', label: 'Diagnósticos', icon: <FileText className="h-4 w-4" />, count: needs.length },
    { id: 'proposals', label: 'Propuestas', icon: <Check className="h-4 w-4" />, count: proposals.length },
    { id: 'smls', label: 'Catálogo SMLs', icon: <Cpu className="h-4 w-4" />, count: smls.length },
  ];

  const STATUS_NEED_COLORS = {
    draft: 'bg-slate-800 text-slate-400',
    submitted: 'bg-amber-900/50 text-amber-300',
    reviewed: 'bg-blue-900/50 text-blue-300',
    proposal_generated: 'bg-emerald-900/50 text-emerald-300',
  };
  const STATUS_PROPOSAL_COLORS = {
    pending: 'bg-amber-900/50 text-amber-300',
    accepted: 'bg-emerald-900/50 text-emerald-300',
    rejected: 'bg-red-900/50 text-red-300',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

      {/* Header */}
      <div className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Panel de Administración</p>
          <h1 className="text-2xl font-bold text-white">SoberanaAI — Gestión Interna</h1>
        </div>
        <button onClick={load} disabled={loading} className="btn-secondary inline-flex items-center gap-1.5">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Diagnósticos</p>
              <p className="text-3xl font-black text-white">{needs.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-cyan-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Propuestas</p>
              <p className="text-3xl font-black text-white">{proposals.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">SMLs activos</p>
              <p className="text-3xl font-black text-white">{smls.filter((s) => s.is_active).length}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-800 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className="bg-slate-700 text-slate-300 text-xs font-bold px-1.5 py-0.5 rounded">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Needs Tab */}
      {activeTab === 'needs' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="pb-3 pr-6">Empresa</th>
                <th className="pb-3 pr-6">Descripción</th>
                <th className="pb-3 pr-6">Estado</th>
                <th className="pb-3 pr-6">Sensibilidad</th>
                <th className="pb-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {needs.map((n) => (
                <tr key={n.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 pr-6 font-semibold text-white">{n.company_name || '—'}</td>
                  <td className="py-3 pr-6 text-slate-400 max-w-xs truncate">{n.problem_description}</td>
                  <td className="py-3 pr-6">
                    <span className={`badge ${STATUS_NEED_COLORS[n.status] || 'bg-slate-800 text-slate-400'}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="py-3 pr-6 text-slate-300">{n.data_sensitivity}</td>
                  <td className="py-3">
                    {n.status === 'submitted' && (
                      <button
                        onClick={() => generateProposal(n.id)}
                        disabled={generatingFor === n.id}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        {generatingFor === n.id ? (
                           <><RefreshCw className="h-3 w-3 animate-spin"/> Procesando...</>
                        ) : 'Generar Propuesta IA (Beta)'}
                      </button>
                    )}
                    {n.status === 'proposal_generated' && (
                      <span className="text-xs text-emerald-400">✓ Propuesta enviada</span>
                    )}
                    {n.status === 'draft' && (
                      <span className="text-xs text-slate-500">Esperando envío</span>
                    )}
                  </td>
                </tr>
              ))}
              {needs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">No hay diagnósticos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Proposals Tab */}
      {activeTab === 'proposals' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="pb-3 pr-6">Empresa</th>
                <th className="pb-3 pr-6">Nodo</th>
                <th className="pb-3 pr-6">Costo USD</th>
                <th className="pb-3 pr-6">Amortización</th>
                <th className="pb-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {proposals.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 pr-6 font-semibold text-white">{p.company_name || '—'}</td>
                  <td className="py-3 pr-6 text-slate-300">{p.recommended_nodo_type}</td>
                  <td className="py-3 pr-6 text-emerald-400 font-bold">
                    ${parseFloat(p.estimated_fixed_cost_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 pr-6 text-slate-400">{p.estimated_amortization_months} meses</td>
                  <td className="py-3">
                    <span className={`badge ${STATUS_PROPOSAL_COLORS[p.status] || 'bg-slate-800 text-slate-400'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {proposals.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">No hay propuestas generadas aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SMLs Tab */}
      {activeTab === 'smls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {smls.map((sml) => (
            <div key={sml.id} className={`card ${!sml.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="badge bg-indigo-900/60 text-indigo-300">{sml.category}</span>
                <span className={`badge ${sml.is_active ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                  {sml.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{sml.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{sml.description}</p>
              <p className="text-xs text-slate-600 mt-2">Base: {sml.base_model_type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
