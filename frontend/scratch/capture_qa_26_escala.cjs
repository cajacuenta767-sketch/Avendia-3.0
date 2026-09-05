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
    name: 'escala-estimacion',
    url: 'http://127.0.0.1:5173/dashboard/evaluamos/escala-estimacion',
    fileName: 'qa-26-escala-estimacion-preview.png',
    darkFileName: 'qa-26-escala-estimacion-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 1, // Step 1 of 2: preview ("legacy-result")
      values: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "2° de Secundaria",
        section: "A",
        curricularArea: "Ciencia y Tecnología / Indagación CNEB",
        activity: "Trabajo Colaborativo e Indagación Científica",
        scale_type: "Siempre / A veces / Raras veces / Nunca",
        criteria_count: 3,
        criteria_notes: "Participación activa y compromiso en equipo, Rigor metodológico en recojo de datos, Comunicación asertiva de conclusiones.",
      },
      artifact: {
        document_title: "Escala de Estimación y Valoración Cualitativa: Trabajo Colaborativo e Indagación Científica",
        executive_summary: "Instrumento de estimación del desempeño formativo diseñado para 2° de Secundaria, orientado a valorar de manera progresiva y cualitativa las habilidades socioemocionales y procedimentales de la competencia 'Indaga mediante métodos científicos' durante las sesiones de experimentación y trabajo en equipo.",
        sections: [
          {
            title: "Participación Activa y Compromiso en el Equipo de Indagación",
            narrative: "Nivel de involucramiento y corresponsabilidad en el desarrollo de la práctica experimental:",
            key_points: [
              "Muestra iniciativa al formular hipótesis y proponer alternativas viables de indagación.",
              "Asume con puntualidad y responsabilidad el rol asignado dentro del equipo de trabajo.",
              "Utiliza y comparte los materiales de laboratorio respetando estrictamente las normas de bioseguridad.",
            ],
          },
          {
            title: "Rigor Metodológico en el Registro y Manejo de Datos",
            narrative: "Sistematicidad en la recolección y análisis de evidencias experimentales:",
            key_points: [
              "Registra sistemáticamente las observaciones cualitativas y mediciones numéricas en tablas ordenadas.",
              "Manipula los instrumentos de medición (balanza analítica, probeta graduada) con pulcritud técnica.",
              "Contrasta los datos experimentales con información científica previa para validar o refutar hipótesis.",
            ],
          },
          {
            title: "Comunicación Asertiva y Construcción Colectiva de Conclusiones",
            narrative: "Habilidades dialógicas para consensuar resultados de aprendizaje:",
            key_points: [
              "Sustenta sus explicaciones con base en los datos empíricos recogidos durante el experimento.",
              "Escucha con atención y respeto las objeciones o puntos de vista discordantes de sus compañeros.",
              "Formula conclusiones conjuntas redactadas con coherencia y propiedad disciplinar.",
            ],
          },
        ],
        teacher_recommendations: [
          "Aplicar la escala de estimación al término de cada sesión de indagación para retroalimentar la dinámica de equipo.",
          "Generar un espacio de autovaloración de 5 minutos donde cada equipo contraste su percepción con la del docente.",
          "Utilizar los resultados para conformar grupos heterogéneos que equilibren las fortalezas de los estudiantes.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.evaluamos/escala-estimacion.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.evaluamos/escala-estimacion.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 26 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
