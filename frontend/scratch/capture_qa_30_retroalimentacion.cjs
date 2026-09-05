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
    name: 'retroalimentacion-formativa',
    url: 'http://127.0.0.1:5173/dashboard/evaluamos/retroalimentacion-formativa',
    fileName: 'qa-30-retroalimentacion-preview.png',
    darkFileName: 'qa-30-retroalimentacion-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 2, // Step 2 of 3: preview ("legacy-document")
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "A",
        curricularArea: "Comunicación / Producción Textual CNEB",
        evidence_title: "Ensayo Argumentativo sobre Inversión del Canon Minero",
        competency: "Escribe diversos tipos de textos en su lengua materna",
        criteria: "Delimita postura clara, articula argumentos fundamentados y usa vocabulario académico.",
        feedback_model: "Escalera de Wilson (Clarificar, Valorar, Inquietudes, Sugerencias)",
      },
      artifact: {
        document_title: "Guía de Retroalimentación Formativa y Devolución Pedagógica: Escalera de Wilson",
        executive_summary: "Documento técnico de acompañamiento formativo diseñado para 3° de Secundaria, orientado a estructurar la devolución pedagógica de la competencia 'Escribe diversos tipos de textos en su lengua materna' mediante los 4 peldaños de la Escalera de Wilson (Clarificar, Valorar, Expresar inquietudes y Sugerir).",
        sections: [
          {
            title: "Peldaño 1: Clarificar (Preguntas para Comprender la Intención del Estudiante)",
            narrative: "Preguntas orientadas a esclarecer ideas antes de emitir cualquier juicio pedagógico:",
            key_points: [
              "¿Qué fuentes estadísticas utilizaste para sustentar tu postura sobre la inversión del canon minero?",
              "¿A qué sector específico de la comunidad educativa está dirigido el llamado a la acción de tu ensayo?",
              "¿Por qué elegiste contrastar la visión local con el marco normativo nacional en el párrafo de desarrollo?",
            ],
          },
          {
            title: "Peldaño 2: Valorar (Reconocimiento Explícito de Fortalezas)",
            narrative: "Identificación de aspectos logrados y desempeños destacados observables en la producción escrita:",
            key_points: [
              "Excelente delimitación de la tesis central en el párrafo introductorio, manteniendo coherencia temática.",
              "Uso riguroso de conectores de causa-efecto y contraargumentación que otorgan fluidez a la lectura.",
              "Vocabulario académico y formal adecuado a la situación comunicativa planteada.",
            ],
          },
          {
            title: "Peldaño 3: Expresar Inquietudes (Preguntas Reflexivas sobre Desafíos)",
            narrative: "Puntos críticos formulados como cuestionamientos reflexivos para activar la autocrítica:",
            key_points: [
              "Me pregunto si el segundo argumento considera suficientemente el impacto financiero en las pequeñas empresas locales.",
              "¿Cómo podríamos reforzar el cierre para que no solo resuma la tesis, sino que motive una acción ciudadana concreta?",
              "Noto que algunas afirmaciones del tercer párrafo carecen de respaldo bibliográfico explícito.",
            ],
          },
          {
            title: "Peldaño 4: Hacer Sugerencias (Pautas Claras de Mejora Continua)",
            narrative: "Recomendaciones viables y accionables para la reescritura de la versión final:",
            key_points: [
              "Incorpora al menos un caso empírico de tu localidad para otorgar mayor fuerza persuasiva a tu propuesta.",
              "Revisa la puntuación en oraciones compuestas largas para evitar ambigüedades en la lectura.",
              "Elabora una ficha de autoevaluación contrastando tu ensayo con los criterios de la rúbrica antes de la entrega final.",
            ],
          },
        ],
        teacher_recommendations: [
          "Realizar la devolución formativa dentro de las 48 horas posteriores a la recepción de la evidencia preliminar.",
          "Brindar siempre la retroalimentación en un clima de empatía y confianza, priorizando el diálogo reflexivo sobre la corrección punitiva.",
          "Monitorear la incorporación efectiva de las sugerencias en la versión reescrita del estudiante.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.evaluamos/retroalimentacion-formativa.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.evaluamos/retroalimentacion-formativa.v2.anonymous`, JSON.stringify(draft));
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
  const shell = await page.$('.word-paper-sheet') || await page.$('.word-document-paper') || await page.$('.workflow-shell') || await page.$('main');
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
  const shellDark = await page.$('.word-paper-sheet') || await page.$('.word-document-paper') || await page.$('.workflow-shell') || await page.$('main');
  if (shellDark) {
    await shellDark.screenshot({ path: darkPath });
    console.log('Saved Dark screenshot successfully to:', darkPath);
  }

  await browser.close();
  console.log('Capture 30 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
