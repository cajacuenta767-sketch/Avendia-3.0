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
    name: 'adaptacion-nee-dua',
    url: 'http://127.0.0.1:5173/dashboard/incluimos/adaptacion-nee-dua',
    fileName: 'qa-33-adaptacion-nee-dua-preview.png',
    darkFileName: 'qa-33-adaptacion-nee-dua-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 4, // Step 5 of 5: preview ("legacy-document")
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Primaria",
        grade: "4° de Primaria",
        section: "B",
        curricularArea: "Matemática / Educación Inclusiva CNEB",
        student_name: "Mateo Saldaña Paredes",
        attention_scope: "Estudiante individual",
        community_context: "Urbano",
        condition: "Dificultad específica en el procesamiento visoespacial del cálculo (discalculia leve)",
        strengths_interests: "Memoria auditiva sobresaliente, gran disposición hacia el trabajo cooperativo y relatos históricos.",
        barriers: "Dificultad para alinear columnas numéricas en cuadrícula estándar y sobrecarga cognitiva ante enunciados extensos sin apoyo gráfico.",
        dua_engagement: "Contextualización de problemas en situaciones de compra-venta comunal y opciones de elección de retos progresivos.",
        dua_representation: "Uso de material multibase, regletas de Cuisenaire y hojas con cuadrículas ampliadas (1 cm x 1 cm) con código de color posicional.",
        dua_expression: "Verbalización oral previa de la estrategia, tarjetas numéricas recortables y calculadora de control formativo.",
        competency_focus: "Resuelve problemas de cantidad",
        performance_adjustments: "Expresa comprensión del sistema decimal y realiza operaciones aditivas con soporte de material concreto estructurado.",
        assessment_adjustments: "Evaluación descriptiva, instrucciones orales segmentadas y 25% de tiempo adicional.",
        access_resources: "Regletas Cuisenaire, ábaco abierto, cuadrículas macro y cronómetro visual.",
      },
      artifact: {
        document_title: "Plan de Adaptación Curricular Individualizada y Ajustes Razonables (DUA)",
        executive_summary: "Documento pedagógico normativo de inclusión educativa diseñado para 4° de Primaria. Establece adaptaciones curriculares, metodológicas y de acceso basadas en los tres principios del Diseño Universal para el Aprendizaje (DUA) para garantizar el progreso formativo y la participación plena del estudiante focalizado.",
        sections: [
          {
            title: "I. Diagnóstico Pedagógico y Barreras para el Aprendizaje (BAP)",
            narrative: "Estudiante focal: Mateo Saldaña Paredes · 4° de Primaria 'B'.\nDiagnóstico funcional y barreras identificadas:\n• Fortalezas e intereses: Destacada memoria auditiva, fluidez verbal expresiva, interés por relatos históricos y disposición al trabajo cooperativo.\n• Barreras para el aprendizaje (BAP): Dificultad para alinear columnas de cifras en papel estándar y sobrecarga cognitiva frente a textos matemáticos con enunciados densos y sin apoyo visual.",
            key_points: [
              "Condición pedagógica: Dificultad específica en el procesamiento visoespacial del cálculo.",
              "Enfoque inclusivo: Mantenimiento de altas expectativas sin reducir la exigencia conceptual.",
            ],
          },
          {
            title: "II. Matriz de Ajustes Razonables basada en los Principios DUA",
            narrative: "Implementación de medidas universales y focalizadas en el aula regular:\n• Principio I (Compromiso y Motivación): Formulación de problemas contextualizados en la economía familiar y el comercio local; opción de elegir el orden de desarrollo de los retos.\n• Principio II (Representación y Acceso): Uso sistemático de material multibase, regletas de Cuisenaire y hojas con cuadrículas ampliadas (1 cm × 1 cm) con código de colores posicionales (Unidades en azul, Decenas en rojo, Centenas en verde).\n• Principio III (Acción y Expresión): Posibilidad de verbalizar oralmente la estrategia de resolución previa al registro escrito, empleo de tarjetas de dígitos recortables y verificación autónoma.",
            key_points: [
              "Recursos de accesibilidad: Cuadrículas macro, regletas manipulativas y calculadora de control formativo.",
            ],
          },
          {
            title: "III. Adaptaciones Curriculares en Desempeños y Evaluación",
            narrative: "Graduación del desempeño y criterios evaluativos de la competencia 'Resuelve problemas de cantidad':\n• Desempeño adaptado: Expresa su comprensión del sistema de numeración decimal hasta cuatro cifras y realiza operaciones aditivas empleando material concreto y representaciones gráficas estructuradas.\n• Ajustes en la evaluación: Evaluación auténtica basada en rúbrica descriptiva; instrucciones orales segmentadas paso a paso y extensión del tiempo de resolución en un 25%.\n• Instrumento prioritario: Lista de cotejo cualitativa y registro de observación de procedimientos.",
            key_points: [
              "Evidencia diferenciada: Cuaderno de campo matemático con gráficos estructurados y explicación verbal guiada.",
            ],
          },
          {
            title: "IV. Coordinación SAANEE, Familia y Cronograma de Monitoreo",
            narrative: "Líneas de articulación y compromisos institucionales:\n• Acompañamiento SAANEE: Asesoría quincenal al docente de aula para el reajuste de materiales manipulativos.\n• Compromisos de la familia: Afianzar la autonomía personal en casa, apoyar rutinas de organización temporal y reforzar el cálculo mediante juegos cotidianos de mesa.\n• Cronograma de revisión: Evaluación bimestral de avances al término de cada periodo lectivo.",
            key_points: [
              "Meta bimestral: Consolidar la resolución autónoma de problemas aditivos de dos etapas con soporte de cuadrícula ampliada.",
            ],
          },
        ],
        teacher_recommendations: [
          "Compartir las pautas DUA con los docentes de las demás áreas curriculares para mantener coherencia en las adaptaciones.",
          "Promover un clima de aula respetuoso de la diversidad y erradicar cualquier manifestación de etiquetado.",
          "Documentar los progresos en el portafolio pedagógico de atención a la diversidad de la institución educativa.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.incluimos/adaptacion-nee-dua.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.incluimos/adaptacion-nee-dua.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 33 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
