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
    name: 'normativa-educativa',
    url: 'http://127.0.0.1:5173/dashboard/recursos/normativa-educativa',
    fileName: 'qa-13-normativa-preview.png',
    darkFileName: 'qa-13-normativa-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 2,
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "1° a 5° de Secundaria",
        section: "Todas",
        curricularArea: "Gestión Pedagógica y Currículo",
        regulation_type: "Evaluación",
        application_scope: "Educación Básica Regular - Nivel Secundaria",
        topic: "Evaluación Formativa y Promoción Guiada (RVM N° 094-2020-MINEDU)",
        purpose: "Sustentar una decisión",
        question: "¿Cuáles son los criterios reglamentarios y la escala de calificación para elaborar conclusiones descriptivas en el informe de progreso del estudiante?",
      },
      artifact: {
        document_title: "Síntesis y Marco Normativo MINEDU: Evaluación Formativa y Promoción Guiada (RVM N° 094-2020-MINEDU)",
        executive_summary: "Guía de consulta y fundamentación técnica sobre la 'Norma que regula la Evaluación de las Competencias de los Estudiantes de la Educación Básica' (RVM N° 094-2020-MINEDU), orientada a brindar seguridad jurídica y consistencia pedagógica en la toma de decisiones docentes.",
        sections: [
          {
            title: "Marco Legal Vigente y Jerarquía Normativa",
            narrative: "Disposiciones legales vigentes que regulan los procesos evaluativos en las instituciones educativas de Educación Básica Regular:",
            key_points: [
              "Ley General de Educación N° 28044 (Art. 30): La evaluación como proceso formativo, continuo e integral.",
              "RVM N° 094-2020-MINEDU: Norma técnica matriz para la evaluación diagnóstica, formativa y sumativa.",
              "RVM N° 587-2023-MINEDU y R.M. N° 587-2024-MINEDU: Lineamientos para el desarrollo del año lectivo.",
              "Ley N° 29719: Ley que promueve la convivencia sin violencia en las instituciones educativas.",
            ],
          },
          {
            title: "Disposiciones Clave sobre Evaluación Formativa y Retroalimentación",
            narrative: "Obligaciones y criterios mandatorios para el docente de aula en relación con los estudiantes y sus familias:",
            key_points: [
              "Propósito evaluativo: Identificar el avance real, fortalezas y barreras de aprendizaje del estudiante respecto al estándar CNEB.",
              "Retroalimentación reflexiva: Priorizar la retroalimentación formativa oportuna por sobre la mera asignación de una calificación numérica o cualitativa.",
              "Criterios de evaluación: Deben ser explícitos, conocidos previamente por los alumnos y formulados a partir de los estándares y desempeños del ciclo.",
              "Escala de calificación cualitativa (AD, A, B, C): Ningún estudiante de EBR puede recibir un calificativo sin informe descriptivo sustentatorio.",
            ],
          },
          {
            title: "Protocolo de Aplicación en el Aula y Promoción Acompañada",
            narrative: "Procedimientos reglamentarios para el cierre de periodos lectivos y carpetas de recuperación pedagógica:",
            key_points: [
              "Conclusiones descriptivas: Obligatorias para todo estudiante que obtenga nivel de logro 'C' o 'B' en alguna competencia.",
              "Evaluación psicopedagógica y DUA: Adecuación de tiempos, formatos y apoyos razonables para estudiantes con NEE.",
              "Período de recuperación estival: Diseñar carpetas de recuperación contextualizadas con autoevaluación formativa.",
            ],
          },
        ],
        teacher_recommendations: [
          "Verificar periódicamente las resoluciones complementarias publicadas en el portal oficial del MINEDU / Gob.pe.",
          "Articular los criterios de las rúbricas de área con las definiciones precisas de la RVM N° 094-2020-MINEDU.",
          "Socializar con los padres de familia los criterios e instrumentos de evaluación al inicio de cada unidad o bimestre.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.recursos/normativa-educativa.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.recursos/normativa-educativa.v2.anonymous`, JSON.stringify(draft));
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
  const shell = await page.$('.word-paper-sheet') || await page.$('.workflow-shell') || await page.$('main');
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
  const shellDark = await page.$('.word-paper-sheet') || await page.$('.workflow-shell') || await page.$('main');
  if (shellDark) {
    await shellDark.screenshot({ path: darkPath });
    console.log('Saved Dark screenshot successfully to:', darkPath);
  }

  await browser.close();
  console.log('Capture 13 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
