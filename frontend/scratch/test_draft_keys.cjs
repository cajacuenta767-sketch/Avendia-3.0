const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[name="email"]', 'admin@avendia.edu.pe');
  await page.type('input[name="password"]', 'Admin123456!');
  await page.click('button.login-submit');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

  await page.goto('http://127.0.0.1:5173/dashboard/sesiones', { waitUntil: 'networkidle0' });
  const info = await page.evaluate(() => {
    return {
      sessionUser: sessionStorage.getItem("avendia.user"),
      localKeys: Object.keys(localStorage),
    };
  });
  console.log("INFO:", JSON.stringify(info, null, 2));
  await browser.close();
}

run();
