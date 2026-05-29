import { chromium } from 'playwright';

const cases = [
  { url: 'http://localhost:5174/proposal/1', label: '5174 (user URL)' },
  { url: 'http://localhost:5173/proposal/1', label: '5173 (active dev server)' },
];

const browser = await chromium.launch({ headless: true });

for (const c of cases) {
  console.log(`\n=== ${c.label} ===`);
  console.log('URL:', c.url);

  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  try {
    const response = await page.goto(c.url, { waitUntil: 'domcontentloaded', timeout: 8000 });
    console.log('HTTP:', response ? `${response.status()} ${response.url()}` : 'no response');
    await page.waitForTimeout(2500);

    const finalUrl = page.url();
    const bodyText = await page.locator('body').innerText();
    const hasSpinner = bodyText.includes('Iniciando conexión segura');
    const hasLogin = finalUrl.includes('/login') || bodyText.includes('Iniciar Sesión');
    const hasProposalTitle = bodyText.includes('Propuesta de Ecosistema Soberano');
    const hasProposalError = bodyText.includes('Propuesta no encontrada');
    const hasBlueprint = bodyText.includes('Blueprint Técnico');

    console.log('Final URL:', finalUrl);
    console.log('Router/auth:', hasLogin ? 'REDIRECT_LOGIN (sin sesión o auth loading)' : 'NO_LOGIN_REDIRECT');
    console.log('Render:', hasProposalTitle ? 'ClientProposal visible' : hasProposalError ? 'ERROR_STATE' : hasSpinner ? 'LOADING_SPINNER' : 'OTHER/BLANK');
    console.log('Has "Blueprint Técnico":', hasBlueprint);
    console.log('Body preview:', bodyText.replace(/\s+/g, ' ').slice(0, 220));

    if (pageErrors.length) console.log('PAGE ERRORS:', pageErrors);
    if (consoleErrors.length) console.log('CONSOLE ERRORS:', consoleErrors.slice(0, 5));
  } catch (err) {
    console.log('NAVIGATION FAIL:', err.message.split('\n')[0]);
  }

  await page.close();
}

// Logged-in client on active server
console.log('\n=== 5173 logged-in client (proxdeep_demo_role) ===');
{
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded', timeout: 8000 });
  await page.evaluate(() => localStorage.setItem('proxdeep_demo_role', 'loggedin'));
  await page.goto('http://localhost:5173/proposal/1', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const finalUrl = page.url();
  const bodyText = await page.locator('body').innerText();
  console.log('Final URL:', finalUrl);
  console.log('Visible title:', bodyText.includes('Propuesta de Ecosistema Soberano'));
  console.log('Pending badge:', bodyText.includes('Pendiente de Aprobación'));
  console.log('Accept button:', bodyText.includes('Aceptar y Activar Nodo'));
  console.log('Error card:', bodyText.includes('Propuesta no encontrada'));
  if (pageErrors.length) console.log('PAGE ERRORS:', pageErrors);
  console.log('Body preview:', bodyText.replace(/\s+/g, ' ').slice(0, 350));
  await page.close();
}

await browser.close();
