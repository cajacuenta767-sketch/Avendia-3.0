const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1500, height: 1400 },
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
    name: 'rubrica-evaluacion',
    url: 'http://127.0.0.1:5173/dashboard/evaluamos/rubrica-evaluacion',
    fileName: 'qa-24-rubrica-preview.png',
    darkFileName: 'qa-24-rubrica-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const levels = [
      { id: "lvl-ad", code: "AD", label: "Logro destacado", score: 4 },
      { id: "lvl-a", code: "A", label: "Logro esperado", score: 3 },
      { id: "lvl-b", code: "B", label: "En proceso", score: 2 },
      { id: "lvl-c", code: "C", label: "En inicio", score: 1 },
    ];

    const criteria = [
      {
        id: "crit-1",
        code: "C1",
        title: "Tesis y Postura Crítica",
        description: "Planteamiento claro de la tesis frente a la deforestación y pérdida de biodiversidad.",
        weight: 25,
        descriptors: {
          "lvl-ad": "Formula una tesis innovadora, de alta complejidad conceptual y articulada rigurosamente con la realidad socioambiental.",
          "lvl-a": "Plantea una tesis clara, coherente y delimitada con postura crítica fundamentada sobre la biodiversidad.",
          "lvl-b": "Formula una tesis identificable pero con argumentos genéricos sin postura crítica sólida frente al problema.",
          "lvl-c": "La postura es ambigua o no se distingue con claridad del tema general; carece de punto de vista propio.",
        },
      },
      {
        id: "crit-2",
        code: "C2",
        title: "Sustento Argumentativo y Evidencia",
        description: "Uso de datos empíricos, artículos indexados y citas académicas.",
        weight: 25,
        descriptors: {
          "lvl-ad": "Contrasta múltiples fuentes académicas especializadas, analiza contraargumentos y valida la evidencia con solvencia epistémica.",
          "lvl-a": "Sustenta cada argumento con evidencias científicas sólidas, datos estadísticos y referencias pertinentes.",
          "lvl-b": "Incorpora algunas citas aisladas pero sin análisis crítico ni contraste entre autores o evidencias.",
          "lvl-c": "Utiliza opiniones personales sin respaldo documental ni fuentes científicas verificables.",
        },
      },
      {
        id: "crit-3",
        code: "C3",
        title: "Coherencia y Cohesión Textual",
        description: "Uso de conectores lógicos, progresión temática y párrafos estructurados.",
        weight: 25,
        descriptors: {
          "lvl-ad": "Evidencia maestría estilística, ritmo argumentativo impecable y transición conceptual armónica en todo el texto.",
          "lvl-a": "Articula las ideas con fluidez mediante conectores variados, jerarquía capitular y sólida cohesión interparrafal.",
          "lvl-b": "Mantiene la progresión temática básica con uso limitado de conectores y leves desajustes de cohesión.",
          "lvl-c": "Presenta reiteraciones innecesarias, digresiones o vacíos de información que dificultan la comprensión.",
        },
      },
      {
        id: "crit-4",
        code: "C4",
        title: "Adecuación Pragmática y Ética",
        description: "Registro formal, propiedad léxica y respeto a la propiedad intelectual.",
        weight: 25,
        descriptors: {
          "lvl-ad": "Demuestra excelencia en el manejo del lenguaje académico especializado y rigurosa ética de autoría intelectual.",
          "lvl-a": "Aplica el registro formal estándar, precisión léxica disciplinar y citado ético riguroso según normas académicas.",
          "lvl-b": "Usa registro formal con algunas imprecisiones léxicas y citas incompletas según la norma APA requerida.",
          "lvl-c": "Emplea registro coloquial recurrente e incurre en citas no atribuidas o parafraseo inadecuado.",
        },
      },
    ];

    const draft = {
      version: 1,
      rubricType: "analytic",
      weighted: false,
      currentStep: 3, // Step 3 (0-indexed) = Vista previa
      general: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "4° de Secundaria",
        section: "A",
        area: "Comunicación",
        competence: "Escribe diversos tipos de textos en su lengua materna",
        performance: "Escribe ensayos argumentativos con rigor conceptual, citas académicas y posturas éticas sostenidas.",
        context: "Debate escolar sobre la protección de los bosques tropicales y la Amazonía peruana.",
        evidenceTitle: "Ensayo Argumentativo sobre Biodiversidad Amazónica",
        date: "2026-03-24",
      },
      levels,
      criteria,
      selection: {
        rosterId: "roster-4a",
        studentIds: ["std-1"],
      },
      assessments: [
        {
          studentId: "std-1",
          evidence: "Borrador final de 4 páginas con 5 fuentes bibliográficas indexadas.",
          ratings: {
            "crit-1": {
              levelId: "lvl-a",
              strength: "Postura crítica definida con solvencia inicial.",
              improvement: "Profundizar en la dimensión socioeconómica.",
              recommendation: "Articular la tesis con los impactos en comunidades originarias.",
            },
            "crit-2": {
              levelId: "lvl-a",
              strength: "Uso pertinente de informes SERFOR y MINAM 2024.",
              improvement: "Contrastar con estadísticas de deforestación regional.",
              recommendation: "Incorporar gráficos comparativos en el cuerpo del ensayo.",
            },
            "crit-3": {
              levelId: "lvl-ad",
              strength: "Excelente articulación y riqueza de conectores de causa y consecuencia.",
              improvement: "Ninguno significativo.",
              recommendation: "Mantener el estándar expositivo en futuras producciones.",
            },
            "crit-4": {
              levelId: "lvl-a",
              strength: "Citado APA 7ma edición correctamente estructurado.",
              improvement: "Uniformizar sangría francesa en bibliografía.",
              recommendation: "Verificar concordancia entre citas en texto y lista de referencias.",
            },
          },
          teacherDecision: "Nivel de Logro Esperado (A). Estudiante apto para postular a la feria científica escolar.",
        },
      ],
      activeStudentId: "std-1",
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.evaluations.rubric.v1.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.evaluations.rubric.v1.anonymous`, JSON.stringify(draft));
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
  const shell = await page.$('.evaluation-card') || await page.$('.rubric-tool') || await page.$('main');
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
  const shellDark = await page.$('.evaluation-card') || await page.$('.rubric-tool') || await page.$('main');
  if (shellDark) {
    await shellDark.screenshot({ path: darkPath });
    console.log('Saved Dark screenshot successfully to:', darkPath);
  }

  await browser.close();
  console.log('Capture 24 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
