const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1400, height: 1200 },
  });

  const page = await browser.newPage();
  const screenDir = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\a9be914d-ead5-4d1e-bf50-3ed5e5b0ccd8\\audit-screens';

  console.log('Navigating to login...');
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' });

  // Login
  await page.type('input[name="email"]', 'admin@avendia.edu.pe');
  await page.type('input[name="password"]', 'Admin123456!');
  await page.click('button.login-submit');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  console.log('Logged in.');

  const instrumentId = '29221e24-64d3-4bb5-88f0-cff7077796fd';
  const url = `http://127.0.0.1:5173/dashboard/evaluamos/registros-auxiliares?document=${instrumentId}`;
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));

  // Ir al paso 5 (Vista e historial - índice 4)
  await page.evaluate(() => {
    const stepBtns = document.querySelectorAll('.evaluation-wizard__stepper button');
    if (stepBtns && stepBtns.length >= 5) {
      stepBtns[4].click();
    }
  });
  await new Promise((r) => setTimeout(r, 1200));

  // Ocultar topbar y sidebar para captura limpia
  await page.evaluate(() => {
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
    const sb = document.querySelector('.sidebar');
    if (sb) sb.style.display = 'none';
  });

  const savePath = path.join(screenDir, 'qa-32-registros-auxiliares-preview.png');
  const wizard = await page.$('.evaluation-wizard') || await page.$('main');
  if (wizard) {
    await wizard.screenshot({ path: savePath });
    console.log('Saved Light screenshot successfully to:', savePath);
  } else {
    console.error('Could not find .evaluation-wizard or main element');
  }

  // Dark mode
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
    localStorage.setItem('avendia.theme', 'dark');
  });
  await new Promise((r) => setTimeout(r, 800));

  const darkPath = path.join(screenDir, 'qa-32-registros-auxiliares-dark.png');
  const wizardDark = await page.$('.evaluation-wizard') || await page.$('main');
  if (wizardDark) {
    await wizardDark.screenshot({ path: darkPath });
    console.log('Saved Dark screenshot successfully to:', darkPath);
  }

  await browser.close();
  console.log('Capture 32 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
