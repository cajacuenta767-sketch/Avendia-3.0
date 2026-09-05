import type { LucideIcon } from "lucide-react";
import {
  Accessibility, BarChart3, BookMarked, BookOpenText, CalendarDays, CheckSquare,
  ClipboardCheck, FileCheck2, FileQuestion, FileSpreadsheet, FileText, FolderArchive,
  FolderOpen, Gamepad2, GraduationCap, HeartHandshake, Home, Lightbulb, Mail,
  MessageCircle, MonitorPlay, Presentation, Puzzle, Scale, SearchCheck, Send,
  Shapes, ShieldCheck, Sparkles, Speech, Target, Upload, UsersRound, WandSparkles,
} from "lucide-react";

export type ModuleId = "planificamos" | "evaluamos" | "incluimos" | "reforzamos" | "acompanamos" | "tutoria" | "recursos";

export type ToolDefinition = {
  id: string;
  title: string;
  description: string;
  module: ModuleId;
  path: string;
  icon: LucideIcon;
  keywords: string[];
};

export type ModuleDefinition = {
  id: ModuleId;
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
};

export const modules: ModuleDefinition[] = [
  { id: "planificamos", title: "Planificamos", description: "Diseña experiencias y documentos curriculares.", path: "/dashboard/planificamos", icon: BookOpenText },
  { id: "evaluamos", title: "Evaluamos", description: "Crea instrumentos y analiza evidencias.", path: "/dashboard/evaluamos", icon: ClipboardCheck },
  { id: "incluimos", title: "Incluimos", description: "Adapta la enseñanza a cada estudiante.", path: "/dashboard/incluimos", icon: HeartHandshake },
  { id: "reforzamos", title: "Reforzamos", description: "Acompaña la recuperación y el progreso.", path: "/dashboard/reforzamos", icon: Target },
  { id: "acompanamos", title: "Acompañamos", description: "Comunica avances y alertas a las familias.", path: "/dashboard/acompanamos", icon: UsersRound },
  { id: "tutoria", title: "Tutoría", description: "Organiza el bienestar y la orientación integral.", path: "/dashboard/tutoria", icon: GraduationCap },
  { id: "recursos", title: "Recursos", description: "Materiales y actividades listas para el aula.", path: "/dashboard/recursos", icon: FolderOpen },
];

const tool = (module: ModuleId, id: string, title: string, description: string, icon: LucideIcon, keywords: string[] = []): ToolDefinition => ({
  id, title, description, module, icon, keywords: [title.toLowerCase(), module, ...keywords], path: `/dashboard/${module}/${id}`,
});

