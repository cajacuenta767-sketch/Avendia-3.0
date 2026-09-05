import type { WorkflowField, WorkflowFieldGuide } from "./workflows";

const guideByField: Record<string, WorkflowFieldGuide> = {
  justification: {
    title: "Personalicemos tu justificación",
    question1: "¿Cuál es la principal dificultad o necesidad de aprendizaje detectada?",
    placeholder1: "Ej. Comprensión lectora baja y dificultad para sustentar opiniones.",
    question2: "¿Qué gran logro o competencia buscas alcanzar?",
    placeholder2: "Ej. Que los estudiantes argumenten con evidencias y redacten con claridad.",
    suggestions: ["Comprensión lectora baja", "Dificultades en matemática", "Trabajo en equipo deficiente", "Falta de hábitos de estudio", "Problemas de razonamiento lógico"],
  },
  significant_situation: {
    title: "Construyamos una situación significativa",
    question1: "¿Qué situación real de la comunidad movilizará el aprendizaje?",
    placeholder1: "Ej. En el barrio aumentó el uso de plásticos y los estudiantes quieren proponer soluciones.",
    question2: "¿Qué reto auténtico deberán resolver los estudiantes?",
    placeholder2: "Ej. Diseñar una campaña escolar que reduzca los residuos durante un mes.",
    suggestions: ["Cuidado del agua", "Convivencia escolar", "Alimentación saludable", "Identidad cultural", "Uso responsable de tecnología"],
  },
  criteria: {
    title: "Redactemos criterios observables",
    question1: "¿Qué evidencia o producto será evaluado?",
    placeholder1: "Ej. Exposición oral apoyada por una infografía.",
    question2: "¿Qué desempeño debe observarse con claridad?",
    placeholder2: "Ej. Explica causas y consecuencias usando datos verificables.",
    suggestions: ["Claridad de ideas", "Uso de evidencias", "Proceso y estrategia", "Comunicación del resultado", "Autonomía y colaboración"],
  },
  competencies: {
    title: "Alineemos las competencias",
    question1: "¿Qué aprendizaje central se debe movilizar?",
    placeholder1: "Ej. Comprender textos y producir una respuesta argumentada.",
    question2: "¿Qué evidencia demostrará el desarrollo de la competencia?",
    placeholder2: "Ej. Un texto de opinión con tesis, argumentos y conclusión.",
    suggestions: ["Resolver una situación problemática", "Comunicar una explicación", "Indagar con evidencias", "Crear una propuesta", "Convivir y participar"],
  },
  barriers: {
    title: "Identifiquemos barreras para el aprendizaje",
    question1: "¿En qué momento o actividad aparece la barrera?",
    placeholder1: "Ej. Durante lecturas extensas con vocabulario poco familiar.",
    question2: "¿Qué apoyo ya ha funcionado o podría probarse?",
    placeholder2: "Ej. Anticipación de vocabulario, audio y organizador visual.",
    suggestions: ["Acceso a la información", "Comunicación y lenguaje", "Atención sostenida", "Participación social", "Organización y autonomía"],
  },
  dua_adjustments: {
    title: "Diseñemos apoyos DUA",
    question1: "¿Qué barrera concreta debe reducirse?",
    placeholder1: "Ej. Dificultad para comprender consignas extensas.",
    question2: "¿Cómo podrá demostrar el aprendizaje de otra manera?",
    placeholder2: "Ej. Mediante audio, mapa visual o explicación oral guiada.",
    suggestions: ["Apoyo visual", "Audio o lectura acompañada", "Opciones para responder", "Tiempo flexible", "Trabajo con pares"],
  },
  opening: {
    title: "Preparemos un inicio que active el aprendizaje",
    question1: "¿Qué saben o han vivido los estudiantes sobre el tema?",
    placeholder1: "Ej. Reconocen hábitos saludables de su familia, pero no explican sus beneficios.",
    question2: "¿Qué pregunta o experiencia despertará curiosidad?",
    placeholder2: "Ej. Comparar dos loncheras y decidir cuál ayuda más al bienestar.",
    suggestions: ["Pregunta retadora", "Imagen o caso breve", "Juego de saberes previos", "Experiencia de la comunidad", "Predicción o hipótesis"],
  },
  development: {
    title: "Organicemos el desarrollo de la sesión",
    question1: "¿Qué acciones realizará el estudiante para construir el aprendizaje?",
    placeholder1: "Ej. Observa, compara, explica, prueba y mejora una solución.",
    question2: "¿Qué mediación brindará el docente?",
    placeholder2: "Ej. Preguntas de andamiaje, ejemplos y retroalimentación durante el proceso.",
    suggestions: ["Trabajo colaborativo", "Análisis de caso", "Indagación guiada", "Producción con borradores", "Resolución de problemas"],
  },
  closure: {
    title: "Cerremos con metacognición",
    question1: "¿Qué aprendizaje debe quedar explícito?",
    placeholder1: "Ej. Explicar cómo la evidencia permitió tomar una decisión.",
    question2: "¿Cómo reconocerán sus avances y próximos pasos?",
    placeholder2: "Ej. Semáforo de logro y compromiso personal para la siguiente sesión.",
    suggestions: ["Ticket de salida", "Autoevaluación", "Síntesis visual", "Pregunta metacognitiva", "Compromiso de mejora"],
  },
  observations: {
    title: "Redactemos observaciones útiles",
    question1: "¿Qué hecho objetivo debe registrarse?",
    placeholder1: "Ej. La mayoría resolvió el reto; seis estudiantes necesitaron apoyo visual.",
    question2: "¿Qué decisión se tomará a partir de esa evidencia?",
    placeholder2: "Ej. Reagrupar temporalmente y practicar con ejemplos graduados.",
    suggestions: ["Avance del grupo", "Dificultad recurrente", "Apoyo que funcionó", "Acuerdo con la familia", "Próxima acción"],
  },
  student_characteristics: {
    title: "Personalicemos las características del grupo",
    question1: "¿Qué ritmos, estilos o necesidades de aprendizaje predominan?",
    placeholder1: "Ej. El grupo aprende mejor con experiencias prácticas y apoyos visuales.",
    question2: "¿Qué rasgo socioemocional, cultural o lingüístico debe considerarse?",
    placeholder2: "Ej. Existe diversidad cultural y se requiere fortalecer la participación segura.",
    suggestions: ["Ritmos heterogéneos", "Aprendizaje visual y práctico", "Diversidad cultural y lingüística", "Necesidad de acompañamiento socioemocional", "Preferencia por el trabajo colaborativo"],
  },
  context_characteristics: {
    title: "Describamos el contexto territorial e institucional",
    question1: "¿Qué rasgo del entorno geográfico, social o cultural influye en el aprendizaje?",
    placeholder1: "Ej. Comunidad agrícola con saberes locales sobre el cuidado del agua.",
    question2: "¿Qué recurso u oportunidad de la institución o comunidad se aprovechará?",
    placeholder2: "Ej. Biohuerto escolar y participación de familias y actores comunitarios.",
    suggestions: ["Entorno urbano comercial", "Saberes comunitarios", "Conectividad limitada", "Patrimonio e identidad local", "Proyectos ambientales de la comunidad"],
  },
  tutoring_activities: {
    title: "Diseñemos las acciones de tutoría",
    question1: "¿Qué necesidad socioemocional o de convivencia requiere atención prioritaria?",
    placeholder1: "Ej. Dificultad para autorregular emociones y resolver desacuerdos.",
    question2: "¿Qué estrategia tutoral será viable durante el periodo?",
    placeholder2: "Ej. Asambleas de aula, dinámicas vivenciales y seguimiento quincenal.",
    suggestions: ["Convivencia y buen trato", "Autorregulación emocional", "Hábitos saludables", "Proyecto de vida", "Participación de las familias"],
  },
  teacher_bibliography: {
    title: "Seleccionemos referencias para el docente",
    question1: "¿Qué enfoque pedagógico o documento oficial debe sustentar la propuesta?",
    placeholder1: "Ej. Currículo Nacional, evaluación formativa y orientaciones del MINEDU.",
    question2: "¿Qué área o necesidad didáctica requiere mayor respaldo?",
    placeholder2: "Ej. Estrategias de lectura y producción de textos en secundaria.",
    suggestions: ["Currículo Nacional (CNEB)", "Evaluación formativa", "Didáctica por área", "Inclusión y DUA", "Tecnología e IA educativa"],
  },
  student_bibliography: {
    title: "Seleccionemos materiales para el estudiante",
    question1: "¿Qué tipo de texto, guía o recurso utilizará el estudiante?",
    placeholder1: "Ej. Cuaderno de trabajo MINEDU y lecturas graduadas sobre el tema.",
    question2: "¿Qué formato o nivel de complejidad necesita el grupo?",
    placeholder2: "Ej. Lenguaje claro, apoyos visuales y opciones de lectura accesible.",
    suggestions: ["Cuadernos MINEDU", "Lecturas adaptadas", "Fichas de autoevaluación", "Material manipulativo", "Recursos digitales interactivos"],
  },
};

