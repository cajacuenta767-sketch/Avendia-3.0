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
    name: 'calificador-rubrica',
    url: 'http://127.0.0.1:5173/dashboard/evaluamos/calificador-rubrica',
    fileName: 'qa-31-calificador-preview.png',
    darkFileName: 'qa-31-calificador-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 1,
      rubricType: "analytic",
      weighted: false,
      currentStep: 3, // Step 4 of 4: Vista previa y descarga
      general: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "4° de Secundaria",
        area: "Ciencias Sociales",
        competence: "Construye interpretaciones históricas",
        performance: "Contrasta fuentes históricas y explica causas múltiples de la crisis virreinal del siglo XVIII.",
        context: "Evaluación formativa de ensayos argumentativos sobre las Reformas Borbónicas y la rebelión de Túpac Amaru II.",
        evidenceTitle: "Ensayo Histórico Crítico: Las Reformas Borbónicas y Túpac Amaru II",
        date: "2026-03-24",
      },
      criteria: [
        {
          id: "crit-1",
          code: "C1",
          title: "Contraste de fuentes primarias y secundarias",
          description: "Distingue testimonios virreinales de interpretaciones historiográficas modernas.",
          weight: 35,
          descriptors: {
            "level-c": "Cita fuentes sin contrastarlas ni contextualizar la autoría colonial.",
            "level-b": "Identifica dos fuentes de autores distintos pero no confronta sus contradicciones.",
            "level-a": "Contrasta edictos virreinales con cartas insurgentes distinguiendo hechos de juicios.",
            "level-ad": "Evalúa críticamente la fiabilidad, sesgos y silencios de los archivos virreinales.",
          },
        },
        {
          id: "crit-2",
          code: "C2",
          title: "Explicación de causalidad histórica múltiple",
          description: "Articula factores económicos, sociales y políticos en la crisis colonial.",
          weight: 35,
          descriptors: {
            "level-c": "Señala causas aisladas o anecdóticas sin conectarlas con el contexto general.",
            "level-b": "Describe causas económicas pero no las articula con las demandas políticas.",
            "level-a": "Articula con claridad el incremento tributario con la ruptura del pacto colonial.",
            "level-ad": "Distingue magistralmente causas estructurales de coyunturales con visión sistémica.",
          },
        },
        {
          id: "crit-3",
          code: "C3",
          title: "Perspectiva histórica y empatía sin anacronismos",
          description: "Juzga las decisiones de los actores históricos desde la mentalidad de su tiempo.",
          weight: 30,
          descriptors: {
            "level-c": "Juzga las acciones del siglo XVIII con valores morales del siglo XXI.",
            "level-b": "Reconoce la complejidad temporal pero reitera estereotipos virreinales.",
            "level-a": "Comprende las motivaciones de caciques fidelistas y criollos cusqueños.",
            "level-ad": "Reconstruye las tensiones ideológicas y cosmovisiones en pugna con empatía histórica.",
          },
        },
      ],
      levels: [
        { id: "level-c", code: "C", label: "Inicio", score: 1 },
        { id: "level-b", code: "B", label: "En proceso", score: 2 },
        { id: "level-a", code: "A", label: "Logro esperado", score: 3 },
        { id: "level-ad", code: "AD", label: "Logro destacado", score: 4 },
      ],
      selection: null,
      assessments: [],
      activeStudentId: "",
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.evaluations.rubric.v1.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.evaluations.rubric.v1.anonymous`, JSON.stringify(draft));
  });

  await page.goto(item.url, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1200));

  // Ocultar topbar y sidebar para captura limpia
  await page.evaluate(() => {
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
    const sb = document.querySelector('.sidebar');
    if (sb) sb.style.display = 'none';
  });

  const savePath = path.join(screenDir, item.fileName);
  const shell = await page.$('.evaluation-shell') || await page.$('main');
  if (shell) {
    await shell.screenshot({ path: savePath });
    console.log('Saved Light screenshot successfully to:', savePath);
  }

  // Dark mode
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
    localStorage.setItem('avendia.theme', 'dark');
  });
  await new Promise((r) => setTimeout(r, 800));

  const darkPath = path.join(screenDir, item.darkFileName);
  const shellDark = await page.$('.evaluation-shell') || await page.$('main');
  if (shellDark) {
    await shellDark.screenshot({ path: darkPath });
    console.log('Saved Dark screenshot successfully to:', darkPath);
  }

  await browser.close();
  console.log('Capture 31 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
