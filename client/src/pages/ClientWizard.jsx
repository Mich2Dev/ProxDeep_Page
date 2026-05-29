import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChevronRight, ChevronLeft, Check, AlertCircle, Send,
  Edit2, Shield, Zap, Database, Globe, Lock, FileText,
  Code, Activity,
} from 'lucide-react';

// ─── Static Data ─────────────────────────────────────────────────────────────

const PROCESS_CATEGORIES = [
  { id: 'legal',    label: 'Legal / Contratos',       description: 'Revisión, extracción y redacción de documentos legales.' },
  { id: 'finance',  label: 'Finanzas / Auditoría',    description: 'Análisis de datos financieros, detección de anomalías contables.' },
  { id: 'hr',       label: 'Recursos Humanos',        description: 'Onboarding, políticas internas, cumplimiento laboral.' },
  { id: 'it',       label: 'Operaciones de TI',       description: 'Soporte técnico, análisis de logs, triaje de incidencias.' },
  { id: 'customer', label: 'Atención al Cliente',     description: 'Chatbots internos, triaje de tickets, respuestas automatizadas.' },
  { id: 'health',   label: 'Salud / Clínica',         description: 'Historias clínicas, clasificación médica, entornos HIPAA.' },
  { id: 'other',    label: 'Otro',                    description: 'Caso de uso no listado.' },
];

const CONCURRENCY_OPTIONS = [
  { id: 'pilot',      label: 'Piloto',          sublabel: 'Menos de 50 usuarios simultáneos',              value: 25  },
  { id: 'department', label: 'Departamental',   sublabel: '50 – 300 usuarios simultáneos',                 value: 150 },
  { id: 'intensive',  label: 'Uso intensivo',   sublabel: 'Más de 300 usuarios o procesos automatizados',  value: 500 },
];

const GOVERNANCE_OPTIONS = [
  {
    id: 'standard',
    label: 'Privado estándar',
    description: 'Encriptado en tránsito y reposo. Adecuado para operaciones internas regulares.',
    exceptional: false,
  },
  {
    id: 'vpc',
    label: 'Canal dedicado (VPC)',
    description: 'Red aislada exclusiva para la organización. Recomendado para cumplimiento regulatorio estricto.',
    exceptional: false,
  },
  {
    id: 'airgapped',
    label: 'Aislamiento total (Air-Gapped)',
    description: 'Sin conexión a internet. Condición excepcional para entornos con requisitos de seguridad extrema: defensa, salud crítica, regulación estatal.',
    exceptional: true,
  },
];

const DATA_SOURCES = [
  { id: 'docs',      label: 'Documentos internos',      sublabel: 'PDF, Word, presentaciones',       Icon: FileText  },
  { id: 'databases', label: 'Bases de datos',           sublabel: 'SQL, estructurados',              Icon: Database  },
  { id: 'apis',      label: 'APIs externas',            sublabel: 'Servicios web de terceros',       Icon: Globe     },
  { id: 'code',      label: 'Código fuente',            sublabel: 'Repositorios, scripts',           Icon: Code      },
  { id: 'streams',   label: 'Datos en tiempo real',     sublabel: 'Streams, eventos continuos',      Icon: Activity  },
];

// Maps process category to SML IDs from mockData
const SML_CATEGORY_MAP = {
  legal:    [1, 2],
  finance:  [4, 7],
  hr:       [8],
  it:       [5],
  customer: [5],
  health:   [3],
  other:    [6],
};

// ─── Decision Logic ───────────────────────────────────────────────────────────

function detectConflicts(answers) {
  const conflicts = [];

  if (answers.governanceLevel === 'airgapped' && answers.dataSources.includes('apis')) {
    conflicts.push({
      id: 'A', severity: 'high',
      title: 'Aislamiento total (Air-Gapped) + Integraciones con APIs externas',
      message: 'El aislamiento total impide conectividad externa. No es posible integrar APIs de terceros en tiempo real bajo esta configuración.',
      suggestion: 'Considere canal dedicado (VPC) si requiere conectividad.',
    });
  }

  if (
    answers.realtimeNeeded &&
    (answers.concurrencyLevel === 'intensive' ||
      (answers.concurrencyLevel === 'pilot' && answers.userTypes.includes('automated')))
  ) {
    conflicts.push({
      id: 'B', severity: 'medium',
      title: 'Volumen intensivo + Latencia crítica + Presupuesto piloto',
      message: 'Garantizar respuesta en tiempo real con alta concurrencia implica recursos de cómputo significativos. Esta combinación excede el alcance de un despliegue piloto estándar.',
      suggestion: 'Reduzca el volumen estimado o flexibilice la latencia para una arquitectura de menor escala.',
    });
  }

  if (
    answers.governanceLevel === 'airgapped' &&
    answers.userTypes.length > 0 &&
    !answers.userTypes.includes('devs')
  ) {
    conflicts.push({
      id: 'C', severity: 'medium',
      title: 'Seguridad máxima requerida + Baja capacidad operativa interna',
      message: 'Un despliegue Air-Gapped requiere administración técnica local continua.',
      suggestion: 'Si el equipo interno no puede sostenerlo, se recomienda un modelo de canal dedicado gestionado externamente.',
    });
  }

  return conflicts;
}

