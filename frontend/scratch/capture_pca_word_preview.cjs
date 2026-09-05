const fs = require('fs');
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
  console.log('Logged in. Current URL:', page.url());

  // Navigate to Plan Curricular Anual
  await page.goto('http://127.0.0.1:5173/dashboard/planificamos/plan-curricular-anual', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Inspect and set localStorage keys
  await page.evaluate(() => {
    const sampleValues = {
      dre: "SAN MARTÍN",
      ugel: "LAMAS",
      institution: "MARTÍN DE LA RIVA Y HERRERA",
      level: "Secundaria",
      grade: "3° de Secundaria",
      section: "A",
      modality: "Educación Básica Regular (EBR)",
      shift: "Mañana",
      curricular_area: "Matemática",
      hours: "5 horas pedagógicas semanales",
      school_year: "2026",
      teacher_name: "Prof. María Elena Ríos Flores",
      director_name: "Mg. Roberto Carlos Mendoza Paz",
      subdirector_name: "Lic. Ana Sofía Torres Morales",
      justification: "Esta planificación anual de Matemática responde a los resultados de la evaluación diagnóstica del grado, priorizando la resolución de problemas en situaciones auténticas.",
      graduate_profile: "El estudiante egresado de 3° de secundaria interpreta la realidad y toma decisiones pertinentes a partir de conocimientos matemáticos y pensamiento crítico.",
      student_characteristics: "Estudiantes activos y participativos que demandan actividades lúdicas, material concreto y desafíos contextualizados a su entorno regional.",
      context_characteristics: "Comunidad de Lamas con alto potencial agrícola y comercial, ideal para vincular la matemática con proyectos productivos sostenibles.",
      priority_1: "Desarrollo del pensamiento lógico-matemático en resolución de problemas.",
      priority_2: "Manejo de herramientas tecnológicas y simuladores como GeoGebra.",
      priority_3: "Hábitos de estudio autónomo y autorregulación del tiempo.",
    };

    const sampleArtifact = {
      document_title: "Planificación Curricular Anual 2026 - Matemática",
      executive_summary: "Planificación curricular anual orientada a desarrollar competencias matemáticas fundamentales en tercer grado de secundaria.",
      sections: [
        {
          title: "I. Información General",
          narrative: "Datos organizativos de la institución educativa, nivel, ciclo y equipo directivo.",
          key_points: ["DRE San Martín", "UGEL Lamas", "I.E. Martín de la Riva y Herrera"],
        },
        {
          title: "II. Justificación y Propósitos de Aprendizaje",
          narrative: "Fundamentación pedagógica basada en los estándares CNEB y resultados diagnósticos.",
          key_points: ["Competencias de cantidad y forma", "Enfoque centrado en resolución de problemas"],
        },
      ],
      teacher_recommendations: [
        "Revisar periódicamente los criterios de evaluación en rúbricas formativas.",
        "Coordinar con la tutoría para el seguimiento socioemocional de los estudiantes.",
      ],
      model: "gemini-3.6-flash",
    };

    // Find all storage keys in localStorage and inject artifact
    let found = false;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.includes("plan-curricular-anual")) {
        try {
          const parsed = JSON.parse(localStorage.getItem(k));
          parsed.artifact = sampleArtifact;
          parsed.values = { ...parsed.values, ...sampleValues };
          localStorage.setItem(k, JSON.stringify(parsed));
          found = true;
          console.log("Injected into existing key:", k);
        } catch (e) {}
      }
    }

    // Also write to common pattern keys just in case
    const scopeKeys = [
      "avendia.draft.workflow.planificamos/plan-curricular-anual.v2.admin@avendia.edu.pe",
      "avendia.draft.workflow.planificamos/plan-curricular-anual.v2.global",
      "avendia.workflow.planificamos/plan-curricular-anual.admin@avendia.edu.pe",
      "avendia.workflow.planificamos/plan-curricular-anual.global",
    ];
    for (const key of scopeKeys) {
      localStorage.setItem(key, JSON.stringify({
        toolId: "plan-curricular-anual",
        currentStep: 8,
        values: sampleValues,
        artifact: sampleArtifact,
        version: 2,
        updatedAt: new Date().toISOString(),
      }));
    }
  });

  // Reload to pick up the updated draft state
  console.log('Reloading page...');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Check if Word preview paper is now visible
  const isPaperVisible = await page.evaluate(() => Boolean(document.querySelector('.word-document-paper')));
  console.log('isPaperVisible:', isPaperVisible);

  // Capture Light Mode
  await page.screenshot({ path: path.join(screenDir, '50-pca-word-preview-light.png') });
  console.log('Saved 50-pca-word-preview-light.png');

  // Scroll to show tables and signatures
  await page.evaluate(() => {
    const el = document.querySelector('.word-signatures-box') || document.querySelector('.word-table');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenDir, '52-pca-word-preview-tables-signatures.png') });
  console.log('Saved 52-pca-word-preview-tables-signatures.png');

  // Switch to Dark Mode
  console.log('Switching to Dark Mode...');
  await page.click('.topbar-theme-toggle');
  await new Promise(r => setTimeout(r, 600));

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenDir, '51-pca-word-preview-dark.png') });
  console.log('Saved 51-pca-word-preview-dark.png');

  await browser.close();
  console.log('Finished capturing all PCA Word preview screens!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
