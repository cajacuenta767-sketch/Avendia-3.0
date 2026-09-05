const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1400, height: 1100 },
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
    name: 'completa-frase',
    url: 'http://127.0.0.1:5173/dashboard/recursos/completa-frase',
    key: 'recursos/completa-frase',
    fileName: 'qa-02-completa-frase-preview.png',
    darkFileName: 'qa-02-completa-frase-dark.png',
    artifact: {
      document_title: 'Ficha de Aplicación: Completa la Frase sobre las Plantas',
      executive_summary: 'Actividad formativa para identificar las partes de la planta y sus funciones vitales en 2° de Primaria.',
      sections: [
        {
          title: 'Instrucciones',
          narrative: 'Lee con atención y completa los enunciados utilizando las palabras clave del banco.',
          key_points: ['Raíz', 'Tallo', 'Hojas', 'Flor', 'Fruto', 'Semillas', 'Clorofila', 'Fotosíntesis'],
        },
      ],
      teacher_recommendations: [
        'Llevar una planta pequeña al aula para que los estudiantes observen sus partes reales.',
        'Reforzar el vocabulario científico con apoyo de láminas ilustradas.',
        'Revisar el solucionario desglosable en plenaria para consolidar los aprendizajes.',
      ],
      activity: {
        mode: 'completa',
        title: 'Completa la Frase: Las Partes de la Planta',
        instructions: 'Lee con atención cada enunciado. Elige la palabra correcta del Banco de Palabras y escríbela sobre la línea punteada.',
        items: [
          {
            id: '1',
            prompt: 'La raíz absorbe el agua y las sales minerales del suelo para nutrir a la planta.',
            answer: 'RAÍZ',
            hint: 'Fija la planta a la tierra y absorbe los nutrientes vitales.',
            options: [],
          },
          {
            id: '2',
            prompt: 'El tallo sostiene las hojas, flores y frutos, y transporta la savia por toda la planta.',
            answer: 'TALLO',
            hint: 'Es el eje principal de soporte que crece hacia la luz del sol.',
            options: [],
          },
          {
            id: '3',
            prompt: 'En las hojas se realiza la respiración y la fotosíntesis gracias a la luz solar.',
            answer: 'HOJAS',
            hint: 'Son las estructuras verdes donde la planta fabrica su propio alimento.',
            options: [],
          },
          {
            id: '4',
            prompt: 'La flor es el órgano reproductor de la planta que luego se transformará en fruto.',
            answer: 'FLOR',
            hint: 'Posee pétalos de vivos colores y produce el polen necesario.',
            options: [],
          },
          {
            id: '5',
            prompt: 'El fruto contiene y protege a las semillas hasta que alcanzan su madurez.',
            answer: 'FRUTO',
            hint: 'Se origina a partir de la flor fecundada y sirve de alimento.',
            options: [],
          },
          {
            id: '6',
            prompt: 'Las semillas dan origen a una nueva plantita cuando caen en tierra fértil y húmeda.',
            answer: 'SEMILLAS',
            hint: 'Contienen el embrión vegetal que germina bajo condiciones adecuadas.',
            options: [],
          },
          {
            id: '7',
            prompt: 'El pigmento verde que atrapa la energía de la luz solar se denomina clorofila.',
            answer: 'CLOROFILA',
            hint: 'Es la sustancia responsable del color verde característico de los vegetales.',
            options: [],
          },
          {
            id: '8',
            prompt: 'El proceso biológico mediante el cual la planta elabora su propio alimento es la fotosíntesis.',
            answer: 'FOTOSÍNTESIS',
            hint: 'Requiere agua, dióxido de carbono, clorofila y radiación solar.',
            options: [],
          },
        ],
        word_bank: ['RAÍZ', 'TALLO', 'HOJAS', 'FLOR', 'FRUTO', 'SEMILLAS', 'CLOROFILA', 'FOTOSÍNTESIS'],
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
      grade: "2° de Primaria",
      section: "B",
      curricular_area: "Ciencia y Tecnología",
      teacher_name: "Prof. Carlos Sánchez Vega",
      director_name: "Lic. Rosa Valdivia Alarcón",
      school_year: "2026",
      topic: "Las plantas y sus partes",
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
  console.log('Capture 02 completed successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
