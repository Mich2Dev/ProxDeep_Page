import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Circle, AlertCircle, ArrowRight, Server, Cpu, FileText, DollarSign, Zap, Shield, Database, TrendingUp, Calendar, Users, Lock } from 'lucide-react';
import { buildCloudRoiComparison } from '../utils/cloudRoi';

const STATUS_LABELS = {
  draft: 'Borrador',
  submitted: 'Enviado',
  reviewed: 'En Revisión',
  proposal_generated: 'Propuesta Lista',
};

const PROPOSAL_STATUS_LABELS = {
  pending: 'Pendiente de Firma',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
};

const NODE_COLORS = {
  Starter: 'text-green-400 border-green-700 bg-green-900/20',
  Enterprise: 'text-blue-400 border-blue-700 bg-blue-900/20',
  Sovereign: 'text-purple-400 border-purple-700 bg-purple-900/20',
  Custom: 'text-orange-400 border-orange-700 bg-orange-900/20',
};

const SENSITIVITY_BADGE = {
  low:      { label: 'Baja', color: 'text-green-400 bg-green-900/30 border-green-800' },
  medium:   { label: 'Media', color: 'text-yellow-400 bg-yellow-900/30 border-yellow-800' },
  high:     { label: 'Alta', color: 'text-orange-400 bg-orange-900/30 border-orange-800' },
  critical: { label: 'Crítica (Air-Gapped)', color: 'text-red-400 bg-red-900/30 border-red-800' },
};

