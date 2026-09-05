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
    name: 'canales-audiovisuales',
    url: 'http://127.0.0.1:5173/dashboard/recursos/canales-audiovisuales',
    fileName: 'qa-15-canales-audio-preview.png',
    darkFileName: 'qa-15-canales-audio-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 2,
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Primaria",
        grade: "3° de Primaria",
        section: "A",
        curricularArea: "Ciencia y Tecnología",
        audiovisual_type: "Video explicativo",
        topic: "Ecosistemas del Perú y Cuidado de la Biodiversidad",
        max_duration: 15,
        language: "Español",
        accessibility: ["Subtítulos", "Lenguaje sencillo"],
        planned_use: "Motivación y mediación activa con ficha de observación guiada en el aula.",
      },
      artifact: {
        document_title: "Curaduría Audiovisual y Guía de Observación Activa: Ecosistemas del Perú y Biodiversidad",
        executive_summary: "Guía pedagógica de curaduría de canales y videos educativos con orientaciones para la mediación antes, durante y después de la proyección, orientada a estudiantes de 3° de Primaria en el área de Ciencia y Tecnología bajo el enfoque CNEB.",
        sections: [
          {
            title: "Canales Educativos y Videos Curados Recomendados",
            narrative: "Selección de fuentes audiovisuales verificadas, con rigor científico y formato adaptado para niños de 8 a 9 años:",
            key_points: [
              "Canal SERNANP Oficial: 'Áreas Naturales Protegidas del Perú' (Video: 'El Manu: Paraíso de la Biodiversidad', 10 min, Full HD, audio en español).",
              "Canal TVPerú Educa: 'Fauna Silvestre de la Costa, Sierra y Selva' (Episodio didáctico: 'Aves y mamíferos emblemáticos', 12 min).",
              "Canal Curiosamente Kids: '¿Cómo funciona una cadena alimenticia?' (Animación pedagógica sobre productores y consumidores, 7 min).",
              "Canal MINEDU - Aprendo en Casa: 'Guardianes de la Naturaleza' (Guía interactiva infantil, 9 min).",
            ],
          },
          {
            title: "Criterios de Calidad Pedagógica y Accesibilidad DUA",
            narrative: "Estándares aplicados para la selección segura y formativa de los recursos audiovisuales:",
            key_points: [
              "Rigor científico y curricular: Correspondencia directa con la competencia 'Explica el mundo físico basándose en conocimientos sobre biodiversidad y seres vivos'.",
              "Accesibilidad universal: Videos con subtítulos completos en español para estudiantes con barreras auditivas y lenguaje claro.",
              "Seguridad digital: Contenidos sin publicidad externa, aptos para proyección comunitaria en aula sin riesgos de distracción.",
            ],
          },
          {
            title: "Estrategia de Mediación: Antes, Durante y Después",
            narrative: "Momentos de intervención docente para convertir la visualización en una experiencia de aprendizaje activo:",
            key_points: [
              "Antes de la proyección (10 min): Pregunta detonante: '¿Qué pasaría si desapareciera una especie de nuestro ecosistema?' y registro de predicciones.",
              "Durante la proyección (15 min): Pausa activa guiada en el minuto 5:00 para identificar qué come cada animal observado y verificar predicciones.",
              "Después de la proyección (20 min): Completar la Ficha de Registro de Biodiversidad en equipos y diseñar un cartel de compromiso ambiental.",
            ],
          },
          {
            title: "Preguntas Guía para el Pensamiento Crítico Infantil",
            narrative: "Preguntas cognitivas para orientar el diálogo reflexivo posterior al video:",
            key_points: [
              "¿Qué diferencias observaste entre los animales de la costa desértica y los de la selva tropical?",
              "¿Por qué es importante que los parques nacionales estén protegidos por guardaparques del Estado?",
              "¿Qué acciones cotidianas desde nuestra escuela ayudan a cuidar el hábitat de los animales peruanos?",
            ],
          },
        ],
        teacher_recommendations: [
          "Previsualizar el video completo antes de la sesión para comprobar que el enlace y los subtítulos funcionen sin internet rápido.",
          "Asegurar un volumen adecuado y una ubicación visible de la pantalla para todos los estudiantes del aula.",
          "Conectar las conclusiones del video con la siguiente sesión práctica de siembra en el biohuerto escolar.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.recursos/canales-audiovisuales.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.recursos/canales-audiovisuales.v2.anonymous`, JSON.stringify(draft));
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
  const shell = await page.$('.word-paper-sheet') || await page.$('.workflow-shell') || await page.$('main');
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
  const shellDark = await page.$('.word-paper-sheet') || await page.$('.workflow-shell') || await page.$('main');
  if (shellDark) {
    await shellDark.screenshot({ path: darkPath });
    console.log('Saved Dark screenshot successfully to:', darkPath);
  }

  await browser.close();
  console.log('Capture 15 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
