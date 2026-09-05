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
    name: 'libros-guia-minedu',
    url: 'http://127.0.0.1:5173/dashboard/recursos/libros-guia-minedu',
    fileName: 'qa-14-libros-minedu-preview.png',
    darkFileName: 'qa-14-libros-minedu-dark.png',
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
        grade: "1° de Secundaria",
        section: "A",
        curricularArea: "Matemática",
        resource_type: "Cuaderno de trabajo",
        topic: "Fracciones, Decimales y Porcentajes en Situaciones Cotidianas",
        learning_purpose: "Resolver problemas de equivalencias entre fracciones, decimales y porcentajes usando situaciones del mercado.",
        planned_activity: "Desarrollo guiado y en equipos de la Ficha N° 4 de Resolvamos Problemas 1 (páginas 45 a 56).",
        adaptation_need: "Andamiaje visual con regletas de fracciones y cuadrículas de 10x10 para estudiantes que lo requieran.",
      },
      artifact: {
        document_title: "Guía Pedagógica y Uso Didáctico de Materiales MINEDU: Resolvamos Problemas 1 (Matemática)",
        executive_summary: "Orientaciones metodológicas y dosificación curricular para la integración efectiva del cuaderno de trabajo 'Resolvamos Problemas 1' y la 'Guía Docente de Matemática Ciclo VI' en las sesiones de aprendizaje sobre fracciones, decimales y porcentajes en 1° de Secundaria bajo el CNEB.",
        sections: [
          {
            title: "Ficha Técnica y Referencias Bibliográficas Oficiales MINEDU",
            narrative: "Materiales educativos distribuidos por el Ministerio de Educación seleccionados para la unidad didáctica:",
            key_points: [
              "Texto Escolar: Matemática 1 - Secundaria (Páginas 68-79: Números racionales y proporcionalidad).",
              "Cuaderno de Trabajo: Resolvamos Problemas 1 - Ficha N° 4 'Comparamos ofertas en el mercado local' (Páginas 45-56).",
              "Guía para el Docente: Orientaciones pedagógicas para el desarrollo de competencias matemáticas (MINEDU, 2024).",
              "Repositorio Digital: PerúEduca - Recursos interactivos y fichas de refuerzo escolar para Ciclo VI.",
            ],
          },
          {
            title: "Articulación Curricular y Desempeños Priorizados",
            narrative: "Correspondencia entre las actividades del cuaderno de trabajo y los desempeños del Programa Curricular de Secundaria:",
            key_points: [
              "Competencia: Resuelve problemas de cantidad.",
              "Desempeño 1: Establece relaciones entre datos y acciones de comparar e igualar cantidades; las transforma a expresiones numéricas que incluyen operaciones con fracciones y decimales.",
              "Desempeño 2: Expresa con diversas representaciones y lenguaje numérico su comprensión sobre la equivalencia entre fracciones, decimales y porcentajes usuales (25%, 50%, 75%).",
              "Enfoque Transversal: Búsqueda de la excelencia y Orientación al bien común.",
            ],
          },
          {
            title: "Secuencia Metodológica de Integración en el Aula",
            narrative: "Ruta didáctica estructurada para optimizar el trabajo autónomo y colaborativo con las fichas del MINEDU:",
            key_points: [
              "Inicio (15 min): Análisis vivencial de la situación significativa 'Las rebajas de temporada' (Ficha 4, Pág. 45) mediante preguntas de activación.",
              "Desarrollo (60 min): Trabajo en pares resolviendo los problemas 1 al 4 con material concreto (regletas de fracciones) y registro en el cuaderno.",
              "Cierre (15 min): Puesta en común de estrategias divergentes y resolución colectiva de la sección 'Evaluamos nuestros avances'.",
            ],
          },
          {
            title: "Adaptaciones DUA y Andamiajes Didácticos",
            narrative: "Adecuaciones metodológicas para atender la diversidad de ritmos de aprendizaje del aula:",
            key_points: [
              "Andamiaje visual: Tablas de doble entrada y cuadrículas de 10x10 para visualizar porcentajes como fracciones decimales.",
              "Nivelación formativa: Fichas de refuerzo complementarias de PerúEduca para estudiantes que requieren consolidar la división decimal.",
              "Ampliación de retos: Problemas abiertos de investigación de precios reales de la canasta básica familiar para estudiantes avanzados.",
            ],
          },
        ],
        teacher_recommendations: [
          "Monitorear que los estudiantes utilicen sus propios cuadernos de trabajo sin limitarse a copiar respuestas del solucionario.",
          "Aprovechar las secciones de metacognición al final de cada ficha para evaluar las estrategias heuristicas empleadas.",
          "Articular el registro de evidencias de la Ficha 4 con los criterios de evaluación del Registro Auxiliar Oficial.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.recursos/libros-guia-minedu.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.recursos/libros-guia-minedu.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 14 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
