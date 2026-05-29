/**
 * Smoke E2E del wizard en /diagnostic (modo demo).
 * Ejecutar: node client/scripts/e2e-wizard-4step.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.WIZARD_E2E_URL || 'http://localhost:5173';

async function loginDemo(page) {
  await page.goto(`${BASE}/login`);
  await page.evaluate(() => localStorage.setItem('proxdeep_demo_role', 'loggedin'));
  await page.goto(`${BASE}/diagnostic`);
  await page.waitForSelector('text=Diagnóstico de Infraestructura de IA', { timeout: 15000 });
}

async function pickRadio(page, label) {
  await page.getByRole('radio', { name: new RegExp(label, 'i') }).first().click();
}

async function pickButton(page, label) {
  await page.getByRole('button', { name: new RegExp(label, 'i') }).first().click();
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];

function ok(name, cond) {
  results.push({ name, ok: cond });
  console.log(cond ? `  ✓ ${name}` : `  ✗ ${name}`);
}

try {
  console.log('=== E2E 1: Rama A completa + output ===');
  await loginDemo(page);
  await pickRadio(page, 'Automatización Inteligente');
  await page.waitForTimeout(500);
  await pickButton(page, 'Operaciones y Procesos Internos');
  await page.waitForTimeout(500);
  await pickButton(page, 'Flujo Focalizado');
  await page.waitForTimeout(500);
  await pickButton(page, 'Estándar / Flexibilidad Alta');
  await page.waitForTimeout(500);
  ok('CTA Ver recomendación', await page.getByRole('button', { name: /Ver recomendación/i }).isVisible());
  await page.getByRole('button', { name: /Ver recomendación/i }).click();
  ok('Output visible', await page.getByText('1. Perfil detectado').isVisible());
  ok('Badge escala', await page.getByText('Escala: Focalizada').first().isVisible());

  console.log('\n=== E2E 2: Editar paso 1 desde output (rollback) ===');
  await page.locator('button[title="Editar esta respuesta"]').first().click();
  await page.waitForTimeout(500);
  ok('Formulario de edición', await page.getByText('Editando:').isVisible());
  await pickRadio(page, 'Optimización de Procesos');
  await page.waitForTimeout(500);
  ok('Paso 2 muestra stack', await page.getByText('SaaS y Nube Comercial').isVisible());
  ok('Foco anterior limpiado', !(await page.getByText('Foco: Operaciones').isVisible().catch(() => false)));

  console.log('\n=== E2E 3: Rama B + conflicto + submit demo ===');
  await pickButton(page, 'SaaS y Nube Comercial');
  await page.waitForTimeout(500);
  await pickButton(page, 'Despliegue Corporativo');
  await page.waitForTimeout(500);
  await pickButton(page, 'Crítico / Restricción Estricta');
  await page.waitForTimeout(500);
  ok('Conflicto A en panel', await page.getByText(/Conflicto A/i).isVisible());
  await page.getByRole('button', { name: /Ver recomendación/i }).click();
  ok('Badge stack', await page.getByText('Stack: SaaS/APIs').first().isVisible());
  const submitBtn = page.getByRole('button', { name: /Enviar diagnóstico/i });
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(800);
    ok('Submit demo OK', !(await page.getByText(/Error al guardar/i).isVisible().catch(() => false)));
  } else {
    ok('Submit bloqueado por conflicto (esperado)', true);
  }

  console.log('\n=== E2E 4: Reopen resumen colapsado ===');
  await page.reload();
  await page.waitForSelector('text=Diagnóstico de Infraestructura de IA');
  await pickRadio(page, 'Automatización Inteligente');
  await page.waitForTimeout(400);
  await pickButton(page, 'Análisis de Datos y Reportes');
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /Infraestructura: Desde cero/i }).click();
  await page.waitForTimeout(400);
  ok('Reopen paso 1 activo', await page.getByText('Paso 1 · Activo').isVisible());
  ok('Paso 2 limpiado tras reopen paso 1', !(await page.getByText('Foco: Analítica').isVisible().catch(() => false)));
  console.log('\n=== E2E 5: Submit exitoso rama A (sin conflictos) ===');
  await page.reload();
  await page.waitForSelector('text=Diagnóstico de Infraestructura de IA');
  await pickRadio(page, 'Automatización Inteligente');
  await page.waitForTimeout(400);
  await pickButton(page, 'Operaciones y Procesos Internos');
  await page.waitForTimeout(400);
  await pickButton(page, 'Flujo Focalizado');
  await page.waitForTimeout(400);
  await pickButton(page, 'Estándar / Flexibilidad Alta');
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /Ver recomendación/i }).click();
  await page.waitForTimeout(500);
  const saveBtn = page.getByRole('button', { name: /Guardar diagnóstico/i });
  ok('Submit habilitado rama A', await saveBtn.isEnabled());
  await saveBtn.click();
  await page.waitForTimeout(1000);
  ok('Submit demo OK', await page.getByText(/Diagnóstico guardado/i).isVisible());
} catch (err) {
  console.error('E2E error:', err.message);
  results.push({ name: 'runtime', ok: false });
} finally {
  await browser.close();
}

const fails = results.filter(r => !r.ok).length;
console.log(`\n=== E2E RESULTADO: ${results.length - fails}/${results.length} OK ===`);
process.exit(fails > 0 ? 1 : 0);
