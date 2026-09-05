const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[name="email"]', 'admin@avendia.edu.pe');
  await page.type('input[name="password"]', 'Admin123456!');
  await page.click('button.login-submit');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

  await page.goto('http://localhost:5173/dashboard/planificamos/plan-curricular-anual', { waitUntil: 'networkidle0' });
  console.log('URL:', page.url());
  const title = await page.evaluate(() => document.querySelector('h1')?.innerText || document.title);
  console.log('Title/H1:', title);
  await browser.close();
})();
