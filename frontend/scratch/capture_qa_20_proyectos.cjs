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
    name: 'proyectos-integrados',
    url: 'http://127.0.0.1:5173/dashboard/planificamos/proyectos-integrados',
    fileName: 'qa-20-proyectos-integrados-preview.png',
    darkFileName: 'qa-20-proyectos-integrados-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 2,
      currentStep: 4, // Step 4 of 5: preview ("legacy-document")
      values: {
        teacherName: "Equipo Colegiado Interdisciplinar",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "4° de Secundaria",
        section: "A y B",
        curricularArea: "Proyectos Integrados ABP",
        project_name: "Ecosistemas Sostenibles y Biohuerto Automatizado Escolar",
        involved_areas: ["Ciencia y Tecnología", "Matemática", "Educación para el Trabajo", "Comunicación"],
        challenging_situation: "Degradación de áreas verdes y necesidad de biohuerto tecnificado con ahorro de agua.",
        competency_matrix: "Diseña soluciones tecnológicas, Resuelve problemas de forma, Gestiona proyectos de emprendimiento y Se comunica oralmente.",
        approaches_and_product: "Enfoque Ambiental, Búsqueda de la Excelencia. Prototipo de riego tecnificado y biohuerto escolar.",
        phase_sequence: "Inmersión, Modelado, Construcción, Registro fenológico y Feria de Innovación.",
        roles_and_resources: "Equipos cooperativos, docentes tutores, apoyo de la Municipalidad y APAFA.",
        interdisciplinary_criteria: "Rúbricas holísticas integradas por área.",
        assessment_instruments: "Portafolio digital, listas de cotejo técnicas y rúbrica analítica.",
      },
      artifact: {
        document_title: "Proyecto Integrador Interdisciplinario ABP: Ecosistemas Sostenibles y Biohuerto Automatizado Escolar",
        executive_summary: "Proyecto de Aprendizaje Basado en Proyectos (ABP) de 6 semanas de duración diseñado para estudiantes de 4° de Secundaria, que articula Ciencia y Tecnología, Matemática, Educación para el Trabajo (EPT) y Comunicación para diseñar e implementar un sistema de biohuerto con riego tecnificado por goteo y compostaje orgánico.",
        sections: [
          {
            title: "Identidad del Proyecto y Situación Desafiante Auténtica",
            narrative: "En la Institución Educativa República del Perú, los espacios verdes se encuentran degradados por falta de agua constante y suelo erosionado. Al mismo tiempo, los estudiantes adquieren productos agrícolas de origen incierto y costoso. Ante este desafío, el equipo docente plantea la pregunta motriz: ¿Cómo podemos transformar un área baldía de nuestra escuela en un modelo de biohuerto autosostenible tecnificado que sirva como laboratorio vivo y fuente de alimentos saludables?",
            key_points: [
              "Pregunta motriz: ¿Cómo diseñar e implementar un biohuerto tecnificado con riego automatizado de bajo costo para fortalecer la seguridad alimentaria y el aprendizaje vivencial?",
              "Duración: 6 semanas (30 horas pedagógicas distribuidas en 4 áreas curriculares).",
              "Destinatarios: 4° de Secundaria (Secciones A y B - 60 estudiantes organizados en 12 equipos cooperativos).",
            ],
          },
          {
            title: "Matriz de Propósitos de Aprendizaje y Competencias Interdisciplinarias CNEB",
            narrative: "Articulación curricular entre las cuatro áreas participantes con sus respectivas evidencias articuladas:",
            key_points: [
              "Ciencia y Tecnología: 'Diseña y construye soluciones tecnológicas para resolver problemas de su entorno' (Prototipo de riego por goteo por gravedad con materiales reciclados y compostera aeróbica).",
              "Matemática: 'Resuelve problemas de forma, movimiento y localización' (Cálculo de áreas de cultivo, pendiente de tuberías, volumen de agua en tanques y escalas topográficas).",
              "Educación para el Trabajo: 'Gestiona proyectos de emprendimiento económico o social' (Presupuesto de materiales, análisis de costos, plan de siembra y modelo Canvas de distribución de hortalizas).",
              "Comunicación: 'Se comunica oralmente en su lengua materna' (Pitch de presentación del proyecto y elaboración de una bitácora científica ilustrada).",
              "Enfoques Transversales: Enfoque Ambiental (gestión de residuos sólidos y recursos hídricos) y Búsqueda de la Excelencia (innovación y mejora continua).",
            ],
          },
          {
            title: "Ruta Metodológica y Secuencia de Fases ABP",
            narrative: "Desarrollo secuencial organizado en 5 fases de aprendizaje auténtico:",
            key_points: [
              "Fase 1 - Inmersión y Diagnóstico (Semana 1): Análisis del suelo escolar, toma de muestras de pH y entrevistas a técnicos del MIDAGRI.",
              "Fase 2 - Ideación y Modelado Técnico (Semana 2): Planos acotados del terreno, diseño del circuito de tuberías y cotización de insumos locales.",
              "Fase 3 - Construcción y Montaje (Semanas 3-4): Nivelación de bancales, instalación de mangueras de goteo, armado de compostera y semillero.",
              "Fase 4 - Experimentación y Registro Fenológico (Semana 5): Monitoreo diario de humedad, tasa de crecimiento foliar y calibración de caudal.",
              "Fase 5 - Evaluación y Feria Tecnológica (Semana 6): Cosecha comunitaria, degustación culinaria y sustentación pública.",
            ],
          },
          {
            title: "Roles del Equipo Docente, Estudiantes y Alianzas Estratégicas",
            narrative: "Organización operativa y sinergia comunitaria para asegurar la sostenibilidad:",
            key_points: [
              "Equipo Docente: Reuniones semanales de trabajo colegiado (GIA) para sincronizar avances y criterios compartidos.",
              "Equipos de Estudiantes: Roles rotativos de Coordinador de Proyecto, Responsable Técnico, Encargado de Bitácora y Gestor de Recursos.",
              "Aliados Estratégicos: Municipalidad Provincial (donación de compost y plantones), APAFA y posta médica.",
            ],
          },
          {
            title: "Sistema de Evaluación Formativa y Criterios Integrados",
            narrative: "Monitoreo del desempeño a través de rúbricas analíticas interdisciplinarias y portafolio digital:",
            key_points: [
              "Criterio CyT: Justifica la funcionalidad del prototipo de riego y evalúa su eficiencia en el ahorro hídrico (Rúbrica de Solución Tecnológica).",
              "Criterio Matemática: Aplica fórmulas geométricas y conversiones de unidades volumétricas con precisión (Lista de Cotejo Técnica).",
              "Criterio EPT: Demuestra viabilidad económica y optimización de costos en el presupuesto del proyecto (Escala Valorativa).",
              "Criterio Comunicación: Argumenta con solvencia técnica y lenguaje formal durante la exposición (Rúbrica de Expresión Oral).",
            ],
          },
        ],
        teacher_recommendations: [
          "Planificar una visita de campo preliminar con los estudiantes para levantar el croquis del terreno antes de comprar materiales.",
          "Asegurar el mantenimiento del biohuerto durante los fines de semana mediante un rol consensuado de guardianía escolar voluntaria.",
          "Promover la sistematización de la experiencia para postular al concurso nacional de proyectos de innovación educativa (FONDEP).",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.planificamos/proyectos-integrados.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.planificamos/proyectos-integrados.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 20 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
