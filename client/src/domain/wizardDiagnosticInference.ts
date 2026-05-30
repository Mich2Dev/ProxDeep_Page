import type { MadurezDatos, ProxdeepDiagnosticState } from './wizardDiagnostic';

/** Claves identificadoras del motor de inferencia arquetípica. */
export type DiagnosticArchetypeKey =
  | 'Arquetipo_Agilidad'
  | 'Arquetipo_Analitica'
  | 'Arquetipo_Enterprise'
  | 'Arquetipo_Default';

/** Arquetipos con plantilla de reporte completa (Default reutiliza Agilidad). */
export type DiagnosticReportArchetype =
  | 'Arquetipo_Agilidad'
  | 'Arquetipo_Analitica'
  | 'Arquetipo_Enterprise';

export type DiagnosticReport = {
  title: string;
  evaluacion: string;
  arquitectura: string;
  mitigacion: string;
  nextStep: string;
};

export const DIAGNOSTIC_REPORTS: Record<DiagnosticReportArchetype, DiagnosticReport> = {
  Arquetipo_Agilidad: {
    title: 'Diagnóstico de Implementación Ágil y Automatización Focalizada',
    evaluacion:
      'Su organización se encuentra en una posición metodológica favorable: al no contar con infraestructura heredada, evitamos la deuda técnica y los bloqueos de sistemas legacy. La necesidad está concentrada en optimizar la productividad de un área o canal específico con un volumen de datos controlado, operando bajo políticas de privacidad comerciales estándar.',
    arquitectura:
      'Despliegue Serverless de baja fricción. Recomendamos la utilización de modelos comerciales avanzados de frontera (familia Anthropic Claude 3.5 Sonnet o GPT-4o) consumidos directamente a través de API. La lógica de negocio e inyección de contexto se estructurará mediante orquestadores en la nube administrados, reduciendo los costos de mantenimiento de infraestructura a cero.',
    mitigacion:
      'El principal riesgo en este nivel es el descontrol en el consumo de tokens y la falta de escalabilidad si el proceso se expande. Se deben implementar capas de caching de consultas y límites estrictos de llamadas (Rate Limiting) desde el día uno.',
    nextStep:
      'Agendar una sesión técnica de 30 minutos para mapear el flujo de trabajo manual actual y estructurar un MVP funcional entregable en un plazo estimado de 3 semanas.',
  },
  Arquetipo_Analitica: {
    title: 'Diagnóstico de Infraestructura Analítica Avanzada e Inteligencia de Datos',
    evaluacion:
      'Su requerimiento central no es conversacional ni de procesamiento de lenguaje natural tradicional, sino la explotación de flujos de datos cuantitativos y relacionales. El desafío principal radica en romper el aislamiento de la información y habilitar capacidades predictivas directas sobre las bases de datos de la compañía.',
    arquitectura:
      'Arquitectura basada en Agentes Especialistas en Datos. Pipeline donde la IA actúa como una capa de abstracción semántica utilizando arquitecturas de Text-to-SQL y entornos aislados de ejecución de código (Code Interpreters autónomos). Modelos como GPT-4o o Gemini 1.5 Pro traducen las preguntas de negocio en consultas estructuradas directas a sus almacenes de datos (Snowflake, PostgreSQL, BigQuery), garantizando respuestas exactas.',
    mitigacion:
      'Seguridad de las consultas (SQL Injection generado por IA) y alucinaciones matemáticas. La arquitectura debe incluir un sandbox de ejecución aislado y una capa de validación de esquemas (Schema Mapping) estricta que impida operaciones de escritura no autorizadas.',
    nextStep:
      'Programar un relevamiento técnico orientado a la ingeniería de datos para auditar la estructura actual de sus bases de datos y evaluar la viabilidad de la capa semántica de IA.',
  },
  Arquetipo_Enterprise: {
    title: 'Diagnóstico de Arquitectura de IA Privada y Orquestación Enterprise',
    evaluacion:
      'Su organización presenta el escenario de mayor complejidad estructural y de cumplimiento: coexistencia de silos de datos aislados (entornos locales e híbridos en la nube), alta demanda de volumen simultáneo y restricciones de cumplimiento normativo estrictas (LGPD / Privacidad Enterprise).',
    arquitectura:
      'Despliegue de Modelos de Código Abierto (Open Source Premium) como Llama 3 70B o Mistral Large, alojados en su propia infraestructura On-Premise o dentro de una Nube Privada Virtual (VPC) totalmente aislada. La solución se empaquetará en microservicios contenerizados y gestionados mediante Docker / Kubernetes (AKS/EKS), conectándose a los silos a través de VPNs/Direct Connect.',
    mitigacion:
      'Alto costo inicial de cómputo (infraestructura de GPUs dedicadas o instancias cloud reservadas) y la latencia en el procesamiento. Es mandatorio ejecutar una fase de optimización de modelos (Quantization y Fine-Tuning específico) para reducir los requerimientos de hardware.',
    nextStep:
      'Coordinar una mesa de trabajo técnica de alta prioridad de 1 hora con un Solution Architect Senior y un especialista en Compliance de Proxdeep para diseñar el plano de ingeniería.',
  },
};

