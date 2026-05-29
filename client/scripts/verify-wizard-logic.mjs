/**
 * Verificación ejecutable de la lógica pura del ClientWizard.
 * Ejecutar: node client/scripts/verify-wizard-logic.mjs
 */

function detectConflicts(answers) {
  const conflicts = [];
  if (answers.governanceLevel === 'airgapped' && answers.dataSources.includes('apis')) {
    conflicts.push({ id: 'A', severity: 'high', title: 'Air-Gapped + APIs externas' });
  }
  if (
    answers.realtimeNeeded &&
    (answers.concurrencyLevel === 'intensive' ||
      (answers.concurrencyLevel === 'pilot' && answers.userTypes.includes('automated')))
  ) {
    conflicts.push({ id: 'B', severity: 'medium' });
  }
  if (
    answers.governanceLevel === 'airgapped' &&
    answers.userTypes.length > 0 &&
    !answers.userTypes.includes('devs')
  ) {
    conflicts.push({ id: 'C', severity: 'medium' });
  }
  return conflicts;
}

function calculateConfidence(answers, conflicts, currentStep = 6) {
  let completed = 0;
  if (answers.processCategory) completed++;
  if (answers.concurrencyLevel) completed++;
  if (answers.governanceLevel) completed++;
  if (answers.dataSources.length > 0) completed++;
  if (currentStep >= 5 || answers.realtimeNeeded || answers.agentsNeeded) completed++;

  const openAssumptions =
    (answers.processDescription.trim().length < 5 ? 1 : 0) +
    (answers.userTypes.length === 0 ? 1 : 0);

  const isHighSensitivity =
    ['airgapped', 'vpc'].includes(answers.governanceLevel) ||
    ['health', 'legal', 'finance'].includes(answers.processCategory);

  const hasHigh = conflicts.some(c => c.severity === 'high');
  const hasMedium = conflicts.some(c => c.severity === 'medium');

  if (completed < 3 || hasHigh) return 'low';
  if (completed < 5 || hasMedium || openAssumptions > 1 ||
      (isHighSensitivity && (openAssumptions > 0 || completed < 5))) return 'medium';
  return 'high';
}

function buildRecommendation(answers) {
  let envLabel = null;
  let scale = null;
  if (answers.governanceLevel === 'airgapped') envLabel = 'Despliegue local aislado (Air-Gapped)';
  else if (answers.governanceLevel === 'vpc') envLabel = 'Canal dedicado en nube privada (VPC)';
  else if (answers.governanceLevel === 'standard') envLabel = 'Entorno privado encriptado';

  if (answers.concurrencyLevel === 'pilot') scale = 'Escala piloto (< 50 usuarios simultáneos)';
  else if (answers.concurrencyLevel === 'department') scale = 'Escala departamental (50–300 usuarios simultáneos)';
  else if (answers.concurrencyLevel === 'intensive') scale = 'Escala intensiva (> 300 usuarios o procesos automatizados)';

  const architecture = envLabel && scale ? `${envLabel} — ${scale}` : envLabel || scale || null;
  return { architecture };
}

function buildFinancialScenario(answers) {
  const concurrencyMap = { pilot: 25, department: 150, intensive: 500 };
  const users = concurrencyMap[answers.concurrencyLevel] || 25;
  const publicCostMonth = Math.round(users * 20 * 22 * 0.004);
  const ranges = { pilot: [800, 1500], department: [1800, 3500], intensive: [4000, 8000] };
  const [nodeMin, nodeMax] = ranges[answers.concurrencyLevel] || ranges.pilot;
  return { users, publicCostMonth, nodeMin, nodeMax };
}

function getOutputStatus(confidence, conflicts) {
  if (confidence === 'low' || conflicts.some(c => c.severity === 'high')) return 'exploratory';
  if (confidence === 'medium') return 'preliminary';
  return 'ready';
}

const OUTPUT_LABELS = {
  exploratory: 'Recomendación exploratoria',
  preliminary: 'Recomendación preliminar validable',
  ready: 'Lista para propuesta comercial',
};

function evaluate(answers, step = 6) {
  const conflicts = detectConflicts(answers);
  const confidence = calculateConfidence(answers, conflicts, step);
  const recommendation = buildRecommendation(answers);
  const financial = buildFinancialScenario(answers);
  const outputStatus = getOutputStatus(confidence, conflicts);
  return { conflicts, confidence, architecture: recommendation.architecture, financial, outputStatus, outputLabel: OUTPUT_LABELS[outputStatus] };
}

const completeBase = {
  processCategory: 'legal',
  processDescription: 'Revisión de contratos de proveedores internacionales',
  userTypes: ['employees'],
  concurrencyLevel: 'department',
  governanceLevel: 'vpc',
  dataSources: ['docs'],
  realtimeNeeded: false,
  agentsNeeded: false,
};

console.log('=== VALIDACIÓN 1: Flujo final (paso 6) — payload y estado sin conflictos ===');
const v1 = evaluate(completeBase);
const payload = {
  problem_description: `[${completeBase.processCategory}] ${completeBase.processDescription}`,
  expected_users_concurrent: 150,
  data_sensitivity: 'high',
  use_cases_priority: [...completeBase.userTypes, ...completeBase.dataSources],
  current_ia_pain_points: '(justification array joined)',
};
console.log(JSON.stringify({ step: 6, submitRoute: 'POST /api/client-needs', payload, result: v1, canSubmit: v1.outputStatus !== 'exploratory' }, null, 2));

console.log('\n=== VALIDACIÓN 2: Editar desde salida — cambio de volumen recalcula todo ===');
const beforeEdit = evaluate(completeBase);
const afterEdit = evaluate({ ...completeBase, concurrencyLevel: 'intensive' });
console.log(JSON.stringify({ beforeEdit, afterEdit, changed: {
  architecture: beforeEdit.architecture !== afterEdit.architecture,
  financialUsers: beforeEdit.financial.users !== afterEdit.financial.users,
  financialCost: beforeEdit.financial.publicCostMonth !== afterEdit.financial.publicCostMonth,
}}, null, 2));

console.log('\n=== VALIDACIÓN 3: Air-Gapped + APIs externas — conflicto inmediato ===');
const airGapStep3 = evaluate({ ...completeBase, governanceLevel: 'airgapped', dataSources: [] }, 3);
const airGapStep4 = evaluate({ ...completeBase, governanceLevel: 'airgapped', dataSources: ['apis'] }, 4);
console.log(JSON.stringify({
  step3_no_apis: { conflicts: airGapStep3.conflicts, confidence: airGapStep3.confidence },
  step4_with_apis: { conflicts: airGapStep4.conflicts, confidence: airGapStep4.confidence, outputStatus: airGapStep4.outputStatus },
  conflictA_fires_on_step4: airGapStep4.conflicts.some(c => c.id === 'A'),
}, null, 2));

console.log('\n=== VALIDACIÓN 4: Conflicto activo impide estado "Apta para propuesta" ===');
const v4 = evaluate({ ...completeBase, governanceLevel: 'airgapped', dataSources: ['apis'] });
console.log(JSON.stringify({
  conflicts: v4.conflicts,
  confidence: v4.confidence,
  outputStatus: v4.outputStatus,
  outputLabel: v4.outputLabel,
  isReady: v4.outputStatus === 'ready',
  canSubmit: v4.outputStatus !== 'exploratory',
}, null, 2));
