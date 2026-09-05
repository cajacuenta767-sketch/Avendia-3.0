const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const ROOT = path.resolve(__dirname, "../..");
const REPO_ROOT = path.resolve(ROOT, "..");
const BASE_URL = process.env.AVENDIA_E2E_URL || "http://127.0.0.1:5173";
const API_URL = process.env.AVENDIA_E2E_API_URL || "http://127.0.0.1:8001/api/v1";
const OUTPUT_DIR = process.env.AVENDIA_RESPONSIVE_OUTPUT || path.join(REPO_ROOT, "audit", "responsive-57-2026-09");
const args = new Set(process.argv.slice(2));
const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
const mode = modeArg ? modeArg.split("=")[1] : "results";
const updateBaseline = args.has("--update-baseline");
const routeFilter = process.env.AVENDIA_E2E_ROUTE || "";
const configuredViewports = process.env.AVENDIA_E2E_VIEWPORTS;
const theme = process.env.AVENDIA_E2E_THEME === "dark" ? "dark" : "light";
const configuredFontScale = Number(process.env.AVENDIA_E2E_FONT_SCALE || 100);
const focusSelector = process.env.AVENDIA_E2E_FOCUS_SELECTOR || "";
const preferredInteractionSelector = process.env.AVENDIA_E2E_INTERACTION_SELECTOR || "";
const fontScale = [87.5, 100, 112.5].includes(configuredFontScale) ? configuredFontScale : 100;

const VIEWPORTS = configuredViewports
  ? configuredViewports.split(",").map((item) => {
    const [width, height] = item.split("x").map(Number);
    return { name: `${width}x${height}`, width, height };
  })
  : [
    { name: "320x568", width: 320, height: 568 },
    { name: "390x844", width: 390, height: 844 },
    { name: "768x1024", width: 768, height: 1024 },
    { name: "1366x768", width: 1366, height: 768 },
    { name: "1920x1080", width: 1920, height: 1080 },
  ];

const AUTHORIZED_LOCAL_SCROLL = [
  ".puzzle-scroll",
  ".word-preview-viewport",
  ".word-table-responsive",
  ".word-letters-grid-wrapper",
  ".word-crossword-container",
  ".workflow-stepper",
  ".evaluation-stepper",
  ".evaluation-wizard__stepper",
  ".tool-stepper",
  ".presentation-stepper",
  ".rubric-preview__table-scroll",
  ".admin-table-scroll",
  ".month-grid",
];

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) throw new Error("No se encontró Chrome/Edge. Define CHROME_PATH.");
  return found;
}

function toolRoutes() {
  const source = fs.readFileSync(path.join(ROOT, "src", "config", "tools.ts"), "utf8");
  const routes = [];
  const matcher = /tool\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/g;
  for (const match of source.matchAll(matcher)) {
    routes.push({ module: match[1], id: match[2], title: match[3], route: `/dashboard/${match[1]}/${match[2]}` });
  }
  return routes.filter((item) => !routeFilter || item.route.includes(routeFilter));
}

function activityFor(toolId) {
  const words = [
    "RESPONSABILIDAD", "INTERCULTURALIDAD", "BIODIVERSIDAD", "SOSTENIBILIDAD", "PARTICIPACION",
    "COMUNICACION", "INVESTIGACION", "COLABORACION", "CREATIVIDAD", "PENSAMIENTO",
    "APRENDIZAJE", "EVALUACION", "COMPETENCIA", "CAPACIDAD", "DESEMPENO",
    "EVIDENCIA", "RETROALIMENTACION", "INCLUSION", "AUTONOMIA", "CONVIVENCIA",
    "CIUDADANIA", "TECNOLOGIA", "MATEMATICA", "LITERATURA", "GEOGRAFIA",
    "HISTORIA", "CIENCIA", "TUTORIA", "BIENESTAR", "EDUCACION",
  ];
  const modes = {
    "tarjetas-estudio": "tarjetas",
    ahorcado: "ahorcado",
    "completa-frase": "completar",
    "emparejar-palabras": "emparejar",
    crucigramas: "crucigrama",
    "sopas-letras": "sopa",
  };
  const selected = toolId === "sopas-letras" ? words : words.slice(0, toolId === "crucigramas" ? 18 : 8);
  return {
    mode: modes[toolId] || "recurso",
    title: `Actividad responsive de ${toolId}`,
    instructions: "Revisa, interactúa y comprueba este recurso de máxima densidad sin perder información ni acciones.",
    word_bank: selected,
    items: selected.map((answer, index) => ({
      id: String(index + 1),
      prompt: `Consigna extensa ${index + 1}: relaciona este concepto con una situación auténtica del contexto educativo y explica su importancia.`,
      answer,
      hint: `Pista pedagógica detallada para el concepto ${answer}.`,
      options: [answer, "DISTRACTOR UNO", "DISTRACTOR DOS"],
    })),
  };
}