function calculateConfidence(answers, conflicts, currentStep = 6) {
  let completed = 0;
  if (answers.processCategory)        completed++;
  if (answers.concurrencyLevel)       completed++;
  if (answers.governanceLevel)        completed++;
  if (answers.dataSources.length > 0) completed++;
  if (currentStep >= 5 || answers.realtimeNeeded || answers.agentsNeeded) completed++;

  const openAssumptions =
    (answers.processDescription.trim().length < 5 ? 1 : 0) +
    (answers.userTypes.length === 0 ? 1 : 0);

  const isHighSensitivity =
    ['airgapped', 'vpc'].includes(answers.governanceLevel) ||
    ['health', 'legal', 'finance'].includes(answers.processCategory);

  const hasHigh   = conflicts.some(c => c.severity === 'high');
  const hasMedium = conflicts.some(c => c.severity === 'medium');

  if (completed < 3 || hasHigh) return 'low';
  if (
    completed < 5 ||
    hasMedium ||
    openAssumptions > 1 ||
    (isHighSensitivity && (openAssumptions > 0 || completed < 5))
  ) return 'medium';
  return 'high';
}

function buildInferredProfile(answers) {
  if (!answers.processCategory && !answers.concurrencyLevel && !answers.governanceLevel) {
    return null;
  }

  const segments = [];
  const category = PROCESS_CATEGORIES.find(c => c.id === answers.processCategory);

  if (category) {
    const confidential = ['legal', 'health', 'finance'].includes(answers.processCategory);
    segments.push(
      confidential
        ? `procesamiento documental confidencial en ${category.label.toLowerCase()}`
        : `caso de uso en ${category.label.toLowerCase()}`,
    );
  }

  if (answers.concurrencyLevel === 'pilot')       segments.push('volumen bajo (piloto)');
  else if (answers.concurrencyLevel === 'department') segments.push('volumen medio');
  else if (answers.concurrencyLevel === 'intensive')  segments.push('volumen alto o automatizado');

  if (answers.governanceLevel === 'airgapped' || answers.governanceLevel === 'vpc') {
    segments.push('necesidad de cumplimiento normativo');
  } else if (answers.governanceLevel === 'standard') {
    segments.push('operaciones internas regulares');
  }

  if (answers.userTypes.includes('external')) segments.push('acceso de clientes externos');
  if (answers.dataSources.includes('docs'))   segments.push('fuentes documentales');

  return `Se detecta un caso de ${segments.join(' con ')}.`;
}

function buildChangeReasons(answers) {
  const reasons = [];

  if (answers.governanceLevel === 'airgapped') {
    reasons.push('Al seleccionar "Aislamiento total", el entorno recomendado pasó a despliegue local sin conectividad externa.');
  } else if (answers.governanceLevel === 'vpc') {
    reasons.push('Al seleccionar cumplimiento regulatorio estricto, el entorno recomendado pasó de nube compartida a canal dedicado (VPC).');
  } else if (answers.governanceLevel === 'standard') {
    reasons.push('Con control estándar, el entorno recomendado es un despliegue privado encriptado para operaciones regulares.');
  }

  if (answers.concurrencyLevel === 'intensive' && answers.realtimeNeeded) {
    reasons.push('Al marcar "latencia crítica" con volumen alto, el sistema aumentó la capacidad de cómputo estimada.');
  } else if (answers.concurrencyLevel === 'department') {
    reasons.push('El volumen departamental activa recursos dedicados con disponibilidad básica.');
  } else if (answers.concurrencyLevel === 'pilot') {
    reasons.push('El volumen piloto permite una configuración de recursos reducida.');
  }

  if (answers.dataSources.includes('apis') && answers.governanceLevel !== 'airgapped') {
    reasons.push('Las APIs externas requieren conectores de red controlados dentro del entorno privado.');
  }

  if (answers.agentsNeeded) {
    reasons.push('La ejecución autónoma activa orquestación de agentes y procesamiento por lotes.');
  }

  return reasons;
}

function buildSimplificationHint(answers) {
  if (answers.governanceLevel === 'airgapped') {
    return 'Cambiar a "Canal dedicado (VPC)" simplificaría la operación y reduciría el costo inicial.';
  }
  if (answers.concurrencyLevel === 'intensive' || answers.realtimeNeeded) {
    return 'Reducir el volumen estimado o flexibilizar la latencia permitiría una arquitectura de menor escala.';
  }
  if (answers.concurrencyLevel === 'department') {
    return 'Reducir el volumen estimado a escala piloto permitiría una arquitectura de menor escala.';
  }
  return null;
}

function buildAssumptionsAndGaps(answers, conflicts, currentStep = 6) {
  const assumptions = [];
  const missingForProposal = [];

  if (answers.processDescription.trim().length < 5) {
    assumptions.push('Se asumió el caso de uso a partir de la categoría seleccionada, sin contexto adicional detallado.');
    missingForProposal.push('Descripción concreta del proceso y volumen documental o transaccional.');
  }

  if (answers.userTypes.length === 0) {
    assumptions.push('No se especificó el perfil de usuarios; se estima uso interno departamental.');
    missingForProposal.push('Perfil de usuarios y patrones de acceso (internos, externos, automatizados).');
  }

  if (!answers.realtimeNeeded && !answers.agentsNeeded && currentStep >= 6) {
    assumptions.push('No se definieron requisitos operativos de latencia ni automatización (respuesta explícita).');
  }

  assumptions.push('Se estiman 20 consultas diarias por usuario y 22 días hábiles al mes para la simulación financiera.');

  if (conflicts.length > 0) {
    missingForProposal.push('Resolución de conflictos entre requisitos de seguridad, conectividad y escala.');
  }

  if (!answers.concurrencyLevel) {
    missingForProposal.push('Volumen de uso simultáneo estimado.');
  }

  return { assumptions, missingForProposal };
}

