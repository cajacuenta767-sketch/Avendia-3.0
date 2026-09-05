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
    name: 'situacion-significativa',
    url: 'http://127.0.0.1:5173/dashboard/planificamos/situacion-significativa',
    fileName: 'qa-19-situacion-significativa-preview.png',
    darkFileName: 'qa-19-situacion-significativa-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 4, // Step 4 of 5: preview ("legacy-document")
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "A",
        curricularArea: "Ciencia y Tecnología / Interdisciplinar",
        unit_title: "Fortalecemos la Seguridad Alimentaria y Revaloramos los Cultivos Ancestrales en Lamas",
        situation_axis: "Salud y conservación ambiental",
        context_description: "En la provincia de Lamas conviven saberes ancestrales pero se detecta alto consumo de alimentos ultraprocesados y desnutrición.",
        challenge_question: "¿Por qué consumimos alimentos que deterioran nuestra salud y cómo podemos liderar una campaña comunitaria de revaloración alimentaria?",
        learning_justification: "Movilizar la indagación científica y el pensamiento histórico para resolver una problemática alimentaria del entorno.",
        articulated_competencies: "Indaga mediante métodos científicos, Explica el mundo físico, Construye interpretaciones históricas y Escribe diversos tipos de textos.",
        transversal_approaches: "Enfoque Intercultural y Enfoque Ambiental.",
        expected_product: "Guía Gastronómica y Nutricional Comunitaria de Cultivos Ancestrales.",
        evaluation_criteria: "Rúbrica analítica holística de indagación y producción comunitaria.",
      },
      artifact: {
        document_title: "Situación Significativa 2026: Fortalecemos la Seguridad Alimentaria y Revaloramos los Cultivos Ancestrales en Lamas",
        executive_summary: "Diseño curricular y pedagógico de una situación significativa contextualizada para 3° de Secundaria, orientada a movilizar competencias de indagación científica, construcción histórica y producción escrita frente a la malnutrición infantil y el abandono de cultivos nativos en la provincia de Lamas.",
        sections: [
          {
            title: "Caracterización del Contexto Sociocultural y Diagnóstico de la Problemática",
            narrative: "En la provincia de Lamas (San Martín), conviven saberes ancestrales de comunidades quechua-lamistas y mestizas con una rica agrobiodiversidad (sacha inchi, frijol huasca, plátano, yuca y cacao). No obstante, los diagnósticos de salud escolar revelan un incremento de anemia leve y malos hábitos alimenticios debido a la sustitución de productos tradicionales por golosinas y ultraprocesados en los quioscos y hogares. Esta desconexión amenaza la salud comunitaria y la identidad cultural.",
            key_points: [
              "Eje temático CNEB: Salud integral, conservación ambiental y revaloración intercultural.",
              "Ubicación contextual: Comunidad educativa de Lamas, articulada con familias productoras locales.",
              "Población diana: Estudiantes de Ciclo VII (3° de Secundaria) con potencial de liderazgo juvenil.",
            ],
          },
          {
            title: "Formulación del Reto y Preguntas Provocadoras de Conflicto Cognitivo",
            narrative: "Planteamiento desafiante para despertar el interés intrínseco y la necesidad de aprender:",
            key_points: [
              "Pregunta retadora central: ¿Por qué en una región con tanta riqueza agrícola consumimos alimentos que deterioran nuestra salud y cómo podemos liderar una campaña comunitaria de revaloración alimentaria?",
              "Subpregunta de indagación: ¿Qué valor nutricional y propiedades químicas poseen los cultivos autóctonos frente a los productos industrializados?",
              "Subpregunta sociohistórica: ¿Qué técnicas agrícolas y recetas ancestrales transmitieron nuestros abuelos para asegurar la alimentación sostenible?",
              "Subpregunta comunicativa: ¿Qué formatos multimodales (podcasts, trípticos, recetarios digitales) resultan más persuasivos para sensibilizar a nuestras familias?",
            ],
          },
          {
            title: "Justificación Pedagógica y Articulación con el Perfil de Egreso",
            narrative: "La situación demanda que los estudiantes actúen como investigadores sociales y científicos escolares, contrastando evidencias empíricas con conocimientos académicos para resolver una necesidad sentida de su entorno.",
            key_points: [
              "Perfil de Egreso CNEB: El estudiante indaga el mundo natural y artificial, practica una vida activa y saludable, y convive democráticamente respetando la diversidad cultural.",
              "Enfoque pedagógico: Aprendizaje basado en indagación y resolución de problemas auténticos.",
              "Articulación curricular: Ciencia y Tecnología + Ciencias Sociales + Comunicación + DPCC.",
            ],
          },
          {
            title: "Matriz de Competencias y Enfoques Transversales Articulados",
            narrative: "Propósitos curriculares de alta exigencia cognitiva a movilizar a lo largo de la unidad didáctica:",
            key_points: [
              "Ciencia y Tecnología: 'Indaga mediante métodos científicos para construir conocimientos' y 'Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía'.",
              "Ciencias Sociales: 'Construye interpretaciones históricas' y 'Gestiona responsablemente los recursos económicos'.",
              "Comunicación: 'Escribe diversos tipos de textos en su lengua materna' y 'Se comunica oralmente en su lengua materna'.",
              "Enfoques Transversales: Enfoque Intercultural (diálogo de saberes ancestrales y científicos) y Enfoque Ambiental (agricultura regenerativa y soberanía alimentaria).",
            ],
          },
          {
            title: "Producto Integrador, Evidencias y Criterios de Evaluación Auténtica",
            narrative: "Demostración pública del aprendizaje aplicado mediante una solución innovadora:",
            key_points: [
              "Producto integrador: 'Guía Gastronómica y Nutricional Comunitaria: El Poder de Nuestros Cultivos de Lamas' (versión impresa y digital con códigos QR a videos de preparación casera).",
              "Evidencia procesual 1: Reporte de laboratorio sobre contenido proteico y lipídico del sacha inchi y legumbres locales.",
              "Evidencia procesual 2: Monografía histórica sobre los pisos ecológicos y calendarios de siembra tradicionales de la comunidad.",
              "Instrumento oficial: Rúbrica Analítica Holística con 4 niveles de desempeño (Previo al inicio, Inicio, Proceso y Logro Destacado).",
            ],
          },
        ],
        teacher_recommendations: [
          "Establecer alianzas con la posta médica local y la asociación de agricultores para que validen técnicamente los recetarios.",
          "Asegurar que las entrevistas a los abuelos y sabios comunales se realicen con consentimiento informado y respeto ético a la tradición oral.",
          "Facilitar la difusión del producto final en la radio comunal y en las asambleas de padres de familia.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.planificamos/situacion-significativa.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.planificamos/situacion-significativa.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 19 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
