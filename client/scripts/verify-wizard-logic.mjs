/**
 * Verificación ejecutable de la lógica pura del ClientWizard (4 pasos).
 * Ejecutar: node client/scripts/verify-wizard-logic.mjs
 *
 * Nota: script histórico redirigido al verificador de 4 pasos.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const target = join(dir, 'verify-wizard-4step-logic.mjs');
const result = spawnSync(process.execPath, [target], { stdio: 'inherit' });
process.exit(result.status ?? 1);
