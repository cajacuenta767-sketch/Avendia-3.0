# Matriz funcional de las 57 herramientas de Avendia

Fecha de auditoría: 31 de agosto de 2026.

## Regla de producto

La aplicación ya no usa un formulario universal de «título, tema y contexto». Cada herramienta tiene un contrato propio compuesto por pasos, campos, validaciones y secciones de salida. La matriz ejecutable está en `frontend/src/config/workflows.ts` y es comprobada automáticamente contra el menú completo.

El proyecto anterior se utiliza exclusivamente como fuente del formato funcional: cantidad y nombre de pasos, agrupaciones, campos, filtros, selectores, textos de ejemplo, ayudas IA existentes, vista previa y descarga. Sus colores, tipografías, logo, sombras y superficies no se importan. Todo se renderiza con los componentes y tokens actuales de Avendia 3.0 tanto en claro como en oscuro.

Todas las herramientas incluyen obligatoriamente modalidad educativa (EBR, EBA o EBE). Los datos institucionales se autocompletan desde el perfil y siguen siendo editables. Director y subdirector se solicitan únicamente en documentos oficiales que pueden requerir firma o validación; los recursos didácticos piden solo el contexto mínimo del aula.

## Escala de complejidad

- Alta: documentos oficiales, planes y análisis. Entre 4 y 9 pasos, con diagnóstico, alineación curricular, responsables, evaluación y seguimiento.
- Media: instrumentos, reportes y recursos elaborados. Entre 3 y 5 pasos.
- Breve: actividades didácticas. Entre 2 y 3 pasos, sin pedir información administrativa que no modifica el resultado.

## Planificamos — 8 herramientas

| Herramienta | Flujo | Datos distintivos | Salida de IA |
|---|---|---|---|
| Plan Curricular Anual | 9 pasos: Datos, Descripción, Calendarización, Demandas, Competencias, Materiales, Referencias, Bibliografía, Cierre | DRE, UGEL, I.E., MSE, modalidad, nivel, grado/ciclo, secciones, año, áreas, docente, director, subdirector, enfoque, justificación, perfil, contexto, problemas, prioridades, tutoría, fuentes | PCA estructurado con calendarización, competencias, enfoques, tutoría, recursos, referencias, firmas y recomendaciones |
| Unidad de Aprendizaje | 7 pasos | Responsables, periodo, turno, fechas, estudiantes, situación significativa, reto, propósitos, producto, evidencias, criterios, sesiones, DUA | Unidad completa alineada al CNEB |
| Sesión de Aprendizaje | 6 pasos | Fuente libre/libro/apuntes, unidad, tema, propósito, competencias, desempeño, inicio-desarrollo-cierre, duración, instrumento, nómina, recursos, DUA | Sesión aplicable con secuencia temporal, evaluación y retroalimentación |
| Situación significativa | 4 pasos | Eje, contexto, problema, intereses, reto, pregunta y producto | Situación auténtica con movilización curricular |
| Proyectos integrados | 5 pasos | Equipo docente, áreas articuladas, problema, pregunta guía, metodología, producto, fases, roles, aliados y evaluación | Proyecto interdisciplinario con cronograma |
| Adaptación NEE–DUA | 5 pasos | Estudiante/grupo, condición, fortalezas, barreras, desempeño adaptado, apoyos DUA, responsables y revisión | Plan de adaptación accesible y verificable |
| Tarea de extensión y hogar | 4 pasos | Fechas, condiciones del hogar, propósito, consigna, materiales, rol familiar, evidencia y criterios | Tarea autónoma y segura para el hogar |
| Carpeta pedagógica | 5 pasos | Responsables, perfil, carga, diagnóstico, documentos incluidos, horario, registros, evidencias y anexos | Índice y organización de carpeta oficial |

## Evaluamos — 11 herramientas

| Herramienta | Flujo | Datos distintivos | Salida de IA |
|---|---|---|---|
| Rúbrica de evaluación | 4 pasos | Competencia, desempeño, evidencia, número de criterios, escala, contexto y tipo | Matriz analítica/holística con descriptores observables |
| Lista de cotejo | 4 pasos | Producto, competencia, indicadores, estudiantes y tipo de registro | Lista aplicable y matriz de observación |
| Ficha de aprendizaje | 4 pasos | Tema, tipo, cantidad de actividades, dificultad, texto base y DUA | Ficha con práctica, reto, metacognición y clave |
| Examen | 4 pasos | Tipo, dificultad, temas, formatos, cantidad, duración, criterios y adecuaciones | Examen, puntaje, matriz y clave |
| Escala de estimación | 3 pasos | Actividad, criterios y escala | Indicadores y matriz de valoración |
| Preguntas sobre texto | 4 pasos | Texto, tipo textual, formato, cantidades literal/inferencial/crítica, capacidades, criterios y DUA | Preguntas por nivel, clave y retroalimentación |
| Ficha de observación | 4 pasos | Sujeto, tipo, foco, escala, hechos, contexto y compromisos | Instrumento, análisis y seguimiento |
| Registros auxiliares | 4 pasos | Periodo, escala, competencias, instrumento, nómina, asistencia y conclusiones | Registro y conclusiones descriptivas |
| Carpetas de recuperación | 4 pasos | Grupo, periodo, diagnóstico, competencias, criterios, actividades y familia | Ruta de recuperación y cronograma |
| Calificador de rúbrica con IA | 4 pasos | Rúbrica, evidencia, estudiante y ajustes docentes | Nivel sugerido, análisis por criterio y retroalimentación; decisión final docente |
| Analítica de aula y alertas | 4 pasos | Indicadores, desempeño, asistencia, alertas, factores y acciones | Tendencias, alertas priorizadas y plan de intervención |

