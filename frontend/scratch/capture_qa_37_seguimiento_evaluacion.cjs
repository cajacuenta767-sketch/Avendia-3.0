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
    name: 'seguimiento-evaluacion',
    url: 'http://127.0.0.1:5173/dashboard/incluimos/seguimiento-evaluacion',
    fileName: 'qa-37-seguimiento-evaluacion-preview.png',
    darkFileName: 'qa-37-seguimiento-evaluacion-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 4, // Step 5 of 5: Informe oficial A4
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Primaria",
        grade: "4° de Primaria",
        section: "B",
        curricularArea: "Matemática / Educación Inclusiva CNEB",
        student_name: "Mateo Saldaña Paredes",
        condition: "Dificultad específica en el procesamiento visoespacial del cálculo",
        evaluation_period: "Bimestre 1 (Marzo - Mayo 2026)",
        implemented_adaptations: "Cuadrículas macro (1 cm × 1 cm) con código posicional de colores, regletas Cuisenaire y tiempo adicional del 25%.",
        pedagogical_progress: "Alineación precisa de columnas de hasta tres y cuatro cifras en el 85% de ejercicios aditivos.",
        socioemotional_progress: "Reducción notoria de la ansiedad matemática y mayor disposición para explicar oralmente sus procedimientos.",
        effective_supports: "Cuadrículas macro y verbalización previa de pasos operativos.",
        persistent_difficulties: "Fatiga cognitiva ante enunciados textuales extensos de dos etapas sin soporte gráfico.",
        dua_adjustments: "Esquemas pictóricos en problemas aditivos de dos etapas y uso de calculadora solo para comprobación final.",
        family_recommendations: "Continuar el refuerzo lúdico semanal mediante juegos de mesa matemáticos familiares.",
        next_goals: "Consolidar la resolución autónoma de problemas de dos etapas justificando con soporte gráfico.",
      },
      artifact: {
        document_title: "Informe Pedagógico de Seguimiento y Evaluación de Ajustes Razonables (DUA)",
        executive_summary: "Informe evaluativo institucional bimestral para 4° de Primaria. Documenta la eficacia de las medidas DUA y ajustes razonables aplicados durante el Bimestre 1, el progreso cognitivo y socioemocional del estudiante focalizado, las dificultades aún observadas y las decisiones pedagógicas de reajuste para el siguiente periodo lectivo.",
        sections: [
          {
            title: "I. Caracterización del Estudiante, Periodo y Adaptaciones Implementadas",
            narrative: "Estudiante focal: Mateo Saldaña Paredes · 4° de Primaria 'B'.\nPeriodo evaluado: Bimestre 1 (16 de marzo al 15 de mayo de 2026).\nAdaptaciones curriculares implementadas:\n• Apoyos de acceso: Cuadrículas macro de 1 cm × 1 cm con código posicional de color (azul/rojo/verde) y regletas Cuisenaire.\n• Apoyos metodológicos: Verbalización oral previa al registro escrito y ampliación del 25% en el tiempo de evaluación formativa.",
            key_points: [
              "Condición pedagógica: Dificultad específica en el procesamiento visoespacial del cálculo.",
              "Nivel de cumplimiento del plan: 95% de las sesiones contaron con el material estructurado previsto.",
            ],
          },
          {
            title: "II. Logros de Aprendizaje, Avances Socioemocionales y Evidencias",
            narrative: "Evaluación de progresos alcanzados en el aula regular:\n• Progreso pedagógico: Mateo alinea correctamente columnas posicionales de tres y cuatro cifras en el 85% de los ejercicios propuestos; comprende el significado del canje aditivo utilizando regletas.\n• Progreso socioemocional: Reducción significativa de la frustración y la ansiedad matemática; participa voluntariamente en la socialización de soluciones ante su grupo de trabajo.\n• Evidencias sustentatorias: Portafolio de fichas en cuadrícula macro, lista de cotejo de observación directa y grabaciones breves de explicación oral.",
            key_points: [
              "Calificación formativa cualitativa del periodo: Logro Esperado (A) en la competencia 'Resuelve problemas de cantidad' con apoyos.",
            ],
          },
          {
            title: "III. Evaluación de la Efectividad de los Apoyos y Dificultades Persistentes",
            narrative: "Balance analítico de la intervención psicopedagógica:\n• Apoyos de alta efectividad: Las cuadrículas macro y el código cromático erradicaron por completo los errores de cálculo por desalineación de columnas.\n• Apoyos de mediana efectividad: La calculadora de verificación generó cierta distracción cuando se utilizó al inicio de la sesión, por lo que se restringió a la etapa final de autocorrección.\n• Dificultades persistentes: Se observa fatiga cognitiva ante enunciados textuales extensos de problemas de dos etapas sin soporte gráfico.",
            key_points: [
              "Conclusión técnica: Los apoyos visoespaciales son indispensables y deben mantenerse durante el Bimestre 2.",
            ],
          },
          {
            title: "IV. Reajustes DUA, Orientaciones Familiares y Metas del Bimestre 2",
            narrative: "Decisiones pedagógicas concertadas para el siguiente bimestre:\n• Nuevos ajustes DUA: Incorporación de organizadores gráficos de datos y diagramas de barras ilustrados en problemas verbales de dos operaciones.\n• Pautas para el hogar: Continuar el refuerzo lúdico semanal mediante juegos de mesa matemáticos y consolidar la lectura compartida de consignas.\n• Meta prioritaria Bimestre 2: Resolver de manera autónoma problemas aditivos de dos etapas justificando el procedimiento con soporte gráfico.",
            key_points: [
              "Fecha de próximo corte evaluativo: 24 de julio de 2026.",
            ],
          },
        ],
        teacher_recommendations: [
          "Compartir los resultados del informe con el equipo SAANEE y la comisión de inclusión de la I.E.",
          "Asegurar que las cuadrículas macro estén disponibles en todas las sesiones del área sin generar señalamiento.",
          "Monitorear periódicamente el estado socioemocional del estudiante frente a nuevos desafíos matemáticos.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.incluimos/seguimiento-evaluacion.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.incluimos/seguimiento-evaluacion.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 37 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
