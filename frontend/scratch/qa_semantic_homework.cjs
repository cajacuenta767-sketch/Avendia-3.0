const os = require("os");
const path = require("path");
const puppeteer = require("puppeteer-core");

const BASE_URL = "http://127.0.0.1:5173";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const artifact = {
  document_title: "Investigamos el consumo responsable en casa",
  executive_summary: "Reconocer decisiones de consumo responsable mediante observación, comparación y una propuesta familiar concreta.",
  sections: [
    {
      title: "Propósito",
      narrative: "Relacionar hábitos cotidianos con el cuidado del ambiente.",
      key_points: ["Observar", "Comparar", "Proponer"],
    },
  ],
  teacher_recommendations: [
    "Valorar la explicación del estudiante antes que la presentación estética.",
    "Permitir respuesta oral o mediante dibujos cuando sea necesario.",
  ],
  activity: {
    mode: "ficha_hogar",
    title: "Mi hogar responsable",
    instructions: "Realiza las actividades con objetos disponibles. Tu familia puede orientarte, pero las respuestas deben ser tuyas.",
    items: [
      {
        id: "item-1",
        prompt: "Observa tres productos del hogar y anota de qué material está hecho cada envase.",
        answer: "Registra tres productos reales y el material de cada envase.",
        hint: "Busca plástico, vidrio, metal, cartón u otro material.",
        options: ["Cuaderno", "Lápiz"],
      },
      {
        id: "item-2",
        prompt: "Compara los tres envases y explica cuál podría reutilizarse con mayor facilidad y por qué.",
        answer: "Elige un envase y justifica la decisión con una característica observable.",
        hint: "Considera resistencia, tamaño, limpieza y seguridad.",
        options: ["Productos disponibles en casa"],
      },
      {
        id: "item-3",
        prompt: "Propón una acción familiar posible para reducir uno de los residuos que observaste.",
        answer: "Formula una acción específica, realizable y relacionada con un residuo observado.",
        hint: "Empieza con un verbo: reutilizar, separar, evitar o reemplazar.",
        options: ["Hoja opcional para dibujo"],
      },
    ],
    word_bank: [],
  },
  tables: [],
  model: "qa-local",
  contract_version: "2026.09",
  generation_brief: "Ficha de tarea de extensión y hogar resoluble por el estudiante.",
  quality_checks: [
    { code: "activity", label: "Actividades resolubles", passed: true, severity: "P0", detail: "Tres consignas con producto esperado." },
  ],
  quality_status: "ready",
  warnings: [],
  suggested_next_tools: ["lista-cotejo"],
};

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', "admin@avendia.edu.pe");
  await page.type('input[name="password"]', "Admin123456!");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => undefined),
    page.click("button.login-submit"),
  ]);
}

async function seed(page) {
  await page.evaluate((seedArtifact) => {
    const rawUser = sessionStorage.getItem("avendia.user");
    const user = JSON.parse(rawUser || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");
    const draft = {
      version: 2,
      values: {
        institution: "I.E. Avendia Demo",
        modality: "EBR — Educación Básica Regular",
        level: "Primaria",
        grade: "4.º de primaria",
        section: "A",
        curricular_area: "Ciencia y Tecnología",
      },
      currentStep: 4,
      artifact: seedArtifact,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`avendia.draft.workflow.planificamos/tarea-extension-hogar.v2.${scope}`, JSON.stringify(draft));
    localStorage.setItem("avendia.draft.workflow.planificamos/tarea-extension-hogar.v2.anonymous", JSON.stringify(draft));
  }, artifact);
}

async function inspect(page, label) {
  const studentMetrics = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      viewport: { width: innerWidth, height: innerHeight },
      pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      sheetOverflow: [...document.querySelectorAll(".homework-sheet")].some((node) => node.scrollWidth > node.clientWidth + 1),
      activities: document.querySelectorAll(".homework-task").length,
      responseAreas: document.querySelectorAll(".homework-task__response-label").length,
      hasExpectedAnswerLeak: text.includes("Registra tres productos reales"),
      hasStudentHeading: text.includes("Ahora resuelve"),
    };
  });

  const teacherButton = await page.evaluateHandle(() => (
    [...document.querySelectorAll("button")].find((button) => button.textContent?.includes("Guía docente")) || null
  ));
  if (!(await teacherButton.evaluate((button) => Boolean(button)))) throw new Error("No se encontró la pestaña Guía docente");
  await teacherButton.evaluate((button) => button.click());
  await new Promise((resolve) => setTimeout(resolve, 150));
  const teacherMetrics = await page.evaluate(() => ({
    hasExpectedAnswers: document.body.innerText.includes("Producto o respuesta esperada"),
    expectedAnswerCount: document.querySelectorAll(".homework-sheet__teacher-guide article").length,
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));

  const screenshot = path.join(os.tmpdir(), `avendia-homework-${label}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  return { label, screenshot, student: studentMetrics, teacher: teacherMetrics };
}

async function run() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await login(page);
  await seed(page);
  await page.goto(`${BASE_URL}/dashboard/planificamos/tarea-extension-hogar`, { waitUntil: "networkidle0" });
  const desktop = await inspect(page, "desktop");

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: "networkidle0" });
  const mobile = await inspect(page, "mobile");

  await browser.close();
  const result = { desktop, mobile };
  const invalid = [desktop, mobile].some((entry) => (
    entry.student.pageOverflow
    || entry.student.sheetOverflow
    || entry.student.activities !== 3
    || entry.student.responseAreas !== 3
    || entry.student.hasExpectedAnswerLeak
    || !entry.student.hasStudentHeading
    || !entry.teacher.hasExpectedAnswers
    || entry.teacher.expectedAnswerCount !== 3
    || entry.teacher.pageOverflow
  ));
  console.log(JSON.stringify(result, null, 2));
  if (invalid) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
