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
    name: 'sopas-letras',
    url: 'http://127.0.0.1:5173/dashboard/recursos/sopas-letras',
    key: 'recursos/sopas-letras',
    fileName: 'qa-05-sopas-letras-preview.png',
    darkFileName: 'qa-05-sopas-letras-dark.png',
    artifact: {
      document_title: 'Sopa de Letras: El Sistema Solar y los Planetas',
      executive_summary: 'Actividad de afianzamiento astronómico y vocabulario científico para 5° de Primaria.',
      sections: [
        {
          title: 'Instrucciones',
          narrative: 'Localiza los ocho planetas que orbitan alrededor del Sol en la cuadrícula de búsqueda.',
          key_points: [
            'Mercurio',
            'Venus',
            'Tierra',
            'Marte',
            'Júpiter',
            'Saturno',
            'Urano',
            'Neptuno',
          ],
        },
      ],
      teacher_recommendations: [
        'Presentar una infografía del orden de los planetas respecto al Sol.',
        'Monitorear la identificación de planetas rocosos versus gigantes gaseosos.',
        'Usar la tabla de ubicación para la verificación colectiva.',
      ],
      activity: {
        mode: 'sopa',
        title: 'Sopa de Letras: Planetas del Sistema Solar',
        instructions: 'Encuentra los ocho planetas en la cuadrícula y escribe una característica en las líneas de aplicación.',
        grid: [
          ['M', 'E', 'R', 'C', 'U', 'R', 'I', 'O', 'X', 'L', 'A', 'P'],
          ['Z', 'K', 'V', 'E', 'N', 'U', 'S', 'W', 'Q', 'E', 'D', 'T'],
          ['T', 'I', 'E', 'R', 'R', 'A', 'B', 'C', 'O', 'R', 'T', 'Y'],
          ['L', 'O', 'P', 'R', 'M', 'A', 'R', 'T', 'E', 'S', 'H', 'U'],
          ['B', 'J', 'U', 'P', 'I', 'T', 'E', 'R', 'K', 'L', 'M', 'N'],
          ['S', 'A', 'T', 'U', 'R', 'N', 'O', 'F', 'V', 'B', 'N', 'Q'],
          ['A', 'C', 'D', 'U', 'R', 'A', 'N', 'O', 'P', 'R', 'T', 'Z'],
          ['W', 'N', 'E', 'P', 'T', 'U', 'N', 'O', 'X', 'Y', 'Z', 'A'],
          ['S', 'O', 'L', 'A', 'R', 'B', 'I', 'T', 'A', 'S', 'D', 'F'],
          ['G', 'A', 'L', 'A', 'X', 'I', 'A', 'S', 'P', 'L', 'A', 'N'],
          ['C', 'O', 'M', 'E', 'T', 'A', 'S', 'T', 'R', 'O', 'E', 'S'],
          ['E', 'S', 'T', 'R', 'E', 'L', 'L', 'A', 'F', 'U', 'E', 'G'],
        ],
        word_bank: [
          'MERCURIO',
          'VENUS',
          'TIERRA',
          'MARTE',
          'JUPITER',
          'SATURNO',
          'URANO',
          'NEPTUNO',
        ],
        items: [
          { id: '1', prompt: 'Planeta más cercano al Sol y el más pequeño del sistema solar.', answer: 'MERCURIO', hint: 'Fila 1, Horizontal' },
          { id: '2', prompt: 'Planeta más caliente cubierto por densas nubes de ácido sulfúrico.', answer: 'VENUS', hint: 'Fila 2, Horizontal' },
          { id: '3', prompt: 'Nuestro planeta, el único conocido con agua líquida y vida.', answer: 'TIERRA', hint: 'Fila 3, Horizontal' },
          { id: '4', prompt: 'Planeta rojo debido al óxido de hierro en su suelo.', answer: 'MARTE', hint: 'Fila 4, Horizontal' },
          { id: '5', prompt: 'El planeta más grande del sistema solar, famoso por su Gran Mancha Roja.', answer: 'JUPITER', hint: 'Fila 5, Horizontal' },
          { id: '6', prompt: 'Famoso por su espectacular sistema de anillos brillantes de hielo y roca.', answer: 'SATURNO', hint: 'Fila 6, Horizontal' },
          { id: '7', prompt: 'Gigante helado que gira inclinado de lado.', answer: 'URANO', hint: 'Fila 7, Horizontal' },
          { id: '8', prompt: 'Planeta más alejado del Sol con vientos supersónicos.', answer: 'NEPTUNO', hint: 'Fila 8, Horizontal' },
        ],
      },
      model: 'gemini-3.6-flash',
    },
  };

  console.log(`Processing ${item.name}...`);
  await page.goto(item.url, { waitUntil: 'networkidle0' });

  // Inyectar estado en localStorage
  await page.evaluate((it) => {
    const user = JSON.parse(sessionStorage.getItem("avendia.user") || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const buttons = document.querySelectorAll('.workflow-stepper button');
    const lastIndex = Math.max(0, buttons.length - 1);

    const sampleValues = {
      dre: "DRE LIMA METROPOLITANA",
      ugel: "UGEL 03",
      institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
      level: "Primaria",
      grade: "5° de Primaria",
      section: "A",
      curricular_area: "Ciencia y Tecnología",
      teacher_name: "Prof. Elena Morales Farfán",
      director_name: "Lic. Rosa Valdivia Alarcón",
      school_year: "2026",
      topic: "El sistema solar y los planetas",
    };

    const storagePayload = {
      toolId: it.name,
      currentStep: lastIndex,
      values: sampleValues,
      artifact: it.artifact,
      version: 2,
      updatedAt: new Date().toISOString(),
    };

    const key = `avendia.draft.workflow.${it.key}.v2.${scope}`;
    const legacyKey = `avendia.workflow.${it.key}.${scope}`;

    localStorage.setItem(key, JSON.stringify(storagePayload));
    localStorage.setItem(legacyKey, JSON.stringify(storagePayload));
  }, item);

  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const isPaper = await page.evaluate(() => Boolean(document.querySelector('.word-document-paper')));
  console.log('isPaperVisible:', isPaper);

  const savePath = path.join(screenDir, item.fileName);
  await page.evaluate(() => {
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
  });
  const paper = await page.$('.word-document-paper');
  if (paper) {
    await paper.screenshot({ path: savePath });
    console.log('Saved paper screenshot to:', savePath);
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
  await new Promise(r => setTimeout(r, 800));
  const darkPath = path.join(screenDir, item.darkFileName);
  const paperDark = await page.$('.word-document-paper');
  if (paperDark) {
    await paperDark.screenshot({ path: darkPath });
    console.log('Saved dark paper screenshot to:', darkPath);
  }

  await browser.close();
  console.log('Capture 05 completed successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
