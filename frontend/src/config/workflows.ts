import type { ModuleId, ToolDefinition } from "./tools";
import { getDynamicEducationOptions, getEducationLevels, type DynamicEducationOptions } from "./education";
import { LEGACY_WORKFLOW_SHAPES, type WorkflowStageKind } from "./legacyWorkflowShapes";

export type WorkflowFieldType = "text" | "textarea" | "select" | "number" | "date" | "multiselect" | "repeater";

export type WorkflowFieldGuide = {
  title?: string;
  question1?: string;
  placeholder1?: string;
  question2?: string;
  placeholder2?: string;
  suggestions?: string[];
  contextKey?: string;
};

export type WorkflowField = {
  id: string;
  label: string;
  type: WorkflowFieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: string[];
  min?: number;
  max?: number;
  wide?: boolean;
  variant?: "default" | "cards" | "chips" | "radio";
  dependsOn?: string;
  dynamicOptions?: DynamicEducationOptions;
  disabledPlaceholder?: string;
  selectionFromRoster?: boolean;
  rosterMode?: "single" | "multiple" | "classroom" | "group";
  guide?: WorkflowFieldGuide | false;
  minItems?: number;
  maxItems?: number;
  itemPlaceholder?: string;
};

export type WorkflowFieldGroup = {
  id: string;
  title: string;
  description?: string;
  fieldIds: string[];
  columns?: 2 | 3;
};

export type WorkflowStep = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  fields: WorkflowField[];
  columns?: 2 | 3;
  groups?: WorkflowFieldGroup[];
  kind?: WorkflowStageKind;
};

export type WorkflowDefinition = {
  key: string;
  module: ModuleId;
  toolId: string;
  complexity: "breve" | "media" | "alta";
  artifactType: "documento" | "instrumento" | "analisis" | "comunicacion" | "recurso" | "actividad";
  sourceRoute: string;
  steps: WorkflowStep[];
  outputSections: string[];
  embeddedResult?: boolean;
};

export const workflowModalities = ["EBR — Educación Básica Regular", "EBA — Educación Básica Alternativa", "EBE — Educación Básica Especial"];
const levels = ["Inicial", "Primaria", "Secundaria"];
const areas = ["Comunicación", "Matemática", "Ciencia y Tecnología", "Personal Social", "Ciencias Sociales", "Educación para el Trabajo", "Inglés", "Arte y Cultura", "Educación Física", "Educación Religiosa", "Tutoría"];

const EXAMPLE_PLACEHOLDERS: Record<string, string> = {
  dre: "Ej. Dirección Regional de Educación de Lima Metropolitana",
  ugel: "Ej. UGEL 03",
  institution: "Ej. I.E. N.° 5143 República del Perú",
  teacher_name: "Ej. Prof. María Gómez",
  director_name: "Ej. Lic. Carlos Rojas",
  subdirector_name: "Ej. Mg. Ana Torres",
  section: "Ej. A",
  sections: "Ej. A, B y C",
  student_name: "Ej. Lucía Pérez",
  student_count: "Ej. 28",
  unit_title: "Ej. Cuidamos nuestra salud y la de nuestra comunidad",
  session_title: "Ej. Explicamos hábitos para una vida saludable",
  session_topic: "Ej. Alimentación saludable e higiene cotidiana",
  topic: "Ej. Hábitos de alimentación saludable e higiene cotidiana",
  theme: "Ej. Convivencia democrática en el aula",
  school_year: "Ej. 2026",
};

const defaultPlaceholder = (id: string, label: string, type: WorkflowFieldType) => {
  if (EXAMPLE_PLACEHOLDERS[id]) return EXAMPLE_PLACEHOLDERS[id];
  if (type === "textarea") return `Describe ${label.toLowerCase()} con información concreta y pertinente para tu grupo.`;
  if (type === "text") return `Escribe ${label.toLowerCase()}.`;
  return "";
};

const defaultHelp = (field: WorkflowField) => {
  const subject = field.label.toLowerCase();
  if (field.type === "text") return `Escribe un dato breve y verificable para ${subject}; usa el ejemplo como referencia.`;
  if (field.type === "textarea") return `Explica ${subject} con contexto, necesidad y resultado esperado para tu grupo.`;
  if (field.type === "select") {
    return field.dependsOn
      ? "Elige una opción. La lista se actualiza según la selección del campo anterior."
      : "Elige la opción que corresponda al contexto educativo del grupo.";
  }
  if (field.type === "number") {
    const range = field.min !== undefined && field.max !== undefined
      ? ` entre ${field.min} y ${field.max}`
      : field.min !== undefined
        ? ` desde ${field.min}`
        : field.max !== undefined
          ? ` hasta ${field.max}`
          : "";
    return `Ingresa un número válido${range}.`;
  }
  if (field.type === "date") return `Selecciona la fecha que corresponda a ${subject}.`;
  if (field.type === "multiselect") {
    return field.dependsOn
      ? "Puedes elegir más de una opción; la lista se actualiza según la selección anterior."
      : "Puedes seleccionar más de una opción.";
  }
  return "Añade, edita o elimina filas según lo que necesite el documento.";
};

const text = (id: string, label: string, required = true, placeholder = "", wide = false): WorkflowField => ({ id, label, type: "text", required, placeholder: placeholder || defaultPlaceholder(id, label, "text"), wide });
const rosterStudent = (id: string, label: string, required = true): WorkflowField => ({
  ...text(id, label, required),
  selectionFromRoster: true,
  help: "Elige el estudiante desde la nómina central. Puedes administrar las aulas y estudiantes en Mis estudiantes.",
});
const rosterGroup = (id: string, label: string, mode: "multiple" | "classroom" | "group" = "multiple", required = true): WorkflowField => ({
  ...text(id, label, required),
  wide: true,
  selectionFromRoster: true,
  rosterMode: mode,
  help: mode === "classroom"
    ? "Elige un aula de la nómina central. Se incluirán sus estudiantes activos en el mismo orden."
    : "Elige estudiantes desde la nómina central. Puedes administrar las aulas y estudiantes en Mis estudiantes.",
});
const area = (id = "curricular_area", label = "Área curricular (CNEB)"): WorkflowField => ({ id, label, type: "select", required: true, dependsOn: "level", dynamicOptions: "areasByLevel", disabledPlaceholder: "Primero selecciona el nivel" });
const select = (id: string, label: string, options: string[], required = true): WorkflowField => ({ id, label, type: "select", required, options });
const multi = (id: string, label: string, options: string[], required = true): WorkflowField => ({ id, label, type: "multiselect", required, options, wide: true, variant: options.length <= 8 ? "cards" : "default" });
const dynamicMulti = (id: string, label: string, dynamicOptions: DynamicEducationOptions, dependsOn: string): WorkflowField => ({ id, label, type: "multiselect", required: true, wide: true, variant: "cards", dynamicOptions, dependsOn, disabledPlaceholder: "Completa primero el campo anterior" });
const cards = (id: string, label: string, options: string[], required = true): WorkflowField => ({ id, label, type: "select", required, options, wide: true, variant: "cards" });
const radio = (id: string, label: string, options: string[], required = true): WorkflowField => ({ id, label, type: "select", required, options, variant: "radio" });
const repeater = (id: string, label: string, itemPlaceholder: string, required = true, minItems = 1, maxItems = 12): WorkflowField => ({ id, label, type: "repeater", required, wide: true, itemPlaceholder, minItems, maxItems, help: "Añade, edita o elimina filas según lo que necesite el documento." });
const long = (id: string, label: string, placeholderOrRequired: string | boolean = "", required = true): WorkflowField => ({ id, label, type: "textarea", required: typeof placeholderOrRequired === "boolean" ? placeholderOrRequired : required, placeholder: typeof placeholderOrRequired === "string" && placeholderOrRequired ? placeholderOrRequired : defaultPlaceholder(id, label, "textarea"), wide: true });
const number = (id: string, label: string, min: number, max: number, required = true): WorkflowField => ({ id, label, type: "number", required, min, max });
const date = (id: string, label: string, required = true): WorkflowField => ({ id, label, type: "date", required });
const modality = (): WorkflowField => select("modality", "Modalidad educativa", workflowModalities);

const grade = (): WorkflowField => ({
  id: "grade",
  label: "Grado / ciclo",
  type: "select",
  required: true,
  dependsOn: "level",
  dynamicOptions: "gradesByLevel",
  disabledPlaceholder: "Primero selecciona el nivel",
});

const classroomFields = (withArea = true): WorkflowField[] => [
  text("teacher_name", "Nombre del docente"),
  text("institution", "Institución educativa"),
  modality(),
  select("level", "Nivel educativo", levels),
  grade(),
  text("section", "Sección", false, "Ej. A"),
  ...(withArea ? [area()] : []),
];

const officialFields = (withArea = true): WorkflowField[] => [
  text("dre", "DRE"),
  text("ugel", "UGEL"),
  text("institution", "Institución educativa"),
  text("teacher_name", "Docente responsable"),
  text("director_name", "Director(a) de la I.E.", false),
  text("subdirector_name", "Subdirector(a)", false),
  modality(),
  select("level", "Nivel educativo", levels),
  grade(),
  text("section", "Sección", false),
  ...(withArea ? [area()] : []),
];

const step = (id: string, title: string, description: string, fields: WorkflowField[], columns: 2 | 3 = 2, groups?: WorkflowFieldGroup[]): WorkflowStep => ({ id, title, shortTitle: title, description, fields, columns, groups });

const enhanceField = (field: WorkflowField): WorkflowField => {
  const normalized: WorkflowField = {
    ...field,
    options: field.id === "modality" ? workflowModalities : field.id === "level" ? undefined : field.options,
    dependsOn: field.id === "level" ? "modality" : field.dependsOn,
    dynamicOptions: field.id === "level" ? "levelsByModality" : field.dynamicOptions,
    disabledPlaceholder: field.id === "level" ? "Primero selecciona la modalidad" : field.disabledPlaceholder,
    placeholder: field.placeholder || defaultPlaceholder(field.id, field.label, field.type),
    guide: field.guide ?? false,
  };
  return { ...normalized, help: field.help || defaultHelp(normalized) };
};

