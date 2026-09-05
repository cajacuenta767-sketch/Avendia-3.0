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
    name: 'ordenar-bloques',
    url: 'http://127.0.0.1:5173/dashboard/recursos/ordenar-bloques',
    fileName: 'qa-08-ordenar-bloques-preview.png',
    darkFileName: 'qa-08-ordenar-bloques-dark.png',
  };

  console.log(`Processing ${item.name}...`);
  await page.goto(item.url, { waitUntil: 'networkidle0' });

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const user = JSON.parse(sessionStorage.getItem("avendia.user") || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 1,
      form: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Primaria",
        grade: "4° de Primaria",
        curricularArea: "Personal Social",
        sequenceType: "Secuencia cronológica o histórica",
        topic: "Secuencia de etapas históricas del Perú",
        stepCount: 6,
      },
      result: {
        activity_title: "Línea de Tiempo: Etapas Históricas del Perú",
        instructions: "Analiza los acontecimientos y ordena los bloques cronológicamente del 1 al 6.",
        pedagogical_rationale: "La historia peruana sigue una evolución continua desde las civilizaciones originarias andinas, la unificación incaica, el impacto de la conquista y el virreinato, hasta la gesta libertadora y la república.",
        blocks: [
          {
            id: "b1",
            text: "Época Preincaica: Desarrollo de civilizaciones autónomas como Caral, Chavín, Paracas, Mochica y Nazca con grandes avances agrícolas.",
            hint: "Primeras culturas originarias en los Andes.",
            correct_order: 1,
          },
          {
            id: "b2",
            text: "Época Incaica o Tahuantinsuyo: Gran expansión territorial, red de caminos Qhapaq Ñan y administración centralizada por Pachacútec.",
            hint: "Imperio andino más extenso de América del Sur.",
            correct_order: 2,
          },
          {
            id: "b3",
            text: "Época de la Conquista: Llegada de la expedición de Pizarro, captura de Atahualpa en Cajamarca y caída del Tahuantinsuyo en 1532.",
            hint: "Llegada hispana e inicio del proceso colonial.",
            correct_order: 3,
          },
          {
            id: "b4",
            text: "Época del Virreinato: Establecimiento de la dominación colonial con virreyes, intendencias, minería de Potosí y comercio con la metrópoli.",
            hint: "Tres siglos de administración bajo la Corona española.",
            correct_order: 4,
          },
          {
            id: "b5",
            text: "Época de la Independencia: Movimientos precursores, rebeliones patriotas y proclamación de la independencia en Lima en 1821.",
            hint: "Gesta libertadora encabezada por San Martín y Bolívar.",
            correct_order: 5,
          },
          {
            id: "b6",
            text: "Época Republicana: Consolidación soberana tras las batallas de Junín y Ayacucho, desarrollo constitucional y Perú actual.",
            hint: "Nuestra forma de gobierno republicana moderna.",
            correct_order: 6,
          },
        ],
        model: "gemini-3.6-flash",
      },
    };

    localStorage.setItem(`avendia.draft.ordenar-bloques.v1.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.ordenar-bloques.v1.anonymous`, JSON.stringify(draft));
  });

  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));

  // Navegar al paso 3 (Tablero interactivo de ordenamiento)
  const buttons = await page.$$('.tool-stepper button');
  if (buttons.length >= 3) {
    await buttons[2].click();
    await new Promise((r) => setTimeout(r, 1000));
  }

  const savePath = path.join(screenDir, item.fileName);
  await page.evaluate(() => {
    const tb = document.querySelector('.topbar');
    if (tb) tb.style.display = 'none';
  });

  const panel = await page.$('.word-grouping-shell');
  if (panel) {
    await panel.screenshot({ path: savePath });
    console.log('Saved shell screenshot to:', savePath);
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
  await new Promise((r) => setTimeout(r, 800));
  const darkPath = path.join(screenDir, item.darkFileName);
  const panelDark = await page.$('.word-grouping-shell');
  if (panelDark) {
    await panelDark.screenshot({ path: darkPath });
    console.log('Saved dark shell screenshot to:', darkPath);
  }

  await browser.close();
  console.log('Capture 08 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