const guideByTool: Record<string, Partial<Record<string, WorkflowFieldGuide>>> = {
  "plan-curricular-anual": {
    graduate_profile: {
      title: "Proyectemos el perfil de egreso",
      question1: "¿Qué características tiene hoy el grupo?",
      placeholder1: "Ej. Participa con entusiasmo, pero requiere fortalecer autonomía y argumentación.",
      question2: "¿Qué cambios esperas observar al finalizar el año?",
      placeholder2: "Ej. Gestiona su aprendizaje, comunica decisiones y colabora responsablemente.",
      suggestions: ["Autonomía", "Pensamiento crítico", "Comunicación", "Ciudadanía", "Competencia digital"],
    },
  },
  "correo-familias": {
    key_points: {
      title: "Preparemos un mensaje claro para la familia",
      question1: "¿Qué hecho concreto necesitas comunicar?",
      placeholder1: "Ej. El estudiante mejoró su participación, pero aún entrega actividades fuera de fecha.",
      question2: "¿Qué acción esperas coordinar con la familia?",
      placeholder2: "Ej. Acordar una rutina breve de revisión de tareas durante dos semanas.",
      suggestions: ["Reconocer un avance", "Informar una dificultad", "Solicitar una reunión", "Recordar un acuerdo", "Proponer apoyo en casa"],
    },
  },
  "retroalimentacion-formativa": {
    clarify: {
      title: "Formulemos preguntas para clarificar",
      question1: "¿Qué parte de la evidencia necesita que el estudiante explique mejor?",
      placeholder1: "Ej. Cómo eligió la información que respalda su conclusión.",
      question2: "¿Qué pregunta abierta le permitirá revisar su propio proceso?",
      placeholder2: "Ej. ¿Qué criterio utilizaste para decidir que esa fuente era confiable?",
      suggestions: ["Explicar una decisión", "Precisar el procedimiento", "Relacionar evidencia y conclusión", "Aclarar el propósito", "Reconocer una dificultad"],
    },
    value: {
      title: "Reconozcamos fortalezas con evidencia",
      question1: "¿Qué logro concreto se observa en el trabajo del estudiante?",
      placeholder1: "Ej. Organizó las ideas con claridad y sustentó dos afirmaciones.",
      question2: "¿Qué criterio o capacidad demuestra ese logro?",
      placeholder2: "Ej. Selecciona información pertinente y comunica una conclusión coherente.",
      suggestions: ["Estrategia bien aplicada", "Idea sustentada", "Progreso respecto al intento anterior", "Autonomía", "Comunicación clara"],
    },
    concerns: {
      title: "Expresemos inquietudes sin emitir juicios",
      question1: "¿Qué diferencia existe entre la evidencia y el criterio esperado?",
      placeholder1: "Ej. La conclusión está presente, pero todavía no se relaciona con los datos.",
      question2: "¿Qué pregunta ayudará al estudiante a descubrir esa brecha?",
      placeholder2: "Ej. ¿Qué dato de tu tabla demuestra directamente esa conclusión?",
      suggestions: ["Falta de sustento", "Procedimiento incompleto", "Idea poco clara", "Criterio parcialmente logrado", "Necesidad de revisar la fuente"],
    },
    suggestions: {
      title: "Propongamos el siguiente paso alcanzable",
      question1: "¿Qué acción concreta puede realizar el estudiante para mejorar?",
      placeholder1: "Ej. Elegir dos datos y explicar por escrito cómo respaldan su conclusión.",
      question2: "¿Qué apoyo o ejemplo puede ofrecer el docente sin resolver la tarea?",
      placeholder2: "Ej. Mostrar un ejemplo distinto y entregar una lista breve de verificación.",
      suggestions: ["Revisar con una lista de cotejo", "Comparar con un ejemplo", "Corregir una parte", "Explicar oralmente", "Intentar de nuevo con apoyo gradual"],
    },
  },
};