// Inventario normativo CNEB de campos cualitativos autorizados para «Sugerir con IA».
// Protege estrictamente los datos administrativos (DRE, UGEL, docente, institución, etc.)
// garantizando asistencia inteligente únicamente donde existe contenido pedagógico real.
export const WORKFLOW_GUIDED_FIELDS: Record<string, string[]> = {
  "planificamos/plan-curricular-anual": ["justification", "graduate_profile", "student_characteristics", "context_characteristics", "priority_1", "priority_2", "priority_3", "competencies", "socioemotional_wellbeing", "inclusive_education", "tutoring_activities", "teacher_actions", "family_actions", "teacher_recommendations", "final_observations"],
  "planificamos/unidad-aprendizaje": ["key_topics", "student_context", "cross_area_links", "significant_situation", "student_challenges", "challenge_question", "performances", "learning_purposes", "final_product", "evidence", "criteria", "activity_sequence", "resources", "dua_adjustments", "family_connection", "observations"],
  "planificamos/sesion-aprendizaje": ["student_context", "unit_purpose", "source_content", "session_title", "transversal_competency", "performance", "purpose", "evidence", "materials", "digital_resources", "bibliography", "dua_adjustments", "opening", "development", "closure", "criteria", "feedback"],
  "planificamos/situacion-significativa": ["context_description", "challenge_question", "learning_justification", "articulated_competencies", "expected_product", "evaluation_criteria"],
  "planificamos/proyectos-integrados": ["challenging_situation", "competency_matrix", "approaches_and_product", "phase_sequence", "roles_and_resources", "interdisciplinary_criteria", "assessment_instruments"],
  "planificamos/adaptacion-nee-dua": ["barriers", "dua_engagement", "dua_representation", "dua_expression", "performance_adjustments", "assessment_adjustments", "classroom_support", "family_saanee_guidance"],
  "planificamos/tarea-extension-hogar": ["task_title", "learning_purpose", "instructions", "materials", "family_context", "family_role", "dua_adjustments", "evidence", "criteria", "reflection", "teacher_feedback"],
  "planificamos/carpeta-pedagogica": ["pedagogical_philosophy", "calendar_dates", "committee_plan", "classroom_diagnosis", "learning_styles", "coexistence_rules", "portfolio_structure"],
  "evaluamos/rubrica-evaluacion": ["performance", "product", "criteria_notes", "pedagogical_context"],
  "evaluamos/lista-cotejo": ["activity", "list_title", "additional_criteria"],
  "evaluamos/ficha-aprendizaje": ["topic", "purpose", "source_content", "dua_supports"],
  "evaluamos/examen": ["topics", "criteria", "accommodations"],
  "evaluamos/escala-estimacion": ["activity", "criteria_notes"],
  "evaluamos/preguntas-texto": ["reading_title", "source_text", "cneb_capacities", "dua_adjustments", "criteria", "feedback_guidance"],
  "evaluamos/ficha-observacion": ["observation_focus", "criteria", "observed_facts", "context_factors", "conclusion", "commitments", "interpretation"],
  "evaluamos/registros-auxiliares": ["competencies", "criteria", "final_evidence", "attendance_observations", "in_progress_conclusions", "achieved_conclusions", "support_actions"],
  "evaluamos/carpetas-recuperacion": ["diagnosis", "prioritized_competencies", "criteria", "evidence", "activity_sequence", "resources", "timeline", "family_guidance", "feedback"],
  "evaluamos/calificador-rubrica": ["rubric", "student_evidence", "analysis_breakdown", "detected_strengths", "improvement_guidance", "teacher_adjustments"],
  "evaluamos/retroalimentacion-formativa": ["competency", "criteria", "clarify", "value", "concerns", "suggestions"],
  "evaluamos/analytics-alertas": ["diagnostic_summary", "academic_alerts", "attendance_alerts", "competency_analysis", "context_factors", "intervention_actions", "referrals"],
  "incluimos/adaptacion-nee-dua": ["strengths_interests", "barriers", "dua_engagement", "dua_representation", "dua_expression", "competency_focus", "performance_adjustments", "assessment_adjustments", "access_resources", "classroom_support", "family_saanee_guidance", "progress_evidence"],
  "incluimos/plan-atencion": ["psychopedagogical_report", "diagnosis", "talents", "autonomy", "academic_performance", "dua_supports", "performance_adaptations", "methodology_adaptations", "assessment_adaptations", "supports", "goals", "school_commitments", "family_commitments", "progress_evidence"],
  "incluimos/estrategias-inclusion": ["social_dynamics", "inclusion_goal", "empathy_activities", "time_adjustments", "visual_supports", "participation_indicators", "feedback"],
  "incluimos/trabajo-familias": ["reason", "diagnosis", "home_barriers", "home_routines", "communication_frequency", "family_commitments", "school_commitments", "followup_evidence"],
  "incluimos/seguimiento-evaluacion": ["implemented_adaptations", "pedagogical_progress", "socioemotional_progress", "effective_supports", "persistent_difficulties", "dua_adjustments", "family_recommendations", "next_goals"],
  "reforzamos/trabajo-autonomo": ["worksheet_title", "family_guidance", "what_to_learn", "exercises", "reflection"],
  "reforzamos/carpeta-recuperacion": ["topics", "student_assignments", "diagnosis", "activity_route", "evidence", "criteria", "timeline", "feedback", "family_guidance"],
  "reforzamos/monitorea-avances": ["capacity", "expected_performance", "milestone_1", "milestone_2", "milestone_3", "qualitative_notes", "socioemotional_notes", "support_strategies", "advanced_group", "intermediate_group", "priority_group"],
  "reforzamos/acompanamiento-motivacion": ["home_support", "interests", "observations", "micro_goals", "student_message", "family_message", "commitments"],
  "reforzamos/plan-refuerzo": ["diagnosis", "capacity", "performance_goal", "criterion_1", "criterion_2", "final_product", "priority_actions", "consolidation_actions", "resources", "feedback_strategy", "milestone_1", "milestone_2", "milestone_3", "milestone_4", "teacher_commitments", "student_commitments", "family_commitments", "followup_evidence"],
  "acompanamos/correo-familias": ["key_points", "facts_to_avoid", "desired_action", "communication_channel"],
  "acompanamos/respuesta-correo": ["received_email", "facts_to_include", "facts_to_avoid"],
  "acompanamos/analytics-alertas": ["classroom_observations", "academic_signals", "attendance_signals", "socioemotional_signals", "priority_cases", "recommended_actions", "responsibilities"],
  "acompanamos/calificador-ia": ["criterion", "rubric", "teacher_notes", "student_evidence"],
  "acompanamos/reporte-seguimiento": ["progress", "difficulties", "commitments", "next_actions", "responsibilities"],
  "tutoria/plan-tutoria": ["diagnosis", "objectives", "priorities", "group_sessions", "individual_attention", "family_actions", "community_actions", "timeline", "resources", "evaluation"],
  "tutoria/sesiones-tutoria": ["session_title", "achievement", "opening", "development", "closure", "resources", "evaluation", "safeguards"],
  "tutoria/informe-tutoria": ["group_sessions", "individual_attention", "family_meetings", "achievements", "difficulties", "cases", "recommendations", "next_actions"],
  "tutoria/informe-padres": ["discussed_situation", "evidence", "agreements", "observations"],
  "tutoria/fichas-acompanamiento": ["observed_problem", "background", "guidance", "agreements", "referral"],
  "tutoria/alertas-casos": ["case_description", "evidence_notes", "witnesses", "immediate_actions", "legal_framework", "referral_route", "protection_measures", "responsibilities"],
  "tutoria/recursos-tutoria": ["topic", "need", "available_materials", "safeguards"],
  "tutoria/orientacion-vocacional": ["interests", "strengths", "values", "context", "explored_options", "questions", "exploration_activities", "information_sources", "short_term_plan"],
  "recursos/presentaciones-didacticas": ["topic", "must_include", "speaker_notes"],
  "recursos/tarjetas-estudio": ["topic"],
  "recursos/agrupar-palabras": ["topic"],
  "recursos/ordenar-bloques": ["topic"],
  "recursos/casos-estudio": ["topic", "required_elements", "curricular_focus"],
  "recursos/ahorcado": ["topic"],
  "recursos/completa-frase": ["topic"],
  "recursos/emparejar-palabras": ["topic"],
  "recursos/debate-aula": ["topic", "context", "required_perspectives", "safeguards"],
  "recursos/crucigramas": ["topic"],
  "recursos/sopas-letras": ["topic"],
  "recursos/banco-planificacion": ["topic", "available_resources", "learning_purpose", "constraints"],
  "recursos/normativa-educativa": ["application_scope", "topic", "question"],
  "recursos/libros-guia-minedu": ["topic", "learning_purpose", "planned_activity", "adaptation_need"],
  "recursos/canales-audiovisuales": ["topic", "planned_use"],
};

export const LEGACY_GUIDED_FIELDS = WORKFLOW_GUIDED_FIELDS;

const contextualizeCurriculumField = (field: WorkflowField, fieldIds: Set<string>): WorkflowField => {
  if (!fieldIds.has("curricular_area") || !["competency", "competencies"].includes(field.id)) return field;
  return {
    ...field,
    type: field.id === "competency" ? "select" : "multiselect",
    options: undefined,
    dependsOn: "curricular_area",
    dynamicOptions: "competenciesByArea",
    disabledPlaceholder: "Primero selecciona el área curricular",
    variant: "cards",
    wide: true,
    help: field.id === "competency" ? "Selecciona una competencia oficial del área." : "Selecciona una o más competencias oficiales del área.",
    guide: false,
  };
};

const applyLegacyWorkflowShape = (workflowKey: string, sourceSteps: WorkflowStep[]) => {
  const shape = LEGACY_WORKFLOW_SHAPES[workflowKey];
  if (!shape) return { steps: sourceSteps, embeddedResult: false };

  const stepById = new Map(sourceSteps.map((item) => [item.id, item]));
  const fieldById = new Map(sourceSteps.flatMap((item) => item.fields).map((field) => [field.id, field]));
  const explicitlyPlaced = new Set(shape.stages.flatMap((item) => item.fieldIds ?? []));
  const usedFields = new Set<string>();

  const shapedSteps = shape.stages.map((stage) => {
    const stageExplicit = new Set(stage.fieldIds ?? []);
    const fromSources = (stage.sourceSteps ?? []).flatMap((sourceId) =>
      (stepById.get(sourceId)?.fields ?? []).filter((field) => !explicitlyPlaced.has(field.id) || stageExplicit.has(field.id)),
    );
    const explicit = (stage.fieldIds ?? []).map((fieldId) => fieldById.get(fieldId)).filter((field): field is WorkflowField => Boolean(field));
    const fields = [...fromSources, ...explicit].filter((field, index, all) => all.findIndex((item) => item.id === field.id) === index);
    fields.forEach((field) => usedFields.add(field.id));

    const sourceGroups = (stage.sourceSteps ?? []).flatMap((sourceId) =>
      (stepById.get(sourceId)?.groups ?? []).map((group) => ({
        ...group,
        id: `${sourceId}-${group.id}`,
        fieldIds: group.fieldIds.filter((fieldId) => fields.some((field) => field.id === fieldId)),
      })).filter((group) => group.fieldIds.length > 0),
    );

    return {
      id: stage.id,
      title: stage.title,
      shortTitle: stage.title,
      description: stage.description,
      fields,
      columns: stage.columns ?? (sourceGroups.some((group) => group.title.includes("Datos informativos")) ? 3 : undefined) ?? (stage.sourceSteps?.length === 1 ? stepById.get(stage.sourceSteps[0])?.columns : undefined) ?? 2,
      groups: sourceGroups.length ? sourceGroups : undefined,
      kind: stage.kind ?? "form",
    } satisfies WorkflowStep;
  });

  const unusedFields = [...fieldById.values()].filter((field) => !usedFields.has(field.id));
  if (unusedFields.length) {
    const fallback = shapedSteps.find((item) => item.kind === "form");
    if (fallback) fallback.fields = [...fallback.fields, ...unusedFields];
  }

  return { steps: shapedSteps, embeddedResult: true };
};

const define = (
  module: ModuleId,
  toolId: string,
  complexity: WorkflowDefinition["complexity"],
  artifactType: WorkflowDefinition["artifactType"],
  sourceRoute: string,
  steps: WorkflowStep[],
  outputSections: string[],
): WorkflowDefinition => {
  const workflowKey = `${module}/${toolId}`;
  const legacyShape = applyLegacyWorkflowShape(workflowKey, steps);
  const normalizedSteps = legacyShape.steps;
  const fieldIds = new Set(normalizedSteps.flatMap((item) => item.fields.map((field) => field.id)));
  const guidedFields = new Set(LEGACY_GUIDED_FIELDS[workflowKey] ?? []);
  return {
    key: workflowKey,
    module,
    toolId,
    complexity,
    artifactType,
    sourceRoute,
    embeddedResult: legacyShape.embeddedResult,
    steps: normalizedSteps.map((item) => ({
      ...item,
      fields: item.fields.map((field) => {
        const sourceField = guidedFields.has(field.id) ? field : contextualizeCurriculumField(field, fieldIds);
        const enhanced = enhanceField(sourceField);
        if (!guidedFields.has(field.id)) return enhanced;
        return { ...enhanced, guide: field.guide === false ? false : (typeof field.guide === "object" ? field.guide : {}) };
      }),
    })),
    outputSections,
  };
};

const profile = (titleOrArea: string | boolean = "Datos generales", withArea = true) => step(
  "profile",
  typeof titleOrArea === "string" ? titleOrArea : "Datos generales",
  "Datos que identifican al docente, la institución y el grupo.",
  classroomFields(typeof titleOrArea === "boolean" ? titleOrArea : withArea),
  2,
);

const official = (titleOrArea: string | boolean = "Datos institucionales", withArea = true) => {
  const includesArea = typeof titleOrArea === "boolean" ? titleOrArea : withArea;
  return step(
    "official",
    typeof titleOrArea === "string" ? titleOrArea : "Datos institucionales",
    "Información oficial que aparecerá en el documento.",
    officialFields(includesArea),
    3,
    [
      { id: "institution", title: "1. Datos informativos (DRE / UGEL / I.E.)", fieldIds: ["dre", "ugel", "institution"], columns: 3 },
      { id: "curriculum", title: "2. Estructura y modalidad curricular", fieldIds: ["modality", "level", "grade", "section", ...(includesArea ? ["curricular_area"] : [])], columns: 3 },
      { id: "responsible", title: "3. Responsables", fieldIds: ["teacher_name", "director_name", "subdirector_name"], columns: 3 },
    ],
  );
};

