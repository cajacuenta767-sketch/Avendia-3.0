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
    name: 'debate-aula',
    url: 'http://127.0.0.1:5173/dashboard/recursos/debate-aula',
    key: 'recursos/debate-aula',
    fileName: 'qa-09-debate-aula-preview.png',
    darkFileName: 'qa-09-debate-aula-dark.png',
  };

  console.log(`Processing ${item.name}...`);
  await page.goto(item.url, { waitUntil: 'networkidle0' });

  // Inyectar estado en localStorage con claves exactas de WorkflowTool
  await page.evaluate((k) => {
    const user = JSON.parse(sessionStorage.getItem("avendia.user") || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 3,
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "A",
        curricularArea: "Desarrollo Personal, Ciudadanía y Cívica",
        topic: "¿Se debe regular el uso de teléfonos celulares en las aulas de secundaria?",
        debate_mode: "Debate por equipos con roles",
        duration_minutes: 45,
        context: "En la I.E. 0001 República del Perú, la comunidad debate si restringir o integrar pedagógicamente los dispositivos móviles.",
        required_perspectives: "Enfoque de derechos digitales, concentración académica y salud mental adolescente.",
        safeguards: "Respeto irrestricto al turno de palabra, sustento con evidencias y no agresiones verbales.",
      },
      artifact: {
        document_title: "¿Se debe regular el uso de teléfonos celulares en las aulas de secundaria?",
        executive_summary: "Guía estructurada de debate escolar para 3° de Secundaria en DPCC.",
        sections: [
          {
            title: "Moción y Marco de Convivencia",
            narrative: "Dinámica formativa orientada al desarrollo de competencias ciudadanas y pensamiento crítico.",
            key_points: [
              "Moción: El uso de dispositivos móviles debe estar estrictamente regulado a actividades pedagógicas planificadas.",
              "Formato: Debate por equipos con portavoces, preguntas cruzadas y jurado escolar.",
              "Acuerdos: Respeto mutuo, sustento con evidencias y escucha empática.",
            ],
          },
        ],
        teacher_recommendations: [
          "Establecer con claridad las reglas del cronómetro antes de iniciar la primera ronda.",
          "Monitorear que las preguntas cruzadas se dirijan a los argumentos y nunca a las personas.",
          "Aplicar la rúbrica formativa al cierre para brindar retroalimentación colectiva.",
        ],
        activity: {
          mode: "debate",
          title: "Debate Escolar: Teléfonos Celulares y Convivencia en el Aula",
          instructions: "Sigue las 4 fases de debate, consulta la matriz de posturas y completa la ficha de evaluación.",
          items: [],
        },
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.${k}.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.${k}.v2.anonymous`, JSON.stringify(draft));
    localStorage.setItem(`avendia.workflow.${k}.${scope}`, JSON.stringify(draft));
  }, item.key);

  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));

  // Ocultar topbar
  await page.evaluate(() => {
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
  });

  const savePath = path.join(screenDir, item.fileName);
  const docPaper = await page.$('.word-paper');
  if (docPaper) {
    await docPaper.screenshot({ path: savePath });
    console.log('Saved word-paper screenshot to:', savePath);
  } else {
    await page.screenshot({ path: savePath, fullPage: false });
    console.log('Saved page screenshot to:', savePath);
  }

  // Dark mode
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
    localStorage.setItem('avendia.theme', 'dark');
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
  });
  await new Promise((r) => setTimeout(r, 800));

  const darkPath = path.join(screenDir, item.darkFileName);
  const docPaperDark = await page.$('.word-paper');
  if (docPaperDark) {
    await docPaperDark.screenshot({ path: darkPath });
    console.log('Saved dark screenshot to:', darkPath);
  }

  await browser.close();
  console.log('Capture 09 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
