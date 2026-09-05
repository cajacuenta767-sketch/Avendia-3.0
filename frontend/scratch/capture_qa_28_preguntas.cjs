const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1400, height: 1400 },
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
    name: 'preguntas-texto',
    url: 'http://127.0.0.1:5173/dashboard/evaluamos/preguntas-texto',
    fileName: 'qa-28-preguntas-texto-preview.png',
    darkFileName: 'qa-28-preguntas-texto-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Crear o inyectar instrumento vía API
  const instrumentId = await page.evaluate(async () => {
    const token = sessionStorage.getItem('avendia.accessToken');
    const payload = {
      kind: 'text_questions',
      title: "Ficha de Lectura Crítica: 'El Misterio de las Líneas de Nazca'",
      general_data: {
        title: "Ficha de Lectura Crítica: 'El Misterio de las Líneas de Nazca'",
        text_type: 'Expositivo',
        frame: {
          teacher_name: 'Prof. Manuel Cárdenas Vega',
          institution_name: 'I.E. 0001 REPÚBLICA DEL PERÚ',
          modality: 'EBR',
          education_level: 'Secundaria',
          grade_or_cycle: '2° de Secundaria',
          curricular_area: 'Comunicación',
        },
        source: {
          pasted_text: 'En las pampas de Jumana y San José, en el desierto costero de Ica, yacen cientos de geoglifos trazados hace más de 1,500 años por la cultura Nazca. Durante décadas, María Reiche sostuvo que eran un calendario astronómico para predecir solsticios y siembras. Sin embargo, excavaciones recientes de Isla y Reindel demostraron su función primordial como centros ceremoniales de culto al agua y la fertilidad agraria.',
          reading_text_size: 'medium',
          question_text_size: 'medium',
          sources: [],
        },
      },
      settings: {
        literal_count: 2,
        inferential_count: 2,
        critical_count: 1,
        question_format: 'Mixtas',
        cneb_capacities: 'Obtiene, Infiere y Reflexiona sobre textos escritos.',
        criteria: 'Identifica información explícita, deduce intencionalidad del autor y emite juicio crítico fundamentado.',
        feedback_guidance: 'Orientar la relectura analítica y contrastar hipótesis.',
        generated_artifact: {
          document_title: "Ficha de Lectura Crítica y Preguntas sobre Texto: 'El Misterio de las Líneas de Nazca'",
          executive_summary: "Ficha técnica de comprensión lectora multinivel diseñada para 2° de Secundaria, orientada a evaluar las tres capacidades de la competencia 'Lee diversos tipos de textos escritos en su lengua materna'.",
          sections: [
            {
              title: "Lectura Base: 'El Legado Astronómico y Ritual de los Antiguos Nazca'",
              narrative: "En las pampas de Jumana y San José, en el desierto costero de Ica, yacen cientos de geoglifos trazados hace más de 1,500 años por la cultura Nazca. Durante décadas, María Reiche sostuvo que eran un calendario astronómico. Sin embargo, investigaciones recientes de Johny Isla y Markus Reindel han revelado una función predominantemente ritual vinculada al culto al agua y la fertilidad agraria en un entorno hiperárido.",
              key_points: ["Lee atentamente el texto y responde a las interrogantes formuladas según cada nivel cognitivo."],
            },
            {
              title: "Nivel Literal: Localización de Información Explícita",
              narrative: "Pregunta 1: ¿Qué hipótesis defendió María Reiche? (B: Calendario astronómico)\nPregunta 2: ¿A qué culto estaban asociadas según Isla y Reindel? (A: Culto al agua y la fertilidad)",
              key_points: ["Marque con una 'X' clara la respuesta correcta identificada en el texto."],
            },
            {
              title: "Nivel Inferencial: Deducción e Interpretación",
              narrative: "Pregunta 3: ¿Por qué se contraponen ambas teorías? (B: Para demostrar que la ciencia evoluciona con nuevas evidencias)\nPregunta 4: Las procesiones sobre las líneas revelan que: (A: Entendían el paisaje como espacio sagrado ceremonial)",
              key_points: ["Deduzca el sentido global a partir de las pistas contextuales ofrecidas."],
            },
            {
              title: "Nivel Crítico-Reflexivo: Juicio y Valoración Ética",
              narrative: "Pregunta 5: ¿Qué medidas deben implementarse para proteger los geoglifos frente a invasiones urbanas sin vulnerar derechos sociales?",
              key_points: ["Propuesta equilibrada, argumentación legal-patrimonial y viabilidad social."],
            },
          ],
          teacher_recommendations: [
            "CLAVE OFICIAL: P1: B | P2: A | P3: B | P4: A | P5: Rúbrica de 8 puntos.",
            "Orientación de retroalimentación formativa: Guiar la relectura y contrastación empírica.",
          ],
          model: "gemini-3.6-flash",
        },
      },
    };

    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/evaluation-instruments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data.id;
    } catch (e) {
      console.error(e);
      return null;
    }
  });

  console.log('Instrument created with ID:', instrumentId);

  const targetUrl = instrumentId
    ? `${item.url}?document=${instrumentId}`
    : item.url;

  await page.goto(targetUrl, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1200));

  // Ir al paso 5 (Vista previa, índice 4)
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('.evaluation-wizard__stepper button');
    if (buttons && buttons.length >= 5) {
      buttons[4].click();
    }
  });
  await new Promise((r) => setTimeout(r, 800));

  // Ocultar topbar y sidebar para captura limpia
  await page.evaluate(() => {
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
    const sb = document.querySelector('.sidebar');
    if (sb) sb.style.display = 'none';
  });

  const savePath = path.join(screenDir, item.fileName);
  const shell = await page.$('.evaluation-wizard') || await page.$('main');
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
  const shellDark = await page.$('.evaluation-wizard') || await page.$('main');
  if (shellDark) {
    await shellDark.screenshot({ path: darkPath });
    console.log('Saved Dark screenshot successfully to:', darkPath);
  }

  await browser.close();
  console.log('Capture 28 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
