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
    name: 'adaptacion-nee-dua',
    url: 'http://127.0.0.1:5173/dashboard/planificamos/adaptacion-nee-dua',
    fileName: 'qa-21-adaptacion-nee-dua-preview.png',
    darkFileName: 'qa-21-adaptacion-nee-dua-dark.png',
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
        teacherName: "Prof. Manuel Cárdenas Vega / SAANEE",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Secundaria",
        grade: "2° de Secundaria",
        section: "A",
        curricularArea: "Atención a la Diversidad / DUA",
        student_name: "Mateo R. (14 años)",
        condition: "Trastorno del Espectro Autista (TEA Grado 1)",
        barriers: "Hipersensibilidad a ruidos intensos, sobrecarga sensorial ante consignas no estructuradas y ansiedad ante cambios de actividad imprevistos.",
        dua_engagement: "Horario visual anticipado, temporizador de pausas activas y temas de interés en astronomía y robótica.",
        dua_representation: "Guías en Arial 12 con interlineado amplio, diagramas de flujo y organizadores gráficos previos.",
        dua_expression: "Flexibilidad en formatos: infografías digitales, maquetas tridimensionales o micrograbaciones de audio.",
        performance_adjustments: "Fragmentación de tareas complejas en 3 microentregables con apoyo de fórmulas y tiempo adicional.",
        assessment_adjustments: "25% de tiempo adicional en pruebas escritas y ubicación preferencial en primera fila.",
        classroom_support: "Compañero tutor de apoyo y rincón de autorregulación sensorial con auriculares.",
        family_saanee_guidance: "Ambiente libre de distractores en el hogar y asesoramiento mensual del equipo SAANEE.",
      },
      artifact: {
        document_title: "Plan de Adaptación Curricular Inclusiva y Matriz DUA: Trastorno del Espectro Autista (TEA Grado 1) y Dificultades Específicas de Aprendizaje",
        executive_summary: "Documento técnico pedagógico de diversificación e inclusión educativa diseñado bajo los lineamientos del Diseño Universal para el Aprendizaje (DUA) y la RVM 222-2021-MINEDU, orientado a eliminar barreras de aprendizaje y garantizar la participación plena de estudiantes con NEE asociadas a TEA Grado 1 en el 2° grado de Educación Secundaria.",
        sections: [
          {
            title: "Caracterización del Estudiante, Fortalezas y Barreras para el Aprendizaje y la Participación (BAP)",
            narrative: "El estudiante Mateo R. (14 años) cursa el 2° grado de Secundaria. Posee un destacado rendimiento en razonamiento lógico-matemático y alta retención de detalles visuales y esquemáticos. Sin embargo, presenta barreras actitudinales y metodológicas en el aula regular debido a hipersensibilidad a ruidos intensos, sobrecarga ante consignas textuales extensas sin estructurar y dificultad para iniciar interacciones orales espontáneas en grupos numerosos.",
            key_points: [
              "Fortalezas: Gran capacidad de concentración en tareas estructuradas, habilidad para modelar gráficos y respeto estricto de normas explícitas.",
              "Barrera Sensorial: Intolerancia a ruidos imprevistos o bullicio que detona estados de ansiedad y desconexión.",
              "Barrera Cognitivo-Comunicativa: Fatiga cognitiva ante preguntas abiertas polisémicas o instrucciones no fragmentadas.",
              "Barrera Social: Tendencia al aislamiento durante trabajos en equipo no mediados por el docente.",
            ],
          },
          {
            title: "Matriz de Aplicación del Diseño Universal para el Aprendizaje (DUA)",
            narrative: "Ajustes sistemáticos en los tres principios rectores del DUA para beneficiar al estudiante y al grupo aula:",
            key_points: [
              "Principio I - Compromiso y Motivación: Implementación de un horario visual anticipado en la esquina de la pizarra; temporizador visual de 20 minutos de trabajo concentrado con pausas activas breves; selección de temas de indagación vinculados a su interés por la astronomía y la robótica.",
              "Principio II - Representación y Acceso a la Información: Entrega de guías de aprendizaje con tipografía clara (Arial 12 pt), doble interlineado, diagramas de flujo y organizadores visuales previos a la lectura de textos extensos; uso de resaltadores de color para identificar instrucciones clave.",
              "Principio III - Acción y Expresión del Aprendizaje: Flexibilidad en la entrega de productos de evaluación: opción de entregar infografías digitales, maquetas tridimensionales o audios breves en lugar de ensayos manuscritos monótonos.",
            ],
          },
          {
            title: "Adaptaciones Curriculares Específicas en Desempeños y Criterios CNEB",
            narrative: "Graduación pedagógica de la exigencia curricular sin comprometer el estándar de aprendizaje del Ciclo VI:",
            key_points: [
              "Área de Comunicación: En la competencia 'Escribe diversos tipos de textos', se fragmenta la consigna en 3 entregables intermedios (lluvia de ideas en mapa mental, primer borrador guiado por plantilla de conectores y versión final editada).",
              "Área de Matemática: En 'Resuelve problemas de cantidad', se autoriza el uso continuo de hojas de apoyo con fórmulas algebraicas y calculadora básica para reducir la carga en memoria de trabajo.",
              "Tiempo y Espacio: Se otorga un 25% adicional de tiempo durante las evaluaciones escritas y ubicación preferencial en la primera fila, lejos de puertas y ventanas ruidosas.",
            ],
          },
          {
            title: "Estrategias de Acompañamiento en el Aula y Tutoría entre Pares",
            narrative: "Dispositivos socioemocionales y de clima positivo en el aula inclusiva:",
            key_points: [
              "Tutoría entre pares: Designación voluntaria de dos compañeros tutores de confianza para facilitar el traspaso de apuntes y la mediación en dinámicas grupales.",
              "Espacio de Autorregulación Sensorial: Habilitación en el rincón del aula de un espacio tranquilo con auriculares con cancelación de ruido pasivo y tarjetas de respiración consciente.",
              "Contrato pedagógico conductual: Acuerdos claros y predecibles sobre señales discretas con la mano cuando el estudiante requiera una pausa.",
            ],
          },
          {
            title: "Articulación con la Familia, Equipo SAANEE y Monitoreo Psicopedagógico",
            narrative: "Protocolo de corresponsabilidad educativa familia-escuela-especialistas:",
            key_points: [
              "Pautas para el hogar: Mantener un espacio libre de distractores para el estudio, reforzar la agenda escolar nocturna y validar emocionalmente sus progresos diarios.",
              "Acompañamiento SAANEE: Reuniones mensuales de asesoramiento técnico al equipo docente para calibrar adaptaciones curriculares y materiales multisensoriales.",
              "Bitácora de progreso: Registro quincenal cualitativo de autonomía, participación oral y autorregulación emocional en el cuaderno de incidencias pedagógicas.",
            ],
          },
        ],
        teacher_recommendations: [
          "Anticipar verbalmente cualquier cambio en el horario habitual (visitas, simulacros, actos cívicos) con al menos 24 horas de antelación.",
          "Evitar exponer al estudiante a lecturas orales improvisadas en voz alta frente al aula; preferir lecturas compartidas o preparadas previamente.",
          "Socializar de forma discreta con el grupo de clase la importancia del respeto a los diferentes estilos y ritmos de aprendizaje bajo el Enfoque Inclusivo.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.planificamos/adaptacion-nee-dua.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.workflow.planificamos/adaptacion-nee-dua.v2.anonymous`, JSON.stringify(draft));
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
  console.log('Capture 21 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
