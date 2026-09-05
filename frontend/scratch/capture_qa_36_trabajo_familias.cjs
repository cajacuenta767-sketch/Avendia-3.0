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
    name: 'trabajo-familias',
    url: 'http://127.0.0.1:5173/dashboard/incluimos/trabajo-familias',
    fileName: 'qa-36-trabajo-familias-preview.png',
    darkFileName: 'qa-36-trabajo-familias-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 4, // Step 5 of 5: Acta oficial & descarga
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        directorName: "Lic. Elena Torres Valdivia",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Primaria",
        grade: "3° de Primaria",
        section: "A",
        curricularArea: "Tutoría / Trabajo con Familias CNEB",
        guardianName: "Sra. Carmen Quispe de Morales",
        studentName: "Sebastián Morales Quispe",
        meeting_mode: "Entrevista individual",
        reason: "Coordinación pedagógica de hábitos de estudio y autorregulación en el hogar",
        diagnosis: "Estudiante con avances notables en expresión oral; dispersión atencional ante pantallas encendidas.",
        home_barriers: "Dificultad para iniciar tareas autónomamente y cansancio por horarios tardíos de estudio.",
        home_routines: "Mesa despejada y sin pantallas durante 35 minutos de refuerzo vespertino (4:30 p.m. a 5:15 p.m.).",
        communication_channel: "Cuaderno de control",
        communication_frequency: "Reporte semanal de avances y llamada quincenal de retroalimentación breve.",
        family_commitments: "Revisar y firmar el cuaderno de control diariamente, 15 min de lectura compartida y asegurar 9h de sueño.",
        school_commitments: "Adaptar consignas escritas para lectura autónoma y brindar reporte oportuno de logros.",
        followup_date: "2026-05-22",
        followup_evidence: "Cuaderno de control firmado, portafolio de tareas completadas y ficha de observación.",
      },
      artifact: {
        document_title: "Acta de Compromiso y Orientaciones para el Acompañamiento Inclusivo en el Hogar",
        executive_summary: "Documento institucional de vinculación formativa entre la escuela y el hogar para 3° de Primaria. Registra el diálogo sostenido en la entrevista individual con la madre de familia, las barreras identificadas en casa, las pautas psicopedagógicas acordadas para el estudio diario y el cronograma de seguimiento coordinado.",
        sections: [
          {
            title: "I. Diagnóstico Compartido y Puntos Tratados en el Encuentro",
            narrative: "Encuentro individual sostenido con la madre de familia, Sra. Carmen Quispe de Morales, en relación al estudiante Sebastián Morales Quispe (3° 'A'):\n• Avances observados: El estudiante demuestra progresos notables en expresión oral y buena disposición para integrarse en dinámicas lúdicas de equipo.\n• Barreras identificadas en el hogar: Dificultad para iniciar las tareas escolares de forma autónoma debido a la cercanía de dispositivos digitales distractores (televisión y celular) y fatiga por horarios tardíos de estudio.\n• Acuerdos de encuadre: Reconocer la importancia de rutinas predecibles y reforzar la confianza del estudiante mediante elogios a su esfuerzo.",
            key_points: [
              "Modalidad del encuentro: Entrevista pedagógica presencial individual.",
              "Objetivo central: Consolidar hábitos de estudio saludables y autorregulación en casa.",
            ],
          },
          {
            title: "II. Pautas de Organización de Rutinas y Estudio en el Hogar",
            narrative: "Recomendaciones prácticas adaptadas a la dinámica familiar:\n• Espacio de aprendizaje: Disponer una mesa despejada, bien iluminada y libre de pantallas encendidas durante los 35 minutos destinados al refuerzo escolar.\n• Horario fijo: Establecer un horario vespertino regular (de 4:30 p.m. a 5:15 p.m.) con una pausa activa de hidratación a la mitad de la sesión.\n• Soporte motivacional: Fraccionar las tareas extensas en dos pasos simples y felicitar la culminación de cada bloque antes de pasar al juego.",
            key_points: [
              "Descanso nocturno: Asegurar al menos 9 horas continuas de sueño para favorecer la consolidación de la memoria y la atención diurna.",
            ],
          },
          {
            title: "III. Compromisos Específicos Asumidos por la Familia",
            narrative: "Acuerdos firmados por la madre de familia para su cumplimiento cotidiano:\n• Revisar diariamente el cuaderno de control y firmar las comunicaciones escolares al regresar a casa.\n• Destinar 15 minutos diarios a la lectura compartida de cuentos ilustrados, dialogando sobre las acciones de los personajes.\n• Fomentar la autonomía personal permitiendo que Sebastián prepare su mochila y uniforme la noche anterior.",
            key_points: [
              "Compromiso escolar complementario: El docente tutor adaptará las consignas escritas para facilitar su lectura autónoma en el hogar.",
            ],
          },
          {
            title: "IV. Canales de Comunicación y Fecha de Próxima Revisión",
            narrative: "Pautas para mantener un contacto fluido, respetuoso y oportuno:\n• Canal prioritario: Cuaderno de control pedagógico para avisos cotidianos y número telefónico institucional para emergencias justificadas.\n• Frecuencia de reporte: Registro semanal de desempeño en el cuaderno de enlace y llamada quincenal de retroalimentación breve.\n• Próximo encuentro de evaluación: 22 de mayo de 2026 para revisar el impacto de las rutinas domiciliarias.",
            key_points: [
              "Talón de confirmación: La familia suscribe el talón inferior y lo remite firmado al aula para constancia en el legajo de tutoría.",
            ],
          },
        ],
        teacher_recommendations: [
          "Mantener una comunicación empática y constructiva, priorizando el reconocimiento de pequeños logros sobre el reporte de dificultades.",
          "Coordinar con los docentes de áreas especiales para garantizar la aplicación coherente de las mismas pautas de apoyo.",
          "Archivar el acta en el portafolio de trabajo con familias del comité de tutoría de la institución educativa.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.incluimos/trabajo-familias.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.incluimos/trabajo-familias.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 36 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
