import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChevronRight, Check, AlertCircle, Send,
  Edit2, Shield, Lock,
} from 'lucide-react';

// ─── Static Data ─────────────────────────────────────────────────────────────

const INFRA_OPTIONS = [
  {
    id: 'from_scratch',
    label: 'Automatización Inteligente (Desde Cero)',
    description: 'No contamos con sistemas propietarios optimizados; buscamos desarrollar flujos de trabajo e infraestructura digital desde su base.',
    summaryBadge: 'Infraestructura: Desde cero',
    accent: 'cyan',
  },
  {
    id: 'existing',
    label: 'Optimización de Procesos (Infraestructura Existente)',
    description: 'Contamos con software operativo (CRM, ERP o bases de datos) y buscamos integrar capas de IA o automatizar procesos sobre ellos.',
    summaryBadge: 'Infraestructura: Sistemas existentes',
    accent: 'violet',
  },
];

const SCOPE_OPTIONS = [
  {
    id: 'internal_ops',
    label: 'Operaciones y Procesos Internos',
    description: 'Reducir tareas repetitivas, procesamiento de documentos o flujos manuales.',
    summaryBadge: 'Foco: Operaciones',
  },
  {
    id: 'customer_channels',
    label: 'Atención y Canales de Cara al Cliente',
    description: 'Automatizar soporte técnico, flujos conversacionales o gestión de requerimientos.',
    summaryBadge: 'Foco: Clientes',
  },
  {
    id: 'data_analytics',
    label: 'Análisis de Datos y Reportes',
    description: 'Centralizar información dispersa para analítica predictiva o toma de decisiones.',
    summaryBadge: 'Foco: Analítica',
  },
];

const STACK_OPTIONS = [
  {
    id: 'saas_apis',
    label: 'SaaS y Nube Comercial',
    description: 'Utilizamos plataformas modernas con APIs abiertas como Salesforce, HubSpot o SAP.',
    summaryBadge: 'Stack: SaaS/APIs',
  },
  {
    id: 'on_premise',
    label: 'Sistemas Legacy o Locales (On-Premise)',
    description: 'Operamos con bases de datos internas o software cerrado de difícil acceso.',
    summaryBadge: 'Stack: On-Premise',
  },
  {
    id: 'fragmented',
    label: 'Ecosistema Fragmentado',
    description: 'Los datos están dispersos en múltiples herramientas independientes que no se comunican.',
    summaryBadge: 'Stack: Fragmentado',
  },
];

const SCALE_OPTIONS = [
  {
    id: 'focalizada',
    label: 'Flujo Focalizado / Equipos Iniciales',
    description: 'Procesos de un departamento específico, volúmenes moderados de datos y despliegue directo.',
    summaryBadge: 'Escala: Focalizada',
    concurrentUsers: 50,
    nodeRange: [800, 1500],
  },
  {
    id: 'enterprise',
    label: 'Despliegue Corporativo / Contenedores',
    description: 'Alta demanda simultánea, flujos transversales y preferencia por ambientes estandarizados en Docker/Kubernetes.',
    summaryBadge: 'Escala: Enterprise',
    concurrentUsers: 250,
    nodeRange: [1800, 3500],
  },
];

const SECURITY_OPTIONS = [
  {
    id: 'standard_flex',
    label: 'Estándar / Flexibilidad Alta',
    description: 'Podemos operar con modelos comerciales en la nube bajo políticas de privacidad estándar.',
    summaryBadge: 'Seguridad: Nube Estándar',
    exceptional: false,
  },
  {
    id: 'strict_private',
    label: 'Crítico / Restricción Estricta (LGPD/Enterprise)',
    description: 'Manejamos datos altamente sensibles. Requerimos modelos privados, encriptación avanzada o aislamiento local.',
    summaryBadge: 'Seguridad: Privada/LGPD',
    exceptional: true,
  },
];

// Maps branch choice to SML IDs from mockData
const BRANCH_SML_MAP = {
  internal_ops:      [5],
  customer_channels: [5],
  data_analytics:    [4, 7],
  saas_apis:         [5],
  on_premise:        [5],
  fragmented:        [6],
};

// ─── Decision Logic ───────────────────────────────────────────────────────────

function getBranchChoice(answers) {
  return answers.infraMode === 'from_scratch' ? answers.scopeFocus : answers.stackComplexity;
}

function getConcurrentUsers(answers) {
  const scale = SCALE_OPTIONS.find(o => o.id === answers.scaleEnvironment);
  return scale?.concurrentUsers ?? 50;
}

