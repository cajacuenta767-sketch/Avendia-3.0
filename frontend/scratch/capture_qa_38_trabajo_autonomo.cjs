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
    name: 'trabajo-autonomo',
    url: 'http://127.0.0.1:5173/dashboard/reforzamos/trabajo-autonomo',
    fileName: 'qa-38-trabajo-autonomo-preview.png',
    darkFileName: 'qa-38-trabajo-autonomo-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 2, // Step 3 of 3: Vista previa & descarga
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        directorName: "Lic. Elena Torres Valdivia",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Primaria",
        grade: "5° de Primaria",
        section: "B",
        curricularArea: "Ciencia y Tecnología / Refuerzo Escolar CNEB",
        competency: "Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía",
        worksheet_title: "Ficha de Refuerzo y Trabajo Autónomo: Los Ecosistemas y Cadenas Tróficas del Perú",
        estimated_duration: "45 minutos en el hogar",
        family_guidance: "Acompañar sin dar las respuestas directas, formulando preguntas guía.",
        what_to_learn: "Comprender el flujo de energía a través de los niveles tróficos en ecosistemas peruanos.",
        exercises: "Construcción de cadenas alimentarias y predicción de impactos ecológicos.",
        reflection: "Autoevaluación sobre la comprensión de roles ecológicos.",
      },
      artifact: {
        document_title: "Ficha de Refuerzo y Trabajo Autónomo: Los Ecosistemas y Cadenas Tróficas del Perú",
        executive_summary: "Ficha didáctica de aprendizaje autónomo diseñada para 5° de Primaria en Ciencia y Tecnología. Articula explicaciones conceptuales accesibles sobre el flujo de energía en la biodiversidad peruana, retos escalonados de indagación y una pauta de autoevaluación reflexiva con acompañamiento familiar en el hogar.",
        sections: [
          {
            title: "I. ¿Qué aprenderé hoy y por qué es importante? (Fundamentación y Conceptos Clave)",
            narrative: "En esta ficha descubrirás cómo fluye la energía a través de productores, consumidores y descomponedores en ecosistemas emblemáticos del Perú como las lomas costeras y la Amazonía. Comprenderás por qué la alteración de una sola especie afecta el equilibrio de toda la comunidad ecológica.",
            key_points: [
              "Identifica a los organismos productores en las lomas costeras (amancaes, algas y arbustos) y describe cómo capturan energía solar.",
              "Clasifica a cuatro animales peruanos (vicuña, zorro andino, puma y cóndor) según el nivel trófico que ocupan en la cadena alimentaria.",
            ],
          },
          {
            title: "II. Práctica Guiada y Análisis de Situaciones Ecológicas",
            narrative: "Lee con atención cada planteamiento y demuestra tu capacidad de indagación científica mediante esquemas y argumentos fundamentados.",
            key_points: [
              "Construye una cadena trófica de cuatro eslabones del lago Titicaca: fitoplancton -> zooplancton -> carachi/pejerrey -> ave zambullidora.",
              "Explica qué consecuencias ecológicas ocurrirían si una plaga elimina a los consumidores primarios de un ecosistema andino.",
            ],
          },
          {
            title: "III. Reto de Aplicación en el Hogar y Autoevaluación",
            narrative: "Comparte lo aprendido con tu familia y propongan acciones conjuntas para la protección ambiental en tu entorno cercano.",
            key_points: [
              "Formula dos compromisos familiares para cuidar la flora y fauna local y evitar la contaminación de parques o fuentes de agua.",
              "Autoevaluación formativa: Marca con sinceridad si lograste explicar la red alimentaria con tus propias palabras y qué dudas resolviste.",
            ],
          },
        ],
        teacher_recommendations: [
          "Clave Reto 1: Los productores son organismos autótrofos que sustentan la biomasa del ecosistema mediante fotosíntesis.",
          "Clave Reto 2: Vicuña = consumidor primario (herbívoro); Zorro andino = consumidor secundario (carnívoro/omnívoro); Puma = superdepredador.",
          "Clave Reto 3: Verificar que las flechas apunten en dirección del flujo de energía (hacia el organismo que consume).",
          "Pauta de mediación: Guiar al estudiante mediante preguntas reflexivas en lugar de brindar respuestas directas.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.reforzamos/trabajo-autonomo.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.reforzamos/trabajo-autonomo.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 38 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
