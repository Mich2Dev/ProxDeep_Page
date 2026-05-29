import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, X, Cpu, AlertCircle, Users, ShieldCheck, Server, Database, TrendingUp, Cloud, Zap } from 'lucide-react';
import { buildCloudRoiComparison } from '../utils/cloudRoi';

const ClientProposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchWithAuth, API_URL } = useAuth();

  const [proposal, setProposal] = useState(null);
  const [clientNeed, setClientNeed] = useState(null);
  const [smls, setSmls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const pRes = await fetchWithAuth(`${API_URL}/proposals/${id}`);
        if (!pRes.ok) throw new Error('Propuesta no encontrada.');
        const propData = await pRes.json();
        setProposal(propData);

        const [sRes, nRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/smls`),
          fetchWithAuth(`${API_URL}/client-needs/${propData.client_need_id}`)
        ]);

        setSmls(await sRes.json());
        setClientNeed(await nRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, API_URL, fetchWithAuth]);

  const updateStatus = async (status) => {
    setUpdating(true);
    setError(null);
    try {
      const res = await fetchWithAuth(`${API_URL}/proposals/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProposal((p) => ({ ...p, status }));
      if (status === 'accepted') navigate('/workspace');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="h-8 w-8 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error && !proposal) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="card">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="text-slate-300">{error}</p>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 mt-4 text-sm text-[#0ea5e9] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
        </Link>
      </div>
    </div>
  );

  // Parse recommended SML IDs
  let recommendedIds = [];
  try {
    recommendedIds = typeof proposal.recommended_sml_ids === 'string'
      ? JSON.parse(proposal.recommended_sml_ids)
      : proposal.recommended_sml_ids;
  } catch { /* ignore */ }

  const recommendedSmls = smls.filter((s) => recommendedIds.includes(s.id));

  // Calculations
  const users = clientNeed?.expected_users_concurrent || 1;
  const proxdeepCost = parseFloat(proposal.estimated_fixed_cost_usd) || 0;
  const costPerUser = (proxdeepCost / users).toFixed(2);
  const totalCost = proxdeepCost.toLocaleString('en-US', { minimumFractionDigits: 2 });

  const roi = buildCloudRoiComparison(users, proxdeepCost);
  const proposalDetails = proposal.proposal_details || proposal.justification_text || '';


  const statusBadge = {
    pending: 'bg-amber-900/50 text-amber-300 border-amber-700 shadow-[0_0_10px_rgba(251,191,36,0.2)]',
    accepted: 'bg-emerald-900/50 text-emerald-300 border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    rejected: 'bg-red-900/50 text-red-300 border-red-700 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
  };
  const statusLabel = { pending: 'Pendiente de Aprobación', accepted: 'Infraestructura Aprovisionada', rejected: 'Propuesta Rechazada' };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">

      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1e3a8a]/30 pb-6">
        <div>
          <p className="text-xs font-bold text-[#06b6d4] uppercase tracking-widest mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Blueprint Técnico
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Propuesta de Ecosistema Soberano</h1>
          <p className="text-sm text-slate-400 mt-2">Arquitectura generada para {users} usuarios concurrentes.</p>
        </div>
        <span className={`px-4 py-2 rounded-full border text-sm font-bold ${statusBadge[proposal.status]}`}>
          {statusLabel[proposal.status]}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metrics & Cost */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-gradient-to-br from-[#0b1426] to-[#050b14] border-[#06b6d4]/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#06b6d4]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Costo Fijo por Usuario</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#06b6d4]">${costPerUser}</span>
              <span className="text-sm text-slate-400">/ usuario / año</span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-[#1e3a8a]/30 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Inversión Total del Cluster</p>
                <p className="text-lg font-bold text-white">${totalCost}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Tiempo de Amortización</p>
                <p className="text-lg font-bold text-white">{proposal.estimated_amortization_months} meses</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Categoría del Nodo</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1e3a8a]/40 text-[#0ea5e9] text-xs font-bold border border-[#1e3a8a]">
                  <Server className="h-3.5 w-3.5" /> NODO {proposal.recommended_nodo_type.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Client Need Context Card */}
          <div className="card border-[#1e3a8a]/30 bg-[#050b14]">
            <h3 className="text-sm font-bold text-[#06b6d4] mb-4 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4" /> Contexto Operativo
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Descripción del Reto</p>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed italic border-l-2 border-[#1e3a8a] pl-3">
                  "{clientNeed?.problem_description}"
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#1e3a8a]/30">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Carga Concurrente</p>
                  <p className="text-sm font-bold text-white mt-0.5">{users} Usuarios</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Privacidad (Nivel)</p>
                  <p className="text-sm font-bold text-white mt-0.5 capitalize">{clientNeed?.data_sensitivity}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-[#1e3a8a]/30 bg-[#050b14]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Cpu className="h-4 w-4 text-[#06b6d4]"/> Modelos Especializados (SMLs)</h3>
            <div className="space-y-3">
              {recommendedSmls.map((sml) => (
                <div key={sml.id} className="p-3 bg-[#0b1426] border border-[#1e3a8a]/50 rounded-lg">
                  <p className="text-sm font-bold text-white">{sml.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{sml.category}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Details & Blueprint */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card border-[#1e3a8a]/30 bg-[#050b14]/80">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#06b6d4]" /> Detalles de la Arquitectura Propuesta
            </h2>
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:text-slate-300 prose-strong:text-[#06b6d4] prose-li:text-slate-300">
              {proposalDetails.split(/\n{2,}/).map((block, idx) => (
                <div key={idx} className="mb-6 last:mb-0">
                  {block.split('\n').map((line, i) => (
                    <p key={i} className={`${line.includes(':') && !line.includes('- **') && i===0 ? 'font-bold text-white text-base mb-2 border-b border-[#1e3a8a]/30 pb-2' : 'mb-1'}`}>
                      {line.startsWith('- **') ? (
                        <span dangerouslySetInnerHTML={{__html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#06b6d4]">$1</strong>')}} />
                      ) : (
                        <span dangerouslySetInnerHTML={{__html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')}} />
                      )}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* === ROI CLOUD COST COMPARISON === */}
          <div className="card border-[#1e3a8a]/30 bg-gradient-to-br from-[#050b14] to-[#0b1820]">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Análisis ROI vs Alternativas Cloud</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Costos anuales de referencia para {roi.gpusNeeded} GPU(s) y {users.toLocaleString()} usuarios concurrentes. ProxDeep aparece con la tarifa fija anual contratada.
            </p>

            {/* Comparison bars */}
            <div className="space-y-3 mb-6">
              {roi.chartItems.map(({ label, sublabel, annual, highlight }) => {
                const pct = Math.max(4, Math.round((annual / roi.maxVal) * 100));
                const color = highlight ? 'bg-emerald-500' : 'bg-slate-500';
                return (
                  <div key={label} className={`p-3 rounded-xl ${highlight ? 'bg-emerald-900/20 border border-emerald-700/40' : 'bg-[#0b1426]/80 border border-[#1e3a8a]/30'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className={`text-sm font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
                          {label}{highlight ? ' — menor costo' : ''}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sublabel}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className={`text-base font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
                          ${annual.toLocaleString('en-US')}
                        </p>
                        <p className="text-[10px] text-slate-500">USD/año</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className={`${color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Savings summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-4 text-center">
                <Zap className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-emerald-400">{roi.savingsVsBestCloud}%</p>
                <p className="text-xs text-slate-400 mt-1">Ahorro vs mejor alternativa cloud</p>
                <p className="text-[11px] text-emerald-500 font-bold mt-1">
                  +${roi.annualSavingsUSD.toLocaleString('en-US')} USD recuperados al año
                </p>
              </div>
              <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4 text-center">
                <Cloud className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-400">{roi.savingsVsOpenAI > 0 ? roi.savingsVsOpenAI : 0}%</p>
                <p className="text-xs text-slate-400 mt-1">Ahorro vs OpenAI API (GPT-4o)</p>
                <p className="text-[11px] text-purple-400 font-bold mt-1">
                  Sin "Impuesto al Éxito" por tokens
                </p>
              </div>
            </div>

            <p className="text-[10px] text-slate-600 mt-4 text-center">
              Precios de referencia: AWS g5.xlarge $1.006/hr, AWS Reserved $0.60/hr, Azure NCas_T4_v3 $0.752/hr,
              Azure NC24ads_A100_v4 $3.67/hr. Fuente: AWS/Azure Pricing (2025). ProxDeep incluye plataforma, SMLs y soporte.
            </p>
          </div>

          {/* Accept / Reject Action Area */}
          {proposal.status === 'pending' && (
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-900/10 shadow-[0_0_40px_rgba(16,185,129,0.05)] text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
              <h3 className="text-xl font-bold text-white mb-2">Autorizar Despliegue</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-lg mx-auto">
                Al aceptar, nuestro orquestador automatizado comenzará a provisionar tu hardware y generar tus API Keys soberanas de inmediato.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => updateStatus('rejected')}
                  disabled={updating}
                  className="px-6 py-3 rounded-xl border border-red-900 text-red-400 hover:bg-red-900/30 font-bold transition-all disabled:opacity-50"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => updateStatus('accepted')}
                  disabled={updating}
                  className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="h-5 w-5" /> {updating ? 'Procesando cluster...' : 'Aceptar y Activar Nodo'}
                </button>
              </div>
            </div>
          )}

          {proposal.status === 'accepted' && (
            <div className="p-6 rounded-2xl border border-[#06b6d4]/30 bg-[#06b6d4]/10 shadow-[0_0_30px_rgba(6,182,212,0.1)] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Check className="h-5 w-5 text-[#06b6d4]" /> Ecosistema Activo</h3>
                <p className="text-sm text-slate-400">Tus recursos físicos y llaves API ya están disponibles.</p>
              </div>
              <Link to="/workspace" className="btn-primary shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                Entrar al Centro de Control →
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ClientProposal;
