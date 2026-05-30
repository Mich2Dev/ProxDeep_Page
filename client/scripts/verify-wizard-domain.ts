/**
 * Tests de invariantes del dominio tipado del wizard.
 * Ejecutar: npx tsx scripts/verify-wizard-domain.ts
 */
import {
  assertDomainInvariants,
  createInitialState,
  selectInfraestructuraFromUi,
  selectFocoFromUi,
  selectStackFromUi,
  selectMadurezFromUi,
  selectEscalaFromUi,
  selectGobernanzaFromUi,
  resetAfterStep,
  toLegacyAnswers,
  isStepComplete,
  calculateConfidence,
  detectConflicts,
} from '../src/domain/wizardDiagnostic.ts';
import {
  inferDiagnosticArchetype,
  resolveDiagnosticReportArchetype,
  getDiagnosticReport,
} from '../src/domain/wizardDiagnosticInference.ts';

let failed = 0;
function ok(label: string, cond: boolean) {
  if (cond) console.log(`  ✓ ${label}`);
  else { failed++; console.error(`  ✗ ${label}`); }
}

console.log('=== Invariantes de unión discriminada ===');

let state = createInitialState();
assertDomainInvariants(state);
ok('estado inicial válido', state.phase === 'empty');

state = selectInfraestructuraFromUi(state, 'from_scratch');
assertDomainInvariants(state);
ok('rama desde_cero: stack null', state.phase === 'desde_cero' && state.stack_complejidad === null);
ok('legacy sin stack', toLegacyAnswers(state).stackComplexity === '');

state = selectFocoFromUi(state, 'internal_ops');
assertDomainInvariants(state);
ok('foco mapeado', toLegacyAnswers(state).scopeFocus === 'internal_ops');

state = selectInfraestructuraFromUi(state, 'existing');
assertDomainInvariants(state);
ok('switch a existing limpia foco', state.phase === 'sistemas_existentes' && state.foco_alcance === null);
ok('legacy sin scope', toLegacyAnswers(state).scopeFocus === '');

state = selectStackFromUi(state, 'saas_apis');
state = selectMadurezFromUi(state, 'production_ready');
state = selectEscalaFromUi(state, 'enterprise');
state = selectGobernanzaFromUi(state, 'strict_private');
assertDomainInvariants(state);
ok('rama B completa', toLegacyAnswers(state).stackComplexity === 'saas_apis');
ok('madurez mapeada', toLegacyAnswers(state).dataMaturity === 'production_ready');

const reopened = resetAfterStep(state, 2);
assertDomainInvariants(reopened);
ok('rollback paso 2 limpia madurez', reopened.madurez_datos === '');
ok('rollback paso 2 limpia escala', reopened.escala_entorno === '');

try {
  selectStackFromUi(selectInfraestructuraFromUi(createInitialState(), 'from_scratch'), 'saas_apis');
  ok('selectStack en rama A debe fallar', false);
} catch {
  ok('selectStack en rama A lanza error', true);
}

try {
  selectFocoFromUi(selectInfraestructuraFromUi(createInitialState(), 'existing'), 'internal_ops');
  ok('selectFoco en rama B debe fallar', false);
} catch {
  ok('selectFoco en rama B lanza error', true);
}

console.log('\n=== Matriz de inferencia arquetípica ===');

function completeBranchA(state: ReturnType<typeof createInitialState>, foco: 'internal_ops' | 'customer_channels' | 'data_analytics') {
  let s = selectInfraestructuraFromUi(state, 'from_scratch');
  s = selectFocoFromUi(s, foco);
  s = selectMadurezFromUi(s, 'production_ready');
  s = selectEscalaFromUi(s, 'focalizada');
  return selectGobernanzaFromUi(s, 'standard_flex');
}

const agilidad = completeBranchA(createInitialState(), 'internal_ops');
ok('Arquetipo_Agilidad (operaciones)', inferDiagnosticArchetype(agilidad) === 'Arquetipo_Agilidad');
ok('Agilidad report title', getDiagnosticReport(agilidad).title.includes('Ágil'));

const agilidadClientes = completeBranchA(createInitialState(), 'customer_channels');
ok('Arquetipo_Agilidad (clientes)', inferDiagnosticArchetype(agilidadClientes) === 'Arquetipo_Agilidad');

const analitica = completeBranchA(createInitialState(), 'data_analytics');
ok('Arquetipo_Analitica', inferDiagnosticArchetype(analitica) === 'Arquetipo_Analitica');
ok('Analítica report title', getDiagnosticReport(analitica).title.includes('Analítica'));

let enterprise = selectInfraestructuraFromUi(createInitialState(), 'existing');
enterprise = selectStackFromUi(enterprise, 'fragmented');
enterprise = selectMadurezFromUi(enterprise, 'centralized_dirty');
enterprise = selectEscalaFromUi(enterprise, 'enterprise');
enterprise = selectGobernanzaFromUi(enterprise, 'strict_private');
ok('Arquetipo_Enterprise', inferDiagnosticArchetype(enterprise) === 'Arquetipo_Enterprise');
ok('Enterprise report title', getDiagnosticReport(enterprise).title.includes('Enterprise'));

const defaultCase = selectGobernanzaFromUi(
  selectEscalaFromUi(selectInfraestructuraFromUi(createInitialState(), 'existing'), 'focalizada'),
  'standard_flex',
);
ok('Arquetipo_Default (incompleto rama B)', inferDiagnosticArchetype(defaultCase) === 'Arquetipo_Default');
ok('Default → plantilla Agilidad', resolveDiagnosticReportArchetype('Arquetipo_Default') === 'Arquetipo_Agilidad');

console.log('\n=== Madurez de datos ===');
ok('paso 3 completo con madurez', isStepComplete(3, agilidad));
const analiticaCruda = selectMadurezFromUi(
  selectFocoFromUi(selectInfraestructuraFromUi(createInitialState(), 'from_scratch'), 'data_analytics'),
  'raw_data',
);
ok('reporte analítica modulado por datos crudos', getDiagnosticReport(analiticaCruda).evaluacion.includes('ingeniería de datos'));
const conflicts = detectConflicts(enterprise);
ok('datos crudos baja confianza en enterprise', calculateConfidence(
  { ...enterprise, madurez_datos: 'datos_crudos' },
  conflicts,
  5,
) === 'low');

console.log(`\n=== RESULTADO: ${failed === 0 ? 'OK' : failed + ' FAIL'} ===`);
process.exit(failed ? 1 : 0);