/** Secciones ordenadas para render — evita duplicar estructura en JSX. */
export const DIAGNOSTIC_REPORT_BODY_SECTIONS = [
  { key: 'evaluacion', title: 'Evaluación' },
  { key: 'arquitectura', title: 'Arquitectura recomendada' },
  { key: 'mitigacion', title: 'Mitigación de riesgos' },
] as const satisfies ReadonlyArray<{ key: keyof Pick<DiagnosticReport, 'evaluacion' | 'arquitectura' | 'mitigacion'>; title: string }>;

/**
 * Matriz de inferencia: evalúa reglas específicas antes que Default.
 * Prioridad: Analítica → Enterprise → Agilidad → Default (mapeado a plantilla Agilidad).
 */
export function inferDiagnosticArchetype(state: ProxdeepDiagnosticState): DiagnosticArchetypeKey {
  if (state.phase === 'desde_cero' && state.foco_alcance === 'analitica') {
    return 'Arquetipo_Analitica';
  }

  if (
    state.phase === 'sistemas_existentes'
    && state.stack_complejidad === 'fragmentado'
    && state.escala_entorno === 'enterprise_docker'
    && state.gobernanza_seguridad === 'privada_lgpd'
  ) {
    return 'Arquetipo_Enterprise';
  }

  if (
    state.phase === 'desde_cero'
    && (state.foco_alcance === 'operaciones' || state.foco_alcance === 'clientes')
    && state.escala_entorno === 'focalizada'
    && state.gobernanza_seguridad === 'nube_estandar'
  ) {
    return 'Arquetipo_Agilidad';
  }

  return 'Arquetipo_Default';
}

function isMadurezSensitiveArchetype(archetype: DiagnosticArchetypeKey): boolean {
  return archetype === 'Arquetipo_Analitica' || archetype === 'Arquetipo_Enterprise';
}

const MADUREZ_EVALUACION_APPEND: Record<MadurezDatos, { default: string; sensitive: string }> = {
  datos_crudos: {
    default:
      ' La madurez de datos indica información cruda o dispersa: se requiere una fase previa de preparación, limpieza e integración antes de escalar la solución.',
    sensitive:
      ' Dado el foco analítico o la complejidad enterprise detectada, la ausencia de datos operativos listos condiciona severamente el time-to-value y exige un programa previo de ingeniería de datos.',
  },
  centralizados_sin_limpieza: {
    default:
      ' Los datos están centralizados pero requieren normalización y gobierno operativo antes de un despliegue pleno de IA.',
    sensitive:
      ' Aunque existen repositorios centralizados, la calidad inconsistente impone una fase de normalización, deduplicación y validación de esquemas antes de habilitar analítica o orquestación enterprise.',
  },
  listos_produccion: {
    default:
      ' La preparación de datos es adecuada para alimentar modelos y agentes con menor fricción de arranque.',
    sensitive:
      ' La calidad de datos declarada como lista para producción reduce el riesgo de arranque en escenarios analíticos o enterprise de alta exigencia.',
  },
};