function artifactFor(item) {
  const columns = Array.from({ length: 12 }, (_, index) => `Criterio ${index + 1}`);
  const rows = Array.from({ length: 14 }, (_, row) => columns.map((_, col) => `Evidencia extensa ${row + 1}.${col + 1}`));
  return {
    document_title: `${item.title}: resultado completo para control responsive multidispositivo`,
    executive_summary: "Resultado determinista de alta densidad para comprobar que títulos, acciones, cuadrículas, tablas y recomendaciones permanecen visibles y utilizables.",
    sections: Array.from({ length: 5 }, (_, index) => ({
      title: `Sección pedagógica extensa ${index + 1}`,
      narrative: "Contenido de prueba suficientemente largo para provocar saltos de línea reales sin truncamiento, solapamientos ni pérdida de contexto durante la revisión docente.",
      key_points: Array.from({ length: 5 }, (_, point) => `Orientación ${point + 1} de la sección ${index + 1} con texto representativo.`),
    })),
    teacher_recommendations: Array.from({ length: 8 }, (_, index) => `Recomendación docente ${index + 1} con seguimiento y evidencia verificable.`),
    tables: [{ title: "Matriz de máxima densidad", columns, rows, note: "La tabla debe desplazarse dentro de su contenedor." }],
    activity: activityFor(item.id),
    model: "fixture-responsive-v1",
    quality_status: "ready",
    quality_checks: [],
  };
}

const RESTORED_EVALUATION_IDS = new Set([
  "ficha-aprendizaje",
  "preguntas-texto",
  "ficha-observacion",
  "registros-auxiliares",
  "carpetas-recuperacion",
]);

