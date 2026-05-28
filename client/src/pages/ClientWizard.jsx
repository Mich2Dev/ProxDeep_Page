import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Send, Cpu, Shield, Users, Server, Code, MessageSquare, Briefcase, Database, Lock, Globe, HardDrive, Sparkles } from 'lucide-react';

const ClientWizard = () => {
  const { fetchWithAuth, API_URL } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState(null);

  // Architecture State
  const [problemDescription, setProblemDescription] = useState('');
  const [expectedUsers, setExpectedUsers] = useState(50);
  const [sensitivity, setSensitivity] = useState('high');
  const [aiSelectedSmls, setAiSelectedSmls] = useState([]);
  const [userTypes, setUserTypes] = useState({ devs: false, employees: true, teams: false });
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    const loadExisting = async () => {
      try {
        const nRes = await fetchWithAuth(`${API_URL}/client-needs`);
        if (nRes.ok) {
          const needs = await nRes.json();
          if (needs.length > 0) {
            const activeNeed = needs[needs.length - 1];
            if(activeNeed.status !== 'rejected') {
              setProblemDescription(activeNeed.problem_description || '');
              setExpectedUsers(activeNeed.expected_users_concurrent || 50);
              setSensitivity(activeNeed.data_sensitivity || 'high');
              
              try {
                const uc = typeof activeNeed.use_cases_priority === 'string' 
                  ? JSON.parse(activeNeed.use_cases_priority) 
                  : activeNeed.use_cases_priority;
                
                if (Array.isArray(uc)) {
                  setUserTypes({
                    devs: uc.includes('tool_api'),
                    employees: uc.includes('tool_ide'),
                    teams: uc.includes('tool_orchestrator')
                  });
                }
              } catch(e) {}
              
              setReadOnly(true);
            }
          }
        }
      } catch (err) {}
    };
    loadExisting();
  }, [API_URL, fetchWithAuth]);

  const handleStartOver = () => {
    setReadOnly(false);
    setProblemDescription('');
    setAiSelectedSmls([]);
  };

  // Telemetry Calculations
  const gpusNeeded = Math.max(1, Math.ceil(expectedUsers / 50));
  const vramNeeded = gpusNeeded * 24;
  const isAirGapped = sensitivity === 'critical';

  const handleUserTypeToggle = (type) => {
    if (readOnly) return;
    setUserTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleAutoSuggest = async () => {
    if (!problemDescription.trim()) {
      setError("Escribe primero un contexto para que la IA lo analice."); return;
    }
    setSuggesting(true);
    setError(null);
    try {
      const res = await fetchWithAuth(`${API_URL}/bot/suggest-architecture`, {
        method: 'POST',
        body: JSON.stringify({ description: problemDescription })
      });
      if (!res.ok) throw new Error("Fallo al contactar al Arquitecto de IA.");
      const data = await res.json();
      
      setExpectedUsers(data.expected_users || 50);
      setSensitivity(data.sensitivity || 'high');
      setAiSelectedSmls(data.recommended_smls || []);
      
    } catch(err) {
      setError(err.message);
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      setError('Por favor describe tu necesidad de infraestructura.'); return;
    }
    setLoading(true);
    
    const requestedTools = [];
    if(userTypes.devs) requestedTools.push("tool_api");
    if(userTypes.employees) requestedTools.push("tool_ide");
    if(userTypes.teams) requestedTools.push("tool_orchestrator");

    const finalUseCases = [...aiSelectedSmls.map(s => String(s.id)), ...requestedTools];

    try {
      const res = await fetchWithAuth(`${API_URL}/client-needs`, {
        method: 'POST',
        body: JSON.stringify({
          problem_description: problemDescription,
          expected_users_concurrent: expectedUsers,
          data_sensitivity: sensitivity,
          use_cases_priority: finalUseCases,
          current_ia_pain_points: "Diseño generado por el Arquitecto Visual.",
        }),
      });
      if (!res.ok) throw new Error('Error al enviar diseño arquitectónico.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4 sm:py-8 flex flex-col" style={{minHeight: 'calc(100vh - 56px)'}}>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2 sm:gap-3">
          <Server className="h-6 w-6 sm:h-8 sm:w-8 text-[#06b6d4] shrink-0" />
          Arquitecto de Infraestructura
        </h1>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mt-1">
          <p className="text-sm sm:text-base text-slate-400">Diseña tu nodo de cómputo en tiempo real.</p>
          {readOnly && (
            <button 
              onClick={handleStartOver}
              className="text-xs bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 border border-[#06b6d4]/30 text-[#06b6d4] px-4 py-2 rounded-lg font-bold transition-all self-start sm:self-auto shrink-0"
            >
              Iniciar Nuevo Diagnóstico
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-8">
        
        {/* LEFT PANEL: Controls */}
        <div className="w-full lg:w-[45%] flex flex-col gap-4 sm:gap-6 pb-4 sm:pb-10">
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {/* Block 1: Context */}
          <div className="shrink-0 bg-[#0b1426] border border-[#1e3a8a]/50 p-5 rounded-2xl shadow-lg relative">
            <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide text-[#06b6d4]">1. Contexto Operativo</label>
            <textarea
              rows={3} disabled={readOnly}
              className="input-field resize-none bg-[#050b14] border-[#1e3a8a] text-sm mb-3"
              placeholder="Ej: Necesitamos procesar historias clínicas..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
            />
            <button 
              type="button" 
              onClick={handleAutoSuggest} 
              disabled={readOnly || suggesting}
              className="w-full py-2 bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 border border-[#06b6d4]/50 rounded-lg text-[#06b6d4] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${suggesting ? 'animate-spin' : ''}`} />
              {suggesting ? 'Analizando Requerimientos...' : 'Asistente IA: Generar Arquitectura Automáticamente'}
            </button>
          </div>

          {/* Block 2: Load */}
          <div className="shrink-0 bg-[#0b1426] border border-[#1e3a8a]/50 p-5 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-[#06b6d4] uppercase tracking-wide">2. Carga Concurrente</label>
              <span className="px-3 py-1 bg-[#06b6d4]/10 text-[#06b6d4] rounded-lg font-mono font-bold">{expectedUsers} Usuarios</span>
            </div>
            <input
              type="range" min="10" max="10000" step="10" disabled={readOnly}
              className="w-full accent-[#06b6d4]"
              value={expectedUsers}
              onChange={(e) => setExpectedUsers(parseInt(e.target.value))}
            />
            <p className="text-[11px] text-slate-500 mt-2">Determina el número de GPUs dedicadas para mantener latencia sub-200ms.</p>
          </div>

          {/* Block 3: Security */}
          <div className="shrink-0 bg-[#0b1426] border border-[#1e3a8a]/50 p-5 rounded-2xl shadow-lg">
            <label className="block text-sm font-bold text-[#06b6d4] uppercase tracking-wide mb-3">3. Capa de Aislamiento</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" disabled={readOnly} onClick={() => setSensitivity('high')} className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${sensitivity !== 'critical' ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]' : 'bg-[#050b14] border-[#1e3a8a]/50 text-slate-400'}`}>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4"/> <span className="font-bold text-white text-sm">VPC Privada</span></div>
                <span className="text-[11px] opacity-80">Aislamiento por túnel VPN.</span>
              </button>
              <button type="button" disabled={readOnly} onClick={() => setSensitivity('critical')} className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${sensitivity === 'critical' ? 'bg-red-500/10 border-red-500' : 'bg-[#050b14] border-[#1e3a8a]/50 text-slate-400'}`}>
                <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-red-400"/> <span className="font-bold text-white text-sm">Air-Gapped</span></div>
                <span className="text-[11px] opacity-80">Corte físico de internet. Zero-Trust.</span>
              </button>
            </div>
          </div>

          {/* Block 4: Modules */}
          <div className="shrink-0 bg-[#0b1426] border border-[#1e3a8a]/50 p-5 rounded-2xl shadow-lg min-h-[140px]">
            <label className="block text-sm font-bold text-[#06b6d4] uppercase tracking-wide mb-3">4. Modelos Recomendados (SMLs)</label>
            {aiSelectedSmls.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-[#1e3a8a] rounded-xl text-center h-24">
                <Sparkles className="h-5 w-5 text-slate-500 mb-1" />
                <p className="text-xs text-slate-400">Usa el Asistente IA para descubrir los mejores modelos para tu caso.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {aiSelectedSmls.map((sml, idx) => (
                  <div key={idx} className="p-3 rounded-xl border bg-[#10b981]/10 border-[#10b981]/50 flex items-start gap-3">
                    <Database className="h-5 w-5 text-[#10b981] shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-white leading-tight">{sml.name}</p>
                      <p className="text-xs text-[#10b981] mt-1">{sml.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Block 5: Ecosystem */}
          <div className="shrink-0 bg-[#0b1426] border border-[#1e3a8a]/50 p-5 rounded-2xl shadow-lg">
            <label className="block text-sm font-bold text-[#06b6d4] uppercase tracking-wide mb-3">5. Interfaces de Acceso</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[#050b14] rounded-lg">
                <input type="checkbox" className="accent-[#06b6d4]" checked={userTypes.devs} onChange={() => handleUserTypeToggle('devs')} />
                <span className="text-sm text-slate-300">API Key Directa (Sustitución de OpenAI)</span>
              </label>
              <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[#050b14] rounded-lg">
                <input type="checkbox" className="accent-[#06b6d4]" checked={userTypes.employees} onChange={() => handleUserTypeToggle('employees')} />
                <span className="text-sm text-slate-300">Chatbot IDE Web (Empleados no técnicos)</span>
              </label>
              <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[#050b14] rounded-lg">
                <input type="checkbox" className="accent-[#06b6d4]" checked={userTypes.teams} onChange={() => handleUserTypeToggle('teams')} />
                <span className="text-sm text-slate-300">Orquestador de Equipos (Gestión de agentes)</span>
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Live Visual Rack */}
        <div className="w-full lg:w-[55%] bg-[#050b14] border border-[#1e3a8a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.05)] pb-4 sm:pb-10">
          
          {/* Air-Gapped Visual Effect */}
          {isAirGapped && (
            <div className="absolute inset-0 border-4 border-red-500/30 rounded-3xl pointer-events-none">
              <div className="absolute top-4 left-4 bg-red-500/20 px-3 py-1 rounded border border-red-500/50 flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-500" /> <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Aislamiento Air-Gapped Activo</span>
              </div>
            </div>
          )}

          <div className="flex-1 flex items-center justify-center relative mt-10">
            {/* Server Rack Illustration */}
            <div className={`w-full max-w-xs sm:w-80 bg-[#0b1426] border-[3px] rounded-t-xl rounded-b flex flex-col p-3 shadow-2xl transition-all duration-500 ${isAirGapped ? 'border-red-900 shadow-[0_0_50px_rgba(239,68,68,0.15)]' : 'border-[#1e3a8a] shadow-[0_0_50px_rgba(6,182,212,0.1)]'}`}>
              
              {/* Rack Header */}
              <div className="h-6 w-full flex justify-between items-center px-2 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">PROXDEEP-NODE-01</span>
              </div>

              {/* Master Node (CPU/RAM) */}
              <div className="w-full h-16 border border-[#1e3a8a] bg-[#050b14] rounded-sm mb-2 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-indigo-400" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Master Controller</p>
                    <p className="text-[10px] text-slate-500 font-mono">128 vCPU • 512GB RAM</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]"></div>
              </div>

              {/* GPU Units generated based on users */}
              <div className="space-y-1">
                {Array.from({ length: Math.min(6, gpusNeeded) }).map((_, i) => (
                  <div key={i} className="w-full h-12 border border-[#06b6d4]/40 bg-[#06b6d4]/5 rounded-sm flex items-center justify-between px-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-4 w-4 text-[#06b6d4]" />
                      <div>
                        <p className="text-[11px] font-bold text-white leading-tight">NVIDIA Tensor Core</p>
                        <p className="text-[9px] text-[#06b6d4] font-mono">24GB VRAM • 150 TFLOPS</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Justification Panel (The "Why") */}
          <div className="mt-auto bg-[#0b1426]/80 backdrop-blur border border-[#1e3a8a]/50 p-5 rounded-2xl z-10">
            <h3 className="text-sm font-bold text-white mb-3">Justificación de la Arquitectura Físca:</h3>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start">
                <Cpu className="h-4 w-4 text-[#06b6d4] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Cómputo Acelerado:</strong> Para soportar <span className="text-[#06b6d4] font-bold">{expectedUsers} peticiones simultáneas</span> con latencias sub-200ms, hemos aprovisionado <strong className="text-[#06b6d4]">{gpusNeeded} aceleradores gráficos ({vramNeeded}GB VRAM total)</strong>. Esto evita las colas de espera típicas de APIs comerciales.
                </p>
              </li>
              <li className="flex gap-3 items-start">
                <Shield className={`h-4 w-4 shrink-0 mt-0.5 ${isAirGapped ? 'text-red-400' : 'text-[#0ea5e9]'}`} />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Aislamiento de Datos:</strong> {isAirGapped ? 'Al seleccionar perfil Crítico, el clúster se desacopla físicamente de redes externas. Cero vulnerabilidad de red.' : 'El tráfico viaja por una Virtual Private Cloud encriptada (AES-256). Tus datos no entrenan modelos externos.'}
                </p>
              </li>
              {aiSelectedSmls.length > 0 && (
                <li className="flex gap-3 items-start">
                  <Database className="h-4 w-4 text-[#10b981] shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Modelos Inyectados en VRAM:</strong> Al alojar estos modelos localmente, se elimina el costo variable (Impuesto al Éxito).
                    <ul className="mt-2 space-y-2 ml-2 border-l-2 border-[#1e3a8a] pl-2">
                      {aiSelectedSmls.map((sml, idx) => (
                        <li key={idx}><strong className="text-[#10b981]">{sml.name}:</strong> {sml.reason}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              )}
            </ul>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              {readOnly ? (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-bold transition-all bg-slate-800 text-white hover:bg-slate-700 shadow-lg"
                >
                  Volver al Dashboard
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} disabled={loading}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] text-white hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  <Send className="h-5 w-5" /> 
                  {loading ? 'Compilando Nodo...' : 'Aprobar Arquitectura y Cotizar'}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientWizard;