const MADUREZ_MITIGACION_APPEND: Record<MadurezDatos, { default: string; sensitive: string }> = {
  datos_crudos: {
    default:
      ' Mitigación adicional: priorizar inventario de fuentes, pipelines ETL/ELT y validación documental antes de exponer modelos a usuarios finales.',
    sensitive:
      ' Mitigación reforzada: ejecutar discovery de fuentes, taxonomía de datos y sandbox de calidad antes de Text-to-SQL, agentes analíticos o integración multi-silo.',
  },
  centralizados_sin_limpieza: {
    default:
      ' Mitigación adicional: incorporar reglas de calidad, deduplicación y ownership de datos antes del go-live.',
    sensitive:
      ' Mitigación reforzada: establecer capa de Data Quality y mapeo semántico verificable antes de consultas autónomas o consolidación entre silos.',
  },
  listos_produccion: {
    default:
      ' La calidad de datos declarada reduce la necesidad de mitigaciones extensas ligadas a preparación inicial.',
    sensitive:
      ' Con datos listos para producción, el foco de mitigación puede concentrarse en seguridad de consultas y gobernanza operativa, no en limpieza masiva.',
  },
};

const MADUREZ_NEXT_STEP_PREFIX: Record<MadurezDatos, { default: string; sensitive: string }> = {
  datos_crudos: {
    default: 'Primero: workshop de 45 minutos para inventariar fuentes y definir plan de preparación de datos. Luego, ',
    sensitive: 'Primero: relevamiento de datos de alta prioridad (1–2 semanas) antes de arquitectura de IA. Después, ',
  },
  centralizados_sin_limpieza: {
    default: 'Incluir una fase corta de normalización y gobierno de datos en el plan. ',
    sensitive: 'Programar auditoría de calidad y esquemas antes del diseño de agentes o pipelines analíticos. ',
  },
  listos_produccion: {
    default: '',
    sensitive: '',
  },
};

export function applyMadurezDatosModulation(
  report: DiagnosticReport,
  state: ProxdeepDiagnosticState,
  archetype: DiagnosticArchetypeKey,
): DiagnosticReport {
  if (state.phase === 'empty' || !state.madurez_datos) return report;

  const sensitive = isMadurezSensitiveArchetype(archetype);
  const tier = sensitive ? 'sensitive' : 'default';
  const madurez = state.madurez_datos;

  let mitigacion = report.mitigacion + MADUREZ_MITIGACION_APPEND[madurez][tier];
  if (madurez === 'listos_produccion' && !sensitive) {
    mitigacion = report.mitigacion;
  }

  const nextPrefix = MADUREZ_NEXT_STEP_PREFIX[madurez][tier];
  const nextStep = nextPrefix ? `${nextPrefix}${report.nextStep}` : report.nextStep;

  return {
    ...report,
    evaluacion: report.evaluacion + MADUREZ_EVALUACION_APPEND[madurez][tier],
    mitigacion,
    nextStep,
  };
}

export function resolveDiagnosticReportArchetype(
  archetype: DiagnosticArchetypeKey,
): DiagnosticReportArchetype {
  return archetype === 'Arquetipo_Default' ? 'Arquetipo_Agilidad' : archetype;
}

export function getDiagnosticReport(state: ProxdeepDiagnosticState): DiagnosticReport {
  const archetype = inferDiagnosticArchetype(state);
  const base = DIAGNOSTIC_REPORTS[resolveDiagnosticReportArchetype(archetype)];
  return applyMadurezDatosModulation(base, state, archetype);
}

export function resolveDiagnosticInference(state: ProxdeepDiagnosticState): {
  archetype: DiagnosticArchetypeKey;
  reportArchetype: DiagnosticReportArchetype;
  report: DiagnosticReport;
} {
  const archetype = inferDiagnosticArchetype(state);
  const reportArchetype = resolveDiagnosticReportArchetype(archetype);
  const base = DIAGNOSTIC_REPORTS[reportArchetype];
  return {
    archetype,
    reportArchetype,
    report: applyMadurezDatosModulation(base, state, archetype),
  };
}