function restoredEvaluationFixture(toolId) {
  const frame = {
    teacher_name: "Docente de Control Responsive",
    institution_name: "Institución Educativa Intercultural de Nombre Extraordinariamente Extenso",
    modality: "EBR",
    education_level: "Secundaria",
    grade_or_cycle: "3° de Secundaria",
    section: "A",
    curricular_area: "Ciencia y Tecnología",
  };
  const selection = { mode: "multiple", rosterId: "responsive-roster", studentIds: ["student-1", "student-2"] };
  const base = { id: `responsive-${toolId}`, revision: 1, status: "generated", roster_id: "responsive-roster", participants: [{ student_id: "student-1", sort_order: 0 }, { student_id: "student-2", sort_order: 1 }], criteria: [], records: [], sources: [] };
  if (toolId === "ficha-aprendizaje" || toolId === "preguntas-texto") {
    const artifact = artifactFor({ id: toolId, module: "evaluamos", title: toolId === "preguntas-texto" ? "Preguntas sobre texto" : "Ficha de aprendizaje" });
    return {
      ...base,
      kind: toolId === "preguntas-texto" ? "text_questions" : "learning_sheet",
      title: artifact.document_title,
      general_data: { frame, title: artifact.document_title, text_type: "Expositivo", source: { pasted_text: "Texto fuente extenso sobre biodiversidad, evidencias científicas y acciones sostenibles de la comunidad.", sources: [], reading_text_size: "medium", question_text_size: "medium" } },
      settings: { literal_count: 5, inferential_count: 5, critical_count: 5, cneb_capacities: "Obtiene, infiere y reflexiona sobre información.", question_format: "Mixtas", dua_adjustments: "Instrucciones segmentadas y palabras clave.", criteria: "Interpreta evidencias y sustenta conclusiones.", feedback_guidance: "Formula preguntas de apoyo antes de mostrar la respuesta.", worksheet_type: "Práctica guiada", activity_count: 10, difficulty: "Desafiante", purpose: "Aplicar conceptos científicos en una situación auténtica.", instructions: "Lee, resuelve y explica el procedimiento.", generated_artifact: artifact },
    };
  }
  if (toolId === "ficha-observacion") return { ...base, kind: "observation", title: "Ficha de observación de desempeño", general_data: { frame, mode: "multiple", selection, observed_date: "2026-09-05", observed_time: "09:00", situation: "Trabajo colaborativo de investigación", focus: "Argumentación basada en evidencias", scale_type: "Descriptiva", criteria: [{ client_key: "criterion-1", title: "Explica sus decisiones con evidencias observables." }, { client_key: "criterion-2", title: "Escucha, contrasta y mejora su propuesta." }], common_notes: "El grupo comparó evidencias y explicó sus decisiones.", individual_notes: { "student-1": "Sustenta con dos evidencias.", "student-2": "Formula preguntas pertinentes." }, context_factors: "Material visual y roles definidos.", interpretation: "La pauta favoreció una argumentación más precisa.", conclusion: "El grupo progresa y necesita contrastar fuentes.", commitments: "Revisar nuevas evidencias en la siguiente sesión." }, settings: {} };
  if (toolId === "registros-auxiliares") return { ...base, kind: "auxiliary_record", title: "Registro auxiliar del I bimestre", general_data: { frame, selection, period: "Bimestre 1", competencies: "Indaga mediante métodos científicos para construir conocimientos.", criteria: "Formula preguntas investigables.\nAnaliza datos y comunica conclusiones.", evidence: "Informe de investigación y exposición", attendance_date: "2026-09-05", attendance: { "student-1": "P", "student-2": "T" }, attendance_observations: "Registro de máxima densidad.", in_progress_conclusions: "Requiere vincular datos con conclusiones.", achieved_conclusions: "Explica procedimientos y comunica resultados.", individual_conclusions: { "student-1": "Progresa en análisis.", "student-2": "Comunica con claridad." } }, settings: {} };
  const recoveryArtifact = artifactFor({ id: toolId, module: "evaluamos", title: "Carpeta de recuperación" });
  return { ...base, kind: "recovery", title: "Carpeta de recuperación del I bimestre", general_data: { frame, selection_mode: "multiple", selection, application_period: "Bimestre 1", diagnosis: "Necesita fortalecer la interpretación de evidencias.", prioritized_competencies: "Indaga y explica el mundo físico.", criteria: "Relaciona datos, evidencia y conclusión.", expected_evidence: "Informe corregido y sustentación breve.", activity_route: "Activación, modelado, práctica guiada, aplicación y metacognición.", resources: "Fuentes visuales, organizador y lista de verificación.", timeline: "Dos sesiones y una revisión individual.", family_guidance: "Acompañar la lectura sin resolver las consignas.", general_followup: "Comparar la evidencia inicial y final.", individual_followup: { "student-1": "Andamiaje visual.", "student-2": "Pregunta de profundización." }, artifact: recoveryArtifact }, settings: { generated_artifact: recoveryArtifact } };
}

async function healthCheck() {
  const checks = [];
  for (const url of [`${BASE_URL}/login`, `${API_URL}/health`, `${API_URL}/ready`]) {
    try {
      const response = await fetch(url);
      checks.push({ url, ok: response.ok, status: response.status });
    } catch (error) {
      checks.push({ url, ok: false, status: 0, error: String(error) });
    }
  }
  return checks;
}

