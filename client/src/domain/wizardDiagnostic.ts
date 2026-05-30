/**
 * Dominio tipado del wizard ProxDeep.
 *
 * Representación: unión discriminada por `phase` (mutually exclusive branch).
 * La interfaz plana de Gemini se rechaza porque permitiría, p. ej.,
 * { desde_cero + stack_complejidad: 'saas_apis' } si ambos campos son nullable.
 */

// ─── Vocabulario de dominio (Gemini / ProxDeep) ───────────────────────────────

export type InfraestructuraBase = 'desde_cero' | 'sistemas_existentes';
export type FocoAlcance = 'operaciones' | 'clientes' | 'analitica';
export type StackComplejidad = 'saas_apis' | 'on_premise_legacy' | 'fragmentado';
export type EscalaEntorno = 'focalizada' | 'enterprise_docker';
export type GobernanzaSeguridad = 'nube_estandar' | 'privada_lgpd';
export type MadurezDatos = 'datos_crudos' | 'centralizados_sin_limpieza' | 'listos_produccion';

/** Estado inicial — ninguna infraestructura elegida aún. */
export type ProxdeepDiagnosticEmpty = {
  phase: 'empty';
  madurez_datos: '';
  escala_entorno: '';
  gobernanza_seguridad: '';
};

/** Rama 2A: foco operativo activo; stack inaccesible (null forzado). */
export type ProxdeepDiagnosticDesdeCero = {
  phase: 'desde_cero';
  foco_alcance: FocoAlcance | '';
  stack_complejidad: null;
  madurez_datos: MadurezDatos | '';
  escala_entorno: EscalaEntorno | '';
  gobernanza_seguridad: GobernanzaSeguridad | '';
};

/** Rama 2B: stack activo; foco inaccesible (null forzado). */
export type ProxdeepDiagnosticSistemasExistentes = {
  phase: 'sistemas_existentes';
  foco_alcance: null;
  stack_complejidad: StackComplejidad | '';
  madurez_datos: MadurezDatos | '';
  escala_entorno: EscalaEntorno | '';
  gobernanza_seguridad: GobernanzaSeguridad | '';
};

export type ProxdeepDiagnosticState =
  | ProxdeepDiagnosticEmpty
  | ProxdeepDiagnosticDesdeCero
  | ProxdeepDiagnosticSistemasExistentes;

// ─── IDs de UI (legacy — acordeón y payload backward-compatible) ─────────────

export type UiInfraId = 'from_scratch' | 'existing';
export type UiFocoId = 'internal_ops' | 'customer_channels' | 'data_analytics';
export type UiStackId = 'saas_apis' | 'on_premise' | 'fragmented';
export type UiEscalaId = 'focalizada' | 'enterprise';
export type UiGobernanzaId = 'standard_flex' | 'strict_private';
export type UiMadurezId = 'raw_data' | 'centralized_dirty' | 'production_ready';

export type LegacyWizardAnswers = {
  infraMode: UiInfraId | '';
  scopeFocus: UiFocoId | '';
  stackComplexity: UiStackId | '';
  dataMaturity: UiMadurezId | '';
  scaleEnvironment: UiEscalaId | '';
  governanceLevel: UiGobernanzaId | '';
};

// ─── Mapeos dominio ↔ UI ──────────────────────────────────────────────────────

export const UI_INFRA_TO_DOMAIN: Record<UiInfraId, InfraestructuraBase> = {
  from_scratch: 'desde_cero',
  existing: 'sistemas_existentes',
};

export const DOMAIN_INFRA_TO_UI: Record<InfraestructuraBase, UiInfraId> = {
  desde_cero: 'from_scratch',
  sistemas_existentes: 'existing',
};

export const UI_FOCO_TO_DOMAIN: Record<UiFocoId, FocoAlcance> = {
  internal_ops: 'operaciones',
  customer_channels: 'clientes',
  data_analytics: 'analitica',
};

export const DOMAIN_FOCO_TO_UI: Record<FocoAlcance, UiFocoId> = {
  operaciones: 'internal_ops',
  clientes: 'customer_channels',
  analitica: 'data_analytics',
};

export const UI_STACK_TO_DOMAIN: Record<UiStackId, StackComplejidad> = {
  saas_apis: 'saas_apis',
  on_premise: 'on_premise_legacy',
  fragmented: 'fragmentado',
};

export const DOMAIN_STACK_TO_UI: Record<StackComplejidad, UiStackId> = {
  saas_apis: 'saas_apis',
  on_premise_legacy: 'on_premise',
  fragmentado: 'fragmented',
};

export const UI_ESCALA_TO_DOMAIN: Record<UiEscalaId, EscalaEntorno> = {
  focalizada: 'focalizada',
  enterprise: 'enterprise_docker',
};

export const DOMAIN_ESCALA_TO_UI: Record<EscalaEntorno, UiEscalaId> = {
  focalizada: 'focalizada',
  enterprise_docker: 'enterprise',
};

export const UI_GOV_TO_DOMAIN: Record<UiGobernanzaId, GobernanzaSeguridad> = {
  standard_flex: 'nube_estandar',
  strict_private: 'privada_lgpd',
};

export const DOMAIN_GOV_TO_UI: Record<GobernanzaSeguridad, UiGobernanzaId> = {
  nube_estandar: 'standard_flex',
  privada_lgpd: 'strict_private',
};

export const UI_MADUREZ_TO_DOMAIN: Record<UiMadurezId, MadurezDatos> = {
  raw_data: 'datos_crudos',
  centralized_dirty: 'centralizados_sin_limpieza',
  production_ready: 'listos_produccion',
};

