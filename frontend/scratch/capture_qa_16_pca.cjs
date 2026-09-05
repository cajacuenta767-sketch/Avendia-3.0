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
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

  // Login
  await page.type('input[name="email"]', 'admin@avendia.edu.pe');
  await page.type('input[name="password"]', 'Admin123456!');
  await page.click('button.login-submit');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  console.log('Logged in.');

  const item = {
    name: 'plan-curricular-anual',
    url: 'http://localhost:5173/dashboard/planificamos/plan-curricular-anual',
    fileName: 'qa-16-plan-anual-preview.png',
    darkFileName: 'qa-16-plan-anual-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 0,
      values: {
        school_year: "2026",
        dre: "SAN MARTÍN",
        ugel: "LAMAS",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        service_model: "JER (Jornada Escolar Regular)",
        modality: "Educación Básica Regular (EBR)",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "A",
        sections: "A",
        planning_scope: "Grado",
        curricular_area: "Matemática",
        curricular_areas: ["Matemática"],
        teacher_name: "Prof. Manuel Cárdenas Vega",
        director_name: "Lic. Rosa Alvarado Torres",
        subdirector_name: "Mg. Carlos Mendoza Paredes",
        pedagogical_approach: "Constructivista / sociocognitivo",
        writing_tone: "Técnico y formal",
        assessment_approach: "Formativa",
        execution_period: "Del 9 de marzo al 18 de diciembre",
        calendar_mode: "Bimestres",
        active_periods: "I, II, III y IV bimestre",
        unit_count: 8,
        justification: "Esta planificación anual de Matemática para 3° de Secundaria se alinea estrictamente al Currículo Nacional de la Educación Básica (CNEB), garantizando el desarrollo de competencias matemáticas mediante el enfoque de resolución de problemas en situaciones auténticas del contexto regional.",
        graduate_profile: "Al finalizar el grado, el estudiante formula y resuelve problemas del entorno sociocultural y ambiental, comunica conceptos numéricos y geométricos con lenguaje formal, y adopta actitudes de perseverancia y trabajo colaborativo.",
        student_characteristics: "Los estudiantes de 3° de Secundaria presentan un pensamiento abstracto en consolidación, capacidad para formular hipótesis y alto interés por desafíos interactivos y tecnológicos.",
        context_characteristics: "La comunidad educativa se ubica en un entorno semiurbano con actividades agrícolas, comerciales y turísticas que proveen contextos significativos para la matemática aplicada.",
      },
      artifact: {
        document_title: "Plan Curricular Anual 2026: Matemática 3° de Secundaria (Ciclo VII)",
        executive_summary: "Programación Curricular Anual que organiza las cuatro competencias del área de Matemática a lo largo de 4 bimestres y 8 unidades didácticas, articulando situaciones significativas del contexto sociocultural, metas de aprendizaje y enfoques transversales bajo el CNEB.",
        sections: [
          {
            title: "I. Justificación Curricular y Fundamentación",
            narrative: "El área de Matemática en el 3° grado de Educación Secundaria contribuye a formar ciudadanos capaces de interpretar la realidad económica, científica y ambiental mediante modelos matemáticos rigurosos, desarrollando el razonamiento lógico y la toma de decisiones informadas.",
            key_points: [
              "Enfoque centrado en la resolución de problemas (problemas contextualizados y vivenciales).",
              "Articulación de competencias matemáticas: Cantidad, Regularidad, Forma/Espacio y Datos/Incertidumbre.",
              "Integración de herramientas digitales y software de geometría dinámica (GeoGebra).",
            ],
          },
          {
            title: "II. Perfil de Egreso y Metas del Ciclo VII",
            narrative: "Al culminar el grado, los estudiantes argumentan la validez de soluciones, interpretan datos estadísticos complejos y modelan fenómenos del entorno local aplicando funciones lineales, sistemas de ecuaciones y geometría analítica básica.",
            key_points: [
              "Meta Bimestral: 85% de estudiantes en niveles Logrado (A) o Destacado (AD).",
              "Reducción de barreras en cálculo algebraico y razonamiento probabilístico.",
              "Desarrollo de proyectos interdisciplinarios vinculados a la sostenibilidad ambiental.",
            ],
          },
          {
            title: "III. Organización de las Unidades Didácticas del Año Lectivo 2026",
            narrative: "Distribución temporal y curricular de 8 unidades de aprendizaje organizadas en 4 periodos bimestrales:",
            key_points: [
              "Unidad 1 (Bimestre I): 'Analizamos el presupuesto y la canasta básica familiar' (Números racionales e irracionales).",
              "Unidad 2 (Bimestre I): 'Modelamos el crecimiento demográfico local' (Progresiones aritméticas y geométricas).",
              "Unidad 3 (Bimestre II): 'Optimizamos recursos productivos en la comunidad' (Sistemas de ecuaciones lineales con 2 variables).",
              "Unidad 4 (Bimestre II): 'Diseñamos estructuras arquitectónicas sostenibles' (Áreas, perímetros y figuras compuestas).",
              "Unidad 5 (Bimestre III): 'Calculamos distancias y alturas inaccesibles' (Razones trigonométricas y teorema de Pitágoras).",
              "Unidad 6 (Bimestre III): 'Evaluamos factores de riesgo nutricional' (Medidas de tendencia central y dispersión).",
              "Unidad 7 (Bimestre IV): 'Probabilidad y toma de decisiones en juegos de azar y clima' (Espacio muestral y regla de Laplace).",
              "Unidad 8 (Bimestre IV): 'Planificamos un emprendimiento escolar sostenible' (Funciones cuadráticas y presupuesto).",
            ],
          },
        ],
        teacher_recommendations: [
          "Planificar sesiones con énfasis en material concreto y simuladores virtuales antes de la abstracción algebraica.",
          "Promover la autoevaluación y coevaluación en cada cierre de unidad didáctica mediante rúbricas analíticas.",
          "Sostener reuniones de trabajo colegiado mensuales para el análisis conjunto de evidencias de aprendizaje.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.planificamos/plan-curricular-anual.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.planificamos/plan-curricular-anual.v2.anonymous`, JSON.stringify(draft));
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
  const shell = await page.$('.word-document-paper') || await page.$('.word-preview-wrapper') || await page.$('.workflow-shell') || await page.$('main');
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
  const shellDark = await page.$('.word-document-paper') || await page.$('.word-preview-wrapper') || await page.$('.workflow-shell') || await page.$('main');
  if (shellDark) {
    await shellDark.screenshot({ path: darkPath });
    console.log('Saved Dark screenshot successfully to:', darkPath);
  }

  await browser.close();
  console.log('Capture 16 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
