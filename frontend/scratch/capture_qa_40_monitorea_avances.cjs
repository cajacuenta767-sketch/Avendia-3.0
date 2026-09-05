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
    name: 'monitorea-avances',
    url: 'http://127.0.0.1:5173/dashboard/reforzamos/monitorea-avances',
    fileName: 'qa-40-monitorea-avances-preview.png',
    darkFileName: 'qa-40-monitorea-avances-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 4, // Step 5 of 5: Informe & descarga
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        directorName: "Lic. Elena Torres Valdivia",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Primaria",
        grade: "4° de Primaria",
        section: "A",
        curricularArea: "Comunicación / Monitoreo Pedagógico CNEB",
        monitoring_period: "Bimestre 1",
        period_start: "2026-03-16",
        period_end: "2026-05-15",
        competency: "Lee diversos tipos de textos escritos en su lengua materna",
        capacity: "Infiere e interpreta información del texto escrito",
        expected_performance: "Deduce características implícitas de personajes y relaciones lógicas de causa-efecto.",
        starting_students: 12,
        milestone_1: "Semana 1: Identificación guiada de pistas contextuales y subrayado cromático.",
        milestone_2: "Semana 2: Elaboración de esquemas causa-efecto en parejas.",
        milestone_3: "Semana 3: Resolución autónoma de fichas de inferencia en textos divulgativos.",
        qualitative_notes: "9 estudiantes superaron la condición de inicio; 3 estudiantes requieren afianzar fluidez decodificadora.",
        socioemotional_notes: "Alta disposición al trabajo cooperativo y reducción de la frustración lectora.",
        advanced_group: "11 estudiantes con lectura crítica y contraste de fuentes informativas.",
        intermediate_group: "14 estudiantes con práctica guiada y listas de autoverificación.",
        priority_group: "3 estudiantes con acompañamiento intensivo en lectura fácil.",
        support_strategies: "Refuerzo escolar en contraturno dos veces por semana y préstamo de libros a familias.",
      },
      artifact: {
        document_title: "Informe Técnico de Monitoreo de Avances de Aprendizaje y Decisiones Pedagógicas",
        executive_summary: "Informe analítico de seguimiento formativo del progreso de los aprendizajes para 4° de Primaria en Comunicación. Sistematiza la línea de base, el registro semanal de hitos evaluativos en comprensión lectora inferencial, la categorización en grupos flexibles de atención y las decisiones de reajuste pedagógico para cerrar brechas formativas.",
        sections: [
          {
            title: "I. Línea de Base y Caracterización Inicial del Aula",
            narrative: "Diagnóstico de entrada del aula de 4° 'A' (28 estudiantes):\n• Estado inicial: 12 estudiantes (43%) presentaban nivel de inicio (C) en la deducción de relaciones de causa-efecto en textos continuos.\n• Factores influyentes: Vocabulario restringido y escaso hábito de lectura guiada en el ámbito familiar.\n• Meta de la intervención: Lograr que el 85% de los estudiantes transite a niveles de proceso o logro esperado al cierre del bimestre.",
            key_points: [
              "Competencia priorizada: Lee diversos tipos de textos escritos en su lengua materna.",
              "Desempeño observado: Deduce características implícitas de personajes y relaciones lógicas de causa-efecto.",
            ],
          },
          {
            title: "II. Matriz Semanal de Hitos, Evidencias y Análisis Cualitativo",
            narrative: "Evolución registrada a lo largo de cuatro semanas de aplicación de andamiajes:\n• Semana 1 (Hito 1): Identificación de pistas contextuales con apoyo visual y subrayado guiado.\n• Semana 2 (Hito 2): Elaboración de esquemas gráficos de causa-efecto en trabajo de parejas.\n• Semana 3 (Hito 3): Resolución independiente de fichas inferenciales en textos de divulgación científica.\n• Balance cualitativo: 9 estudiantes superaron la condición de inicio; 3 estudiantes requieren afianzar fluidez decodificadora previa.",
            key_points: [
              "Evidencias contrastadas: Fichas de lectura con esquemas causa-efecto y rúbrica formativa de desempeño.",
            ],
          },
          {
            title: "III. Agrupamiento Flexible y Estrategias Remediales Diferenciadas",
            narrative: "Organización del aula en tres grupos dinámicos según necesidades observadas:\n• Grupo de Atención Prioritaria (3 estudiantes): Acompañamiento personalizado en contraturno con textos en lectura fácil y soporte auditivo.\n• Grupo en Proceso (14 estudiantes): Práctica cooperativa guiada con listas de verificación de auto-monitoreo.\n• Grupo Avanzado (11 estudiantes): Desafíos de lectura crítica y contraste de fuentes informativas sobre el patrimonio natural.",
            key_points: [
              "Principio metodológico: Movilidad de grupos basada en evidencia semanal, evitando la estigmatización.",
            ],
          },
          {
            title: "IV. Decisiones Pedagógicas Institucionales y Cronograma de Reajuste",
            narrative: "Compromisos adoptados para garantizar la sostenibilidad de los logros:\n• Coordinación docente: Compartir las estrategias de subrayado cromático con los docentes de Personal Social y Ciencia.\n• Vinculación con la familia: Implementar la 'Mochila Viajera' con lecturas rotativas semanales en el hogar.\n• Próxima fecha de corte evaluativo: 12 de junio de 2026.",
            key_points: [
              "Monitoreo colegiado: Revisión mensual de avances en la reunión de trabajo colegiado del ciclo.",
            ],
          },
        ],
        teacher_recommendations: [
          "Asegurar que las retroalimentaciones individuales se brinden en un lapso no mayor a 48 horas tras la aplicación de la evidencia.",
          "Articular los textos de refuerzo con temas de interés genuino del grupo para sostener la motivación intrínseca.",
          "Registrar los progresos en el cuaderno de campo pedagógico para respaldar las conclusiones descriptivas del SIAGIE.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.reforzamos/monitorea-avances.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.reforzamos/monitorea-avances.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 40 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