export const DOMAIN_MADUREZ_TO_UI: Record<MadurezDatos, UiMadurezId> = {
  datos_crudos: 'raw_data',
  centralizados_sin_limpieza: 'centralized_dirty',
  listos_produccion: 'production_ready',
};

export const DOMAIN_BADGES = {
  infra: {
    desde_cero: 'Infraestructura: Creación desde cero',
    sistemas_existentes: 'Infraestructura: Sistemas existentes',
  },
  foco: {
    operaciones: 'Foco: NLP & Documentos',
    clientes: 'Foco: Clientes',
    analitica: 'Foco: Data Analytics',
  },
  stack: {
    saas_apis: 'Stack: SaaS/APIs',
    on_premise_legacy: 'Stack: On-Premise',
    fragmentado: 'Stack: Silos Desconectados',
  },
  escala: {
    focalizada: 'Escala: Focalizada',
    enterprise_docker: 'Escala: Enterprise',
  },
  gobernanza: {
    nube_estandar: 'Seguridad: Nube Estándar',
    privada_lgpd: 'Seguridad: Privada/LGPD',
  },
  madurez: {
    datos_crudos: 'Datos: Crudos',
    centralizados_sin_limpieza: 'Datos: Centralizados',
    listos_produccion: 'Datos: Producción',
  },
} as const;

export const DOMAIN_MADUREZ_LABELS: Record<MadurezDatos, string> = {
  datos_crudos: 'Datos Crudos y Dispersos',
  centralizados_sin_limpieza: 'Datos Centralizados sin Limpieza Operativa',
  listos_produccion: 'Datos Listos para Producción',
};

const MADUREZ_UI_DESCRIPTIONS: Record<MadurezDatos, string> = {
  datos_crudos:
    'La información relevante existe en documentos, correos, archivos o fuentes aisladas sin estructura homogénea.',
  centralizados_sin_limpieza:
    'Contamos con repositorios o bases centralizadas, pero persisten inconsistencias, duplicados o baja calidad para explotación inmediata.',
  listos_produccion:
    'Disponemos de información integrada, validada y con calidad suficiente para alimentar modelos, agentes o analítica avanzada.',
};

export const DOMAIN_FOCO_LABELS: Record<FocoAlcance, string> = {
  operaciones: 'Procesamiento de Documentos e Información No Estructurada',
  clientes: 'Atención y Canales de Cara al Cliente',
  analitica: 'Analítica Predictiva y Modelado de Datos Estructurados',
};

export const DOMAIN_STACK_LABELS: Record<StackComplejidad, string> = {
  saas_apis: 'SaaS y Nube Comercial',
  on_premise_legacy: 'Sistemas Legacy o Locales (On-Premise)',
  fragmentado: 'Silos de Datos Desconectados (On-Prem + Cloud)',
};

export const DOMAIN_ESCALA_META: Record<EscalaEntorno, { label: string; description: string; concurrentUsers: number; nodeRange: [number, number] }> = {
  focalizada: {
    label: 'Flujo Focalizado / Equipos Iniciales',
    description: 'Procesos de un departamento específico, volúmenes moderados de datos y despliegue directo.',
    concurrentUsers: 50,
    nodeRange: [800, 1500],
  },
  enterprise_docker: {
    label: 'Despliegue Corporativo / Contenedores',
    description: 'Alta demanda simultánea, flujos transversales y preferencia por ambientes estandarizados en Docker/Kubernetes.',
    concurrentUsers: 250,
    nodeRange: [1800, 3500],
  },
};

const BRANCH_SML_MAP: Record<string, number[]> = {
  internal_ops: [5],
  customer_channels: [5],
  data_analytics: [4, 7],
  saas_apis: [5],
  on_premise: [5],
  fragmented: [6],
};

// ─── Catálogo UI (única fuente: dominio → id/badge/copy del acordeón) ─────────

const INFRA_UI_COPY: Record<InfraestructuraBase, { label: string; description: string; accent: 'cyan' | 'violet' }> = {
  desde_cero: {
    label: 'Automatización Inteligente (Desde Cero)',
    description: 'No contamos con sistemas propietarios optimizados; buscamos desarrollar flujos de trabajo e infraestructura digital desde su base.',
    accent: 'cyan',
  },
  sistemas_existentes: {
    label: 'Optimización de Procesos (Infraestructura Existente)',
    description: 'Contamos con software operativo (CRM, ERP o bases de datos) y buscamos integrar capas de IA o automatizar procesos sobre ellos.',
    accent: 'violet',
  },
};

const FOCO_UI_DESCRIPTIONS: Record<FocoAlcance, string> = {
  operaciones: 'Automatizar la lectura, extracción y análisis de contratos, PDFs, correos o reportes internos mediante modelos de lenguaje.',
  clientes: 'Automatizar soporte técnico, flujos conversacionales o gestión de requerimientos.',
  analitica: 'Conectar bases de datos relacionales para auditorías automatizadas, proyecciones de negocio y toma de decisiones en tiempo real.',
};

const STACK_UI_DESCRIPTIONS: Record<StackComplejidad, string> = {
  saas_apis: 'Utilizamos plataformas modernas con APIs abiertas como Salesforce, HubSpot o SAP.',
  on_premise_legacy: 'Operamos con bases de datos internas o software cerrado de difícil acceso.',
  fragmentado: 'La información operativa crítica coexiste de forma aislada en sistemas locales y nubes comerciales sin interoperabilidad nativa.',
};

