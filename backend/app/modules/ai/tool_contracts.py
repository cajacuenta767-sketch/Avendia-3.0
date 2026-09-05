from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class ToolGenerationContract:
    product_name: str
    audience: str
    result_kind: str
    required_elements: tuple[str, ...]
    quality_rules: tuple[str, ...]
    next_tools: tuple[str, ...] = ()
    version: str = "2026.09"

    def prompt_block(self) -> str:
        elements = "\n".join(f"- {item}" for item in self.required_elements)
        rules = "\n".join(f"- {item}" for item in self.quality_rules)
        return (
            f"PRODUCTO ESPECÍFICO: {self.product_name}\n"
            f"DESTINATARIO PRINCIPAL: {self.audience}\n"
            f"FORMA DEL RESULTADO: {self.result_kind}\n\n"
            f"ELEMENTOS QUE DEBEN DESARROLLARSE DE MANERA EXPLÍCITA:\n{elements}\n\n"
            f"REGLAS DE CALIDAD PROPIAS DE ESTA HERRAMIENTA:\n{rules}"
        )


def _contract(
    product_name: str,
    audience: str,
    result_kind: str,
    elements: tuple[str, ...],
    rules: tuple[str, ...],
    next_tools: tuple[str, ...] = (),
) -> ToolGenerationContract:
    return ToolGenerationContract(
        product_name=product_name,
        audience=audience,
        result_kind=result_kind,
        required_elements=elements,
        quality_rules=rules,
        next_tools=next_tools,
    )


_DOC_RULES = (
    "Mantener coherencia entre propósito, competencia, actividad, evidencia y evaluación.",
    "No inventar personas, códigos, fechas, normas, diagnósticos ni fuentes.",
    "Escribir contenido listo para revisar y editar, no explicaciones sobre cómo hacerlo.",
)
_STUDENT_RULES = (
    "Usar consignas directas, numeradas y adecuadas a la edad y modalidad.",
    "Indicar qué producto o evidencia debe entregar el estudiante.",
    "Proponer materiales realistas para el tiempo y contexto declarados.",
)
_ASSESSMENT_RULES = (
    "Relacionar cada criterio con una evidencia observable.",
    "Evitar criterios ambiguos, duplicados o imposibles de comprobar.",
    "Mantener la decisión final y la retroalimentación bajo control docente.",
)
_SAFE_RULES = (
    "Usar lenguaje descriptivo, cuidadoso y no clínico.",
    "Separar hechos, interpretación pedagógica, acuerdos y próximos pasos.",
    "No exponer datos sensibles innecesarios ni emitir diagnósticos.",
)
_RESOURCE_RULES = (
    "Crear contenido directamente utilizable y no una descripción genérica del recurso.",
    "Incluir comprobación, solución u orientación docente cuando corresponda.",
    "Evitar elementos repetidos, ambiguos o desconectados del tema.",
)


