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
    name: 'examen',
    url: 'http://127.0.0.1:5173/dashboard/evaluamos/examen',
    fileName: 'qa-27-examen-preview.png',
    darkFileName: 'qa-27-examen-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 2, // Step 2 of 3: preview ("legacy-document")
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "A",
        curricularArea: "Comunicación / Comprensión Lectora",
      },
      artifact: {
        document_title: "Evaluación Escrita Formativa CNEB: Comprensión Lectora y Razonamiento Crítico",
        executive_summary: "Prueba escrita estandarizada de evaluación formativa orientada a medir los tres niveles de comprensión lectora (literal, inferencial y crítico-valorativo) de la competencia 'Lee diversos tipos de textos escritos en su lengua materna' para 3° de Secundaria.",
        sections: [
          {
            title: "Texto Base: 'El Guardián Invisible de los Bosques de Neblina'",
            narrative: "Los bosques de neblina de la vertiente oriental andina albergan especies únicas como el oso de anteojos y el gallito de las rocas. No obstante, la apertura de trochas carrozables informales para la extracción maderera ilegal ha fragmentado más del 30% de su ecosistema en la última década. La pérdida de cobertura vegetal no solo amenaza la fauna endémica, sino que disminuye drásticamente la capacidad de captación de agua atmosférica que abastece a las comunidades de los valles interandinos. Frente a esta crisis, comunidades organizadas han implementado brigadas comunales con patrullaje satelital y drones de monitoreo para reportar alertas tempranas a las autoridades.",
            key_points: [
              "Instrucción general: Lee con atención el texto propuesto y responde con precisión a cada uno de los reactivos formulados a continuación.",
            ],
          },
          {
            title: "Nivel Literal: Recuperación de Datos Explícitos (Reactivos 1 y 2 - 6 Puntos)",
            narrative: "Reactivo 1 (3 pts): Según el texto, ¿cuál es la principal causa de la fragmentación ecológica en los bosques de neblina?\nA) La migración poblacional hacia los valles interandinos.\nB) La apertura de trochas carrozables informales para tala ilegal. [RESPUESTA CORRECTA]\nC) La proliferación de especies invasoras en la cuenca.\nD) El cambio climático global sin intervención humana.\n\nReactivo 2 (3 pts): ¿Qué tecnología emplean las brigadas comunales para el monitoreo de alertas tempranas?\nA) Cámaras trampa infrarrojas.\nB) Señales de radiofrecuencia VHF.\nC) Patrullaje satelital y drones de monitoreo. [RESPUESTA CORRECTA]\nD) Cartografía física tradicional en mapas de relieve.",
            key_points: [
              "Marque con una 'X' clara la alternativa correcta.",
              "Evite borrones o enmendaduras que invaliden su respuesta.",
            ],
          },
          {
            title: "Nivel Inferencial: Deducción e Interpretación del Sentido Global (Reactivos 3 y 4 - 6 Puntos)",
            narrative: "Reactivo 3 (3 pts): Del texto se deduce que la deforestación de los bosques de neblina tiene un impacto directo en la seguridad hídrica porque:\nA) Aumenta la salinidad de los ríos amazónicos.\nB) Destruye la vegetación responsable de captar la humedad atmosférica que alimenta los caudales. [RESPUESTA CORRECTA]\nC) Contamina los reservorios artificiales de agua potable.\nD) Acelera la evaporación del agua superficial en las urbes.\n\nReactivo 4 (3 pts): ¿Cuál fue el propósito comunicativo principal del autor al redactar este artículo?\nA) Describir las características biológicas del oso de anteojos.\nB) Promocionar el turismo vivencial en la vertiente oriental.\nC) Alertar sobre la urgencia ecológica y visibilizar la resistencia comunal organizada. [RESPUESTA CORRECTA]\nD) Enumerar las leyes ambientales sancionadoras del Estado.",
            key_points: [
              "Analice la coherencia causal entre la premisa y las conclusiones posibles.",
            ],
          },
          {
            title: "Nivel Crítico-Valorativo: Juicio y Toma de Postura Argumentada (Reactivo 5 - 8 Puntos)",
            narrative: "Reactivo 5 (8 pts): A partir de la lectura y de tu experiencia como ciudadano, ¿consideras que la vigilancia con drones comunales es suficiente para frenar la tala ilegal en el Perú? Fundamenta tu postura con al menos dos argumentos de índole legal, económica o ambiental.\n\nEspacio de respuesta argumentada:\n_________________________________________________________________________________\n_________________________________________________________________________________\n_________________________________________________________________________________",
            key_points: [
              "Criterio de calificación: Postura clara (2 pts), Argumento 1 fundamentado (3 pts), Argumento 2 fundamentado (3 pts).",
            ],
          },
        ],
        teacher_recommendations: [
          "CLAVE DE RESPUESTAS OFICIAL: Reactivo 1: B | Reactivo 2: C | Reactivo 3: B | Reactivo 4: C | Reactivo 5: Rúbrica de 8 puntos.",
          "Justificación pedagógica Reactivo 3: La deducción se basa en que los bosques de neblina actúan como esponjas hídricas naturales.",
          "Criterio de devolución formativa para Reactivo 5: Si el estudiante solo repite el texto sin emitir juicio propio, ubicar en nivel En Proceso (B).",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.evaluamos/examen.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.evaluamos/examen.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 27 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