## Incluimos — 5 herramientas

| Herramienta | Flujo | Datos distintivos | Salida de IA |
|---|---|---|---|
| Adaptación inclusiva NEE–DUA | 4 pasos | Perfil, barreras, currículo, metodología, evaluación, apoyos y seguimiento | Adaptación curricular y DUA |
| Plan de atención | 5 pasos | Diagnóstico, informe SAANEE, talentos, autonomía, desempeño, adaptaciones, metas y compromisos | PAI completo |
| Estrategias de inclusión | 4 pasos | Composición del aula, desafíos, dinámica social, metodología, empatía, tiempos y apoyos | Estrategias inclusivas con indicadores |
| Trabajo con familias | 4 pasos | Modalidad del encuentro, diagnóstico, barreras del hogar, rutinas, canales y compromisos | Acuerdos familia–escuela y seguimiento |
| Seguimiento y evaluación | 4 pasos | Periodo, adaptaciones, progreso pedagógico/socioemocional, apoyos, dificultades y reajustes | Informe de progreso y reajuste DUA |

## Reforzamos — 5 herramientas

| Herramienta | Flujo | Datos distintivos | Salida de IA |
|---|---|---|---|
| Trabajo autónomo para el hogar | 4 pasos | Competencia, tema, duración, pautas familiares, explicación, ejercicios y reflexión | Ficha autónoma con autoevaluación |
| Carpeta de recuperación | 4 pasos | Periodo, secciones, temas, estudiantes, diagnóstico, actividades, evidencias y cronograma | Carpeta diferenciada |
| Monitorea avances | 4 pasos | Línea base, competencia, hitos, observaciones y grupos de progreso | Evolución, alertas y decisiones diferenciadas |
| Acompaña y motiva | 4 pasos | Estado emocional, frecuencia, intereses, apoyo familiar, reconocimiento, micro-metas y mensajes | Plan motivacional y seguimiento |
| Plan de refuerzo | 6 pasos | Distribución C/B, diagnóstico, competencia, criterios, evidencia, acciones diferenciadas, sesiones y compromisos | Plan de refuerzo completo |

## Acompañamos — 5 herramientas

| Herramienta | Flujo | Datos distintivos | Salida de IA |
|---|---|---|---|
| Correo a familias | 4 pasos | Estudiante, apoderado, categoría, puntos clave, tono y acción esperada | Asunto y correo editable |
| Respuesta de correo | 4 pasos | Mensaje recibido, intención, tono, hechos que incluir/evitar | Respuesta contextualizada y siguiente paso |
| Analítica y alertas | 4 pasos | Dimensiones, señales académicas/asistencia/socioemocionales, casos, responsables | Priorización y calendario de seguimiento |
| Calificador con IA | 4 pasos | Competencia, criterio, rúbrica y evidencia | Análisis con control docente |
| Reporte de seguimiento | 4 pasos | Tipo, periodo, avances, dificultades, compromisos, acciones y fecha | Reporte formal de seguimiento |

## Tutoría — 8 herramientas

| Herramienta | Flujo | Datos distintivos | Salida de IA |
|---|---|---|---|
| Plan de tutoría | 5 pasos | Aula uni/multigrado, periodo, diagnóstico, dimensiones TOE, objetivos, sesiones, familias y cronograma | Plan tutorial anual o periódico |
| Sesiones de tutoría | 4 pasos | Dimensión TOE, tema, logro, duración, inicio, desarrollo, cierre y cuidados | Sesión tutorial completa |
| Informe de tutoría | 5 pasos | Periodo, sesiones, atenciones, familias, logros, dificultades, casos y recomendaciones | Informe consolidado |
| Informe a padres | 4 pasos | Participantes, tipo, situación, evidencia, acuerdos y seguimiento | Acta/informe comprensible para familias |
| Fichas de acompañamiento | 4 pasos | Atención individual/grupal, modalidad, problema, antecedentes, orientación y derivación | Ficha de atención y seguimiento |
| Alertas y casos | 5 pasos | Tipo de alerta, fecha, descripción objetiva, evidencias, protocolo, protección y responsables | Registro seguro, ruta y seguimiento |
| Recursos de tutoría | 4 pasos | Dimensión, formato, tema, duración, necesidad y cuidados | Dinámica o material tutorial aplicable |
| Orientación vocacional | 4 pasos | Intereses, fortalezas, valores, contexto, opciones y dudas | Perfil, rutas formativas y plan de exploración |

