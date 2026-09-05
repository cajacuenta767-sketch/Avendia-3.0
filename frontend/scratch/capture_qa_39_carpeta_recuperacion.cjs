const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
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
    name: 'carpeta-recuperacion',
    url: 'http://127.0.0.1:5173/dashboard/reforzamos/carpeta-recuperacion',
    fileName: 'qa-39-carpeta-recuperacion-preview.png',
    darkFileName: 'qa-39-carpeta-recuperacion-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 1, // Step 2 of 2: Carpeta & descarga
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        directorName: "Lic. Elena Torres Valdivia",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "A",
        curricularArea: "Matemática / Refuerzo Escolar CNEB",
        academic_period: "Bimestre 1",
        school_year: 2026,
        sections: "3° A, 3° B",
        topics: "Números racionales, proporcionalidad y ecuaciones lineales",
        student_assignments: "8 estudiantes focalizados en nivel inicio y proceso",
        diagnosis: "Dificultades en la traducción de situaciones verbales a expresiones algebraicas y fraccionarias.",
        activity_route: "Ruta de 3 experiencias escalonadas sobre presupuesto familiar y costos comerciales.",
        evidence: "Portafolio de retos resueltos y video breve de argumentación de procedimientos.",
        criteria: "Modela cantidades racionales, resuelve ecuaciones y justifica transformaciones.",
        timeline: "4 semanas con entregas parciales y asesoría presencial semanal.",
        feedback: "Devolución formativa personalizada con preguntas orientadoras.",
        family_guidance: "Acompañamiento en casa y firma del cronograma de avance.",
      },
      artifact: {
        document_title: "Carpeta de Recuperación Pedagógica y Nivelación de Aprendizajes CNEB",
        executive_summary: "Documento técnico-pedagógico institucional para 3° de Secundaria en el área de Matemática. Establece la ruta formativa de recuperación para los estudiantes que requieren consolidar aprendizajes en las competencias 'Resuelve problemas de cantidad' y 'Resuelve problemas de regularidad, equivalencia y cambio', mediante experiencias de aprendizaje guiadas, criterios de evaluación formativa y cronograma de seguimiento coordinado con la familia.",
        sections: [
          {
            title: "I. Diagnóstico Pedagógico y Estudiantes Focalizados",
            narrative: "Diagnóstico de necesidades de aprendizaje:\n• Justificación pedagógica: La evaluación de término de periodo evidenció dificultades recurrentes en la resolución de problemas con expresiones fraccionarias y modelado algebraico de primer grado.\n• Población focalizada: Ocho estudiantes que se encuentran en nivel de inicio (C) o proceso (B), quienes recibirán acompañamiento intensivo.\n• Propósito formativo: Desarrollar autonomía en el aprendizaje y consolidar nociones matemáticas aplicadas a situaciones de la vida real.",
            key_points: [
              "Periodo de ejecución: Cuatro semanas lectivas con sesiones de asesoría semanal.",
              "Enfoque de evaluación: Evaluación auténtica y formativa orientada a la mejora continua.",
            ],
          },
          {
            title: "II. Competencias Priorizadas y Criterios de Evaluación",
            narrative: "Matriz curricular de competencias y capacidades seleccionadas:\n• Competencia 1: Resuelve problemas de cantidad. Criterio: Modela situaciones de compra y venta empleando operaciones con números racionales y porcentajes.\n• Competencia 2: Resuelve problemas de regularidad, equivalencia y cambio. Criterio: Establece relaciones de equivalencia y resuelve ecuaciones lineales justificando cada transformación algebraica.\n• Evidencia integradora: Cuaderno de campo financiero con análisis de costos e ingresos familiares.",
            key_points: [
              "Instrumento de evaluación: Rúbrica descriptiva de niveles de logro (En Inicio, En Proceso, Logro Esperado).",
            ],
          },
          {
            title: "III. Ruta Diferenciada de Experiencias de Aprendizaje",
            narrative: "Secuencia escalonada de actividades diseñadas para el trabajo guiado y autónomo:\n• Experiencia 1: 'Organizamos el presupuesto familiar mensual'. Cálculo de ingresos, gastos y ahorro utilizando fracciones y porcentajes.\n• Experiencia 2: 'Optimizamos costos en un emprendimiento local'. Planteamiento de funciones lineales para determinar el punto de equilibrio comercial.\n• Experiencia 3: 'Modelamos situaciones con ecuaciones'. Resolución de problemas verbales contextualizados en el ahorro de energía eléctrica.",
            key_points: [
              "Andamiaje didáctico: Cada actividad incluye un ejemplo resuelto paso a paso antes del planteamiento de retos independientes.",
            ],
          },
          {
            title: "IV. Cronograma de Entregas, Asesorías y Compromiso Familiar",
            narrative: "Planificación temporal y articulación con el hogar:\n• Semana 1 y 2: Desarrollo y entrega de la Experiencia 1; primera sesión presencial de retroalimentación reflexiva.\n• Semana 3 y 4: Desarrollo de las Experiencias 2 y 3; entrega del portafolio final y autoevaluación guiada.\n• Compromisos de la familia: Habilitar un espacio de estudio diario, monitorear el cronograma de avance y firmar la ficha de seguimiento semanal.",
            key_points: [
              "Fecha límite de entrega de carpeta completa: 30 de abril de 2026.",
            ],
          },
        ],
        teacher_recommendations: [
          "Brindar retroalimentación descriptiva a tiempo enfocada en los aciertos y en cómo superar las dificultades matemáticas.",
          "Evitar la acumulación de actividades al final del periodo promoviendo entregas parciales semanales.",
          "Coordinar con la dirección la emisión de las actas de evaluación de recuperación una vez consolidado el portafolio.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.reforzamos/carpeta-recuperacion.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.reforzamos/carpeta-recuperacion.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 39 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
