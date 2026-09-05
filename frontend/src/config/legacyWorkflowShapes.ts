export type WorkflowStageKind = "form" | "generate" | "preview" | "interactive" | "download";

export type LegacyWorkflowStage = {
  id: string;
  title: string;
  description: string;
  kind?: WorkflowStageKind;
  sourceSteps?: string[];
  fieldIds?: string[];
  columns?: 2 | 3;
};

export type LegacyWorkflowShape = {
  stages: LegacyWorkflowStage[];
};

const stage = (
  id: string,
  title: string,
  description: string,
  sourceSteps: string[] = [],
  kind: WorkflowStageKind = "form",
  fieldIds: string[] = [],
  columns?: 2 | 3,
): LegacyWorkflowStage => ({ id, title, description, sourceSteps, kind, fieldIds, columns });

const preview = (id: string, title: string, description = "Revisa el resultado generado y realiza los ajustes finales.") =>
  stage(id, title, description, [], "preview");
const interactive = (id: string, title: string, description = "Prueba el recurso generado antes de descargarlo o utilizarlo en el aula.") =>
  stage(id, title, description, [], "interactive");
const download = (id: string, title: string, description = "Revisa la versión final y descarga el material listo para usar.") =>
  stage(id, title, description, [], "download");
const generate = (id: string, title: string, description = "Confirma la información y genera el recurso con IA.") =>
  stage(id, title, description, [], "generate");

/**
 * Estructura recuperada del proyecto anterior. Esta tabla conserva solamente
 * etapas, distribución funcional y orden de campos; nunca estilos ni colores.
 */