## Recursos — 15 herramientas

| Herramienta | Flujo | Datos distintivos | Salida de IA |
|---|---|---|---|
| Presentaciones didácticas | 4 pasos | Tema, diapositivas, estilo, puntos, interacción y guion | Estructura de diapositivas con notas docentes |
| Tarjetas de estudio | 3 pasos | Tema, cantidad, tipo y dificultad | Tarjetas con frente, reverso y pista |
| Agrupar palabras | 3 pasos | Tema y categorías | Taxonomía interactiva, ya implementada con verificación |
| Ordenar bloques | 3 pasos | Tipo de secuencia, tema y bloques | Secuencia interactiva, ya implementada con verificación |
| Casos de estudio ABP | 4 pasos | Complejidad, extensión, preguntas, elementos y foco | Caso, dilema, preguntas y guía docente |
| Ahorcado educativo | 3 pasos | Tema, palabras e intentos | Palabras, pistas y explicación |
| Completa la frase | 3 pasos | Modo, cantidad y tema | Oraciones, distractores/banco y clave |
| Emparejar palabras | 3 pasos | Relación, cantidad y tema | Pares, solución y explicación |
| Debate en aula | 4 pasos | Modalidad, duración, contexto, perspectivas y convivencia | Moción, argumentos, preguntas y rúbrica |
| Crucigramas | 3 pasos | Tema, palabras y complejidad | Palabras, pistas, distribución y solución |
| Sopas de letras | 3 pasos | Tema, palabras y dificultad | Vocabulario, cuadrícula y solución |
| Banco para planificar | 4 pasos | Tipo, tema, enfoque, recursos y propósito | Recursos organizados con uso y adaptación |
| Normativa educativa | 4 pasos | Tipo de norma, ámbito, tema, propósito y pregunta | Síntesis con fuentes oficiales a verificar |
| Libros y guías MINEDU | 4 pasos | Tipo, tema, propósito, actividad y adaptación | Referencias y uso pedagógico |
| Canales audiovisuales | 4 pasos | Tipo, tema, duración, idioma, accesibilidad y uso | Selección, criterios y secuencia didáctica |

## Comportamiento común ya implementado

1. Autocompletado desde el perfil docente.
2. Modalidad obligatoria en las 57 herramientas.
3. Validación por paso y retorno automático al primer campo faltante.
4. Borrador local persistente y sincronización con el servidor cuando hay sesión.
5. Generación real mediante Gemini desde el backend; no hay texto estático en el navegador.
6. Historial unificado con apertura, edición, duplicado, descarga, eliminación y recuperación de versiones.
7. Catálogos dependientes de modalidad, nivel, grado, área y competencias del CNEB.
8. Respuesta especializada por familia: documento pedagógico, instrumento tabular, análisis con indicadores, comunicación formal o actividad interactiva.
9. Copia del resultado y descarga en Word; las presentaciones también se exportan de forma nativa a PPTX y PDF.
10. Diseño responsivo para escritorio, tableta y móvil, probado en las 57 rutas sin desbordamiento horizontal.
11. Modo claro y oscuro persistente, incluidos formularios, tablas, modales, calendario, perfil, historial y administración.
12. Controles A−, A y A+ con escala real de 87,5 %, 100 % y 112,5 %.

## Paridad interactiva entregada

El proyecto anterior contiene implementaciones históricas duplicadas y aliases de rutas; esta matriz usa la ruta funcional real como referencia. Los 15 recursos ya generan una carga estructurada adicional para uso directo, no un párrafo decorativo:

- presentaciones con reproductor de diapositivas y notas docentes;
- tarjetas con giro frente/reverso;
- agrupar palabras y ordenar bloques con tableros especializados;
- ahorcado con vidas, teclado, pistas, avance y reinicio;
- completar y emparejar con comprobación, puntaje y reinicio;
- crucigrama con cuadrícula, cruces, pistas y validación por letra;
- sopa de letras con cuadrícula seleccionable y control de palabras encontradas;
- casos, debate, bancos y catálogos en tarjetas accionables con orientación desplegable.

La misma carga interactiva se copia y se incorpora al Word descargado. Los documentos complejos conservan su formato por secciones, porque su resultado correcto es un documento pedagógico y no un juego.
