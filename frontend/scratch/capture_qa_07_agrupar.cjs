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

  const item = {
    name: 'agrupar-palabras',
    url: 'http://127.0.0.1:5173/dashboard/recursos/agrupar-palabras',
    key: 'recursos/agrupar-palabras',
    fileName: 'qa-07-agrupar-palabras-preview.png',
    darkFileName: 'qa-07-agrupar-palabras-dark.png',
  };

  console.log(`Processing ${item.name}...`);
  await page.goto(item.url, { waitUntil: 'networkidle0' });

  // Inyectar estado específico de WordGroupingTool en localStorage
  await page.evaluate(() => {
    const user = JSON.parse(sessionStorage.getItem("avendia.user") || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 1,
      form: {
        teacherName: "Prof. Sonia Huamán Ríos",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Primaria",
        grade: "3° de Primaria",
        curricularArea: "Ciencia y Tecnología",
        topic: "Clasificación de los seres vivos según su alimentación",
        categoryCount: 3,
      },
      result: {
        activity_title: "Clasificación de los Animales según su Alimentación",
        instructions: "Observa el banco de términos y clasifica cada animal en la columna correspondiente.",
        categories: [
          { id: "cat-1", name: "Herbívoros", explanation: "Se alimentan exclusivamente de plantas, pastos y hierbas." },
          { id: "cat-2", name: "Carnívoros", explanation: "Se alimentan primordialmente de carne de otros animales." },
          { id: "cat-3", name: "Omnívoros", explanation: "Se alimentan tanto de materia vegetal como de animales." },
        ],
        words: [
          { id: "w1", word: "Vaca", correct_category_id: "cat-1" },
          { id: "w2", word: "Conejo", correct_category_id: "cat-1" },
          { id: "w3", word: "Oveja", correct_category_id: "cat-1" },
          { id: "w4", word: "Caballo", correct_category_id: "cat-1" },
          { id: "w5", word: "León", correct_category_id: "cat-2" },
          { id: "w6", word: "Tigre", correct_category_id: "cat-2" },
          { id: "w7", word: "Águila", correct_category_id: "cat-2" },
          { id: "w8", word: "Tiburón", correct_category_id: "cat-2" },
          { id: "w9", word: "Cerdo", correct_category_id: "cat-3" },
          { id: "w10", word: "Oso", correct_category_id: "cat-3" },
          { id: "w11", word: "Chimpancé", correct_category_id: "cat-3" },
          { id: "w12", word: "Gallina", correct_category_id: "cat-3" },
        ],
        model: "gemini-3.6-flash",
      },
    };

    localStorage.setItem(`avendia.draft.agrupar-palabras.v1.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.agrupar-palabras.v1.anonymous`, JSON.stringify(draft));
  });

  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));

  // Navegar al paso 3 (Practicar / Tablero interactivo)
  const buttons = await page.$$('.tool-stepper button');
  if (buttons.length >= 3) {
    await buttons[2].click();
    await new Promise((r) => setTimeout(r, 1000));
  }

  const savePath = path.join(screenDir, item.fileName);
  await page.evaluate(() => {
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
  });

  // Tomar captura del panel
  const panel = await page.$('.word-grouping-shell');
  if (panel) {
    await panel.screenshot({ path: savePath });
    console.log('Saved shell screenshot to:', savePath);
  } else {
    await page.screenshot({ path: savePath, fullPage: false });
    console.log('Saved page screenshot to:', savePath);
  }

  // Captura en Modo Oscuro
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
    localStorage.setItem('avendia.theme', 'dark');
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
  });
  await new Promise((r) => setTimeout(r, 800));
  const darkPath = path.join(screenDir, item.darkFileName);
  const panelDark = await page.$('.word-grouping-shell');
  if (panelDark) {
    await panelDark.screenshot({ path: darkPath });
    console.log('Saved dark shell screenshot to:', darkPath);
  }

  await browser.close();
  console.log('Capture 07 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
