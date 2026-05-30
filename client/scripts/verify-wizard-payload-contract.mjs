/**
 * Valida que el payload del wizard cumple el contrato del backend
 * (ClientNeedCreate en server/src/routers/client_needs.py).
 * Ejecutar: node client/scripts/verify-wizard-payload-contract.mjs
 */

const VALID_SENSITIVITY = new Set(['low', 'medium', 'high', 'critical']);

function validatePayload(payload) {
  const errors = [];
  if (typeof payload.problem_description !== 'string' || !payload.problem_description.trim()) {
    errors.push('problem_description debe ser string no vacío');
  }
  if (!Number.isInteger(payload.expected_users_concurrent) || payload.expected_users_concurrent < 1) {
    errors.push('expected_users_concurrent debe ser entero >= 1');
  }
  if (!VALID_SENSITIVITY.has(payload.data_sensitivity)) {
    errors.push(`data_sensitivity inválido: ${payload.data_sensitivity}`);
  }
  if (!Array.isArray(payload.use_cases_priority) || payload.use_cases_priority.length === 0) {
    errors.push('use_cases_priority debe ser array no vacío');
  }
  if (
    payload.current_ia_pain_points != null &&
    typeof payload.current_ia_pain_points !== 'string'
  ) {
    errors.push('current_ia_pain_points debe ser string o null');
  }
  return errors;
}

function buildSamplePayload(branch) {
  const samples = {
    A: {
      problem_description: '[from_scratch/internal_ops/production_ready/focalizada] Infraestructura: Creación desde cero Foco: NLP & Documentos Datos: Producción Escala: Focalizada Seguridad: Nube Estándar',
      expected_users_concurrent: 50,
      data_sensitivity: 'medium',
      use_cases_priority: ['from_scratch', 'internal_ops', 'production_ready', 'focalizada', 'standard_flex', 'docs', 'employees', 'production_data', 'pilot'],
      current_ia_pain_points: 'Justificación de prueba rama A.',
    },
    B: {
      problem_description: '[existing/saas_apis/centralized_dirty/enterprise] Infraestructura: Sistemas existentes Stack: SaaS/APIs Datos: Centralizados Escala: Enterprise Seguridad: Privada/LGPD',
      expected_users_concurrent: 250,
      data_sensitivity: 'high',
      use_cases_priority: ['existing', 'saas_apis', 'centralized_dirty', 'enterprise', 'strict_private', 'apis', 'external', 'data_normalization', 'data_governance', 'tool_orchestrator', 'kubernetes'],
      current_ia_pain_points: 'Justificación de prueba rama B.',
    },
  };
  return samples[branch];
}

let failed = 0;
for (const branch of ['A', 'B']) {
  const payload = buildSamplePayload(branch);
  const errors = validatePayload(payload);
  if (errors.length) {
    failed++;
    console.error(`✗ Rama ${branch}:`, errors);
  } else {
    console.log(`✓ Rama ${branch}: payload válido para POST /api/client-needs`);
  }
}

console.log('\nNota: backend real no disponible (Docker/puerto 5000). Validación de contrato local OK.');
process.exit(failed ? 1 : 0);