async function preparePage(browser, viewport) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 });
  const sessionUser = {
    id: "responsive-teacher",
    email: "docente.fixture@avendia.invalid",
    full_name: "Docente de Control Responsive",
    school_name: "Institución Educativa Intercultural de Nombre Extraordinariamente Extenso",
    dre: "DRE CONTROL",
    ugel: "UGEL CONTROL",
    director_name: "Dirección de Prueba",
    education_modality: "EBR",
    education_level: "Secundaria",
    grade: "3° de Secundaria",
    curricular_area: "Ciencia y Tecnología",
    section: "A",
    school_year: 2026,
    role: "teacher",
    ai_credits_balance: 10000,
  };
  await page.evaluateOnNewDocument((user, selectedTheme, selectedFontScale) => {
    sessionStorage.setItem("avendia.accessToken", "responsive-fixture-token");
    sessionStorage.setItem("avendia.user", JSON.stringify(user));
    localStorage.setItem("avendia.theme", selectedTheme);
    localStorage.setItem("avendia.fontScale", String(selectedFontScale));
  }, sessionUser, theme, fontScale);
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = request.url();
    const pathname = new URL(url).pathname;
    if (!url.startsWith(API_URL) && !pathname.startsWith("/api/v1/")) return request.continue();
    const corsHeaders = {
      "Access-Control-Allow-Origin": BASE_URL,
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
    };
    if (request.method() === "OPTIONS") return request.respond({ status: 204, headers: corsHeaders });
    if (pathname.endsWith("/ai/tools/field-assist/preferences")) {
      return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ consent: false, assistance_mode: "complete", preferred_length: "balanced" }) });
    }
    if (pathname.endsWith("/users/me/experience-preferences")) {
      return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ guided_mode: true, comfortable_spacing: true, always_show_help: true, read_aloud: false, reduced_motion: false, remember_recent_context: true, last_context: {} }) });
    }
    if (pathname.endsWith("/users/me/workspace-preferences")) {
      return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ schema_version: 1, migrated_from_local: true, theme, font_scale: fontScale, sidebar_collapsed: false, context_panel_open: true, favorite_tools: [], recent_tools: [], home_academic_level: "Secundaria", daily_phrase: "Hoy es un buen día para crear.", calendar_reference_ids: [], calendar_blocks: {} }) });
    }
    if (pathname.endsWith("/templates")) return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: "[]" });
    if (pathname.endsWith("/users/me")) return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify(sessionUser) });
    if (pathname.endsWith("/dashboard/overview")) return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ document_count: 0, recent_documents: [], most_used_tool_ids: [], notifications: [], generated_at: new Date().toISOString() }) });
    if (pathname.endsWith("/rosters")) return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ items: [], total: 0 }) });
    if (pathname.includes("/rosters/responsive-roster/students")) return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify([{ id: "student-1", roster_id: "responsive-roster", full_name: "Ana Quispe Ramos", sort_order: 0, active: true }, { id: "student-2", roster_id: "responsive-roster", full_name: "Bruno Flores Soto", sort_order: 1, active: true }]) });
    const restoredMatch = pathname.match(/\/evaluation-instruments\/responsive-([^/]+)\/draft$/);
    if (restoredMatch) return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify(restoredEvaluationFixture(restoredMatch[1])) });
    if (pathname.endsWith("/evaluation-instruments")) return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: "[]" });
    if (pathname.endsWith("/notifications")) return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ items: [], total: 0, page: 1, pages: 1, unread: 0 }) });
    if (pathname.endsWith("/documents")) return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: "[]" });
    if (pathname.endsWith("/calendar/events")) return request.respond({ status: 200, headers: corsHeaders, contentType: "application/json", body: "[]" });
    return request.continue();
  });
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.evaluate((user, selectedTheme, selectedFontScale) => {
    sessionStorage.setItem("avendia.accessToken", "responsive-fixture-token");
    sessionStorage.setItem("avendia.user", JSON.stringify(user));
    localStorage.setItem("avendia.theme", selectedTheme);
    localStorage.setItem("avendia.fontScale", String(selectedFontScale));
  }, sessionUser, theme, fontScale);
  return page;
}

