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
    name: 'presentaciones-didacticas',
    url: 'http://127.0.0.1:5173/dashboard/recursos/presentaciones-didacticas',
    fileName: 'qa-10-presentaciones-preview.png',
    darkFileName: 'qa-10-presentaciones-dark.png',
  };

  console.log(`Processing ${item.name}...`);

  // Inyectar estado en localStorage
  await page.evaluate(() => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");

    const draft = {
      version: 1,
      activeStep: 3,
      form: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        modality: "EBR",
        level: "Primaria",
        grade: "5° de Primaria",
        curricularArea: "Ciencia y Tecnología",
        topic: "El Sistema Solar: Planetas Rocosos y Gigantes Gaseosos",
        competencies: [
          "Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo",
        ],
        slideCount: 5,
        visualStyle: "infografico",
        didacticPurpose: "Explicación teórica profunda y conceptualización",
        interactions: ["Preguntas de saberes previos y metacognición", "Preguntas de reflexión y debate"],
        sourceText: "",
      },
      result: {
        presentation_title: "El Sistema Solar y sus Planetas",
        learning_objective: "Identificar las características físicas, composición y orden orbital de los planetas rocosos y gaseosos del sistema solar.",
        slides: [
          {
            order: 1,
            type: "portada",
            title: "Viaje al Sistema Solar: Nuestro Hogar Cósmico",
            subtitle: "Descubriendo la estrella central y los mundos que giran a su alrededor",
            key_points: [
              "Ubicación en la galaxia Vía Láctea.",
              "Una estrella central (El Sol) y ocho planetas principales.",
              "Millones de asteroides, cometas y cuerpos menores en órbita.",
            ],
            highlighted_quote: "Conocer el universo nos permite valorar y proteger nuestro planeta Tierra.",
            speaker_notes: "Saludar cordialmente a los estudiantes. Lanzar la pregunta detonante: ¿Qué hace que los planetas no choquen entre sí ni se escapen hacia el espacio vacío?",
            visual_prompt: "Infografía panorámica del Sol brillante en el extremo izquierdo y las ocho órbitas elípticas en escala aproximada.",
            interactive_activity: "Lluvia de ideas: cada estudiante nombra un cuerpo celeste que recuerde y se anota en la pizarra.",
          },
          {
            order: 2,
            type: "desarrollo",
            title: "El Sol: Fuente de Luz y Gravedad",
            subtitle: "La estrella amarilla que mantiene unido todo nuestro sistema planetario",
            key_points: [
              "Compuesto principalmente de hidrógeno (74%) y helio (24%).",
              "Su colosal fuerza gravitacional gobierna el movimiento de todos los planetas.",
              "Proporciona la luz y radiación térmica fundamental para la fotosíntesis y la vida.",
            ],
            highlighted_quote: "El Sol concentra más del 99.8% de toda la masa del sistema solar.",
            speaker_notes: "Destacar que el Sol no es sólido como una roca, sino una gigantesca bola de plasma con reacciones de fusión nuclear en su núcleo.",
            visual_prompt: "Corte transversal esquemático del Sol mostrando el núcleo, la zona de radiación, la fotosfera y llamaradas solares.",
            interactive_activity: "Cálculo mental guiado: la luz solar tarda 8 minutos y 20 segundos en llegar a la Tierra.",
          },
          {
            order: 3,
            type: "desarrollo",
            title: "Planetas Rocosos o Interiores",
            subtitle: "Mercurio, Venus, Tierra y Marte: densidad sólida y superficies terrestres",
            key_points: [
              "Mercurio: el más cercano al Sol, sin atmósfera y con temperaturas extremas.",
              "Venus: atmósfera densa de dióxido de carbono con intenso efecto invernadero.",
              "Tierra: el único mundo con agua líquida superficial y vida comprobada.",
              "Marte: el 'planeta rojo' con volcanes gigantescos y hielo en sus polos.",
            ],
            highlighted_quote: "Tienen corteza rocosa sólida y están separados por el cinturón de asteroides.",
            speaker_notes: "Comparar por qué Venus es más caliente que Mercurio a pesar de estar más lejos del Sol (debido al efecto invernadero descontrolado).",
            visual_prompt: "Tabla comparativa visual con los 4 planetas rocosos a escala proporcional con sus diámetros y colores reales.",
            interactive_activity: "Mini-debate: ¿Qué recursos necesitaría el ser humano para establecer una colonia científica en Marte?",
          },
          {
            order: 4,
            type: "desarrollo",
            title: "Planetas Gaseosos y Helados",
            subtitle: "Júpiter, Saturno, Urano y Neptuno: mundos gigantescos sin superficie sólida",
            key_points: [
              "Júpiter: el coloso del sistema con su Gran Mancha Roja y más de 90 lunas.",
              "Saturno: famoso por su majestuoso sistema de anillos brillantes de hielo y roca.",
              "Urano: gigante helado que gira de lado sobre su eje inclinado 98 grados.",
              "Neptuno: el mundo más lejano, azotado por los vientos más veloces del sistema.",
            ],
            highlighted_quote: "No se puede pisar su suelo porque su atmósfera se vuelve cada vez más densa hasta fundirse con su núcleo líquido.",
            speaker_notes: "Explicar cómo Júpiter actúa como un 'escudo gravitatorio' que desvía muchos cometas que podrían amenazar a la Tierra.",
            visual_prompt: "Composición gráfica mostrando a Júpiter con sus lunas galileanas y Saturno con el corte de partículas de sus anillos.",
            interactive_activity: "Juego de pistas rápidas: el docente da una característica y los equipos adivinan el planeta en 5 segundos.",
          },
          {
            order: 5,
            type: "cierre",
            title: "Reflexión Final y Portafolio",
            subtitle: "Sintetizamos lo aprendido y valoramos la singularidad de la Tierra",
            key_points: [
              "Los planetas interiores son pequeños, densos y rocosos.",
              "Los planetas exteriores son masivos, gaseosos o helados y tienen anillos.",
              "La Tierra se encuentra en la 'zona de habitabilidad' perfecta.",
            ],
            highlighted_quote: "De los miles de planetas descubiertos, la Tierra es el único hogar que tenemos.",
            speaker_notes: "Guiar a los alumnos para que redacten su conclusión en su cuaderno de trabajo de Ciencia y Tecnología.",
            visual_prompt: "Infografía resumen en dos columnas con íconos de planetas rocosos a la izquierda y gigantes a la derecha.",
            interactive_activity: "Ticket de salida: cada estudiante escribe 2 diferencias clave entre planetas rocosos y gaseosos.",
          },
        ],
        model: "gemini-3.6-flash",
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`avendia.draft.presentaciones-didacticas.v1.${scope}`, JSON.stringify(draft));
    localStorage.setItem(`avendia.draft.presentaciones-didacticas.v1.anonymous`, JSON.stringify(draft));
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
  const shell = await page.$('.presentation-shell') || await page.$('main');
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
  const shellDark = await page.$('.presentation-shell') || await page.$('main');
  if (shellDark) {
    await shellDark.screenshot({ path: darkPath });
    console.log('Saved Dark screenshot successfully to:', darkPath);
  }

  await browser.close();
  console.log('Capture 10 completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
