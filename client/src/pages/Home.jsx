import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Lock, TrendingDown, ArrowRight, Activity, 
  Scale, Briefcase, MessagesSquare, CheckCircle2, 
  Globe, Server, ChevronDown, Database,
  Network, XCircle, Zap, PieChart, FileCode2, SlidersHorizontal, Bot, Terminal,
  AlertTriangle, Eye, Cpu, Building2, Users, BarChart3, Layers, Sparkles, Gem,
  Box, Key, FileText, HardDrive, MonitorCheck, Instagram, Linkedin, Twitter, Mail, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const isAutoPlayingRef = useRef(true);
  
  const bgRef1 = useRef(null);
  const bgRef2 = useRef(null);
  const bgRef3 = useRef(null);

  // Efecto de deformación espacial al hacer scroll (Optimizado a 60fps sin re-render)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          if (bgRef1.current) bgRef1.current.style.transform = `translate3d(0, ${y * 0.15}px, 0) scale(${1 + y * 0.0002}) rotate(${y * 0.02}deg)`;
          if (bgRef2.current) bgRef2.current.style.transform = `translate3d(0, ${-y * 0.1}px, 0) scale(${1 + y * 0.0003}) rotate(${-y * 0.01}deg)`;
          if (bgRef3.current) bgRef3.current.style.transform = `translate3d(${y * 0.05}px, ${-y * 0.08}px, 0) scale(${1 + y * 0.0001})`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (idx) => {
    isAutoPlayingRef.current = false;
    setActiveTab(idx);
  };

  const classifications = [
    { title: "Salud y Médico", icon: <Activity className="h-5 w-5" />, desc: "Doctores consultando historiales de pacientes sin violar leyes de protección de datos de salud (HIPAA)." },
    { title: "Despachos Legales", icon: <Scale className="h-5 w-5" />, desc: "Abogados resumiendo contratos de 500 páginas en segundos, garantizando que el documento no termine en servidores públicos." },
    { title: "Banca y Finanzas", icon: <Briefcase className="h-5 w-5" />, desc: "Analistas calculando riesgos basados en balances internos, bajo la protección estricta del secreto bancario." },
    { title: "Operaciones de Fábrica", icon: <MessagesSquare className="h-5 w-5" />, desc: "Operarios preguntando cómo reparar una máquina específica, y la IA respondiendo basándose en el manual técnico del fabricante." },
  ];

  // Rotación automática de los sectores
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAutoPlayingRef.current) {
        setActiveTab((prev) => (prev + 1) % classifications.length);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [classifications.length]);

  const comparisonData = [
    { feature: "Privacidad", public: "Datos enviados a servidores de terceros.", prox: "Instalado en sus propios servidores.", pubIcon: <XCircle className="w-5 h-5 text-slate-600 mx-auto" />, proxIcon: <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /> },
    { feature: "Costo Mensual", public: "Cobro variable por cada pregunta.", prox: "Licencia de pago único/fijo.", pubIcon: <XCircle className="w-5 h-5 text-slate-600 mx-auto" />, proxIcon: <PieChart className="w-5 h-5 text-emerald-400 mx-auto" /> },
    { feature: "Dependencia", public: "Se cae si se va el internet externo.", prox: "Funciona 100% sin conexión a internet.", pubIcon: <XCircle className="w-5 h-5 text-slate-600 mx-auto" />, proxIcon: <Zap className="w-5 h-5 text-emerald-400 mx-auto" /> },
    { feature: "Respuestas", public: "Inventa basadas en todo internet.", prox: "Basadas estrictamente en sus manuales.", pubIcon: <Globe className="w-5 h-5 text-slate-600 mx-auto" />, proxIcon: <FileCode2 className="w-5 h-5 text-cyan-400 mx-auto" /> },
    { feature: "Auditoría IT", public: "Imposible auditar qué hace la nube.", prox: "Logs completos accesibles para su TI.", pubIcon: <XCircle className="w-5 h-5 text-slate-600 mx-auto" />, proxIcon: <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /> }
  ];

  const faqs = [
    { q: "¿En qué servidores se instala esto?", a: "Podemos instalarlo en una computadora potente que ya tenga en su oficina (On-Premise), en un servidor bare-metal privado, o dentro del espacio privado que usted ya rente en AWS/Azure, siempre bloqueando la salida a internet." },
    { q: "¿De verdad funciona sin internet?", a: "Sí. Una vez instalado el modelo y conectados sus documentos, usted puede desconectar el cable del internet externo de la empresa. La IA seguirá funcionando porque procesa todo en su red local (LAN)." },
    { q: "¿Cuánto cuesta usarlo todos los días?", a: "A diferencia de las APIs públicas que cobran por 'token' (por palabra generada), ProxDeep se vende como una licencia o instalación de tarifa fija. Su equipo puede procesar un millón de documentos y el costo no sube un centavo." },
    { q: "¿El modelo usa mis datos para entrenar a otras empresas?", a: "Absolutamente no. Al estar aislado físicamente dentro de su red, es imposible que nosotros, o cualquier otra empresa, acceda a lo que usted le pregunta a su IA." },
  ];

  const featureHighlights = [
    {
      tag: "Capacidad 1: Infraestructura Base",
      icon: <Box className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />,
      title: "Motores de IA enclaustrados en su red.",
      body: "El núcleo de nuestro servicio es la soberanía de sus datos. Le proporcionamos potentes motores de Inteligencia Artificial corporativos, optimizados y encapsulados para operar exclusivamente dentro de su perímetro.",
      subtext: "A partir de aquí, el camino lo decide usted. Podemos hacer un diagnóstico inicial para evaluar sus verdaderas necesidades operativas y construir sobre esta base segura.",
      badge: "Núcleo Cognitivo",
      pattern: "left",
      accentColor: "slate",
    },
    {
      tag: "Capacidad 2: Desarrollo e Interfaces",
      icon: <MonitorCheck className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />,
      title: "Las herramientas exactas que su equipo requiera.",
      body: "Usted no está atado a un formato específico. Si necesita un chat interno, lo desplegamos. Si prefiere integrarlo vía API a su software ERP existente, lo conectamos. Si quiere que su equipo técnico desarrolle sus propias soluciones, le entregamos nuestro IDE de desarrollo.",
      subtext: "Creamos sistemas completamente funcionales o le damos las piezas para que usted arme los suyos. La Inteligencia Artificial se adapta a su flujo de trabajo, nunca al revés.",
      badge: "Soluciones a Medida",
      pattern: "right",
      accentColor: "emerald",
    },
    {
      tag: "Capacidad 3: Conexión de Datos",
      icon: <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />,
      title: "IA fundamentada en su propio conocimiento.",
      body: "Si su caso de uso lo requiere, configuramos un sistema RAG que conecta el modelo de IA con las carpetas de archivos de su corporación. La IA buscará las respuestas directamente en sus PDFs, Excels, contratos y manuales privados.",
      subtext: "Esta es una opción poderosa para empresas que desean que la IA no invente respuestas basadas en internet, sino que sus conclusiones estén ancladas estrictamente en la verdad de la empresa.",
      badge: "Lectura Estricta",
      pattern: "left",
      accentColor: "cyan",
    },
  ];

  const trustStats = [
    { icon: <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />, value: "100%", label: "Retención", sub: "Ningún archivo sale de su edificio." },
    { icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />, value: "0 ms", label: "Latencia Nube", sub: "Responde por red local rápida." },
    { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />, value: "Fijo", label: "Presupuesto", sub: "Costo estable, sin sorpresas." },
    { icon: <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />, value: "Total", label: "Auditoría", sub: "Logs completos para TI." },
  ];

  return (
    <div className="w-full overflow-x-hidden bg-[#030712] text-slate-200 font-sans selection:bg-emerald-500/20 relative">

      {/* ── AMBIENT SPACE DEFORMATION ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div ref={bgRef1} className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vh] will-change-transform">
          <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-emerald-950/5 to-transparent animate-float-ambient"></div>
        </div>
        <div ref={bgRef2} className="absolute top-[40%] right-[-20%] w-[70vw] h-[70vh] will-change-transform">
          <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-cyan-950/5 to-transparent animate-float-ambient-reverse"></div>
        </div>
        <div ref={bgRef3} className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vh] will-change-transform">
          <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/30 via-slate-900/10 to-transparent animate-float-ambient" style={{ animationDuration: '30s' }}></div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] flex items-center pt-24 pb-12 sm:pt-32 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:60px_60px] z-0"></div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="w-full lg:w-[55%] text-center lg:text-left space-y-6 sm:space-y-8">
              {/* Marketing Hook (Lead Magnet) */}
              <Link to="/register" className="inline-flex items-center gap-3 px-1.5 py-1.5 pr-5 bg-[#111] backdrop-blur-md border border-emerald-500/30 rounded-full text-[11px] sm:text-sm font-medium text-slate-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-emerald-400/50 hover:bg-[#1a1a1a] transition-all group cursor-pointer w-fit">
                <span className="bg-emerald-500 text-[#050505] px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Gratis</span>
                <span className="tracking-wide text-slate-300 group-hover:text-white transition-colors text-left leading-tight sm:leading-normal">
                  Descubra qué datos filtra su empresa a la nube pública. <br className="sm:hidden" />
                  <span className="text-emerald-400 font-semibold inline-flex items-center gap-1 mt-1 sm:mt-0">Auditoría de Riesgo de IA <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
                </span>
              </Link>
              <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-medium text-white tracking-tight leading-[1.1] font-outfit">
                Inteligencia Artificial.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-semibold">
                  Instalada en sus Servidores.
                </span>
              </h1>
              <p className="text-sm sm:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                No usamos APIs externas. Descargamos, adaptamos y desplegamos modelos de IA potentes directamente dentro de la red de su empresa. Sus documentos nunca salen de su edificio.
              </p>
              <div className="flex flex-row flex-wrap justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-800/80 rounded-full text-xs font-medium text-slate-300"><Lock className="w-3.5 h-3.5 text-slate-400" /> 100% Interno</div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-800/80 rounded-full text-xs font-medium text-slate-300"><Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Pago Fijo</div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-800/80 rounded-full text-xs font-medium text-slate-300"><Zap className="w-3.5 h-3.5 text-cyan-400" /> Sin Internet Externo</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full mt-4">
                {user ? (
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-200 text-black text-sm font-semibold rounded-xl transition-all w-full sm:w-auto shadow-md">
                    Acceder al Portal <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#030712] text-sm font-bold rounded-xl transition-all w-full sm:w-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      Agendar Demostración <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to="/smls" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0a0a0a] hover:bg-[#111] border border-slate-800 text-slate-300 text-sm font-medium rounded-xl transition-colors w-full sm:w-auto">
                      Ver Modelos Disponibles
                    </Link>
                  </>
                )}
              </div>
            </div>
            {/* Terminal Visual - Minimalist Obsidian */}
            <div className="w-full lg:w-[45%] mt-10 lg:mt-0 relative z-20 group perspective-1000">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
              <div className="relative bg-[#050505] border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden text-left backdrop-blur-xl transform transition-transform duration-500 hover:scale-[1.01]">
                <div className="flex items-center gap-3 px-5 py-3 bg-[#0a0a0a] border-b border-slate-800">
                  <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div><div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div><div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div></div>
                  <div className="flex-1 flex items-center justify-center gap-2 opacity-80">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] text-slate-400 font-mono tracking-[0.2em] uppercase">Red Local: Segura</span>
                  </div>
                </div>
                <div className="p-5 sm:p-7 space-y-5 font-mono text-[11px] sm:text-sm">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-700/50">
                      <span className="text-slate-300 text-[10px] font-semibold">CISO</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed pt-1">Auditar archivo <span className="text-emerald-400/90 font-medium bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/50">Nómina_Privada.xlsx</span> sin enviarlo a internet.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700 shadow-inner">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-medium bg-emerald-950/20 w-fit px-2.5 py-1 rounded-md border border-emerald-900/30">
                        <Terminal className="w-3 h-3" /><span className="tracking-wider">Procesando en Servidor Interno</span>
                      </div>
                      <div className="bg-[#0a0a0a] rounded-xl p-4 sm:p-5 border border-slate-800/80 text-slate-300 shadow-inner">
                        <p className="mb-3 font-sans text-xs sm:text-sm font-semibold text-white">Análisis completado en su oficina:</p>
                        <ul className="space-y-2 text-slate-400 text-[11px] sm:text-[13px] font-sans">
                          <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div><span><strong className="text-white font-medium">Filas 12-45:</strong> Inconsistencia en aportes fiscales frente a política interna.</span></li>
                          <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5"></div><span><strong className="text-white font-medium">Privacidad:</strong> Este archivo no ha salido del disco duro interno.</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section className="border-y border-slate-800/50 bg-[#050505]/80 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-12">
          <div className="grid grid-cols-3 text-center divide-x divide-slate-800/50">
            {[
              { value: '100', unit: '%', color: 'text-white', label: 'Hermetismo\nAbsoluto', desc: 'Aislado de internet.' },
              { value: '0', unit: '¢', color: 'text-emerald-400', label: 'Costo\nVariable', desc: 'No paga por preguntas.' },
              { value: '0', unit: 'ms', color: 'text-cyan-400', label: 'Falla\nde Nube', desc: 'Procesamiento en red.' },
            ].map((m, i) => (
              <div key={i} className="flex flex-col items-center px-2 sm:px-6 group">
                <span className="text-2xl sm:text-5xl font-light text-white mb-1 tracking-tight font-outfit">
                  {m.value}<span className={`text-lg sm:text-3xl font-medium ml-0.5 ${m.color}`}>{m.unit}</span>
                </span>
                <span className={`text-[9px] sm:text-xs font-semibold uppercase tracking-[0.2em] leading-tight text-center ${m.color === 'text-white' ? 'text-slate-400' : m.color} opacity-90 mt-1`}>
                  {m.label.split('\n').map((l, j) => <span key={j} className="block sm:inline">{l}{j === 0 && ' '}</span>)}
                </span>
                <span className="hidden sm:block text-slate-500 text-sm max-w-xs leading-relaxed mt-3 font-light">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMA / MANIFESTO ── */}
      <section className="py-12 sm:py-32 bg-[#030712] border-b border-slate-800/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700/50 rounded-full text-slate-300 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-5">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-400" /> El Riesgo de la Nube Pública
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-[1.2] mb-5 sm:mb-8 font-outfit">
              Por qué debe evitar usar APIs comerciales<br className="hidden sm:block" />
              <span className="text-slate-400 font-medium"> en su corporación.</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-xl leading-relaxed max-w-3xl mx-auto font-light">
              Permitir que sus empleados suban balances financieros, contratos o bases de datos a herramientas genéricas en internet significa entregar la propiedad intelectual de su empresa a servidores que usted no controla.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {[
              { icon: <Eye className="w-5 h-5 md:w-5 md:h-5 text-slate-300" />, title: "Fuga de Secretos (IP)", text: "Las preguntas que sus empleados le hacen a una IA pública quedan registradas en bases de datos externas imposibles de borrar." },
              { icon: <Scale className="w-5 h-5 md:w-5 md:h-5 text-slate-300" />, title: "Riesgo Legal / Multas", text: "Si su empresa maneja datos de clientes, enviarlos a un país distinto para procesar IA viola normativas estrictas (GDPR, financieras)." },
              { icon: <TrendingDown className="w-5 h-5 md:w-5 md:h-5 text-slate-300" />, title: "Costos Descontrolados", text: "La IA pública cobra por uso. Si mil empleados consultan manuales todos los días, su factura de tecnología explotará a fin de mes." },
            ].map((item, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-slate-700 transition-colors duration-500 flex flex-col sm:block overflow-hidden">
                <div className="flex items-center gap-4 mb-4 md:mb-5">
                  <div className="p-2.5 md:p-3 rounded-xl bg-[#111] border border-slate-800 shadow-inner shrink-0">{item.icon}</div>
                  <h3 className="font-medium text-white text-base md:text-[17px] leading-tight font-outfit break-words">{item.title}</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed font-light break-words">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPACIDADES MODULARES (ECOSISTEMA) ── */}
      <section className="bg-[#050505] border-b border-slate-800/50">
        <div className="text-center pt-20 px-4">
          <h2 className="text-2xl sm:text-4xl font-light text-white font-outfit">Un Ecosistema Modular</h2>
          <p className="text-slate-400 mt-4 text-sm sm:text-lg max-w-2xl mx-auto">No imponemos un producto rígido. Desplegamos la infraestructura base y usted decide qué capacidades activar según el diagnóstico de su empresa.</p>
        </div>
        {featureHighlights.map((feature, idx) => {
          const isRight = feature.pattern === 'right';
          const accentMap = { 
            slate: { border: 'border-slate-700/50', bg: 'bg-slate-900/30', text: 'text-slate-300', badge: 'bg-slate-800 border-slate-700 text-slate-300', icon: 'bg-slate-800 border-slate-700', glow: 'shadow-[0_0_30px_rgba(255,255,255,0.02)]' }, 
            emerald: { border: 'border-emerald-900/50', bg: 'bg-emerald-950/10', text: 'text-emerald-400', badge: 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400', icon: 'bg-emerald-950/50 border-emerald-900/50', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.05)]' }, 
            cyan: { border: 'border-cyan-900/50', bg: 'bg-cyan-950/10', text: 'text-cyan-400', badge: 'bg-cyan-950/40 border-cyan-900/50 text-cyan-400', icon: 'bg-cyan-950/50 border-cyan-900/50', glow: 'shadow-[0_0_30px_rgba(6,182,212,0.05)]' } 
          };
          const c = accentMap[feature.accentColor];
          return (
            <div key={idx} className={`py-12 sm:py-20 border-b border-slate-800/50 last:border-0 ${idx % 2 === 1 ? 'bg-[#030712]' : ''}`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex flex-col ${isRight ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-24`}>
                  
                  {/* Text Side */}
                  <div className="w-full lg:w-1/2 space-y-6 sm:space-y-8">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${c.badge}`}>
                        {feature.tag}
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-[1.15] tracking-tight font-outfit">
                      {feature.title}
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-lg leading-relaxed font-light">
                      {feature.body}
                    </p>
                    <div className={`border-l-2 ${c.border} pl-5 sm:pl-6`}>
                      <p className={`text-sm sm:text-base leading-relaxed ${c.text} font-normal`}>
                        {feature.subtext}
                      </p>
                    </div>
                    <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl border ${c.border} ${c.bg}`}>
                      <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${c.text}`} />
                      <span className={`text-xs sm:text-sm font-medium ${c.text}`}>{feature.badge}</span>
                    </div>
                  </div>

                  {/* Visual Side */}
                  <div className="w-full lg:w-1/2">
                    <div className={`relative rounded-3xl border ${c.border} ${c.bg} p-6 sm:p-12 overflow-hidden ${c.glow} backdrop-blur-sm`}>
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:4px_4px]"></div>
                      
                      <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-2xl border ${c.icon} flex items-center justify-center mb-6 sm:mb-10 shadow-inner`}>
                        {feature.icon}
                      </div>
                      
                      <div className="space-y-4 sm:space-y-5 relative z-10">
                        {[
                          idx === 0 ? ["Motores corporativos encapsulados", "IDE de desarrollo propio", "Sistemas y diagnósticos a la medida"] :
                          idx === 1 ? ["Conexión API a su software existente", "Portales y dashboards personalizados", "Agentes autónomos en segundo plano"] :
                          ["Conexión a PDFs, Word y Excel locales", "Lectura estricta sin invenciones", "Eliminación del sesgo de internet"],
                        ][0].map((point, pi) => (
                          <div key={pi} className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.text.replace('text-', 'bg-')}`}></div>
                            <span className="text-slate-300 text-sm sm:text-base font-light">{point}</span>
                          </div>
                        ))}
                      </div>

                      <div className={`mt-8 sm:mt-12 pt-6 sm:pt-8 border-t ${c.border} flex items-center justify-between`}>
                        <span className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium">Validado por Arquitectura</span>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${c.text.replace('text-', 'bg-')} animate-pulse`}></span>
                          <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${c.text}`}>Verificado</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── COMPARISON ── */}
      <section className="py-12 sm:py-32 bg-[#0a0a0a] border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-4 sm:mb-6 font-outfit">La Diferencia Física</h2>
            <p className="text-slate-400 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto font-light">
              No es una suscripción web más. Es infraestructura tecnológica que pasa a ser propiedad operativa de su empresa.
            </p>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-hidden rounded-3xl border border-slate-800 shadow-2xl bg-[#050505]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="w-1/3 p-8 bg-[#030712] border-b border-slate-800 text-slate-500 font-medium text-xs uppercase tracking-[0.2em]">Criterio de Evaluación</th>
                  <th className="w-1/3 p-8 bg-[#0a0a0a] border-b border-slate-800 text-center"><div className="flex flex-col items-center gap-2"><Globe className="w-6 h-6 text-slate-600" /><span className="text-slate-400 font-medium tracking-wide">Plataformas en Nube Pública</span></div></th>
                  <th className="w-1/3 p-8 bg-emerald-950/10 border-b border-emerald-900/30 text-center border-l border-emerald-900/30"><div className="flex flex-col items-center gap-2"><Shield className="w-6 h-6 text-emerald-400" /><span className="text-white font-medium text-lg tracking-wide">Modelo ProxDeep</span><span className="text-emerald-500/70 text-[10px] font-semibold uppercase tracking-[0.2em]">Instalación Local</span></div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="group hover:bg-[#111] transition-all duration-300">
                    <td className="p-6 text-slate-300 font-medium bg-[#030712]/50 group-hover:text-white transition-colors">{row.feature}</td>
                    <td className="p-6 text-center text-slate-500 text-sm bg-[#0a0a0a]/50 font-light group-hover:text-slate-400 transition-colors">
                      <div className="flex flex-col items-center gap-2"><div className="group-hover:scale-110 transition-transform opacity-60">{row.pubIcon}</div><span>{row.public}</span></div>
                    </td>
                    <td className="p-6 text-center text-slate-200 font-medium text-sm bg-emerald-950/5 border-l border-emerald-900/30 group-hover:bg-emerald-950/20 transition-colors">
                      <div className="flex flex-col items-center gap-2"><div className="group-hover:scale-125 transition-transform duration-300">{row.proxIcon}</div><span className="text-slate-300 group-hover:text-white transition-colors">{row.prox}</span></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile: Stacked Comparison Cards */}
          <div className="block lg:hidden space-y-4">
            {comparisonData.map((row, idx) => (
              <div key={idx} className="bg-[#050505] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
                <h3 className="text-slate-200 font-medium text-sm mb-4 border-b border-slate-800/80 pb-3 font-outfit">{row.feature}</h3>
                
                <div className="space-y-4">
                  {/* Public Cloud */}
                  <div className="flex items-start gap-3 opacity-70">
                    <div className="mt-0.5 scale-90">{row.pubIcon}</div>
                    <div>
                      <span className="text-slate-500 font-medium text-[10px] uppercase tracking-widest block mb-1">Plataformas Públicas</span>
                      <span className="text-slate-400 text-xs font-light leading-relaxed">{row.public}</span>
                    </div>
                  </div>
                  
                  {/* ProxDeep */}
                  <div className="flex items-start gap-3 bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-900/30 shadow-inner">
                    <div className="mt-0.5">{row.proxIcon}</div>
                    <div>
                      <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest block mb-1">Modelo ProxDeep</span>
                      <span className="text-slate-200 text-xs font-medium leading-relaxed">{row.prox}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES (COMO INSTALAMOS) ── */}
      <section className="py-12 sm:py-32 bg-[#030712] border-b border-slate-800/50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/10 via-slate-900/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-4 sm:mb-6 font-outfit">¿Cómo instalamos el sistema?</h2>
            <p className="text-slate-400 text-sm sm:text-lg leading-relaxed font-light">
              Un proceso técnico paso a paso para encender su primer modelo de Inteligencia Artificial privado en menos de 4 semanas.
            </p>
          </div>
          {/* Responsive Bento Grid (Forced on Mobile & Desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 auto-rows-fr">
            <div className="col-span-2 md:col-span-2 p-5 sm:p-12 rounded-2xl sm:rounded-[2rem] bg-[#0a0a0a] border border-slate-800 hover:border-slate-600 shadow-2xl relative overflow-hidden group transition-all duration-500">
              <Database className="w-5 h-5 sm:w-10 sm:h-10 text-slate-300 mb-4 sm:mb-8 relative z-10 group-hover:-translate-y-2 transition-transform" />
              <h3 className="text-base sm:text-2xl font-medium text-white mb-2 sm:mb-4 relative z-10 font-outfit">Paso 1: Auditoría de Servidores</h3>
              <p className="text-slate-400 text-[11px] sm:text-lg leading-relaxed relative z-10 max-w-xl group-hover:text-slate-300 transition-colors font-light">
                Analizamos qué servidores o computadoras potentes tiene disponibles en su empresa. <strong>No necesita supercomputadoras</strong>, nos adaptamos a su hardware actual o infraestructura de nube privada para reducir costos.
              </p>
            </div>
            <div className="col-span-1 p-4 sm:p-12 rounded-2xl sm:rounded-[2rem] bg-[#0a0a0a] border border-slate-800 hover:border-emerald-700/50 shadow-xl relative overflow-hidden group transition-all duration-500 flex flex-col justify-center">
              <Box className="w-5 h-5 sm:w-10 sm:h-10 text-emerald-400 mb-3 sm:mb-8 relative z-10" />
              <h3 className="text-sm sm:text-xl font-medium text-white mb-1.5 sm:mb-3 relative z-10 font-outfit">Paso 2: Empaquetado</h3>
              <p className="text-slate-400 text-[10px] sm:text-sm leading-relaxed relative z-10 font-light">Consolidamos el modelo de lenguaje en contenedores encriptados, aislandolo de internet.</p>
            </div>
            <div className="col-span-1 p-4 sm:p-12 rounded-2xl sm:rounded-[2rem] bg-[#0a0a0a] border border-slate-800 hover:border-cyan-700/50 shadow-xl relative overflow-hidden group transition-all duration-500 flex flex-col justify-center">
              <FileText className="w-5 h-5 sm:w-10 sm:h-10 text-cyan-400 mb-3 sm:mb-8 relative z-10 group-hover:rotate-12 transition-transform" />
              <h3 className="text-sm sm:text-xl font-medium text-white mb-1.5 sm:mb-3 relative z-10 font-outfit">Paso 3: Conexión Datos</h3>
              <p className="text-slate-400 text-[10px] sm:text-sm leading-relaxed relative z-10 font-light">Enlazamos el sistema con sus carpetas locales para que la IA lea sus manuales en la red local.</p>
            </div>
            <div className="col-span-2 md:col-span-2 p-5 sm:p-12 rounded-2xl sm:rounded-[2rem] bg-[#0a0a0a] border border-slate-800 hover:border-slate-600 overflow-hidden relative flex flex-col justify-center group transition-all duration-500">
              <MonitorCheck className="w-5 h-5 sm:w-10 sm:h-10 text-slate-300 mb-4 sm:mb-8 group-hover:-translate-y-2 transition-transform" />
              <h3 className="text-base sm:text-2xl font-medium text-white mb-2 sm:mb-4 font-outfit">Paso 4: Encendido y Entrenamiento del Equipo</h3>
              <p className="text-slate-400 text-[11px] sm:text-lg leading-relaxed max-w-2xl font-light">Instalamos el software en su oficina. Creamos perfiles para sus empleados y capacitamos al equipo para que tomen el control.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STATS ── */}
      <section className="py-12 sm:py-24 bg-[#0a0a0a] border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16 max-w-2xl mx-auto">
            <div className="w-12 h-px bg-slate-700 mx-auto mb-6"></div>
            <h2 className="text-2xl sm:text-3xl font-light text-white mb-4 font-outfit">Resultados Claros</h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light uppercase tracking-widest">Números de Operación</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {trustStats.map((stat, i) => (
              <div key={i} className="bg-[#050505] border border-slate-800/80 rounded-3xl p-6 sm:p-10 text-center hover:border-slate-600 transition-colors duration-500">
                <div className="flex justify-center mb-5 sm:mb-6">{stat.icon}</div>
                <div className="text-3xl sm:text-5xl font-light text-white mb-2 sm:mb-3 font-outfit">{stat.value}</div>
                <div className="font-medium text-slate-300 text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-3 sm:mb-4">{stat.label}</div>
                <div className="text-slate-500 text-[10px] sm:text-[11px] leading-relaxed font-light">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section className="py-12 sm:py-32 bg-[#030712]/50 backdrop-blur-sm border-b border-slate-800/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-4 sm:mb-6 font-outfit">Casos de Uso Corporativo</h2>
            <p className="text-slate-400 text-xs sm:text-lg hidden sm:block leading-relaxed font-light">Ejemplos de cómo otras industrias ya usan IA internamente sin poner en riesgo la confidencialidad de su información.</p>
          </div>
          {/* Mobile: pill tabs + panel */}
          <div className="block sm:hidden space-y-5">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {classifications.map((item, idx) => (
                <button key={idx} onClick={() => handleTabClick(idx)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${activeTab === idx ? 'bg-slate-800 border-slate-600 text-white' : 'bg-[#0a0a0a] border-slate-800 text-slate-500'}`}>
                  {item.icon} {item.title}
                </button>
              ))}
            </div>
            <div className="bg-[#0a0a0a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <p className="text-slate-300 text-[13px] leading-relaxed font-light relative z-10">{classifications[activeTab].desc}</p>
              <div className="mt-5 flex items-center gap-1.5 text-emerald-400 text-xs font-semibold cursor-pointer tracking-wide relative z-10">
                Preguntar cómo aplicarlo <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          {/* Desktop: side tabs */}
          <div className="hidden sm:flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="w-full lg:w-1/3 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible scrollbar-hide">
              {classifications.map((item, idx) => (
                <button key={idx} onClick={() => handleTabClick(idx)}
                  className={`flex-shrink-0 lg:w-full text-left px-6 py-6 rounded-2xl transition-all duration-500 flex items-center gap-5 border ${activeTab === idx ? 'bg-[#0a0a0a] border-slate-700 text-white lg:translate-x-3 shadow-lg' : 'bg-transparent border-transparent text-slate-500 hover:bg-[#0a0a0a]/50 hover:border-slate-800'}`}>
                  <div className={`p-3 rounded-xl transition-colors duration-500 ${activeTab === idx ? 'bg-slate-800 text-slate-200' : 'bg-transparent text-slate-600'}`}>{item.icon}</div>
                  <span className="font-medium text-lg tracking-wide">{item.title}</span>
                </button>
              ))}
            </div>
            <div className="w-full lg:w-2/3 bg-[#0a0a0a] border border-slate-800 rounded-[2.5rem] p-16 relative overflow-hidden min-h-[400px] flex items-center shadow-2xl">
              <div key={activeTab} className="animate-in fade-in slide-in-from-right-8 duration-700 relative z-10 w-full">
                <div className="mb-8 inline-flex p-4 rounded-2xl bg-[#111] border border-slate-700 text-slate-300 shadow-inner">{classifications[activeTab].icon}</div>
                <h3 className="text-4xl font-light text-white mb-6 font-outfit">{classifications[activeTab].title}</h3>
                <p className="text-slate-400 text-xl leading-relaxed max-w-2xl font-light">{classifications[activeTab].desc}</p>
                <div className="mt-10 flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase tracking-widest cursor-pointer group hover:text-emerald-300 transition-colors">
                  Conversar con un Asesor <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 sm:py-32 bg-[#030712] border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4 sm:mb-6 font-outfit">Dudas Comunes</h2>
            <p className="text-slate-500 text-xs sm:text-base leading-relaxed hidden sm:block font-light">Claridad técnica antes de tomar una decisión.</p>
          </div>
          <div className="space-y-4 sm:space-y-5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-800 rounded-2xl bg-[#0a0a0a]/50 hover:bg-[#111] transition-colors duration-300 overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} className="w-full px-5 py-5 sm:px-8 sm:py-7 text-left flex justify-between items-center focus:outline-none gap-4">
                  <span className="text-xs sm:text-[17px] font-normal text-slate-200 leading-tight tracking-wide font-outfit">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-slate-500 flex-shrink-0 transition-transform duration-500 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-5 sm:px-8 overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === idx ? 'max-h-[300px] pb-5 sm:pb-7 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-slate-400 leading-relaxed border-t border-slate-800 pt-4 sm:pt-5 text-[11px] sm:text-[15px] font-light">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-40 bg-[#050505] text-center border-t border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/30 via-[#050505] to-[#050505] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-950/30 border border-emerald-900/50 rounded-full text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6 sm:mb-8">
            <AlertTriangle className="w-4 h-4" /> Diagnóstico Sin Costo
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-[4rem] font-light text-white mb-6 sm:mb-8 leading-[1.1] font-outfit tracking-tight">
            ¿Sabe qué le preguntan sus empleados a ChatGPT?
          </h2>
          <p className="text-xs sm:text-xl text-slate-400 mb-10 sm:mb-14 leading-relaxed max-w-2xl mx-auto font-light">
            Detenga la fuga de información confidencial hacia servidores públicos. Obtenga una <b>Auditoría de Riesgo de IA gratuita</b> para evaluar la vulnerabilidad de sus datos y descubrir cómo aislar su conocimiento corporativo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex w-full sm:w-auto items-center justify-center gap-3 px-8 py-4 sm:py-5 bg-emerald-500 hover:bg-emerald-400 text-[#050505] text-sm sm:text-base font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              Solicitar Auditoría Gratis <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <Link to="/smls" className="inline-flex w-full sm:w-auto items-center justify-center gap-3 px-8 py-4 sm:py-5 bg-[#0a0a0a] hover:bg-[#111] border border-slate-700 text-slate-300 text-sm sm:text-base font-medium rounded-2xl transition-colors">
              Explorar Modelos Disponibles
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#020202] border-t border-slate-800/80 relative z-10">
        {/* Mobile Footer */}
        <div className="block lg:hidden px-6 py-12">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="ProxDeep Logo" className="h-8 w-auto object-contain" />
              <span className="text-2xl font-medium text-white tracking-widest font-outfit">PROX<span className="text-blue-500">DEEP</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-light max-w-xs">
              Instalación de IA Privada.<br/>Soberanía de datos garantizada.
            </p>
          </div>
          
          {/* Socials Mobile */}
          <div className="flex justify-center gap-5 mb-12">
            <a href="https://www.instagram.com/proxdeep?igsh=dGk5NHptNHhvMHFs" target="_blank" rel="noreferrer" className="p-3 bg-[#0a0a0a] border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 hover:border-emerald-900 transition-all shadow-lg">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-3 bg-[#0a0a0a] border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 hover:border-emerald-900 transition-all shadow-lg">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-3 bg-[#0a0a0a] border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 hover:border-emerald-900 transition-all shadow-lg">
              <Twitter className="w-5 h-5" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 mb-12">
            <div>
              <h4 className="text-slate-200 font-semibold text-[11px] uppercase tracking-[0.2em] mb-5">Servicios</h4>
              <ul className="space-y-4">
                <li><Link to="/smls" className="text-slate-500 hover:text-emerald-400 text-xs font-light transition-colors">Catálogo SML</Link></li>
                <li><Link to="/register" className="text-slate-500 hover:text-emerald-400 text-xs font-light transition-colors">Solicitar Auditoría</Link></li>
                <li><Link to="/login" className="text-slate-500 hover:text-emerald-400 text-xs font-light transition-colors">Portal Interno</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-200 font-semibold text-[11px] uppercase tracking-[0.2em] mb-5">Contacto Directo</h4>
              <ul className="space-y-4">
                <li><a href="mailto:asesoria@proxdeep.com" className="text-slate-500 hover:text-white text-xs font-light flex items-center gap-2.5 transition-colors"><Mail className="w-3.5 h-3.5 text-emerald-500/70" /> asesoria@proxdeep.com</a></li>
                <li><a href="tel:+573013137911" className="text-slate-500 hover:text-white text-xs font-light flex items-center gap-2.5 transition-colors"><Phone className="w-3.5 h-3.5 text-emerald-500/70" /> +57 301 313 7911</a></li>
                <li><span className="text-slate-500 text-xs font-light flex items-center gap-2.5"><Building2 className="w-3.5 h-3.5 text-slate-600" /> Operación Global</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2.5 bg-emerald-950/20 border border-emerald-900/50 px-5 py-2.5 rounded-full shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
              <span className="text-emerald-400 text-[10px] font-semibold uppercase tracking-widest">Aislado de Internet</span>
            </div>
            <p className="text-slate-600 text-[10px] font-medium tracking-widest">© {new Date().getFullYear()} PROXDEEP INC.</p>
          </div>
        </div>
        
        {/* Desktop Footer */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-12">
            <div className="grid grid-cols-12 gap-12 mb-20">
              
              <div className="col-span-4">
                <div className="flex items-center gap-3 mb-6">
                  <img src="/logo.png" alt="ProxDeep Logo" className="h-8 w-auto object-contain" />
                  <span className="text-2xl font-medium text-white tracking-widest font-outfit">PROX<span className="text-blue-500">DEEP</span></span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-light mb-8 max-w-sm">
                  Desplegamos infraestructura de Inteligencia Artificial privada para el sector corporativo.
                </p>
                <div className="flex gap-4">
                  <a href="https://www.instagram.com/proxdeep?igsh=dGk5NHptNHhvMHFs" target="_blank" rel="noreferrer" className="p-3 bg-[#0a0a0a] border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 hover:border-emerald-900 hover:bg-emerald-950/20 transition-all shadow-lg">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-3 bg-[#0a0a0a] border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 hover:border-emerald-900 hover:bg-emerald-950/20 transition-all shadow-lg">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-3 bg-[#0a0a0a] border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 hover:border-emerald-900 hover:bg-emerald-950/20 transition-all shadow-lg">
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="col-span-2 col-start-6">
                <h4 className="text-slate-200 font-semibold mb-6 text-[11px] uppercase tracking-[0.2em]">Servicio</h4>
                <ul className="space-y-4">
                  <li><Link to="/smls" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm font-light tracking-wide">Modelos Disponibles</Link></li>
                  <li><Link to="/register" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm font-light tracking-wide">Solicitar Instalación</Link></li>
                  <li><Link to="/login" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm font-light tracking-wide">Demo de Portal</Link></li>
                </ul>
              </div>

              <div className="col-span-2">
                <h4 className="text-slate-200 font-semibold mb-6 text-[11px] uppercase tracking-[0.2em]">Seguridad</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm font-light tracking-wide">Garantía Off-Grid</a></li>
                  <li><a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm font-light tracking-wide">Política Local</a></li>
                  <li><a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm font-light tracking-wide">Privacidad IP</a></li>
                </ul>
              </div>

              <div className="col-span-3">
                <h4 className="text-slate-200 font-semibold mb-6 text-[11px] uppercase tracking-[0.2em]">Red de Contacto</h4>
                <ul className="space-y-5">
                  <li><a href="mailto:asesoria@proxdeep.com" className="text-slate-500 hover:text-white transition-colors text-sm font-light flex items-center gap-3 tracking-wide"><Mail className="h-4 w-4 text-emerald-500/70" /> asesoria@proxdeep.com</a></li>
                  <li><a href="tel:+573013137911" className="text-slate-500 hover:text-white transition-colors text-sm font-light flex items-center gap-3 tracking-wide"><Phone className="h-4 w-4 text-emerald-500/70" /> +57 301 313 7911</a></li>
                  <li><span className="text-slate-500 transition-colors text-sm font-light flex items-center gap-3 tracking-wide"><Building2 className="h-4 w-4 text-slate-700" /> Cobertura Global (Remota)</span></li>
                </ul>
              </div>

            </div>
            
            <div className="pt-8 border-t border-slate-900 flex justify-between items-center">
              <p className="text-slate-600 text-[11px] font-medium tracking-widest uppercase">© {new Date().getFullYear()} ProxDeep Inc. Todos los derechos reservados.</p>
              <div className="flex items-center gap-2.5 text-emerald-400 text-[10px] font-bold bg-emerald-950/20 px-5 py-2.5 rounded-full border border-emerald-900/50 uppercase tracking-widest shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                Operación Local Garantizada
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
