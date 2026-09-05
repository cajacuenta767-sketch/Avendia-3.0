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
    name: 'ahorcado',
    url: 'http://127.0.0.1:5173/dashboard/recursos/ahorcado',
    key: 'recursos/ahorcado',
    fileName: 'qa-01-ahorcado-preview.png',
    artifact: {
      document_title: 'Juego del Ahorcado: Emociones Básicas y Convivencia',
      executive_summary: 'Ficha de adivinanzas y retos léxicos para identificar emociones básicas y promover el buen trato en el aula de 1° de Primaria.',
      sections: [
        {
          title: 'Instrucciones',
          narrative: 'Descubre las palabras secretas leyendo cada pista. Completa las casillas cuadradas y cuida tus 4 vidas.',
          key_points: ['Alegría', 'Calma', 'Tristeza', 'Miedo', 'Enojo', 'Empatía', 'Respeto', 'Abrazo', 'Amistad', 'Gratitud'],
        },
      ],
      teacher_recommendations: [
        'Presentar las emociones con títeres o láminas visuales antes de la actividad.',
        'Acompañar a los estudiantes en el reconocimiento de las letras del abecedario.',
        'Brindar retroalimentación inmediata utilizando el solucionario desglosable.',
      ],
      activity: {
        mode: 'ahorcado',
        title: 'Adivina la Emoción Secreta',
        instructions: 'Lee la pista, completa las casillas con letras y tacha en el abecedario. ¡Tienes 4 vidas por reto!',
        items: [
          {
            id: '1',
            prompt: 'Emoción bonita que sentimos cuando jugamos o nos dan una linda noticia',
            answer: 'ALEGRIA',
            hint: 'Nos hace sonreír y compartir con los demás.',
            options: [],
          },
          {
            id: '2',
            prompt: 'Sensación de paz y tranquilidad cuando respiramos hondo',
            answer: 'CALMA',
            hint: 'Nos ayuda a pensar antes de actuar.',
            options: [],
          },
          {
            id: '3',
            prompt: 'Sentimiento cuando algo nos duele o extrañamos a alguien',
            answer: 'TRISTEZA',
            hint: 'Llorar y hablar con mamá o la maestra nos alivia.',
            options: [],
          },
          {
            id: '4',
            prompt: 'Emoción que nos avisa de un peligro para protegernos',
            answer: 'MIEDO',
            hint: 'Pedir un abrazo a un adulto de confianza nos da seguridad.',
            options: [],
          },
          {
            id: '5',
            prompt: 'Sentimiento cuando algo nos parece injusto o nos molesta',
            answer: 'ENOJO',
            hint: 'Contar hasta diez nos ayuda a no lastimar a nadie.',
            options: [],
          },
          {
            id: '6',
            prompt: 'Ponerse en el lugar del amigo y comprender cómo se siente',
            answer: 'EMPATIA',
            hint: 'Escuchar con cariño a los compañeros del salón.',
            options: [],
          },
          {
            id: '7',
            prompt: 'Tratar con cuidado, educación y cariño a todas las personas',
            answer: 'RESPETO',
            hint: 'Saludar, pedir por favor y dar las gracias siempre.',
            options: [],
          },
          {
            id: '8',
            prompt: 'Gesto cariñoso con los brazos que nos hace sentir acompañados',
            answer: 'ABRAZO',
            hint: 'Demuestra afecto y consuelo en el momento oportuno.',
            options: [],
          },
          {
            id: '9',
            prompt: 'Vínculo bonito entre compañeros que juegan y se ayudan',
            answer: 'AMISTAD',
            hint: 'Compartir los materiales y aprender juntos.',
            options: [],
          },
          {
            id: '10',
            prompt: 'Dar las gracias de corazón por el cariño o la ayuda recibida',
            answer: 'GRATITUD',
            hint: 'Agradecer a nuestros profesores y a nuestra familia.',
            options: [],
          },
        ],
        word_bank: ['ALEGRIA', 'CALMA', 'TRISTEZA', 'MIEDO', 'ENOJO', 'EMPATIA', 'RESPETO', 'ABRAZO', 'AMISTAD', 'GRATITUD'],
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
      grade: "1° de Primaria",
      section: "A",
      curricular_area: "Personal Social",
      teacher_name: "Prof. María Mendoza Quispe",
      director_name: "Lic. Rosa Valdivia Alarcón",
      school_year: "2026",
      topic: "Emociones básicas y convivencia armónica",
      word_count: 10,
      lives: 4,
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
  });
  await new Promise(r => setTimeout(r, 800));
  const darkPath = path.join(screenDir, 'qa-01-ahorcado-dark.png');
  const paperDark = await page.$('.word-document-paper');
  if (paperDark) {
    await paperDark.screenshot({ path: darkPath });
    console.log('Saved dark paper screenshot to:', darkPath);
  }

  await browser.close();
  console.log('Capture 01 completed successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