async function seedGenericResult(page, item) {
  const stepCount = await page.$$eval(".workflow-stepper button", (buttons) => buttons.length);
  if (!stepCount) return { seeded: false, reason: "specialized-tool" };
  await page.evaluate(({ key, currentStep, artifact }) => {
    const values = {
      modality: "EBR — Educación Básica Regular",
      level: "Secundaria",
      grade: "3° de Secundaria",
      curricular_area: "Ciencia y Tecnología",
      teacher_name: "Docente de Control Responsive",
      institution: "Institución Educativa Intercultural de Nombre Extraordinariamente Extenso",
      school_year: "2026",
      topic: "Aprendizaje sostenible, ciudadanía y participación responsable",
      planned_use: "Antes, durante y después de la clase con preguntas de reflexión y verificación de fuente.",
      word_count: "30",
      difficulty: "Avanzada con palabras inversas",
    };
    const draft = { version: 2, values, currentStep, artifact, updatedAt: new Date().toISOString() };
    localStorage.setItem(`avendia.draft.workflow.${key}.v2.responsive-teacher`, JSON.stringify(draft));
    localStorage.setItem(`avendia.workflow.${key}.responsive-teacher`, JSON.stringify(draft));
  }, { key: `${item.module}/${item.id}`, currentStep: stepCount - 1, artifact: artifactFor(item) });
  await page.reload({ waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((resolve) => setTimeout(resolve, 250));
  return { seeded: true };
}

async function seedSpecializedResult(page, item) {
  const scope = "responsive-teacher";
  const commonForm = {
    teacherName: "Docente de Control Responsive",
    institution: "Institución Educativa Intercultural de Nombre Extraordinariamente Extenso",
    modality: "EBR",
    level: "Secundaria",
    grade: "3° de Secundaria",
    curricularArea: "Ciencia y Tecnología",
  };
  const today = new Date().toISOString().slice(0, 10);
  const fixtures = {
    "recursos/agrupar-palabras": {
      key: `avendia.draft.agrupar-palabras.v1.${scope}`,
      value: {
        version: 1,
        form: { ...commonForm, topic: "Clasificación de seres vivos y ecosistemas", categoryCount: 4 },
        result: {
          activity_title: "Clasificamos conceptos científicos",
          instructions: "Ubica cada palabra en la categoría que corresponda y explica oralmente el criterio usado.",
          categories: Array.from({ length: 4 }, (_, index) => ({ id: `category-${index + 1}`, name: `Categoría científica ${index + 1}`, explanation: `Criterio observable y suficientemente descriptivo para la categoría ${index + 1}.` })),
          words: Array.from({ length: 24 }, (_, index) => ({ id: `word-${index + 1}`, word: `Concepto ${index + 1}`, correct_category_id: `category-${(index % 4) + 1}` })),
          model: "fixture-responsive-v1",
        },
      },
    },
    "recursos/ordenar-bloques": {
      key: `avendia.draft.ordenar-bloques.v1.${scope}`,
      value: {
        version: 1,
        form: { ...commonForm, sequenceType: "Proceso científico o natural", topic: "Método científico para investigar el agua", stepCount: 8 },
        result: {
          activity_title: "Ordenamos una investigación científica",
          instructions: "Reordena todos los bloques hasta reconstruir el proceso y justifica la relación entre cada paso.",
          pedagogical_rationale: "La secuenciación permite reconocer relaciones causales y verificar el razonamiento científico.",
          blocks: Array.from({ length: 8 }, (_, index) => ({ id: `block-${index + 1}`, correct_order: index + 1, text: `Paso científico ${index + 1} con una explicación extensa para comprobar el ajuste del contenido.`, hint: `Pista verificable del paso ${index + 1}.` })),
          model: "fixture-responsive-v1",
        },
      },
    },
    "recursos/presentaciones-didacticas": {
      key: `avendia.draft.presentaciones-didacticas.v1.${scope}`,
      value: {
        version: 1,
        activeStep: 4,
        updatedAt: new Date().toISOString(),
        form: { ...commonForm, slideCount: 8, visualStyle: "alto_contraste", topic: "Biodiversidad y sostenibilidad", competencies: ["Indaga mediante métodos científicos"], didacticPurpose: "Introducción a un nuevo tema / Motivación inicial", interactions: ["Preguntas de reflexión y debate"] },
        result: {
          presentation_title: "Biodiversidad y sostenibilidad de nuestra comunidad",
          learning_objective: "Analizar evidencias y proponer acciones responsables para proteger la biodiversidad local.",
          model: "fixture-responsive-v1",
          slides: Array.from({ length: 8 }, (_, index) => ({ order: index + 1, type: index === 0 ? "portada" : index === 7 ? "cierre" : "contenido", title: `Diapositiva pedagógica ${index + 1} con título de máxima densidad`, subtitle: "Contexto local, evidencia y acción", key_points: Array.from({ length: 5 }, (_, point) => `Idea clave ${point + 1} con contenido que debe conservarse completo.`), highlighted_quote: "Cuidar la diversidad es cuidar nuestras posibilidades de futuro.", interactive_activity: "Dialoga, registra una evidencia y propone una acción concreta.", speaker_notes: "Acompaña la observación con preguntas abiertas y tiempo de reflexión.", visual_prompt: "Biodiversidad andina y estudiantes investigando" })),
        },
      },
    },
    "evaluamos/lista-cotejo": {
      key: `avendia.evaluations.checklist.v1.${scope}`,
      value: {
        version: 1,
        general: { ...commonForm, directorName: "Dirección de Prueba", area: commonForm.curricularArea, activity: "Explicación de una investigación científica", date: today, period: "I bimestre" },
        selection: null,
        responseScale: "yes_no_progress",
        criteria: Array.from({ length: 8 }, (_, index) => ({ id: `criterion-${index + 1}`, code: `C${index + 1}`, description: `Criterio observable ${index + 1} con redacción pedagógica completa.` })),
        records: [],
        generalObservation: "La matriz debe conservar encabezados, criterios y acciones en todos los dispositivos.",
        currentStep: 3,
        updatedAt: new Date().toISOString(),
      },
    },
  };
  if (item.id === "rubrica-evaluacion" || item.id === "calificador-rubrica") {
    const levels = [
      { id: "level-ad", code: "AD", label: "Logro destacado", score: 4 },
      { id: "level-a", code: "A", label: "Logro esperado", score: 3 },
      { id: "level-b", code: "B", label: "En proceso", score: 2 },
      { id: "level-c", code: "C", label: "En inicio", score: 1 },
    ];
    fixtures[`evaluamos/${item.id}`] = {
      key: `avendia.evaluations.rubric.v1.${scope}`,
      value: {
        version: 1,
        rubricType: "analytic",
        weighted: false,
        general: { ...commonForm, area: commonForm.curricularArea, competence: "Indaga mediante métodos científicos", performance: "Sustenta conclusiones usando evidencias pertinentes.", context: "Investigación escolar sobre el agua", evidenceTitle: "Informe y exposición de resultados", date: today },
        selection: null,
        levels,
        criteria: Array.from({ length: 6 }, (_, index) => ({ id: `criterion-${index + 1}`, code: `C${index + 1}`, title: `Criterio de evaluación ${index + 1}`, description: `Descripción observable y verificable del criterio ${index + 1}.`, weight: null, descriptors: Object.fromEntries(levels.map((level) => [level.id, `${level.label}: descriptor diferenciado y completo para el criterio ${index + 1}.`])) })),
        assessments: [],
        currentStep: 3,
        activeStudentId: "",
        updatedAt: new Date().toISOString(),
      },
    };
  }
  const fixture = fixtures[`${item.module}/${item.id}`];
  if (fixture) {
    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), fixture);
    await page.reload({ waitUntil: "networkidle0", timeout: 30000 });
    await new Promise((resolve) => setTimeout(resolve, 250));
    return { seeded: true, strategy: "local-storage-fixture" };
  }
  const wizardSteps = await page.$$(".evaluation-wizard__stepper button");
  if (wizardSteps.length) {
    await wizardSteps[wizardSteps.length - 1].click();
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { seeded: true, strategy: "preview-step" };
  }
  return { seeded: false, reason: "unsupported-specialized-tool" };
}

