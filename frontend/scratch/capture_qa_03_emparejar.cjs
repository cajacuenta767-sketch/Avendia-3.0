const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1400, height: 1100 },
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
    name: 'emparejar-palabras',
    url: 'http://127.0.0.1:5173/dashboard/recursos/emparejar-palabras',
    key: 'recursos/emparejar-palabras',
    fileName: 'qa-03-emparejar-palabras-preview.png',
    darkFileName: 'qa-03-emparejar-palabras-dark.png',
    artifact: {
      document_title: 'Ficha de Aplicación: Emparejar Derechos y Deberes del Niño',
      executive_summary: 'Actividad de relación de conceptos y casos para 3° de Primaria sobre los Derechos Fundamentales de la Infancia.',
      sections: [
        {
          title: 'Instrucciones',
          narrative: 'Relaciona los derechos de la Columna A con las situaciones de la Columna B colocando la letra correspondiente dentro del paréntesis.',
          key_points: [
            'Derecho a la Identidad',
            'Derecho a la Educación',
            'Derecho a la Salud',
            'Derecho a la Recreación',
            'Derecho a la Protección',
            'Derecho a la Participación',
          ],
        },
      ],
      teacher_recommendations: [
        'Iniciar con un diálogo reflexivo sobre los derechos en la vida cotidiana de los niños.',
        'Aclarar dudas sobre el significado de cada término antes de la resolución individual.',
        'Verificar las respuestas usando el solucionario desglosable.',
      ],
      activity: {
        mode: 'emparejar',
        title: 'Relaciona los Derechos del Niño con su Significado',
        instructions: 'Lee con atención cada derecho de la Columna A y escribe su letra dentro del paréntesis de la Columna B que le corresponda.',
        items: [
          {
            id: '1',
            prompt: 'Contar con un nombre, apellidos propios y una nacionalidad reconocida desde el nacimiento.',
            answer: 'DERECHO A LA IDENTIDAD',
            hint: 'Garantiza la inscripción legal inmediata en el registro civil.',
            options: [],
          },
          {
            id: '2',
            prompt: 'Asistir a la escuela, aprender y desarrollar plenamente todas nuestras capacidades intelectuales y humanas.',
            answer: 'DERECHO A LA EDUCACIÓN',
            hint: 'Promueve el acceso universal a la formación escolar gratuita y de calidad.',
            options: [],
          },
          {
            id: '3',
            prompt: 'Recibir atención médica oportuna, vacunas preventivas y cuidados médicos si nos enfermamos.',
            answer: 'DERECHO A LA SALUD',
            hint: 'Asegura el bienestar físico, mental y el desarrollo saludable de la infancia.',
            options: [],
          },
          {
            id: '4',
            prompt: 'Disponer de tiempo libre para descansar, jugar sanamente, realizar deportes y divertirnos con amigos.',
            answer: 'DERECHO A LA RECREACIÓN',
            hint: 'El juego es vital para el desarrollo social y emocional de los niños.',
            options: [],
          },
          {
            id: '5',
            prompt: 'Vivir en un entorno familiar y comunitario seguro, protegidos de toda violencia, maltrato o explotación laboral.',
            answer: 'DERECHO A LA PROTECCIÓN',
            hint: 'El Estado y la sociedad deben cuidar la integridad física y moral del menor.',
            options: [],
          },
          {
            id: '6',
            prompt: 'Expresar nuestras opiniones con libertad y ser escuchados con respeto y consideración por los adultos.',
            answer: 'DERECHO A LA PARTICIPACIÓN',
            hint: 'La voz del niño debe ser valorada en las decisiones que le afectan.',
            options: [],
          },
        ],
      },
      model: 'gemini-3.6-flash',
    },
  };

  console.log(`Processing ${item.name}...`);
  await page.goto(item.url, { waitUntil: 'networkidle0' });

  // Inyectar estado en localStorage
  await page.evaluate((it) => {
    const user = JSON.parse(sessionStorage.getItem("avendia.user") || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const buttons = document.querySelectorAll('.workflow-stepper button');
    const lastIndex = Math.max(0, buttons.length - 1);

    const sampleValues = {
      dre: "DRE LIMA METROPOLITANA",
      ugel: "UGEL 03",
      institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
      level: "Primaria",
      grade: "3° de Primaria",
      section: "A",
      curricular_area: "Personal Social",
      teacher_name: "Prof. Rosa Quispe Alarcón",
      director_name: "Lic. Rosa Valdivia Alarcón",
      school_year: "2026",
      topic: "Deberes y derechos del niño",
    };

    const storagePayload = {
      toolId: it.name,
      currentStep: lastIndex,
      values: sampleValues,
      artifact: it.artifact,
      version: 2,
      updatedAt: new Date().toISOString(),
    };

    const key = `avendia.draft.workflow.${it.key}.v2.${scope}`;
    const legacyKey = `avendia.workflow.${it.key}.${scope}`;

    localStorage.setItem(key, JSON.stringify(storagePayload));
    localStorage.setItem(legacyKey, JSON.stringify(storagePayload));
  }, item);

  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const isPaper = await page.evaluate(() => Boolean(document.querySelector('.word-document-paper')));
  console.log('isPaperVisible:', isPaper);

  const savePath = path.join(screenDir, item.fileName);
  await page.evaluate(() => {
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
  });
  const paper = await page.$('.word-document-paper');
  if (paper) {
    await paper.screenshot({ path: savePath });
    console.log('Saved paper screenshot to:', savePath);
  } else {
    await page.screenshot({ path: savePath, fullPage: false });
    console.log('Saved page screenshot to:', savePath);
  }

  // Captura en Modo Oscuro
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
    localStorage.setItem('avendia.theme', 'dark');
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
  });
  await new Promise(r => setTimeout(r, 800));
  const darkPath = path.join(screenDir, item.darkFileName);
  const paperDark = await page.$('.word-document-paper');
  if (paperDark) {
    await paperDark.screenshot({ path: darkPath });
    console.log('Saved dark paper screenshot to:', darkPath);
  }

  await browser.close();
  console.log('Capture 03 completed successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
