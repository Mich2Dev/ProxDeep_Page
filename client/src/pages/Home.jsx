import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, TrendingDown, Cpu, ArrowRight, Activity, Scale, Briefcase, MessagesSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const classifications = [
    {
      title: "Salud y Triaje Clínico",
      icon: <Activity className="h-6 w-6 text-[#06b6d4]" />,
      desc: "Modelos ajustados a guías médicas. Protege historiales clínicos bajo estrictas normas HIPAA/locales. Latencia cero en momentos críticos."
    },
    {
      title: "Legal y Cumplimiento",
      icon: <Scale className="h-6 w-6 text-[#0ea5e9]" />,
      desc: "Análisis y extracción de cláusulas en contratos masivos sin exponer tu propiedad intelectual a servidores públicos."
    },
    {
      title: "Finanzas y Auditoría",
      icon: <Briefcase className="h-6 w-6 text-[#3b82f6]" />,
      desc: "Extracción estructurada de facturas y balances. Mantén tu información fiscal blindada dentro de tu propio perímetro de red."
    },
    {
      title: "Atención al Cliente",
      icon: <MessagesSquare className="h-6 w-6 text-[#60a5fa]" />,
      desc: "Chatbots de soporte avanzado y análisis de sentimiento. Aprende de tu feedback interno sin entrenar la IA de la competencia."
    }
  ];

  return (
    <div className="w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">

        {/* Hero */}
        <div className="text-center mb-16 sm:mb-24 mt-4 sm:mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0b1426] border border-[#06b6d4]/30 rounded-full text-xs font-semibold text-[#06b6d4] mb-6 sm:mb-8 shadow-glow">
            <Shield className="h-4 w-4 shrink-0" />
            <span>IA Infraestructura Empresarial Dedicada</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 sm:mb-6 leading-tight px-2">
            Nodos Cognitivos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]">
              ProxDeep
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Despliega Small Language Models (SMLs) ultra-especializados directamente en tu infraestructura.
            Garantiza el <strong>IP Shielding</strong> de tus datos corporativos con un esquema de{' '}
            <strong>Tarifa Plana Estabilizada</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn-primary inline-flex items-center gap-2 justify-center">
                Ir al Panel de Control <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary inline-flex items-center gap-2 justify-center text-base sm:text-lg">
                  Iniciar Diagnóstico <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/smls" className="btn-secondary inline-flex items-center gap-2 justify-center text-base sm:text-lg">
                  Catálogo de Modelos
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Propuesta de Valor */}
        <div className="mb-16 sm:mb-24">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 px-2">¿Por qué ProxDeep sobre la Nube Pública?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto px-4 text-sm sm:text-base">
              La IA genérica expone tus datos y castiga tu éxito con facturaciones variables exponenciales. ProxDeep cambia el paradigma.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="card hover:-translate-y-1 transition-transform duration-300">
              <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-[#06b6d4] mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">IP Shielding Total</h3>
              <p className="text-slate-400 text-sm sm:text-base">
                Tus datos sensibles, código propietario e historiales de pacientes nunca abandonan tu perímetro. Operación 100% On-Premise o en VPS dedicado.
              </p>
            </div>
            <div className="card hover:-translate-y-1 transition-transform duration-300">
              <TrendingDown className="h-8 w-8 sm:h-10 sm:w-10 text-[#0ea5e9] mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Adiós al "Impuesto al Éxito"</h3>
              <p className="text-slate-400 text-sm sm:text-base">
                Sustituye los costos por millón de tokens por una Tarifa Plana (CAPEX). A más uso le des a tu IA, el costo marginal por transacción es $0.00.
              </p>
            </div>
            <div className="card hover:-translate-y-1 transition-transform duration-300 sm:col-span-2 lg:col-span-1">
              <Cpu className="h-8 w-8 sm:h-10 sm:w-10 text-[#3b82f6] mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">SMLs Hiper-Especializados</h3>
              <p className="text-slate-400 text-sm sm:text-base">
                No necesitas un modelo gigante que sabe de cocina para analizar un balance financiero. Nuestros Small Language Models vencen a los LLMs gigantes en su nicho.
              </p>
            </div>
          </div>
        </div>

        {/* Casos de Uso */}
        <div className="mb-16 sm:mb-24">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 px-2">Resolviendo Problemas Críticos por Industria</h2>
            <p className="text-slate-400 max-w-2xl mx-auto px-4 text-sm sm:text-base">
              Nuestros Nodos SML están pre-entrenados para flujos de trabajo corporativos complejos.
            </p>
          </div>

          <div className="bg-[#0b1426]/50 border border-[#1e3a8a]/30 rounded-2xl p-4 sm:p-8 max-w-5xl mx-auto shadow-lg backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {classifications.slice(0, 3).map((item, idx) => (
                <div key={idx} className="bg-[#050b14] border border-[#06b6d4]/20 hover:border-[#06b6d4]/60 p-4 sm:p-6 rounded-xl transition-all group cursor-pointer">
                  <div className="mb-3 sm:mb-4 bg-[#1e3a8a]/20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-3 sm:mb-4">{item.desc}</p>
                  <div className="text-[#06b6d4] text-sm font-semibold flex items-center gap-1">Ver modelos <ArrowRight className="w-4 h-4" /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Arquitectura Zero-Trust */}
        <div className="mb-16 sm:mb-24 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0b1426] to-[#050b14] border border-[#06b6d4]/20 p-6 sm:p-12 max-w-6xl mx-auto text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSg2LCAxODIsIDIxMiwgMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>

          <div className="relative z-10">
            <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-[#06b6d4] mx-auto mb-4 sm:mb-6 opacity-80 shadow-glow rounded-full" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 sm:mb-6">Arquitectura Zero-Trust Integrada</h2>
            <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto mb-8 sm:mb-12 px-2">
              Tu Nodo Cognitivo se instala físicamente en tu red o en un servidor dedicado (Air-Gapped). La IA procesa la información sin enviar un solo token a internet.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-8">
              <div className="flex items-center gap-3 bg-[#050b14] px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-emerald-500/30 w-full sm:w-auto justify-center">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                <span className="text-emerald-400 font-bold text-sm sm:text-base">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-3 bg-[#050b14] px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-emerald-500/30 w-full sm:w-auto justify-center">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                <span className="text-emerald-400 font-bold text-sm sm:text-base">SOC2 Certificado</span>
              </div>
              <div className="flex items-center gap-3 bg-[#050b14] px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-emerald-500/30 w-full sm:w-auto justify-center">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                <span className="text-emerald-400 font-bold text-sm sm:text-base">100% On-Premise</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROI */}
        <div className="mb-16 sm:mb-24">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 px-2">Elimina el Impuesto al Éxito</h2>
            <p className="text-slate-400 text-sm sm:text-base">ROI garantizado. Control de costos en modo Tarifa Plana.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
            <div className="bg-[#050b14] border border-red-500/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown className="w-16 h-16 sm:w-24 sm:h-24 text-red-500" /></div>
              <h3 className="text-red-400 font-bold mb-1">APIs Nube Pública</h3>
              <p className="text-slate-500 text-sm mb-4 sm:mb-6">Costo Variable a 12 meses</p>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2">~$60,000+</div>
              <p className="text-xs text-red-500/80">Sujeto a penalizaciones por volumen de tokens.</p>
            </div>

            <div className="bg-gradient-to-br from-[#0b1426] to-[#050b14] border border-[#06b6d4]/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Shield className="w-16 h-16 sm:w-24 sm:h-24 text-[#06b6d4]" /></div>
              <h3 className="text-[#06b6d4] font-bold mb-1">ProxDeep Enterprise</h3>
              <p className="text-slate-500 text-sm mb-4 sm:mb-6">Inversión Fija Anual (Licencia + Mantenimiento)</p>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2">~$12,000</div>
              <p className="text-xs text-[#06b6d4]/80 font-bold bg-[#06b6d4]/10 inline-block px-2 py-1 rounded">Ahorro comprobado del 80%</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16 sm:mb-24 max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-8 sm:mb-12">¿Cómo empezamos?</h2>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative gap-6 sm:gap-0">
            <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-[#1e3a8a]/30 -z-10"></div>

            {[
              { num: '1', color: '[#06b6d4]', title: 'Diagnóstico Asesorado', desc: 'Analizamos tu carga de trabajo y problemas críticos en 5 minutos.' },
              { num: '2', color: '[#0ea5e9]', title: 'Selección de Clúster', desc: 'Nuestra IA empareja tu necesidad con el mejor modelo SML del mundo.' },
              { num: '3', color: '[#3b82f6]', title: 'Despliegue Aislado', desc: 'Instalación completa On-Premise en menos de 24 horas.' },
            ].map((step, i) => (
              <div key={i} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0 bg-[#050b14] sm:p-4 z-10 w-full sm:w-1/3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0b1426] border-2 border-${step.color} flex items-center justify-center text-lg sm:text-xl font-bold text-${step.color} shrink-0 sm:mb-4 shadow-glow`}>{step.num}</div>
                <div className="text-left sm:text-center">
                  <h4 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">{step.title}</h4>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 sm:mt-32 pt-10 sm:pt-16 pb-8 border-t border-[#1e3a8a]/30 bg-[#050b14] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 text-white font-bold text-xl tracking-wide mb-4">
                  <Shield className="h-6 w-6 text-[#06b6d4]" />
                  <span>PROX<span className="text-[#06b6d4]">DEEP</span></span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
                  Desplegamos Nodos Cognitivos locales y privados para corporaciones que exigen control total de sus datos y costos estables. IA verdaderamente tuya.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Contacto</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="text-[#06b6d4]">✉</span> proxdeep@gmail.com
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#06b6d4]">✆</span> +57 301 313 7911
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-[#06b6d4] transition-colors">Aviso de Privacidad</a></li>
                  <li><a href="#" className="hover:text-[#06b6d4] transition-colors">Términos de Servicio</a></li>
                  <li><a href="#" className="hover:text-[#06b6d4] transition-colors">Acuerdo de SLA</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-[#1e3a8a]/20 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
              <p>© {new Date().getFullYear()} ProxDeep — IA Infraestructura Empresarial Dedicada.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