function detectConflicts(answers) {
  const conflicts = [];

  if (answers.governanceLevel === 'strict_private' && answers.stackComplexity === 'saas_apis') {
    conflicts.push({
      id: 'A', severity: 'high',
      title: 'Restricción estricta de privacidad + Stack SaaS con APIs comerciales',
      message: 'Un despliegue privado o local con datos críticos limita el uso directo de APIs de terceros en la nube pública.',
      suggestion: 'Considere conectores controlados en VPC o evalúe flexibilidad estándar si la integración SaaS es indispensable.',
    });
  }

  if (answers.governanceLevel === 'strict_private' && answers.stackComplexity === 'fragmented') {
    conflicts.push({
      id: 'B', severity: 'medium',
      title: 'Datos fragmentados + Requisitos de seguridad crítica',
      message: 'Unificar datos dispersos bajo gobernanza estricta requiere fase de integración y clasificación previa.',
      suggestion: 'Priorice un inventario de fuentes y un plan de consolidación antes del despliegue del nodo de IA.',
    });
  }

  if (answers.infraMode === 'from_scratch' && answers.scopeFocus === 'customer_channels' && answers.governanceLevel === 'strict_private') {
    conflicts.push({
      id: 'C', severity: 'medium',
      title: 'Canales de cliente + Seguridad crítica',
      message: 'Automatizar atención al cliente con restricciones estrictas implica arquitectura dedicada y latencia controlada.',
      suggestion: 'Valide volumen de interacciones y políticas de retención antes de dimensionar cómputo.',
    });
  }

  return conflicts;
}

function calculateConfidence(answers, conflicts, maxVisibleStep = 4) {
  let completed = 0;
  if (answers.infraMode)          completed++;
  if (getBranchChoice(answers)) completed++;
  if (answers.scaleEnvironment) completed++;
  if (answers.governanceLevel)  completed++;

  const hasHigh   = conflicts.some(c => c.severity === 'high');
  const hasMedium = conflicts.some(c => c.severity === 'medium');

  if (completed < 3 || hasHigh) return 'low';
  if (completed < 4 || hasMedium || maxVisibleStep < 4) return 'medium';
  return 'high';
}

function buildInferredProfile(answers) {
  if (
    !answers.infraMode &&
    !getBranchChoice(answers) &&
    !answers.scaleEnvironment &&
    !answers.governanceLevel
  ) {
    return null;
  }

  const segments = [];

  if (answers.infraMode === 'from_scratch') {
    segments.push('implementación de IA desde cero');
  } else if (answers.infraMode === 'existing') {
    segments.push('integración de IA sobre infraestructura existente');
  }

  if (answers.infraMode === 'from_scratch') {
    const scope = SCOPE_OPTIONS.find(o => o.id === answers.scopeFocus);
    if (scope) segments.push(scope.label.toLowerCase());
  } else if (answers.infraMode === 'existing') {
    const stack = STACK_OPTIONS.find(o => o.id === answers.stackComplexity);
    if (stack) segments.push(stack.label.toLowerCase());
  }

  if (answers.scaleEnvironment === 'focalizada') {
    segments.push('escala focalizada por departamento');
  } else if (answers.scaleEnvironment === 'enterprise') {
    segments.push('despliegue corporativo con contenedores');
  }

  if (answers.governanceLevel === 'strict_private') {
    segments.push('requisitos normativos y de privacidad estrictos (LGPD/enterprise)');
  } else if (answers.governanceLevel === 'standard_flex') {
    segments.push('operación con flexibilidad en nube estándar');
  }

  return `Se detecta un caso corporativo de ${segments.join(' con ')}.`;
}