function buildRecommendation(answers, conflicts, confidence) {
  let env             = null;
  let envLabel        = null;
  let scale           = null;
  const justification   = [];
  const businessImpact  = [];
  const changeReasons   = buildChangeReasons(answers);
  const simplificationHint = buildSimplificationHint(answers);
  const inferredProfile = buildInferredProfile(answers);

  // Environment
  if (answers.governanceLevel === 'airgapped') {
    env      = 'airgapped';
    envLabel = 'Despliegue local aislado (Air-Gapped)';
    justification.push('Se requiere desconexión física completa de redes externas.');
  } else if (answers.governanceLevel === 'vpc') {
    env      = 'vpc';
    envLabel = 'Canal dedicado en nube privada (VPC)';
    justification.push('Se requiere una red exclusiva con cumplimiento regulatorio estricto.');
  } else if (answers.governanceLevel === 'standard') {
    env      = 'standard';
    envLabel = 'Entorno privado encriptado';
    justification.push('Cumplimiento estándar con encriptación en tránsito y reposo.');
  }

  // Scale
  if (answers.concurrencyLevel === 'pilot') {
    scale = 'Escala piloto (< 50 usuarios simultáneos)';
    justification.push('El volumen piloto permite una configuración de recursos reducida.');
  } else if (answers.concurrencyLevel === 'department') {
    scale = 'Escala departamental (50–300 usuarios simultáneos)';
    justification.push('El volumen departamental requiere recursos dedicados con alta disponibilidad básica.');
  } else if (answers.concurrencyLevel === 'intensive') {
    scale = 'Escala intensiva (> 300 usuarios o procesos automatizados)';
    justification.push('El volumen intensivo requiere capacidad de cómputo acelerada y arquitectura distribuida.');
  }

  // Data sources
  if (answers.dataSources.includes('docs'))
    justification.push('El procesamiento de documentos no estructurados requiere un módulo de recuperación de contexto (RAG).');
  if (answers.dataSources.includes('databases'))
    justification.push('La integración con bases de datos estructuradas requiere soporte de indexación y conexión SQL local.');
  if (answers.dataSources.includes('apis') && answers.governanceLevel !== 'airgapped')
    justification.push('La integración con APIs externas requiere conectores de red controlados.');
  if (answers.realtimeNeeded)
    justification.push('La latencia crítica en tiempo real requiere prioridad de procesamiento dedicada.');
  if (answers.agentsNeeded)
    justification.push('La ejecución autónoma de agentes requiere orquestación de flujos multi-paso.');

  // Business impact
  if (answers.governanceLevel === 'airgapped' || answers.governanceLevel === 'vpc')
    businessImpact.push({ label: 'Riesgo evitado', value: 'Reduce exposición legal y operativa por procesamiento de datos fuera de la organización.' });
  if (answers.governanceLevel === 'airgapped' || answers.governanceLevel === 'vpc')
    businessImpact.push({ label: 'Soberanía de datos', value: 'Los datos no salen de la infraestructura controlada por la organización.' });
  if (answers.governanceLevel === 'vpc' || answers.processCategory === 'finance' || answers.processCategory === 'health')
    businessImpact.push({ label: 'Compliance habilitado', value: 'Arquitectura compatible con requisitos regulatorios sectoriales estrictos.' });
  if (answers.processCategory === 'finance')
    businessImpact.push({ label: 'Compliance financiero', value: 'Procesamiento bajo normas IFRS/NIF sin exposición externa.' });
  if (answers.processCategory === 'health')
    businessImpact.push({ label: 'Compliance de salud', value: 'Compatible con HIPAA y normativas locales de datos clínicos.' });
  if (answers.processCategory === 'legal')
    businessImpact.push({ label: 'Protección de propiedad intelectual', value: 'Los documentos confidenciales nunca se procesan en infraestructura ajena.' });
  businessImpact.push({ label: 'Predictibilidad de costos', value: 'Tarifa fija de operación, independiente del volumen de consultas.' });
  businessImpact.push({ label: 'Autonomía operativa', value: 'Sin dependencia de disponibilidad ni cambios de política de APIs externas.' });

  const architecture =
    envLabel && scale ? `${envLabel} — ${scale}`
    : envLabel        ? envLabel
    : scale           ? scale
    : null;

  return {
    architecture,
    env,
    scale,
    inferredProfile,
    justification,
    changeReasons,
    simplificationHint,
    businessImpact,
    suggestedModelIds: SML_CATEGORY_MAP[answers.processCategory] || SML_CATEGORY_MAP.other,
  };
}

function buildFinancialScenario(answers) {
  const concurrencyMap  = { pilot: 25, department: 150, intensive: 500 };
  const users           = concurrencyMap[answers.concurrencyLevel] || 25;
  const queriesPerUser  = 20;
  const workingDays     = 22;
  const dailyQueries    = users * queriesPerUser;
  const monthlyQueries  = dailyQueries * workingDays;
  const publicCostMonth = Math.round(monthlyQueries * 0.004);

  const ranges = {
    pilot:      [800,  1500],
    department: [1800, 3500],
    intensive:  [4000, 8000],
  };
  const [nodeMin, nodeMax] = ranges[answers.concurrencyLevel] || ranges.pilot;
  const nodeMid = Math.round((nodeMin + nodeMax) / 2);

  let breakEvenMonths = null;
  if (publicCostMonth >= nodeMid) {
    breakEvenMonths = 1;
  } else if (publicCostMonth > 0) {
    breakEvenMonths = Math.min(36, Math.ceil(nodeMid / publicCostMonth));
  }

  return {
    users,
    queriesPerUser,
    workingDays,
    dailyQueries,
    monthlyQueries,
    publicCostMonth,
    nodeMin,
    nodeMax,
    nodeMid,
    breakEvenMonths,
  };
}