const GOBERNANZA_UI_COPY: Record<GobernanzaSeguridad, { label: string; description: string; exceptional: boolean }> = {
  nube_estandar: {
    label: 'Estándar / Flexibilidad Alta',
    description: 'Podemos operar con modelos comerciales en la nube bajo políticas de privacidad estándar.',
    exceptional: false,
  },
  privada_lgpd: {
    label: 'Crítico / Restricción Estricta (LGPD/Enterprise)',
    description: 'Manejamos datos altamente sensibles. Requerimos modelos privados, encriptación avanzada o aislamiento local.',
    exceptional: true,
  },
};

export type InfraUiOption = {
  id: UiInfraId;
  domainKey: InfraestructuraBase;
  label: string;
  description: string;
  summaryBadge: string;
  accent: 'cyan' | 'violet';
};

export type BranchUiOption = {
  id: string;
  domainKey: string;
  label: string;
  description: string;
  summaryBadge: string;
};

export type EscalaUiOption = {
  id: UiEscalaId;
  domainKey: EscalaEntorno;
  label: string;
  description: string;
  summaryBadge: string;
  concurrentUsers: number;
  nodeRange: [number, number];
};

export type GobernanzaUiOption = {
  id: UiGobernanzaId;
  domainKey: GobernanzaSeguridad;
  label: string;
  description: string;
  summaryBadge: string;
  exceptional: boolean;
};

function buildInfraUiOptions(): InfraUiOption[] {
  return (Object.keys(INFRA_UI_COPY) as InfraestructuraBase[]).map((domainKey) => ({
    domainKey,
    id: DOMAIN_INFRA_TO_UI[domainKey],
    summaryBadge: DOMAIN_BADGES.infra[domainKey],
    ...INFRA_UI_COPY[domainKey],
  }));
}

function buildFocoUiOptions(): BranchUiOption[] {
  return (Object.keys(DOMAIN_FOCO_LABELS) as FocoAlcance[]).map((domainKey) => ({
    domainKey,
    id: DOMAIN_FOCO_TO_UI[domainKey],
    label: DOMAIN_FOCO_LABELS[domainKey],
    description: FOCO_UI_DESCRIPTIONS[domainKey],
    summaryBadge: DOMAIN_BADGES.foco[domainKey],
  }));
}

function buildStackUiOptions(): BranchUiOption[] {
  return (Object.keys(DOMAIN_STACK_LABELS) as StackComplejidad[]).map((domainKey) => ({
    domainKey,
    id: DOMAIN_STACK_TO_UI[domainKey],
    label: DOMAIN_STACK_LABELS[domainKey],
    description: STACK_UI_DESCRIPTIONS[domainKey],
    summaryBadge: DOMAIN_BADGES.stack[domainKey],
  }));
}

function buildEscalaUiOptions(): EscalaUiOption[] {
  return (Object.keys(DOMAIN_ESCALA_META) as EscalaEntorno[]).map((domainKey) => ({
    domainKey,
    id: DOMAIN_ESCALA_TO_UI[domainKey],
    label: DOMAIN_ESCALA_META[domainKey].label,
    description: DOMAIN_ESCALA_META[domainKey].description,
    summaryBadge: DOMAIN_BADGES.escala[domainKey],
    concurrentUsers: DOMAIN_ESCALA_META[domainKey].concurrentUsers,
    nodeRange: DOMAIN_ESCALA_META[domainKey].nodeRange,
  }));
}

function buildGobernanzaUiOptions(): GobernanzaUiOption[] {
  return (Object.keys(GOBERNANZA_UI_COPY) as GobernanzaSeguridad[]).map((domainKey) => ({
    domainKey,
    id: DOMAIN_GOV_TO_UI[domainKey],
    summaryBadge: DOMAIN_BADGES.gobernanza[domainKey],
    ...GOBERNANZA_UI_COPY[domainKey],
  }));
}

function buildMadurezUiOptions(): BranchUiOption[] {
  return (Object.keys(DOMAIN_MADUREZ_LABELS) as MadurezDatos[]).map((domainKey) => ({
    domainKey,
    id: DOMAIN_MADUREZ_TO_UI[domainKey],
    label: DOMAIN_MADUREZ_LABELS[domainKey],
    description: MADUREZ_UI_DESCRIPTIONS[domainKey],
    summaryBadge: DOMAIN_BADGES.madurez[domainKey],
  }));
}

/** Catálogo único para render del acordeón — derivado de claves de dominio. */
export const WIZARD_UI_CATALOG = {
  infra: buildInfraUiOptions(),
  foco: buildFocoUiOptions(),
  stack: buildStackUiOptions(),
  madurez: buildMadurezUiOptions(),
  escala: buildEscalaUiOptions(),
  gobernanza: buildGobernanzaUiOptions(),
} as const;

export const WIZARD_FORM_SECTIONS = 5;

export const STEP_LABELS: Record<number, string> = {
  1: 'Infraestructura base',
  2: 'Enfoque / Stack',
  3: 'Madurez de datos',
  4: 'Escala y entorno tecnológico',
  5: 'Gobernanza y seguridad',
};

const SENSITIVITY_LABELS: Record<UiGobernanzaId, string> = {
  strict_private: 'Alta (privada / LGPD)',
  standard_flex: 'Media (nube estándar)',
};

