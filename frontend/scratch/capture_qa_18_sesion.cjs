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
    name: 'sesion-aprendizaje',
    url: 'http://127.0.0.1:5173/dashboard/planificamos/sesion-aprendizaje',
    fileName: 'qa-18-sesion-aprendizaje-preview.png',
    darkFileName: 'qa-18-sesion-aprendizaje-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 5, // Step 5 of 6: preview ("legacy-document")
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "2° de Secundaria",
        section: "A",
        curricularArea: "Comunicación",
        session_title: "Identificamos Tesis y Argumentos en Ensayos sobre Biodiversidad",
        unit_purpose: "Desarrollar la lectura crítica y la argumentación frente al cuidado ambiental.",
        performance: "Identifica la tesis explícita y discrimina argumentos causales en textos argumentativos.",
        purpose: "Diferenciar con precisión entre tesis, argumentos y contraargumentos en lecturas modelo.",
        evidence: "Árbol de Tesis y Argumentos completado con valoración crítica.",
      },
      artifact: {
        document_title: "Sesión de Aprendizaje N° 04: Identificamos Tesis y Argumentos en Ensayos sobre Biodiversidad",
        executive_summary: "Sesión pedagógica de 90 minutos diseñada para estudiantes de 2° de Secundaria en el área de Comunicación, orientada a desarrollar la lectura crítica y la discriminación entre posturas, tesis y evidencias científicas en textos argumentativos bajo el enfoque CNEB.",
        sections: [
          {
            title: "Propósitos de Aprendizaje y Criterios de Evaluación CNEB",
            narrative: "Competencias, capacidades y criterios formativos precisados para la sesión de clase:",
            key_points: [
              "Competencia: Lee diversos tipos de textos en su lengua materna.",
              "Capacidad 1: Obtiene información del texto escrito (ubica la tesis explícita o implícita en la introducción del ensayo).",
              "Capacidad 2: Infiere e interpreta información del texto (discrimina entre argumentos causales, de autoridad y ejemplos ilustrativos).",
              "Capacidad 3: Reflexiona y evalúa la forma, el contenido y el contexto del texto (emite juicio crítico sobre la validez de los argumentos).",
              "Enfoque Transversal: Enfoque Ambiental y Orientación al Bien Común.",
            ],
          },
          {
            title: "Procesos Didácticos Específicos del Área de Comunicación",
            narrative: "Secuencia metodológica de interacción con el texto durante la sesión:",
            key_points: [
              "Antes de la lectura (15 min): Lectura del título 'El pulmón amenazado de la Amazonía', activación de saberes sobre deforestación y predicción de la postura del autor.",
              "Durante la lectura (45 min): Primera lectura silenciosa individual; segunda lectura guiada en voz alta con técnica del sumillado al margen y subrayado de tesis (rojo) y argumentos (azul).",
              "Después de la lectura (30 min): Trabajo en pares completando el 'Árbol de Tesis y Argumentos' y contraste dialógico con las predicciones iniciales.",
            ],
          },
          {
            title: "Evidencia de Aprendizaje e Instrumento de Evaluación Formativa",
            narrative: "Producción tangible del estudiante para evidenciar el nivel de logro de la competencia:",
            key_points: [
              "Evidencia: Ficha de análisis textual con el árbol de tesis y argumentos completado y un párrafo de valoración crítica de 5 líneas.",
              "Instrumento: Lista de Cotejo Formativa con 4 descriptores dicotómicos (Sí / No / En proceso) y espacio para retroalimentación inmediata.",
              "Mecanismo de devolución: Retroalimentación reflexiva en plenaria a partir del análisis de un error frecuente sobre confusión entre tema y tesis.",
            ],
          },
          {
            title: "Adaptaciones Curriculares DUA y Accesibilidad Universal",
            narrative: "Estrategias inclusivas para garantizar el aprendizaje de todos los estudiantes:",
            key_points: [
              "Principio I DUA: Conexión con problemáticas vivenciales de la región amazónica para suscitar interés intrínseco.",
              "Principio II DUA: Organizador gráfico prediseñado con casillas rotuladas y vocabulario de conectores lógicos de causa-consecuencia.",
              "Principio III DUA: Opción de registrar las conclusiones de forma escrita o sustentarlas mediante una breve grabación de voz en tablet escolar.",
            ],
          },
        ],
        teacher_recommendations: [
          "Recordar a los estudiantes que la tesis es una postura debatible y no un hecho comprobado indiscutible.",
          "Monitorear los equipos de trabajo prestando especial atención a los estudiantes que confunden el tema general con la tesis particular.",
          "Articular los argumentos analizados como insumo directo para la siguiente sesión de redacción del propio ensayo de opinión.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.planificamos/sesion-aprendizaje.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.planificamos/sesion-aprendizaje.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 18 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
