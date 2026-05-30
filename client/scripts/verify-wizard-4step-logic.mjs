/**
 * Verificación de la lógica del wizard ProxDeep (5 pasos).
 * Ejecutar: node client/scripts/verify-wizard-4step-logic.mjs
 */

const INFRA_OPTIONS = [
  { id: 'from_scratch', summaryBadge: 'Infraestructura: Creación desde cero' },
  { id: 'existing', summaryBadge: 'Infraestructura: Sistemas existentes' },
];
const SCOPE_OPTIONS = [
  { id: 'internal_ops', summaryBadge: 'Foco: NLP & Documentos' },
  { id: 'customer_channels', summaryBadge: 'Foco: Clientes' },
  { id: 'data_analytics', summaryBadge: 'Foco: Data Analytics' },
];
const STACK_OPTIONS = [
  { id: 'saas_apis', summaryBadge: 'Stack: SaaS/APIs' },
  { id: 'on_premise', summaryBadge: 'Stack: On-Premise' },
  { id: 'fragmented', summaryBadge: 'Stack: Silos Desconectados' },
];
const MADUREZ_OPTIONS = [
  { id: 'raw_data', summaryBadge: 'Datos: Crudos' },
  { id: 'centralized_dirty', summaryBadge: 'Datos: Centralizados' },
  { id: 'production_ready', summaryBadge: 'Datos: Producción' },
];
const SCALE_OPTIONS = [
  { id: 'focalizada', summaryBadge: 'Escala: Focalizada', concurrentUsers: 50 },
  { id: 'enterprise', summaryBadge: 'Escala: Enterprise', concurrentUsers: 250 },
];
const SECURITY_OPTIONS = [
  { id: 'standard_flex', summaryBadge: 'Seguridad: Nube Estándar' },
  { id: 'strict_private', summaryBadge: 'Seguridad: Privada/LGPD' },
];

const initialAnswers = {
  infraMode: '',
  scopeFocus: '',
  stackComplexity: '',
  dataMaturity: '',
  scaleEnvironment: '',
  governanceLevel: '',
};

function getBranchChoice(answers) {
  return answers.infraMode === 'from_scratch' ? answers.scopeFocus : answers.stackComplexity;
}

function resetAnswersAfterStep(answers, step) {
  const next = { ...answers };
  if (step < 2) {
    next.scopeFocus = '';
    next.stackComplexity = '';
  }
  if (step < 3) next.dataMaturity = '';
  if (step < 4) next.scaleEnvironment = '';
  if (step < 5) next.governanceLevel = '';
  return next;
}

function selectInfraMode(prev, id) {
  if (prev.infraMode === id) return prev;
  return { ...initialAnswers, infraMode: id };
}

function getConcurrentUsers(answers) {
  const scale = SCALE_OPTIONS.find(o => o.id === answers.scaleEnvironment);
  return scale?.concurrentUsers ?? 50;
}

function calculateConfidence(answers, conflicts, maxVisibleStep = 5) {
  let completed = 0;
  if (answers.infraMode) completed++;
  if (getBranchChoice(answers)) completed++;
  if (answers.dataMaturity) completed++;
  if (answers.scaleEnvironment) completed++;
  if (answers.governanceLevel) completed++;
  const hasHigh = conflicts.some(c => c.severity === 'high');
  const hasMedium = conflicts.some(c => c.severity === 'medium');
  let base;
  if (completed < 4 || hasHigh) base = 'low';
  else if (completed < 5 || hasMedium || maxVisibleStep < 5) base = 'medium';
  else base = 'high';

  if (!answers.dataMaturity || hasHigh) return base;
  if (answers.dataMaturity === 'raw_data') {
    return base === 'high' ? 'medium' : 'low';
  }
  if (answers.dataMaturity === 'production_ready' && base === 'medium') return 'high';
  return base;
}

function detectConflicts(answers) {
  const conflicts = [];
  if (answers.governanceLevel === 'strict_private' && answers.stackComplexity === 'saas_apis') {
    conflicts.push({ id: 'A', severity: 'high' });
  }
  return conflicts;
}

function buildPayloadFromAnswers(answers) {
  const branchId = getBranchChoice(answers);
  const infra = INFRA_OPTIONS.find(o => o.id === answers.infraMode);
  const branchOpt = answers.infraMode === 'from_scratch'
    ? SCOPE_OPTIONS.find(o => o.id === answers.scopeFocus)
    : STACK_OPTIONS.find(o => o.id === answers.stackComplexity);
  const madurezOpt = MADUREZ_OPTIONS.find(o => o.id === answers.dataMaturity);
  const scaleOpt = SCALE_OPTIONS.find(o => o.id === answers.scaleEnvironment);
  const sec = SECURITY_OPTIONS.find(o => o.id === answers.governanceLevel);
  const useCases = [
    answers.infraMode,
    branchId,
    answers.dataMaturity,
    answers.scaleEnvironment,
    answers.governanceLevel,
  ].filter(Boolean);
  return {
    problem_description: [
      `[${answers.infraMode}/${branchId}/${answers.dataMaturity}/${answers.scaleEnvironment}]`,
      infra?.summaryBadge,
      branchOpt?.summaryBadge,
      madurezOpt?.summaryBadge,
      scaleOpt?.summaryBadge,
      sec?.summaryBadge,
    ].filter(Boolean).join(' '),
    expected_users_concurrent: getConcurrentUsers(answers),
    data_sensitivity: answers.governanceLevel === 'strict_private' ? 'high' : 'medium',
    use_cases_priority: [...new Set(useCases)],
  };
}

