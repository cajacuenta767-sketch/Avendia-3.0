const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[name="email"]', 'admin@avendia.edu.pe');
  await page.type('input[name="password"]', 'Admin123456!');
  await page.click('button.login-submit');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 0,
      values: {
        school_year: "2026",
        dre: "SAN MARTÍN",
        ugel: "LAMAS",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        service_model: "JER (Jornada Escolar Regular)",
        modality: "EBR (Educación Básica Regular)",
        level: "Secundaria",
        grade: "3° de Secundaria",
        sections: "A",
        planning_scope: "Grado",
        curricular_areas: ["Matemática"],
        teacher_name: "Prof. Manuel Cárdenas Vega",
        director_name: "Lic. Rosa Alvarado Torres",
        subdirector_name: "Mg. Carlos Mendoza Paredes",
      },
      artifact: {
        document_title: "Plan Curricular Anual 2026: Matemática 3° de Secundaria (Ciclo VII)",
        executive_summary: "Programación Curricular Anual que organiza las cuatro competencias del área de Matemática a lo largo de 4 bimestres y 8 unidades didácticas bajo el CNEB.",
        sections: [
          {
            title: "I. Justificación Curricular y Fundamentación",
            narrative: "El área de Matemática contribuye a formar ciudadanos capaces de interpretar la realidad económica y científica.",
            key_points: [
              "Enfoque centrado en la resolución de problemas.",
              "Articulación de competencias: Cantidad, Regularidad, Forma/Espacio y Datos/Incertidumbre.",
            ],
          },
        ],
        teacher_recommendations: [
          "Planificar sesiones con material concreto antes de la abstracción.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.planificamos/plan-curricular-anual.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.planificamos/plan-curricular-anual.v2.anonymous`, JSON.stringify(draft));
  });

  await page.goto('http://localhost:5173/dashboard/planificamos/plan-curricular-anual', { waitUntil: 'networkidle0' });
  console.log('URL:', page.url());
  const h1 = await page.evaluate(() => document.querySelector('h1')?.innerText);
  console.log('H1:', h1);
  const wordSheet = await page.evaluate(() => !!document.querySelector('.word-paper-sheet'));
  console.log('Has Word sheet:', wordSheet);

  await browser.close();
})();