export const workflowDefinitions: WorkflowDefinition[] = [
  define("planificamos", "plan-curricular-anual", "alta", "documento", "/dashboard/plan-anual", [
    step("data", "Datos", "Identificación, estructura curricular, áreas y responsables.", [
      text("dre", "DRE"), text("ugel", "UGEL"), text("institution", "Institución educativa"),
      select("service_model", "Modelo de Servicio Educativo (MSE)", ["JER (Jornada Escolar Regular)", "JEC (Jornada Escolar Completa)", "COAR (Colegio de Alto Rendimiento)", "EBA / EBE (Servicio especializado)"]), select("modality", "Modalidad", ["EBR (Educación Básica Regular)", "EBA (Educación Básica Alternativa)", "EBE (Educación Básica Especial)"]),
      select("level", "Nivel Académico", levels), radio("planning_scope", "Generar PCA por", ["Grado", "Ciclo"]),
      grade(), text("sections", "Secciones", true, "Ej. A, B, C"), text("execution_period", "Tiempo de ejecución", true, "Ej. Del 9 de marzo al 18 de diciembre"),
      number("school_year", "Año lectivo", 2025, 2035), dynamicMulti("curricular_areas", "Áreas curriculares", "areasByLevel", "level"),
      text("teacher_name", "Docente responsable"), text("director_name", "Director(a)"), text("subdirector_name", "Subdirector(a)", false),
      select("pedagogical_approach", "Enfoque pedagógico", ["Constructivista / sociocognitivo", "ABP", "Aula invertida", "STEM"]),
      select("writing_tone", "Tono de redacción", ["Técnico y formal", "Práctico y sencillo", "Innovador y tecnológico"]),
      select("assessment_approach", "Enfoque de evaluación", ["Formativa", "Sumativa", "Autoevaluación y coevaluación"]),
    ], 3, [
      { id: "institution", title: "1. Datos informativos (DRE / UGEL / I.E.)", fieldIds: ["dre", "ugel", "institution"], columns: 3 },
      { id: "curriculum", title: "2. Estructura y modalidad curricular", fieldIds: ["service_model", "modality", "level", "planning_scope", "grade", "sections", "execution_period", "school_year"], columns: 3 },
      { id: "areas", title: "3. Selección de áreas curriculares", description: "Selecciona al menos un área a desarrollar en la planificación.", fieldIds: ["curricular_areas"], columns: 3 },
      { id: "responsible", title: "4. Responsables y enfoque del documento", fieldIds: ["teacher_name", "director_name", "subdirector_name", "pedagogical_approach", "writing_tone", "assessment_approach"], columns: 3 },
    ]),
    step("description", "Descripción", "Fundamentos que contextualizan la planificación anual.", [
      long("justification", "Justificación y necesidades de aprendizaje"), long("graduate_profile", "Perfil de egreso esperado"),
      long("student_characteristics", "Características, ritmos y necesidades de los estudiantes"), long("context_characteristics", "Contexto territorial, sociocultural e institucional"),
    ]),
    step("calendar", "Calendarización", "Distribución del año, periodos y unidades.", [cards("calendar_mode", "Organización", ["Bimestres", "Trimestres"]), text("active_periods", "Periodos activos", true, "Ej. I, II, III y IV bimestre"), number("unit_count", "Número de unidades", 4, 12), repeater("calendar_constraints", "Fechas, hitos y restricciones del calendario", "Ej. Semana de gestión del 27 al 31 de julio", false, 0, 16)]),
    step("demands", "Demandas", "Problemas, necesidades y prioridades institucionales.", [repeater("identified_problems", "Problemas o demandas priorizadas", "Ej. Baja comprensión de textos informativos", true, 1, 10), long("priority_1", "Prioridad 1"), long("priority_2", "Prioridad 2"), long("priority_3", "Prioridad 3")]),
    step("competencies", "Competencias", "Competencias, enfoques transversales y tutoría.", [long("competencies", "Competencias, capacidades y estándares priorizados"), multi("transversal_approaches", "Enfoques transversales", ["Derechos", "Inclusivo", "Intercultural", "Igualdad de género", "Ambiental", "Orientación al bien común", "Búsqueda de la excelencia"]), long("socioemotional_wellbeing", "Bienestar socioemocional"), long("inclusive_education", "Educación inclusiva y atención a la diversidad"), multi("tutoring_dimensions", "Dimensiones de tutoría", ["Personal", "Social", "Aprendizajes", "Convivencia", "Participación", "Orientación vocacional"]), long("tutoring_activities", "Actividades y estrategias de tutoría")]),
    step("materials", "Materiales", "Recursos para docente y estudiantes.", [repeater("teacher_materials", "Materiales y recursos del docente", "Ej. Guía docente de Comunicación 3", true, 1, 15), repeater("student_materials", "Materiales y recursos del estudiante", "Ej. Cuaderno de trabajo MINEDU", true, 1, 15), repeater("digital_resources", "Recursos digitales y tecnológicos", "Ej. PerúEduca · recurso de comprensión lectora", false, 0, 15), repeater("minedu_books", "Libros MINEDU seleccionados", "Ej. Cuaderno de trabajo de Matemática 3", false, 0, 15)]),
    step("references", "Referencias", "Documentos normativos y fuentes institucionales.", [repeater("normative_references", "Normativa y documentos de gestión", "Ej. RVM N.° … · verificar vigencia en la fuente oficial", true, 1, 12), repeater("curricular_references", "Referencias curriculares CNEB / MINEDU", "Ej. Currículo Nacional de la Educación Básica", true, 1, 12)]),
    step("bibliography", "Bibliografía", "Bibliografía diferenciada para docente y estudiante.", [repeater("teacher_owned_books", "Libros propios del docente", "Título · autor/editorial · año", false, 0, 20), repeater("teacher_bibliography", "Para el docente (5 recomendaciones)", "Autor. (Año). Título. Editorial.", true, 1, 20), repeater("student_bibliography", "Para el estudiante (5 recomendaciones)", "Autor. (Año). Título. Editorial.", true, 1, 20)]),
    step("closure", "Cierre", "Validación final antes de generar el documento.", [long("teacher_actions", "Acciones y compromisos del docente"), long("family_actions", "Acciones y compromisos de las familias"), long("teacher_recommendations", "Recomendaciones para la implementación"), long("final_observations", "Observaciones finales", "Información que la IA debe respetar.", false)]),
  ], ["Datos informativos", "Descripción general", "Calendarización anual", "Demandas y prioridades", "Organización de competencias", "Enfoques transversales y tutoría", "Materiales y recursos", "Referencias normativas", "Bibliografía", "Firmas y recomendaciones"]),

  define("planificamos", "unidad-aprendizaje", "alta", "documento", "/dashboard/unidades", [
    official(),
    step("scope", "Alcance", "Duración, periodo y características del grupo.", [select("planning_scope", "Planificar por", ["Grado", "Ciclo"]), text("unit_duration", "Duración de la unidad", true, "Ej. 4 semanas"), number("school_year", "Año lectivo", 2025, 2035), number("student_count", "Número de estudiantes", 1, 80), select("shift", "Turno", ["Mañana", "Tarde", "Noche"]), date("start_date", "Fecha de inicio"), date("end_date", "Fecha de término"), select("academic_period", "Periodo académico", ["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4", "Trimestre 1", "Trimestre 2", "Trimestre 3"])]),
    step("challenge", "Situación", "Reto auténtico que organiza la unidad.", [text("unit_title", "Título de la unidad"), long("key_topics", "Temas clave"), long("student_context", "Contexto y barreras de aprendizaje (DUA)"), long("cross_area_links", "Vinculación con otras áreas"), long("significant_situation", "Situación significativa"), long("student_challenges", "Desafíos identificados en los estudiantes"), long("challenge_question", "Reto o pregunta desafiante")]),
    step("purpose", "Propósitos", "Competencias y resultados esperados.", [long("competencies", "Competencias y capacidades"), long("performances", "Desempeños y estándares"), long("learning_purposes", "Propósitos de aprendizaje"), multi("transversal_approaches", "Enfoques transversales", ["Derechos", "Inclusivo", "Intercultural", "Igualdad de género", "Ambiental", "Bien común", "Excelencia"])]),
    step("evidence", "Evidencias", "Producto, criterios e instrumentos.", [long("final_product", "Producto o actuación final"), long("evidence", "Evidencias de aprendizaje"), long("criteria", "Criterios de evaluación"), select("instrument", "Instrumento", ["Rúbrica", "Lista de cotejo", "Escala de estimación", "Ficha de observación", "Portafolio"])]),
    step("sequence", "Secuencia", "Actividades y sesiones de la unidad.", [number("session_count", "Cantidad de sesiones", 2, 20), long("activity_sequence", "Secuencia de actividades / sesiones"), long("resources", "Recursos y materiales")]),
    step("review", "Cierre", "Decisiones de inclusión y validación.", [long("dua_adjustments", "Ajustes DUA y atención a la diversidad"), long("family_connection", "Vinculación con familias o comunidad", "", false), cards("generate_instruments", "Generar instrumentos de evaluación", ["Sí, incluirlos", "No incluirlos"], false), cards("generate_worksheets", "Generar fichas de trabajo", ["Sí, incluirlas", "No incluirlas"], false), long("observations", "Observaciones finales", "", false)]),
  ], ["Datos informativos", "Situación significativa", "Propósitos de aprendizaje", "Enfoques transversales", "Producto y evidencias", "Criterios e instrumento", "Secuencia de sesiones", "Recursos", "Ajustes DUA"]),

  define("planificamos", "sesion-aprendizaje", "alta", "documento", "/dashboard/sesiones", [
    official(),
    step("source", "Fuente", "Define si la sesión nace de un tema, un texto o un libro del Estado.", [long("student_context", "Descripción del contexto real de los alumnos", "", false), select("source_mode", "Fuente de planificación", ["Tema libre", "Libro del Estado", "Apuntes o texto base"]), text("session_topic", "Tema específico"), text("unit_title", "Título de la unidad", false), long("unit_purpose", "Propósito de la unidad", "", false), select("academic_period", "Periodo académico", ["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4", "Trimestre 1", "Trimestre 2", "Trimestre 3"]), select("shift", "Turno", ["Mañana", "Tarde", "Noche"]), text("state_book", "Seleccionar libro del Estado", false, "Ej. Texto escolar de Comunicación 3"), text("page_range", "Rango de páginas", false, "Ej. 24-29"), long("source_content", "Contenido, texto o apuntes", "", false)]),
    step("purpose", "Propósito", "Alineación curricular de la sesión.", [text("session_title", "Título de la sesión", false), long("competencies", "Competencias y capacidades"), long("transversal_competency", "Competencia transversal", "", false), multi("transversal_approaches", "Enfoques transversales", ["Derechos", "Inclusivo", "Intercultural", "Igualdad de género", "Ambiental", "Bien común", "Excelencia"], false), long("performance", "Desempeño precisado"), long("purpose", "Propósito de aprendizaje"), long("evidence", "Evidencia esperada")]),
    step("sequence", "Secuencia", "Inicio, desarrollo y cierre con tiempos.", [number("duration_minutes", "Duración total (minutos)", 30, 240), long("opening", "Inicio: motivación, saberes previos y conflicto cognitivo"), long("development", "Desarrollo: mediación y actividades"), long("closure", "Cierre: metacognición y compromiso")]),
    step("assessment", "Evaluación", "Criterios, instrumento y retroalimentación.", [long("criteria", "Criterios de evaluación"), select("instrument", "Instrumento", ["Lista de cotejo", "Rúbrica", "Escala de estimación", "Ficha de observación"]), long("feedback", "Estrategia de retroalimentación"), long("student_names", "Nómina de estudiantes", "Uno por línea", false)]),
    step("resources", "Recursos", "Materiales, referencias y accesibilidad.", [long("materials", "Materiales concretos"), long("digital_resources", "Recursos digitales", "", false), long("bibliography", "Bibliografía y referencias", "", false), long("dua_adjustments", "Ajustes DUA y barreras del grupo", "", false), cards("include_nee", "Incluir atención NEE / DUA", ["Sí", "No"], false), cards("include_theory", "Incluir fundamento teórico", ["Sí", "No"], false), cards("include_worksheet", "Incluir ficha de aplicación", ["Sí", "No"], false)]),
  ], ["Datos informativos", "Título y propósito", "Competencias y desempeño", "Evidencia y criterios", "Inicio", "Desarrollo", "Cierre", "Evaluación y retroalimentación", "Recursos", "Ajustes DUA"]),

  define("planificamos", "situacion-significativa", "media", "documento", "/dashboard/planificamos/situacion-significativa", [official(), step("context", "Contexto", "Marco y problemática local.", [text("unit_title", "Título de la unidad didáctica"), select("situation_axis", "Eje de situación significativa", ["Ambiental", "Salud", "Convivencia", "Ciudadanía", "Economía", "Cultura", "Tecnología"]), long("context_description", "Contexto local / problemática")]), step("challenge", "Reto", "Pregunta y justificación del aprendizaje.", [long("challenge_question", "Pregunta retadora"), long("learning_justification", "Justificación del aprendizaje")]), step("review", "Propósito y producto", "Competencias, enfoques, producto y evaluación.", [long("articulated_competencies", "Competencias articuladas"), long("transversal_approaches", "Enfoques transversales"), long("expected_product", "Producto integrador"), long("evaluation_criteria", "Criterios de evaluación")])], ["Marco y contexto", "Pregunta retadora", "Justificación", "Competencias articuladas", "Enfoques transversales", "Producto integrador", "Criterios de evaluación"]),
  define("planificamos", "proyectos-integrados", "alta", "documento", "/dashboard/planificamos/proyectos-integrados", [official("Datos del equipo", false), step("project", "Proyecto", "Identidad y articulación interdisciplinaria.", [text("project_name", "Nombre del proyecto integrador"), multi("involved_areas", "Áreas curriculares involucradas", areas), text("coauthors", "Docentes coautores / equipo"), long("challenging_situation", "Situación desafiante")]), step("design", "Diseño", "Competencias, enfoques y producto.", [long("competency_matrix", "Matriz de competencias por área"), long("approaches_and_product", "Enfoques transversales y producto integrador")]), step("route", "Ruta", "Fases, metodología, roles y recursos.", [long("phase_sequence", "Secuencia de fases y metodología"), long("roles_and_resources", "Roles, recursos y aliados")]), step("assessment", "Evaluación", "Criterios e instrumentos integrados.", [long("interdisciplinary_criteria", "Criterios interdisciplinarios"), long("assessment_instruments", "Instrumentos de evaluación")])], ["Situación desafiante", "Matriz de competencias", "Enfoques y producto", "Fases y metodología", "Roles y recursos", "Criterios interdisciplinarios", "Instrumentos"]),
  define("planificamos", "adaptacion-nee-dua", "alta", "documento", "/dashboard/planificamos/adaptacion-nee-dua", [official(), step("student", "Estudiante y barreras", "Identifica el grupo focal, la condición NEE y las barreras BAP.", [text("student_name", "Estudiante o grupo focal"), text("condition", "Condición / necesidad educativa especial"), long("barriers", "Barreras para el aprendizaje y la participación (BAP)")]), step("dua", "Matriz DUA", "Define los tres principios de acceso y participación.", [long("dua_engagement", "Principio I: compromiso y motivación"), long("dua_representation", "Principio II: representación y acceso"), long("dua_expression", "Principio III: acción y expresión")]), step("curriculum", "Adaptaciones curriculares", "Ajusta desempeños, criterios, tiempos y evaluación.", [long("performance_adjustments", "Adaptación de desempeños y criterios"), long("assessment_adjustments", "Adaptación de tiempos y evaluación")]), step("followup", "Acompañamiento", "Organiza el apoyo del aula, la familia y SAANEE.", [long("classroom_support", "Acompañamiento en el aula"), long("family_saanee_guidance", "Pautas para la familia y SAANEE")])], ["Perfil del estudiante", "Barreras BAP", "Matriz de los tres principios DUA", "Adaptación de desempeños y evaluación", "Acompañamiento en aula", "Pautas para familia y SAANEE"]),
  define("planificamos", "tarea-extension-hogar", "media", "actividad", "/dashboard/planificamos/tarea-extension-hogar", [official(), step("task", "Tarea", "Propósito, fechas y contexto familiar.", [text("task_title", "Título de la tarea"), date("assigned_date", "Fecha de asignación"), date("due_date", "Fecha de entrega"), long("learning_purpose", "Propósito de aprendizaje"), long("family_context", "Condiciones del hogar y recursos disponibles", "", false)]), step("design", "Diseño", "Consigna segura, autónoma y pertinente.", [long("instructions", "Consigna paso a paso"), long("materials", "Materiales accesibles"), long("family_role", "Orientación para la familia"), long("dua_adjustments", "Ajustes DUA y apoyos en el hogar", "", false), long("evidence", "Producto o evidencia")]), step("assessment", "Evaluación", "Criterios de autoevaluación y devolución.", [long("criteria", "Criterios de logro"), long("reflection", "Preguntas de reflexión"), long("teacher_feedback", "Cómo se retroalimentará")])], ["Propósito", "Consigna paso a paso", "Materiales", "Participación de la familia", "Ajustes DUA", "Evidencia", "Criterios", "Autoevaluación"]),
  define("planificamos", "carpeta-pedagogica", "alta", "documento", "/dashboard/planificamos/carpeta-pedagogica", [official(false), step("identity", "Filosofía", "Identidad profesional y enfoque pedagógico.", [text("school_year", "Año lectivo"), text("teaching_load", "Carga horaria / áreas"), long("pedagogical_philosophy", "Ideario o filosofía pedagógica")]), step("management", "Calendarización", "Fechas, comisiones y responsabilidades.", [long("calendar_dates", "Calendarización y fechas clave"), long("committee_plan", "Plan de comisiones y responsabilidades")]), step("evidence", "Diagnóstico", "Características del aula y estilos de aprendizaje.", [long("classroom_diagnosis", "Diagnóstico del aula"), long("learning_styles", "Caracterización de estilos y ritmos de aprendizaje")]), step("review", "Portafolio", "Normas y estructura documental.", [long("coexistence_rules", "Normas y acuerdos de convivencia"), long("portfolio_structure", "Estructura del portafolio docente")])], ["Ideario pedagógico", "Calendarización", "Plan de comisiones", "Diagnóstico del aula", "Estilos de aprendizaje", "Normas de convivencia", "Estructura del portafolio"]),

  define("evaluamos", "rubrica-evaluacion", "media", "instrumento", "/dashboard/evaluamos/rubrica", [profile(), step("assessment", "Evaluación", "Competencia, desempeño y evidencia.", [text("competency", "Competencia a evaluar"), long("performance", "Desempeño específico", "", false), long("product", "Actividad, producto o evidencia"), number("criteria_count", "Número de criterios", 2, 8), select("scale", "Escala de calificación", ["CNEB: AD/A/B/C", "4 niveles descriptivos", "3 niveles descriptivos"])]), step("criteria", "Criterios", "Precisa foco y exigencia de la rúbrica.", [long("criteria_notes", "Criterios o aspectos obligatorios", "Un criterio por línea"), long("pedagogical_context", "Contexto pedagógico", "", false), select("rubric_type", "Tipo de rúbrica", ["Analítica", "Holística"])]), step("preview", "Resultado", "La IA generará descriptores observables y diferenciados.", [])], ["Propósito del instrumento", "Matriz de criterios y niveles", "Orientaciones de aplicación", "Retroalimentación sugerida"]),
  define("evaluamos", "lista-cotejo", "media", "instrumento", "/dashboard/evaluamos/lista-cotejo", [profile(), step("evidence", "Evidencia", "Actividad, producto y competencia.", [text("activity", "Actividad o producto a evaluar"), text("list_title", "Título de la lista", false), long("competency", "Competencia y desempeño"), number("criteria_count", "Número de indicadores", 3, 15)]), step("criteria", "Indicadores", "Conductas o rasgos verificables.", [long("additional_criteria", "Criterios adicionales", "Uno por línea", false), long("student_names", "Nombres de estudiantes", "Uno por línea", false), select("response_scale", "Registro", ["Sí / No", "Logrado / En proceso", "Sí / No / Observaciones"])]), step("preview", "Resultado", "La IA organizará la lista lista para aplicar.", [])], ["Datos del instrumento", "Indicadores observables", "Matriz de registro", "Observaciones y retroalimentación"]),
  define("evaluamos", "ficha-aprendizaje", "media", "recurso", "/dashboard/evaluamos/ficha-aprendizaje", [profile(), step("design", "Diseño", "Tema, tipo y cantidad de actividades.", [text("topic", "Tema específico"), select("worksheet_type", "Tipo de ficha", ["Práctica guiada", "Aplicación", "Refuerzo", "Metacognición"]), number("activity_count", "Número de actividades", 2, 12), select("difficulty", "Dificultad", ["Inicial", "Intermedia", "Desafiante"])]), step("content", "Contenido", "Propósito, instrucciones y apoyos.", [long("purpose", "Propósito de aprendizaje"), long("source_content", "Texto o contenido base", "", false), long("dua_supports", "Apoyos DUA", "", false)]), step("preview", "Resultado", "La IA construirá ejercicios y clave de respuestas.", [])], ["Propósito e instrucciones", "Activación", "Práctica guiada", "Aplicación", "Reto", "Metacognición", "Clave de respuestas"]),
  define("evaluamos", "examen", "media", "instrumento", "/dashboard/evaluamos/examen", [profile(), step("blueprint", "Especificaciones", "Temas, dificultad y distribución de preguntas.", [select("assessment_type", "Tipo de evaluación", ["Diagnóstica", "Formativa", "Sumativa", "Recuperación"]), select("difficulty", "Nivel de dificultad", ["Básico", "Intermedio", "Avanzado", "Mixto"]), long("topics", "Temas específicos a evaluar"), multi("question_formats", "Formatos de reactivos", ["Opción múltiple", "Respuesta corta", "Relacionar", "Verdadero/Falso", "Desarrollo"]), number("question_count", "Número total de preguntas", 5, 30), number("total_score", "Puntaje total del examen", 10, 100)]), step("alignment", "Alineación", "Competencias, criterios y condiciones.", [long("competencies", "Competencias y capacidades"), long("criteria", "Criterios de evaluación"), number("duration_minutes", "Duración (minutos)", 20, 180), long("accommodations", "Adecuaciones o apoyos", "", false)]), step("preview", "Resultado", "La IA generará examen, puntaje y clave.", [])], ["Instrucciones", "Matriz de especificaciones", "Preguntas", "Puntaje", "Clave de respuestas", "Criterios de corrección"]),
  define("evaluamos", "escala-estimacion", "breve", "instrumento", "/dashboard/evaluamos/escala-estimacion", [profile(), step("scale", "Escala", "Actividad, criterios y niveles de valoración.", [text("activity", "Actividad o producto"), number("criteria_count", "Número de criterios", 2, 10), select("scale_type", "Escala de valoración", ["Siempre / A veces / Nunca", "Logrado / En proceso / Inicio", "1 a 4", "Frecuencia de 1 a 5"]), long("criteria_notes", "Criterios obligatorios", "", false)]), step("preview", "Resultado", "La IA redactará indicadores observables.", [])], ["Datos de aplicación", "Escala", "Indicadores", "Matriz de valoración", "Orientaciones"]),
  define("evaluamos", "preguntas-texto", "media", "instrumento", "/dashboard/evaluamos/preguntas-texto", [official(), step("text", "Texto", "Lectura o contenido sobre el que se evaluará.", [text("reading_title", "Título de la lectura / tema"), select("text_type", "Tipo textual", ["Narrativo", "Expositivo", "Argumentativo", "Instructivo", "Poético", "Discontinuo"]), long("source_text", "Texto base"), select("question_format", "Formato", ["Abiertas", "Opción múltiple", "Mixtas"])]), step("levels", "Niveles", "Cantidad y foco de las preguntas.", [number("literal_count", "Preguntas literales", 0, 10), number("inferential_count", "Preguntas inferenciales", 0, 10), number("critical_count", "Preguntas crítico-reflexivas", 0, 10), long("cneb_capacities", "Capacidades CNEB a movilizar"), long("criteria", "Criterios de evaluación")]), step("accessibility", "Accesibilidad", "Apoyos y retroalimentación.", [long("dua_adjustments", "Ajustes DUA", "", false), long("feedback_guidance", "Orientaciones de retroalimentación", "", false)]), step("preview", "Resultado", "La IA generará preguntas, claves y justificación.", [])], ["Texto o síntesis", "Preguntas literales", "Preguntas inferenciales", "Preguntas crítico-reflexivas", "Clave y respuestas esperadas", "Criterios y retroalimentación"]),
  define("evaluamos", "ficha-observacion", "media", "instrumento", "/dashboard/evaluamos/ficha-observacion", [official(), step("observation", "Observación", "Sujeto, tipo y foco de observación.", [select("sheet_type", "Tipo de ficha", ["Individual", "Grupal", "Aula", "Desempeño docente"]), text("observed_subject", "Estudiante, equipo o situación"), text("observation_focus", "Foco de desempeño"), select("scale_type", "Escala cualitativa", ["Descriptiva", "AD/A/B/C", "Frecuencia"]), long("criteria", "Criterios o conductas observables")]), step("evidence", "Evidencias", "Hechos observados y contexto.", [long("observed_facts", "Hechos objetivos observados"), long("context_factors", "Factores de contexto"), long("interpretation", "Interpretación pedagógica")]), step("followup", "Seguimiento", "Conclusiones y compromisos.", [long("conclusion", "Conclusión"), long("commitments", "Compromisos y acciones")])], ["Datos de observación", "Criterios", "Registro de hechos", "Análisis pedagógico", "Conclusión", "Compromisos"]),
  define("evaluamos", "registros-auxiliares", "alta", "instrumento", "/dashboard/evaluamos/registros-auxiliares", [official(), step("period", "Periodo", "Escala, competencia e instrumento.", [text("academic_period", "Periodo lectivo"), select("official_scale", "Escala oficial", ["AD/A/B/C", "Literal EBA", "Numérica"]), long("competencies", "Competencias CNEB"), long("criteria", "Criterios de evaluación"), text("instrument", "Instrumento aplicado"), text("final_evidence", "Evidencia final")]), step("students", "Estudiantes", "Nómina y datos de asistencia.", [long("student_names", "Nómina de estudiantes", "Uno por línea"), number("student_count", "Total de estudiantes", 1, 80), number("average_attendance", "Asistencia promedio (%)", 0, 100), number("frequent_tardiness", "Tardanzas frecuentes", 0, 80), number("unjustified_absences", "Inasistencias injustificadas", 0, 80), long("attendance_observations", "Observaciones de asistencia")]), step("analysis", "Conclusiones", "Balance y decisiones pedagógicas.", [long("in_progress_conclusions", "Conclusiones de estudiantes en inicio o proceso"), long("achieved_conclusions", "Conclusiones de estudiantes en logro esperado o destacado"), long("support_actions", "Acciones de mejora y apoyo")])], ["Datos del periodo", "Matriz de estudiantes y competencias", "Asistencia", "Conclusiones descriptivas", "Acciones de mejora"]),
  define("evaluamos", "carpetas-recuperacion", "alta", "documento", "/dashboard/evaluamos/carpetas-recuperacion", [official(), step("diagnosis", "Diagnóstico", "Grupo destinatario y necesidades.", [text("target_group", "Grupo destinatario / cantidad"), text("application_period", "Periodo de aplicación"), long("diagnosis", "Diagnóstico de necesidades"), long("prioritized_competencies", "Competencias priorizadas")]), step("design", "Diseño", "Criterios, evidencias y secuencia.", [long("criteria", "Criterios"), long("evidence", "Evidencias esperadas"), long("activity_sequence", "Secuencia de actividades"), long("resources", "Recursos")]), step("schedule", "Cronograma", "Aplicación y acompañamiento.", [long("timeline", "Cronograma"), long("family_guidance", "Orientaciones para la familia"), long("feedback", "Retroalimentación y seguimiento")])], ["Diagnóstico", "Competencias priorizadas", "Criterios y evidencias", "Actividades de recuperación", "Cronograma", "Orientaciones familiares", "Seguimiento"]),
  define("evaluamos", "calificador-rubrica", "alta", "analisis", "/dashboard/evaluamos/calificador-rubrica", [official(), step("rubric", "Rúbrica", "Escala, criterios y evidencia evaluada.", [select("grading_scale", "Escala de calificación", ["AD/A/B/C", "4 niveles", "0–20"]), text("evidence_name", "Nombre de la evidencia"), long("rubric", "Rúbrica o criterios de evaluación")]), step("student", "Evidencia", "Datos del estudiante y producción.", [text("student_name", "Apellidos y nombres"), text("student_code", "Código / número de orden", false), long("student_evidence", "Texto o transcripción de la evidencia")]), step("review", "Revisión", "La decisión final siempre queda en manos del docente.", [long("analysis_breakdown", "Desglose del análisis por criterio"), long("detected_strengths", "Fortalezas detectadas"), long("improvement_guidance", "Pautas de mejora y retroalimentación"), long("teacher_adjustments", "Indicaciones o ajustes finales del docente", "", false)])], ["Nivel de logro sugerido", "Análisis por criterio", "Fortalezas", "Aspectos por mejorar", "Retroalimentación descriptiva", "Advertencia de revisión docente"]),
  define("evaluamos", "retroalimentacion-formativa", "media", "documento", "/dashboard/evaluamos/retroalimentacion-formativa", [official(), step("focus", "Enfoque y evidencia", "Evidencia evaluada, competencia y criterios.", [text("evidence_title", "Título de la evidencia o producto"), long("competency", "Competencia y capacidades CNEB"), long("criteria", "Criterios de evaluación aplicados"), select("feedback_model", "Modelo de retroalimentación", ["Escalera de Wilson (Clarificar, Valorar, Inquietudes, Sugerencias)", "Retroalimentación descriptiva CNEB", "Modelo de 3 preguntas (Hattie y Timperley)"])]), step("steps", "Peldaños de retroalimentación", "Desarrollo de las orientaciones para el estudiante.", [long("clarify", "Peldaño 1: Clarificar (Preguntas aclaratorias)"), long("value", "Peldaño 2: Valorar (Aspectos positivos y fortalezas)"), long("concerns", "Peldaño 3: Expresar inquietudes (Dudas y preguntas reflexivas)"), long("suggestions", "Peldaño 4: Hacer sugerencias (Pautas de mejora)")])], ["Datos informativos", "Peldaño 1: Clarificar", "Peldaño 2: Valorar", "Peldaño 3: Expresar inquietudes", "Peldaño 4: Hacer sugerencias", "Orientaciones docentes"]),
  define("evaluamos", "analytics-alertas", "alta", "analisis", "/dashboard/evaluamos/analytics-alertas", [official(), step("metrics", "Indicadores", "Datos cuantitativos del periodo.", [text("academic_period", "Periodo lectivo"), number("student_count", "Total de estudiantes", 1, 80), number("approved_percent", "% aprobados AD/A", 0, 100), number("risk_percent", "% en riesgo B/C", 0, 100), number("attendance_percent", "% asistencia promedio", 0, 100), long("diagnostic_summary", "Resumen diagnóstico de desempeño y asistencia")]), step("evidence", "Diagnóstico", "Señales cualitativas y desempeño por competencia.", [long("academic_alerts", "Alertas académicas"), long("attendance_alerts", "Alertas de asistencia y aspectos socioemocionales"), long("competency_analysis", "Análisis por competencias"), long("context_factors", "Factores asociados")]), step("actions", "Intervención", "Prioriza medidas y derivaciones.", [long("intervention_actions", "Acciones de intervención"), long("referrals", "Compromisos, derivaciones o coordinación", "", false)])], ["Resumen ejecutivo", "Indicadores", "Tendencias", "Alertas priorizadas", "Análisis de causas", "Plan de intervención", "Seguimiento"]),

  define("incluimos", "adaptacion-nee-dua", "alta", "documento", "/dashboard/incluimos/adaptacion-nee-dua", [
    official(),
    step("student", "Estudiante y barreras", "Selecciona el caso desde tu nómina y registra únicamente datos pedagógicos necesarios.", [
      rosterStudent("student_name", "Estudiante o grupo focal"),
      select("attention_scope", "Alcance de la adaptación", ["Estudiante individual", "Pequeño grupo", "Aula completa"]),
      radio("community_context", "Contexto de la institución", ["Urbano", "Rural", "Rural multigrado"]),
      text("condition", "Necesidad educativa / condición relevante", false, "Ej. Dificultad específica de aprendizaje; evita diagnósticos innecesarios"),
      long("strengths_interests", "Fortalezas, intereses y apoyos que ya funcionan"),
      long("barriers", "Barreras para el aprendizaje y la participación (BAP)", "Ej. Las instrucciones extensas y solo escritas dificultan que participe al inicio de la actividad.")
    ]),
    step("dua", "Matriz DUA", "Define medidas concretas para participación, acceso y demostración del aprendizaje.", [
      long("dua_engagement", "Principio I: compromiso y motivación", "Ej. Ofrecer elección entre dos retos, anticipar la rutina con pictogramas y reconocer avances pequeños."),
      long("dua_representation", "Principio II: representación y acceso", "Ej. Combinar explicación oral breve, modelo visual y material manipulable."),
      long("dua_expression", "Principio III: acción y expresión", "Ej. Permitir responder oralmente, con organizador gráfico o mediante una producción breve.")
    ]),
    step("curriculum", "Adaptaciones curriculares", "Ajusta lo necesario sin bajar la expectativa pedagógica ni sustituir el aprendizaje.", [
      text("competency_focus", "Competencia o área priorizada"),
      long("performance_adjustments", "Adaptación de desempeños y criterios", "Ej. Mantener la competencia y graduar el desempeño: identifica idea principal con dos apoyos visuales."),
      long("assessment_adjustments", "Adaptación de tiempos, evidencias y evaluación", "Ej. Tiempo adicional, instrucciones segmentadas y evidencia oral apoyada con imágenes."),
      long("access_resources", "Recursos de accesibilidad y materiales")
    ]),
    step("followup", "Acompañamiento", "Acuerda apoyos, responsables, evidencias y fechas de revisión con familia y SAANEE cuando corresponda.", [
      long("classroom_support", "Acompañamiento en el aula"),
      long("family_saanee_guidance", "Pautas para la familia y SAANEE"),
      date("review_date", "Fecha de revisión"),
      long("progress_evidence", "Evidencias que se revisarán")
    ])
  ], ["Datos del caso", "Fortalezas y BAP", "Matriz DUA", "Ajustes curriculares", "Evidencias de aprendizaje", "Apoyos en aula", "Acuerdos con familia", "Seguimiento" ]),
  define("incluimos", "plan-atencion", "alta", "documento", "/dashboard/incluimos/plan-atencion", [
    official(false),
    step("student", "Caso y contexto", "Completa los datos indispensables del caso. Los ejemplos te orientan; no reemplazan tu criterio profesional.", [
      rosterStudent("student_name", "Nombre del estudiante"),
      number("age", "Edad", 2, 30),
      radio("community_context", "Contexto de la institución", ["Urbano", "Rural", "Rural multigrado"]),
      text("condition", "Necesidad educativa o condición relevante", false, "Ej. Dificultad específica de aprendizaje"),
      long("psychopedagogical_report", "Informe psicopedagógico / SAANEE", "Resume solo los apoyos pedagógicos pertinentes; no copies datos clínicos sensibles.", false),
      long("diagnosis", "Diagnóstico pedagógico y antecedentes", "Ej. Reconoce palabras frecuentes; aún requiere mediación para comprender instrucciones de dos pasos.")
    ]),
    step("profile", "Perfil funcional", "Parte de capacidades observables, intereses y barreras que afectan la participación.", [
      long("talents", "Talentos, intereses y estilo de aprendizaje", "Ej. Responde mejor con secuencias visuales, música y tareas cortas con propósito claro."),
      long("autonomy", "Autonomía, comunicación y habilidades sociales"),
      long("academic_performance", "Desempeño actual, capacidades y barreras")
    ]),
    step("adaptations", "DUA y adaptaciones", "Organiza apoyos que permitan participar, acceder al contenido y demostrar el aprendizaje.", [
      long("dua_supports", "Medidas DUA: implicación, representación y expresión"),
      long("performance_adaptations", "Adaptaciones en desempeños y criterios"),
      long("methodology_adaptations", "Adaptaciones metodológicas, recursos y tiempos"),
      long("assessment_adaptations", "Adaptaciones en evaluación y evidencias"),
      long("supports", "Apoyos especializados y coordinaciones")
    ]),
    step("plan", "Metas y seguimiento", "Define metas observables, responsables y una fecha real para revisar avances y reajustar.", [
      select("plan_period", "Periodo del plan", ["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4", "Trimestre 1", "Trimestre 2", "Trimestre 3"]),
      date("start_date", "Fecha de inicio"),
      date("review_date", "Fecha de revisión"),
      long("goals", "Metas a corto y mediano plazo", "Ej. En seis semanas, seguirá una consigna visual de tres pasos en 4 de 5 oportunidades."),
      long("school_commitments", "Compromisos y responsables de la escuela"),
      long("family_commitments", "Compromisos y pautas para el hogar"),
      long("progress_evidence", "Evidencias y decisiones de seguimiento")
    ])
  ], ["Datos del estudiante", "Contexto y diagnóstico", "Perfil funcional", "Barreras y fortalezas", "Medidas DUA", "Adaptaciones", "Metas", "Apoyos y responsables", "Seguimiento"]),
  define("incluimos", "estrategias-inclusion", "media", "documento", "/dashboard/incluimos/estrategias-inclusion", [official(), step("classroom", "Aula", "Composición y dinámica social.", [number("student_count", "Total de estudiantes", 1, 80), multi("present_challenges", "Desafíos presentes", ["Discapacidad", "Dificultades de aprendizaje", "Diversidad lingüística", "Riesgo socioemocional", "Altas capacidades"]), long("social_dynamics", "Dinámica social actual"), text("inclusion_goal", "Objetivo de inclusión")]), step("strategy", "Estrategias", "Participación, empatía y apoyos.", [select("methodology", "Metodología priorizada", ["Aprendizaje cooperativo", "DUA", "ABP", "Tutoría entre pares", "Estaciones"]), long("empathy_activities", "Dinámicas de empatía y equipo"), long("time_adjustments", "Adecuaciones de tiempos"), long("visual_supports", "Apoyos visuales, auditivos o concretos")]), step("assessment", "Evaluación", "Monitoreo y retroalimentación inclusiva.", [long("participation_indicators", "Indicadores de participación"), long("feedback", "Retroalimentación y ajustes")])], ["Diagnóstico del aula", "Objetivo de inclusión", "Estrategias", "Dinámicas", "Ajustes", "Apoyos", "Indicadores", "Seguimiento"]),
  define("incluimos", "trabajo-familias", "media", "comunicacion", "/dashboard/incluimos/trabajo-familias", [official(false), step("meeting", "Encuentro", "Motivo, modalidad y diagnóstico compartido.", [select("meeting_mode", "Modalidad del encuentro", ["Entrevista individual", "Reunión grupal", "Taller", "Visita / coordinación virtual"]), text("reason", "Tema o motivo principal"), long("diagnosis", "Puntos diagnósticos a informar"), long("home_barriers", "Barreras expresadas por la familia")]), step("agreements", "Acuerdos", "Rutinas, comunicación y compromisos.", [long("home_routines", "Pautas de rutina y estudio en casa"), select("communication_channel", "Canal de comunicación", ["Cuaderno de control", "WhatsApp institucional", "Correo", "Llamada", "Reunión"]), long("communication_frequency", "Frecuencia y pautas de comunicación"), long("family_commitments", "Acuerdos específicos de la familia"), long("school_commitments", "Soportes diferenciados de la escuela")]), step("followup", "Seguimiento", "Fecha, evidencia y evaluación del acuerdo.", [date("followup_date", "Fecha de seguimiento"), long("followup_evidence", "Evidencias esperadas")])], ["Motivo", "Diagnóstico compartido", "Orientaciones para el hogar", "Compromisos familiares", "Compromisos escolares", "Canales y seguimiento"]),
  define("incluimos", "seguimiento-evaluacion", "alta", "analisis", "/dashboard/incluimos/seguimiento-evaluacion", [official(false), step("student", "Estudiante", "Condición, periodo y apoyos implementados.", [text("student_name", "Nombre del estudiante"), text("condition", "Condición / NEE / diagnóstico"), text("evaluation_period", "Periodo evaluado"), long("implemented_adaptations", "Adaptaciones implementadas")]), step("progress", "Progreso", "Avances pedagógicos y socioemocionales.", [long("pedagogical_progress", "Progreso pedagógico"), long("socioemotional_progress", "Progreso socioemocional"), long("effective_supports", "Apoyos efectivos"), long("persistent_difficulties", "Dificultades persistentes")]), step("adjustments", "Reajustes", "Decisiones DUA y coordinación con familia.", [long("dua_adjustments", "Reajustes DUA"), long("family_recommendations", "Recomendaciones para la familia"), long("next_goals", "Próximas metas")])], ["Resumen del periodo", "Avances", "Dificultades", "Efectividad de apoyos", "Reajustes DUA", "Recomendaciones", "Próximas metas"]),

  define("reforzamos", "trabajo-autonomo", "media", "actividad", "/dashboard/reforzamos/trabajo-autonomo", [profile(), step("focus", "Foco", "Competencia, tema y duración.", [text("competency", "Competencia o capacidad a reforzar"), text("worksheet_title", "Tema / título"), text("estimated_duration", "Duración estimada en casa"), long("family_guidance", "Pautas para la familia", "", false)]), step("activity", "Actividad", "Explicación, práctica y reflexión.", [long("what_to_learn", "¿Qué aprenderé?"), long("exercises", "Ejercicios, problemas o retos"), long("reflection", "Metacognición y autoevaluación")]), step("preview", "Resultado", "La IA preparará una ficha autónoma y accesible.", [])], ["Meta de aprendizaje", "Explicación amigable", "Ejemplos", "Práctica autónoma", "Reto", "Autoevaluación", "Orientaciones familiares"]),
  define("reforzamos", "carpeta-recuperacion", "alta", "documento", "/dashboard/reforzamos/carpeta-recuperacion", [profile(), step("scope", "Alcance", "Periodo, secciones y estudiantes.", [select("academic_period", "Periodo", ["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4", "Trimestre 1", "Trimestre 2", "Trimestre 3"]), number("school_year", "Año lectivo", 2025, 2035), text("sections", "Secciones"), long("topics", "Temas o competencias por reforzar"), long("student_assignments", "Estudiantes y necesidad asignada", "Uno por línea")]), step("route", "Ruta", "Actividades diferenciadas y evidencias.", [long("diagnosis", "Diagnóstico"), long("activity_route", "Ruta de actividades"), long("evidence", "Evidencias"), long("criteria", "Criterios")]), step("followup", "Seguimiento", "Cronograma, retroalimentación y familia.", [long("timeline", "Cronograma"), long("feedback", "Retroalimentación"), long("family_guidance", "Orientaciones familiares")])], ["Diagnóstico", "Competencias priorizadas", "Ruta diferenciada", "Actividades", "Evidencias", "Criterios", "Cronograma", "Orientaciones"]),
  define("reforzamos", "monitorea-avances", "alta", "analisis", "/dashboard/reforzamos/monitorea-avances", [
    profile(),
    step("baseline", "Periodo y línea base", "Elige el bimestre o registra un rango de fechas; después vincula la capacidad y el desempeño que observarás.", [
      select("monitoring_period", "Bimestre / periodo", ["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4", "Trimestre 1", "Trimestre 2", "Trimestre 3", "Otro rango"]),
      date("period_start", "Fecha de inicio"),
      date("period_end", "Fecha de cierre"),
      rosterGroup("target_students", "Aula o estudiantes a monitorear", "multiple"),
      text("competency", "Competencia priorizada", true, "Ej. Resuelve problemas de cantidad"),
      text("capacity", "Capacidad seleccionada", true, "Ej. Comunica su comprensión sobre los números y las operaciones"),
      long("expected_performance", "Desempeño esperado", "Ej. Explica con material concreto cómo resolvió un problema aditivo de una etapa."),
      number("starting_students", "Estudiantes en inicio (C)", 0, 80)
    ]),
    step("milestones", "Evidencias y avances", "Registra tres evidencias concretas. El seguimiento debe mostrar qué cambió y qué apoyo se mantendrá.", [
      long("milestone_1", "Evidencia / avance 1", "Ej. Semana 1: resuelve con material base diez y explica el procedimiento con una pregunta guía."),
      long("milestone_2", "Evidencia / avance 2", "Ej. Semana 2: representa el problema con dibujo y selecciona la operación adecuada."),
      long("milestone_3", "Evidencia / avance 3", "Ej. Semana 3: resuelve una situación similar sin material, justificando la respuesta."),
      long("qualitative_notes", "Notas cualitativas y retroalimentación"),
      long("socioemotional_notes", "Asistencia, bienestar y factores que influyen")
    ]),
    step("groups", "Decisiones pedagógicas", "Agrupa con flexibilidad según evidencia, sin etiquetar de forma permanente, y define el siguiente apoyo.", [
      long("advanced_group", "Estudiantes con avance consolidado y reto siguiente"),
      long("intermediate_group", "Estudiantes en proceso y andamiaje que requieren"),
      long("priority_group", "Estudiantes prioritarios y apoyo inmediato"),
      long("support_strategies", "Estrategias, responsables y fecha de reajuste")
    ])
  ], ["Periodo de observación", "Capacidad y desempeño", "Línea base", "Evidencias por hito", "Análisis cualitativo", "Alertas de contexto", "Agrupamiento flexible", "Acciones siguientes"]),
  define("reforzamos", "acompanamiento-motivacion", "media", "documento", "/dashboard/reforzamos/acompanamiento-motivacion", [profile(false), step("student", "Estudiante", "Estado emocional e intereses.", [text("student_name", "Estudiante o grupo"), select("emotional_state", "Estado emocional principal", ["Ansiedad", "Desmotivación", "Frustración", "Baja autoestima", "Aislamiento", "Otro"]), select("frequency", "Frecuencia", ["Ocasional", "Semanal", "Frecuente", "Permanente"]), long("interests", "Intereses y gustos"), long("home_support", "Acompañamiento en casa")]), step("plan", "Motivación", "Reconocimiento, micro-metas y mensajes.", [select("recognition_channel", "Canal de reconocimiento", ["Conversación individual", "Mensaje escrito", "Reconocimiento en aula", "Comunicación a familia"]), long("observations", "Observaciones"), long("micro_goals", "Micro-metas"), long("student_message", "Mensaje para el estudiante"), long("family_message", "Mensaje para la familia")]), step("followup", "Seguimiento", "Acuerdos y fecha de revisión.", [date("review_date", "Fecha de revisión"), long("commitments", "Compromisos")])], ["Lectura socioemocional", "Fortalezas", "Micro-metas", "Acciones motivacionales", "Mensaje al estudiante", "Mensaje a la familia", "Seguimiento"]),
  define("reforzamos", "plan-refuerzo", "alta", "documento", "/dashboard/reforzamos/plan-refuerzo", [
    official(),
    step("diagnosis", "Diagnóstico", "Parte de evidencias del aula y de los estudiantes que requieren apoyo; no uses solo una cantidad de páginas o fichas.", [
      select("reinforcement_period", "Bimestre / periodo", ["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4", "Trimestre 1", "Trimestre 2", "Trimestre 3"]),
      rosterGroup("target_students", "Estudiantes que recibirán el refuerzo", "multiple"),
      number("student_count", "Total de estudiantes", 1, 80),
      number("priority_count", "Estudiantes en inicio (C)", 0, 80),
      number("progress_count", "Estudiantes en proceso (B)", 0, 80),
      long("diagnosis", "Diagnóstico basado en evidencias", "Ej. 8 estudiantes resuelven con material concreto, pero aún no explican por qué eligieron la operación.")
    ]),
    step("goals", "Meta y evaluación", "Selecciona la capacidad y el desempeño; plantea criterios observables, evidencia e instrumento.", [
      text("competency", "Competencia priorizada", true, "Ej. Resuelve problemas de cantidad"),
      text("capacity", "Capacidad priorizada", true, "Ej. Traduce cantidades a expresiones numéricas"),
      long("performance_goal", "Desempeño / meta concreta", "Ej. Resuelve problemas aditivos de una etapa y explica su estrategia con material o dibujo."),
      long("criterion_1", "Criterio 1", "Ej. Representa los datos y la operación pertinente"),
      long("criterion_2", "Criterio 2", "Ej. Explica el procedimiento y verifica el resultado"),
      long("final_product", "Producto o evidencia", "Ej. Resolución explicada de dos problemas contextualizados"),
      select("instrument", "Instrumento de evaluación", ["Rúbrica", "Lista de cotejo", "Escala de valoración", "Ficha de observación"])
    ]),
    step("actions", "Estrategias diferenciadas", "Detalla cómo se realizará el refuerzo para cada grupo: mediación, práctica, recursos y retroalimentación.", [
      long("priority_actions", "Acciones para grupo prioritario C", "Ej. Modelado paso a paso, material concreto, parejas de apoyo y una pregunta guía por vez."),
      long("consolidation_actions", "Acciones para grupo B", "Ej. Problemas con datos faltantes, comparación de estrategias y retroalimentación entre pares."),
      long("resources", "Recursos, materiales y ajustes DUA"),
      long("feedback_strategy", "Cómo se brindará retroalimentación y cuándo se reajustará")
    ]),
    step("schedule", "Sesiones y cronograma", "Programa de 1 a 3 sesiones por semana. Importa la calidad de la mediación y las evidencias, no la cantidad de hojas.", [
      select("plan_duration", "Duración del plan", ["2 semanas", "3 semanas", "4 semanas", "6 semanas", "8 semanas"]),
      radio("frequency", "Frecuencia de sesiones", ["1 sesión por semana", "2 sesiones por semana", "3 sesiones por semana"]),
      date("start_date", "Fecha de inicio"),
      date("review_date", "Fecha de revisión"),
      text("milestone_1", "Sesión / hito 1", true, "Ej. Diagnóstico breve y modelado con material concreto"),
      text("milestone_2", "Sesión / hito 2", false, "Ej. Práctica guiada con explicación de estrategias"),
      text("milestone_3", "Sesión / hito 3", false, "Ej. Aplicación autónoma y retroalimentación"),
      text("milestone_4", "Hito de cierre", false, "Ej. Evidencia final y reajuste individual")
    ]),
    step("commitments", "Compromisos y seguimiento", "Deja claro qué hará cada persona y cómo se comprobará el avance.", [
      long("teacher_commitments", "Compromisos del docente"),
      long("student_commitments", "Compromisos del estudiante"),
      long("family_commitments", "Compromisos y pautas para la familia"),
      long("followup_evidence", "Evidencias que se registrarán en el seguimiento")
    ])
  ], ["Diagnóstico", "Capacidad y desempeño", "Meta y criterios", "Acciones diferenciadas", "Recursos y DUA", "Sesiones y cronograma", "Evidencias", "Compromisos", "Seguimiento"]),

  define("acompanamos", "correo-familias", "media", "comunicacion", "/dashboard/acompanamos/correo-familias", [
    profile(false),
    step("recipient", "Destinatario", "Indica a quién se dirige el mensaje y hechos pedagógicos que sí pueden compartirse.", [
      rosterStudent("student_name", "Estudiante relacionado", false),
      text("guardian_name", "Nombre del apoderado", true, "Ej. Sra. Rosa Quispe"),
      select("email_category", "Categoría del correo", ["Reconocimiento", "Alerta académica", "Asistencia", "Convivencia", "Reunión", "Acuerdo"]),
      long("key_points", "Puntos clave a comunicar", "Ej. Valoro que participó al explicar su estrategia; acordemos revisar una rutina de lectura de 10 minutos."),
      long("facts_to_avoid", "Información que no debe incluirse", "Ej. Diagnósticos, comparaciones con otros estudiantes o conclusiones no verificadas.", false)
    ]),
    step("tone", "Enfoque y acuerdo", "Elige un tono respetuoso, una acción clara y una fecha razonable de respuesta o seguimiento.", [
      select("tone", "Tono", ["Cordial y cercano", "Formal", "Empático y conciliador", "Directo y respetuoso"]),
      text("desired_action", "Acción esperada del apoderado", false, "Ej. Confirmar disponibilidad para una reunión breve o acompañar la rutina acordada."),
      date("reply_date", "Fecha sugerida para responder o dar seguimiento", false),
      text("communication_channel", "Canal de respuesta", false, "Ej. Correo institucional o cuaderno de control")
    ]),
    step("preview", "Resultado", "La IA redactará asunto y cuerpo editable. Revisa los hechos y copia el correo cuando esté listo.", [])
  ], ["Asunto", "Saludo personalizado", "Mensaje central", "Acción o acuerdo", "Fecha de seguimiento", "Cierre cordial"]),
  define("acompanamos", "respuesta-correo", "media", "comunicacion", "/dashboard/acompanamos/respuesta-correo", [profile(false), step("message", "Consulta", "Apoderado, estudiante y mensaje recibido.", [text("guardian_name", "Nombre del apoderado"), text("student_name", "Nombre del estudiante"), long("received_email", "Mensaje o consulta recibida"), select("response_intent", "Intención de la respuesta", ["Informar", "Aclarar", "Conciliar", "Solicitar reunión", "Confirmar acuerdo"])]), step("boundaries", "Criterios", "Tono, datos y límites de la respuesta.", [select("tone", "Tono", ["Empático", "Formal", "Conciliador", "Firme y respetuoso"]), long("facts_to_include", "Hechos que deben incluirse"), long("facts_to_avoid", "Datos que no deben afirmarse", "", false)]), step("preview", "Resultado", "La IA preparará asunto y respuesta revisable.", [])], ["Asunto sugerido", "Respuesta", "Acuerdo o siguiente paso", "Notas para revisión docente"]),
  define("acompanamos", "analytics-alertas", "alta", "analisis", "/dashboard/acompanamos/analytics-alertas", [profile(false), step("period", "Periodo", "Aspectos observados y características del grupo.", [text("period", "Periodo evaluado"), multi("observed_dimensions", "Dimensiones", ["Rendimiento", "Asistencia", "Convivencia", "Socioemocional"]), long("classroom_observations", "Características y observaciones del aula")]), step("data", "Datos", "Señales y casos que requieren priorización.", [long("academic_signals", "Señales académicas"), long("attendance_signals", "Señales de asistencia"), long("socioemotional_signals", "Señales socioemocionales"), long("priority_cases", "Casos o grupos prioritarios")]), step("actions", "Acciones", "Medidas, responsables y seguimiento.", [long("recommended_actions", "Acciones recomendadas"), long("responsibilities", "Responsables"), text("review_period", "Fecha / periodo de revisión")])], ["Panorama del aula", "Alertas priorizadas", "Factores asociados", "Casos de seguimiento", "Acciones y responsables", "Calendario de revisión"]),
  define("acompanamos", "calificador-ia", "alta", "analisis", "/dashboard/acompanamos/calificador-ia", [profile(), step("criteria", "Criterios", "Competencia, criterio, escala y rúbrica.", [text("competency", "Competencia CNEB"), long("criterion", "Capacidad / criterio"), select("grading_scale", "Escala", ["AD/A/B/C", "0–20", "4 niveles"]), long("rubric", "Descriptores de la rúbrica")]), step("evidence", "Evidencia", "Producción del estudiante.", [text("student_name", "Nombre del estudiante"), long("student_evidence", "Respuesta o transcripción de la evidencia")]), step("review", "Revisión", "La IA sugiere; el docente decide.", [long("teacher_notes", "Indicaciones del docente", "", false)])], ["Nivel sugerido", "Análisis por criterio", "Evidencias citadas", "Fortalezas", "Mejoras", "Retroalimentación", "Control docente"]),
  define("acompanamos", "reporte-seguimiento", "media", "documento", "/dashboard/acompanamos/reporte-seguimiento", [profile(false), step("case", "Seguimiento", "Estudiante, tipo y periodo.", [text("student_name", "Estudiante o nivel de aula"), select("followup_type", "Tipo de seguimiento", ["Académico", "Asistencia", "Convivencia", "Socioemocional", "Compromisos familiares"]), text("observation_period", "Periodo de observación")]), step("balance", "Balance", "Avances, dificultades y acuerdos.", [long("progress", "Avances"), long("difficulties", "Dificultades"), long("commitments", "Compromisos")]), step("next", "Próximos pasos", "Responsables y fecha de revisión.", [long("next_actions", "Acciones siguientes"), long("responsibilities", "Responsables"), date("review_date", "Fecha de revisión")])], ["Datos del seguimiento", "Avances", "Dificultades", "Compromisos", "Acciones siguientes", "Responsables y fecha"]),

  define("tutoria", "plan-tutoria", "alta", "documento", "/dashboard/tutoria/plan-tutoria", [official("Datos de tutoría", false), step("group", "Grupo", "Organización, periodo y diagnóstico.", [select("classroom_type", "Tipo de aula", ["Unigrado", "Multigrado"]), text("sections", "Secciones / grados"), number("school_year", "Año lectivo", 2025, 2035), select("period", "Periodo", ["Anual", "Semestral", "Bimestral"]), long("diagnosis", "Diagnóstico de necesidades"), long("student_names", "Nómina", "Uno por línea", false)]), step("objectives", "Objetivos", "Dimensiones, objetivos y prioridades.", [multi("dimensions", "Dimensiones TOE", ["Personal", "Social", "Aprendizajes", "Convivencia", "Participación", "Orientación vocacional"]), long("objectives", "Objetivos"), long("priorities", "Prioridades")]), step("actions", "Acciones", "Sesiones, atención individual y familias.", [long("group_sessions", "Sesiones grupales"), long("individual_attention", "Atención individual"), long("family_actions", "Trabajo con familias"), long("community_actions", "Articulación y derivación", "", false)]), step("schedule", "Cronograma", "Actividades, responsables y evaluación.", [long("timeline", "Cronograma"), long("resources", "Recursos"), long("evaluation", "Evaluación del plan")])], ["Datos informativos", "Diagnóstico", "Objetivos", "Dimensiones TOE", "Plan de sesiones", "Atención individual", "Trabajo con familias", "Cronograma", "Evaluación"]),
  define("tutoria", "sesiones-tutoria", "media", "documento", "/dashboard/tutoria/sesiones-tutoria", [profile(false), step("purpose", "Propósito", "Dimensión, tema y logro.", [select("toe_dimension", "Dimensión TOE", ["Personal", "Social", "Aprendizajes", "Convivencia", "Participación", "Orientación vocacional"]), text("session_title", "Título / tema"), long("achievement", "Logro o meta"), number("duration_minutes", "Duración", 30, 120)]), step("sequence", "Secuencia", "Actividades de inicio, desarrollo y cierre.", [long("opening", "Inicio"), long("development", "Desarrollo"), long("closure", "Cierre y compromisos")]), step("support", "Soporte", "Recursos, evaluación y alertas.", [long("resources", "Recursos"), long("evaluation", "Cómo se evaluará"), long("safeguards", "Cuidados y rutas de derivación", "", false)])], ["Propósito", "Inicio", "Desarrollo", "Cierre", "Compromisos", "Recursos", "Evaluación"]),
  define("tutoria", "informe-tutoria", "alta", "documento", "/dashboard/tutoria/informe-tutoria", [profile(false), step("period", "Periodo", "Tipo de informe y población atendida.", [select("report_period", "Periodo", ["Bimestre", "Trimestre", "Semestre", "Anual"]), text("report_date", "Fecha del informe"), long("student_names", "Estudiantes atendidos", "Uno por línea", false)]), step("actions", "Acciones", "Sesiones, atenciones y familias.", [long("group_sessions", "Sesiones realizadas"), long("individual_attention", "Atenciones individuales"), long("family_meetings", "Reuniones con familias")]), step("balance", "Balance", "Logros, dificultades y casos.", [long("achievements", "Logros socioemocionales"), long("difficulties", "Dificultades"), long("cases", "Casos y derivaciones", "", false)]), step("recommendations", "Recomendaciones", "Acuerdos y próximo periodo.", [long("recommendations", "Recomendaciones"), long("next_actions", "Acciones siguientes")])], ["Resumen ejecutivo", "Acciones realizadas", "Atenciones", "Trabajo con familias", "Logros", "Dificultades", "Casos", "Recomendaciones"]),
  define("tutoria", "informe-padres", "media", "documento", "/dashboard/tutoria/informe-padres", [profile(false), step("meeting", "Atención", "Participantes, fecha y motivo.", [date("meeting_date", "Fecha"), text("guardian_names", "Padres o apoderados"), text("student_names", "Estudiantes vinculados"), select("meeting_type", "Tipo de atención", ["Entrevista", "Reunión", "Taller", "Llamada / virtual"])]), step("case", "Situación", "Problema conversado y evidencias.", [long("discussed_situation", "Situación o problema conversado"), long("evidence", "Información relevante", "", false)]), step("agreements", "Acuerdos", "Compromisos y seguimiento.", [long("agreements", "Acuerdos y compromisos"), date("followup_date", "Fecha de seguimiento"), long("observations", "Observaciones", "", false)])], ["Datos de atención", "Motivo", "Situación tratada", "Orientaciones", "Acuerdos", "Seguimiento"]),
  define("tutoria", "fichas-acompanamiento", "media", "documento", "/dashboard/tutoria/fichas-acompanamiento", [profile(false), step("attention", "Atención", "Fecha, modalidad y estudiante.", [date("attention_date", "Fecha"), select("attention_type", "Tipo", ["Individual", "Grupal"]), select("attendance_mode", "Modalidad", ["Presencial", "Virtual", "Telefónica"]), text("student_names", "Estudiantes")]), step("situation", "Situación", "Problema, antecedentes y orientación.", [long("observed_problem", "Problema observado"), long("background", "Antecedentes", "", false), long("guidance", "Orientaciones brindadas")]), step("agreements", "Acuerdos", "Compromisos, derivación y seguimiento.", [long("agreements", "Acuerdos"), long("referral", "Derivación / coordinación", "", false), date("followup_date", "Seguimiento")])], ["Datos de atención", "Situación", "Análisis", "Orientaciones", "Acuerdos", "Derivación", "Seguimiento"]),
  define("tutoria", "alertas-casos", "alta", "analisis", "/dashboard/tutoria/alertas-casos", [profile(false), step("case", "Caso", "Tipo, fecha y descripción objetiva.", [select("case_type", "Tipo de alerta", ["Convivencia", "Violencia", "Riesgo socioemocional", "Inasistencia", "Vulneración de derechos", "Otro"]), date("incident_date", "Fecha del hecho"), text("student_name", "Estudiante / grupo"), long("case_description", "Detalles pedagógicos del caso")]), step("evidence", "Evidencias", "Registro sin conclusiones no sustentadas.", [long("evidence_notes", "Observaciones de evidencias", "", false), long("witnesses", "Personas que aportan información", "", false)]), step("protocol", "Protocolo", "Marco, acciones inmediatas y ruta.", [long("immediate_actions", "Acciones inmediatas realizadas"), long("legal_framework", "Normativa / protocolo aplicable", "", false), long("referral_route", "Ruta de comunicación o derivación")]), step("followup", "Seguimiento", "Responsables, protección y fechas.", [long("protection_measures", "Medidas de protección"), long("responsibilities", "Responsables"), date("review_date", "Fecha de revisión")])], ["Clasificación de la alerta", "Resumen objetivo", "Evidencias registradas", "Acciones inmediatas", "Protocolo aplicable", "Ruta de derivación", "Medidas de protección", "Seguimiento"]),
  define("tutoria", "recursos-tutoria", "media", "recurso", "/dashboard/tutoria/recursos-tutoria", [profile(false), step("request", "Recurso", "Dimensión, formato y tema.", [select("toe_dimension", "Dimensión TOE", ["Personal", "Social", "Aprendizajes", "Convivencia", "Participación", "Orientación vocacional"]), select("material_format", "Formato", ["Dinámica", "Ficha", "Lectura", "Guion", "Juego", "Taller"]), text("topic", "Tema"), number("duration_minutes", "Duración", 10, 120)]), step("context", "Contexto", "Necesidad y condiciones del grupo.", [long("need", "Necesidad a atender"), long("available_materials", "Materiales disponibles", "", false), long("safeguards", "Cuidados o alertas", "", false)]), step("preview", "Resultado", "La IA generará un recurso aplicable.", [])], ["Objetivo", "Materiales", "Preparación", "Desarrollo paso a paso", "Preguntas de reflexión", "Cierre", "Cuidados"]),
  define("tutoria", "orientacion-vocacional", "media", "documento", "/dashboard/tutoria/orientacion-vocacional", [profile(false), step("student", "Perfil", "Intereses, fortalezas y contexto.", [text("student_name", "Estudiante o grupo"), long("interests", "Intereses"), long("strengths", "Fortalezas y habilidades"), long("values", "Valores y motivaciones"), long("context", "Contexto familiar y oportunidades")]), step("exploration", "Exploración", "Áreas, opciones y experiencias.", [multi("interest_areas", "Áreas de interés", ["Ciencias", "Tecnología", "Salud", "Educación", "Arte", "Humanidades", "Negocios", "Servicios", "Oficios"]), long("explored_options", "Opciones ya exploradas", "", false), long("questions", "Dudas o preguntas")]), step("route", "Ruta", "Acciones de exploración y decisión informada.", [long("exploration_activities", "Actividades de exploración"), long("information_sources", "Fuentes y personas a consultar"), long("short_term_plan", "Plan de próximos pasos")])], ["Síntesis del perfil", "Áreas compatibles", "Opciones formativas", "Actividades de exploración", "Preguntas para decidir", "Plan de acción"]),

  define("recursos", "presentaciones-didacticas", "media", "recurso", "/dashboard/recursos/presentaciones-didacticas", [profile(), step("structure", "Estructura", "Tema, extensión y estilo visual.", [text("topic", "Tema central"), number("slide_count", "Número de diapositivas", 4, 20), select("visual_style", "Estilo visual", ["Infantil y colorido", "Académico", "Minimalista", "Científico", "Storytelling"]), long("must_include", "Puntos que deben incluirse")]), step("activity", "Interacción", "Actividad, evaluación y guion docente.", [select("interaction_type", "Interacción", ["Pregunta detonadora", "Mini reto", "Juego", "Debate", "Comprobación rápida"]), long("speaker_notes", "Indicaciones para el guion docente", "", false)]), step("preview", "Vista previa", "La IA generará tarjetas de diapositivas editables.", [])], ["Portada", "Propósito", "Activación", "Desarrollo conceptual", "Ejemplos", "Actividad interactiva", "Cierre", "Guion docente"]),
  define("recursos", "tarjetas-estudio", "breve", "actividad", "/dashboard/recursos/tarjetas-estudio", [profile(), step("set", "Tarjetas", "Tema, cantidad y tipo de recuerdo.", [text("topic", "Tema / conjunto"), number("card_count", "Cantidad de tarjetas", 4, 30), select("card_type", "Tipo", ["Pregunta / respuesta", "Concepto / definición", "Problema / solución", "Imagen mental / explicación"]), select("difficulty", "Dificultad", ["Básica", "Intermedia", "Mixta"])]), step("preview", "Resultado", "La IA generará frente, reverso y pista.", [])], ["Instrucciones", "Tarjetas de estudio", "Pistas", "Sugerencia de repaso espaciado"]),
  define("recursos", "agrupar-palabras", "breve", "actividad", "/dashboard/recursos/agrupar-palabras", [profile(), step("taxonomy", "Taxonomía", "Tema y número de categorías.", [text("topic", "Tema / criterio taxonómico"), number("category_count", "Número de categorías", 2, 4)]), step("preview", "Resultado", "La IA generará categorías, palabras y explicación.", [])], ["Instrucciones", "Categorías", "Palabras", "Criterio de clasificación"]),
  define("recursos", "ordenar-bloques", "breve", "actividad", "/dashboard/recursos/ordenar-bloques", [profile(), step("sequence", "Secuencia", "Tipo, tema y cantidad de bloques.", [select("sequence_type", "Tipo de secuencia", ["Proceso científico o natural", "Secuencia cronológica o histórica", "Algoritmo o procedimiento", "Secuencia narrativa"]), text("topic", "Tema"), number("step_count", "Cantidad de bloques", 4, 8)]), step("preview", "Resultado", "La IA generará bloques, pistas y orden correcto.", [])], ["Instrucciones", "Bloques", "Pistas", "Justificación del orden"]),
  define("recursos", "casos-estudio", "media", "actividad", "/dashboard/recursos/casos-estudio", [profile(), step("case", "Caso", "Problema, extensión y complejidad.", [text("topic", "Tema / situación problema"), select("complexity", "Complejidad ABP", ["Inicial", "Intermedia", "Avanzada"]), select("story_length", "Extensión", ["Breve", "Media", "Amplia"]), number("question_count", "Preguntas de análisis", 3, 10)]), step("lens", "Enfoque", "Actores, decisiones y evidencia.", [long("required_elements", "Elementos que debe incluir el caso"), long("curricular_focus", "Competencia o foco curricular")]), step("preview", "Resultado", "La IA generará relato, preguntas y guía docente.", [])], ["Título", "Relato del caso", "Datos y dilema", "Preguntas de análisis", "Reto ABP", "Guía docente"]),
  define("recursos", "ahorcado", "breve", "actividad", "/dashboard/recursos/ahorcado", [profile(), step("game", "Partida", "Vocabulario, cantidad e intentos.", [text("topic", "Tema / vocabulario"), number("word_count", "Cantidad de palabras", 3, 15), number("lives", "Intentos por palabra", 4, 10)]), step("preview", "Resultado", "La IA generará palabras únicas y pistas pedagógicas.", [])], ["Instrucciones", "Palabras secretas", "Pistas", "Explicaciones"]),
  define("recursos", "completa-frase", "breve", "actividad", "/dashboard/recursos/completa-frase", [profile(), step("exercise", "Ejercicio", "Tema, modo y cantidad de oraciones.", [text("topic", "Tema / texto central"), select("resolution_mode", "Modo de resolución", ["Escritura libre", "Banco de palabras", "Opción múltiple"]), number("sentence_count", "Cantidad de oraciones", 4, 15)]), step("preview", "Resultado", "La IA generará enunciados, respuesta y distractores.", [])], ["Instrucciones", "Oraciones incompletas", "Banco de palabras o distractores", "Clave"]),
  define("recursos", "emparejar-palabras", "breve", "actividad", "/dashboard/recursos/emparejar-palabras", [profile(), step("pairs", "Pares", "Tema, relación y cantidad.", [text("topic", "Tema"), select("relationship_type", "Tipo de relación", ["Término / definición", "Causa / efecto", "Autor / obra", "Problema / solución", "Imagen mental / concepto"]), number("pair_count", "Cantidad de pares", 4, 16)]), step("preview", "Resultado", "La IA generará pares no ambiguos.", [])], ["Instrucciones", "Columna A", "Columna B", "Solución", "Explicación"]),
  define("recursos", "debate-aula", "media", "actividad", "/dashboard/recursos/dinamica-debate", [profile(), step("debate", "Debate", "Tema, modalidad y duración.", [text("topic", "Tema polémico o problema"), select("debate_mode", "Modalidad", ["Parlamentario", "Pecera", "Línea de opinión", "Panel", "Debate por equipos"]), number("duration_minutes", "Duración", 20, 120)]), step("arguments", "Preparación", "Moción, actores y límites.", [long("context", "Contexto"), long("required_perspectives", "Perspectivas que deben aparecer"), long("safeguards", "Acuerdos de convivencia")]), step("preview", "Resultado", "La IA generará moción, argumentos y rúbrica.", [])], ["Moción", "Contexto", "Roles y reglas", "Argumentos a favor", "Argumentos en contra", "Preguntas cruzadas", "Cierre y evaluación"]),
  define("recursos", "crucigramas", "breve", "actividad", "/dashboard/recursos/crucigramas", [profile(), step("puzzle", "Crucigrama", "Tema, hasta 30 palabras y dificultad de pistas.", [text("topic", "Tema / unidad"), number("word_count", "Cantidad de palabras", 5, 30), select("clue_complexity", "Complejidad de pistas", ["Directa", "Inferencial", "Mixta"])]), step("preview", "Resultado", "La IA generará palabras, pistas y solución.", [])], ["Instrucciones", "Palabras y pistas", "Distribución sugerida", "Solución"]),
  define("recursos", "sopas-letras", "breve", "actividad", "/dashboard/recursos/sopa-letras", [profile(), step("puzzle", "Sopa", "Tema, hasta 30 palabras y dificultad.", [text("topic", "Tema / unidad"), number("word_count", "Cantidad de palabras", 5, 30), select("difficulty", "Dificultad", ["Horizontal y vertical", "Incluye diagonales", "Avanzada con palabras inversas"])]), step("preview", "Resultado", "La IA generará una cuadrícula proporcional, vocabulario, pistas y solución.", [])], ["Instrucciones", "Cuadrícula", "Palabras y pistas", "Solución"]),
  define("recursos", "banco-planificacion", "media", "recurso", "/dashboard/recursos/banco-recursos", [profile(), step("search", "Búsqueda", "Tipo de recurso, tema y enfoque.", [select("resource_type", "Tipo de recurso", ["Actividad", "Lectura", "Video", "Organizador", "Evaluación", "Experimento", "Dinámica"]), text("topic", "Tema / eje"), select("transversal_approach", "Enfoque transversal", ["Derechos", "Inclusivo", "Intercultural", "Igualdad", "Ambiental", "Bien común", "Excelencia"]), long("available_resources", "Recursos disponibles", "", false)]), step("purpose", "Propósito", "Competencia y uso pedagógico.", [long("learning_purpose", "Propósito"), long("constraints", "Condiciones o restricciones", "", false)]), step("preview", "Resultado", "La IA recomendará recursos organizados y reutilizables.", [])], ["Recursos sugeridos", "Propósito", "Cómo usarlo", "Adaptaciones", "Fuente o referencia"]),
  define("recursos", "normativa-educativa", "media", "recurso", "/dashboard/recursos/normativa-educativa", [profile(false), step("query", "Consulta", "Tipo de norma y tema.", [select("regulation_type", "Tipo de normativa", ["Currículo", "Evaluación", "Convivencia", "Inclusión", "Gestión escolar", "Carrera docente"]), text("application_scope", "Grado / área de aplicación"), text("topic", "Tema específico")]), step("need", "Necesidad", "Uso que tendrá la síntesis.", [select("purpose", "Propósito", ["Planificar", "Sustentar una decisión", "Informar a familias", "Actualizar documento de gestión"]), long("question", "Pregunta concreta")]), step("preview", "Resultado", "La IA organizará la referencia; debe verificarse con la fuente oficial.", [])], ["Marco aplicable", "Resumen ejecutivo", "Obligaciones y alcances", "Aplicación en aula", "Fuentes oficiales a verificar"]),
  define("recursos", "libros-guia-minedu", "media", "recurso", "/dashboard/recursos/libros-minedu", [profile(), step("query", "Búsqueda", "Tipo, unidad y propósito.", [select("resource_type", "Tipo de recurso MINEDU", ["Texto escolar", "Cuaderno de trabajo", "Guía docente", "Fascículo", "Orientación pedagógica"]), text("topic", "Unidad / tema"), long("learning_purpose", "Propósito")]), step("use", "Uso", "Forma de integración en la sesión.", [long("planned_activity", "Actividad prevista"), long("adaptation_need", "Adaptaciones necesarias", "", false)]), step("preview", "Resultado", "La IA propondrá referencias y uso pedagógico verificable.", [])], ["Recursos sugeridos", "Propósito CNEB", "Contenido útil", "Actividad sugerida", "Adaptación", "Referencia oficial"]),
  define("recursos", "canales-audiovisuales", "media", "recurso", "/dashboard/recursos/canales-audiovisuales", [profile(), step("query", "Búsqueda", "Tipo de recurso y tema.", [select("audiovisual_type", "Tipo de recurso", ["Video explicativo", "Documental", "Animación", "Podcast", "Canal educativo"]), text("topic", "Tema / propósito"), number("max_duration", "Duración máxima (minutos)", 2, 90)]), step("criteria", "Criterios", "Idioma, accesibilidad y uso.", [select("language", "Idioma", ["Español", "Quechua / lengua originaria", "Inglés", "Indistinto"]), multi("accessibility", "Accesibilidad", ["Subtítulos", "Transcripción", "Lenguaje sencillo", "Descripción visual"]), long("planned_use", "Cómo se usará en clase")]), step("preview", "Resultado", "La IA recomendará tipos de fuentes y criterios de verificación.", [])], ["Selección sugerida", "Criterios de calidad", "Uso antes/durante/después", "Preguntas guía", "Accesibilidad", "Verificación de fuente"]),
];