function buildChangeReasons(answers) {
  const reasons = [];

  if (answers.governanceLevel === 'strict_private') {
    reasons.push('Al seleccionar restricción estricta, el entorno recomendado pasó a despliegue privado o canal dedicado enterprise.');
  } else if (answers.governanceLevel === 'standard_flex') {
    reasons.push('Con flexibilidad estándar, el entorno recomendado permite operación en nube comercial con políticas de privacidad regulares.');
  }

  if (answers.infraMode === 'from_scratch') {
    reasons.push('La creación desde cero activa diseño de flujos, orquestación y capa de infraestructura digital como base del proyecto.');
  } else if (answers.infraMode === 'existing') {
    reasons.push('La infraestructura existente orienta la recomendación hacia integración, conectores y automatización sobre sistemas operativos.');
  }

  if (answers.scaleEnvironment === 'enterprise') {
    reasons.push('El despliegue corporativo activa ambientes estandarizados en contenedores y mayor capacidad simultánea.');
  } else if (answers.scaleEnvironment === 'focalizada') {
    reasons.push('La escala focalizada permite un despliegue directo acotado a equipos o departamentos iniciales.');
  }

  if (answers.stackComplexity === 'saas_apis') {
    reasons.push('El stack SaaS/APIs requiere conectores de integración y gobernanza de acceso a servicios externos.');
  } else if (answers.stackComplexity === 'on_premise') {
    reasons.push('Los sistemas on-premise/legacy implican conectividad controlada y posible middleware de acceso a datos.');
  } else if (answers.stackComplexity === 'fragmented') {
    reasons.push('Un ecosistema fragmentado requiere capa de consolidación e indexación antes de la inferencia de IA.');
  }

  if (answers.scopeFocus === 'data_analytics') {
    reasons.push('El foco analítico prioriza pipelines de datos, reportes y modelos orientados a decisión.');
  } else if (answers.scopeFocus === 'customer_channels') {
    reasons.push('Los canales de cliente activan automatización conversacional y triaje de requerimientos.');
  }

  return reasons;
}

function buildSimplificationHint(answers) {
  if (answers.governanceLevel === 'strict_private' && answers.stackComplexity === 'saas_apis') {
    return 'Evaluar flexibilidad estándar o conectores en VPC reduciría la fricción con integraciones SaaS.';
  }
  if (answers.stackComplexity === 'fragmented') {
    return 'Consolidar fuentes críticas antes del despliegue simplificaría la arquitectura y reduciría costo inicial.';
  }
  if (answers.infraMode === 'from_scratch') {
    return 'Acotar el primer caso de uso operativo aceleraría el time-to-value del despliegue inicial.';
  }
  return null;
}

function buildAssumptionsAndGaps(answers, conflicts, showOutput = false) {
  const assumptions = [];
  const missingForProposal = [];

  const users = getConcurrentUsers(answers);
  assumptions.push(`Se proyectan ~${users} usuarios concurrentes según la escala seleccionada (${answers.scaleEnvironment || 'pendiente'}).`);
  assumptions.push('Se estiman 20 consultas diarias por usuario y 22 días hábiles al mes para la proyección de costos.');

  if (!answers.scaleEnvironment) {
    missingForProposal.push('Dimensión operativa y entorno técnico del proyecto.');
  }

  if (answers.infraMode === 'existing' && answers.stackComplexity === 'fragmented') {
    missingForProposal.push('Inventario de sistemas fuente y mapa de integración entre herramientas.');
  }

  if (answers.governanceLevel === 'strict_private') {
    missingForProposal.push('Validación legal/compliance sobre retención, residencia y clasificación de datos.');
  }

  if (conflicts.length > 0) {
    missingForProposal.push('Resolución de conflictos entre stack, integraciones y requisitos de seguridad.');
  }

  if (showOutput && !getBranchChoice(answers)) {
    missingForProposal.push('Definición del alcance operativo o complejidad del stack.');
  }

  return { assumptions, missingForProposal };
}