export const tools: ToolDefinition[] = [
  tool("planificamos", "plan-curricular-anual", "Plan Curricular Anual (PCA)", "Elabora la planificación anual con competencias, periodos, metas, recursos y calendarización curricular.", BookMarked, ["pca", "anual"]),
  tool("planificamos", "unidad-aprendizaje", "Unidad de Aprendizaje", "Diseña una unidad con situación significativa, propósitos, evidencias, actividades, evaluación y cronograma.", BookOpenText, ["unidad"]),
  tool("planificamos", "sesion-aprendizaje", "Sesión de Aprendizaje", "Prepara una clase completa con inicio, desarrollo, cierre, tiempos, recursos, evidencias y evaluación.", FileText, ["sesión", "clase"]),
  tool("planificamos", "situacion-significativa", "Situación significativa", "Crea un reto auténtico y contextualizado con problema, actores, evidencias y preguntas motivadoras.", Lightbulb),
  tool("planificamos", "proyectos-integrados", "Proyectos integrados", "Diseña proyectos ABP que articulan áreas, productos, fases, evaluación y cronograma alrededor de un desafío.", Shapes, ["abp"]),
  tool("planificamos", "adaptacion-nee-dua", "Adaptación Inclusiva NEE (DUA)", "Adapta la enseñanza identificando barreras y proponiendo apoyos, ajustes razonables y estrategias DUA.", Accessibility, ["inclusión"]),
  tool("planificamos", "tarea-extension-hogar", "Tarea de Extensión y Hogar", "Crea actividades claras para continuar el aprendizaje en casa, con instrucciones, evidencias y adaptaciones.", Home, ["tarea"]),
  tool("planificamos", "carpeta-pedagogica", "Carpeta Pedagógica Oficial", "Organiza en un documento institucional las planificaciones, evidencias, registros, seguimiento y anexos del docente.", FolderArchive),

  tool("evaluamos", "rubrica-evaluacion", "Rúbrica de evaluación", "Construye una tabla de criterios, niveles y descriptores para valorar evidencias y orientar la mejora.", FileCheck2, ["rúbrica"]),
  tool("evaluamos", "lista-cotejo", "Lista de cotejo", "Crea un registro por estudiante para marcar el cumplimiento de indicadores y añadir observaciones.", CheckSquare),
  tool("evaluamos", "ficha-aprendizaje", "Ficha de aprendizaje", "Diseña material imprimible con explicación, práctica guiada, actividades, evidencia y autoevaluación.", FileText),
  tool("evaluamos", "examen", "Examen", "Genera una evaluación con preguntas de diferente nivel cognitivo, puntajes y clave para el docente.", FileQuestion),
  tool("evaluamos", "escala-estimacion", "Escala de estimación", "Crea indicadores y niveles progresivos para valorar la frecuencia o calidad del desempeño observado.", Scale),
  tool("evaluamos", "preguntas-texto", "Preguntas sobre texto", "Analiza un texto o archivo y crea preguntas literales, inferenciales y críticas con respuestas justificadas.", FileQuestion),
  tool("evaluamos", "ficha-observacion", "Ficha de observación", "Prepara un instrumento para registrar conductas, indicadores, contexto, evidencias y acciones de seguimiento.", SearchCheck),
  tool("evaluamos", "registros-auxiliares", "Registros auxiliares", "Organiza calificaciones, periodos y observaciones por estudiante, con filtros y cálculos de seguimiento.", FileSpreadsheet),
  tool("evaluamos", "carpetas-recuperacion", "Carpetas de recuperación", "Genera actividades focalizadas, metas y evidencias para recuperar aprendizajes de un estudiante o grupo.", FolderArchive),
  tool("evaluamos", "calificador-rubrica", "Calificador de rúbricas con IA", "Compara una evidencia con los criterios de la rúbrica y sugiere un nivel sustentado para revisión docente.", WandSparkles, ["ia"]),
  tool("evaluamos", "retroalimentacion-formativa", "Retroalimentación Formativa", "Redacta una devolución basada en fortalezas, oportunidades de mejora y próximos pasos para aprender.", Speech, ["retroalimentación", "feedback"]),
  tool("evaluamos", "analytics-alertas", "Analítica de aula y alertas", "Analiza resultados del aula, detecta tendencias y estudiantes que necesitan apoyo, y propone acciones.", BarChart3),

  tool("incluimos", "adaptacion-nee-dua", "Adaptación Inclusiva NEE (DUA)", "Adapta la enseñanza identificando barreras y proponiendo apoyos, ajustes razonables y estrategias DUA.", Accessibility),
  tool("incluimos", "plan-atencion", "Plan de atención", "Elabora un plan individual o grupal con diagnóstico, objetivos, apoyos, responsables, fechas y evidencias.", HeartHandshake),
  tool("incluimos", "estrategias-inclusion", "Estrategias de inclusión", "Recomienda estrategias prácticas según la barrera, el contexto del aula y los principios del DUA.", Puzzle),
  tool("incluimos", "trabajo-familias", "Trabajo con familias", "Prepara acuerdos, pautas para el hogar y acciones de comunicación y seguimiento con las familias.", UsersRound),
  tool("incluimos", "seguimiento-evaluacion", "Seguimiento y evaluación", "Registra avances, barreras y evidencias para reajustar apoyos y establecer nuevos acuerdos.", BarChart3),

  tool("reforzamos", "trabajo-autonomo", "Trabajo autónomo para el hogar", "Crea una ruta semanal de práctica independiente con instrucciones, evidencias y apoyo familiar.", Home),
  tool("reforzamos", "carpeta-recuperacion", "Carpeta de recuperación", "Reúne actividades graduadas, metas, criterios y evidencias para recuperar aprendizajes priorizados.", FolderArchive),
  tool("reforzamos", "monitorea-avances", "Monitorea avances", "Visualiza el progreso por competencia, desempeño y periodo para reconocer avances y brechas.", BarChart3),
  tool("reforzamos", "acompanamiento-motivacion", "Acompaña y motiva", "Crea mensajes, reconocimientos y acuerdos personalizados para sostener la motivación del estudiante.", HeartHandshake),
  tool("reforzamos", "plan-refuerzo", "Plan de refuerzo", "Diseña un plan con diagnóstico, sesiones, estrategias, recursos, metas y evidencias de progreso.", Target),

  tool("acompanamos", "correo-familias", "Correo a familias", "Redacta comunicaciones claras y respetuosas sobre avances, acuerdos, actividades o situaciones del aula.", Mail),
  tool("acompanamos", "respuesta-correo", "Respuesta de correo", "Prepara una respuesta contextualizada con hechos verificables, acuerdos y un siguiente paso concreto.", Send),
  tool("acompanamos", "analytics-alertas", "Analítica de aula y alertas", "Prioriza casos que requieren acompañamiento usando evidencias, nivel de alerta, responsables y acciones.", BarChart3),
  tool("acompanamos", "calificador-ia", "Calificador con IA", "Analiza trabajos según criterios o rúbricas y propone una valoración sustentada para decisión del docente.", Sparkles),
  tool("acompanamos", "reporte-seguimiento", "Reporte de seguimiento", "Elabora un reporte de avances, dificultades, compromisos, responsables y fecha de revisión.", FileCheck2),

  tool("tutoria", "plan-tutoria", "Plan de tutoría", "Elabora el plan tutorial del periodo con objetivos, sesiones, trabajo con familias, cronograma y evaluación.", BookMarked),
  tool("tutoria", "sesiones-tutoria", "Sesiones de tutoría", "Diseña sesiones de desarrollo personal y socioemocional con actividades, preguntas y acuerdos de cuidado.", Speech),
  tool("tutoria", "informe-tutoria", "Informe de tutoría", "Consolida acciones realizadas, atenciones, logros, dificultades, casos y recomendaciones del periodo.", FileText),
  tool("tutoria", "informe-padres", "Informe a padres de familia", "Comunica avances, necesidades, acuerdos y recomendaciones en un lenguaje claro para la familia.", Mail),
  tool("tutoria", "fichas-acompanamiento", "Fichas de acompañamiento", "Registra entrevistas, situaciones, orientaciones, acuerdos, derivaciones y seguimiento individual.", ClipboardCheck),
  tool("tutoria", "alertas-casos", "Alertas y casos", "Documenta hechos y evidencias, define acciones inmediatas y activa rutas de protección y seguimiento.", ShieldCheck),
  tool("tutoria", "recursos-tutoria", "Recursos de tutoría", "Busca y crea dinámicas, fichas, lecturas, juegos y talleres con instrucciones y reflexión final.", FolderOpen),
  tool("tutoria", "orientacion-vocacional", "Orientación vocacional", "Guía al estudiante para reconocer intereses y fortalezas, explorar opciones y crear un plan de acción.", GraduationCap),

  tool("recursos", "presentaciones-didacticas", "Presentaciones didácticas", "Crea una presentación visual con contenido, ejemplos, actividades y notas para conducir la clase.", Presentation),
  tool("recursos", "tarjetas-estudio", "Tarjetas de estudio", "Genera tarjetas interactivas con pregunta, respuesta y pista para practicar mediante repaso espaciado.", BookMarked),
  tool("recursos", "agrupar-palabras", "Agrupar palabras y taxonomías", "Crea una actividad interactiva para clasificar conceptos en categorías y comprobar las respuestas.", Shapes),
  tool("recursos", "ordenar-bloques", "Ordenar bloques y secuencias", "Crea actividades para ordenar pasos, hechos o procesos y comprender su secuencia lógica.", Puzzle),
  tool("recursos", "casos-estudio", "Casos de estudio (ABP)", "Genera un caso auténtico con dilema, actores, evidencias y preguntas para investigar y decidir.", Lightbulb),
  tool("recursos", "ahorcado", "Juego del ahorcado educativo", "Crea un juego interactivo de vocabulario con palabras, pistas, intentos y retroalimentación.", Gamepad2),
  tool("recursos", "completa-frase", "Completa la frase", "Genera ejercicios interactivos para completar enunciados usando respuestas, distractores o un banco de palabras.", FileText),
  tool("recursos", "emparejar-palabras", "Emparejar palabras y glosarios", "Crea un juego para relacionar términos con definiciones, imágenes, ejemplos o conceptos equivalentes.", Puzzle),
  tool("recursos", "debate-aula", "Dinámica de debate en aula", "Prepara una moción con contexto, roles, reglas, argumentos, repreguntas y criterios de evaluación.", MessageCircle),
  tool("recursos", "crucigramas", "Crucigramas", "Genera un crucigrama temático con pistas, cuadrícula numerada, comprobación y solucionario.", Puzzle),
  tool("recursos", "sopas-letras", "Sopas de letras", "Crea una sopa de letras temática con palabras, pistas, cuadrícula interactiva y solución.", SearchCheck),
  tool("recursos", "banco-planificacion", "Banco de recursos para planificar", "Busca y reúne actividades, materiales y estrategias para el inicio, desarrollo y cierre de una clase.", FolderOpen),
  tool("recursos", "normativa-educativa", "Normativa educativa", "Facilita la búsqueda de normas educativas y explica su alcance, aplicación y fuente oficial por verificar.", Scale),
  tool("recursos", "libros-guia-minedu", "Libros y guías MINEDU", "Ayuda a encontrar materiales oficiales por nivel, grado y área, y propone cómo utilizarlos o adaptarlos.", BookOpenText),
  tool("recursos", "canales-audiovisuales", "Canales audiovisuales", "Facilita la búsqueda de videos, pódcast y canales educativos, y propone cómo usarlos antes, durante y después de la clase.", MonitorPlay),
];

export const utilityNavigation = [
  { title: "Videos tutoriales", path: "/dashboard/videos-tutorial", icon: MonitorPlay },
  { title: "Historial", path: "/dashboard/historial", icon: FolderArchive },
  { title: "Ideas y mejoras", path: "/dashboard/ideas", icon: Lightbulb },
  { title: "Sube tu formato", path: "/dashboard/sube-tu-formato", icon: Upload },
  { title: "Referidos", path: "/dashboard/referidos", icon: UsersRound },
  { title: "Comunidad activa", path: "/dashboard/comunidad-activa", icon: MessageCircle },
  { title: "Mis estudiantes", path: "/dashboard/mis-estudiantes", icon: UsersRound },
];

export const primaryNavigation = [
  { title: "Inicio", path: "/dashboard", icon: Home },
  modules[0],
  { title: "Calendario", path: "/dashboard/calendario", icon: CalendarDays },
  ...modules.slice(1),
];

export function getToolByPath(path: string) { return tools.find((item) => item.path === path); }
export function getModule(id: string | undefined) { return modules.find((item) => item.id === id); }