function getOutputStatus(confidence, conflicts) {
  if (confidence === 'low' || conflicts.some(c => c.severity === 'high')) return 'exploratory';
  if (confidence === 'medium') return 'preliminary';
  return 'ready';
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

const CONFIDENCE_CFG = {
  low:    { label: 'Confianza baja',   color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',       dot: 'bg-red-400'     },
  medium: { label: 'Confianza media',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',   dot: 'bg-amber-400'   },
  high:   { label: 'Confianza alta',   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400' },
};

const OUTPUT_STATUS_CFG = {
  exploratory: {
    label:  'Recomendación exploratoria',
    color:  'text-slate-400',
    border: 'border-slate-700',
    note:   'Faltan datos o existen conflictos sin resolver. La recomendación es orientativa y no está lista para propuesta.',
  },
  preliminary: {
    label:  'Recomendación preliminar validable',
    color:  'text-amber-400',
    border: 'border-amber-500/40',
    note:   'La recomendación es preliminar. Puede validarse con el equipo técnico antes de formalizar.',
  },
  ready: {
    label:  'Lista para propuesta comercial',
    color:  'text-emerald-400',
    border: 'border-emerald-500/40',
    note:   null,
  },
};

const STEP_LABELS = {
  1: 'Proceso',
  2: 'Usuarios y volumen',
  3: 'Gobernanza',
  4: 'Fuentes de datos',
  5: 'Operación',
};

const USER_TYPE_LABELS = {
  devs:      'Desarrolladores internos',
  employees: 'Empleados no técnicos',
  external:  'Clientes externos',
  automated: 'Procesos automatizados',
};

function formatStepValue(step, answers) {
  if (step === 1) {
    const cat = PROCESS_CATEGORIES.find(c => c.id === answers.processCategory);
    return cat ? cat.label : '—';
  }
  if (step === 2) {
    const vol = CONCURRENCY_OPTIONS.find(o => o.id === answers.concurrencyLevel);
    const users = answers.userTypes.map(id => USER_TYPE_LABELS[id]).join(', ');
    return [users || null, vol?.label].filter(Boolean).join(' · ') || '—';
  }
  if (step === 3) {
    const gov = GOVERNANCE_OPTIONS.find(o => o.id === answers.governanceLevel);
    return gov ? gov.label : '—';
  }
  if (step === 4) {
    const sources = answers.dataSources
      .map(id => DATA_SOURCES.find(s => s.id === id)?.label)
      .filter(Boolean);
    return sources.length ? sources.join(', ') : '—';
  }
  if (step === 5) {
    const ops = [];
    if (answers.realtimeNeeded) ops.push('Tiempo real');
    if (answers.agentsNeeded)   ops.push('Agentes / lotes');
    return ops.length ? ops.join(', ') : 'Sin requisitos operativos';
  }
  return '—';
}

function getSensitivityLabel(governanceLevel) {
  if (governanceLevel === 'airgapped') return 'Crítica (aislamiento total)';
  if (governanceLevel === 'vpc')       return 'Alta (cumplimiento estricto)';
  if (governanceLevel === 'standard')  return 'Media (operaciones internas)';
  return '—';
}

const TOTAL_STEPS = 5;

const initialAnswers = {
  processCategory:    '',
  processDescription: '',
  userTypes:          [],
  concurrencyLevel:   '',
  governanceLevel:    '',
  dataSources:        [],
  realtimeNeeded:     false,
  agentsNeeded:       false,
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ClientWizard = () => {
  const { fetchWithAuth, API_URL } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]                     = useState(1);
  const [answers, setAnswers]               = useState(initialAnswers);
  const [editingFromOutput, setEditingFromOutput] = useState(null);
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState(null);
  const [submitted, setSubmitted]           = useState(false);

  // Derived
  const conflicts       = useMemo(() => detectConflicts(answers),                           [answers]);
  const confidence      = useMemo(() => calculateConfidence(answers, conflicts, step),    [answers, conflicts, step]);
  const recommendation  = useMemo(() => buildRecommendation(answers, conflicts, confidence), [answers, conflicts, confidence]);
  const financial       = useMemo(() => buildFinancialScenario(answers),                    [answers]);
  const outputStatus    = useMemo(() => getOutputStatus(confidence, conflicts),              [confidence, conflicts]);
  const assumptionsGaps = useMemo(() => buildAssumptionsAndGaps(answers, conflicts, step), [answers, conflicts, step]);

  // Helpers
  const setAnswer = useCallback((key, value) =>
    setAnswers(prev => ({ ...prev, [key]: value })), []);

  const toggleArr = useCallback((key, value) =>
    setAnswers(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    })), []);

  const canAdvance = useMemo(() => {
    if (step === 1) return !!answers.processCategory;
    if (step === 2) return !!answers.concurrencyLevel;
    if (step === 3) return !!answers.governanceLevel;
    if (step === 4) return answers.dataSources.length > 0;
    return true;
  }, [step, answers]);

  const goNext = () => {
    if (editingFromOutput !== null) { setEditingFromOutput(null); setStep(6); }
    else if (step < TOTAL_STEPS)   setStep(s => s + 1);
    else                           setStep(6);
  };

  const goBack = () => {
    if (editingFromOutput !== null) { setEditingFromOutput(null); setStep(6); }
    else if (step > 1)             setStep(s => s - 1);
  };

  const editStep = s => { setEditingFromOutput(s); setStep(s); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const concurrencyMap = { pilot: 25, department: 150, intensive: 500 };
    const useCases = [
      ...answers.userTypes,
      ...answers.dataSources,
      answers.realtimeNeeded ? 'realtime'  : null,
      answers.agentsNeeded   ? 'agents'    : null,
    ].filter(Boolean);

    const payload = {
      problem_description: `[${answers.processCategory}] ${answers.processDescription || 'Sin descripción adicional.'}`,
      expected_users_concurrent: concurrencyMap[answers.concurrencyLevel] || 25,
      data_sensitivity:
        answers.governanceLevel === 'airgapped' ? 'critical'
        : answers.governanceLevel === 'vpc'     ? 'high'
        : 'medium',
      use_cases_priority: useCases,
      current_ia_pain_points: recommendation.justification.join(' '),
    };

    try {
      const res = await fetchWithAuth(`${API_URL}/client-needs`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar el diagnóstico.');
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-6" style={{ minHeight: 'calc(100vh - 56px)' }}>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Diagnóstico de Infraestructura de IA</h1>
        <p className="text-sm text-slate-400 mt-1">
          Responde las preguntas a continuación. El sistema construye una recomendación de arquitectura en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">

        {/* LEFT ─────────────────────────────────────────────────────────── */}
        <div className="min-w-0">

          {/* Step progress */}
          {step <= TOTAL_STEPS && (
            <div className="flex items-center gap-1 mb-5">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
                const s = i + 1;
                const done   = s < step;
                const active = s === step;
                return (
                  <React.Fragment key={s}>
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border transition-all
                      ${done   ? 'bg-[#06b6d4] border-[#06b6d4] text-white' :
                        active ? 'border-[#06b6d4] text-[#06b6d4] bg-[#06b6d4]/10' :
                                 'border-slate-700 text-slate-600'}`}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : s}
                    </div>
                    {i < TOTAL_STEPS - 1 && (
                      <div className={`flex-1 h-px ${done ? 'bg-[#06b6d4]/60' : 'bg-slate-800'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Editing badge */}
          {editingFromOutput !== null && (
            <div className="flex items-center gap-2 mb-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
              <Edit2 className="h-3.5 w-3.5 shrink-0" />
              Editando: <span className="font-medium">{STEP_LABELS[editingFromOutput]}</span>
              <span className="text-amber-500">— el resto de tus respuestas se conservan.</span>
            </div>
          )}

          {/* ── Step 1 ───────────────────────────────────────────────── */}
          {step === 1 && (
            <StepCard
              title="¿Qué proceso quiere acelerar o proteger?"
              description="Selecciona la categoría que mejor describe el caso de uso principal."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {PROCESS_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setAnswer('processCategory', cat.id)}
                    className={`text-left p-4 rounded-xl border transition-all
                      ${answers.processCategory === cat.id
                        ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                        : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'}`}
                  >
                    <p className={`font-semibold text-sm ${answers.processCategory === cat.id ? 'text-white' : 'text-slate-200'}`}>
                      {cat.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1.5">
                  Contexto adicional <span className="normal-case text-slate-600">(opcional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej: Necesitamos revisar cientos de contratos diariamente para extraer cláusulas de renovación..."
                  value={answers.processDescription}
                  onChange={e => setAnswer('processDescription', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-600 resize-none focus:border-[#06b6d4] focus:outline-none transition-colors"
                />
              </div>
            </StepCard>
          )}

          {/* ── Step 2 ───────────────────────────────────────────────── */}
          {step === 2 && (
            <StepCard
              title="¿Quiénes lo usarán y con qué frecuencia?"
              description="Define el perfil de acceso y el volumen esperado de uso simultáneo."
            >
              <div className="mb-5">
                <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-2">
                  Perfil de usuarios <span className="normal-case text-slate-600">(selecciona todos los que apliquen)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'devs',      label: 'Desarrolladores internos'  },
                    { id: 'employees', label: 'Empleados no técnicos'      },
                    { id: 'external',  label: 'Clientes externos'          },
                    { id: 'automated', label: 'Procesos automatizados'     },
                  ].map(ut => (
                    <button
                      key={ut.id}
                      onClick={() => toggleArr('userTypes', ut.id)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all
                        ${answers.userTypes.includes(ut.id)
                          ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[#06b6d4] font-medium'
                          : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      {ut.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-2">
                  Uso simultáneo estimado
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CONCURRENCY_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswer('concurrencyLevel', opt.id)}
                      className={`text-left p-4 rounded-xl border transition-all
                        ${answers.concurrencyLevel === opt.id
                          ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                          : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'}`}
                    >
                      <p className={`font-semibold text-sm ${answers.concurrencyLevel === opt.id ? 'text-white' : 'text-slate-200'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.sublabel}</p>
                    </button>
                  ))}
                </div>
              </div>
            </StepCard>
          )}

          {/* ── Step 3 ───────────────────────────────────────────────── */}
          {step === 3 && (
            <StepCard
              title="¿Cuánto control necesita sobre sus datos?"
              description="Define el nivel de gobernanza y aislamiento requerido."
            >
              <div className="space-y-3">
                {GOVERNANCE_OPTIONS.map(opt => {
                  const selected = answers.governanceLevel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswer('governanceLevel', opt.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all
                        ${selected
                          ? opt.exceptional
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-[#06b6d4] bg-[#06b6d4]/10'
                          : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {opt.exceptional && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                Condición avanzada
                              </span>
                            )}
                            <p className={`font-semibold text-sm ${selected ? 'text-white' : 'text-slate-200'}`}>
                              {opt.label}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500">{opt.description}</p>
                          {opt.exceptional && selected && (
                            <p className="text-xs text-amber-400/90 mt-2">
                              Implica: sin conectividad externa en tiempo real, administración técnica local continua, mayor complejidad de despliegue inicial.
                            </p>
                          )}
                        </div>
                        {opt.exceptional
                          ? <Lock  className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          : <Shield className="h-4 w-4 text-[#06b6d4] shrink-0 mt-0.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </StepCard>
          )}

          {/* ── Step 4 ───────────────────────────────────────────────── */}
          {step === 4 && (
            <StepCard
              title="¿Con qué tipo de información trabajará el sistema?"
              description="Selecciona todas las fuentes de datos que el sistema deberá procesar."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DATA_SOURCES.map(({ id, label, sublabel, Icon }) => {
                  const sel = answers.dataSources.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleArr('dataSources', id)}
                      className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3
                        ${sel
                          ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                          : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'}`}
                    >
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${sel ? 'text-[#06b6d4]' : 'text-slate-500'}`} />
                      <div>
                        <p className={`font-semibold text-sm ${sel ? 'text-white' : 'text-slate-200'}`}>{label}</p>
                        <p className="text-xs text-slate-500">{sublabel}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </StepCard>
          )}

          {/* ── Step 5 ───────────────────────────────────────────────── */}
          {step === 5 && (
            <StepCard
              title="¿Cómo necesita responder el sistema?"
              description="Indica los requisitos operativos del nodo. Ambas opciones son independientes."
            >
              <div className="space-y-3">
                <ToggleOption
                  label="Respuesta en tiempo real"
                  sublabel="El sistema debe responder en milisegundos. Implica prioridad de procesamiento y posiblemente hardware de cómputo dedicado."
                  icon={<Zap className="h-4 w-4" />}
                  active={answers.realtimeNeeded}
                  onChange={() => setAnswer('realtimeNeeded', !answers.realtimeNeeded)}
                />
                <ToggleOption
                  label="Automatización mediante agentes"
                  sublabel="El sistema ejecuta flujos autónomos o procesos por lotes sin intervención humana continua."
                  icon={<Activity className="h-4 w-4" />}
                  active={answers.agentsNeeded}
                  onChange={() => setAnswer('agentsNeeded', !answers.agentsNeeded)}
                />
              </div>
            </StepCard>
          )}

          {/* ── Step 6: Output ───────────────────────────────────────── */}
          {step === 6 && (
            <OutputPanel
              answers={answers}
              recommendation={recommendation}
              financial={financial}
              outputStatus={outputStatus}
              conflicts={conflicts}
              confidence={confidence}
              assumptionsGaps={assumptionsGaps}
              onEditStep={editStep}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitted={submitted}
              submitError={submitError}
              onDashboard={() => navigate('/dashboard')}
            />
          )}

          {/* Navigation */}
          {step <= TOTAL_STEPS && (
            <div className="flex justify-between mt-5">
              <button
                onClick={goBack}
                disabled={step === 1 && editingFromOutput === null}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                {editingFromOutput !== null ? 'Cancelar edición' : 'Anterior'}
              </button>
              <button
                onClick={goNext}
                disabled={!canAdvance}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#06b6d4] text-white font-medium text-sm hover:bg-[#0ea5e9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {editingFromOutput !== null
                  ? 'Aplicar cambio'
                  : step === TOTAL_STEPS ? 'Ver recomendación' : 'Siguiente'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>

        {/* RIGHT: Reasoning Panel ─────────────────────────────────────────── */}
        <div className="min-w-0">
          <ReasoningPanel
            answers={answers}
            recommendation={recommendation}
            conflicts={conflicts}
            confidence={confidence}
            step={step}
            assumptionsGaps={assumptionsGaps}
          />
        </div>

      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepCard = ({ title, description, children }) => (
  <div className="bg-[#0b1426] border border-[#1e3a8a]/40 rounded-2xl p-6">
    <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
    <p className="text-sm text-slate-400 mb-5">{description}</p>
    {children}
  </div>
);

const ToggleOption = ({ label, sublabel, icon, active, onChange }) => (
  <button
    onClick={onChange}
    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4
      ${active ? 'border-[#06b6d4] bg-[#06b6d4]/10' : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'}`}
  >
    <div className={`mt-0.5 shrink-0 ${active ? 'text-[#06b6d4]' : 'text-slate-600'}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className={`font-semibold text-sm ${active ? 'text-white' : 'text-slate-300'}`}>{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
    </div>
    <div className={`w-10 h-5 rounded-full flex items-center transition-colors shrink-0 mt-0.5
      ${active ? 'bg-[#06b6d4] justify-end pr-0.5' : 'bg-slate-700 justify-start pl-0.5'}`}>
      <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
    </div>
  </button>
);

const ReasoningPanel = ({ answers, recommendation, conflicts, confidence, step, assumptionsGaps }) => {
  const cfg = CONFIDENCE_CFG[confidence];
  const hasAny = answers.processCategory || answers.concurrencyLevel || answers.governanceLevel;

  return (
    <div className="bg-[#0b1426] border border-[#1e3a8a]/40 rounded-2xl p-5 space-y-5 sticky top-4">
      <div>
        <h3 className="text-sm font-bold text-white">Panel de razonamiento</h3>
        <p className="text-xs text-slate-600 mt-0.5">Explica qué entiende el sistema y por qué recomienda lo que recomienda.</p>
      </div>

      {/* D. Señal de confianza */}
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">D. Señal de confianza del diagnóstico</p>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${cfg.bg} ${cfg.color}`}>
          <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
          {cfg.label}
        </div>
        <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
          {confidence === 'low' && 'Menos de 3 pasos respondidos o conflictos sin resolver.'}
          {confidence === 'medium' && 'Respuestas parciales, supuestos abiertos o coherencia parcial.'}
          {confidence === 'high' && 'Todos los pasos respondidos, sin conflictos activos y supuestos mínimos.'}
        </p>
      </div>

      {/* A. Perfil inferido */}
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">A. Perfil inferido</p>
        {hasAny && recommendation.inferredProfile ? (
          <p className="text-xs text-slate-300 leading-relaxed italic">{recommendation.inferredProfile}</p>
        ) : (
          <p className="text-xs text-slate-600">Responde las preguntas para construir un perfil de caso de uso.</p>
        )}
      </div>

      {/* B. Por qué cambió la recomendación */}
      {(recommendation.changeReasons.length > 0 || recommendation.simplificationHint) && (
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">B. Por qué cambió la recomendación</p>
          <ul className="space-y-1.5">
            {recommendation.changeReasons.map((reason, i) => (
              <li key={i} className="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5">
                <span className="text-[#06b6d4] shrink-0">→</span>
                {reason}
              </li>
            ))}
          </ul>
          {recommendation.simplificationHint && (
            <p className="text-xs text-slate-500 mt-2 italic border-t border-slate-800 pt-2">
              Para simplificar o reducir costo: {recommendation.simplificationHint}
            </p>
          )}
        </div>
      )}

      {/* C. Contradicciones detectadas */}
      {conflicts.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider">C. Contradicciones detectadas</p>
          {conflicts.map(c => (
            <div
              key={c.id}
              className={`p-3 rounded-lg border text-xs
                ${c.severity === 'high'
                  ? 'border-red-500/40 bg-red-500/10'
                  : 'border-amber-500/30 bg-amber-500/10'}`}
            >
              <p className={`font-semibold mb-1 ${c.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                Conflicto {c.id}: {c.title}
              </p>
              <p className="text-slate-300 mb-1">{c.message}</p>
              <p className="text-slate-500 italic">{c.suggestion}</p>
            </div>
          ))}
          <p className="text-[11px] text-amber-500/80">La recomendación queda condicionada hasta resolver estos conflictos.</p>
        </div>
      ) : hasAny && step < 6 && (
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">C. Contradicciones detectadas</p>
          <p className="text-xs text-slate-600">No se detectaron conflictos entre las respuestas actuales.</p>
        </div>
      )}

      {/* Supuestos abiertos (contexto para confianza) */}
      {assumptionsGaps.assumptions.length > 0 && step < 6 && (
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">Supuestos abiertos</p>
          <ul className="space-y-1">
            {assumptionsGaps.assumptions.slice(0, 3).map((a, i) => (
              <li key={i} className="text-[11px] text-slate-600 leading-relaxed">— {a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const OutputPanel = ({
  answers, recommendation, financial, outputStatus,
  conflicts, confidence, assumptionsGaps, onEditStep,
  onSubmit, submitting, submitted, submitError, onDashboard,
}) => {
  const statusCfg = OUTPUT_STATUS_CFG[outputStatus];
  const confCfg   = CONFIDENCE_CFG[confidence];
  const canSubmit = outputStatus !== 'exploratory' && !submitted;

  return (
    <div className="space-y-4">

      {/* Status header */}
      <div className={`bg-[#0b1426] border rounded-2xl p-5 ${statusCfg.border}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="text-base font-bold text-white">Resultado del diagnóstico</h2>
          <span className={`text-xs font-medium shrink-0 mt-0.5 ${statusCfg.color}`}>{statusCfg.label}</span>
        </div>
        <div className={`inline-flex items-center gap-1.5 text-xs ${confCfg.color}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${confCfg.dot}`} />
          {confCfg.label}
        </div>
        {statusCfg.note && (
          <p className="text-xs text-slate-500 mt-2">{statusCfg.note}</p>
        )}
      </div>

      {/* 1. Perfil detectado */}
      <OutputSection title="1. Perfil detectado">
        {recommendation.inferredProfile && (
          <p className="text-sm text-slate-300 mb-3 leading-relaxed">{recommendation.inferredProfile}</p>
        )}
        <div className="space-y-0 divide-y divide-slate-800">
          {[1, 2, 3, 4, 5].map(s => (
            <EditableRow
              key={s}
              label={STEP_LABELS[s]}
              value={formatStepValue(s, answers)}
              onEdit={() => onEditStep(s)}
            />
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500">Tipo de usuarios: </span>
            <span className="text-slate-300">
              {answers.userTypes.length
                ? answers.userTypes.map(id => USER_TYPE_LABELS[id]).join(', ')
                : 'No especificado'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Sensibilidad de datos: </span>
            <span className="text-slate-300">{getSensitivityLabel(answers.governanceLevel)}</span>
          </div>
        </div>
        {answers.processDescription && (
          <p className="text-xs text-slate-500 mt-3 italic border-t border-slate-800 pt-3">
            &ldquo;{answers.processDescription}&rdquo;
          </p>
        )}
      </OutputSection>

      {/* 2. Arquitectura sugerida */}
      <OutputSection title="2. Arquitectura sugerida">
        {recommendation.architecture
          ? <p className="text-sm text-white font-medium">{recommendation.architecture}</p>
          : <p className="text-xs text-slate-500">Define gobernanza y volumen para completar esta sección.</p>
        }
        <p className="text-xs text-slate-600 mt-2">
          Los valores concretos de hardware y licencias se definen en la propuesta formal.
        </p>
      </OutputSection>

      {/* 3. Justificación */}
      {recommendation.justification.length > 0 && (
        <OutputSection title="3. Justificación">
          <ul className="space-y-2">
            {recommendation.justification.map((j, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-[#06b6d4] shrink-0 mt-0.5">→</span>
                {j}
              </li>
            ))}
          </ul>
        </OutputSection>
      )}

      {/* 4. Impacto de negocio */}
      {recommendation.businessImpact.length > 0 && (
        <OutputSection title="4. Impacto de negocio">
          <div className="space-y-3">
            {recommendation.businessImpact.map((item, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-white">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </OutputSection>
      )}

      {/* 5. Supuestos y escenario financiero */}
      <OutputSection title="5. Supuestos y límites">
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-400 mb-2">Qué asumió el sistema</p>
          <ul className="space-y-1">
            {assumptionsGaps.assumptions.map((a, i) => (
              <li key={i} className="text-xs text-slate-500">— {a}</li>
            ))}
          </ul>
        </div>

        {assumptionsGaps.missingForProposal.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 mb-2">Información faltante para propuesta definitiva</p>
            <ul className="space-y-1">
              {assumptionsGaps.missingForProposal.map((m, i) => (
                <li key={i} className="text-xs text-amber-500/80">— {m}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs font-semibold text-slate-400 mb-2">
          Escenario comparativo <span className="font-normal text-slate-600">(basado en los parámetros ingresados)</span>
        </p>
        <div className="bg-slate-900/60 rounded-xl p-4 space-y-2 text-xs border border-slate-800">
          <Row
            label="Volumen asumido"
            value={`${financial.users} usuarios simultáneos, ~${financial.dailyQueries.toLocaleString()} consultas/día`}
          />
          <Row
            label="Supuesto de uso por consulta"
            value={`${financial.queriesPerUser} consultas/día por usuario (${financial.workingDays} días hábiles/mes)`}
          />
          <Row
            label="Costo estimado con APIs públicas por consumo"
            value={`$${financial.publicCostMonth.toLocaleString()}/mes (variable según uso real)`}
          />
          <Row
            label="Costo referencial de nodo dedicado"
            value={`$${financial.nodeMin.toLocaleString()}–$${financial.nodeMax.toLocaleString()}/mes (tarifa fija)`}
          />
          {financial.breakEvenMonths && (
            <Row
              label="Punto de equilibrio estimado"
              value={
                financial.breakEvenMonths === 1
                  ? 'Desde el primer mes con el volumen actual'
                  : `~${financial.breakEvenMonths} meses de uso al ritmo estimado`
              }
            />
          )}
        </div>
        <p className="text-[11px] text-slate-600 mt-2 italic">
          Esta simulación es orientativa. Los supuestos de uso se muestran explícitamente para que pueda validarlos.
          El costo real del nodo se define en la propuesta formal.
        </p>

        {conflicts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <p className="text-xs text-amber-400 mb-1 font-medium">Condicionantes activos sobre la propuesta:</p>
            {conflicts.map(c => (
              <p key={c.id} className="text-xs text-slate-600">— Conflicto {c.id}: {c.title}</p>
            ))}
          </div>
        )}
      </OutputSection>

      {/* Submit error */}
      {submitError && (
        <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/40 rounded-xl text-red-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {submitError}
        </div>
      )}

      {/* 6. Siguiente paso */}
      <OutputSection title="6. Siguiente paso">
        <p className="text-xs text-slate-500 mb-4">
          Guarde el diagnóstico para que el equipo ProxDeep elabore una propuesta comercial formal
          basada en este perfil y arquitectura sugerida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDashboard}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white transition-all text-sm"
          >
            Ir al dashboard
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit || submitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#06b6d4] text-white font-medium text-sm hover:bg-[#0ea5e9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {submitted
              ? <><Check className="h-4 w-4" /> Diagnóstico guardado</>
              : submitting
                ? 'Guardando...'
                : <><Send className="h-4 w-4" /> Guardar diagnóstico y solicitar propuesta</>}
          </button>
        </div>
        {outputStatus === 'exploratory' && !submitted && (
          <p className="text-xs text-slate-600 mt-3">
            Resuelve los conflictos activos o completa las respuestas pendientes para habilitar el envío.
            Puedes editar cualquier respuesta con el icono de edición arriba.
          </p>
        )}
      </OutputSection>
    </div>
  );
};

const OutputSection = ({ title, children }) => (
  <div className="bg-[#0b1426] border border-[#1e3a8a]/40 rounded-2xl p-5">
    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">{title}</h3>
    {children}
  </div>
);

const EditableRow = ({ label, value, onEdit }) => (
  <div className="flex items-center justify-between py-2 gap-3">
    <span className="text-xs text-slate-500 shrink-0">{label}</span>
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs text-white font-medium text-right truncate">{value || '—'}</span>
      <button
        onClick={onEdit}
        title="Editar esta respuesta"
        className="text-slate-700 hover:text-[#06b6d4] transition-colors shrink-0"
      >
        <Edit2 className="h-3 w-3" />
      </button>
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-3">
    <span className="text-slate-500">{label}</span>
    <span className="text-white font-medium text-right">{value}</span>
  </div>
);

export default ClientWizard;