async function seedResult(page, item) {
  const generic = await seedGenericResult(page, item);
  return generic.seeded ? generic : seedSpecializedResult(page, item);
}

async function inspectLayout(page) {
  return page.evaluate((authorizedSelectors) => {
    const root = document.documentElement;
    const viewportWidth = root.clientWidth;
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
    };
    const locallyScrollable = (element) => authorizedSelectors.some((selector) => element.closest(selector));
    const intentionallyOffCanvas = (element) => {
      const panel = element.closest(".sidebar, .gemini-drawer, .context-panel, .notifications-panel");
      if (!panel) return false;
      const panelRect = panel.getBoundingClientRect();
      return panelRect.right <= 1 || panelRect.left >= viewportWidth - 1;
    };
    const outside = [...document.querySelectorAll("body *")].filter((element) => {
      if (!visible(element) || locallyScrollable(element) || intentionallyOffCanvas(element)) return false;
      const rect = element.getBoundingClientRect();
      return rect.left < -1 || rect.right > viewportWidth + 1;
    }).slice(0, 25).map((element) => {
      const rect = element.getBoundingClientRect();
      return { tag: element.tagName, className: String(element.className || "").slice(0, 160), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
    });
    const clipped = [...document.querySelectorAll("body *")].filter((element) => {
      if (!visible(element) || locallyScrollable(element) || element.matches("input, textarea, select, [aria-hidden='true']")) return false;
      if (element.matches(".topbar__title strong")) return false;
      const style = getComputedStyle(element);
      return element.scrollWidth > element.clientWidth + 1 && ["hidden", "clip"].includes(style.overflowX);
    }).slice(0, 25).map((element) => ({
      tag: element.tagName,
      className: String(element.className || "").slice(0, 160),
      parentClassName: String(element.parentElement?.className || "").slice(0, 160),
      text: String(element.textContent || "").trim().slice(0, 180),
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    const localScroll = authorizedSelectors.flatMap((selector) => [...document.querySelectorAll(selector)].map((element) => ({ selector, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, scrollable: element.scrollWidth > element.clientWidth + 1 })));
    const wordTables = [...document.querySelectorAll(".word-preview-viewport .word-table")].map((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      complete: element.scrollWidth <= element.clientWidth + 1,
    }));
    const primary = document.querySelector(".workflow-primary, .evaluation-primary, button[type='submit']");
    const primaryRect = primary?.getBoundingClientRect();
    return {
      title: document.title,
      meaningful: document.body.innerText.trim().length > 80,
      global: { clientWidth: root.clientWidth, scrollWidth: root.scrollWidth, overflow: root.scrollWidth > root.clientWidth + 1 },
      outside,
      clipped,
      localScroll,
      wordTables,
      primary: primaryRect ? { visible: primaryRect.width > 0 && primaryRect.height > 0, width: Math.round(primaryRect.width), height: Math.round(primaryRect.height) } : null,
      resultVisible: Boolean(document.querySelector(".word-document-paper, .interactive-artifact, .checklist-preview, .rubric-preview, .presentation-download, .word-grouping-result-meta, .sequence-result-meta, .evaluation-preview")),
      overlay: Boolean(document.querySelector("vite-error-overlay, #webpack-dev-server-client-overlay, [data-nextjs-dialog-overlay]")),
    };
  }, AUTHORIZED_LOCAL_SCROLL);
}

async function exerciseInteraction(page) {
  const selectors = [
    ...(preferredInteractionSelector ? [preferredInteractionSelector] : []),
    ".word-preview-display-controls__modes button:nth-child(2)",
    ".wordsearch-grid button",
    ".crossword-grid input",
    ".study-card",
    ".resource-activity-card button",
    ".interactive-score button",
    ".word-grouping-result-meta + * button",
    ".sequence-editor-list button",
    ".workflow-primary",
  ];
  for (const selector of selectors) {
    const element = await page.$(selector);
    if (!element) continue;
    const box = await element.boundingBox();
    if (!box) continue;
    try {
      await element.click();
      return { exercised: true, selector };
    } catch (error) {
      return { exercised: false, selector, error: String(error) };
    }
  }
  return { exercised: false, reason: "no-interaction-found" };
}

function slug(value) {
  return value.replace(/^\//, "").replaceAll("/", "-").replace(/[^a-z0-9-]/gi, "-");
}

async function runCase(browser, item, viewport) {
  const page = await preparePage(browser, viewport);
  const consoleErrors = [];
  const failedRequests = [];
  const expectedAbortedRequests = [];
  const httpErrors = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) consoleErrors.push(message.text()); });
  page.on("requestfailed", (request) => {
    const failure = { url: request.url(), error: request.failure()?.errorText || "failed" };
    if (failure.error === "net::ERR_ABORTED") expectedAbortedRequests.push(failure);
    else failedRequests.push(failure);
  });
  page.on("response", (response) => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }); });
  const restoredQuery = RESTORED_EVALUATION_IDS.has(item.id) ? `?document=responsive-${item.id}` : "";
  const url = `${BASE_URL}${item.route}${restoredQuery}`;
  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    const seed = mode === "results" ? await seedResult(page, item) : { seeded: false, reason: "smoke-mode" };
    const interaction = await exerciseInteraction(page);
    const layout = await inspectLayout(page);
    if (focusSelector) {
      await page.$eval(focusSelector, (element) => element.scrollIntoView({ block: "start", inline: "nearest" }));
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    const folder = path.join(OUTPUT_DIR, "screenshots");
    fs.mkdirSync(folder, { recursive: true });
    const themeLabel = theme === "dark" ? "oscuro" : "claro";
    const file = `${slug(item.route)}-${mode}-${viewport.name}-${themeLabel}-font-${fontScale}.png`;
    await page.screenshot({ path: path.join(folder, file), fullPage: false });
    const passed = layout.meaningful
      && !layout.overlay
      && !layout.global.overflow
      && layout.outside.length === 0
      && layout.clipped.length === 0
      && layout.wordTables.every((table) => table.complete)
      && consoleErrors.length === 0
      && failedRequests.length === 0
      && httpErrors.length === 0
      && (mode !== "results" || (seed.seeded && layout.resultVisible));
    return { route: item.route, title: item.title, viewport: viewport.name, theme, fontScale, mode, passed, seed, interaction, layout, consoleErrors, failedRequests, expectedAbortedRequests, httpErrors, screenshot: `screenshots/${file}` };
  } catch (error) {
    return { route: item.route, title: item.title, viewport: viewport.name, mode, passed: false, error: String(error), consoleErrors, failedRequests, expectedAbortedRequests, httpErrors };
  } finally {
    await page.browserContext().close();
  }
}

