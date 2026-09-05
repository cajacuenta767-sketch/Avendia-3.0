const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1400, height: 1300 },
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
    name: 'lista-cotejo',
    url: 'http://127.0.0.1:5173/dashboard/evaluamos/lista-cotejo',
    fileName: 'qa-25-lista-cotejo-preview.png',
    darkFileName: 'qa-25-lista-cotejo-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const criteria = [
      { id: "crit-1", code: "C1", description: "Presenta una postura clara y delimitada sobre la gestión hídrica en su localidad." },
      { id: "crit-2", code: "C2", description: "Sustenta sus argumentos con al menos dos fuentes técnicas o normativas verificables (ANA, MINAM)." },
      { id: "crit-3", code: "C3", description: "Utiliza recursos no verbales (contacto visual, postura) y paraverbales (entonación, volumen apropiado)." },
      { id: "crit-4", code: "C4", description: "Responde con asertividad y respeto a las repreguntas formuladas por sus pares o el jurado escolar." },
      { id: "crit-5", code: "C5", description: "Emplea un registro lingüístico formal adecuado a la situación comunicativa académica." },
    ];

    const draft = {
      version: 1,
      currentStep: 3, // Step 3 (0-indexed) = Vista previa y descarga
      general: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "A",
        area: "Comunicación",
        activity: "Exposición Oral y Debate sobre Conservación de Cuencas Hidrográficas",
        date: "2026-03-25",
        period: "I bimestre",
      },
      responseScale: "yes_no",
      selection: {
        rosterId: "roster-3a",
        studentIds: ["std-1", "std-2", "std-3"],
      },
      criteria,
      records: [
        { studentId: "std-1", criterionId: "crit-1", value: "yes", observation: "Postura muy sólida y bien contextualizada." },
        { studentId: "std-1", criterionId: "crit-2", value: "yes", observation: "Citó Ley 29338 y reporte ANA." },
        { studentId: "std-1", criterionId: "crit-3", value: "yes", observation: "Excelente modulación y dominio escénico." },
        { studentId: "std-1", criterionId: "crit-4", value: "yes", observation: "Respuestas claras a preguntas del aula." },
        { studentId: "std-1", criterionId: "crit-5", value: "yes", observation: "Registro formal impecable." },
        { studentId: "std-2", criterionId: "crit-1", value: "yes", observation: "Planteamiento claro." },
        { studentId: "std-2", criterionId: "crit-2", value: "no", observation: "Le faltó citar fuentes técnicas formales." },
        { studentId: "std-2", criterionId: "crit-3", value: "yes", observation: "Buen volumen de voz." },
        { studentId: "std-2", criterionId: "crit-4", value: "yes", observation: "Aceptó críticas con respeto." },
        { studentId: "std-2", criterionId: "crit-5", value: "yes", observation: "Vocabulario adecuado." },
      ],
      generalObservation: "El grupo evidencia alta preparación y compromiso ciudadano; reforzar el contraste de cifras estadísticas en próximas exposiciones.",
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.evaluations.checklist.v1.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.evaluations.checklist.v1.anonymous`, JSON.stringify(draft));
  });

  await page.goto(item.url, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));

  // Ocultar topbar y sidebar para captura limpia
  await page.evaluate(() => {
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
    const sb = document.querySelector('.sidebar');
    if (sb) sb.style.display = 'none';
  });

  const savePath = path.join(screenDir, item.fileName);
  const shell = await page.$('.evaluation-card') || await page.$('.checklist-tool') || await page.$('main');
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
  const shellDark = await page.$('.evaluation-card') || await page.$('.checklist-tool') || await page.$('main');
  if (shellDark) {
    await shellDark.screenshot({ path: darkPath });
    console.log('Saved Dark screenshot successfully to:', darkPath);
  }

  await browser.close();
  console.log('Capture 25 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
