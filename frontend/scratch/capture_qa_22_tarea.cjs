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
    name: 'tarea-extension-hogar',
    url: 'http://127.0.0.1:5173/dashboard/planificamos/tarea-extension-hogar',
    fileName: 'qa-22-tarea-extension-preview.png',
    darkFileName: 'qa-22-tarea-extension-dark.png',
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
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "1° de Secundaria",
        section: "A",
        curricularArea: "Ciencia y Tecnología",
        task_title: "Registro de Hábitos de Consumo Energético Familiar",
        assigned_date: "2026-03-23",
        due_date: "2026-03-27",
        learning_purpose: "Registrar, analizar y calcular el consumo eléctrico de la vivienda para acordar compromisos de eficiencia energética en familia.",
        family_context: "Familias con artefactos básicos y acceso a recibo de luz mensual.",
        instructions: "Inventario de 4 artefactos, registro de horas por 3 días, cálculo en kWh y acta de acuerdos familiares.",
        materials: "Recibo de luz, cuaderno de CyT, regla y calculadora básica.",
        family_role: "Supervisar lectura técnica sin hacer los cálculos por el estudiante y firmar la bitácora de compromisos.",
        dua_adjustments: "Plantilla impresa de recibo modelo y entrega en formato manuscrito o video testimonial.",
        evidence: "Ficha de cálculo de consumo y acta de acuerdos familiares.",
        criteria: "Conversión a kW, registro de 3 días, cálculo en kWh y compromisos viables.",
        reflection: "¿Qué artefacto consume más y qué hábitos podemos modificar?",
        teacher_feedback: "Comparación en aula y registro en el cuaderno auxiliar de evaluación.",
      },
      artifact: {
        document_title: "Tarea de Extensión y Conexión con el Hogar: Registro de Hábitos de Consumo Energético Familiar",
        executive_summary: "Actividad de aprendizaje autónomo y vinculación familiar diseñada para 1° de Secundaria que articula Ciencia y Tecnología con Matemática, orientada a que los estudiantes registren, analicen y calculen el consumo eléctrico de su vivienda durante 3 días para acordar compromisos de eficiencia energética en familia bajo el enfoque CNEB.",
        sections: [
          {
            title: "Propósito de Aprendizaje y Vinculación Curricular CNEB",
            narrative: "Esta tarea de extensión busca transferir los conocimientos sobre energía y potencia eléctrica al contexto cotidiano del estudiante, promoviendo el uso responsable de los recursos energéticos y la colaboración intergeneracional.",
            key_points: [
              "Competencia CyT: 'Explica el mundo físico basándose en conocimientos sobre energía, materia y seres vivos'.",
              "Competencia Matemática: 'Resuelve problemas de cantidad' (operaciones con decimales y proporcionalidad directa en el costo de la energía eléctrica en soles por kWh).",
              "Competencia Transversal: 'Gestiona su aprendizaje de manera autónoma' (planifica su horario de registro nocturno y monitorea el cumplimiento de la consigna).",
              "Enfoque Transversal: Enfoque Ambiental (justicia y solidaridad intergeneracional frente al cambio climático).",
            ],
          },
          {
            title: "Consigna de Trabajo Autónomo Paso a Paso para el Estudiante",
            narrative: "Sigue detenidamente estos cuatro pasos para completar tu indagación familiar:",
            key_points: [
              "Paso 1 - Inventario de Artefactos (Día 1): Con autorización de un adulto, revisa las etiquetas posteriores de 4 electrodomésticos de tu hogar (refrigeradora, televisor, foco ahorrador, plancha) y anota su potencia nominal en watts (W). Convierte los watts a kilovatios (kW) dividiendo entre 1,000.",
              "Paso 2 - Registro de Horas de Uso (Días 1, 2 y 3): Observa y registra en tu tabla cuántas horas al día permanece encendido cada artefacto.",
              "Paso 3 - Cálculo del Consumo y Costo Estimado: Aplica la fórmula: Consumo (kWh) = Potencia (kW) × Horas de uso. Multiplica el total de kWh por la tarifa eléctrica que figura en el recibo de luz de tu localidad (aprox. S/ 0.85 por kWh).",
              "Paso 4 - Compromisos de Ahorro Familiar: Reúne a tu familia durante la cena y preséntales los resultados. Formulen juntos al menos 2 acuerdos prácticos para desconectar artefactos en 'modo vampiro' o sustituir focos incandescentes.",
            ],
          },
          {
            title: "Materiales Accesibles y Apoyos DUA en el Hogar",
            narrative: "Recursos sencillos sin necesidad de compras o impresiones obligatorias:",
            key_points: [
              "Materiales básicos: Cuaderno de trabajo de Ciencia y Tecnología, regla, lápiz y un recibo de luz reciente de la vivienda.",
              "Ajustes DUA (Acceso y Representación): Si el estudiante no cuenta con recibo físico, puede usar el modelo didáctico impreso facilitado por el docente.",
              "Ajustes DUA (Expresión): Los cálculos pueden realizarse en hoja manuscrita, en hoja de cálculo básica o mediante un video testimonial breve explicando los acuerdos familiares.",
            ],
          },
          {
            title: "Orientaciones y Rol Pedagógico de la Familia",
            narrative: "Pautas claras para acompañar a sus hijas e hijos sin sustituir su esfuerzo reflexivo:",
            key_points: [
              "Acompañar y supervisar: Guiar al estudiante durante la lectura de las etiquetas técnicas de los artefactos para evitar accidentes eléctricos.",
              "Estimular la autonomía: No resolver los cálculos matemáticos por el estudiante; formular preguntas orientadoras como: '¿Qué artefacto crees que gasta más y por qué?'.",
              "Firmar la bitácora: Suscribir conjuntamente el acta de acuerdos familiares al culminar la actividad como respaldo formativo.",
            ],
          },
          {
            title: "Criterios de Evaluación y Autoevaluación Metacognitiva",
            narrative: "Instrumento para que el estudiante verifique sus logros antes de la entrega final:",
            key_points: [
              "Criterio 1: Identifiqué la potencia de al menos 4 artefactos y realicé la conversión matemática correcta a kW.",
              "Criterio 2: Registré sistemáticamente las horas de uso durante los tres días consecutivos de indagación.",
              "Criterio 3: Calculé el consumo total en kWh y estimé el costo económico aproximado en la moneda local.",
              "Criterio 4: Consensué con mi familia compromisos concretos y viables para reducir el desperdicio de energía eléctrica.",
            ],
          },
        ],
        teacher_recommendations: [
          "Dedicar los primeros 10 minutos de la sesión siguiente a que los estudiantes comparen en grupos pequeños sus estimaciones de consumo.",
          "Destacar aquellos acuerdos familiares creativos que demuestren un impacto directo en la reducción de la huella de carbono del hogar.",
          "Registrar el nivel de cumplimiento y calidad reflexiva en el registro auxiliar formativo del área.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.planificamos/tarea-extension-hogar.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.planificamos/tarea-extension-hogar.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 22 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
