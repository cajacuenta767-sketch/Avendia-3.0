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
    name: 'casos-estudio',
    url: 'http://127.0.0.1:5173/dashboard/recursos/casos-estudio',
    fileName: 'qa-11-casos-estudio-preview.png',
    darkFileName: 'qa-11-casos-estudio-dark.png',
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
        grade: "4° de Secundaria",
        section: "A",
        curricularArea: "Ciencias Sociales",
        topic: "Dilema de la Gestión del Agua y Desarrollo Sostenible en el Valle de San Lorenzo",
        case_type: "Conflicto socioambiental y económico",
        complexity: "Intermedio - Superior",
      },
      artifact: {
        document_title: "Dilema de la Gestión del Agua y Desarrollo Sostenible en el Valle de San Lorenzo",
        executive_summary: "En una cuenca agrícola costera del norte peruano, la escasez hídrica estacional genera tensiones entre la pequeña agricultura comunal de panllevar, las empresas agroexportadoras de riego presurizado y la demanda de agua potable de los centros urbanos en crecimiento.",
        sections: [
          {
            title: "Presentación del Caso y Narrativa Real",
            narrative: "El Valle de San Lorenzo enfrenta uno de los periodos de estiaje más severos de la última década. La represa principal opera al 28% de su capacidad. Los pequeños agricultores denuncian que las grandes empresas agroexportadoras continúan extrayendo agua del subsuelo mediante pozos profundos no autorizados, mientras que la población urbana de Tambogrande sufre racionamiento severo recibiendo agua potable solo 2 horas cada tres días.",
            key_points: [
              "Capacidad actual de la represa: 28% (situación de emergencia hídrica declarada).",
              "Población afectada sin agua continua: 45,000 habitantes urbanos y rurales.",
              "Conflicto de prioridades entre derecho humano al agua y contratos comerciales agroexportadores.",
            ],
          },
        ],
        teacher_recommendations: [
          "Fomentar que los estudiantes analicen el caso desde la perspectiva de todos los actores antes de asumir una postura.",
          "Articular con la competencia CNEB: Gestiona responsablemente los recursos económicos y el ambiente.",
          "Evaluar la viabilidad técnica y el sustento constitucional en la propuesta de solución de cada equipo.",
        ],
        activity: {
          mode: "case_study",
          title: "Estudio de Caso ABP: Gestión Integral de Cuencas Hídricas",
          instructions: "Lee atentamente la situación problemática, examina la matriz de actores y responde las 4 preguntas guía de investigación crítica.",
          items: [],
        },
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.recursos/casos-estudio.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.recursos/casos-estudio.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 11 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
