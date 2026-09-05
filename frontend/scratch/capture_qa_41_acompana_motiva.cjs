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
    name: 'acompana-motiva',
    url: 'http://127.0.0.1:5173/dashboard/reforzamos/acompanamiento-motivacion',
    fileName: 'qa-41-acompana-motiva-preview.png',
    darkFileName: 'qa-41-acompana-motiva-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 4, // Step 5 of 5: Ficha & descarga
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        directorName: "Lic. Elena Torres Valdivia",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "1° de Secundaria",
        section: "B",
        curricularArea: "Tutoría y Orientación Educativa (TOE) CNEB",
        student_name: "Diego Alonso Quispe Huanca",
        emotional_state: "Ansiedad",
        frequency: "Semanal",
        interests: "Dibujo técnico, fútbol y diseño gráfico.",
        home_support: "Familia afectuosa que requiere pautas para enfocar el esfuerzo.",
        recognition_channel: "Conversación individual",
        observations: "Bloqueo emocional ante tareas extensas de álgebra.",
        micro_goals: "Resolver dos ejercicios de forma autónoma y consultar dudas en voz alta.",
        student_message: "Tu perseverancia y talento para el dibujo demuestran tu fuerza. Equivocarse es la forma más valiente de aprender.",
        family_message: "Conversar 15 minutos diarios sobre sus emociones valorando el esfuerzo sin centrarse solo en la nota.",
        review_date: "2026-05-29",
        commitments: "Retroalimentación semanal afectiva y reporte de avances en el cuaderno tutorial.",
      },
      artifact: {
        document_title: "Plan de Acompañamiento Socioemocional, Micro-Metas y Motivación Escolar",
        executive_summary: "Documento institucional de tutoría y orientación educativa (TOE) para 1° de Secundaria. Articula la caracterización del estado socioafectivo del estudiante focalizado frente a episodios de ansiedad y frustración en la transición a secundaria, definiendo micro-metas progresivas, canales de reconocimiento positivo y mensajes formativos articulados con el hogar.",
        sections: [
          {
            title: "I. Lectura Socioemocional, Estado Inicial y Detonantes",
            narrative: "Estudiante focal: Diego Alonso Quispe Huanca · 12 años · 1° de Secundaria 'B'.\nDiagnóstico socioemocional:\n• Estado recurrente: Ansiedad y bloqueo emocional transitorio ante evaluaciones escritas o tareas extensas de cálculo numérico.\n• Detonantes identificados: Temor al error público y comparación con pares durante la adaptación al ritmo de la secundaria.\n• Factores protectores: Actitud respetuosa, afición por el dibujo técnico y los deportes, y alta receptividad a la orientación docente.",
            key_points: [
              "Frecuencia de las manifestaciones: Ocurrencia semanal asociada a momentos de evaluación sumativa.",
              "Enfoque del plan: Fortalecimiento de la autoeficacia y mentalidad de crecimiento.",
            ],
          },
          {
            title: "II. Fortalezas, Intereses y Recursos Personales",
            narrative: "Potencialidades identificadas para apalancar la motivación intrínseca:\n• Talentos e intereses: Gran capacidad para la representación gráfica y esquemática, disciplina en entrenamientos deportivos y lealtad grupal.\n• Dinámica del hogar: Padres comprometidos que requieren orientación para transformar la exigencia de calificaciones en refuerzo del esfuerzo.\n• Vínculo con el tutor: Confianza establecida que permite el diálogo honesto sobre sus emociones escolares.",
            key_points: [
              "Oportunidad pedagógica: Utilizar organizadores visuales y analogías deportivas para explicar conceptos abstractos.",
            ],
          },
          {
            title: "III. Plan de Micro-Metas y Reconocimiento Positivo",
            narrative: "Estrategia de metas cortas y alcanzables para reconstruir la confianza académica:\n• Micro-meta 1: Resolver de forma autónoma dos ejercicios iniciales en cada sesión antes de consultar al docente o compañero.\n• Micro-meta 2: Formular una pregunta en voz alta por semana para despejar dudas, normalizando la consulta como acto de aprendizaje.\n• Modalidad de reconocimiento: Conversación reflexiva breve al término de la semana y notas adhesivas con mensajes de aliento en sus tareas.",
            key_points: [
              "Criterio de éxito: Celebrar el proceso de indagación y la constancia por encima del resultado inmediato.",
            ],
          },
          {
            title: "IV. Mensajes Formativos, Compromiso Familiar y Seguimiento",
            narrative: "Acciones conjuntas de acompañamiento socioafectivo:\n• Mensaje inspirador para Diego: 'Tu perseverancia y talento para el dibujo demuestran que tienes la fuerza para superar cualquier reto. Equivocarse es la forma más valiente de aprender.'\n• Orientaciones para la familia: Dedicar 15 minutos diarios a conversar sobre sus emociones sin centrarse únicamente en las notas, celebrando sus pequeños avances.\n• Fecha de revisión de metas: 29 de mayo de 2026.",
            key_points: [
              "Monitoreo formativo: Reunión mensual de retroalimentación con la familia y ficha de seguimiento tutorial.",
            ],
          },
        ],
        teacher_recommendations: [
          "Evitar exponer al estudiante a situaciones de presión pública en la pizarra hasta consolidar su seguridad personal.",
          "Coordinar con los docentes de las distintas áreas para homologar las pautas de aliento y validación emocional.",
          "Documentar los cambios actitudinales en el anecdotario del comité de tutoría institucional.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.reforzamos/acompanamiento-motivacion.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.reforzamos/acompanamiento-motivacion.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 41 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
