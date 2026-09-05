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
    name: 'tarjetas-estudio',
    url: 'http://127.0.0.1:5173/dashboard/recursos/tarjetas-estudio',
    key: 'recursos/tarjetas-estudio',
    fileName: 'qa-06-tarjetas-estudio-preview.png',
    darkFileName: 'qa-06-tarjetas-estudio-dark.png',
    artifact: {
      document_title: 'Tarjetas de Estudio: Figuras Literarias en la Poesía',
      executive_summary: 'Material didáctico manipulable y recortable de afianzamiento poético para 1° de Secundaria.',
      sections: [
        {
          title: 'Instrucciones',
          narrative: 'Recorta las tarjetas por la línea discontinua y utilízalas para estudiar conceptos y ejemplos de figuras retóricas.',
          key_points: [
            'Metáfora',
            'Símil',
            'Hipérbole',
            'Personificación',
            'Anáfora',
            'Epíteto',
          ],
        },
      ],
      teacher_recommendations: [
        'Sugerir pegar las tarjetas sobre cartulina para mayor durabilidad en el rincón de lectura.',
        'Organizar rondas de adivinanzas poéticas en equipos de cuatro estudiantes.',
        'Verificar la correcta identificación de figuras mediante la tabla solucionario.',
      ],
      activity: {
        mode: 'tarjetas',
        title: 'Tarjetas de Estudio: Figuras Retóricas',
        instructions: 'Recorta cada tarjeta por la línea punteada (✂). Lee el concepto al frente y comprueba con el reverso.',
        items: [
          {
            id: '1',
            prompt: 'METÁFORA',
            answer: 'Identificación de un término real con uno imaginario por relación de semejanza.',
            hint: "Ejemplo clásico: 'Las perlas de tu boca' (refiriéndose a los dientes blancos).",
            options: [],
          },
          {
            id: '2',
            prompt: 'SÍMIL O COMPARACIÓN',
            answer: "Comparación explícita entre dos términos empleando nexos como 'como', 'cual' o 'parece'.",
            hint: "Ejemplo: 'Tus ojos brillan como dos luceros en la noche oscura'.",
            options: [],
          },
          {
            id: '3',
            prompt: 'HIPÉRBOLE',
            answer: 'Exageración intencionada de la realidad para aumentar la expresividad emotiva.',
            hint: "Ejemplo poético: 'Lloró ríos de lágrimas al despedirse de su patria'.",
            options: [],
          },
          {
            id: '4',
            prompt: 'PERSONIFICACIÓN',
            answer: 'Atribución de características y emociones humanas a seres inanimados o animales.',
            hint: "Ejemplo: 'El viejo sauce lloraba en silencio junto a la ribera del río'.",
            options: [],
          },
          {
            id: '5',
            prompt: 'ANÁFORA',
            answer: 'Repetición voluntaria de una palabra al comienzo de versos u oraciones sucesivas.',
            hint: "Ejemplo: 'Por ti la luna llena, por ti el cielo estrellado, por ti mi canto...'.",
            options: [],
          },
          {
            id: '6',
            prompt: 'EPÍTETO',
            answer: 'Adjetivo explicativo que destaca una cualidad intrínseca y propia del sustantivo.',
            hint: "Ejemplo: 'La blanca nieve cubría los silenciosos campos en invierno'.",
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
      level: "Secundaria",
      grade: "1° de Secundaria",
      section: "B",
      curricular_area: "Comunicación",
      teacher_name: "Prof. Lucía Carranza Poma",
      director_name: "Lic. Rosa Valdivia Alarcón",
      school_year: "2026",
      topic: "Figuras literarias principales",
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
  console.log('Capture 06 completed successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
