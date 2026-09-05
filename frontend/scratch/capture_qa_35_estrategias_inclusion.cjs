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
    name: 'estrategias-inclusion',
    url: 'http://127.0.0.1:5173/dashboard/incluimos/estrategias-inclusion',
    fileName: 'qa-35-estrategias-inclusion-preview.png',
    darkFileName: 'qa-35-estrategias-inclusion-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 4, // Step 5 of 5: Guía oficial & descarga
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "2° de Secundaria",
        section: "B",
        curricularArea: "Ciencia y Tecnología / Educación Inclusiva CNEB",
        student_count: "30",
        present_challenges: ["Discapacidad", "Dificultades de aprendizaje"],
        social_dynamics: "Clima positivo pero con tendencia a subgrupos cerrados durante actividades prácticas de laboratorio.",
        inclusion_goal: "Implementar aprendizaje cooperativo estructurado con roles rotativos para garantizar la participación activa del 100%.",
        methodology: "Estaciones",
        empathy_activities: "Dinámica de pares solidarios y análisis colectivo del error constructivo como punto de partida para nuevas hipótesis.",
        time_adjustments: "Pausas activas breves de 2 minutos entre estaciones para prevenir sobrecarga visual o cognitiva.",
        visual_supports: "Modelos 3D celulares, lupas ópticas adaptadas, macrotipos (14 pt) y animaciones subtituladas.",
        participation_indicators: "100% de estudiantes asumen un rol activo; incremento del 40% en intervenciones orales voluntarias.",
        feedback: "Retroalimentación formativa inmediata durante las transiciones entre estaciones experimentales.",
      },
      artifact: {
        document_title: "Guía de Estrategias Pedagógicas para la Inclusión Educativa y Eliminación de Barreras",
        executive_summary: "Documento metodológico institucional para 2° de Secundaria en el área de Ciencia y Tecnología. Articula el aprendizaje cooperativo, el trabajo por estaciones y el Diseño Universal para el Aprendizaje (DUA) con el fin de eliminar barreras en el laboratorio escolar y promover la participación plena y equitativa de todo el alumnado.",
        sections: [
          {
            title: "I. Caracterización de la Diversidad y Dinámica del Aula",
            narrative: "Diagnóstico socioeducativo del aula (30 estudiantes en total):\n• Diversidad identificada: Presencia de ritmos heterogéneos de aprendizaje, dos estudiantes con dificultades en comprensión de textos científicos y un estudiante con baja visión leve.\n• Dinámica grupal: Relaciones cordiales pero con tendencia a la formación de subgrupos cerrados durante actividades prácticas de laboratorio.\n• Objetivo de inclusión: Implementar el aprendizaje cooperativo estructurado para garantizar que el 100% de estudiantes movilice capacidades de indagación científica.",
            key_points: [
              "Enfoque transversal: Atención a la diversidad y orientación al bien común.",
              "Meta de convivencia: Fomentar la corresponsabilidad pedagógica y la ayuda mutua en equipos heterogéneos.",
            ],
          },
          {
            title: "II. Metodología Central: Estaciones de Aprendizaje Cooperativo",
            narrative: "Diseño de una ruta de indagación experimental distribuida en cuatro estaciones simultáneas (15 minutos por estación):\n• Estación 1 (Acceso visual y digital): Modelos tridimensionales de células y animaciones científicas con subtítulos claros.\n• Estación 2 (Acceso manipulativo y multisensorial): Microscopía óptica con lupas adaptadas y muestras biológicas tangibles.\n• Estación 3 (Lectura guiada y glosario): Fichas en lectura fácil, macrotipos (14 pt) y organizadores gráficos causa-efecto.\n• Estación 4 (Expresión y debate): Síntesis de conclusiones mediante esquemas visuales, grabaciones breves o informe escrito según elección.",
            key_points: [
              "Flexibilización metodológica: Cada estación ofrece al menos dos formas distintas de acceder a la misma noción científica.",
            ],
          },
          {
            title: "III. Clima de Aula, Convivencia y Tutoría entre Pares",
            narrative: "Estrategias para afianzar la cohesión socioemocional y la empatía en el aula inclusiva:\n• Roles cooperativos interdependientes: Coordinador de equipo, Gestor de instrumental, Relator de hallazgos y Verificador de consensos (rotación semanal).\n• Dinámica de pares solidarios: Acompañamiento cercano en el manejo seguro del instrumental de laboratorio sin generar dependencia.\n• Cultura del error formativo: Análisis colectivo de resultados experimentales inesperados como punto de partida para nuevas hipótesis.",
            key_points: [
              "Principio rector: Ningún equipo da por concluida la tarea hasta que todos sus integrantes puedan explicar el procedimiento seguido.",
            ],
          },
          {
            title: "IV. Ajustes de Accesibilidad, Tiempos e Indicadores de Seguimiento",
            narrative: "Medidas operativas para derribar barreras físicas y cognitivas:\n• Ajustes de accesibilidad: Textos de alto contraste, iluminación focalizada en mesas de trabajo y ampliación óptica de microscopios.\n• Flexibilización de tiempos: Concesión de pausas activas breves de 2 minutos para evitar fatiga visual o cognitiva.\n• Indicadores observables de inclusión: 100% de participación activa en roles cooperativos, reducción total de episodios de aislamiento y mejora del 35% en argumentación científica.",
            key_points: [
              "Instrumento de monitoreo: Ficha de observación de interacciones inclusivas y lista de cotejo grupal.",
            ],
          },
        ],
        teacher_recommendations: [
          "Monitorear la rotación efectiva de roles en los equipos cooperativos para evitar la sobrecarga del estudiante más aventajado.",
          "Proporcionar retroalimentación inmediata durante la transición entre estaciones de indagación.",
          "Registrar los ajustes exitosos en el anecdotario pedagógico para compartirlos en las jornadas de reflexión del área.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.incluimos/estrategias-inclusion.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.incluimos/estrategias-inclusion.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 35 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
