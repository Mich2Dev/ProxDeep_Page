import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Server, Cpu, Database, Shield, Send, Key, Eye, EyeOff, Terminal, Activity, RefreshCw, Command, PlayCircle, Zap, Code } from 'lucide-react';

const Workspace = () => {
  const { fetchWithAuth, API_URL, user } = useAuth();
  const [smls, setSmls] = useState([]);
  const [proposal, setProposal] = useState(null);
  const [selectedSml, setSelectedSml] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulated metrics
  const [cpu, setCpu] = useState(14);
  const [tokensPerSec, setTokensPerSec] = useState(38);
  const [nodeOnline, setNodeOnline] = useState(true);

  // API Key State
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState('sk_prox_live_9f8d1c92a5b6e4d7');

  // Chat playground state
  const [messages, setMessages] = useState([
    { sender: 'system', text: 'Conexión local P2P establecida. VPC Privada Activa.' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/smls`),
          fetchWithAuth(`${API_URL}/proposals`),
        ]);
        const sData = await sRes.json();
        const pData = await pRes.json();
        
        const accepted = pData.find((p) => p.status === 'accepted');
        setProposal(accepted);

        if (accepted && accepted.recommended_sml_ids) {
          let ids = [];
          try { ids = JSON.parse(accepted.recommended_sml_ids); } catch(e) { ids = accepted.recommended_sml_ids; }
          const activeSmls = sData.filter(s => ids.includes(s.id));
          setSmls(activeSmls);
          if (activeSmls.length > 0) setSelectedSml(activeSmls[0]);
        }
      } catch (err) {
        console.error('Error loading workspace:', err);
      } finally {
        setLoading(false);
      }
    };
    load();

    const interval = setInterval(() => {
      if (nodeOnline) {
        setCpu(Math.floor(Math.random() * 15) + 10);
        setTokensPerSec(Math.floor(Math.random() * 5) + 35);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [API_URL, fetchWithAuth, nodeOnline]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !nodeOnline || isTyping || !selectedSml) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    // Call real backend
    try {
      const res = await fetchWithAuth(`${API_URL}/bot/workspace-chat`, {
        method: 'POST',
        body: JSON.stringify({
          message: currentInput,
          sml_name: selectedSml.name,
          sml_description: selectedSml.description
        })
      });
      
      const data = await res.json();
      const reply = data.reply || "Error de comunicación en el nodo local.";

      setIsTyping(false);
      const botMsgId = Date.now() + 1;
      setMessages((m) => [...m, { id: botMsgId, sender: 'bot', text: '' }]);
      setStreamingMessageId(botMsgId);
      
      setCpu(Math.floor(Math.random() * 40) + 55);
      
      // Stream text effect
      let charIndex = 0;
      const streamInterval = setInterval(() => {
        setMessages((prevMsgs) => 
          prevMsgs.map(m => m.id === botMsgId ? { ...m, text: reply.substring(0, charIndex + 1) } : m)
        );
        charIndex += 2;
        
        setTokensPerSec(Math.floor(Math.random() * 20) + 40);

        if (charIndex >= reply.length) {
          clearInterval(streamInterval);
          setStreamingMessageId(null);
          setCpu(Math.floor(Math.random() * 15) + 10);
        }
      }, 10);
      
    } catch(err) {
      setIsTyping(false);
      setMessages((m) => [...m, { id: Date.now(), sender: 'bot', text: "Error de red en la VPC." }]);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="h-8 w-8 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!proposal) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="card bg-[#0b1426] border-[#1e3a8a]/50">
        <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Workspace Inactivo</h2>
        <p className="text-slate-400 mb-6">Necesitas aprobar una propuesta de arquitectura para desplegar tu nodo soberano.</p>
        <button onClick={() => window.location.href = '/diagnostic'} className="btn-primary">Ir al Diagnóstico</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">

      {/* OS Header */}
      <div className="bg-[#0b1426] border border-[#1e3a8a]/50 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_0_40px_rgba(6,182,212,0.05)]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Server className={`h-10 w-10 ${nodeOnline ? 'text-[#06b6d4]' : 'text-slate-600'}`} />
            {nodeOnline && <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#06b6d4] rounded-full animate-ping"></span>}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block h-2 w-2 rounded-full ${nodeOnline ? 'bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]' : 'bg-slate-600'}`}></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{nodeOnline ? 'Nodo En Línea' : 'Nodo Apagado'}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ProxDeep OS Control Center</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Endpoint: https://node-sov-01.local.vpc</p>
          </div>
        </div>
        
        {/* Real-time Telemetry Mini-Dashboard */}
        <div className="flex items-center gap-6 bg-[#050b14] border border-[#1e3a8a]/30 p-3 rounded-xl">
          <div className="flex items-center gap-3 pr-6 border-r border-[#1e3a8a]/50">
            <Activity className={`h-5 w-5 ${nodeOnline ? 'text-emerald-400' : 'text-slate-600'}`} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Carga CPU</p>
              <p className="text-lg font-mono font-bold text-white">{nodeOnline ? `${cpu}%` : '0%'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pr-6 border-r border-[#1e3a8a]/50">
            <Database className={`h-5 w-5 ${nodeOnline ? 'text-purple-400' : 'text-slate-600'}`} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">VRAM Uso</p>
              <p className="text-lg font-mono font-bold text-white">{nodeOnline ? '18.4GB' : '0GB'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap className={`h-5 w-5 ${nodeOnline ? 'text-amber-400' : 'text-slate-600'}`} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Throughput</p>
              <p className="text-lg font-mono font-bold text-white">{nodeOnline ? `${tokensPerSec} T/s` : '0 T/s'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setNodeOnline(!nodeOnline)}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${nodeOnline ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'}`}
        >
          <RefreshCw className="h-4 w-4" /> {nodeOnline ? 'Apagar Nodo' : 'Encender Nodo'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: API & Launchers */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* API Gateway Panel */}
          <div className="bg-[#0b1426] border border-[#1e3a8a]/50 p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#06b6d4]/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-5 w-5 text-[#06b6d4]" />
              <h2 className="text-base font-bold text-white">API Gateway Soberano</h2>
            </div>
            
            <p className="text-xs text-slate-400 mb-2">Llave Maestra de Acceso (Bearer Token)</p>
            <div className="flex gap-2 mb-4">
              <div className="flex-1 bg-[#050b14] border border-[#1e3a8a]/50 rounded-lg flex items-center px-3">
                <code className="text-sm font-mono text-[#06b6d4] tracking-wider truncate">
                  {showKey ? apiKey : 'sk_prox_••••••••••••••••••••••••'}
                </code>
              </div>
              <button onClick={() => setShowKey(!showKey)} className="p-2.5 bg-[#1e3a8a]/30 hover:bg-[#1e3a8a]/60 text-slate-300 rounded-lg border border-[#1e3a8a]/50 transition-colors">
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="bg-[#050b14] rounded-lg border border-[#1e3a8a]/30 overflow-hidden">
              <div className="bg-[#1e3a8a]/20 px-3 py-1.5 flex items-center gap-2 border-b border-[#1e3a8a]/30">
                <Terminal className="h-3 w-3 text-slate-400" />
                <span className="text-[10px] font-mono text-slate-400 uppercase">Ejemplo cURL</span>
              </div>
              <pre className="p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`curl https://node-sov-01/v1/chat \\
  -H "Auth: Bearer ${showKey ? apiKey : 'sk_prox_***'}" \\
  -d '{"model": "${selectedSml?.name || 'llama-3'}", "prompt": "..."}'`}
              </pre>
            </div>
            <button className="w-full mt-4 py-2 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">
              Regenerar Llave
            </button>
          </div>

          {/* Ecosystem Launchers */}
          <div className="bg-[#0b1426] border border-[#1e3a8a]/50 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Command className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Lanzadores del Ecosistema</h2>
            </div>
            
            <div className="space-y-3">
              <button className="w-full p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 flex items-center gap-4 transition-all group">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                  <PlayCircle className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Chatbot IDE Web</p>
                  <p className="text-[11px] text-indigo-300/70 mt-0.5">Interfaz gráfica para empleados no técnicos</p>
                </div>
              </button>

              <button className="w-full p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center gap-4 transition-all group">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                  <Server className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Orquestador de Equipos</p>
                  <p className="text-[11px] text-emerald-300/70 mt-0.5">Gestión de agentes y flujos de trabajo</p>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: IDE Playground */}
        <div className="lg:col-span-8 flex flex-col bg-[#050b14] border border-[#1e3a8a]/50 rounded-2xl shadow-lg overflow-hidden h-[750px]">
          
          {/* Playground Header */}
          <div className="bg-[#0b1426] border-b border-[#1e3a8a]/50 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="h-5 w-5 text-[#06b6d4]" /> Test Playground
              </h2>
              <p className="text-xs text-slate-400 mt-1">Prueba tus modelos en memoria antes de integrarlos a producción.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-[#050b14] border border-[#1e3a8a]/50 rounded-lg p-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold pl-2">SML Activo:</span>
              <select
                className="bg-transparent text-xs text-[#06b6d4] font-bold px-2 py-1 focus:outline-none cursor-pointer"
                value={selectedSml?.id || ''}
                onChange={(e) => setSelectedSml(smls.find((s) => s.id === parseInt(e.target.value)))}
              >
                {smls.length === 0 && <option value="">Sin Modelos</option>}
                {smls.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Playground Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative">
            {!nodeOnline && (
              <div className="absolute inset-0 bg-[#050b14]/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <Server className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">Nodo Apagado</p>
                  <p className="text-xs text-slate-500">Enciende el nodo para interactuar con la VRAM.</p>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={m.id || i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-[#1e3a8a]/40 border border-[#1e3a8a] text-white rounded-tr-none'
                    : m.sender === 'system'
                    ? 'bg-[#0b1426] border border-[#1e3a8a]/30 text-slate-400 text-xs italic w-full text-center'
                    : 'bg-[#0b1426] border border-[#1e3a8a]/50 text-slate-300 rounded-tl-none whitespace-pre-wrap'
                }`}>
                  {m.sender === 'bot' && <div className="text-[10px] text-[#06b6d4] uppercase font-bold mb-1 border-b border-[#1e3a8a]/30 pb-1 inline-flex items-center gap-1"><Cpu className="h-3 w-3"/> {selectedSml?.name}</div>}
                  <div className={m.sender === 'bot' ? 'mt-1' : ''}>{m.text}</div>
                  {streamingMessageId === m.id && <span className="inline-block w-2 h-4 ml-1 bg-[#06b6d4] animate-pulse align-middle"></span>}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-[#0b1426] border border-[#1e3a8a]/50 rounded-2xl rounded-tl-none px-5 py-3.5">
                   <div className="flex gap-1.5 items-center h-full">
                     {[0, 150, 300].map((d) => (
                       <span key={d} className="h-2 w-2 bg-[#06b6d4] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}></span>
                     ))}
                   </div>
                 </div>
              </div>
            )}
          </div>

          {/* Playground Input */}
          <div className="p-4 bg-[#0b1426] border-t border-[#1e3a8a]/50">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                className="w-full bg-[#050b14] border border-[#1e3a8a]/80 text-white rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] placeholder-slate-500 shadow-inner"
                placeholder={nodeOnline ? 'Escribe tu consulta para probar la inferencia local...' : 'Enciende el nodo primero...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!nodeOnline}
              />
              <button 
                type="submit" 
                disabled={!nodeOnline || !input.trim()} 
                className="absolute right-2 p-2 bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] text-white rounded-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> Las pruebas se ejecutan en entorno sandbox cifrado.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Workspace;