function buildRecommendation(answers) {
  let envLabel = null;
  let scale    = null;
  const justification  = [];
  const businessImpact = [];
  const changeReasons  = buildChangeReasons(answers);
  const simplificationHint = buildSimplificationHint(answers);
  const inferredProfile = buildInferredProfile(answers);
  const branchId = getBranchChoice(answers);

  const scaleOpt = SCALE_OPTIONS.find(o => o.id === answers.scaleEnvironment);

  if (answers.governanceLevel === 'strict_private') {
    envLabel = 'Entorno privado enterprise (VPC / aislamiento LGPD)';
    justification.push('Los requisitos críticos de privacidad exigen modelos privados, encriptación avanzada o aislamiento local.');
  } else if (answers.governanceLevel === 'standard_flex') {
    envLabel = 'Nube comercial con políticas estándar';
    justification.push('La flexibilidad alta permite operar con modelos comerciales bajo políticas de privacidad estándar.');
  }

  if (scaleOpt) {
    scale = scaleOpt.label;
    justification.push(scaleOpt.description);
  } else if (answers.infraMode === 'from_scratch') {
    scale = 'Implementación greenfield — diseño de flujos e infraestructura digital';
  } else if (answers.infraMode === 'existing') {
    scale = 'Integración sobre stack operativo existente';
  }

  if (answers.infraMode === 'from_scratch') {
    justification.push('Al partir desde cero, la arquitectura incluye diseño de procesos, orquestación y base tecnológica.');
  } else if (answers.infraMode === 'existing') {
    justification.push('La presencia de CRM/ERP/bases de datos orienta conectores, APIs y capas de automatización sobre sistemas vigentes.');
  }

  if (answers.scopeFocus === 'internal_ops') {
    justification.push('El foco operativo interno prioriza automatización documental, RAG y reducción de tareas repetitivas.');
  }
  if (answers.scopeFocus === 'customer_channels') {
    justification.push('Los canales de cliente requieren triaje, respuesta asistida y flujos conversacionales gobernados.');
  }
  if (answers.scopeFocus === 'data_analytics') {
    justification.push('La analítica de datos requiere consolidación, indexación y pipelines orientados a reportes y decisión.');
  }
  if (answers.stackComplexity === 'saas_apis') {
    justification.push('Las integraciones SaaS/APIs requieren conectores seguros hacia Salesforce, HubSpot, SAP u homólogos.');
  }
  if (answers.stackComplexity === 'on_premise') {
    justification.push('Los sistemas legacy/on-premise implican acceso controlado a bases internas y posible middleware.');
  }
  if (answers.stackComplexity === 'fragmented') {
    justification.push('Un ecosistema fragmentado requiere capa de unificación e indexación multi-fuente.');
  }

  if (answers.governanceLevel === 'strict_private') {
    businessImpact.push({ label: 'Riesgo evitado', value: 'Reduce exposición legal por procesamiento de datos sensibles fuera de políticas enterprise.' });
    businessImpact.push({ label: 'Soberanía de datos', value: 'Los datos críticos permanecen bajo control organizacional y normativo.' });
  }
  businessImpact.push({ label: 'Predictibilidad de costos', value: 'Tarifa de operación predecible frente a consumo variable de APIs públicas.' });
  businessImpact.push({ label: 'Autonomía operativa', value: 'Menor dependencia de cambios de política en servicios externos de IA.' });

  const architecture =
    envLabel && scale ? `${envLabel} — ${scale}`
    : envLabel        ? envLabel
    : scale           ? scale
    : null;

  return {
    architecture,
    inferredProfile,
    justification,
    changeReasons,
    simplificationHint,
    businessImpact,
    suggestedModelIds: BRANCH_SML_MAP[branchId] || [6],
  };
}

