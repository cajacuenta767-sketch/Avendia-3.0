const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1400, height: 1100 },
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

  const toolsToTest = [
    {
      name: 'sesion-aprendizaje',
      url: 'http://127.0.0.1:5173/dashboard/planificamos/sesion-aprendizaje',
      key: 'planificamos/sesion-aprendizaje',
      fileName: '53-sesion-word-preview.png',
      artifact: {
        document_title: 'Sesión de Aprendizaje: Ecuaciones Lineales en la Vida Cotidiana',
        executive_summary: 'Sesión orientada a resolver problemas cotidianos mediante modelos algebraicos de primer grado.',
        sections: [
          {
            title: 'Propósito y Aprendizajes Esperados',
            narrative: 'Resuelve problemas de regularidad, equivalencia y cambio modelando situaciones reales.',
            key_points: ['Traduce datos a expresiones algebraicas', 'Comunica su comprensión sobre relaciones algebraicas'],
          },
          {
            title: 'Evaluación y Evidencias',
            narrative: 'Resolución individual de ficha con problemas de presupuesto familiar.',
            key_points: ['Rúbrica analítica de desempeño', 'Lista de verificación de procedimientos'],
          },
        ],
        teacher_recommendations: ['Utilizar la balanza algebraica para estudiantes con dificultad.', 'Fomentar el trabajo en parejas mixtas.'],
        model: 'gemini-3.6-flash',
      },
    },
    {
      name: 'examen',
      url: 'http://127.0.0.1:5173/dashboard/evaluamos/examen',
      key: 'evaluamos/examen',
      fileName: '54-examen-word-preview.png',
      artifact: {
        document_title: 'Examen Bimestral de Comunicación y Comprensión Lectora',
        executive_summary: 'Evaluación escrita orientada a medir competencias lectoras en niveles literal, inferencial y crítico.',
        sections: [
          {
            title: 'Comprensión de Textos Argumentativos',
            narrative: 'Lee el siguiente ensayo sobre inteligencia artificial y responde las preguntas.',
            key_points: [
              '¿Cuál es la tesis central del autor? [4 puntos]',
              'Infiere la intención comunicativa del tercer párrafo. [4 puntos]',
              'Emite un juicio crítico sobre los argumentos presentados. [4 puntos]',
            ],
          },
        ],
        teacher_recommendations: ['Aplicar la clave oficial de respuestas.', 'Retroalimentar de forma grupal los reactivos inferenciales.'],
        model: 'gemini-3.6-flash',
      },
    },
    {
      name: 'sopas-letras',
      url: 'http://127.0.0.1:5173/dashboard/recursos/sopas-letras',
      key: 'recursos/sopas-letras',
      fileName: '55-sopas-word-preview.png',
      artifact: {
        document_title: 'Sopa de Letras: Vocabulario Geométrico',
        executive_summary: 'Actividad lúdica de afianzamiento conceptual para polígonos y figuras tridimensionales.',
        sections: [
          {
            title: 'Conceptos Clave de Geometría',
            narrative: 'Localiza las palabras clave en la sopa de letras y anota su significado.',
            key_points: ['PERÍMETRO', 'ÁREA', 'VOLUMEN', 'POLÍGONO', 'VÉRTICE', 'ARISTA'],
          },
        ],
        teacher_recommendations: ['Solicitar que usen colores distintos para cada palabra encontrada.'],
        model: 'gemini-3.6-flash',
      },
    },
    {
      name: 'correo-familias',
      url: 'http://127.0.0.1:5173/dashboard/acompanamos/correo-familias',
      key: 'acompanamos/correo-familias',
      fileName: '56-correo-word-preview.png',
      artifact: {
        document_title: 'Citación a Jornada de Integración Familiar y Logros',
        executive_summary: 'Convocatoria a reunión bimestral para dialogar sobre los logros y metas formativas de los estudiantes.',
        sections: [
          {
            title: 'Objetivos de la Jornada',
            narrative: 'Compartir los avances académicos y coordinar acuerdos para reforzar los hábitos de lectura en casa.',
            key_points: ['Exposición de proyectos de los estudiantes', 'Firma del compromiso bimestral de apoyo en casa'],
          },
        ],
        teacher_recommendations: ['Llevar la lista de asistencia y el cuaderno de actas de tutoría.'],
        model: 'gemini-3.6-flash',
      },
    },
  ];

  for (const item of toolsToTest) {
    console.log(`Processing tool: ${item.name} (${item.url})...`);
    await page.goto(item.url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Inject draft with step set to last step
    await page.evaluate((it) => {
      const user = JSON.parse(sessionStorage.getItem("avendia.user") || "{}");
      const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

      const buttons = document.querySelectorAll('.workflow-stepper button');
      const lastIndex = Math.max(0, buttons.length - 1);

      const sampleValues = {
        dre: "SAN MARTÍN",
        ugel: "LAMAS",
        institution: "MARTÍN DE LA RIVA Y HERRERA",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "A",
        curricular_area: "Matemática",
        teacher_name: "Prof. María Elena Ríos Flores",
        director_name: "Mg. Roberto Carlos Mendoza Paz",
        student_name: "Sebastián Quispe",
        guardian_name: "Familia Quispe Morales",
        school_year: "2026",
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
      console.log(`Wrote draft for ${it.name} with currentStep: ${lastIndex}`);
    }, item);

    // Reload to display the Word paper preview
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    const isPaper = await page.evaluate(() => Boolean(document.querySelector('.word-document-paper')));
    console.log(`Tool ${item.name} isPaperVisible:`, isPaper);

    await page.screenshot({ path: path.join(screenDir, item.fileName) });
    console.log(`Saved screenshot: ${item.fileName}`);
  }

  await browser.close();
  console.log('All archetype screenshots captured successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