function writeReport(results, health) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const summary = {
    generatedAt: new Date().toISOString(),
    browserPath: chromePath(),
    browserPlugin: "not-available; puppeteer-core fallback",
    baseUrl: BASE_URL,
    apiUrl: API_URL,
    mode,
    theme,
    fontScale,
    updateBaseline,
    health,
    total: results.length,
    passed: results.filter((item) => item.passed).length,
    failed: results.filter((item) => !item.passed).length,
    results,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, `resultados-${mode}.json`), JSON.stringify(summary, null, 2));
  const lines = [
    `# Resultados responsive · ${mode}`,
    "",
    `- Fecha: ${summary.generatedAt}`,
    `- Navegador: Puppeteer Core (${summary.browserPlugin})`,
    `- Casos: ${summary.total}; aprobados: ${summary.passed}; fallidos: ${summary.failed}`,
    "",
    "| Ruta | Viewport | Estado | Resultado visible | Overflow global | Evidencia |",
    "|---|---:|---|---|---|---|",
    ...results.map((item) => `| \`${item.route}\` | ${item.viewport} | ${item.passed ? "Aprobada" : "Fallida"} | ${item.layout?.resultVisible ? "Sí" : "No"} | ${item.layout?.global?.overflow ? "Sí" : "No"} | ${item.screenshot ? `[captura](${item.screenshot})` : "—"} |`),
    "",
    "## Fallos",
    "",
    ...results.filter((item) => !item.passed).map((item) => `- \`${item.route}\` · ${item.viewport}: ${item.error || `${item.layout?.outside?.length || 0} fuera de viewport; ${item.layout?.clipped?.length || 0} recortados; resultado=${Boolean(item.layout?.resultVisible)}`}`),
    "",
  ];
  fs.writeFileSync(path.join(OUTPUT_DIR, `resultados-${mode}.md`), lines.join("\n"));
  return summary;
}

async function main() {
  if (!['smoke', 'results'].includes(mode)) throw new Error(`Modo no admitido: ${mode}`);
  const routes = toolRoutes();
  if (routes.length === 0) throw new Error("El catálogo no contiene rutas para la selección actual.");
  const health = await healthCheck();
  if (!health[0]?.ok) throw new Error(`Frontend no disponible en ${BASE_URL}`);
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const results = [];
  try {
    for (const item of routes) {
      process.stdout.write(`[responsive] ${item.route} · ${VIEWPORTS.map((viewport) => viewport.name).join(", ")}\n`);
      const viewportResults = await Promise.all(VIEWPORTS.map((viewport) => runCase(browser, item, viewport)));
      results.push(...viewportResults);
    }
  } finally {
    await browser.close();
  }
  const summary = writeReport(results, health);
  process.stdout.write(`[responsive] ${summary.passed}/${summary.total} aprobados; ${summary.failed} fallidos\n`);
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