const workflowsByKey = new Map(workflowDefinitions.map((workflow) => [workflow.key, workflow]));

export function getWorkflow(tool: ToolDefinition | undefined) {
  if (!tool) return undefined;
  return workflowsByKey.get(`${tool.module}/${tool.id}`);
}

export function getInitialWorkflowValues(workflow: WorkflowDefinition) {
  const profileValues = (() => {
    try { return JSON.parse(sessionStorage.getItem("avendia.user") ?? "{}") as Record<string, unknown>; }
    catch { return {}; }
  })();
  const profileFieldMap: Record<string, string> = {
    dre: "dre",
    ugel: "ugel",
    institution: "school_name",
    teacher_name: "full_name",
    director_name: "director_name",
    subdirector_name: "subdirector_name",
    level: "education_level",
    grade: "grade",
    section: "section",
    curricular_area: "curricular_area",
    school_year: "school_year",
  };
  const values: Record<string, string | string[]> = {};
  for (const workflowStep of workflow.steps) {
    for (const field of workflowStep.fields) {
      if (field.type === "multiselect") values[field.id] = [];
      else if (field.type === "repeater") values[field.id] = field.minItems ? Array.from({ length: field.minItems }, () => "") : [];
      else if (field.id === "modality") {
        const savedModality = String(profileValues.education_modality ?? "EBR");
        values[field.id] = workflowModalities.find((item) => item.startsWith(savedModality)) ?? workflowModalities[0];
      }
      else if (profileFieldMap[field.id]) values[field.id] = String(profileValues[profileFieldMap[field.id]] ?? "");
      else values[field.id] = "";
    }
  }
  const modalityValue = String(values.modality ?? "");
  const levelValue = String(values.level ?? "");
  if (levelValue && !getEducationLevels(modalityValue).some((item) => item === levelValue)) values.level = "";
  const normalizedLevel = String(values.level ?? "");
  const gradeValue = String(values.grade ?? "");
  if (gradeValue && !getDynamicEducationOptions("gradesByLevel", normalizedLevel).includes(gradeValue)) values.grade = "";
  return values;
}