type SemanticGuide = Omit<WorkflowFieldGuide, "contextKey">;

const includesAny = (value: string, fragments: string[]) => fragments.some((fragment) => value.includes(fragment));

function inferSemanticGuide(field: WorkflowField): { key: string; guide: SemanticGuide } | null {
  const id = field.id.toLowerCase();
  const label = field.label.toLowerCase();

  if (includesAny(id, ["bibliography", "resources", "materials", "source_text", "source_content", "sources"])) {
    return { key: "resources", guide: {
      title: `Seleccionemos ${label}`,
      question1: `¿Qué recursos concretos deben aparecer en “${field.label}”?`,
      placeholder1: "Ej. Material oficial, recurso local, texto breve o soporte digital disponible.",
      question2: "¿Qué condición de acceso, formato o uso pedagógico debe respetarse?",
      placeholder2: "Ej. Bajo costo, accesible sin internet y adecuado a la edad.",
      suggestions: ["Material oficial MINEDU", "Recursos de la comunidad", "Alternativa sin internet", "Formato visual o manipulativo", "Fuente verificable"],
    } };
  }

  if (includesAny(id, ["barrier", "adjustment", "adaptation", "support", "saanee", "accommodations", "dua", "inclusi"])) {
    return { key: "inclusion", guide: {
      title: `Personalicemos ${label}`,
      question1: `¿Qué barrera o necesidad concreta debe atender “${field.label}”?`,
      placeholder1: "Ej. Dificultad para comprender consignas extensas o mantener la atención.",
      question2: "¿Qué apoyo, ajuste o forma alternativa de participación será viable?",
      placeholder2: "Ej. Consignas fragmentadas, apoyo visual y opción de respuesta oral.",
      suggestions: ["Apoyo visual", "Consignas paso a paso", "Tiempo flexible", "Opciones para responder", "Coordinación con familia o SAANEE"],
    } };
  }

  if (includesAny(id, ["competenc", "capacit", "criteri", "rubric", "assessment", "evaluation", "evidence", "product", "performance", "desempeno", "indicator"])) {
    return { key: "assessment", guide: {
      title: `Alineemos ${label}`,
      question1: `¿Qué aprendizaje o desempeño debe demostrar “${field.label}”?`,
      placeholder1: "Ej. Explica, argumenta o resuelve usando evidencias y una estrategia pertinente.",
      question2: "¿Qué producto o evidencia permitirá observarlo con claridad?",
      placeholder2: "Ej. Una explicación oral, una producción escrita o una solución comentada.",
      suggestions: ["Desempeño observable", "Evidencia auténtica", "Alineación al CNEB", "Criterio claro y medible", "Retroalimentación formativa"],
    } };
  }

  if (includesAny(id, ["sequence", "phase", "timeline", "calendar", "activit", "committee_plan", "plan", "intervention", "milestone", "route", "session", "attention"])) {
    return { key: "sequence", guide: {
      title: `Organicemos ${label}`,
      question1: `¿Qué acciones o hitos indispensables debe contener “${field.label}”?`,
      placeholder1: "Ej. Activación, trabajo guiado, producción, revisión y socialización.",
      question2: "¿Qué tiempos, responsables o recursos condicionan la secuencia?",
      placeholder2: "Ej. Dos semanas, equipos de cuatro y uso de materiales disponibles en aula.",
      suggestions: ["Inicio, desarrollo y cierre", "Responsables definidos", "Tiempos realistas", "Producto por etapa", "Seguimiento y mejora"],
    } };
  }

  if (includesAny(id, ["family", "home", "communication", "commitment", "agreement", "guidance", "referral", "frequency", "guardian", "message", "email"])) {
    return { key: "coordination", guide: {
      title: `Acordemos ${label}`,
      question1: `¿Qué situación concreta debe atender “${field.label}”?`,
      placeholder1: "Ej. Necesidad de mejorar la asistencia, la rutina de estudio o el acompañamiento emocional.",
      question2: "¿Quién realizará qué acción y cómo se verificará el acuerdo?",
      placeholder2: "Ej. Familia y docente revisarán el avance cada viernes durante un mes.",
      suggestions: ["Acuerdo concreto y respetuoso", "Responsable y fecha", "Comunicación empática", "Seguimiento breve", "Ruta de apoyo o derivación"],
    } };
  }

  if (includesAny(id, ["diagnos", "difficult", "problem", "case", "alert", "observ", "facts", "context", "reason", "signals", "background", "witness", "report", "wellbeing"])) {
    return { key: "diagnosis", guide: {
      title: `Analicemos ${label}`,
      question1: `¿Qué hecho objetivo o evidencia debe quedar registrado en “${field.label}”?`,
      placeholder1: "Ej. Conducta observada, resultado reciente, frecuencia y situación en la que ocurre.",
      question2: "¿Qué factor del contexto o necesidad ayuda a comprenderlo sin emitir juicios?",
      placeholder2: "Ej. Cambio de rutina, barrera de acceso, apoyo previo o condición del grupo.",
      suggestions: ["Hechos observables", "Frecuencia y periodo", "Evidencia pedagógica", "Factor del contexto", "Necesidad prioritaria"],
    } };
  }

  if (includesAny(id, ["conclusion", "analysis", "strength", "progress", "achievement", "recommendation", "feedback", "notes", "interpretation"])) {
    return { key: "balance", guide: {
      title: `Redactemos ${label}`,
      question1: `¿Qué evidencia principal sustenta “${field.label}”?`,
      placeholder1: "Ej. Resultados, producciones o cambios observados durante el periodo.",
      question2: "¿Qué decisión, recomendación o próximo paso se desprende de esa evidencia?",
      placeholder2: "Ej. Mantener el apoyo, ajustar la estrategia o acordar una acción de seguimiento.",
      suggestions: ["Logro sustentado", "Dificultad específica", "Comparación del progreso", "Decisión pedagógica", "Próximo paso viable"],
    } };
  }

  if (includesAny(id, ["characteristic", "learning_styles", "profile", "portfolio", "philosophy", "coexistence", "talents", "interests", "values", "autonomy", "group", "assignments"])) {
    return { key: "identity", guide: {
      title: `Definamos ${label}`,
      question1: `¿Qué rasgos, principios o necesidades deben representar “${field.label}”?`,
      placeholder1: "Ej. Diversidad del grupo, autonomía, convivencia y aprendizaje activo.",
      question2: "¿Cómo se evidenciará esa definición en la práctica o en el documento?",
      placeholder2: "Ej. Mediante acuerdos, evidencias organizadas y acciones observables.",
      suggestions: ["Identidad del grupo", "Principios pedagógicos", "Diversidad y participación", "Evidencias organizadas", "Aplicación práctica"],
    } };
  }

  if (includesAny(id, ["situation", "challenge", "purpose", "justification", "title", "instructions", "approach", "reflection", "goal", "objective", "priority", "priorities", "must_include", "constraints"])) {
    return { key: "purpose", guide: {
      title: `Construyamos ${label}`,
      question1: `¿Qué propósito, necesidad o reto central debe expresar “${field.label}”?`,
      placeholder1: "Ej. Resolver una situación cercana que movilice aprendizajes relevantes.",
      question2: "¿Qué característica del grupo o del contexto hará que la propuesta sea pertinente?",
      placeholder2: "Ej. Intereses del aula, recursos disponibles y nivel de autonomía.",
      suggestions: ["Reto auténtico", "Propósito claro", "Contexto cercano", "Participación activa", "Aplicación en la vida cotidiana"],
    } };
  }

  if (includesAny(id, ["topic", "theme", "subject", "question", "need", "content", "elements", "focus", "scope", "links"])) {
    return { key: "topic", guide: {
      title: `Definamos ${label}`,
      question1: `¿Qué aprendizaje, concepto o pregunta central debe abordar “${field.label}”?`,
      placeholder1: "Ej. Un dilema real, concepto clave o tema motivador adecuado al grado.",
      question2: "¿Qué enfoque o situación cotidiana facilitará la comprensión de los estudiantes?",
      placeholder2: "Ej. Ejemplos cercanos, problemas de la comunidad y aplicación práctica.",
      suggestions: ["Situación cotidiana", "Pregunta orientadora", "Enfoque transversal", "Concepto clave CNEB", "Aplicación práctica"],
    } };
  }

  if (includesAny(id, ["action", "responsibilit", "measures", "safeguard", "protection", "legal", "protocol", "options"])) {
    return { key: "action", guide: {
      title: `Establezcamos ${label}`,
      question1: `¿Qué acción o medida inmediata debe definirse en “${field.label}”?`,
      placeholder1: "Ej. Derivación tutoral, acuerdo institucional o medida pedagógica preventiva.",
      question2: "¿Quién asumirá la responsabilidad y en qué plazo se evaluará el cumplimiento?",
      placeholder2: "Ej. Docente tutor y equipo directivo en coordinación con los aliados.",
      suggestions: ["Medida preventiva", "Responsable definido", "Ruta de protección", "Plazo realista", "Seguimiento periódico"],
    } };
  }

  if (includesAny(id, ["exercise", "task", "work", "dynamic", "what_to_learn", "perspective", "perspectives"])) {
    return { key: "activity", guide: {
      title: `Diseñemos ${label}`,
      question1: `¿Qué reto, ejercicio o postura debe desarrollarse en “${field.label}”?`,
      placeholder1: "Ej. Actividad guiada con niveles de complejidad progresiva.",
      question2: "¿Qué consigna u orientación ayudará al estudiante a resolver con autonomía?",
      placeholder2: "Ej. Instrucciones paso a paso, modelado y preguntas de apoyo.",
      suggestions: ["Reto graduado", "Autonomía en el trabajo", "Consigna clara", "Reflexión individual", "Trabajo colaborativo"],
    } };
  }

  return null;
}