const ClientDashboard = () => {
  const { fetchWithAuth, API_URL, user } = useAuth();
  const [needs, setNeeds] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [smls, setSmls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [nRes, pRes, sRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/client-needs`),
          fetchWithAuth(`${API_URL}/proposals`),
          fetchWithAuth(`${API_URL}/smls`),
        ]);
        setNeeds(await nRes.json());
        setProposals(await pRes.json());
        setSmls(await sRes.json());
      } catch {
        setError('No se pudo cargar la información del panel.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeNeed = needs.find(n => {
    const nProps = proposals.filter(p => p.client_need_id === n.id);
    if (nProps.length === 0) return true;
    if (nProps.some(p => p.status !== 'rejected')) return true;
    return false;
  });

  const latestNeed = activeNeed;
  const needProposals = latestNeed ? proposals.filter((p) => p.client_need_id === latestNeed.id) : [];
  const proposal = needProposals.find((p) => p.status !== 'rejected');

  const parseUseCases = (uc) => {
    try {
      const parsed = typeof uc === 'string' ? JSON.parse(uc) : uc;
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) { return []; }
  };

  const parseIds = (ids) => {
    try {
      const parsed = typeof ids === 'string' ? JSON.parse(ids) : ids;
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };

  let stage = 1;
  if (latestNeed) {
    if (proposal?.status === 'accepted') stage = 4;
    else if (proposal) stage = 3;
    else stage = 2;
  }

  const users = latestNeed?.expected_users_concurrent || 0;
  const gpusNeeded = Math.max(1, Math.ceil(users / 50));
  const vramNeeded = gpusNeeded * 24;
  const totalCost = proposal ? parseFloat(proposal.estimated_fixed_cost_usd) : 0;
  const costPerUser = users > 0 && totalCost > 0 ? (totalCost / users).toFixed(2) : null;
  const amortMonths = proposal?.estimated_amortization_months;
  const nodoType = proposal?.recommended_nodo_type;
  const nodoColor = NODE_COLORS[nodoType] || NODE_COLORS['Enterprise'];
  const sensitivity = latestNeed?.data_sensitivity || 'medium';
  const sensBadge = SENSITIVITY_BADGE[sensitivity] || SENSITIVITY_BADGE['medium'];

  const roi = proposal ? buildCloudRoiComparison(users, totalCost) : null;
  const savingsVsCloud = roi?.savingsVsBestCloud ?? 0;
  const annualSavingsUSD = roi?.annualSavingsUSD ?? 0;

  const proposalSmlIds = proposal ? parseIds(proposal.recommended_sml_ids) : [];
  const proposalSmls = smls.filter(s => proposalSmlIds.includes(s.id));

  const useCases = parseUseCases(latestNeed?.use_cases_priority);

  const resolveLabel = (uc) => {
    if (uc === 'tool_api') return { label: 'API Key Directa', icon: '🔑' };
    if (uc === 'tool_ide') return { label: 'Chatbot IDE Web', icon: '💬' };
    if (uc === 'tool_orchestrator') return { label: 'Orquestador de Equipos', icon: '🎛️' };
    const matched = smls.find(s => s.id === uc);
    if (matched) return { label: matched.name, icon: '🤖', isModel: true };
    return null;
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="h-8 w-8 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="card flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <p className="text-xs font-bold text-[#06b6d4] uppercase tracking-widest mb-1">Dashboard Cliente</p>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Hola, {user.company_name || user.email}</h1>
            <p className="text-sm text-slate-400 mt-1">Estado del despliegue de tu Nodo de IA Soberana.</p>
          </div>
          {stage === 1 && (
            <Link to="/diagnostic" className="btn-primary inline-flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center">
              Iniciar Diagnóstico <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {stage === 3 && proposal?.status === 'pending' && (
            <Link to={`/proposal/${proposal.id}`} className="inline-flex items-center gap-2 shrink-0 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] w-full sm:w-auto justify-center">
              Revisar y Firmar Propuesta <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {stage === 4 && (
            <Link to="/workspace" className="btn-primary inline-flex items-center gap-2 shrink-0 bg-indigo-600 hover:bg-indigo-700 border-none w-full sm:w-auto justify-center">
              <Server className="h-4 w-4" /> Entrar al Workspace
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Metrics Banner */}
      {proposal && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="card bg-gradient-to-br from-[#0b1f3a] to-[#050b14] border-[#06b6d4]/30 text-center p-3 sm:p-5">
            <DollarSign className="h-5 w-5 text-[#06b6d4] mx-auto mb-1 sm:mb-2" />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Inversión Total</p>
            <p className="text-lg sm:text-xl font-bold text-white">${totalCost.toLocaleString('en-US', {minimumFractionDigits: 0})} <span className="text-xs sm:text-sm font-normal text-slate-400">USD</span></p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">/ Año</p>
          </div>
          <div className="card bg-gradient-to-br from-[#0b1f3a] to-[#050b14] border-[#06b6d4]/30 text-center p-3 sm:p-5">
            <TrendingUp className="h-5 w-5 text-emerald-400 mx-auto mb-1 sm:mb-2" />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Costo / Usuario</p>
            <p className="text-lg sm:text-xl font-bold text-white">${costPerUser} <span className="text-xs sm:text-sm font-normal text-slate-400">USD</span></p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">/ usuario al año</p>
          </div>
          <div className="card bg-gradient-to-br from-[#0b1f3a] to-[#050b14] border-[#06b6d4]/30 text-center p-3 sm:p-5">
            <Calendar className="h-5 w-5 text-yellow-400 mx-auto mb-1 sm:mb-2" />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Amortización</p>
            <p className="text-lg sm:text-xl font-bold text-white">{amortMonths}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">meses</p>
          </div>
          <div className={`card border text-center p-3 sm:p-5 ${nodoColor}`}>
            <Server className="h-5 w-5 mx-auto mb-1 sm:mb-2" />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Tipo de Nodo</p>
            <p className="text-lg sm:text-xl font-bold">{nodoType}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Arquitectura</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {latestNeed && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">

          {/* Left: Diagnostic Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-[#06b6d4]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Diagnóstico</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Problema</p>
                  <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-[#06b6d4]/40 pl-3">
                    "{latestNeed.problem_description}"
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/50">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Usuarios Conc.</p>
                    <p className="text-lg font-bold text-[#06b6d4]">{users.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Privacidad</p>
                    <span className={`inline-block text-xs font-bold px-2 py-1 rounded-md border ${sensBadge.color}`}>
                      {sensBadge.label}
                    </span>
                  </div>
                </div>
                {useCases.length > 0 && (
                  <div className="pt-2 border-t border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Herramientas & Modelos</p>
                    <div className="flex flex-wrap gap-1.5">
                      {useCases.map((uc, i) => {
                        const info = resolveLabel(uc);
                        if (!info) return null;
                        return (
                          <div key={i} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ${info.isModel ? 'bg-emerald-900/20 border border-emerald-800/50 text-emerald-400' : 'bg-slate-800/60 border border-slate-700/50 text-slate-300'}`}>
                            <span>{info.icon}</span>
                            <span className="font-medium">{info.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ruta del Despliegue */}
            <div className="card border-slate-700">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Ruta del Despliegue</h2>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  {stage >= 2 ? <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" /> : <Circle className="h-5 w-5 mt-0.5 shrink-0 text-[#06b6d4]" />}
                  <div>
                    <p className={`text-sm font-semibold ${stage >= 2 ? 'text-white' : 'text-slate-500'}`}>1. Diagnóstico de Necesidades</p>
                    {latestNeed && <span className="inline-block mt-1 text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{STATUS_LABELS[latestNeed.status]}</span>}
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  {stage >= 4 ? <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" /> : <Circle className={`h-5 w-5 mt-0.5 shrink-0 ${stage === 2 || stage === 3 ? 'text-[#06b6d4]' : 'text-slate-600'}`} />}
                  <div>
                    <p className={`text-sm font-semibold ${stage >= 3 ? 'text-white' : 'text-slate-500'}`}>2. Propuesta Técnica y Comercial</p>
                    {proposal?.status === 'pending' && (
                      <Link to={`/proposal/${proposal.id}`} className="inline-block mt-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors">
                        Revisar y Firmar →
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Circle className={`h-5 w-5 mt-0.5 shrink-0 ${stage === 4 ? 'text-[#06b6d4]' : 'text-slate-600'}`} />
                  <div>
                    <p className={`text-sm font-semibold ${stage >= 4 ? 'text-white' : 'text-slate-500'}`}>3. Nodo de IA Soberana Activo</p>
                    {stage !== 4 && <span className="text-xs text-slate-600">Disponible tras aceptar la propuesta</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Technical Specs */}
          <div className="lg:col-span-3 space-y-4">

            {/* Hardware Specs */}
            {proposal && (
              <div className="card border-[#1e3a8a]/50 bg-gradient-to-br from-[#050b14] to-[#0b1426]">
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <Cpu className="h-5 w-5 text-[#06b6d4]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Infraestructura Hardware Asignada</h2>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-5">
                  <div className="bg-[#06b6d4]/5 border border-[#06b6d4]/20 rounded-xl p-2 sm:p-4 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-[#06b6d4]">{gpusNeeded}</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase mt-1">GPUs Dedicadas</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5 hidden sm:block">NVIDIA L4 / A100</p>
                  </div>
                  <div className="bg-[#06b6d4]/5 border border-[#06b6d4]/20 rounded-xl p-2 sm:p-4 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-[#06b6d4]">{vramNeeded}GB</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase mt-1">VRAM Total</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5 hidden sm:block">Zero-Swap</p>
                  </div>
                  <div className="bg-[#06b6d4]/5 border border-[#06b6d4]/20 rounded-xl p-2 sm:p-4 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-[#06b6d4]">&lt;150ms</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase mt-1">Latencia</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5 hidden sm:block">Garantizada</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { icon: <Zap className="h-4 w-4 text-yellow-400 shrink-0" />, title: `${(users * 25).toLocaleString()} T/s`, sub: 'Throughput de Inferencia' },
                    { icon: <Shield className="h-4 w-4 text-emerald-400 shrink-0" />, title: 'AES-256 / TLS 1.3', sub: 'Cifrado End-to-End' },
                    { icon: <Lock className="h-4 w-4 text-purple-400 shrink-0" />, title: 'SOC2 · ISO 27001', sub: 'Certificaciones' },
                    { icon: <Users className="h-4 w-4 text-[#06b6d4] shrink-0" />, title: `${users.toLocaleString()} Conc.`, sub: 'Usuarios Simultáneos' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2.5">
                      {item.icon}
                      <div>
                        <p className="text-xs font-bold text-white">{item.title}</p>
                        <p className="text-[10px] text-slate-500">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cloud ROI */}
            {proposal && (
              <div className="card border-emerald-800/30 bg-gradient-to-br from-[#020d08] to-[#0a1f14]">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">ROI vs Cloud</h2>
                </div>
                <div className="space-y-2.5 mb-4">
                  {roi.chartItems.map(({ label, annual, highlight }) => {
                    const pct = Math.max(4, Math.round((annual / roi.maxVal) * 100));
                    const color = highlight ? 'bg-emerald-500' : 'bg-slate-500';
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={highlight ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            {highlight ? `${label} — menor costo` : label}
                          </span>
                          <span className={highlight ? 'text-emerald-400 font-bold' : 'text-slate-300'}>${annual.toLocaleString('en-US')} USD/yr</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-emerald-900/30 border border-emerald-800/50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-emerald-400">{savingsVsCloud}%</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">vs AWS Reserved</p>
                  </div>
                  <div className="flex-1 bg-emerald-900/30 border border-emerald-800/50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-emerald-400">${annualSavingsUSD > 0 ? annualSavingsUSD.toLocaleString('en-US') : '0'} <span className="text-sm font-normal">USD</span></p>
                    <p className="text-[10px] text-slate-500 mt-0.5">ahorrados / año</p>
                  </div>
                </div>
                <Link to={`/proposal/${proposal.id}`} className="flex items-center justify-center gap-1 mt-3 text-xs text-emerald-400 hover:underline">
                  Ver análisis completo →
                </Link>
              </div>
            )}

            {/* SML Cards */}
            {proposalSmls.length > 0 && (
              <div className="card border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Modelos Especializados (SMLs)</h2>
                </div>
                <div className="space-y-3">
                  {proposalSmls.map(sml => (
                    <div key={sml.id} className="flex gap-3 items-start bg-emerald-900/10 border border-emerald-800/40 rounded-xl p-3 sm:p-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center shrink-0 text-sm">🤖</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white leading-tight">{sml.name}</p>
                        <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 rounded px-1.5 py-0.5 mt-1">{sml.category}</span>
                        {sml.description && <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{sml.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proposal History */}
            {proposals.length > 0 && (
              <div className="card border-slate-700">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Historial de Propuestas</h2>
                <div className="space-y-2">
                  {proposals.map(p => (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-800/50 px-3 sm:px-4 py-3 rounded-xl border border-slate-700/50 gap-2 sm:gap-0">
                      <div>
                        <p className="text-sm text-white font-medium">
                          Nodo {p.recommended_nodo_type || '–'} · ${parseFloat(p.estimated_fixed_cost_usd || 0).toLocaleString('en-US', {minimumFractionDigits: 0})} USD
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(p.created_at).toLocaleDateString('es-ES', {day:'2-digit', month:'long', year:'numeric'})}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${p.status === 'accepted' ? 'bg-emerald-900/50 text-emerald-400' : p.status === 'rejected' ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/50 text-amber-400'}`}>
                          {PROPOSAL_STATUS_LABELS[p.status] || p.status}
                        </span>
                        <Link to={`/proposal/${p.id}`} className="text-xs text-[#06b6d4] hover:underline whitespace-nowrap">Ver detalle →</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!latestNeed && (
        <div className="card text-center py-12 sm:py-16 border-dashed border-slate-700">
          <Server className="h-10 w-10 sm:h-12 sm:w-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Aún no tienes un Nodo configurado</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto text-sm sm:text-base px-4">Comienza el diagnóstico para que nuestro sistema diseñe tu arquitectura de IA Soberana personalizada.</p>
          <Link to="/diagnostic" className="btn-primary inline-flex items-center gap-2">
            Iniciar Diagnóstico <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

    </div>
  );
};

export default ClientDashboard;
