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
    name: 'plan-atencion',
    url: 'http://127.0.0.1:5173/dashboard/incluimos/plan-atencion',
    fileName: 'qa-34-plan-atencion-preview.png',
    darkFileName: 'qa-34-plan-atencion-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 4, // Step 5 of 5: PAI oficial & descarga
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Primaria",
        grade: "5° de Primaria",
        section: "A",
        curricularArea: "Comunicación / Atención a la Diversidad CNEB",
        student_name: "Camila Nicole Mendoza Huamán",
        age: "10",
        community_context: "Urbano",
        condition: "Condición del Espectro Autista (TEA Nivel 1 - Apoyo leve)",
        psychopedagogical_report: "Se sugiere uso de agendas visuales anticipatorias, checklists numerados y pausas sensoriales reguladas.",
        diagnosis: "Rendimiento destacado en comprensión lectora literal; requiere mediación en inferencias de sentido figurado e interacción social espontánea.",
        talents: "Alta memoria visual, interés profundo por la astronomía y el dibujo botánico, precisión conceptual.",
        autonomy: "Desempeño autónomo en rutinas estructuradas; requiere apoyo en transiciones no programadas.",
        academic_performance: "Sobresaliente en decodificación y redacción descriptiva; barrera ante ruidos ambientales y sobrecarga auditiva.",
        dua_supports: "Listas de verificación numeradas (checklist), incorporación de temáticas espaciales y opción de respuesta diagramada.",
        performance_adjustments: "Contextualización explícita de consignas y andamiaje visual para inferencias complejas.",
        methodology_adaptations: "Ubicación preferencial en zona de baja reverberación sonora y evaluación en ambiente estructurado.",
        assessment_adjustments: "Flexibilidad temporal (25% adicional) y segmentación de pruebas en bloques cortos.",
        supports: "Coordinación mensual con equipo SAANEE y asesoría quincenal al equipo docente.",
        plan_period: "Bimestre 1",
        start_date: "2026-03-16",
        review_date: "2026-05-15",
        goals: "Gestionar de manera autónoma su horario con agenda visual y participar activamente en debates guiados de equipo.",
        school_commitments: "Sensibilizar al grupo en empatía neurodivergente y respetar sus tiempos de autorregulación.",
        family_commitments: "Replicar las pautas de anticipación en el hogar y registrar avances en el cuaderno de enlace.",
        progress_evidence: "Portafolio de organizadores visuales, rúbrica cualitativa y registro de observación de aula.",
      },
      artifact: {
        document_title: "Plan de Atención Individualizado (PAI) para la Diversidad y la Inclusión Educativa",
        executive_summary: "Documento normativo institucional de planificación y seguimiento pedagógico para 5° de Primaria. Define la caracterización del estudiante focalizado, sus fortalezas y barreras (BAP), adaptaciones curriculares DUA, metas formativas bimestrales y los compromisos articulados entre la I.E., el equipo SAANEE y la familia.",
        sections: [
          {
            title: "I. Caracterización del Estudiante, Diagnóstico y Antecedentes",
            narrative: "Estudiante focal: Camila Nicole Mendoza Huamán · Edad: 10 años · Grado: 5° de Primaria 'A'.\nDiagnóstico pedagógico y antecedentes:\n• Condición relevante: Condición del Espectro Autista (Nivel 1 - Necesidad de apoyo leve), con hipersensibilidad a sobrecargas sonoras y preferencia por rutinas estructuradas.\n• Desempeño actual: Rendimiento destacado en comprensión lectora literal y redacción informativa; requiere acompañamiento en la interpretación de metáforas, ironías y normas sociales implícitas.",
            key_points: [
              "Informe psicopedagógico: Se recomienda uso prioritario de agendas visuales anticipatorias y pausas de descanso sensorial reguladas.",
              "Alcance del plan: Atención individualizada articulada con el aula inclusiva regular.",
            ],
          },
          {
            title: "II. Perfil Funcional, Talentos y Barreras para el Aprendizaje (BAP)",
            narrative: "Identificación multidimensional de potencialidades y obstáculos en el entorno escolar:\n• Talentos e intereses especiales: Alta memoria visual, pasión por las ciencias espaciales y la botánica, meticulosidad en la presentación de producciones escritas.\n• Autonomía y socialización: Interactúa cordialmente en grupos pequeños con roles definidos; necesita mediación docente para iniciar y sostener diálogos espontáneos en espacios abiertos.\n• Barreras identificadas (BAP): Ruidos estridentes imprevistos, cambios no avisados de horarios o docentes y consignas orales extensas sin soporte visual.",
            key_points: [
              "Factor clave de éxito: Anticipación clara de la secuencia diaria de actividades mediante panel visual.",
            ],
          },
          {
            title: "III. Medidas DUA y Adaptaciones Curriculares Específicas",
            narrative: "Estrategias universales y adaptaciones razonables de acceso y evaluación:\n• Medidas DUA: Presentación de consignas segmentadas en listas de verificación numeradas; inclusión de temáticas de astronomía para enganche motivacional; opción de respuestas orales o diagramadas.\n• Adaptaciones curriculares: Graduación en la competencia comunicativa: formulación de preguntas con contexto explícito y andamiaje para inferencias de sentido figurado.\n• Ajustes de accesibilidad: Ubicación preferencial del pupitre en zona lateral del aula de baja reverberación, uso de audífonos de cancelación de ruido durante recreos ruidosos si lo requiere.",
            key_points: [
              "Evaluación accesible: Tiempos flexibles de entrega y pruebas aplicadas en ambiente calmo y estructurado.",
            ],
          },
          {
            title: "IV. Metas Bimestrales, Compromisos y Articulación Familiar-SAANEE",
            narrative: "Cronograma operativo y responsabilidades compartidas:\n• Meta Bimestre 1: Gestionar de manera autónoma su horario escolar con agenda visual y participar en 3 debates guiados en equipo.\n• Compromisos de la I.E.: Sensibilizar a los compañeros en empatía neurodivergente y respetar los tiempos de autorregulación emocional.\n• Compromisos de la Familia: Replicar las pautas de anticipación en las actividades del hogar y mantener registro diario en el cuaderno de enlace.\n• Seguimiento SAANEE: Reuniones de asesoría mensual y reajuste trimestral de los apoyos curriculares.",
            key_points: [
              "Fecha de primera revisión oficial del plan: 15 de mayo de 2026.",
            ],
          },
        ],
        teacher_recommendations: [
          "Mantener actualizada la agenda visual diaria al inicio de cada jornada para preservar la estabilidad socioemocional de la estudiante.",
          "Reconocer y valorar públicamente sus talentos e intereses frente a sus pares como factor de inclusión y cohesión grupal.",
          "Evitar la sobreprotección y fomentar progresivamente la toma autónoma de decisiones pedagógicas.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.incluimos/plan-atencion.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.incluimos/plan-atencion.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 34 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