export function getWorkflowFieldGuide(toolId: string, field: WorkflowField): WorkflowFieldGuide {
  const explicit = field.guide && typeof field.guide === "object" ? field.guide : {};
  const toolGuide = guideByTool[toolId]?.[field.id];
  const fieldGuide = guideByField[field.id];
  const semantic = inferSemanticGuide(field);
  const contextual = toolGuide ?? fieldGuide ?? semantic?.guide ?? {};
  const contextKey = toolGuide
    ? `tool:${toolId}:${field.id}`
    : fieldGuide
      ? `field:${field.id}`
      : semantic
        ? `semantic:${semantic.key}:${field.id}`
        : `fallback:${toolId}:${field.id}`;
  return {
    title: `Personalicemos ${field.label.toLowerCase()}`,
    question1: `¿Qué información concreta debe incluir “${field.label}” en esta herramienta?`,
    placeholder1: field.placeholder || "Escribe un dato, situación o ejemplo relevante.",
    question2: `¿Qué condición del grupo o del contexto debe respetar la propuesta para “${field.label}”?`,
    placeholder2: "Ej. Debe ser breve, aplicable y adecuado al grado.",
    suggestions: ["Usar información del formulario", "Redacción clara y directa", "Atender la diversidad del grupo", "Alinear al CNEB", "Proponer acciones observables"],
    ...contextual,
    ...explicit,
    contextKey,
  };
}