function buildFinancialScenario(answers) {
  const scaleOpt        = SCALE_OPTIONS.find(o => o.id === answers.scaleEnvironment);
  const users           = scaleOpt?.concurrentUsers ?? 50;
  const queriesPerUser  = 20;
  const workingDays     = 22;
  const dailyQueries    = users * queriesPerUser;
  const monthlyQueries  = dailyQueries * workingDays;
  const publicCostMonth = Math.round(monthlyQueries * 0.004);
  const [nodeMin, nodeMax] = scaleOpt?.nodeRange ?? [800, 1500];
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

function buildPayloadFromAnswers(answers, recommendation) {
  const branchId = getBranchChoice(answers);
  const infra = INFRA_OPTIONS.find(o => o.id === answers.infraMode);
  const branchOpt = answers.infraMode === 'from_scratch'
    ? SCOPE_OPTIONS.find(o => o.id === answers.scopeFocus)
    : STACK_OPTIONS.find(o => o.id === answers.stackComplexity);
  const scaleOpt = SCALE_OPTIONS.find(o => o.id === answers.scaleEnvironment);
  const sec = SECURITY_OPTIONS.find(o => o.id === answers.governanceLevel);

  const useCases = [
    answers.infraMode,
    branchId,
    answers.scaleEnvironment,
    answers.governanceLevel,
  ].filter(Boolean);
  if (answers.scopeFocus === 'customer_channels') useCases.push('external', 'customer');
  if (answers.scopeFocus === 'internal_ops') useCases.push('docs', 'employees');
  if (answers.scopeFocus === 'data_analytics') useCases.push('databases', 'analytics');
  if (answers.stackComplexity === 'saas_apis') useCases.push('apis', 'external');
  if (answers.stackComplexity === 'on_premise') useCases.push('databases', 'on_premise');
  if (answers.stackComplexity === 'fragmented') useCases.push('docs', 'databases', 'apis');
  if (answers.scaleEnvironment === 'enterprise') useCases.push('tool_orchestrator', 'kubernetes');
  if (answers.scaleEnvironment === 'focalizada') useCases.push('pilot');

  return {
    problem_description: [
      `[${answers.infraMode}/${branchId}/${answers.scaleEnvironment}]`,
      infra?.summaryBadge,
      branchOpt?.summaryBadge,
      scaleOpt?.summaryBadge,
      sec?.summaryBadge,
    ].filter(Boolean).join(' '),
    expected_users_concurrent: getConcurrentUsers(answers),
    data_sensitivity: answers.governanceLevel === 'strict_private' ? 'high' : 'medium',
    use_cases_priority: [...new Set(useCases)],
    current_ia_pain_points: recommendation.justification.join(' '),
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
  1: 'Infraestructura base',
  2: 'Enfoque / Stack',
  3: 'Escala y entorno',
  4: 'Gobernanza y seguridad',
};

function isStepComplete(step, answers) {
  if (step === 1) return !!answers.infraMode;
  if (step === 2) return !!getBranchChoice(answers);
  if (step === 3) return !!answers.scaleEnvironment;
  if (step === 4) return !!answers.governanceLevel;
  return false;
}

function resetAnswersAfterStep(answers, step) {
  const next = { ...answers };
  if (step < 2) {
    next.scopeFocus = '';
    next.stackComplexity = '';
  }
  if (step < 3) {
    next.scaleEnvironment = '';
  }
  if (step < 4) {
    next.governanceLevel = '';
  }
  return next;
}

function getStepAccordionMeta(stepNum, answers) {
  if (stepNum === 1) {
    return {
      label: 'Infraestructura base',
      heading: '¿Cuál es el estado de la infraestructura donde deseas implementar IA?',
      description: 'Define si partes desde cero o integras IA sobre sistemas operativos existentes.',
    };
  }
  if (stepNum === 2) {
    if (answers.infraMode === 'from_scratch') {
      return {
        label: 'Enfoque operativo',
        heading: '¿Cuál es el cuello de botella crítico que requiere automatización inmediata?',
        description: 'Prioriza el foco operativo del primer despliegue.',
      };
    }
    return {
      label: 'Complejidad del stack',
      heading: '¿Cómo interactúa el software actual de tu empresa con tus datos operativos?',
      description: 'Identifica el patrón de integración predominante en tu organización.',
    };
  }
  if (stepNum === 3) {
    return {
      label: 'Escala y entorno',
      heading: '¿Cuál es la dimensión operativa y el entorno técnico del proyecto?',
      description: 'Dimensiona volumen, alcance transversal y preferencia de despliegue.',
    };
  }
  return {
    label: 'Gobernanza y seguridad',
    heading: '¿Cuáles son los requerimientos normativos y de privacidad para el manejo de tu información?',
    description: 'Determina el nivel de restricción y cumplimiento requerido.',
  };
}

function formatStepValue(step, answers) {
  if (step === 1) {
    const infra = INFRA_OPTIONS.find(o => o.id === answers.infraMode);
    return infra?.summaryBadge ?? '—';
  }
  if (step === 2) {
    if (answers.infraMode === 'from_scratch') {
      const scope = SCOPE_OPTIONS.find(o => o.id === answers.scopeFocus);
      return scope?.summaryBadge ?? '—';
    }
    if (answers.infraMode === 'existing') {
      const stack = STACK_OPTIONS.find(o => o.id === answers.stackComplexity);
      return stack?.summaryBadge ?? '—';
    }
    return '—';
  }
  if (step === 3) {
    const scale = SCALE_OPTIONS.find(o => o.id === answers.scaleEnvironment);
    return scale?.summaryBadge ?? '—';
  }
  if (step === 4) {
    const sec = SECURITY_OPTIONS.find(o => o.id === answers.governanceLevel);
    return sec?.summaryBadge ?? '—';
  }
  return '—';
}

function getStep2OutputLabel(answers) {
  return answers.infraMode === 'from_scratch' ? 'Enfoque operativo' : 'Complejidad del stack';
}

function getSensitivityLabel(governanceLevel) {
  if (governanceLevel === 'strict_private') return 'Alta (privada / LGPD)';
  if (governanceLevel === 'standard_flex')  return 'Media (nube estándar)';
  return '—';
}

const FORM_SECTIONS = 4;

const initialAnswers = {
  infraMode:         '',
  scopeFocus:        '',
  stackComplexity:   '',
  scaleEnvironment:  '',
  governanceLevel:   '',
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ClientWizard = () => {
  const { fetchWithAuth, API_URL } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep]             = useState(1);
  const [maxVisibleStep, setMaxVisibleStep]     = useState(1);
  const [showOutput, setShowOutput]               = useState(false);
  const [answers, setAnswers]                   = useState(initialAnswers);
  const [editingFromOutput, setEditingFromOutput] = useState(null);
  const [submitting, setSubmitting]             = useState(false);
  const [submitError, setSubmitError]           = useState(null);
  const [submitted, setSubmitted]               = useState(false);

  // Derived
  const conflicts       = useMemo(() => detectConflicts(answers), [answers]);
  const confidence      = useMemo(
    () => calculateConfidence(answers, conflicts, maxVisibleStep),
    [answers, conflicts, maxVisibleStep],
  );
  const recommendation  = useMemo(() => buildRecommendation(answers), [answers]);
  const financial       = useMemo(() => buildFinancialScenario(answers), [answers]);
  const outputStatus    = useMemo(() => getOutputStatus(confidence, conflicts), [confidence, conflicts]);
  const assumptionsGaps = useMemo(
    () => buildAssumptionsAndGaps(answers, conflicts, showOutput),
    [answers, conflicts, showOutput],
  );

  // Helpers
  const setAnswer = useCallback((key, value) =>
    setAnswers(prev => ({ ...prev, [key]: value })), []);

  const advanceToStep = useCallback((step) => {
    setActiveStep(step);
    setMaxVisibleStep(prev => Math.max(prev, step));
  }, []);

  const openStep = useCallback((step) => {
    setAnswers(prev => resetAnswersAfterStep(prev, step));
    setActiveStep(step);
    setMaxVisibleStep(step);
    setShowOutput(false);
  }, []);

  const canShowRecommendation = useMemo(
    () =>
      !!answers.infraMode &&
      !!getBranchChoice(answers) &&
      !!answers.scaleEnvironment &&
      !!answers.governanceLevel,
    [answers],
  );

  const selectInfraMode = useCallback((id) => {
    setAnswers(prev => {
      if (prev.infraMode === id) return prev;
      return { ...initialAnswers, infraMode: id };
    });
    advanceToStep(2);
    setShowOutput(false);
    setEditingFromOutput(null);
  }, [advanceToStep]);

  const selectScopeFocus = useCallback((id) => {
    setAnswers(prev => ({
      ...prev,
      scopeFocus: id,
      stackComplexity: '',
    }));
    advanceToStep(3);
  }, [advanceToStep]);

  const selectStackComplexity = useCallback((id) => {
    setAnswers(prev => ({
      ...prev,
      stackComplexity: id,
      scopeFocus: '',
    }));
    advanceToStep(3);
  }, [advanceToStep]);

  const selectScaleEnvironment = useCallback((id) => {
    setAnswer('scaleEnvironment', id);
    advanceToStep(4);
  }, [setAnswer, advanceToStep]);

  const selectSecurity = useCallback((id) => {
    setAnswer('governanceLevel', id);
  }, [setAnswer]);

  const goToOutput = () => {
    if (editingFromOutput !== null) setEditingFromOutput(null);
    setShowOutput(true);
  };

  const cancelEditing = () => {
    setEditingFromOutput(null);
    setShowOutput(true);
  };

  const editStep = (section) => {
    setEditingFromOutput(section);
    openStep(section);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const payload = buildPayloadFromAnswers(answers, recommendation);

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
          {!showOutput && (
            <div className="flex items-center gap-1 mb-5" aria-label="Progreso del diagnóstico">
              {Array.from({ length: FORM_SECTIONS }).map((_, i) => {
                const s = i + 1;
                const done = s < activeStep || (s <= maxVisibleStep && isStepComplete(s, answers));
                const active = s === activeStep;
                return (
                  <React.Fragment key={s}>
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border transition-all
                      ${done && !active ? 'bg-[#06b6d4] border-[#06b6d4] text-white' :
                        active ? 'border-[#06b6d4] text-[#06b6d4] bg-[#06b6d4]/10 ring-2 ring-[#06b6d4]/20' :
                        s <= maxVisibleStep ? 'border-slate-600 text-slate-500' :
                                 'border-slate-700 text-slate-600'}`}
                      aria-current={active ? 'step' : undefined}
                    >
                      {done && !active ? <Check className="w-3.5 h-3.5" /> : s}
                    </div>
                    {i < FORM_SECTIONS - 1 && (
                      <div className={`flex-1 h-px ${done ? 'bg-[#06b6d4]/60' : 'bg-slate-800'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Editing badge */}
          {editingFromOutput !== null && (
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
              <Edit2 className="h-3.5 w-3.5 shrink-0" />
              Editando: <span className="font-medium">{getStepAccordionMeta(editingFromOutput, answers).label}</span>
              <span className="text-amber-500">— el resto de tus respuestas se conservan.</span>
              <button
                type="button"
                onClick={cancelEditing}
                className="ml-auto text-amber-300 hover:text-white underline underline-offset-2"
              >
                Volver al resultado
              </button>
            </div>
          )}

          {!showOutput ? (
            <div
              className="bg-slate-950 border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
              role="presentation"
            >
              {[1, 2, 3, 4].map(stepNum => {
                if (stepNum > maxVisibleStep) return null;
                const cfg = getStepAccordionMeta(stepNum, answers);
                const isActive = activeStep === stepNum;
                const isCollapsed = !isActive && isStepComplete(stepNum, answers);

                return (
                  <WizardAccordionStep
                    key={stepNum}
                    step={stepNum}
                    label={cfg.label}
                    heading={cfg.heading}
                    description={cfg.description}
                    summary={formatStepValue(stepNum, answers)}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                    onOpen={() => openStep(stepNum)}
                  >
                    {stepNum === 1 && (
                      <div
                        role="radiogroup"
                        aria-label="Infraestructura base"
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {INFRA_OPTIONS.map(opt => (
                          <IntentCard
                            key={opt.id}
                            option={opt}
                            selected={answers.infraMode === opt.id}
                            dimmed={false}
                            onSelect={selectInfraMode}
                          />
                        ))}
                      </div>
                    )}

                    {stepNum === 2 && answers.infraMode === 'from_scratch' && (
                      <div className="grid grid-cols-1 gap-3">
                        {SCOPE_OPTIONS.map(opt => (
                          <WizardOptionButton
                            key={opt.id}
                            option={opt}
                            selected={answers.scopeFocus === opt.id}
                            onSelect={selectScopeFocus}
                          />
                        ))}
                      </div>
                    )}

                    {stepNum === 2 && answers.infraMode === 'existing' && (
                      <div className="grid grid-cols-1 gap-3">
                        {STACK_OPTIONS.map(opt => (
                          <WizardOptionButton
                            key={opt.id}
                            option={opt}
                            selected={answers.stackComplexity === opt.id}
                            onSelect={selectStackComplexity}
                          />
                        ))}
                      </div>
                    )}

                    {stepNum === 3 && (
                      <div className="grid grid-cols-1 gap-3">
                        {SCALE_OPTIONS.map(opt => (
                          <WizardOptionButton
                            key={opt.id}
                            option={opt}
                            selected={answers.scaleEnvironment === opt.id}
                            onSelect={selectScaleEnvironment}
                          />
                        ))}
                      </div>
                    )}

                    {stepNum === 4 && (
                      <div className="space-y-3">
                        {SECURITY_OPTIONS.map(opt => {
                          const selected = answers.governanceLevel === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => selectSecurity(opt.id)}
                              className={`w-full text-left p-4 rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
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
                                        Enterprise
                                      </span>
                                    )}
                                    <p className={`font-semibold text-sm ${selected ? 'text-white' : 'text-slate-200'}`}>
                                      {opt.label}
                                    </p>
                                  </div>
                                  <p className="text-xs text-slate-500">{opt.description}</p>
                                  <p className={`text-[11px] mt-2 font-medium ${selected ? 'text-cyan-400/90' : 'text-slate-600'}`}>
                                    {opt.summaryBadge}
                                  </p>
                                </div>
                                {opt.exceptional
                                  ? <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                  : <Shield className="h-4 w-4 text-[#06b6d4] shrink-0 mt-0.5" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </WizardAccordionStep>
                );
              })}

              {canShowRecommendation && activeStep === 4 && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={goToOutput}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#06b6d4] text-white font-medium text-sm hover:bg-[#0ea5e9] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-all"
                  >
                    {editingFromOutput !== null ? 'Aplicar cambio y ver recomendación' : 'Ver recomendación'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
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

        </div>

        {/* RIGHT: Reasoning Panel ─────────────────────────────────────────── */}
        <div className="min-w-0">
          <ReasoningPanel
            answers={answers}
            recommendation={recommendation}
            conflicts={conflicts}
            confidence={confidence}
            showOutput={showOutput}
            assumptionsGaps={assumptionsGaps}
          />
        </div>

      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const INTENT_ACCENT = {
  cyan: {
    active: 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-400/25',
    focus: 'focus-visible:ring-cyan-400',
    badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  violet: {
    active: 'border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-500/10 ring-2 ring-violet-400/25',
    focus: 'focus-visible:ring-violet-400',
    badge: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
};

const WizardAccordionStep = ({
  step, label, heading, description, summary,
  isActive, isCollapsed, onOpen, children,
}) => {
  const headerId = `wizard-header-${step}`;
  const panelId = `wizard-panel-${step}`;
  const contentRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    if (!isActive || !contentRef.current) return undefined;
    const node = contentRef.current;
    const update = () => setPanelHeight(node.scrollHeight);
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(node);
    return () => ro?.disconnect();
  }, [isActive, children]);

  const handleHeaderKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  if (isCollapsed) {
    return (
      <div className="border-b border-slate-800/50 last:border-b-0">
        <button
          type="button"
          id={headerId}
          aria-expanded={false}
          aria-controls={panelId}
          onClick={onOpen}
          onKeyDown={handleHeaderKeyDown}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-left bg-slate-900/30 hover:bg-slate-800/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400/70"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="text-sm text-slate-300 font-medium truncate mt-0.5">{summary}</p>
          </div>
          <Edit2 className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (!isActive) return null;

  return (
    <div className="border-b border-slate-800/50 last:border-b-0 bg-slate-900/50 ring-1 ring-inset ring-cyan-500/10">
      <div
        id={headerId}
        className="px-5 pt-5 pb-1"
        aria-expanded={true}
        aria-controls={panelId}
      >
        <span className="inline-flex text-[10px] font-bold uppercase tracking-wider text-cyan-400/90 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
          Paso {step} · Activo
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-white mt-3 tracking-tight">{heading}</h3>
        <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">{description}</p>
      </div>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className="overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out motion-reduce:transition-none"
        style={{
          maxHeight: panelHeight ? panelHeight + 32 : 0,
          opacity: panelHeight ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="px-5 pb-6 pt-3">
          {children}
        </div>
      </div>
    </div>
  );
};

const WizardOptionButton = ({ option, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(option.id)}
    className={`w-full text-left p-4 rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
      ${selected
        ? 'border-[#06b6d4] bg-[#06b6d4]/10'
        : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'}`}
  >
    <p className={`font-semibold text-sm ${selected ? 'text-white' : 'text-slate-200'}`}>{option.label}</p>
    <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
    <p className={`text-[11px] mt-2 font-medium ${selected ? 'text-cyan-400/90' : 'text-slate-600'}`}>
      {option.summaryBadge}
    </p>
  </button>
);

const IntentCard = ({ option, selected, dimmed, onSelect }) => {
  const styles = INTENT_ACCENT[option.accent];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(option.id)}
      className={`
        group text-left p-6 sm:p-7 rounded-2xl border transition-all duration-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        ${styles.focus}
        ${selected ? styles.active : 'border-slate-700/80 bg-slate-900/70 hover:border-slate-500 hover:bg-slate-800/60'}
        ${dimmed ? 'opacity-40' : 'opacity-100'}
      `}
    >
      <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full mb-3 ${styles.badge}`}>
        Paso 1
      </span>
      <p className={`text-lg font-bold ${selected ? 'text-white' : 'text-slate-100 group-hover:text-white'}`}>
        {option.label}
      </p>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{option.description}</p>
      <p className={`text-[11px] mt-3 font-medium ${selected ? (option.accent === 'cyan' ? 'text-cyan-400/90' : 'text-violet-400/90') : 'text-slate-600'}`}>
        {option.summaryBadge}
      </p>
    </button>
  );
};

const ReasoningPanel = ({ answers, recommendation, conflicts, confidence, showOutput, assumptionsGaps }) => {
  const cfg = CONFIDENCE_CFG[confidence];
  const hasAny = answers.infraMode || getBranchChoice(answers) || answers.scaleEnvironment || answers.governanceLevel;

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
          {confidence === 'low' && 'Menos de 4 pasos respondidos o conflictos sin resolver.'}
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
      ) : hasAny && !showOutput && (
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">C. Contradicciones detectadas</p>
          <p className="text-xs text-slate-600">No se detectaron conflictos entre las respuestas actuales.</p>
        </div>
      )}

      {/* Supuestos abiertos (contexto para confianza) */}
      {assumptionsGaps.assumptions.length > 0 && !showOutput && (
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
          {[1, 2, 3, 4].map(s => (
            <EditableRow
              key={s}
              label={s === 2 ? getStep2OutputLabel(answers) : STEP_LABELS[s]}
              value={formatStepValue(s, answers)}
              onEdit={() => onEditStep(s)}
            />
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-500">Sensibilidad de datos: </span>
          <span className="text-slate-300">{getSensitivityLabel(answers.governanceLevel)}</span>
        </div>
      </OutputSection>

      {/* 2. Arquitectura sugerida */}
      <OutputSection title="2. Arquitectura sugerida">
        {recommendation.architecture
          ? <p className="text-sm text-white font-medium">{recommendation.architecture}</p>
          : <p className="text-xs text-slate-500">Define escala, gobernanza y el resto de pasos para completar esta sección.</p>
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
