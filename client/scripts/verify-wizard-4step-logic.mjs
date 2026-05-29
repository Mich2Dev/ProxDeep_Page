/**
 * Verificación de la lógica del wizard ProxDeep (4 pasos).
 * Ejecutar: node client/scripts/verify-wizard-4step-logic.mjs
 */

const INFRA_OPTIONS = [
  { id: 'from_scratch', summaryBadge: 'Infraestructura: Desde cero' },
  { id: 'existing', summaryBadge: 'Infraestructura: Sistemas existentes' },
];
const SCOPE_OPTIONS = [
  { id: 'internal_ops', summaryBadge: 'Foco: Operaciones' },
  { id: 'customer_channels', summaryBadge: 'Foco: Clientes' },
  { id: 'data_analytics', summaryBadge: 'Foco: Analítica' },
];
const STACK_OPTIONS = [
  { id: 'saas_apis', summaryBadge: 'Stack: SaaS/APIs' },
  { id: 'on_premise', summaryBadge: 'Stack: On-Premise' },
  { id: 'fragmented', summaryBadge: 'Stack: Fragmentado' },
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
  if (step < 3) next.scaleEnvironment = '';
  if (step < 4) next.governanceLevel = '';
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

function calculateConfidence(answers, conflicts, maxVisibleStep = 4) {
  let completed = 0;
  if (answers.infraMode) completed++;
  if (getBranchChoice(answers)) completed++;
  if (answers.scaleEnvironment) completed++;
  if (answers.governanceLevel) completed++;
  const hasHigh = conflicts.some(c => c.severity === 'high');
  const hasMedium = conflicts.some(c => c.severity === 'medium');
  if (completed < 3 || hasHigh) return 'low';
  if (completed < 4 || hasMedium || maxVisibleStep < 4) return 'medium';
  return 'high';
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
  const scaleOpt = SCALE_OPTIONS.find(o => o.id === answers.scaleEnvironment);
  const sec = SECURITY_OPTIONS.find(o => o.id === answers.governanceLevel);
  const useCases = [
    answers.infraMode,
    branchId,
    answers.scaleEnvironment,
    answers.governanceLevel,
  ].filter(Boolean);
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
  };
}

function canShowRecommendation(answers) {
  return !!(
    answers.infraMode &&
    getBranchChoice(answers) &&
    answers.scaleEnvironment &&
    answers.governanceLevel
  );
}

const REQUIRED_BADGES = [
  'Infraestructura: Desde cero',
  'Infraestructura: Sistemas existentes',
  'Foco: Operaciones',
  'Foco: Clientes',
  'Foco: Analítica',
  'Stack: SaaS/APIs',
  'Stack: On-Premise',
  'Stack: Fragmentado',
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
  const all = [...INFRA_OPTIONS, ...SCOPE_OPTIONS, ...STACK_OPTIONS, ...SCALE_OPTIONS, ...SECURITY_OPTIONS];
  assert(`badge "${badge}"`, all.some(o => o.summaryBadge === badge));
}

console.log('\n=== Rama A completa ===');
const branchA = {
  infraMode: 'from_scratch',
  scopeFocus: 'internal_ops',
  stackComplexity: '',
  scaleEnvironment: 'focalizada',
  governanceLevel: 'standard_flex',
};
const payloadA = buildPayloadFromAnswers(branchA);
assert('canShowRecommendation rama A', canShowRecommendation(branchA));
assert('usuarios concurrentes = 50', payloadA.expected_users_concurrent === 50);
assert('payload incluye badges A', payloadA.problem_description.includes('Infraestructura: Desde cero'));
assert('payload incluye escala', payloadA.problem_description.includes('Escala: Focalizada'));
assert('confianza alta rama A', calculateConfidence(branchA, [], 4) === 'high');

console.log('\n=== Rama B completa ===');
const branchB = {
  infraMode: 'existing',
  scopeFocus: '',
  stackComplexity: 'saas_apis',
  scaleEnvironment: 'enterprise',
  governanceLevel: 'strict_private',
};
const payloadB = buildPayloadFromAnswers(branchB);
assert('canShowRecommendation rama B', canShowRecommendation(branchB));
assert('usuarios concurrentes = 250', payloadB.expected_users_concurrent === 250);
assert('sensibilidad alta LGPD', payloadB.data_sensitivity === 'high');
assert('conflicto A (LGPD + SaaS)', detectConflicts(branchB).some(c => c.id === 'A'));
assert('confianza baja con conflicto alto', calculateConfidence(branchB, detectConflicts(branchB), 4) === 'low');

console.log('\n=== Cambio A -> B (reset infra) ===');
let state = { ...branchA };
state = selectInfraMode(state, 'existing');
assert('limpia scopeFocus', state.scopeFocus === '');
assert('limpia scaleEnvironment', state.scaleEnvironment === '');
assert('limpia governanceLevel', state.governanceLevel === '');
assert('conserva infraMode nuevo', state.infraMode === 'existing');
assert('no canShowRecommendation tras switch', !canShowRecommendation(state));

console.log('\n=== Cambio B -> A (reset infra) ===');
state = { ...branchB };
state = selectInfraMode(state, 'from_scratch');
assert('limpia stackComplexity', state.stackComplexity === '');
assert('limpia escala y gobernanza', state.scaleEnvironment === '' && state.governanceLevel === '');

console.log('\n=== Rollback al reabrir paso 2 ===');
state = { ...branchA };
const reopened = resetAnswersAfterStep(state, 2);
assert('conserva pasos 1-2', reopened.infraMode && reopened.scopeFocus);
assert('limpia paso 3', reopened.scaleEnvironment === '');
assert('limpia paso 4', reopened.governanceLevel === '');

console.log('\n=== Submit payload (contrato backend) ===');
const submitKeys = ['problem_description', 'expected_users_concurrent', 'data_sensitivity', 'use_cases_priority'];
assert('payload tiene campos del contrato', submitKeys.every(k => k in payloadA));

console.log(`\n=== RESULTADO: ${passed} OK, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);