TOOL_CONTRACTS: dict[tuple[str, str], ToolGenerationContract] = {
    # Planificamos
    ("planificamos", "plan-curricular-anual"): _contract(
        "Plan Curricular Anual completo",
        "docente y equipo directivo",
        "documento institucional por matrices y periodos",
        (
            "datos institucionales",
            "calendarización",
            "demandas",
            "competencias",
            "materiales",
            "referencias",
            "bibliografía",
            "compromisos",
        ),
        _DOC_RULES
        + ("Distribuir unidades y competencias sin repetir el mismo contenido por periodo.",),
        ("unidad-aprendizaje", "sesion-aprendizaje"),
    ),
    ("planificamos", "unidad-aprendizaje"): _contract(
        "Unidad de Aprendizaje",
        "docente",
        "documento curricular con secuencia de sesiones",
        (
            "situación significativa",
            "propósitos",
            "competencias",
            "producto",
            "evidencias",
            "criterios",
            "secuencia",
            "DUA",
        ),
        _DOC_RULES + ("Las sesiones deben conducir progresivamente al producto final.",),
        ("sesion-aprendizaje", "rubrica-evaluacion", "tarea-extension-hogar"),
    ),
    ("planificamos", "sesion-aprendizaje"): _contract(
        "Sesión de Aprendizaje",
        "docente",
        "secuencia didáctica temporizada",
        (
            "propósito",
            "competencia y desempeño",
            "evidencia",
            "inicio",
            "desarrollo",
            "cierre",
            "criterios",
            "retroalimentación",
            "recursos",
        ),
        _DOC_RULES
        + (
            "La suma de tiempos debe corresponder a la duración total.",
            "Inicio, desarrollo y cierre deben contener acciones observables.",
        ),
        ("tarea-extension-hogar", "ficha-aprendizaje", "lista-cotejo", "presentaciones-didacticas"),
    ),
    ("planificamos", "situacion-significativa"): _contract(
        "Situación significativa contextualizada",
        "docente",
        "reto pedagógico breve y accionable",
        ("contexto", "problema", "actores", "pregunta retadora", "producto", "criterios"),
        _DOC_RULES + ("El reto debe poder resolverse mediante las competencias seleccionadas.",),
        ("unidad-aprendizaje", "proyectos-integrados"),
    ),
    ("planificamos", "proyectos-integrados"): _contract(
        "Proyecto integrado ABP",
        "equipo docente",
        "plan interdisciplinario por fases",
        (
            "desafío",
            "áreas articuladas",
            "competencias por área",
            "producto",
            "fases",
            "roles",
            "cronograma",
            "evaluación",
        ),
        _DOC_RULES + ("Explicar el aporte específico de cada área al producto común.",),
        ("rubrica-evaluacion", "sesion-aprendizaje"),
    ),
    ("planificamos", "adaptacion-nee-dua"): _contract(
        "Adaptación Inclusiva NEE y DUA",
        "docente y equipo de apoyo",
        "plan de barreras, apoyos y seguimiento",
        (
            "fortalezas",
            "barreras BAP",
            "compromiso",
            "representación",
            "acción y expresión",
            "ajustes razonables",
            "responsables",
            "seguimiento",
        ),
        _DOC_RULES
        + _SAFE_RULES
        + ("No convertir una necesidad educativa en diagnóstico clínico.",),
        ("plan-atencion", "seguimiento-evaluacion"),
    ),
    ("planificamos", "tarea-extension-hogar"): _contract(
        "Ficha de Tarea de Extensión y Hogar",
        "estudiante y familia",
        "ficha imprimible, breve y ejecutable",
        (
            "título motivador",
            "objetivo para el estudiante",
            "tiempo estimado",
            "materiales accesibles",
            "instrucciones numeradas",
            "actividad principal",
            "ejemplo breve",
            "producto o evidencia",
            "criterio de revisión",
            "apoyo familiar opcional",
            "autoevaluación",
        ),
        _STUDENT_RULES
        + (
            "La familia acompaña, pero no resuelve la actividad por el estudiante.",
            "No pedir internet, impresora, compras o materiales especiales si no fueron "
            "declarados disponibles.",
            "La tarea debe vincularse con el propósito y poder completarse en el tiempo indicado.",
        ),
        ("lista-cotejo", "retroalimentacion-formativa"),
    ),
    ("planificamos", "carpeta-pedagogica"): _contract(
        "Carpeta Pedagógica Oficial",
        "docente y equipo directivo",
        "índice institucional con documentos y anexos",
        (
            "presentación",
            "datos institucionales",
            "planificación",
            "evaluación",
            "tutoría",
            "evidencias",
            "seguimiento",
            "anexos",
        ),
        _DOC_RULES + ("Organizar un índice verificable y evitar duplicar documentos completos.",),
        ("plan-curricular-anual", "plan-tutoria"),
    ),
    # Evaluamos
    ("evaluamos", "rubrica-evaluacion"): _contract(
        "Rúbrica de evaluación",
        "docente y estudiante",
        "matriz de criterios por niveles",
        (
            "evidencia",
            "criterios",
            "niveles",
            "descriptores progresivos",
            "puntaje opcional",
            "recomendación de mejora",
        ),
        _ASSESSMENT_RULES,
        ("calificador-rubrica",),
    ),
    ("evaluamos", "lista-cotejo"): _contract(
        "Lista de cotejo",
        "docente",
        "tabla por estudiante y criterio",
        ("nómina", "criterios observables", "Sí/No", "observaciones", "resumen"),
        _ASSESSMENT_RULES,
        ("retroalimentacion-formativa",),
    ),
    ("evaluamos", "ficha-aprendizaje"): _contract(
        "Ficha de aprendizaje",
        "estudiante",
        "ficha de práctica con espacios de respuesta",
        (
            "propósito",
            "instrucciones",
            "activación",
            "práctica guiada",
            "aplicación",
            "reto",
            "metacognición",
            "clave docente",
        ),
        _STUDENT_RULES + _ASSESSMENT_RULES,
        ("lista-cotejo",),
    ),
    ("evaluamos", "examen"): _contract(
        "Examen",
        "estudiante y docente",
        "instrumento con matriz, puntajes y clave separada",
        (
            "matriz de cobertura",
            "preguntas variadas",
            "puntaje",
            "criterios",
            "clave",
            "retroalimentación",
        ),
        _ASSESSMENT_RULES
        + ("Distribuir ítems por nivel cognitivo y evitar preguntas equivalentes.",),
        ("retroalimentacion-formativa",),
    ),
    ("evaluamos", "escala-estimacion"): _contract(
        "Escala de estimación",
        "docente",
        "tabla de indicadores y niveles progresivos",
        ("indicadores", "niveles", "descriptores", "observación", "recomendación"),
        _ASSESSMENT_RULES,
    ),
    ("evaluamos", "preguntas-texto"): _contract(
        "Preguntas sobre texto",
        "estudiante y docente",
        "lectura con preguntas y clave separada",
        (
            "texto fuente",
            "preguntas literales",
            "preguntas inferenciales",
            "preguntas críticas",
            "respuestas",
            "justificación",
            "criterios",
        ),
        _STUDENT_RULES
        + _ASSESSMENT_RULES
        + ("Cada respuesta debe sustentarse en el texto aportado.",),
    ),
    ("evaluamos", "ficha-observacion"): _contract(
        "Ficha de observación",
        "docente",
        "registro de hechos, indicadores y seguimiento",
        (
            "sujeto o equipo",
            "fecha",
            "contexto",
            "indicadores",
            "hechos",
            "evidencias",
            "acuerdos",
            "seguimiento",
        ),
        _ASSESSMENT_RULES + _SAFE_RULES,
    ),
    ("evaluamos", "registros-auxiliares"): _contract(
        "Registro auxiliar",
        "docente",
        "hoja tabular por estudiante y periodo",
        (
            "nómina",
            "periodo",
            "competencias",
            "calificaciones",
            "asistencia",
            "observaciones",
            "resumen",
        ),
        _ASSESSMENT_RULES,
    ),
    ("evaluamos", "carpetas-recuperacion"): _contract(
        "Carpeta de recuperación",
        "estudiante y docente",
        "ruta diferenciada de actividades",
        (
            "diagnóstico",
            "metas",
            "actividades graduadas",
            "evidencias",
            "criterios",
            "cronograma",
            "seguimiento",
        ),
        _STUDENT_RULES + _ASSESSMENT_RULES,
        ("monitorea-avances",),
    ),
    ("evaluamos", "calificador-rubrica"): _contract(
        "Calificación asistida por rúbrica",
        "docente",
        "análisis por criterio con evidencia citada",
        (
            "evidencia",
            "criterio",
            "nivel sugerido",
            "sustento",
            "fortaleza",
            "mejora",
            "decisión docente",
        ),
        _ASSESSMENT_RULES
        + ("Citar fragmentos reales de la evidencia; no completar información ausente.",),
    ),
    ("evaluamos", "retroalimentacion-formativa"): _contract(
        "Retroalimentación formativa",
        "estudiante",
        "devolución mediante fortalezas y siguiente paso",
        ("clarificación", "valoración", "inquietud", "sugerencia", "siguiente paso"),
        _ASSESSMENT_RULES + ("Usar lenguaje motivador, específico y accionable.",),
    ),
    ("evaluamos", "analytics-alertas"): _contract(
        "Analítica de aula y alertas",
        "docente",
        "panel de tendencias y acciones",
        (
            "indicadores",
            "tendencias",
            "evidencias",
            "grupos",
            "alertas",
            "acciones",
            "responsables",
        ),
        _ASSESSMENT_RULES + _SAFE_RULES,
    ),
    # Incluimos
    ("incluimos", "adaptacion-nee-dua"): _contract(
        "Adaptación Inclusiva NEE y DUA",
        "docente y equipo de apoyo",
        "plan de acceso, participación y seguimiento",
        (
            "fortalezas",
            "barreras BAP",
            "apoyos",
            "ajustes",
            "responsables",
            "indicadores",
            "seguimiento",
        ),
        _DOC_RULES + _SAFE_RULES,
        ("plan-atencion",),
    ),
    ("incluimos", "plan-atencion"): _contract(
        "Plan de atención individual o grupal",
        "docente, familia y equipo de apoyo",
        "plan con diagnóstico pedagógico y metas",
        (
            "situación pedagógica",
            "fortalezas",
            "barreras",
            "objetivos",
            "estrategias",
            "responsables",
            "fechas",
            "evidencias",
            "seguimiento",
        ),
        _DOC_RULES + _SAFE_RULES,
        ("seguimiento-evaluacion",),
    ),
    ("incluimos", "estrategias-inclusion"): _contract(
        "Estrategias de inclusión",
        "docente",
        "fichas de estrategias por barrera",
        ("barrera", "estrategia", "aplicación", "recurso", "indicador", "ajuste DUA"),
        _DOC_RULES + _SAFE_RULES,
    ),
    ("incluimos", "trabajo-familias"): _contract(
        "Plan de trabajo con familias",
        "docente y familia",
        "acuerdos de acompañamiento hogar-escuela",
        (
            "situación",
            "fortalezas familiares",
            "pautas",
            "acuerdos",
            "responsables",
            "canal",
            "fecha de revisión",
        ),
        _SAFE_RULES + ("Las pautas deben ser realistas y respetar la dinámica familiar.",),
    ),
    ("incluimos", "seguimiento-evaluacion"): _contract(
        "Seguimiento de inclusión",
        "docente y equipo de apoyo",
        "informe comparativo de avances y reajustes",
        (
            "línea base",
            "apoyos aplicados",
            "avances",
            "barreras persistentes",
            "evidencias",
            "reajustes",
            "próxima revisión",
        ),
        _ASSESSMENT_RULES + _SAFE_RULES,
    ),
    # Reforzamos
    ("reforzamos", "trabajo-autonomo"): _contract(
        "Trabajo autónomo para el hogar",
        "estudiante y familia",
        "ruta semanal de práctica autónoma",
        (
            "meta",
            "tiempo",
            "actividades graduadas",
            "materiales",
            "evidencia",
            "autoevaluación",
            "apoyo familiar opcional",
        ),
        _STUDENT_RULES,
    ),
    ("reforzamos", "carpeta-recuperacion"): _contract(
        "Carpeta de recuperación",
        "estudiante y docente",
        "carpeta diferenciada individual o grupal",
        (
            "diagnóstico",
            "metas",
            "actividades",
            "criterios",
            "evidencias",
            "cronograma",
            "control de avance",
        ),
        _STUDENT_RULES + _ASSESSMENT_RULES,
        ("monitorea-avances",),
    ),
    ("reforzamos", "monitorea-avances"): _contract(
        "Monitoreo de avances",
        "docente",
        "panel por periodo, competencia y estudiante",
        ("línea base", "periodo", "capacidad", "desempeño", "evidencias", "tendencia", "decisión"),
        _ASSESSMENT_RULES,
    ),
    ("reforzamos", "acompanamiento-motivacion"): _contract(
        "Plan de acompañamiento y motivación",
        "docente y estudiante",
        "microplan de metas, mensajes y seguimiento",
        (
            "fortalezas",
            "intereses",
            "micro-metas",
            "acciones",
            "reconocimiento",
            "apoyo familiar",
            "seguimiento",
        ),
        _SAFE_RULES + ("No usar elogios vacíos ni culpabilizar al estudiante.",),
    ),
    ("reforzamos", "plan-refuerzo"): _contract(
        "Plan de refuerzo",
        "docente",
        "plan de hasta tres sesiones por ciclo de apoyo",
        (
            "diagnóstico",
            "competencia",
            "criterios",
            "agrupamiento",
            "frecuencia",
            "sesiones",
            "recursos",
            "evidencias",
            "compromisos",
        ),
        _DOC_RULES + _ASSESSMENT_RULES,
        ("monitorea-avances",),
    ),
    # Acompañamos
    ("acompanamos", "correo-familias"): _contract(
        "Correo a familias",
        "familia",
        "comunicación breve lista para revisar y copiar",
        (
            "asunto",
            "saludo",
            "hecho verificable",
            "avance o necesidad",
            "acuerdo",
            "fecha",
            "cierre",
        ),
        _SAFE_RULES + ("Evitar lenguaje técnico, acusatorio o alarmista.",),
    ),
    ("acompanamos", "respuesta-correo"): _contract(
        "Respuesta de correo",
        "familia",
        "respuesta contextualizada y respetuosa",
        (
            "saludo",
            "comprensión del mensaje",
            "hechos",
            "respuesta",
            "acuerdo",
            "próximo paso",
            "cierre",
        ),
        _SAFE_RULES,
    ),
    ("acompanamos", "analytics-alertas"): _contract(
        "Analítica y alertas de acompañamiento",
        "docente y tutor",
        "panel de priorización de casos",
        ("evidencia", "señal", "prioridad", "responsable", "acción", "fecha", "seguimiento"),
        _ASSESSMENT_RULES + _SAFE_RULES,
    ),
    ("acompanamos", "calificador-ia"): _contract(
        "Calificador asistido",
        "docente",
        "análisis de evidencia con decisión humana",
        (
            "criterio",
            "evidencia citada",
            "nivel sugerido",
            "sustento",
            "feedback",
            "decisión docente",
        ),
        _ASSESSMENT_RULES,
    ),
    ("acompanamos", "reporte-seguimiento"): _contract(
        "Reporte de seguimiento",
        "docente, familia o coordinación",
        "reporte formal por periodo",
        (
            "avances",
            "dificultades",
            "evidencias",
            "compromisos",
            "responsables",
            "acciones",
            "fecha de revisión",
        ),
        _SAFE_RULES + _DOC_RULES,
    ),
    # Tutoría
    ("tutoria", "plan-tutoria"): _contract(
        "Plan de tutoría",
        "docente tutor y dirección",
        "plan anual o periódico por dimensiones TOE",
        (
            "diagnóstico",
            "objetivos",
            "dimensiones",
            "sesiones",
            "familias",
            "cronograma",
            "responsables",
            "evaluación",
        ),
        _DOC_RULES + _SAFE_RULES,
        ("sesiones-tutoria", "informe-tutoria"),
    ),
    ("tutoria", "sesiones-tutoria"): _contract(
        "Sesión de tutoría",
        "estudiantes",
        "secuencia socioemocional cuidada",
        (
            "propósito",
            "acuerdos de cuidado",
            "inicio",
            "desarrollo",
            "cierre",
            "preguntas",
            "seguimiento",
        ),
        _STUDENT_RULES + _SAFE_RULES,
    ),
    ("tutoria", "informe-tutoria"): _contract(
        "Informe de tutoría",
        "dirección y docente tutor",
        "informe consolidado por periodo",
        (
            "acciones",
            "atenciones",
            "familias",
            "logros",
            "dificultades",
            "casos agregados",
            "recomendaciones",
        ),
        _DOC_RULES + _SAFE_RULES,
    ),
    ("tutoria", "informe-padres"): _contract(
        "Informe a padres de familia",
        "familia",
        "informe comprensible con acuerdos",
        (
            "situación",
            "evidencias",
            "avances",
            "necesidades",
            "acuerdos",
            "recomendaciones",
            "seguimiento",
        ),
        _SAFE_RULES,
    ),
    ("tutoria", "fichas-acompanamiento"): _contract(
        "Ficha de acompañamiento",
        "docente tutor",
        "registro protegido de atención y acuerdos",
        (
            "motivo",
            "antecedentes pertinentes",
            "situación",
            "orientación",
            "acuerdos",
            "derivación",
            "seguimiento",
        ),
        _SAFE_RULES,
    ),
    ("tutoria", "alertas-casos"): _contract(
        "Registro de alerta y caso",
        "equipo autorizado",
        "ruta protegida de actuación",
        (
            "hechos objetivos",
            "evidencia",
            "riesgo",
            "acción inmediata",
            "protocolo",
            "responsables",
            "medidas de protección",
            "seguimiento",
        ),
        _SAFE_RULES
        + ("No recomendar confrontaciones ni acciones fuera del protocolo institucional.",),
    ),
    ("tutoria", "recursos-tutoria"): _contract(
        "Recurso de tutoría",
        "estudiantes y docente tutor",
        "dinámica o taller aplicable",
        ("propósito", "materiales", "pasos", "preguntas", "cuidado", "reflexión", "cierre"),
        _STUDENT_RULES + _SAFE_RULES,
    ),
    ("tutoria", "orientacion-vocacional"): _contract(
        "Orientación vocacional",
        "estudiante",
        "perfil exploratorio y plan de acción",
        (
            "intereses",
            "fortalezas",
            "valores",
            "opciones",
            "preguntas",
            "acciones de exploración",
            "próxima revisión",
        ),
        _SAFE_RULES
        + ("No presentar una profesión como destino único o diagnóstico determinista.",),
    ),
    # Recursos
    ("recursos", "presentaciones-didacticas"): _contract(
        "Presentación didáctica",
        "estudiantes y docente",
        "diapositivas 16:9 con notas e interacción",
        (
            "portada",
            "objetivo",
            "activación",
            "contenido",
            "ejemplo",
            "interacción",
            "metacognición",
            "notas docentes",
            "referencia visual",
        ),
        _RESOURCE_RULES,
    ),
    ("recursos", "tarjetas-estudio"): _contract(
        "Tarjetas de estudio",
        "estudiante",
        "tarjetas frente, reverso y pista",
        ("consigna", "frentes", "reversos", "pistas", "repaso"),
        _RESOURCE_RULES,
    ),
    ("recursos", "agrupar-palabras"): _contract(
        "Agrupar palabras y taxonomías",
        "estudiante",
        "tablero de categorías y elementos",
        (
            "consigna",
            "categorías",
            "palabras",
            "criterio de clasificación",
            "comprobación",
            "solución",
        ),
        _RESOURCE_RULES,
    ),
    ("recursos", "ordenar-bloques"): _contract(
        "Ordenar bloques y secuencias",
        "estudiante",
        "secuencia reordenable con pistas",
        ("consigna", "bloques", "pistas", "orden correcto", "justificación"),
        _RESOURCE_RULES,
    ),
    ("recursos", "casos-estudio"): _contract(
        "Caso de estudio ABP",
        "estudiantes y docente",
        "caso, dilema y guía de análisis",
        (
            "relato",
            "dilema",
            "actores",
            "evidencias",
            "preguntas abiertas",
            "producto",
            "guía docente",
        ),
        _RESOURCE_RULES,
    ),
    ("recursos", "ahorcado"): _contract(
        "Ahorcado educativo",
        "estudiante",
        "partida con palabras, pistas y explicación",
        ("consigna", "palabras", "pistas", "intentos", "explicaciones", "solución"),
        _RESOURCE_RULES,
    ),
    ("recursos", "completa-frase"): _contract(
        "Completa la frase",
        "estudiante",
        "enunciados interactivos y clave",
        ("consigna", "enunciados", "respuestas", "distractores o banco", "explicación"),
        _RESOURCE_RULES,
    ),
    ("recursos", "emparejar-palabras"): _contract(
        "Emparejar palabras y glosarios",
        "estudiante",
        "pares inequívocos en dos columnas",
        ("consigna", "columna A", "columna B", "pares correctos", "explicación"),
        _RESOURCE_RULES,
    ),
    ("recursos", "debate-aula"): _contract(
        "Dinámica de debate",
        "estudiantes y docente",
        "guion de debate con roles y evaluación",
        ("moción", "contexto", "roles", "reglas", "argumentos", "repreguntas", "cierre", "rúbrica"),
        _RESOURCE_RULES + _SAFE_RULES,
    ),
    ("recursos", "crucigramas"): _contract(
        "Crucigrama",
        "estudiante",
        "cuadrícula, pistas y solucionario",
        ("consigna", "palabras", "pistas", "numeración", "cruces", "cuadrícula", "solución"),
        _RESOURCE_RULES,
    ),
    ("recursos", "sopas-letras"): _contract(
        "Sopa de letras",
        "estudiante",
        "cuadrícula proporcional y solucionario",
        ("consigna", "palabras", "pistas", "cuadrícula", "selección", "solución"),
        _RESOURCE_RULES,
    ),
    ("recursos", "banco-planificacion"): _contract(
        "Banco de recursos para planificar",
        "docente",
        "catálogo reutilizable por momento didáctico",
        (
            "propósito",
            "inicio",
            "desarrollo",
            "cierre",
            "materiales",
            "DUA",
            "evaluación",
            "reutilización",
        ),
        _RESOURCE_RULES,
    ),
    ("recursos", "normativa-educativa"): _contract(
        "Síntesis de normativa educativa",
        "docente y dirección",
        "ficha de consulta con verificación oficial",
        (
            "referencia",
            "alcance",
            "obligaciones",
            "aplicación",
            "alertas",
            "fuente oficial por verificar",
        ),
        _DOC_RULES + ("No afirmar vigencia ni número de norma sin fuente confirmada.",),
    ),
    ("recursos", "libros-guia-minedu"): _contract(
        "Selección de libros y guías MINEDU",
        "docente",
        "catálogo de recursos con uso pedagógico",
        ("recurso", "propósito", "contenido útil", "actividad", "adaptación", "referencia oficial"),
        _RESOURCE_RULES + ("No inventar títulos ni enlaces de materiales oficiales.",),
    ),
    ("recursos", "canales-audiovisuales"): _contract(
        "Selección audiovisual",
        "docente",
        "ficha de criterios y secuencia didáctica",
        (
            "tipo de fuente",
            "tema",
            "duración",
            "accesibilidad",
            "uso antes",
            "uso durante",
            "uso después",
            "preguntas",
            "verificación",
        ),
        _RESOURCE_RULES + ("No inventar URL ni afirmar que se revisó un video no suministrado.",),
    ),
}


def get_tool_contract(module: str, tool_id: str) -> ToolGenerationContract:
    try:
        return TOOL_CONTRACTS[(module, tool_id)]
    except KeyError as exc:
        raise ValueError(f"No generation contract registered for {module}/{tool_id}") from exc


def registered_contract_keys() -> set[tuple[str, str]]:
    return set(TOOL_CONTRACTS)
