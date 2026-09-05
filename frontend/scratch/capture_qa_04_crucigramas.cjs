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
    name: 'crucigramas',
    url: 'http://127.0.0.1:5173/dashboard/recursos/crucigramas',
    key: 'recursos/crucigramas',
    fileName: 'qa-04-crucigramas-preview.png',
    darkFileName: 'qa-04-crucigramas-dark.png',
    artifact: {
      document_title: 'Crucigrama Educativo: Las Regiones Naturales del Perú',
      executive_summary: 'Actividad lúdico-pedagógica de afianzamiento geográfico para 4° de Primaria.',
      sections: [
        {
          title: 'Instrucciones',
          narrative: 'Completa el crucigrama identificando las características geográficas y culturales del Perú.',
          key_points: [
            'Costa o Chala',
            'Mar de Grau',
            'Cordillera de los Andes',
            'Cusco Histórico',
            'Selva Amazónica',
            'Río Amazonas',
            'Lago Titicaca',
            'Cañón del Colca',
          ],
        },
      ],
      teacher_recommendations: [
        'Proyectar un mapa físico del Perú para orientar a los estudiantes.',
        'Monitorear la resolución de pistas verticales antes de las horizontales.',
        'Utilizar el solucionario final para la coevaluación en parejas.',
      ],
      activity: {
        mode: 'crucigrama',
        title: 'Crucigrama Geográfico del Perú',
        instructions: 'Lee atentamente cada pista horizontal y vertical. Escribe las letras correspondientes en la cuadrícula.',
        items: [
          {
            id: '1',
            prompt: 'Región costeña cálida y árida junto al océano Pacífico.',
            answer: 'COSTA',
            hint: 'Comprende valles fértiles y extensos desiertos.',
            options: [],
          },
          {
            id: '2',
            prompt: 'Mar territorial peruano muy rico en biomasa y recursos ictiológicos.',
            answer: 'GRAU',
            hint: 'Lleva el nombre del Gran Almirante Miguel Grau.',
            options: [],
          },
          {
            id: '3',
            prompt: 'Gran cordillera montañosa de altitud que divide el territorio peruano.',
            answer: 'ANDES',
            hint: 'Presenta picos nevados, volcanes y altiplanos.',
            options: [],
          },
          {
            id: '4',
            prompt: 'Ciudad imperial histórica y capital del Tahuantinsuyo en la sierra sur.',
            answer: 'CUSCO',
            hint: 'Famosa por Sacsayhuamán y su arquitectura inca.',
            options: [],
          },
          {
            id: '5',
            prompt: 'Región de bosque tropical denso con la mayor biodiversidad del país.',
            answer: 'SELVA',
            hint: 'Abarca la selva alta o rupa rupa y la selva baja u omagua.',
            options: [],
          },
          {
            id: '6',
            prompt: 'El río más largo y caudaloso del mundo que nace en las cumbres del Perú.',
            answer: 'AMAZONAS',
            hint: 'Se forma de la confluencia del Marañón y Ucayali.',
            options: [],
          },
          {
            id: '7',
            prompt: 'El lago navegable más alto del mundo compartido con Bolivia.',
            answer: 'TITICACA',
            hint: 'Ubicado a más de 3800 m s. n. m. en Puno.',
            options: [],
          },
          {
            id: '8',
            prompt: 'Impresionante cañón profundo y hábitat del majestuoso cóndor en Arequipa.',
            answer: 'COLCA',
            hint: 'Destino turístico emblemático del sur andino.',
            options: [],
          },
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
      grade: "4° de Primaria",
      section: "A",
      curricular_area: "Personal Social",
      teacher_name: "Prof. Alberto Mendoza Rojas",
      director_name: "Lic. Rosa Valdivia Alarcón",
      school_year: "2026",
      topic: "Las regiones naturales del Perú",
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
  console.log('Capture 04 completed successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
