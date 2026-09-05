const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[name="email"]', 'admin@avendia.edu.pe');
  await page.type('input[name="password"]', 'Admin123456!');
  await page.click('button.login-submit');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

  // evaluate draft
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
        level: "Secundaria",
        grade: "2° de Secundaria",
        section: "A",
        curricularArea: "Comunicación",
        topic: "Comprensión Lectora y Producción de Textos Argumentativos",
        resource_type: "Actividad",
        transversal_approach: "Bien común",
        learning_purpose: "Fortalecer la capacidad de identificar tesis, argumentos y redactar textos argumentativos.",
        available_resources: "Cuadernos de trabajo, lecturas modelo, rúbricas de evaluación formativa.",
      },
      artifact: {
        document_title: "Banco Curricular de Recursos Didácticos: Comprensión Lectora y Ensayos Argumentativos",
        executive_summary: "Compendio organizado y clasificado de recursos pedagógicos, lecturas modelo, organizadores gráficos y guías de escritura diseñado para fortalecer las competencias comunicativas y la argumentación crítica en estudiantes de 2° de Secundaria bajo el CNEB.",
        sections: [
          {
            title: "Catálogo de Recursos Pedagógicos Seleccionados",
            narrative: "El presente banco reúne materiales dosificados por nivel de complejidad para su aplicación en sesiones de aprendizaje y proyectos interdisciplinarios:",
            key_points: [
              "Fichas de lectura crítica: 5 textos argumentativos breves sobre ciudadanía ambiental y tecnología.",
              "Organizadores visuales: Plantillas de mapa de ideas, árbol de problemas y diagrama de tesis-argumentos.",
              "Guías de redacción paso a paso: Matrices de conectores lógicos de causa, consecuencia y oposición.",
              "Portafolio de evidencias: Fichas de autoevaluación y coevaluación para borradores intermedios.",
            ],
          },
          {
            title: "Matriz de Articulación Curricular y Desempeños",
            narrative: "Cada recurso del banco tributa directamente al desarrollo de los estándares de aprendizaje del Ciclo VI:",
            key_points: [
              "Competencia: Lee diversos tipos de textos en su lengua materna (identifica información explícita e infiere la postura del autor).",
              "Competencia: Escribe diversos tipos de textos en su lengua materna (adecúa el texto a la situación comunicativa y emplea vocabulario variado).",
              "Enfoque transversal: Orientación al bien común y Enfoque ambiental.",
            ],
          },
          {
            title: "Orientaciones de Adaptación DUA y Diversificación",
            narrative: "Estrategias para flexibilizar los materiales y asegurar la participación de todos los estudiantes del aula:",
            key_points: [
              "Principio 1 DUA (Múltiples formas de representación): Textos acompañados de infografías y glosarios explicativos contextualizados.",
              "Principio 2 DUA (Múltiples formas de acción y expresión): Opciones de entrega escrita, esquema gráfico o sustentación oral breve.",
              "Principio 3 DUA (Múltiples formas de implicación): Elección de temas de interés juvenil vinculados a su entorno comunitario.",
            ],
          },
        ],
        teacher_recommendations: [
          "Revisar la concordancia entre los objetivos de la sesión y el recurso seleccionado antes de su reproducción.",
          "Monitorear que el uso de plantillas de conectores no restrinja la creatividad ni la voz propia del estudiante.",
          "Registrar los resultados y adaptaciones exitosas en la bitácora pedagógica para su retroalimentación colegiada.",
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.workflow.recursos/banco-planificacion.v2.${scope}`, JSON.stringify(draft));
  });

  await page.goto('http://127.0.0.1:5173/dashboard/recursos/banco-planificacion', { waitUntil: 'networkidle0' });
  console.log('Current URL:', page.url());
  const h1 = await page.evaluate(() => document.querySelector('.word-paper-header h1')?.innerText || document.querySelector('h1')?.innerText);
  console.log('H1:', h1);

  await browser.close();
}

test().catch(console.error);