function canShowRecommendation(answers) {
  return !!(
    answers.infraMode &&
    getBranchChoice(answers) &&
    answers.dataMaturity &&
    answers.scaleEnvironment &&
    answers.governanceLevel
  );
}

const REQUIRED_BADGES = [
  'Infraestructura: Creación desde cero',
  'Infraestructura: Sistemas existentes',
  'Foco: NLP & Documentos',
  'Foco: Clientes',
  'Foco: Data Analytics',
  'Stack: SaaS/APIs',
  'Stack: On-Premise',
  'Stack: Silos Desconectados',
  'Datos: Crudos',
  'Datos: Centralizados',
  'Datos: Producción',
  'Escala: Focalizada',
  'Escala: Enterprise',
  'Seguridad: Nube Estándar',
  'Seguridad: Privada/LGPD',
];

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

console.log('=== Badges del spec ===');
for (const badge of REQUIRED_BADGES) {
  const all = [
    ...INFRA_OPTIONS,
    ...SCOPE_OPTIONS,
    ...STACK_OPTIONS,
    ...MADUREZ_OPTIONS,
    ...SCALE_OPTIONS,
    ...SECURITY_OPTIONS,
  ];
  assert(`badge "${badge}"`, all.some(o => o.summaryBadge === badge));
}

console.log('\n=== Rama A completa ===');
const branchA = {
  infraMode: 'from_scratch',
  scopeFocus: 'internal_ops',
  stackComplexity: '',
  dataMaturity: 'production_ready',
  scaleEnvironment: 'focalizada',
  governanceLevel: 'standard_flex',
};
const payloadA = buildPayloadFromAnswers(branchA);
assert('canShowRecommendation rama A', canShowRecommendation(branchA));
assert('usuarios concurrentes = 50', payloadA.expected_users_concurrent === 50);
assert('payload incluye badges A', payloadA.problem_description.includes('Infraestructura: Creación desde cero'));
assert('payload incluye madurez', payloadA.problem_description.includes('Datos: Producción'));
assert('payload incluye escala', payloadA.problem_description.includes('Escala: Focalizada'));
assert('confianza alta rama A', calculateConfidence(branchA, [], 5) === 'high');

console.log('\n=== Rama B completa ===');
const branchB = {
  infraMode: 'existing',
  scopeFocus: '',
  stackComplexity: 'saas_apis',
  dataMaturity: 'centralized_dirty',
  scaleEnvironment: 'enterprise',
  governanceLevel: 'strict_private',
};
const payloadB = buildPayloadFromAnswers(branchB);
assert('canShowRecommendation rama B', canShowRecommendation(branchB));
assert('usuarios concurrentes = 250', payloadB.expected_users_concurrent === 250);
assert('sensibilidad alta LGPD', payloadB.data_sensitivity === 'high');
assert('conflicto A (LGPD + SaaS)', detectConflicts(branchB).some(c => c.id === 'A'));
assert('confianza baja con conflicto alto', calculateConfidence(branchB, detectConflicts(branchB), 5) === 'low');

console.log('\n=== Madurez datos_crudos baja confianza ===');
const branchRaw = { ...branchA, dataMaturity: 'raw_data' };
assert('datos crudos reduce confianza', calculateConfidence(branchRaw, [], 5) === 'medium');

console.log('\n=== Cambio A -> B (reset infra) ===');
let state = { ...branchA };
state = selectInfraMode(state, 'existing');
assert('limpia scopeFocus', state.scopeFocus === '');
assert('limpia dataMaturity', state.dataMaturity === '');
assert('limpia scaleEnvironment', state.scaleEnvironment === '');
assert('limpia governanceLevel', state.governanceLevel === '');
assert('conserva infraMode nuevo', state.infraMode === 'existing');
assert('no canShowRecommendation tras switch', !canShowRecommendation(state));

console.log('\n=== Cambio B -> A (reset infra) ===');
state = { ...branchB };
state = selectInfraMode(state, 'from_scratch');
assert('limpia stackComplexity', state.stackComplexity === '');
assert('limpia madurez escala y gobernanza', state.dataMaturity === '' && state.scaleEnvironment === '' && state.governanceLevel === '');

console.log('\n=== Rollback al reabrir paso 2 ===');
state = { ...branchA };
const reopened = resetAnswersAfterStep(state, 2);
assert('conserva pasos 1-2', reopened.infraMode && reopened.scopeFocus);
assert('limpia paso 3 madurez', reopened.dataMaturity === '');
assert('limpia paso 4 escala', reopened.scaleEnvironment === '');
assert('limpia paso 5 gobernanza', reopened.governanceLevel === '');

console.log('\n=== Submit payload (contrato backend) ===');
const submitKeys = ['problem_description', 'expected_users_concurrent', 'data_sensitivity', 'use_cases_priority'];
assert('payload tiene campos del contrato', submitKeys.every(k => k in payloadA));

console.log(`\n=== RESULTADO: ${passed} OK, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);