export const LEGACY_WORKFLOW_SHAPES: Record<string, LegacyWorkflowShape> = {
  "planificamos/unidad-aprendizaje": { stages: [
    stage("legacy-data", "Datos", "Datos informativos, alcance y periodo de la unidad.", ["official", "scope"], "form", [], 3),
    stage("legacy-content", "Contenido", "Situación, propósitos, evidencias, secuencia y atención a la diversidad.", ["challenge", "purpose", "evidence", "sequence", "review"]),
    generate("legacy-generate", "Generar", "Confirma los datos y crea la unidad de aprendizaje con IA."),
    preview("legacy-document", "Documento", "Revisa y descarga la unidad completa."),
  ] },
  "planificamos/sesion-aprendizaje": { stages: [
    stage("legacy-data", "Datos", "Información institucional y del grupo.", ["official"], "form", [], 3),
    stage("legacy-course", "Curso", "Fuente, tema y unidad de referencia.", ["source"]),
    stage("legacy-competencies", "Competencias", "Propósito, competencias, desempeño y evidencia.", ["purpose"]),
    stage("legacy-approaches", "Enfoques", "Recursos, referencias y atención a la diversidad.", ["resources"]),
    stage("legacy-generate", "Generar", "Secuencia didáctica, evaluación y retroalimentación.", ["sequence", "assessment"]),
    preview("legacy-document", "Documento", "Revisa la sesión completa antes de descargarla."),
  ] },
  "planificamos/situacion-significativa": { stages: [
    stage("legacy-context", "Marco & contexto", "Datos institucionales, unidad, eje y problemática local.", ["official"], "form", ["unit_title", "situation_axis", "context_description"], 3),
    stage("legacy-challenge", "Reto & justificación", "Pregunta retadora y justificación del aprendizaje.", [], "form", ["challenge_question", "learning_justification"]),
    stage("legacy-purpose", "Propósito & enfoques", "Competencias articuladas y enfoques transversales.", [], "form", ["articulated_competencies", "transversal_approaches"]),
    stage("legacy-product", "Productos & evaluación", "Producto integrador y criterios de evaluación.", [], "form", ["expected_product", "evaluation_criteria"]),
    preview("legacy-document", "Documento final"),
  ] },
  "planificamos/proyectos-integrados": { stages: [
    stage("legacy-context", "Articulación & contexto", "Datos del equipo, proyecto, áreas y situación desafiante.", ["official", "project"], "form", [], 3),
    stage("legacy-competencies", "Competencias & producto", "Propósitos interdisciplinarios y producto auténtico.", ["design"]),
    stage("legacy-phases", "Fases & metodología", "Ruta, cronograma, roles, recursos y aliados.", ["route"]),
    stage("legacy-assessment", "Evaluación integrada", "Evidencias, criterios, socialización y DUA.", ["assessment"]),
    preview("legacy-document", "Vista previa A4"),
  ] },
  "planificamos/adaptacion-nee-dua": { stages: [
    stage("legacy-diagnosis", "Diagnóstico & BAP", "Datos institucionales, perfil, fortalezas y barreras.", ["official", "student"], "form", [], 3),
    stage("legacy-dua", "Principios DUA", "Múltiples formas de implicación, representación y expresión.", ["dua"]),
    stage("legacy-adjustments", "Adaptaciones & evaluación", "Desempeños, criterios adaptados e indicadores de progreso.", ["curriculum"]),
    stage("legacy-family", "Familia & SAANEE", "Responsables, apoyos, evidencias y revisión.", ["followup"]),
    preview("legacy-document", "Vista previa A4"),
  ] },
  "planificamos/tarea-extension-hogar": { stages: [
    stage("legacy-purpose", "Propósito & datos", "Datos institucionales, fechas y propósito pedagógico.", ["official"], "form", ["task_title", "assigned_date", "due_date", "learning_purpose"], 3),
    stage("legacy-instructions", "Instrucciones & recursos", "Consigna, pasos y materiales accesibles.", [], "form", ["instructions", "materials"]),
    stage("legacy-family", "Orientación familiar & DUA", "Condiciones del hogar, rol de la familia y apoyos.", [], "form", ["family_context", "family_role", "dua_adjustments"]),
    stage("legacy-assessment", "Criterios & autoevaluación", "Evidencia, criterios, reflexión y devolución.", [], "form", ["evidence", "criteria", "reflection", "teacher_feedback"]),
    preview("legacy-document", "Vista previa A4"),
  ] },
  "planificamos/carpeta-pedagogica": { stages: [
    stage("legacy-identity", "Filosofía & datos", "Datos institucionales, perfil y contexto docente.", ["official", "identity"], "form", [], 3),
    stage("legacy-calendar", "Calendarización & comisiones", "Documentos, prioridades y cronograma de trabajo.", ["management"]),
    stage("legacy-diagnosis", "Diagnóstico de aula", "Registros y evidencias de la práctica pedagógica.", ["evidence"]),
    stage("legacy-portfolio", "Normas & portafolio", "Organización final, anexos y observaciones.", ["review"]),
    preview("legacy-document", "Vista previa A4"),
  ] },

  "evaluamos/rubrica-evaluacion": { stages: [
    stage("legacy-data", "Datos y configuración", "Datos curriculares, competencia, evidencia, escala y criterios.", ["profile", "assessment", "criteria"]),
    preview("legacy-result", "Rúbrica generada"),
  ] },
  "evaluamos/lista-cotejo": { stages: [
    stage("legacy-data", "Datos & currículo", "Datos del docente, el grupo y la evidencia a evaluar.", ["profile", "evidence"]),
    stage("legacy-config", "Configuración", "Indicadores, estudiantes y escala de registro.", ["criteria"]),
    preview("legacy-document", "Previsualizar A4"),
  ] },
  "evaluamos/ficha-aprendizaje": { stages: [
    stage("legacy-data", "Datos y configuración", "Contexto, tema, tipo, dificultad y contenido de la ficha.", ["profile", "design", "content"]),
    preview("legacy-result", "Revisar y exportar"),
  ] },
  "evaluamos/examen": { stages: [
    stage("legacy-data", "Datos & competencias", "Datos curriculares, temas y competencias a evaluar.", ["profile", "blueprint"]),
    stage("legacy-config", "Configuración de prueba", "Formatos, dificultad, duración, criterios y adecuaciones.", ["alignment"]),
    preview("legacy-document", "Previsualizar A4"),
  ] },
  "evaluamos/escala-estimacion": { stages: [
    stage("legacy-data", "Datos y configuración", "Datos curriculares, actividad, criterios y escala de valoración.", ["profile", "scale"]),
    preview("legacy-result", "Matriz generada"),
  ] },
  "evaluamos/preguntas-texto": { stages: [
    stage("legacy-text", "Encuadre & texto base", "Datos institucionales, lectura, tipo y texto base.", ["official", "text"], "form", [], 3),
    stage("legacy-levels", "Niveles & capacidades", "Preguntas literales, inferenciales, críticas y capacidades CNEB.", ["levels"]),
    stage("legacy-format", "Formato & DUA", "Formato de preguntas y ajustes de accesibilidad.", ["accessibility"]),
    stage("legacy-criteria", "Criterios & rúbrica", "Criterios y pautas de retroalimentación.", [], "form", ["criteria", "feedback_guidance"]),
    preview("legacy-document", "Ficha de lectura A4"),
  ] },
  "evaluamos/ficha-observacion": { stages: [
    stage("legacy-focus", "Encuadre & foco", "Datos institucionales, sujeto y foco de observación.", ["official"], "form", ["sheet_type", "observed_subject", "observation_focus"], 3),
    stage("legacy-criteria", "Criterios & escala", "Conductas observables y escala cualitativa.", [], "form", ["scale_type", "criteria"]),
    stage("legacy-record", "Registro & anecdotario", "Hechos objetivos y factores de contexto.", ["evidence"]),
    stage("legacy-analysis", "Interpretación & pautas", "Interpretación, conclusión y compromisos.", ["followup"], "form", ["interpretation"]),
    preview("legacy-document", "Ficha A4 oficial"),
  ] },
  "evaluamos/registros-auxiliares": { stages: [
    stage("legacy-competencies", "Encuadre & competencias", "Datos institucionales, periodo, escala y competencias.", ["official"], "form", ["academic_period", "official_scale", "competencies"], 3),
    stage("legacy-evidence", "Criterios & evidencias", "Criterios, instrumento y evidencia final.", [], "form", ["criteria", "instrument", "final_evidence"]),
    stage("legacy-attendance", "Asistencia & control", "Nómina, asistencia, tardanzas e inasistencias.", ["students"]),
    stage("legacy-conclusions", "Conclusiones CNEB", "Conclusiones descriptivas y acciones de apoyo.", ["analysis"]),
    preview("legacy-document", "Registro auxiliar A4"),
  ] },
  "evaluamos/carpetas-recuperacion": { stages: [
    stage("legacy-diagnosis", "Diagnóstico & grupo", "Datos institucionales, destinatarios, periodo y diagnóstico.", ["official", "diagnosis"], "form", [], 3),
    stage("legacy-criteria", "Competencias & criterios", "Competencias, criterios y evidencias esperadas.", [], "form", ["prioritized_competencies", "criteria", "evidence"]),
    stage("legacy-activities", "Experiencias & actividades", "Secuencia de recuperación y recursos.", [], "form", ["activity_sequence", "resources"]),
    stage("legacy-family", "Familia & cronograma", "Cronograma, orientaciones familiares y seguimiento.", ["schedule"]),
    preview("legacy-document", "Carpeta A4 oficial"),
  ] },
  "evaluamos/calificador-rubrica": { stages: [
    stage("legacy-rubric", "Encuadre & rúbrica", "Datos institucionales, escala, evidencia y rúbrica base.", ["official", "rubric"], "form", [], 3),
    stage("legacy-upload", "Carga de evidencia", "Estudiante y producción que será analizada.", ["student"]),
    stage("legacy-analysis", "Análisis & resultados", "Desglose por criterio y fortalezas detectadas.", [], "form", ["analysis_breakdown", "detected_strengths"]),
    stage("legacy-feedback", "Retroalimentación", "Pautas de mejora y ajustes finales del docente.", [], "form", ["improvement_guidance", "teacher_adjustments"]),
    preview("legacy-document", "Informe A4 oficial"),
  ] },
  "evaluamos/retroalimentacion-formativa": { stages: [
    stage("legacy-focus", "Enfoque & evidencia", "Datos institucionales, evidencia, competencia y modelo.", ["official"], "form", ["evidence_title", "competency", "criteria", "feedback_model"], 3),
    stage("legacy-steps", "Peldaños de retroalimentación", "Clarificar, valorar, expresar inquietudes y sugerir.", [], "form", ["clarify", "value", "concerns", "suggestions"]),
    preview("legacy-document", "Guía A4 oficial"),
  ] },
  "evaluamos/analytics-alertas": { stages: [
    stage("legacy-diagnosis", "Diagnóstico & performance", "Datos institucionales e indicadores cuantitativos.", ["official", "metrics"], "form", [], 3),
    stage("legacy-alerts", "Alertas tempranas", "Alertas académicas y de asistencia.", [], "form", ["academic_alerts", "attendance_alerts"]),
    stage("legacy-factors", "Competencias & factores", "Análisis por competencias y factores asociados.", [], "form", ["competency_analysis", "context_factors"]),
    stage("legacy-plan", "Plan & derivaciones", "Acciones de intervención, compromisos y derivaciones.", ["actions"]),
    preview("legacy-document", "Informe A4 oficial"),
  ] },

  "incluimos/adaptacion-nee-dua": { stages: [
    stage("legacy-diagnosis", "Diagnóstico & BAP", "Datos institucionales, estudiante, fortalezas y barreras.", ["official", "student"], "form", [], 3),
    stage("legacy-dua", "Principios DUA", "Participación, representación, acción y expresión.", [], "form", ["participation_supports", "access_supports"]),
    stage("legacy-adjustments", "Adaptaciones & evaluación", "Propósitos, criterios y evaluación accesible.", ["adjustments"]),
    stage("legacy-family", "Familia & SAANEE", "Responsables, periodo, apoyos y seguimiento.", ["monitoring"]),
    preview("legacy-document", "Vista previa A4"),
  ] },
  "incluimos/plan-atencion": { stages: [
    stage("legacy-diagnosis", "Diagnóstico & NEE", "Datos institucionales, estudiante, condición e informe.", ["official", "student"], "form", [], 3),
    stage("legacy-barriers", "Barreras (BAP) & fortalezas", "Barreras, talentos, intereses y autonomía.", ["profile"]),
    stage("legacy-dua", "Ajustes DUA", "Representación, expresión, motivación y adaptaciones.", ["adaptations"]),
    stage("legacy-support", "Apoyos & compromisos", "Apoyos, metas, responsables y compromisos.", ["plan"]),
    download("legacy-document", "PAI oficial & descarga"),
  ] },
  "incluimos/estrategias-inclusion": { stages: [
    stage("legacy-diversity", "Diversidad del aula", "Datos institucionales, composición y dinámica del grupo.", ["official", "classroom"], "form", [], 3),
    stage("legacy-methods", "Metodologías activas", "Estrategias y metodología priorizada.", ["strategy"]),
    stage("legacy-climate", "Clima & convivencia", "Participación, acuerdos y trabajo colaborativo.", [], "form", ["participation_goal", "collaboration_actions"]),
    stage("legacy-flex", "Flexibilización & roles", "Tiempos, apoyos e indicadores de inclusión.", ["assessment"]),
    download("legacy-document", "Guía oficial & descarga"),
  ] },
  "incluimos/trabajo-familias": { stages: [
    stage("legacy-meeting", "Encuadre & modalidad", "Datos institucionales, encuentro y participantes.", ["official", "meeting"], "form", [], 3),
    stage("legacy-diagnosis", "Diagnóstico & barreras", "Motivo, diagnóstico y barreras del hogar.", [], "form", ["reason", "diagnosis", "home_barriers"]),
    stage("legacy-home", "Pautas para el hogar", "Rutinas y canales de comunicación.", [], "form", ["home_routines", "communication_frequency"]),
    stage("legacy-agreements", "Acta de compromisos", "Acuerdos de la familia, la escuela y seguimiento.", ["agreements", "followup"]),
    download("legacy-document", "Acta oficial & descarga"),
  ] },
  "incluimos/seguimiento-evaluacion": { stages: [
    stage("legacy-context", "Encuadre & adecuaciones", "Datos institucionales, estudiante, periodo y adecuaciones.", ["official", "student"], "form", [], 3),
    stage("legacy-progress", "Logros & evidencias", "Avances pedagógicos, socioemocionales y evidencias.", ["progress"]),
    stage("legacy-effectiveness", "Efectividad de ajustes", "Apoyos aplicados y dificultades persistentes.", [], "form", ["implemented_supports", "persistent_difficulties"]),
    stage("legacy-readjust", "Reajustes & pautas", "Nuevos ajustes y recomendaciones a la familia.", ["adjustments"]),
    preview("legacy-document", "Informe oficial A4"),
  ] },

  "reforzamos/trabajo-autonomo": { stages: [
    stage("legacy-purpose", "Propósito & encuadre", "Datos del aula, competencia, tema y duración.", ["profile", "focus"]),
    stage("legacy-sheet", "Ficha de trabajo (3 secciones)", "Explicación, ejercicios, reflexión y orientación familiar.", ["activity"]),
    download("legacy-document", "Vista previa & descarga"),
  ] },
  "reforzamos/carpeta-recuperacion": { stages: [
    stage("legacy-data", "Datos y configuración", "Datos institucionales, alcance, temas, estudiantes y ruta de recuperación.", ["profile", "scope", "route", "followup"]),
    download("legacy-document", "Carpeta & descarga"),
  ] },
  "reforzamos/monitorea-avances": { stages: [
    stage("legacy-baseline", "Línea de base", "Datos del aula, competencia y desempeño esperado.", ["profile", "baseline"]),
    stage("legacy-weeks", "Matriz por semanas", "Hitos, criterios y evidencias semanales.", ["milestones"]),
    stage("legacy-factors", "Factores & andamiaje", "Barreras, factores y estrategias aplicadas.", [], "form", ["barriers", "support_strategies"]),
    stage("legacy-analytics", "Analítica & reajuste IA", "Grupos de progreso y decisiones pedagógicas.", ["groups"]),
    download("legacy-document", "Informe & descarga"),
  ] },
  "reforzamos/acompanamiento-motivacion": { stages: [
    stage("legacy-state", "Estado inicial", "Datos del estudiante, estado emocional y frecuencia.", ["profile", "student"]),
    stage("legacy-strengths", "Intereses & fortalezas", "Intereses, talentos y apoyo familiar.", [], "form", ["interests", "strengths", "family_support"]),
    stage("legacy-triggers", "Detonantes & motivación", "Detonantes y canal de reconocimiento.", [], "form", ["triggers", "recognition_channel"]),
    stage("legacy-plan", "Plan & mensajes IA", "Micro-metas, mensajes y seguimiento.", ["plan", "followup"]),
    download("legacy-document", "Ficha & descarga"),
  ] },
  "reforzamos/plan-refuerzo": { stages: [
    stage("legacy-diagnosis", "Diagnóstico & base", "Datos institucionales, distribución y dificultades.", ["official", "diagnosis"], "form", [], 3),
    stage("legacy-goals", "Metas & criterios", "Competencia, meta, criterios, evidencia e instrumento.", ["goals"]),
    stage("legacy-actions", "Acciones & recursos", "Estrategias diferenciadas y recursos.", ["actions"]),
    stage("legacy-schedule", "Cronograma & hitos", "Duración, frecuencia, sesiones y compromisos.", ["schedule", "commitments"]),
    download("legacy-document", "Plan oficial & descarga"),
  ] },

  "acompanamos/correo-familias": { stages: [
    stage("legacy-recipient", "Datos & apoderado", "Datos del aula, estudiante, apoderado y categoría.", ["profile", "recipient"]),
    stage("legacy-writing", "Redacción asistida", "Tono, puntos clave y acción esperada.", ["tone"]),
    download("legacy-document", "Vista previa & envío"),
  ] },
  "acompanamos/respuesta-correo": { stages: [
    stage("legacy-message", "Correo recibido & intención", "Datos del aula, mensaje, intención y destinatario.", ["profile", "message"]),
    stage("legacy-writing", "Redacción de respuesta", "Tono, hechos a incluir y límites de la respuesta.", ["boundaries"]),
    download("legacy-document", "Hilo de conversación & descarga"),
  ] },
  "acompanamos/analytics-alertas": { stages: [
    stage("legacy-indicators", "Indicadores de aula", "Datos del aula, periodo y variables de alerta.", ["profile", "period", "data"]),
    stage("legacy-alerts", "Matriz & alertas", "Casos, señales, prioridades y responsables.", ["actions"]),
    download("legacy-document", "Reporte analítico & descarga"),
  ] },
  "acompanamos/calificador-ia": { stages: [
    stage("legacy-rubric", "Evaluación & rúbrica", "Datos curriculares, competencia, criterio, escala y rúbrica.", ["profile", "criteria"]),
    stage("legacy-evidence", "Ingesta de evidencia", "Estudiante y evidencia que será evaluada.", ["evidence"]),
    preview("legacy-feedback", "Retroalimentación formativa", "Revisa el nivel sugerido y conserva la decisión final docente."),
  ] },
  "acompanamos/reporte-seguimiento": { stages: [
    stage("legacy-context", "Encuadre de seguimiento", "Datos del aula, estudiante, tipo y periodo.", ["profile", "case"]),
    stage("legacy-progress", "Avances & compromisos", "Avances, dificultades, compromisos y próximos pasos.", ["balance", "next"]),
    download("legacy-document", "Reporte consolidado & descarga"),
  ] },

  "tutoria/plan-tutoria": { stages: [
    stage("legacy-data", "Datos y configuración", "Datos de tutoría, grupo, diagnóstico, objetivos, acciones y cronograma.", ["official", "group", "objectives", "actions", "schedule"]),
    download("legacy-document", "Plan de tutoría & descarga"),
  ] },
  "tutoria/sesiones-tutoria": { stages: [
    stage("legacy-purpose", "Datos & dimensión TOE", "Datos del aula, dimensión, tema, logro y duración.", ["profile", "purpose"]),
    stage("legacy-sequence", "Secuencia didáctica", "Inicio, desarrollo, cierre, recursos, evaluación y cuidados.", ["sequence", "support"]),
    download("legacy-document", "Vista previa & descarga"),
  ] },
  "tutoria/informe-tutoria": { stages: [
    stage("legacy-data", "Datos e informe", "Datos del grupo, periodo, acciones, balance y recomendaciones.", ["profile", "period", "actions", "balance", "recommendations"]),
    download("legacy-document", "Informe & descarga"),
  ] },
  "tutoria/informe-padres": { stages: [
    stage("legacy-data", "Datos de atención", "Datos del grupo, participantes, situación, acuerdos y seguimiento.", ["profile", "meeting", "case", "agreements"]),
    download("legacy-document", "Informe a familias & descarga"),
  ] },
  "tutoria/fichas-acompanamiento": { stages: [
    stage("legacy-data", "Datos de acompañamiento", "Datos del grupo, atención, situación, orientación y acuerdos.", ["profile", "attention", "situation", "agreements"]),
    download("legacy-document", "Ficha & descarga"),
  ] },
  "tutoria/alertas-casos": { stages: [
    stage("legacy-data", "Registro del caso", "Datos del grupo, alerta, evidencias, protocolo y seguimiento.", ["profile", "case", "evidence", "protocol", "followup"]),
    download("legacy-document", "Caso, ruta & descarga"),
  ] },
  "tutoria/recursos-tutoria": { stages: [
    stage("legacy-params", "Parámetros & tema", "Datos del aula, dimensión, formato y tema.", ["profile", "request"]),
    stage("legacy-bank", "Banco de recursos", "Necesidad, materiales disponibles y cuidados.", ["context"]),
    download("legacy-document", "Compilado & descarga"),
  ] },
  "tutoria/orientacion-vocacional": { stages: [
    stage("legacy-student", "Perfil vocacional", "Datos del estudiante, intereses, fortalezas, valores y contexto.", ["profile", "student"]),
    stage("legacy-exploration", "Exploración y opciones", "Áreas de interés, opciones exploradas y dudas vocacionales.", ["exploration"]),
    stage("legacy-route", "Ruta de acción", "Actividades de indagación, fuentes y plan a corto plazo.", ["route"]),
    download("legacy-document", "Ruta vocacional & descarga"),
  ] },

  "recursos/presentaciones-didacticas": { stages: [
    stage("legacy-data", "Datos", "Datos generales, modalidad, tema, estilo y cantidad de diapositivas.", ["profile", "structure"]),
    stage("legacy-structure", "Estructura", "Competencias, propósito, interacciones y guion docente.", ["activity"]),
    preview("legacy-preview", "Vista previa"),
    download("legacy-download", "Descarga"),
  ] },
  "recursos/tarjetas-estudio": { stages: [
    stage("legacy-data", "Datos generales", "Datos curriculares, tema, cantidad, tipo y dificultad.", ["profile", "set"]),
    generate("legacy-generate", "Modo y formato", "Genera y revisa el frente, reverso y pista de cada tarjeta."),
    interactive("legacy-board", "Visor 3D y práctica"),
  ] },
  "recursos/agrupar-palabras": { stages: [
    stage("legacy-data", "Datos generales", "Datos curriculares, tema y número de categorías.", ["profile", "taxonomy"]),
    generate("legacy-generate", "Configuración de palabras", "Genera y revisa categorías, palabras y criterio taxonómico."),
    interactive("legacy-board", "Tablero drag & drop"),
  ] },
  "recursos/ordenar-bloques": { stages: [
    stage("legacy-data", "Datos y tipo de secuencia", "Datos curriculares, tipo, tema y cantidad de bloques.", ["profile", "sequence"]),
    generate("legacy-generate", "Generación de pasos IA", "Genera y revisa los pasos de la secuencia."),
    interactive("legacy-board", "Tablero de reordenamiento"),
  ] },
  "recursos/casos-estudio": { stages: [
    stage("legacy-data", "Datos y configuración", "Datos curriculares, caso, complejidad, extensión y preguntas.", ["profile", "case"]),
    stage("legacy-generate", "Generación del caso IA", "Actores, decisiones, evidencia y foco curricular.", ["lens"]),
    interactive("legacy-board", "Visor interactivo ABP"),
  ] },
  "recursos/ahorcado": { stages: [
    stage("legacy-data", "Datos y reglas", "Datos curriculares, tema, cantidad de palabras e intentos.", ["profile", "game"]),
    generate("legacy-generate", "Generación de palabras IA", "Genera y revisa palabras únicas y pistas pedagógicas."),
    interactive("legacy-board", "Tablero gamificado"),
  ] },
  "recursos/completa-frase": { stages: [
    stage("legacy-data", "Datos y modo de apoyo", "Datos curriculares, modo, tema y cantidad de oraciones.", ["profile", "exercise"]),
    generate("legacy-generate", "Generación de oraciones IA", "Genera y revisa oraciones, respuestas y distractores."),
    interactive("legacy-board", "Tablero de resolución"),
  ] },
  "recursos/emparejar-palabras": { stages: [
    stage("legacy-data", "Datos y ámbito curricular", "Datos curriculares, relación, tema y cantidad de pares.", ["profile", "pairs"]),
    generate("legacy-generate", "Generación de pares IA", "Genera y revisa términos y correspondencias."),
    interactive("legacy-board", "Tablero de resolución"),
  ] },
  "recursos/debate-aula": { stages: [
    stage("legacy-data", "Datos y ámbito curricular", "Datos curriculares, modalidad, tema y duración.", ["profile", "debate"]),
    stage("legacy-generate", "Generación de moción IA", "Contexto, posturas, argumentos y convivencia.", ["arguments"]),
    interactive("legacy-board", "Tablero de debate"),
  ] },
  "recursos/crucigramas": { stages: [
    stage("legacy-data", "Datos y ámbito", "Datos curriculares, tema, palabras y complejidad de pistas.", ["profile", "puzzle"]),
    generate("legacy-generate", "Conceptos IA", "Genera y revisa conceptos, palabras y pistas."),
    interactive("legacy-board", "Grilla interactiva"),
  ] },
  "recursos/sopas-letras": { stages: [
    stage("legacy-data", "Datos y ámbito", "Datos curriculares, tema, cantidad y dificultad.", ["profile", "puzzle"]),
    generate("legacy-generate", "Palabras generadas", "Genera y revisa el vocabulario de la actividad."),
    interactive("legacy-board", "Tablero interactivo"),
  ] },
  "recursos/banco-planificacion": { stages: [
    stage("legacy-data", "Datos y ámbito curricular", "Datos curriculares, tipo de recurso, tema y enfoque.", ["profile", "search"]),
    stage("legacy-generate", "Generación y generador IA", "Propósito, recursos disponibles y restricciones.", ["purpose"]),
    download("legacy-library", "Explorador y librería de recursos"),
  ] },
  "recursos/normativa-educativa": { stages: [
    stage("legacy-data", "Parámetros de búsqueda", "Datos de aplicación, tipo de normativa y tema.", ["profile", "query"]),
    stage("legacy-generate", "Síntesis y marco normativo IA", "Propósito y pregunta concreta de la consulta.", ["need"]),
    download("legacy-viewer", "Visor y exportación legal"),
  ] },
  "recursos/libros-guia-minedu": { stages: [
    stage("legacy-data", "Parámetros y texto MINEDU", "Datos curriculares, tipo de recurso, unidad y propósito.", ["profile", "query"]),
    stage("legacy-generate", "Análisis y síntesis IA", "Actividad prevista y adaptaciones necesarias.", ["use"]),
    download("legacy-viewer", "Visor y exportación bibliográfica"),
  ] },
  "recursos/canales-audiovisuales": { stages: [
    stage("legacy-data", "Parámetros y sesión", "Datos curriculares, tipo de recurso, tema y duración.", ["profile", "query"]),
    stage("legacy-generate", "Curaduría y guía audiovisual IA", "Idioma, accesibilidad y uso pedagógico.", ["criteria"]),
    download("legacy-viewer", "Visor y exportación didáctica"),
  ] },
};
