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
    name: 'ficha-observacion',
    url: 'http://127.0.0.1:5173/dashboard/evaluamos/ficha-observacion',
    fileName: 'qa-29-ficha-observacion-preview.png',
    darkFileName: 'qa-29-ficha-observacion-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Crear o inyectar instrumento vía API
  const instrumentId = await page.evaluate(async () => {
    const token = sessionStorage.getItem('avendia.accessToken');
    const payload = {
      kind: 'observation',
      title: 'Ficha de Observación Sistemática en Aula: Resolución de Problemas Matemáticos',
      general_data: {
        observed_date: '2026-03-25',
        observed_time: '10:30',
        situation: 'Sesión de aprendizaje sobre modelación algebraica de interés compuesto en proyectos familiares.',
        focus: 'Identificar autorregulación cognitiva, verbalización de estrategias y uso reflexivo del error.',
        scale_type: 'Descriptiva Cualitativa',
        criteria: [
          { client_key: 'c1', title: 'Explora y ensaya diversas estrategias heurísticas antes de formalizar ecuaciones.' },
          { client_key: 'c2', title: 'Comunica con precisión simbólica y vocabulario matemático los pasos seguidos.' },
          { client_key: 'c3', title: 'Asume el error de cálculo constructivamente y solicita retroalimentación a su par.' },
        ],
        common_notes: 'Los equipos de estudiantes demostraron dinamismo y fluidez dialógica al ensayar tablas numéricas de amortización crediticia.',
        context_factors: 'Trabajo en parejas heterogéneas con uso de calculadoras científicas y material impreso de apoyo.',
        interpretation: 'Mayor autonomía resolutiva en aquellos alumnos que esbozaron gráficos temporales previos al cálculo.',
        conclusion: 'El grupo consolida la comprensión conceptual del interés simple y progresa adecuadamente en capitalización compuesta.',
        commitments: 'Implementar mini-talleres de modelación financiera y mantener rúbrica de coevaluación entre pares.',
        frame: {
          teacher_name: 'Prof. Manuel Cárdenas Vega',
          institution_name: 'I.E. 0001 REPÚBLICA DEL PERÚ',
          modality: 'EBR',
          education_level: 'Secundaria',
          grade_or_cycle: '4° de Secundaria',
          curricular_area: 'Matemática',
        },
      },
      settings: {},
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

  console.log('Observation instrument created with ID:', instrumentId);

  const targetUrl = instrumentId
    ? `${item.url}?document=${instrumentId}`
    : item.url;

  await page.goto(targetUrl, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1200));

  // Seleccionar estudiante en la nómina
  const studentBtn = await page.$('.student-selector__option');
  if (studentBtn) {
    await studentBtn.click();
    console.log('Clicked student in roster.');
  } else {
    console.log('No .student-selector__option found.');
  }
  await new Promise((r) => setTimeout(r, 600));

  // Ir al paso 5 (Vista e historial, índice 4)
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('.evaluation-wizard__stepper button');
    if (buttons && buttons.length >= 5) {
      buttons[4].click();
    }
  });
  await new Promise((r) => setTimeout(r, 1000));

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
  console.log('Capture 29 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