export function getStepAccordionMeta(stepNum: number, state: ProxdeepDiagnosticState) {
  if (stepNum === 1) {
    return {
      label: 'Infraestructura base',
      heading: '¿Cuál es el estado de la infraestructura donde deseas implementar IA?',
      description: 'Define si partes desde cero o integras IA sobre sistemas operativos existentes.',
    };
  }
  if (stepNum === 2) {
    if (state.phase === 'desde_cero') {
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
      label: 'Madurez de datos',
      heading: '¿Cuál es el nivel actual de preparación de sus datos para una iniciativa de IA?',
      description: 'Evalúe la calidad, integración y operabilidad de la información antes de dimensionar escala y gobernanza.',
    };
  }
  if (stepNum === 4) {
    return {
      label: 'Escala y entorno tecnológico',
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

export function formatLegacyStepSummary(step: number, answers: LegacyWizardAnswers): string {
  if (step === 1) {
    return WIZARD_UI_CATALOG.infra.find(o => o.id === answers.infraMode)?.summaryBadge ?? '—';
  }
  if (step === 2) {
    if (answers.infraMode === DOMAIN_INFRA_TO_UI.desde_cero) {
      return WIZARD_UI_CATALOG.foco.find(o => o.id === answers.scopeFocus)?.summaryBadge ?? '—';
    }
    if (answers.infraMode === DOMAIN_INFRA_TO_UI.sistemas_existentes) {
      return WIZARD_UI_CATALOG.stack.find(o => o.id === answers.stackComplexity)?.summaryBadge ?? '—';
    }
    return '—';
  }
  if (step === 3) {
    return WIZARD_UI_CATALOG.madurez.find(o => o.id === answers.dataMaturity)?.summaryBadge ?? '—';
  }
  if (step === 4) {
    return WIZARD_UI_CATALOG.escala.find(o => o.id === answers.scaleEnvironment)?.summaryBadge ?? '—';
  }
  if (step === 5) {
    return WIZARD_UI_CATALOG.gobernanza.find(o => o.id === answers.governanceLevel)?.summaryBadge ?? '—';
  }
  return '—';
}

export function getStep2OutputLabel(state: ProxdeepDiagnosticState): string {
  return state.phase === 'desde_cero' ? 'Enfoque operativo' : 'Complejidad del stack';
}

export function getSensitivityLabel(governanceLevel: UiGobernanzaId | ''): string {
  if (!governanceLevel) return '—';
  return SENSITIVITY_LABELS[governanceLevel] ?? '—';
}

// ─── Estado inicial y transiciones ─────────────────────────────────────────────

export function createInitialState(): ProxdeepDiagnosticEmpty {
  return { phase: 'empty', madurez_datos: '', escala_entorno: '', gobernanza_seguridad: '' };
}

export function selectInfraestructuraBase(
  base: InfraestructuraBase,
): ProxdeepDiagnosticDesdeCero | ProxdeepDiagnosticSistemasExistentes {
  const tail = { madurez_datos: '' as const, escala_entorno: '' as const, gobernanza_seguridad: '' as const };
  if (base === 'desde_cero') {
    return { phase: 'desde_cero', foco_alcance: '', stack_complejidad: null, ...tail };
  }
  return { phase: 'sistemas_existentes', foco_alcance: null, stack_complejidad: '', ...tail };
}

export function selectInfraestructuraFromUi(
  state: ProxdeepDiagnosticState,
  uiId: UiInfraId,
): ProxdeepDiagnosticState {
  const base = UI_INFRA_TO_DOMAIN[uiId];
  if (state.phase === base) return state;
  return selectInfraestructuraBase(base);
}

export function selectFocoFromUi(
  state: ProxdeepDiagnosticState,
  uiId: UiFocoId,
): ProxdeepDiagnosticDesdeCero {
  if (state.phase !== 'desde_cero') {
    throw new Error('foco_alcance solo es accesible cuando infraestructura_base = desde_cero');
  }
  return { ...state, foco_alcance: UI_FOCO_TO_DOMAIN[uiId] };
}

export function selectStackFromUi(
  state: ProxdeepDiagnosticState,
  uiId: UiStackId,
): ProxdeepDiagnosticSistemasExistentes {
  if (state.phase !== 'sistemas_existentes') {
    throw new Error('stack_complejidad solo es accesible cuando infraestructura_base = sistemas_existentes');
  }
  return { ...state, stack_complejidad: UI_STACK_TO_DOMAIN[uiId] };
}

export function selectMadurezFromUi(
  state: ProxdeepDiagnosticState,
  uiId: UiMadurezId,
): ProxdeepDiagnosticState {
  if (state.phase === 'empty') {
    throw new Error('madurez_datos requiere infraestructura_base y branch técnico definidos');
  }
  return { ...state, madurez_datos: UI_MADUREZ_TO_DOMAIN[uiId] };
}

export function selectEscalaFromUi(
  state: ProxdeepDiagnosticState,
  uiId: UiEscalaId,
): ProxdeepDiagnosticState {
  if (state.phase === 'empty') {
    throw new Error('escala_entorno requiere infraestructura_base definida');
  }
  return { ...state, escala_entorno: UI_ESCALA_TO_DOMAIN[uiId] };
}

export function selectGobernanzaFromUi(
  state: ProxdeepDiagnosticState,
  uiId: UiGobernanzaId,
): ProxdeepDiagnosticState {
  if (state.phase === 'empty') {
    throw new Error('gobernanza_seguridad requiere infraestructura_base definida');
  }
  return { ...state, gobernanza_seguridad: UI_GOV_TO_DOMAIN[uiId] };
}

export function resetAfterStep(
  state: ProxdeepDiagnosticState,
  step: number,
): ProxdeepDiagnosticState {
  if (state.phase === 'empty') return state;

  if (step < 2) {
    if (state.phase === 'desde_cero') {
      return { ...state, foco_alcance: '', madurez_datos: '', escala_entorno: '', gobernanza_seguridad: '' };
    }
    return { ...state, stack_complejidad: '', madurez_datos: '', escala_entorno: '', gobernanza_seguridad: '' };
  }
  if (step < 3) {
    return { ...state, madurez_datos: '', escala_entorno: '', gobernanza_seguridad: '' };
  }
  if (step < 4) {
    return { ...state, escala_entorno: '', gobernanza_seguridad: '' };
  }
  if (step < 5) {
    return { ...state, gobernanza_seguridad: '' };
  }
  return state;
}

export function toLegacyAnswers(state: ProxdeepDiagnosticState): LegacyWizardAnswers {
  if (state.phase === 'empty') {
    return {
      infraMode: '', scopeFocus: '', stackComplexity: '', dataMaturity: '',
      scaleEnvironment: '', governanceLevel: '',
    };
  }
  if (state.phase === 'desde_cero') {
    return {
      infraMode: DOMAIN_INFRA_TO_UI.desde_cero,
      scopeFocus: state.foco_alcance ? DOMAIN_FOCO_TO_UI[state.foco_alcance] : '',
      stackComplexity: '',
      dataMaturity: state.madurez_datos ? DOMAIN_MADUREZ_TO_UI[state.madurez_datos] : '',
      scaleEnvironment: state.escala_entorno ? DOMAIN_ESCALA_TO_UI[state.escala_entorno] : '',
      governanceLevel: state.gobernanza_seguridad ? DOMAIN_GOV_TO_UI[state.gobernanza_seguridad] : '',
    };
  }
  return {
    infraMode: DOMAIN_INFRA_TO_UI.sistemas_existentes,
    scopeFocus: '',
    stackComplexity: state.stack_complejidad ? DOMAIN_STACK_TO_UI[state.stack_complejidad] : '',
    dataMaturity: state.madurez_datos ? DOMAIN_MADUREZ_TO_UI[state.madurez_datos] : '',
    scaleEnvironment: state.escala_entorno ? DOMAIN_ESCALA_TO_UI[state.escala_entorno] : '',
    governanceLevel: state.gobernanza_seguridad ? DOMAIN_GOV_TO_UI[state.gobernanza_seguridad] : '',
  };
}

export function getBranchChoiceLegacy(state: ProxdeepDiagnosticState): string {
  const legacy = toLegacyAnswers(state);
  return legacy.infraMode === DOMAIN_INFRA_TO_UI.desde_cero ? legacy.scopeFocus : legacy.stackComplexity;
}

export function isStepComplete(step: number, state: ProxdeepDiagnosticState): boolean {
  if (step === 1) return state.phase !== 'empty';
  if (step === 2) {
    if (state.phase === 'desde_cero') return !!state.foco_alcance;
    if (state.phase === 'sistemas_existentes') return !!state.stack_complejidad;
    return false;
  }
  if (step === 3) return state.phase !== 'empty' && !!state.madurez_datos;
  if (step === 4) return state.phase !== 'empty' && !!state.escala_entorno;
  if (step === 5) return state.phase !== 'empty' && !!state.gobernanza_seguridad;
  return false;
}

export function canShowRecommendation(state: ProxdeepDiagnosticState): boolean {
  return [1, 2, 3, 4, 5].every(step => isStepComplete(step, state));
}

export function getConcurrentUsers(state: ProxdeepDiagnosticState): number {
  if (state.phase === 'empty' || !state.escala_entorno) return 50;
  return DOMAIN_ESCALA_META[state.escala_entorno].concurrentUsers;
}

export type Conflict = {
  id: string;
  severity: 'high' | 'medium';
  title: string;
  message: string;
  suggestion: string;
};

export type Confidence = 'low' | 'medium' | 'high';
export type OutputStatus = 'exploratory' | 'preliminary' | 'ready';

export function detectConflicts(state: ProxdeepDiagnosticState): Conflict[] {
  const conflicts: Conflict[] = [];

  if (state.phase === 'desde_cero' && state.gobernanza_seguridad === 'privada_lgpd' && state.foco_alcance === 'clientes') {
    conflicts.push({
      id: 'C', severity: 'medium',
      title: 'Canales de cliente + Seguridad crítica',
      message: 'Automatizar atención al cliente con restricciones estrictas implica arquitectura dedicada y latencia controlada.',
      suggestion: 'Valide volumen de interacciones y políticas de retención antes de dimensionar cómputo.',
    });
  }

  if (state.phase !== 'sistemas_existentes') return conflicts;

  if (state.gobernanza_seguridad === 'privada_lgpd' && state.stack_complejidad === 'saas_apis') {
    conflicts.push({
      id: 'A', severity: 'high',
      title: 'Restricción estricta de privacidad + Stack SaaS con APIs comerciales',
      message: 'Un despliegue privado o local con datos críticos limita el uso directo de APIs de terceros en la nube pública.',
      suggestion: 'Considere conectores controlados en VPC o evalúe flexibilidad estándar si la integración SaaS es indispensable.',
    });
  }

  if (state.gobernanza_seguridad === 'privada_lgpd' && state.stack_complejidad === 'fragmentado') {
    conflicts.push({
      id: 'B', severity: 'medium',
      title: 'Datos fragmentados + Requisitos de seguridad crítica',
      message: 'Unificar datos dispersos bajo gobernanza estricta requiere fase de integración y clasificación previa.',
      suggestion: 'Priorice un inventario de fuentes y un plan de consolidación antes del despliegue del nodo de IA.',
    });
  }

  return conflicts;
}

function shiftConfidence(base: Confidence, delta: number): Confidence {
  const order: Confidence[] = ['low', 'medium', 'high'];
  const idx = Math.max(0, Math.min(2, order.indexOf(base) + delta));
  return order[idx];
}

function isMadurezSensitiveArchetype(state: ProxdeepDiagnosticState): boolean {
  if (state.phase === 'desde_cero' && state.foco_alcance === 'analitica') return true;
  if (state.phase === 'sistemas_existentes' && state.stack_complejidad === 'fragmentado') return true;
  return false;
}

function adjustConfidenceForMadurez(
  state: ProxdeepDiagnosticState,
  base: Confidence,
  hasHigh: boolean,
): Confidence {
  if (state.phase === 'empty' || !state.madurez_datos || hasHigh) return base;

  const sensitive = isMadurezSensitiveArchetype(state);

  if (state.madurez_datos === 'datos_crudos') {
    return shiftConfidence(base, sensitive ? -2 : -1);
  }
  if (state.madurez_datos === 'centralizados_sin_limpieza') {
    return sensitive && base === 'high' ? 'medium' : base;
  }
  if (state.madurez_datos === 'listos_produccion') {
    return shiftConfidence(base, 1);
  }
  return base;
}

export function calculateConfidence(state: ProxdeepDiagnosticState, conflicts: Conflict[], maxVisibleStep = 5): Confidence {
  let completed = 0;
  if (state.phase !== 'empty') completed++;
  if (isStepComplete(2, state)) completed++;
  if (isStepComplete(3, state)) completed++;
  if (isStepComplete(4, state)) completed++;
  if (isStepComplete(5, state)) completed++;

  const hasHigh = conflicts.some(c => c.severity === 'high');
  const hasMedium = conflicts.some(c => c.severity === 'medium');

  let base: Confidence;
  if (completed < 4 || hasHigh) base = 'low';
  else if (completed < 5 || hasMedium || maxVisibleStep < 5) base = 'medium';
  else base = 'high';

  return adjustConfidenceForMadurez(state, base, hasHigh);
}

export function buildInferredProfile(state: ProxdeepDiagnosticState): string | null {
  if (state.phase === 'empty') return null;

  const segments: string[] = [];
  if (state.phase === 'desde_cero') {
    segments.push('implementación de IA desde cero');
    if (state.foco_alcance) segments.push(DOMAIN_FOCO_LABELS[state.foco_alcance].toLowerCase());
  } else {
    segments.push('integración de IA sobre infraestructura existente');
    if (state.stack_complejidad) segments.push(DOMAIN_STACK_LABELS[state.stack_complejidad].toLowerCase());
  }

  if (state.escala_entorno === 'focalizada') segments.push('escala focalizada por departamento');
  else if (state.escala_entorno === 'enterprise_docker') segments.push('despliegue corporativo con contenedores');

  if (state.gobernanza_seguridad === 'privada_lgpd') {
    segments.push('requisitos normativos y de privacidad estrictos (LGPD/enterprise)');
  } else if (state.gobernanza_seguridad === 'nube_estandar') {
    segments.push('operación con flexibilidad en nube estándar');
  }

  return segments.length ? `Se detecta un caso corporativo de ${segments.join(' con ')}.` : null;
}

export function buildChangeReasons(state: ProxdeepDiagnosticState): string[] {
  const reasons: string[] = [];
  if (state.phase === 'empty') return reasons;

  if (state.gobernanza_seguridad === 'privada_lgpd') {
    reasons.push('Al seleccionar restricción estricta, el entorno recomendado pasó a despliegue privado o canal dedicado enterprise.');
  } else if (state.gobernanza_seguridad === 'nube_estandar') {
    reasons.push('Con flexibilidad estándar, el entorno recomendado permite operación en nube comercial con políticas de privacidad regulares.');
  }

  if (state.phase === 'desde_cero') {
    reasons.push('La creación desde cero activa diseño de flujos, orquestación y capa de infraestructura digital como base del proyecto.');
  } else {
    reasons.push('La infraestructura existente orienta la recomendación hacia integración, conectores y automatización sobre sistemas operativos.');
  }

  if (state.escala_entorno === 'enterprise_docker') {
    reasons.push('El despliegue corporativo activa ambientes estandarizados en contenedores y mayor capacidad simultánea.');
  } else if (state.escala_entorno === 'focalizada') {
    reasons.push('La escala focalizada permite un despliegue directo acotado a equipos o departamentos iniciales.');
  }

  if (state.phase === 'sistemas_existentes' && state.stack_complejidad === 'saas_apis') {
    reasons.push('El stack SaaS/APIs requiere conectores de integración y gobernanza de acceso a servicios externos.');
  } else if (state.phase === 'sistemas_existentes' && state.stack_complejidad === 'on_premise_legacy') {
    reasons.push('Los sistemas on-premise/legacy implican conectividad controlada y posible middleware de acceso a datos.');
  } else if (state.phase === 'sistemas_existentes' && state.stack_complejidad === 'fragmentado') {
    reasons.push('Un ecosistema fragmentado requiere capa de consolidación e indexación antes de la inferencia de IA.');
  }

  if (state.phase === 'desde_cero' && state.foco_alcance === 'analitica') {
    reasons.push('El foco analítico prioriza pipelines de datos, reportes y modelos orientados a decisión.');
  } else if (state.phase === 'desde_cero' && state.foco_alcance === 'clientes') {
    reasons.push('Los canales de cliente activan automatización conversacional y triaje de requerimientos.');
  }

  return reasons;
}

export function buildSimplificationHint(state: ProxdeepDiagnosticState): string | null {
  if (state.phase === 'sistemas_existentes' && state.gobernanza_seguridad === 'privada_lgpd' && state.stack_complejidad === 'saas_apis') {
    return 'Evaluar flexibilidad estándar o conectores en VPC reduciría la fricción con integraciones SaaS.';
  }
  if (state.phase === 'sistemas_existentes' && state.stack_complejidad === 'fragmentado') {
    return 'Consolidar fuentes críticas antes del despliegue simplificaría la arquitectura y reduciría costo inicial.';
  }
  if (state.phase === 'desde_cero') {
    return 'Acotar el primer caso de uso operativo aceleraría el time-to-value del despliegue inicial.';
  }
  return null;
}

export function buildAssumptionsAndGaps(state: ProxdeepDiagnosticState, conflicts: Conflict[], showOutput = false) {
  const assumptions: string[] = [];
  const missingForProposal: string[] = [];
  const legacy = toLegacyAnswers(state);
  const users = getConcurrentUsers(state);

  assumptions.push(`Se proyectan ~${users} usuarios concurrentes según la escala seleccionada (${legacy.scaleEnvironment || 'pendiente'}).`);
  assumptions.push('Se estiman 20 consultas diarias por usuario y 22 días hábiles al mes para la proyección de costos.');

  if (!isStepComplete(3, state)) missingForProposal.push('Madurez y preparación de datos para IA.');
  if (!isStepComplete(4, state)) missingForProposal.push('Dimensión operativa y entorno técnico del proyecto.');
  if (state.phase !== 'empty' && state.madurez_datos === 'datos_crudos') {
    missingForProposal.push('Plan de ingestión, limpieza e integración de fuentes antes del despliegue de IA.');
  }
  if (state.phase !== 'empty' && state.madurez_datos === 'centralizados_sin_limpieza') {
    missingForProposal.push('Fase de normalización, deduplicación y gobierno de datos previa al despliegue pleno.');
  }
  if (state.phase === 'sistemas_existentes' && state.stack_complejidad === 'fragmentado') {
    missingForProposal.push('Inventario de sistemas fuente y mapa de integración entre herramientas.');
  }
  if (state.gobernanza_seguridad === 'privada_lgpd') {
    missingForProposal.push('Validación legal/compliance sobre retención, residencia y clasificación de datos.');
  }
  if (conflicts.length > 0) missingForProposal.push('Resolución de conflictos entre stack, integraciones y requisitos de seguridad.');
  if (showOutput && !isStepComplete(2, state)) {
    missingForProposal.push('Definición del alcance operativo o complejidad del stack.');
  }

  return { assumptions, missingForProposal };
}

export function buildRecommendation(state: ProxdeepDiagnosticState) {
  let envLabel: string | null = null;
  let scale: string | null = null;
  const justification: string[] = [];
  const businessImpact: { label: string; value: string }[] = [];
  const changeReasons = buildChangeReasons(state);
  const simplificationHint = buildSimplificationHint(state);
  const inferredProfile = buildInferredProfile(state);
  const branchId = getBranchChoiceLegacy(state);

  if (state.gobernanza_seguridad === 'privada_lgpd') {
    envLabel = 'Entorno privado enterprise (VPC / aislamiento LGPD)';
    justification.push('Los requisitos críticos de privacidad exigen modelos privados, encriptación avanzada o aislamiento local.');
  } else if (state.gobernanza_seguridad === 'nube_estandar') {
    envLabel = 'Nube comercial con políticas estándar';
    justification.push('La flexibilidad alta permite operar con modelos comerciales bajo políticas de privacidad estándar.');
  }

  if (state.escala_entorno) {
    const scaleMeta = DOMAIN_ESCALA_META[state.escala_entorno];
    scale = scaleMeta.label;
    justification.push(scaleMeta.description);
  } else if (state.phase === 'desde_cero') {
    scale = 'Implementación greenfield — diseño de flujos e infraestructura digital';
  } else if (state.phase === 'sistemas_existentes') {
    scale = 'Integración sobre stack operativo existente';
  }

  if (state.phase === 'desde_cero') {
    justification.push('Al partir desde cero, la arquitectura incluye diseño de procesos, orquestación y base tecnológica.');
    if (state.foco_alcance === 'operaciones') justification.push('El foco operativo interno prioriza automatización documental, RAG y reducción de tareas repetitivas.');
    if (state.foco_alcance === 'clientes') justification.push('Los canales de cliente requieren triaje, respuesta asistida y flujos conversacionales gobernados.');
    if (state.foco_alcance === 'analitica') justification.push('La analítica de datos requiere consolidación, indexación y pipelines orientados a reportes y decisión.');
  } else if (state.phase === 'sistemas_existentes') {
    justification.push('La presencia de CRM/ERP/bases de datos orienta conectores, APIs y capas de automatización sobre sistemas vigentes.');
    if (state.stack_complejidad === 'saas_apis') justification.push('Las integraciones SaaS/APIs requieren conectores seguros hacia Salesforce, HubSpot, SAP u homólogos.');
    if (state.stack_complejidad === 'on_premise_legacy') justification.push('Los sistemas legacy/on-premise implican acceso controlado a bases internas y posible middleware.');
    if (state.stack_complejidad === 'fragmentado') justification.push('Un ecosistema fragmentado requiere capa de unificación e indexación multi-fuente.');
  }

  if (state.gobernanza_seguridad === 'privada_lgpd') {
    businessImpact.push({ label: 'Riesgo evitado', value: 'Reduce exposición legal por procesamiento de datos sensibles fuera de políticas enterprise.' });
    businessImpact.push({ label: 'Soberanía de datos', value: 'Los datos críticos permanecen bajo control organizacional y normativo.' });
  }
  businessImpact.push({ label: 'Predictibilidad de costos', value: 'Tarifa de operación predecible frente a consumo variable de APIs públicas.' });
  businessImpact.push({ label: 'Autonomía operativa', value: 'Menor dependencia de cambios de política en servicios externos de IA.' });

  return {
    architecture: envLabel && scale ? `${envLabel} — ${scale}` : envLabel || scale || null,
    inferredProfile,
    justification,
    changeReasons,
    simplificationHint,
    businessImpact,
    suggestedModelIds: BRANCH_SML_MAP[branchId] || [6],
  };
}

export function buildFinancialScenario(state: ProxdeepDiagnosticState) {
  const scaleMeta = state.escala_entorno ? DOMAIN_ESCALA_META[state.escala_entorno] : null;
  const users = scaleMeta?.concurrentUsers ?? 50;
  const queriesPerUser = 20;
  const workingDays = 22;
  const dailyQueries = users * queriesPerUser;
  const monthlyQueries = dailyQueries * workingDays;
  const publicCostMonth = Math.round(monthlyQueries * 0.004);
  const [nodeMin, nodeMax] = scaleMeta?.nodeRange ?? [800, 1500];
  const nodeMid = Math.round((nodeMin + nodeMax) / 2);

  let breakEvenMonths: number | null = null;
  if (publicCostMonth >= nodeMid) breakEvenMonths = 1;
  else if (publicCostMonth > 0) breakEvenMonths = Math.min(36, Math.ceil(nodeMid / publicCostMonth));

  return { users, queriesPerUser, workingDays, dailyQueries, monthlyQueries, publicCostMonth, nodeMin, nodeMax, nodeMid, breakEvenMonths };
}

export function buildPayloadFromState(state: ProxdeepDiagnosticState, recommendation: ReturnType<typeof buildRecommendation>) {
  const legacy = toLegacyAnswers(state);
  const branchId = getBranchChoiceLegacy(state);
  const useCases = [
    legacy.infraMode,
    branchId,
    legacy.dataMaturity,
    legacy.scaleEnvironment,
    legacy.governanceLevel,
  ].filter(Boolean);

  if (legacy.scopeFocus === 'customer_channels') useCases.push('external', 'customer');
  if (legacy.scopeFocus === 'internal_ops') useCases.push('docs', 'employees');
  if (legacy.scopeFocus === 'data_analytics') useCases.push('databases', 'analytics');
  if (legacy.stackComplexity === 'saas_apis') useCases.push('apis', 'external');
  if (legacy.stackComplexity === 'on_premise') useCases.push('databases', 'on_premise');
  if (legacy.stackComplexity === 'fragmented') useCases.push('docs', 'databases', 'apis');
  if (legacy.dataMaturity === 'raw_data') useCases.push('data_preparation', 'unstructured');
  if (legacy.dataMaturity === 'centralized_dirty') useCases.push('data_normalization', 'data_governance');
  if (legacy.dataMaturity === 'production_ready') useCases.push('production_data');
  if (legacy.scaleEnvironment === 'enterprise') useCases.push('tool_orchestrator', 'kubernetes');
  if (legacy.scaleEnvironment === 'focalizada') useCases.push('pilot');

  const infraBadge = state.phase === 'desde_cero' ? DOMAIN_BADGES.infra.desde_cero
    : state.phase === 'sistemas_existentes' ? DOMAIN_BADGES.infra.sistemas_existentes : null;
  const branchBadge = state.phase === 'desde_cero' && state.foco_alcance ? DOMAIN_BADGES.foco[state.foco_alcance]
    : state.phase === 'sistemas_existentes' && state.stack_complejidad ? DOMAIN_BADGES.stack[state.stack_complejidad] : null;
  const madurezBadge = state.phase !== 'empty' && state.madurez_datos
    ? DOMAIN_BADGES.madurez[state.madurez_datos]
    : null;
  const scaleBadge = state.escala_entorno ? DOMAIN_BADGES.escala[state.escala_entorno] : null;
  const govBadge = state.gobernanza_seguridad ? DOMAIN_BADGES.gobernanza[state.gobernanza_seguridad] : null;

  return {
    problem_description: [
      `[${legacy.infraMode}/${branchId}/${legacy.dataMaturity || 'pending'}/${legacy.scaleEnvironment}]`,
      infraBadge,
      branchBadge,
      madurezBadge,
      scaleBadge,
      govBadge,
    ].filter(Boolean).join(' '),
    expected_users_concurrent: getConcurrentUsers(state),
    data_sensitivity: state.gobernanza_seguridad === 'privada_lgpd' ? 'high' : 'medium',
    use_cases_priority: [...new Set(useCases)],
    current_ia_pain_points: recommendation.justification.join(' '),
  };
}

export function getOutputStatus(confidence: Confidence, conflicts: Conflict[]): OutputStatus {
  if (confidence === 'low' || conflicts.some(c => c.severity === 'high')) return 'exploratory';
  if (confidence === 'medium') return 'preliminary';
  return 'ready';
}

export function assertDomainInvariants(state: ProxdeepDiagnosticState): void {
  if (state.phase === 'desde_cero' && state.stack_complejidad !== null) {
    throw new Error('Invariante violada: stack_complejidad debe ser null en rama desde_cero');
  }
  if (state.phase === 'sistemas_existentes' && state.foco_alcance !== null) {
    throw new Error('Invariante violada: foco_alcance debe ser null en rama sistemas_existentes');
  }
}
