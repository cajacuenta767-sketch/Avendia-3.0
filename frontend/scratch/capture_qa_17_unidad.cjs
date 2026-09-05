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
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

  // Login
  await page.type('input[name="email"]', 'admin@avendia.edu.pe');
  await page.type('input[name="password"]', 'Admin123456!');
  await page.click('button.login-submit');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  console.log('Logged in.');

  const item = {
    name: 'unidad-aprendizaje',
    url: 'http://localhost:5173/dashboard/planificamos/unidad-aprendizaje',
    fileName: 'qa-17-unidad-aprendizaje-preview.png',
    darkFileName: 'qa-17-unidad-aprendizaje-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 3, // Step 3 of 4: preview ("legacy-document")
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "A",
        curricularArea: "Comunicación",
        planning_scope: "Grado",
        unit_duration: "4 semanas (del 16 de marzo al 17 de abril)",
        school_year: 2026,
        student_count: 32,
        shift: "Mañana",
        academic_period: "Bimestre 1",
        key_topics: "Uso responsable y gestión comunitaria del agua potable",
        significant_situation: "En la localidad de Lamas se registran cortes continuos de agua potable.",
        challenge_question: "¿Cómo podemos sensibilizar a nuestra comunidad sobre el uso responsable del agua?",
      },
      artifact: {
        document_title: "Unidad de Aprendizaje N° 02: Promovemos el Consumo Responsable y el Cuidado del Agua en Nuestra Comunidad",
        executive_summary: "Unidad didáctica de 4 semanas diseñada para 3° de Secundaria que articula las competencias comunicativas y ciudadanas frente al desabastecimiento hídrico local, culminando en la producción y difusión de un manifiesto juvenil y una infografía comunitaria bajo el enfoque CNEB.",
        sections: [
          {
            title: "Situación Significativa y Desafío del Contexto",
            narrative: "En la comunidad semiurbana de Lamas, las familias enfrentan cortes programados de agua potable durante la temporada seca, afectando la higiene y el bienestar. Ante esta realidad, los estudiantes se preguntan: ¿Cómo podemos sensibilizar a la población sobre el uso eficiente del agua y la preservación de las fuentes naturales? ¿Qué propuestas argumentativas podemos formular desde la escuela?",
            key_points: [
              "Eje de la situación: Cuidado del ambiente y convivencia democrática.",
              "Desafío cognitivo: Investigar el ciclo del agua local, entrevistar a líderes vecinales y redactar un texto expositivo-argumentativo.",
              "Producto integrador: Manifiesto escolar con compromisos comunitarios para la gestión del agua potable.",
            ],
          },
          {
            title: "Matriz de Propósitos de Aprendizaje y Competencias CNEB",
            narrative: "Competencias, capacidades y desempeños precisados a desarrollar durante la unidad:",
            key_points: [
              "Competencia: Lee diversos tipos de textos en su lengua materna (identifica información explícita, deduce relaciones de causa-efecto y evalúa la intención del autor).",
              "Competencia: Escribe diversos tipos de textos en su lengua materna (adecúa el texto a la situación comunicativa, organiza ideas de forma coherente y cohesionada con conectores lógicos).",
              "Competencia Transversal: Gestiona su aprendizaje de manera autónoma (establece metas viables y evalúa sus avances continuamente).",
              "Enfoques Transversales: Enfoque Ambiental (justicia y solidaridad intergeneracional) y Orientación al Bien Común.",
            ],
          },
          {
            title: "Secuencia Didáctica de Sesiones de Aprendizaje",
            narrative: "Ruta metodológica de 5 sesiones articuladas de 90 minutos cada una:",
            key_points: [
              "Sesión 1: 'Analizamos la problemática hídrica de nuestra localidad mediante lecturas estadísticas' (Activación y diagnóstico).",
              "Sesión 2: 'Identificamos las posturas de los actores sociales en artículos de opinión sobre recursos naturales' (Comprensión crítica).",
              "Sesión 3: 'Planificamos la estructura y argumentos de nuestro manifiesto comunal' (Planificación y textualización).",
              "Sesión 4: 'Revisamos borradores entre pares utilizando una rúbrica analítica y criterios de cohesión' (Coevaluación y edición).",
              "Sesión 5: 'Presentamos y sustentamos nuestras propuestas ante el comité ambiental escolar' (Socialización y evaluación sumativa).",
            ],
          },
          {
            title: "Criterios de Evaluación, Evidencias e Instrumentos",
            narrative: "Sistema de evaluación formativa para monitorear el logro de los desempeños del Ciclo VII:",
            key_points: [
              "Evidencia 1: Cuadro comparativo de causas y consecuencias del mal uso del agua (Evaluado con Lista de Cotejo).",
              "Evidencia 2: Borrador preliminar del manifiesto con argumentos basados en fuentes científicas (Evaluado con Ficha de Observación).",
              "Evidencia Final: Manifiesto institucional y exposición oral comunitaria (Evaluado con Rúbrica Analítica de Desempeño).",
            ],
          },
          {
            title: "Adaptaciones Curriculares DUA y Atención a la Diversidad",
            narrative: "Ajustes razonables para garantizar la participación equitativa de todos los estudiantes:",
            key_points: [
              "Principio I DUA (Compromiso): Elección autónoma de formatos de difusión (podcast radial escolar, afiche mural o sustentación oral).",
              "Principio II DUA (Representación): Textos informativos acompañados de esquemas gráficos, glosarios y versión en audio.",
              "Principio III DUA (Acción y Expresión): Permiso de uso de procesadores de texto y software de dictado por voz para estudiantes con dificultades motrices.",
            ],
          },
        ],
        teacher_recommendations: [
          "Coordinar previamente con los docentes de Ciencias Sociales para articular las sesiones de análisis histórico del acceso al agua.",
          "Promover que los estudiantes compartan el manifiesto con sus familias para generar acuerdos concretos en el hogar.",
          "Monitorear los cuadernos de trabajo y registrar el avance en el Registro Auxiliar de Competencias de manera semanal.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.planificamos/unidad-aprendizaje.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.planificamos/unidad-aprendizaje.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 17 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
