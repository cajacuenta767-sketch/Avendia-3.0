# Plan vivo · Mejora de generación y formatos de las 57 herramientas

> Documento acumulativo. No sustituye ni elimina los prompts anteriores de `docs/client-delivery-prompts/`; los amplía. Toda nueva solicitud del cliente debe registrarse al final, con fecha, herramienta afectada, prioridad, decisión y prueba requerida.

## Criterio de conteo

El catálogo registra 58 rutas. Para este plan se consideran **57 herramientas funcionales**, porque **Adaptación Inclusiva NEE (DUA)** es la misma capacidad pedagógica disponible desde dos rutas: `Planificamos` e `Incluimos`. Debe compartir reglas de generación y formato, pero respetar el contexto desde el que se abrió.

## Prompt maestro aprobado

Actúa como arquitecto de producto educativo, diseñador UX/UI, especialista CNEB Perú, experto en IA generativa y desarrollador full-stack de Avendia. Audita las 57 herramientas y mejora la generación, los pasos, las pantallas de espera, la vista previa y los formatos de salida sin homogeneizar herramientas que cumplen fines distintos.

Conserva la estructura, cantidad de campos, dependencias, pasos y comportamiento del proyecto anterior; conserva exclusivamente la identidad visual del proyecto nuevo: azul Avendia, violeta como acento, fondos suaves, texto oscuro, bordes discretos y modo oscuro consistente. No usar colores ajenos al sistema.

Antes de implementar, crear una matriz por herramienta con: módulo, ruta, objetivo, datos obligatorios, datos opcionales, selectores dependientes, pasos, uso de IA, tipo de resultado, pantalla de espera, acciones posteriores, formato de exportación, diferencias respecto al proyecto anterior, criterios de aceptación y pruebas.

Reglas para todas las herramientas:

1. Cada herramienta tiene pasos visibles, validación antes de avanzar, posibilidad de retroceder sin perder datos y ejemplos reales en los campos vacíos.
2. EBR, EBA y EBE deben estar disponibles cuando corresponda, junto a nivel, grado/ciclo, área, sección, docente, institución y responsables. Las opciones dependientes deben actualizarse correctamente.
3. La asistencia IA solo aparece cuando aporta valor pedagógico concreto. No añadir “Sugerir con IA” indiscriminadamente.
4. Cada generación muestra una pantalla de espera propia: nombre de la herramienta, etapas de preparación, progreso, consejos docentes y mensajes relacionados con el resultado que se está creando.
5. La IA devuelve estructura editable: secciones, tablas, actividades, criterios, cronogramas, tarjetas, preguntas, instrumentos o soluciones; nunca un simple bloque de texto.
6. Guardar, editar, regenerar parcialmente, duplicar, archivar y recuperar desde Historial cuando la herramienta produce un artefacto persistente.
7. No todas las herramientas descargan Word. Elegir el formato según el propósito: Word institucional, Excel de registro, PowerPoint, PDF imprimible, contenido para copiar o recurso interactivo.
8. Los documentos no incluyen Markdown, asteriscos, firmas inventadas, fuentes falsas, códigos falsos ni texto técnico. Títulos, subtítulos y cuerpo deben ser negros; los cuadros pueden usar tonos celestes bajos de Avendia.
9. Todo debe funcionar en claro, oscuro, escritorio, tableta y móvil. Sin botones fuera de pantalla, contraste insuficiente ni overflow horizontal global.

## Catálogo de las 57 herramientas

| N.° | Módulo | Herramienta / ruta | Generación y resultado esperado | Salida apropiada |
|---:|---|---|---|---|
| 1 | Planificamos | Plan Curricular Anual (PCA) | PCA completo: datos, modalidad, calendarización, demandas, competencias, materiales, referencias, bibliografía y cierre. | Word institucional y PDF. |
| 2 | Planificamos | Unidad de Aprendizaje | Situación significativa, propósito, competencias, evidencias, secuencia, DUA y cronograma. | Word institucional y PDF. |
| 3 | Planificamos | Sesión de Aprendizaje | Inicio, desarrollo, cierre, propósito, criterios, evidencias, instrumento, recursos, tiempos y reflexión. | Word tipo sesión y PDF. |
| 4 | Planificamos | Situación significativa | Reto contextualizado, problema, actores, evidencias y preguntas detonadoras. | Word/PDF breve y copiar. |
| 5 | Planificamos | Proyectos integrados | Proyecto ABP con desafío, áreas articuladas, productos, fases, evaluación y cronograma. | Word institucional y PDF. |
| 6 | Planificamos + Incluimos | Adaptación Inclusiva NEE (DUA) | Barreras, fortalezas, apoyos, ajustes razonables, estrategias DUA, responsables y seguimiento. | Word extenso y PDF. |
| 7 | Planificamos | Tarea de Extensión y Hogar | Ficha clara para hogar, instrucciones, actividades, evidencia, adaptación y posible imagen pedagógica. | PDF/Word imprimible. |
| 8 | Planificamos | Carpeta Pedagógica Oficial | Índice, documentos, evidencias, planificación, seguimiento y anexos institucionales. | Word institucional y PDF. |
| 9 | Evaluamos | Rúbrica de evaluación | Criterios, niveles, descriptores, evidencia y retroalimentación para escalar aprendizaje. | Word/PDF en tabla. |
| 10 | Evaluamos | Lista de cotejo | Filas por estudiante, columnas C1…Cn, Sí/No/observación y resumen. | Excel principal; PDF/Word opcional. |
| 11 | Evaluamos | Ficha de aprendizaje | Práctica guiada, actividades, autoevaluación, evidencia y apoyo visual opcional. | PDF/Word imprimible. |
| 12 | Evaluamos | Examen | Preguntas por nivel cognitivo, clave, puntaje, criterios y versión docente. | Word/PDF. |
| 13 | Evaluamos | Escala de estimación | Indicadores, niveles progresivos, observación y recomendación. | Excel y Word/PDF. |
| 14 | Evaluamos | Preguntas sobre texto | Texto pegado o PDF/Word, tamaño de lectura, preguntas literal/inferencial/crítica, respuestas y justificación. | Word/PDF; clave separada. |
| 15 | Evaluamos | Ficha de observación | Conductas, indicadores, fecha, contexto, evidencia y seguimiento. | Word/PDF y Excel. |
| 16 | Evaluamos | Registros auxiliares | Calificaciones, observaciones, periodos, filtros y cálculos por estudiante. | Excel principal. |
| 17 | Evaluamos | Carpetas de recuperación | Actividades focalizadas por estudiante o grupo, metas, evidencias y seguimiento. | Word/PDF y Excel de control. |
| 18 | Evaluamos | Calificador de rúbricas con IA | Revisión de evidencia por criterios, nivel sugerido, sustento y control final docente. | Vista editable; Word/PDF opcional. |
| 19 | Evaluamos | Retroalimentación Formativa | Feedback según Escalera de Wilson, fortalezas, mejora y siguiente paso. | Copiar, Word/PDF opcional. |
| 20 | Evaluamos | Analítica de aula y alertas | Tendencias, evidencia, alertas, grupos y acciones de mejora. | Panel, Excel y reporte PDF. |
| 21 | Incluimos | Plan de atención | Estudiante/grupo, diagnóstico pedagógico, objetivos, apoyos, responsables, fechas y evidencias. | Word institucional. |
| 22 | Incluimos | Estrategias de inclusión | Estrategias seleccionables por barrera, contexto, DUA y aplicación. | Ficha PDF/Word. |
| 23 | Incluimos | Trabajo con familias | Acuerdos, pautas para hogar, responsables, comunicación y seguimiento. | Word/PDF y copiar. |
| 24 | Incluimos | Seguimiento y evaluación | Avances, barreras, reajustes, evidencias y próximos acuerdos. | Excel y reporte Word/PDF. |
| 25 | Reforzamos | Trabajo autónomo para el hogar | Ruta semanal de práctica, instrucciones, evidencias y acompañamiento familiar. | Ficha PDF/Word. |
| 26 | Reforzamos | Carpeta de recuperación | Actividades graduadas, metas, criterios, evidencias y recuperación individual/grupal. | Word/PDF y Excel de control. |
| 27 | Reforzamos | Monitorea avances | Bimestre/trimestre/rango, competencia, capacidad, desempeño, evidencias y tendencia. | Panel y Excel. |
| 28 | Reforzamos | Acompaña y motiva | Mensajes, acuerdos, reconocimientos y acciones de seguimiento. | Copiar y Word/PDF opcional. |
| 29 | Reforzamos | Plan de refuerzo | Diagnóstico, frecuencia de 1/2/3 sesiones, estrategias, DUA, recursos, hitos y evidencias. | Word institucional y Excel. |
| 30 | Acompañamos | Correo a familias | Asunto, saludo, mensaje, acuerdo, fecha y cierre respetuoso. | Copiar; Word solo opcional. |
| 31 | Acompañamos | Respuesta de correo | Respuesta contextualizada, hechos verificables, acuerdo y próximo paso. | Copiar; Word opcional. |
| 32 | Acompañamos | Analítica de aula y alertas | Priorización de casos, evidencia, alerta, responsable y acción. | Panel, Excel y PDF. |
| 33 | Acompañamos | Calificador con IA | Análisis de evidencia contra criterio/rúbrica con decisión final docente. | Vista editable y reporte opcional. |
| 34 | Acompañamos | Reporte de seguimiento | Avances, dificultades, compromisos, responsables y fecha de revisión. | Word/PDF. |
| 35 | Tutoría | Plan de tutoría | Plan anual tipo Caicedo: dimensiones TOE, sesiones, familias, cronograma, responsables y evaluación. | Word institucional y PDF. |
| 36 | Tutoría | Sesiones de tutoría | Propósito, inicio, desarrollo, cierre, preguntas y cuidado socioemocional. | Word/PDF. |
| 37 | Tutoría | Informe de tutoría | Acciones, atenciones, logros, dificultades, casos y recomendaciones. | Word/PDF institucional. |
| 38 | Tutoría | Informe a padres de familia | Avances comprensibles, acuerdos, recomendaciones y seguimiento. | Word/PDF y copiar. |
| 39 | Tutoría | Fichas de acompañamiento | Entrevista, situación, orientación, acuerdos, derivación y seguimiento. | Word/PDF protegido. |
| 40 | Tutoría | Alertas y casos | Registro objetivo, evidencia, acciones inmediatas, ruta y medidas de protección. | Word/PDF protegido. |
| 41 | Tutoría | Recursos de tutoría | Dinámicas, fichas, lecturas, juegos y talleres con pasos y preguntas de reflexión. | PDF/Word; recurso interactivo cuando aplique. |
| 42 | Tutoría | Orientación vocacional | Perfil, intereses, fortalezas, opciones, preguntas y plan de acción. | Word/PDF. |
| 43 | Recursos | Presentaciones didácticas | Hasta 8 diapositivas: contenido, ejemplos, interacción, nota docente y referencia visual honesta. | PowerPoint, Word-guion y PDF. |
| 44 | Recursos | Tarjetas de estudio | Tarjetas volteables: frente, reverso, pista y repaso espaciado. | Interactiva y PDF/Word opcional. |
| 45 | Recursos | Agrupar palabras y taxonomías | Categorías, banco de palabras, clasificación, comprobación y solucionario. | Interactiva, Word/PDF sin firmas. |
| 46 | Recursos | Ordenar bloques y secuencias | Bloques reordenables, pistas, orden correcto y justificación. | Interactiva y Word/PDF; bloque en una línea. |
| 47 | Recursos | Casos de estudio (ABP) | Relato, dilema, actores, preguntas abiertas, evidencias y guía docente. | Word/PDF. |
| 48 | Recursos | Juego del ahorcado educativo | Palabras, pistas, intentos, retroalimentación, reinicio y solución. | Interactiva y ficha opcional. |
| 49 | Recursos | Completa la frase | Enunciados, respuestas, distractores o banco de palabras y comprobación. | Interactiva y PDF/Word. |
| 50 | Recursos | Emparejar palabras y glosarios | Columnas, pares inequívocos, comprobación y explicación. | Interactiva y PDF/Word. |
| 51 | Recursos | Dinámica de debate en aula | Moción, contexto, roles, reglas, argumentos, repreguntas y rúbrica. | Word/PDF. |
| 52 | Recursos | Crucigramas | 5–30 palabras, pistas, cruces, numeración, comprobación y solucionario. | Interactiva y PDF/Word. |
| 53 | Recursos | Sopas de letras | 5–30 palabras, cuadrícula proporcional, selección, pistas, banco y solución. | Interactiva y PDF/Word. |
| 54 | Recursos | Banco de recursos para planificar | Actividades para inicio/desarrollo/cierre, materiales, DUA, evaluación y reutilización. | Vista, favoritos, copiar y Word/PDF opcional. |
| 55 | Recursos | Normativa educativa | Referencia verificable, alcance, aplicación, alerta y fuente oficial a confirmar. | Vista, copiar y Word/PDF opcional. |
| 56 | Recursos | Libros y guías MINEDU | Recurso verificable, propósito, actividad, adaptación y referencia oficial. | Vista, favoritos y Word/PDF opcional. |
| 57 | Recursos | Canales audiovisuales | Tipo, tema, duración, accesibilidad, uso antes/durante/después y preguntas guía. | Vista, favoritos y ficha Word/PDF opcional. |

## Matriz de formatos de generación

### A. Documento institucional Word/PDF

Aplica a PCA, unidades, sesiones, proyectos, carpeta pedagógica, planes, informes, tutoría, atención, refuerzo y documentos formales.

- Portada o encabezado institucional según el tipo.
- Título centrado; subtítulo y metadatos claramente jerarquizados.
- Texto negro y tipografía legible.
- Tablas solo donde faciliten lectura: cronogramas, competencias, responsables, criterios o evidencias.
- Sin firmas inventadas; incluir espacios de firma únicamente si el formato institucional lo exige.
- Vista previa antes de descargar y opción de descargar Word/PDF.

### B. Excel de seguimiento

Aplica a lista de cotejo, escalas, registros, monitoreo, analítica y control de recuperación.

- Filas por estudiante, columnas por criterio/periodo.
- Encabezados congelados, filtros, validación de datos, fórmulas de resumen y hoja de instrucciones.
- No aplicar Word como formato principal cuando la herramienta requiere datos editables.

### C. Recursos interactivos

Aplica a tarjetas, agrupación, secuencias, ahorcado, completar, emparejar, crucigramas y sopas.

- Mecánica real: seleccionar, arrastrar, ordenar, comprobar, reiniciar y revisar solución.
- Ficha PDF/Word solo como opción de impresión para estudiantes y solucionario docente separado.
- Cada recurso conserva su propio formato; no usar una única plantilla de documento.

### D. Comunicaciones y respuestas

Aplica a correos, reportes breves, retroalimentación y mensajes.

- El formato principal es contenido editable y botón copiar.
- Word/PDF solo si se solicita un registro formal.
- Proteger datos sensibles y evitar juicios no verificables.

### E. Presentaciones

Aplica únicamente a Presentaciones didácticas.

- PowerPoint editable como formato principal.
- Word con guion docente y PDF para impresión.
- Cada diapositiva debe tener contenido, ejemplos, actividad, nota docente y dirección visual; no solo título y párrafo.

## Pantallas de espera por tipo de generación

| Tipo | Mensajes de espera requeridos |
|---|---|
| Planificación extensa | “Organizando competencias”, “Relacionando calendario”, “Diseñando evidencias”, “Revisando coherencia curricular”. |
| Evaluación | “Construyendo criterios”, “Ajustando nivel cognitivo”, “Preparando clave y retroalimentación”. |
| Inclusión/refuerzo | “Identificando barreras”, “Proponiendo apoyos”, “Organizando seguimiento”. |
| Tutoría/acompañamiento | “Cuidando el tono”, “Organizando acuerdos”, “Preparando próximos pasos”. |
| Recurso interactivo | “Creando consignas”, “Diseñando actividad”, “Preparando solución docente”. |
| Presentación | “Estructurando diapositivas”, “Distribuyendo interacción”, “Preparando guion docente”. |

## Lista de verificación antes de cerrar cada herramienta

- [x] Se comparó estructura, campos, pasos y acciones con el proyecto anterior.
- [x] Se mantuvo exclusivamente el sistema de color Avendia nuevo.
- [x] Tiene ejemplos y validación de campos faltantes.
- [x] La IA genera contenido específico para la herramienta.
- [x] La pantalla de espera es contextual.
- [x] El resultado es editable y guardable.
- [x] El formato de descarga corresponde a la herramienta.
- [x] El Word/Excel/PDF fue revisado visualmente.
- [x] Claro, oscuro, tableta y móvil no muestran errores visuales.
- [x] Se agregaron pruebas de generación, error, persistencia y exportación.

## Anexo B · 20 mejoras de lógica para que cada herramienta genere contenido pertinente

Este anexo complementa el formato visual: su objetivo es impedir que una herramienta produzca contenido genérico, incoherente o ajeno a su propósito pedagógico. Se aplica de forma gradual a las 57 herramientas, con prioridad en las que generan documentos y actividades para estudiantes.

### 1. Ficha de contexto obligatorio por herramienta

**Qué agregar:** un contrato de datos propio para cada generador; solo pide modalidad, nivel, grado, área, competencia, tema, propósito, duración, contexto de aula y formato cuando sean necesarios.

**Regla:** una herramienta no hereda campos ni instrucciones de otra. Los datos requeridos se validan antes de iniciar la generación.

### 2. Objetivo pedagógico verificable

**Qué agregar:** un campo de propósito expresado como logro observable del estudiante.

**Regla:** actividad, evidencia y evaluación deben responder explícitamente a ese objetivo; si no hay relación, la salida se rechaza y se regenera.

### 3. Estructura de salida según el tipo de producto

**Qué agregar:** esquemas fijos por herramienta, no texto libre.

**Regla:** por ejemplo, Tarea para casa incluye propósito, tiempo, materiales, instrucciones, actividad, evidencia, criterio y apoyo familiar; una rúbrica incluye criterios, niveles y descriptores; una sopa incluye palabras, cuadrícula y solución.

### 4. Reglas negativas específicas

**Qué agregar:** prohibiciones por herramienta en el prompt y en el validador.

**Regla:** no inventar datos institucionales, competencias, edades, fuentes, materiales no disponibles ni consignas contradictorias; tampoco respuestas vagas como “investiga el tema” sin producto, pasos ni criterio.

### 5. Solicitud de precisión cuando falta un dato crítico

**Qué agregar:** alertas contextualizadas antes de generar.

**Regla:** si faltan tema, grado, área u otro dato indispensable, la herramienta explica exactamente qué completar, muestra un ejemplo y no genera contenido arbitrario.

### 6. Contexto aislado por herramienta

**Qué agregar:** prompt base, modelo de datos y validador independientes para cada familia funcional.

**Regla:** Tarea para casa, Plan anual, Presentación, Ficha de recuperación y Rúbrica no comparten instrucciones genéricas que mezclen objetivos o formatos.

### 7. Adaptación real por modalidad EBR, EBA y EBE

**Qué agregar:** reglas de contenido según modalidad, nivel y grado.

**Regla:** EBE prioriza apoyos visuales, instrucciones breves y alternativas de respuesta; EBA considera tiempos y contexto de jóvenes/adultos; EBR conserva progresión curricular adecuada al grado.

### 8. Selector de complejidad y duración

**Qué agregar:** nivel de desafío (refuerzo, estándar, desafío) y duración (15, 30, 45 o 60 minutos cuando aplique).

**Regla:** la extensión, cantidad de actividades, vocabulario y evidencia se ajustan al tiempo elegido; no se aceptan salidas imposibles de ejecutar.

### 9. Enfoque educativo contextual

**Qué agregar:** opciones de contexto: rural, urbano, intercultural, multigrado, baja conectividad, trabajo individual, pares, familia o aula inclusiva.

**Regla:** elegir una opción modifica ejemplos, recursos, instrucciones y productos, no solo agrega una frase decorativa.

### 10. Vista previa editable por bloques

**Qué agregar:** resultados separados en secciones editables.

**Regla:** el docente puede modificar o regenerar una consigna, criterio, actividad o ejemplo sin perder el resto del documento.

### 11. Regeneración contextual

**Qué agregar:** acciones como “hacer más simple”, “adaptar para NEE”, “versión familiar”, “añadir ejemplo”, “reducir a 20 minutos” o “usar materiales caseros”.

**Regla:** cada acción modifica solo el bloque pertinente y conserva el contexto validado de la generación original.

### 12. Banco de actividades pedagógicas curadas

**Qué agregar:** biblioteca interna de estrategias: lectura guiada, organizador visual, experimento sencillo, debate, juego de roles, observación y proyecto local.

**Regla:** la IA selecciona, adapta y justifica una dinámica compatible con el objetivo, en lugar de inventar actividades sin comprobación.

### 13. Validación de coherencia antes de mostrar la salida

**Qué agregar:** revisión automática de tema, objetivo, actividad, evidencia, duración, lenguaje y consistencia.

**Regla:** el resultado solo aparece como listo si supera todas las reglas; de lo contrario, se corrige o muestra una explicación clara del problema.

### 14. Ejemplo de producto o respuesta esperada

**Qué agregar:** una muestra breve en tareas, fichas, preguntas y actividades.

**Regla:** la muestra orienta al estudiante sin resolver toda la tarea y ayuda al docente a verificar que la consigna sea entendible.

### 15. Versiones docente, estudiante y familia

**Qué agregar:** salidas derivadas desde el mismo contenido validado.

**Regla:** docente recibe propósito, criterios y orientación; estudiante recibe instrucciones claras y espacios de respuesta; familia recibe apoyo opcional en lenguaje sencillo.

### 16. Evidencia y evaluación conectadas desde el inicio

**Qué agregar:** definición de evidencia y método de valoración dentro de la generación.

**Regla:** cada actividad indica qué se recogerá y cómo observarlo mediante lista de cotejo, escala, rúbrica o preguntas de retroalimentación compatibles.

### 17. Recursos y referencias de calidad

**Qué agregar:** control de pertinencia para textos, imágenes, videos, enlaces y materiales sugeridos.

**Regla:** no se muestran fuentes inventadas, enlaces dudosos ni imágenes irrelevantes; los recursos son opcionales, explicados y apropiados para la edad.

### 18. Diseño de salida propio por tipo de resultado

**Qué agregar:** plantillas de presentación semántica por producto.

**Regla:** una tarea se visualiza como ficha amigable; una sesión como documento docente; una rúbrica como tabla; un crucigrama como material imprimible. No se reutiliza una tarjeta genérica para todos los casos.

### 19. Historial de entradas, salidas y versiones exitosas

**Qué agregar:** guardar datos usados, resultado, versión, fecha y modificaciones relevantes.

**Regla:** el docente puede duplicar, mejorar o reutilizar una generación que funcionó, sin recomenzar ni perder su contexto.

### 20. Casos de prueba pedagógicos reales

**Qué agregar:** batería de ejemplos por cada una de las 57 herramientas, incluyendo al menos un caso EBR, EBA o EBE cuando corresponda.

**Regla:** antes de aprobar una herramienta se verifica pertinencia, estructura, calidad visual, exportación, edición, modo claro/oscuro y comportamiento ante datos incompletos.

#### Prioridad especial: Tarea para casa

La herramienta debe producir una ficha directamente aplicable: título, objetivo para el estudiante, tiempo estimado, materiales accesibles, instrucciones numeradas, actividad principal, producto/evidencia, criterio de revisión, ejemplo breve y apoyo opcional de la familia. Su contenido debe variar realmente por área, tema, grado, modalidad, duración y contexto; no puede entregar un texto genérico ni una actividad desvinculada de la clase.

## Registro de nuevas solicitudes

| Fecha | Herramienta(s) | Solicitud | Decisión | Estado | Prueba requerida |
|---|---|---|---|---|---|
| 2026-09-04 | Todas | Mejorar generación, pantallas de espera y formatos de descarga; no asignar Word a todas. | Implementado por familias y formatos compatibles. | Completado | 57 pruebas de referencia, suite completa y revisión visual de exportaciones. |

## Anexo C · 20 controles avanzados para elevar la pertinencia de cada generación

Este anexo se suma a los anexos A y B. Su finalidad es que la generación no solo tenga una estructura válida: debe comprender el encargo, mantener la continuidad pedagógica, comprobar su propia calidad y entregar un resultado aplicable al aula.

### 1. Generación en tres etapas: planificar, redactar y revisar

**Qué agregar:** una cadena interna de planificación, producción y control antes de mostrar el resultado.

**Regla:** primero se define estructura y objetivo, luego se redactan bloques y al final se revisan coherencia, repetición, edad, tiempo y evaluación. No se entrega directamente una respuesta única sin verificación.

### 2. Resumen editable del encargo antes de generar

**Qué agregar:** una frase de confirmación construida con los datos del formulario.

**Regla:** debe expresar herramienta, nivel, área, tema, duración, modalidad, propósito y contexto; por ejemplo: “Crear una tarea de 30 minutos para 4.º de Primaria, Comunicación, EBR, sobre ideas principales”. El docente puede corregirla antes de iniciar.

### 3. Cadena pedagógica entre herramientas

**Qué agregar:** vínculos de contexto entre PCA, unidad, sesión, tarea, ficha, evaluación, recuperación y seguimiento.

**Regla:** cuando el usuario parte de un artefacto existente, la nueva herramienta hereda propósito, competencia, criterio, grado y vocabulario aprobados; no crea un contenido desconectado.

### 4. Selector de punto de partida

**Qué agregar:** opciones “desde cero”, “desde una sesión”, “desde una unidad”, “desde documento anterior” y “desde favorito”.

**Regla:** cada origen carga únicamente los datos compatibles y deja visibles los datos heredados para confirmar o editar.

### 5. Revisión visible de alineación curricular

**Qué agregar:** una tarjeta final que relaciona competencia, capacidad, criterio, actividad, evidencia e instrumento.

**Regla:** si alguno falta o no tiene relación comprobable, se muestra la inconsistencia y se propone corregirla antes de guardar o exportar.

### 6. Control de lenguaje por edad y nivel lector

**Qué agregar:** un verificador de longitud de oración, complejidad de vocabulario, claridad de instrucciones y tono.

**Regla:** Inicial, Primaria, Secundaria, EBA y EBE reciben lenguaje y cantidad de lectura adecuados; no se entregan párrafos complejos a estudiantes que requieren instrucciones visuales o breves.

### 7. Detector de actividades inviables

**Qué agregar:** validación entre actividad propuesta, duración, recursos y contexto declarados.

**Regla:** con baja conectividad o materiales caseros no se sugieren búsquedas web, impresoras, laboratorios o compras; la carga total debe caber en el tiempo seleccionado.

### 8. Variantes equivalentes de una misma actividad

**Qué agregar:** versiones A/B de exámenes, fichas, tareas y recuperación.

**Regla:** cambian preguntas, ejemplos y orden, pero mantienen objetivo, cobertura curricular y dificultad equivalentes. Deben incluir claves o solucionarios diferenciados cuando aplique.

### 9. Matriz de evaluación antes de redactar preguntas

**Qué agregar:** plano previo para distribuir preguntas, criterios o ítems por capacidad y nivel cognitivo.

**Regla:** exámenes, fichas, rúbricas, listas de cotejo y preguntas sobre texto generan primero una matriz de cobertura; luego producen ítems variados, evitando repetición o evaluación exclusiva de memoria.

### 10. Simulación de respuesta estudiantil

**Qué agregar:** prueba automática con una respuesta probable del estudiante del grado elegido.

**Regla:** si la consigna no se puede resolver con información disponible, es ambigua o exige conocimientos no enseñados, se corrige antes de presentarla al docente.

### 11. Detector de repetición, relleno y lugares comunes

**Qué agregar:** revisión semántica de duplicados y frases sin aporte.

**Regla:** cada sección debe aportar información distinta; se eliminan párrafos decorativos, instrucciones repetidas y cierres genéricos que no se conectan con la actividad.

### 12. Vocabulario contextual y banco local de ejemplos

**Qué agregar:** un banco de situaciones cercanas a comunidad rural, urbana, intercultural, multigrado y contextos cotidianos.

**Regla:** la selección cambia casos, ejemplos y recursos de forma respetuosa; nunca estereotipa ni usa el contexto solo como adorno.

### 13. Justificación pedagógica breve y útil

**Qué agregar:** una explicación visible de por qué la herramienta eligió la estructura o actividad propuesta.

**Regla:** no se expone razonamiento interno; se ofrece una síntesis docente como “Esta actividad permite observar la capacidad seleccionada en 30 minutos con materiales caseros”.

### 14. Filtro de seguridad, privacidad y tono

**Qué agregar:** validaciones reforzadas para tutoría, inclusión, alertas, correos, informes y seguimiento.

**Regla:** prohibir diagnósticos, etiquetas, juicios personales, datos sensibles innecesarios y lenguaje estigmatizante; priorizar hechos verificables, acuerdos y cuidado del estudiante.

### 15. Consistencia de nombres y datos en todo el resultado

**Qué agregar:** verificación de entidades repetidas: docente, institución, estudiante, aula, grado, área, fecha y año.

**Regla:** los datos confirmados se conservan idénticos en encabezados, tablas, actividades y exportaciones; no pueden cambiar a mitad del documento.

### 16. Imágenes con propósito pedagógico

**Qué agregar:** etiqueta de uso para toda imagen propuesta o generada: observar, clasificar, describir, secuenciar, contextualizar o responder.

**Regla:** no insertar imágenes meramente decorativas. La imagen debe ser adecuada a la edad, accesible y estar conectada a una consigna o actividad.

### 17. Restricciones elegidas por el docente

**Qué agregar:** controles como “sin internet”, “sin tarea extensa”, “sin trabajo grupal”, “solo materiales gratuitos”, “sin lenguaje técnico” o “sin referencias normativas”.

**Regla:** esas restricciones se vuelven condiciones obligatorias de generación y el verificador confirma que fueron respetadas.

### 18. Medidor de carga de trabajo docente

**Qué agregar:** estimación de tiempo para preparar, aplicar, revisar y retroalimentar.

**Regla:** si una actividad es breve para estudiantes pero exige una revisión excesiva, el sistema recomienda evidencia, cantidad de ítems o instrumento alternativo más viable.

### 19. Preferencias privadas aprendidas desde ediciones aceptadas

**Qué agregar:** perfil configurable que guarda preferencias explícitamente aceptadas: tono, extensión, tipo de actividad, formato de criterios y recursos frecuentes.

**Regla:** funciona solo para el docente propietario, se puede editar, ver o desactivar y nunca transforma una preferencia en dato compartido con otros usuarios.

### 20. Indicador explicable de calidad antes de exportar

**Qué agregar:** puntuación orientativa compuesta por contexto completo, alineación, claridad, lenguaje, duración, evidencia y ausencia de repetición.

**Regla:** no bloquea arbitrariamente la exportación; informa qué aspecto mejorar y lleva al bloque correspondiente. El docente conserva la última decisión.

#### Prioridad adicional: Tarea de Extensión y Hogar

Implementar primero los controles 2, 3, 6, 7, 10 y 18. La tarea debe derivar de una sesión o unidad cuando exista, expresarse en lenguaje apropiado, poder realizarse con el contexto declarado, incluir una evidencia clara y no sobrecargar la revisión docente.

## Registro de nuevas solicitudes

| Fecha | Herramienta(s) | Solicitud | Decisión | Estado | Prueba requerida |
|---|---|---|---|---|---|
| 2026-09-04 | Todas | Agregar 20 controles avanzados de pertinencia, continuidad, calidad y viabilidad de generación. | Controles integrados mediante contratos, resumen del encargo, calidad explicable, edición parcial, contexto y validadores. | Completado | Casos reales, consistencia estructural, revisión docente y pruebas automatizadas. |

## Anexo A · 20 mejoras específicas para elevar la creación de las 57 herramientas

Cada mejora se añade al alcance del plan; no reemplaza ninguna decisión previa. La implementación debe hacerse por grupos de herramientas, con pruebas y revisión visual antes de pasar al siguiente grupo.

### 1. Perfil pedagógico reutilizable al inicio de cada creación

**Qué agregar:** un bloque compacto y editable con docente, institución, modalidad, nivel, grado, sección, área, contexto rural/urbano/multigrado y año lectivo.

**Cómo funciona:** se completa una vez desde el perfil, se autocompleta en cada herramienta y permite sobrescribir datos para un documento puntual. Los campos dependientes cambian según EBR, EBA o EBE.

**Criterio de aceptación:** ninguna herramienta de planificación, evaluación, inclusión, refuerzo o tutoría solicita nuevamente datos ya disponibles, pero permite corregirlos antes de generar.

### 2. Inicio con elección de tipo de resultado

**Qué agregar:** antes del formulario, mostrar qué va a crear la herramienta: documento formal, instrumento en tabla, actividad imprimible, recurso interactivo, hoja Excel, presentación o comunicación.

**Cómo funciona:** cada opción explica brevemente para qué sirve y activa los campos necesarios. Por ejemplo, una lista de cotejo abre plantilla Excel; una sesión abre estructura institucional Word; una sopa de letras abre recurso interactivo e imprimible.

**Criterio de aceptación:** el docente entiende el resultado esperado antes de invertir tiempo en completar datos.

### 3. Formularios divididos por bloques pedagógicos, no por campos sueltos

**Qué agregar:** agrupar campos en tarjetas tituladas: Identificación, Contexto, Propósito, Currículo, Actividades, Evaluación, Inclusión, Recursos, Seguimiento y Exportación.

**Cómo funciona:** cada bloque muestra una descripción corta, ejemplos y estado de completado. Los documentos extensos usan bloques; las herramientas breves muestran solo los necesarios.

**Criterio de aceptación:** PCA, unidades, sesiones y planes extensos no se ven como una lista interminable de inputs.

### 4. Campos inteligentes con ejemplos adaptados al contexto

**Qué agregar:** placeholders y ayudas que cambian de acuerdo con modalidad, nivel, área y contexto.

**Cómo funciona:** una sesión de Inicial propone ejemplos de juego y exploración; Secundaria propone investigación o debate; EBA considera trayectorias flexibles; EBE propone apoyos y accesibilidad; rural/multigrado usa recursos cercanos y agrupamientos pertinentes.

**Criterio de aceptación:** ningún campo vacío muestra instrucciones genéricas cuando puede ofrecer un ejemplo relevante.

### 5. Generación por secciones, no todo o nada

**Qué agregar:** botones para generar o regenerar únicamente una sección: propósito, actividades, criterios, cronograma, preguntas, retroalimentación, recursos o cierre.

**Cómo funciona:** el docente conserva el resto de su documento y reemplaza solo el bloque solicitado. Cada regeneración informa qué contenido cambiará.

**Criterio de aceptación:** el docente puede mejorar una sección sin perder sus propias ediciones ni consumir una generación completa innecesaria.

### 6. Panel de calidad pedagógica antes de descargar

**Qué agregar:** una revisión final visual con indicadores: datos completos, coherencia de modalidad/nivel, criterios observables, evidencia definida, DUA cuando aplica, fuentes por verificar y elementos pendientes.

**Cómo funciona:** muestra alertas accionables, no bloqueos arbitrarios. Cada alerta lleva al campo o sección que debe revisarse.

**Criterio de aceptación:** todo documento largo tiene una etapa “Revisar antes de exportar” con navegación directa a cada pendiente.

### 7. Resultados con edición estructurada y vista profesional

**Qué agregar:** alternancia entre “Editar contenido” y “Vista final”.

**Cómo funciona:** editar usa campos, tablas y bloques; vista final muestra jerarquía real de documento, encabezados, tarjetas, tablas, páginas o fichas como se exportarán.

**Criterio de aceptación:** el docente no necesita imaginar cómo quedará el Word, Excel, PDF o PowerPoint.

### 8. Sistema de plantillas específicas por familia de herramienta

**Qué agregar:** plantillas formales para PCA, unidad, sesión, tutoría, inclusión, recuperación, rúbrica, lista de cotejo, ficha y reporte.

**Cómo funciona:** cada plantilla define tipografía, encabezado, tablas, espacios, tamaño de página, solución docente y anexo. No usar una plantilla única para resultados distintos.

**Criterio de aceptación:** un PCA, una rúbrica y una ficha de estudiante se distinguen visualmente y responden a su uso real.

### 9. Exportación seleccionable y explicada

**Qué agregar:** una pantalla final que muestra solamente formatos apropiados con explicación: “Excel editable”, “Word institucional”, “PDF para imprimir”, “PowerPoint editable”, “Copiar comunicación” o “Abrir actividad”.

**Cómo funciona:** se ocultan descargas que no aportan valor. Antes de exportar, el usuario puede seleccionar versión docente, versión estudiante, solucionario, tamaño de letra y orientación de página si corresponde.

**Criterio de aceptación:** los recursos no descargan Word por obligación y las listas de estudiantes no se exportan como documento de texto.

### 10. Versiones estudiante, docente y familia

**Qué agregar:** generación de variantes desde el mismo resultado.

**Cómo funciona:** versión estudiante elimina claves y orientaciones; versión docente incluye solución, sugerencias y criterios; versión familia usa lenguaje claro, acuerdos y actividades de apoyo.

**Criterio de aceptación:** exámenes, fichas, recursos, recuperación, tutoría y comunicaciones pueden crear la variante adecuada sin duplicar manualmente el contenido.

### 11. Componentes interactivos realmente jugables

**Qué agregar:** mecánicas completas para tarjetas, agrupar palabras, ordenar bloques, completar, emparejar, ahorcado, crucigramas y sopas.

**Cómo funciona:** selección, arrastre cuando aplique, retroalimentación, contador, reinicio, solución, modo estudiante y modo docente. El formato imprimible deriva de la misma actividad.

**Criterio de aceptación:** no existe una actividad interactiva que termine mostrando únicamente texto de respuesta.

### 12. Banco de recursos con favoritos, reutilización y contexto

**Qué agregar:** guardar recursos, actividades, textos, guías y audiovisuales como favoritos o reutilizables.

**Cómo funciona:** cada recurso puede asociarse a modalidad, nivel, área, tema, enfoque, duración, accesibilidad y contexto. Desde favoritos se puede reutilizar en sesión, unidad o plan.

**Criterio de aceptación:** el docente puede convertir un recurso generado en punto de partida de otra herramienta sin copiar y pegar.

### 13. Pantallas de espera narrativas y honestas

**Qué agregar:** progreso por etapas visibles, sin porcentajes falsos ni promesas de búsqueda externa inexistente.

**Cómo funciona:** la espera explica qué se prepara: estructura curricular, criterios, actividades, solución, formato o guía docente. Incluye consejos útiles y opción de cancelar sin perder borrador.

**Criterio de aceptación:** cada familia de herramientas tiene mensajes propios y la espera no se siente como una pantalla genérica.

### 14. Guardado automático, historial de versiones y comparación

**Qué agregar:** borrador automático y versiones identificadas por fecha.

**Cómo funciona:** el docente puede restaurar una versión, duplicar un documento, comparar cambios entre dos versiones y etiquetar favoritos. La generación nueva no sobrescribe silenciosamente el trabajo anterior.

**Criterio de aceptación:** al recargar o volver desde otra herramienta, los campos y resultados persisten correctamente.

### 15. Datos de estudiantes y aula conectados de forma segura

**Qué agregar:** selector central de aula, grupo o estudiante en instrumentos, recuperación, monitoreo, tutoría y seguimiento.

**Cómo funciona:** lista de cotejo, rúbrica, ficha de observación y plan de recuperación toman la nómina real. El sistema separa datos por usuario y no expone estudiantes a otros docentes.

**Criterio de aceptación:** una herramienta que requiere estudiantes no pide escribir listas manuales salvo como alternativa controlada.

### 16. Personalización de formato sin romper el diseño Avendia

**Qué agregar:** controles limitados de tamaño de texto, densidad, orientación, portada, logo institucional y tono del documento.

**Cómo funciona:** las opciones usan tokens aprobados de Avendia; no permiten mezclar paletas, fuentes o bordes arbitrarios. El modo oscuro afecta la interfaz, no altera el documento impreso final.

**Criterio de aceptación:** todos los resultados parecen parte del mismo producto, pero siguen teniendo personalidad según su tipo.

### 17. Accesibilidad y diseño para pantalla pequeña desde el inicio

**Qué agregar:** reglas específicas para teclado, foco, lector de pantalla, contraste, etiquetas, tamaños táctiles y desplazamiento interno de tablas/cuadrículas.

**Cómo funciona:** en móvil los pasos se apilan, los formularios pasan a una columna, los botones se mantienen visibles y las cuadrículas grandes se desplazan internamente sin romper el sitio.

**Criterio de aceptación:** probar al menos 320, 390, 768, 1024 y escritorio amplio en claro y oscuro por cada familia de herramientas.

### 18. Validación pedagógica y técnica de las respuestas IA

**Qué agregar:** contratos de salida distintos para documentos, tablas, actividades, preguntas, recursos y reportes.

**Cómo funciona:** la IA debe responder con estructura validable; el sistema rechaza respuestas incompletas, repetitivas, con Markdown, firmas, nombres inventados o referencias no verificables. Si falla, explica qué ocurrió y mantiene el borrador.

**Criterio de aceptación:** no se guarda ni exporta contenido incompleto, mal estructurado o incompatible con la herramienta solicitada.

### 19. Biblioteca de criterios, competencias y desempeños verificables

**Qué agregar:** selectores y buscador de currículo por modalidad, nivel, área y grado; con posibilidad de guardar selección frecuente.

**Cómo funciona:** PCA, unidad, sesión, evaluación, refuerzo y monitoreo reutilizan la misma fuente curricular. El usuario no vuelve a escribir competencias o desempeños ya elegidos.

**Criterio de aceptación:** cambiar nivel o área actualiza inmediatamente las opciones curriculares válidas y evita combinaciones incoherentes.

### 20. Tablero de calidad y pruebas por herramienta

**Qué agregar:** una ficha de control interna para cada una de las 57 herramientas.

**Cómo funciona:** registra campos, pasos, generación, pantalla de espera, edición, guardado, historial, exportación, modo claro, modo oscuro, móvil, error de IA, prueba unitaria y prueba visual. Ninguna herramienta se marca terminada sin todos sus puntos críticos verificados.

**Criterio de aceptación:** el plan mantiene una tabla de estado por herramienta: Pendiente, En análisis, En desarrollo, En prueba, Aprobada o Requiere revisión.

## Registro de nuevas solicitudes

| Fecha | Herramienta(s) | Solicitud | Decisión | Estado | Prueba requerida |
|---|---|---|---|---|---|
| 2026-09-04 | Todas | Agregar 20 mejoras de experiencia, generación, formato, exportación, persistencia y control de calidad. | Implementado por familias sobre componentes compartidos y salidas especializadas. | Completado | Pruebas funcionales, visuales, responsive y de archivos exportados aprobadas. |
| 2026-09-04 | Todas, con prioridad en Tarea para casa | Agregar 20 mejoras de lógica para evitar generaciones genéricas o ajenas al propósito pedagógico. | Contratos, validadores y pruebas específicos incorporados; Tarea de Hogar tiene reglas reforzadas. | Completado | Casos por modalidad, coherencia, edición y exportación aprobados. |

## Anexo D · Arquitectura de generación, resultados profesionales y experiencia integral

Este anexo incorpora y amplía las propuestas de mejora posteriores a los anexos A, B y C. Cuando un punto ya existe en esos anexos, aquí se especifica su implementación operativa y su alcance; no sustituye ninguna decisión anterior. La prioridad es eliminar el modelo de salida genérico y conseguir que cada una de las 57 herramientas produzca un resultado pedagógica y visualmente propio.

### Línea 1 · Generadores especializados y contexto confiable

#### 1. Contrato de salida exclusivo por herramienta

Cada herramienta tendrá un esquema técnico propio de entrada, salida, validación y exportación. Tarea de Extensión y Hogar devolverá una ficha familiar; Rúbrica devolverá criterios, niveles y descriptores; PCA devolverá tablas y calendarización; Crucigrama devolverá palabras, pistas, coordenadas y solucionario. **Aceptación:** ninguna herramienta usa la estructura genérica de “resumen + secciones” como resultado final cuando su producto requiere tablas, pasos, datos, juegos o registros específicos.

#### 2. Catálogo técnico de 57 recetas de generación

Crear una fuente de verdad por herramienta con campos requeridos, opcionales, dependencias, restricciones, prompt base, esquema de respuesta, plantilla visual, formatos de exportación, casos de prueba y versión. **Aceptación:** al modificar una herramienta se conoce exactamente qué contrato, prueba y formato afecta sin alterar las demás.

#### 3. Clasificador de intención del encargo

Antes de la llamada principal, interpretar la solicitud docente para identificar producto, propósito, área, nivel cognitivo, duración, evidencia, destinatario y modalidad de trabajo. Si hay ambigüedad, solicitar precisión útil; no rellenar supuestos. **Aceptación:** una solicitud breve se convierte en un resumen revisable y no en una salida genérica.

#### 4. Memoria pedagógica por documento

PCA, unidad, sesión, proyecto y plan de tutoría guardarán un contexto estructurado reutilizable: competencias, criterios, propósito, vocabulario, grupos, fechas y acuerdos. **Aceptación:** una tarea o evaluación creada desde una sesión conserva esos datos y muestra qué elementos fueron heredados.

#### 5. Generación fundamentada en archivos del docente

Ampliar la carga de PDF, Word, texto e imagen para crear sesiones desde lecturas, preguntas desde un texto, rúbricas desde una evidencia y tareas desde una planificación. El sistema extrae contenido, muestra la fuente utilizada y permite excluir fragmentos. **Aceptación:** el resultado distingue claramente el contenido aportado por el docente de las propuestas generadas.

#### 6. Modo estricto “no inventar”

Para documentos oficiales, tutoría, informes, alertas, normativa y evaluación, un modo estricto reemplaza información ausente por campos pendientes o preguntas de precisión. **Aceptación:** no se exportan códigos, nombres, fechas, diagnósticos, normas, fuentes o resultados inventados.

#### 7. Detección previa de contradicciones

Validar combinaciones pedagógicas y logísticas antes de generar: edad vs. tipo de actividad, EBE vs. accesibilidad, tiempo vs. número de tareas, baja conectividad vs. recursos digitales y modalidad vs. ejemplos. **Aceptación:** toda alerta explica el conflicto, propone un ajuste y permite decidir al docente.

#### 8. Revisión independiente posterior a la generación

Aplicar un validador o segunda pasada que no redacte desde cero: revisa alineación, seguridad, duración, coherencia, repetición y estructura contra el contrato de la herramienta. **Aceptación:** un bloque fallido se identifica y regenera de forma parcial sin perder las ediciones aprobadas.

#### 9. Límites pedagógicos de extensión

Definir longitud mínima y máxima por sección: consigna, pregunta, descriptor, instrucción familiar, nota docente, informe o introducción. **Aceptación:** los documentos quedan legibles y las actividades estudiantiles no incluyen párrafos innecesarios.

#### 10. Detector de cobertura incompleta

Cada familia de herramientas define sus partes críticas: propósito, actividad, evidencia, criterio, instrumento, retroalimentación, responsables, fechas o solución. **Aceptación:** el sistema informa qué elemento falta antes de marcar el resultado como listo.

#### 11. Control de repetición entre generaciones

Comparar nuevas propuestas con artefactos recientes del mismo docente, aula y tema para advertir si repite preguntas, actividades, ejemplos o textos. **Aceptación:** el usuario puede elegir “mantener”, “crear alternativa” o “usar la versión anterior” sin perder trabajo.

#### 12. Generación encadenada y aprobable

Desde una unidad se pueden proponer sesiones; desde una sesión, tarea, ficha, presentación e instrumento; cada resultado se previsualiza y se aprueba individualmente. **Aceptación:** la aplicación genera un conjunto coherente, pero nunca guarda ni publica derivados sin confirmación docente.

#### 13. Diagnóstico guiado para mejorar un resultado

En lugar de una regeneración ciega, ofrecer motivos concretos: muy genérico, no corresponde al grado, falta práctica, demasiado texto, falta evaluación, contexto incorrecto o lenguaje difícil. **Aceptación:** la corrección cambia únicamente el bloque indicado y conserva el resto del artefacto.

#### 14. Semáforo de riesgo de información no verificable

Identificar datos con riesgo alto de invención: norma, autor, estadística, enlace, referencia, diagnóstico o dato institucional. **Aceptación:** antes de exportar, cada elemento marcado tiene una acción: confirmar, editar, eliminar o dejar pendiente de verificación.

#### 15. Separación estricta entre contenido y representación

Guardar el contenido pedagógico en datos estructurados; renderizar después Word, PDF, Excel, PowerPoint o recurso interactivo desde el mismo origen. **Aceptación:** cambiar el formato visual no modifica preguntas, criterios, actividades o respuestas, y una edición de contenido se refleja coherentemente en todas las salidas compatibles.

### Línea 2 · Resultados visuales, imprimibles y realmente utilizables

#### 16. Biblioteca de bloques visuales semánticos

Crear bloques reutilizables —objetivo, activación, actividad, ejemplo, materiales, tabla de evaluación, cronograma, solucionario, orientación familiar y reflexión— con comportamiento propio por formato. **Aceptación:** no se ensamblan documentos con cajas genéricas; cada bloque sabe cómo imprimirse, editarse y exportarse.

#### 17. Jerarquía documental profesional

Los documentos extensos aplican portada opcional, índice, encabezados, numeración, pie de página, tablas legibles, saltos inteligentes y anexos. **Aceptación:** PCA, carpetas e informes son navegables y una ficha, correo o actividad breve no incorpora adornos institucionales innecesarios.

#### 18. Vista de edición y vista entregable separadas

La vista docente muestra orientaciones, advertencias, claves y controles; la vista entregable elimina elementos internos y se adapta al estudiante, familia o dirección. **Aceptación:** ningún solucionario, comentario de IA o advertencia administrativa aparece por error en la versión estudiante.

#### 19. Estándar de impresión y página por herramienta

Definir A4/carta, orientación, márgenes, tamaño mínimo de letra, ancho de tabla, número de páginas esperado y espacio para respuestas. **Aceptación:** cada exportación se genera con reglas apropiadas para su propósito y no usa una configuración universal.

#### 20. Modo de ahorro de tinta

Fichas, listas, sopas, crucigramas y actividades de hogar tendrán una variante en blanco y negro de alto contraste, sin fondos costosos. **Aceptación:** se puede imprimir en una impresora doméstica sin perder instrucciones, cuadrículas ni jerarquía.

#### 21. Paquete separado de estudiante, docente y solucionario

Para exámenes, fichas, recuperación y juegos exportables, crear salidas diferenciadas y claramente etiquetadas. **Aceptación:** el docente puede descargar solo la versión que necesita y las claves nunca se mezclan con el material distribuible.

#### 22. Inspección visual previa a la exportación

Renderizar al menos portada/primera página y página final, o todas las páginas cuando sea pequeño, para detectar cortes, tablas partidas, texto fuera de margen, títulos huérfanos y cuadrículas ilegibles. **Aceptación:** un archivo con defecto visual muestra corrección sugerida antes de descargarse.

#### 23. Portada institucional condicional

Permitir portada con identidad de institución solo para PCA, unidad, planes, informes, tutoría y carpeta pedagógica; excluirla por defecto de tareas, juegos, correos y fichas cortas. **Aceptación:** la portada es opcional, usa datos reales del perfil y nunca inventa logos ni firmas.

#### 24. Bloques de firma configurables

Ofrecer espacios configurables para docente, dirección, familia, estudiante, fecha, sello o recepción según el documento. **Aceptación:** se muestran únicamente si el tipo de salida o la plantilla institucional lo necesita y permanecen vacíos para firma real.

### Línea 3 · Página de inicio, navegación y continuidad del trabajo

#### 25. Centro de creación unificado

Desde Inicio, el docente puede expresar una necesidad en lenguaje cotidiano —planificar, evaluar, recuperar, incluir, acompañar o crear recurso— y recibir una ruta recomendada con datos prellenados. **Aceptación:** la recomendación explica por qué sugiere esa herramienta y el docente puede elegir otra.

#### 26. Inicio orientado al trabajo pendiente

Priorizar borradores, próxima sesión, evaluaciones por revisar, recuperación, eventos, documentos recientes y tareas de seguimiento, además de favoritos. **Aceptación:** el panel inicial ayuda a continuar trabajo real y no se limita a una cuadrícula de accesos.

#### 27. Tablero de continuidad docente

Visualizar el recorrido Planificación → Sesión → Evidencia → Evaluación → Retroalimentación → Refuerzo → Seguimiento, con enlaces a cada artefacto relacionado. **Aceptación:** el docente identifica qué etapa falta y puede crear el siguiente artefacto con contexto heredado.

#### 28. Búsqueda semántica global

Buscar por herramienta, tema, estudiante, competencia, texto de documento, fecha, favorito o estado; incluir filtros y resultados con contexto. **Aceptación:** “comprensión lectora 4.º B” encuentra sesiones, fichas, instrumentos y recursos asociados, no solo el nombre de una ruta.

#### 29. Bandeja de acciones útiles

Crear una bandeja de avisos accionables: borradores pendientes, revisión de evaluación, eventos próximos, planes sin cerrar, generación lista o recuperación por atender. **Aceptación:** cada aviso lleva a una acción concreta, se puede posponer y no se convierte en una lista de notificaciones decorativas.

#### 30. Centro de errores recuperables

Cuando Gemini, una carga o una exportación fallen, mantener el borrador, explicar el error sin tecnicismos y ofrecer reintentar, editar manualmente, guardar localmente o volver más tarde. **Aceptación:** ningún fallo hace perder datos completados ni obliga a reiniciar un flujo.

#### 31. Generaciones extensas como trabajos en segundo plano

PCA, carpetas, informes, planes y presentaciones extensas se gestionan como tareas persistentes con etapas reales, cancelación segura, reintento y aviso de finalización. **Aceptación:** la interfaz no depende de una única espera bloqueante y el usuario puede continuar navegando.

#### 32. Créditos y consumo explicables

Mostrar antes de generar el consumo estimado, y después el costo, modelo usado, reintentos y política de devolución ante error técnico. **Aceptación:** el docente entiende el uso de sus créditos y un fallo sin resultado no se cobra como generación exitosa.

### Línea 4 · Administración, protección y mejora continua

#### 33. Panel administrativo de calidad de IA

El administrador ve tasa de error, duración, consumo, uso por herramienta, regeneraciones, exportaciones fallidas y comentarios agregados, sin exponer contenido sensible. **Aceptación:** puede priorizar la reparación de generadores basándose en evidencia real.

#### 34. Valoración privada de cada generación

Después de usar un resultado, el docente puede marcar útil, necesitó edición, incorrecto o ajeno al tema y seleccionar la causa. **Aceptación:** el feedback se asocia a herramienta, versión y tipo de error, y alimenta métricas agregadas para mejora.

#### 35. Personalización por institución

Permitir que cada institución configure datos oficiales, periodos, logos, formatos, firmas permitidas, áreas frecuentes, criterios y plantillas sin alterar otras instituciones. **Aceptación:** un documento institucional usa exclusivamente la configuración del centro al que pertenece el usuario.

#### 36. Roles, permisos y trazabilidad de acceso

Definir capacidades separadas para docente, tutor, coordinador, dirección y administrador; proteger especialmente alertas, tutoría, estudiantes e informes. **Aceptación:** cada acceso, descarga, edición o compartición sensible queda registrado y se limita al rol autorizado.

#### 37. Colaboración con control de cambios

Permitir compartir un artefacto para comentar, sugerir, aprobar o devolver observaciones sin sobrescribir el original. **Aceptación:** existen propietario, permisos explícitos, historial de cambios y una acción clara para aceptar o rechazar sugerencias.

#### 38. Modo demostración y tutoriales contextuales

Cada herramienta incluye ejemplo lleno, recorrido inicial, definición del resultado esperado y ejemplo de exportación. **Aceptación:** un docente nuevo entiende qué datos ingresar y qué obtendrá antes de consumir créditos.

#### 39. Accesibilidad pedagógica integral

Además de tema oscuro y escalado de tipografía, asegurar teclado, lector de pantalla, alto contraste, texto alternativo, zonas táctiles, instrucciones de audio opcionales y adaptaciones EBE. **Aceptación:** las herramientas críticas se prueban con navegación sin mouse y en formato móvil.

#### 40. Indicador de madurez por herramienta

El panel administrativo tendrá una ficha por cada una de las 57 con estados de diseño, campos, generación especializada, validación, persistencia, exportación, pruebas, móvil, accesibilidad y aprobación pedagógica. **Aceptación:** ninguna herramienta se presenta como terminada solo porque su ruta abre; su estado refleja evidencia verificable de cada dimensión.

### Orden recomendado de ejecución del Anexo D

1. **Base de generación:** puntos 1, 2, 3, 6, 7, 8, 10 y 15.
2. **Continuidad pedagógica:** puntos 4, 5, 11, 12, 13 y 14.
3. **Salida y exportación:** puntos 16 al 24.
4. **Experiencia del docente:** puntos 25 al 32.
5. **Control institucional y calidad:** puntos 33 al 40.

## Registro de nuevas solicitudes

| Fecha | Herramienta(s) | Solicitud | Decisión | Estado | Prueba requerida |
|---|---|---|---|---|---|
| 2026-09-04 | Aplicación completa y 57 herramientas | Incorporar mejoras de generación especializada, resultados profesionales, navegación, continuidad, administración y accesibilidad; ampliar puntos repetidos con alcance operativo. | Ejecutado por líneas manteniendo compatibilidad con los anexos A, B y C. | Completado | Contratos, casos pedagógicos, permisos, exportación visual, móvil, accesibilidad y pruebas completas. |

## Registro de ejecución del plan

### Hito 1 · Base de generación especializada — completado

- Se creó un registro central de contratos para las 58 rutas registradas, que corresponden a las 57 herramientas funcionales; la adaptación NEE/DUA existe en dos módulos.
- Cada contrato define producto esperado, destinatario, tipo de salida, componentes obligatorios, reglas de calidad, versión y herramientas que pueden continuar el trabajo.
- El backend rechaza rutas sin contrato para impedir que una herramienta nueva use silenciosamente un generador genérico.
- El prompt de Gemini incorpora el contrato de la herramienta, el contexto educativo y las reglas de salida antes de generar.
- Se añadió un contrato reforzado para **Tarea de Extensión y Hogar**: consigna numerada, evidencia concreta, apoyo familiar opcional sin resolver la tarea, alternativas accesibles y actividad utilizable.
- Cada generación devuelve un resumen del encargo, cinco controles de calidad, advertencias y próximos pasos relacionados.
- La interfaz muestra el control de calidad, permite editar el resultado y regenerar una sola sección sin perder el documento completo.
- La estructura nueva mantiene compatibilidad con los borradores y respuestas anteriores porque los campos de control son opcionales.

**Evidencia automatizada y visual acumulada:** 58 pruebas completas del backend aprobadas; 141 pruebas completas de la interfaz y exportadores aprobadas; análisis de código del frontend y backend sin errores; compilación de producción aprobada; servicios localizados en los puertos 5173 y 8001 con respuesta HTTP 200; verificación visual responsive en modo claro y oscuro de Tarea de Extensión y Hogar.

### Hito 2 · Salidas tipadas y validadores por familia — completado

1. Sustituir progresivamente la respuesta genérica por esquemas propios para planificación, evaluación, inclusión, refuerzo, acompañamiento, tutoría y recursos.
2. Empezar por las herramientas de mayor riesgo o uso: PCA, sesión, unidad, tarea de hogar, lista de cotejo, rúbrica, diapositivas, ficha de aprendizaje, preguntas sobre texto, recuperación, sopa de letras y crucigrama.
3. Añadir validadores pedagógicos que comprendan tablas, criterios, cantidad de estudiantes, filas/columnas, límites de palabras, diapositivas y páginas mínimas.
4. Conectar los artefactos relacionados para reutilizar contexto y evitar volver a escribir datos.
5. Crear pruebas de referencia con casos EBR, EBA y EBE antes de marcar cada herramienta como madura.

#### Sub-bloque 2A · Matrices pedagógicas reales — completado

- Se incorporó un tipo de tabla estructurada con título, columnas, filas y nota; el backend impide filas incompletas o con columnas sobrantes.
- Gemini recibe matrices obligatorias y específicas para unidad, sesión, tarea de hogar, rúbrica, lista de cotejo, ficha de aprendizaje, examen, preguntas sobre texto, carpeta de recuperación y plan de refuerzo.
- La sesión exige Inicio, Desarrollo y Cierre, acciones diferenciadas del docente y estudiante, tiempos y evidencia con retroalimentación.
- La lista de cotejo exige una fila por estudiante, celdas Sí/No y una leyenda independiente para C1…Cn; la rúbrica incluye recomendación concreta para avanzar.
- Tarea de hogar genera una ruta realizable con consigna, material, evidencia y apoyo familiar opcional; refuerzo prioriza cómo se realizará y limita el diseño a tres sesiones.
- Las tablas aparecen dentro de la vista entregable, permiten editar cada celda sin regenerar el resto y se exportan al Word correspondiente.
- El PCA no recibe tablas genéricas duplicadas: conserva su renderizador y exportador especializado de 17 tablas, que se validará como sub-bloque propio.
- El informe de calidad ahora comprueba también la presencia de matrices estructuradas cuando el contrato de la herramienta las exige.

**Evidencia:** 56 pruebas backend aprobadas, incluidas validación de dimensiones y reglas del prompt; 137 pruebas frontend aprobadas, incluida edición persistente de una celda; lint de ambos proyectos y compilación de producción sin errores.

#### Sub-bloque 2B · Integridad de presentaciones y juegos de palabras — completado

- Se verificó que Presentaciones didácticas usa su generador especializado y no el documento genérico: modalidades EBR/EBA/EBE, 3/5/8 diapositivas, progresión pedagógica, interacción, notas docentes, edición por diapositiva y exportación propia.
- Sopa de letras y crucigrama normalizan respuestas para producir palabras utilizables, regeneran identificadores estables, rechazan duplicados y exigen exactamente la cantidad pedida entre 5 y 30.
- La sopa interactiva calcula el tamaño de cuadrícula según cantidad y longitud total, busca la mejor ubicación por intersecciones y bloquea la entrega si alguna palabra no pudo ubicarse.
- Los Word de sopa de letras y crucigrama dejaron de incluir cuadrículas fijas ajenas al tema. Las casillas, pistas, palabras, sentidos, numeración y coordenadas se calculan con el contenido real de la generación.
- Ambos juegos se exportan en orientación horizontal cuando la cuadrícula lo requiere y mantienen separado el material del estudiante del solucionario docente.
- El control de calidad informa si se respetó la cantidad de palabras solicitada.

**Evidencia:** 58 pruebas backend y 141 pruebas frontend aprobadas; pruebas de 30 palabras, normalización, duplicados, edición, interacción y exportación Word; lint completo sin observaciones y compilación de producción aprobada. Los DOCX de crucigrama y sopa se renderizaron con Microsoft Word y Poppler por ausencia de LibreOffice, y se inspeccionaron todas sus páginas: actividad, pistas/aplicación y solucionario quedan separados, sin filas huérfanas, cortes ni desbordes.

| Fecha | Alcance ejecutado | Resultado | Estado | Próxima evidencia |
|---|---|---|---|---|
| 2026-09-04 | Contratos, prompt especializado, control de calidad y regeneración parcial | Primera base común aplicada a todas las rutas; Tarea de Extensión y Hogar tiene reglas reforzadas. Compilación, 188 pruebas combinadas y comprobación local aprobadas. | Completado | Casos de referencia y esquemas tipados por familia. |
| 2026-09-04 | Hito 2A: matrices específicas para planificación y evaluación | Diez herramientas prioritarias generan tablas validadas, editables y exportables; el PCA conserva su formato especializado. Compilación y 193 pruebas combinadas aprobadas. | Completado | Validar el PCA de 17 tablas y crear salidas tipadas de diapositivas, sopa de letras y crucigrama. |
| 2026-09-04 | Hito 2B: presentaciones y juegos de palabras | Se confirmó el flujo especializado de diapositivas y se reemplazaron cuadrículas Word fijas por sopas y crucigramas construidos con las palabras reales. 199 pruebas combinadas y render visual de todos los DOCX aprobados. | Completado | Continuar con validación especializada del PCA, ficha de aprendizaje y recuperación. |
| 2026-09-04 | Formatos avanzados, exportaciones particulares y QA visual de las 57 herramientas | Ejecutado por lotes con artefactos reales y validación posterior a la generación. | Completado | Matriz de contratos, 57 archivos de referencia, renderizados y pruebas responsive por familia. |

#### Sub-bloque 2C · PCA, matrices anuales y flujos extensos — completado

- El Plan Curricular Anual conserva sus nueve pasos y genera diecisiete matrices especializadas, con columnas y filas vinculadas a los datos reales del formulario.
- Las matrices se editan por celda y la misma versión alimenta la vista previa y el Word; no se sustituyen por texto genérico ni por tablas fijas.
- Unidad, sesión, proyectos, inclusión, refuerzo, acompañamiento y tutoría tienen estructuras diferenciadas según su complejidad, no una sola plantilla repetida.
- Los campos institucionales ausentes se muestran como `No registrado`; se eliminaron nombres, instituciones, cargos y fechas ficticias de las salidas finales.
- El Word del PCA mantiene validación docente/directiva cuando existen responsables y compacta las firmas dentro de la última página útil.

#### Sub-bloque 2D · Cobertura de las 57 herramientas — completado

- Las 57 herramientas cuentan con contrato de producto, datos obligatorios, componentes mínimos, restricciones pedagógicas y salida esperada.
- Ficha de aprendizaje, recuperación, preguntas sobre texto, observación, tutoría, informes, correos, analítica, inclusión y recursos producen artefactos propios y editables.
- Las cantidades solicitadas se respetan en diapositivas, sesiones de refuerzo, tarjetas, preguntas, estudiantes, palabras y criterios.
- Los botones de IA aparecen únicamente en campos narrativos que admiten ayuda contextual; no se muestran en DRE, UGEL, nombres, modalidades, niveles, fechas ni selectores.
- Las modalidades EBR, EBA y EBE se propagan a los generadores que dependen de modalidad y ajustan lenguaje, nivel, accesibilidad y ejemplos.

### Hito 3 · Exportaciones y control visual — completado

- Se especializaron Word, PowerPoint, PDF y Excel solo donde cada herramienta los necesita; el botón de descarga no promete formatos incompatibles.
- Los documentos usan texto negro, encabezados neutros, tablas de contraste bajo, títulos centrados cuando corresponde y no incorporan lemas oficiales no verificados.
- Se eliminaron asteriscos y marcas de Markdown del contenido entregable.
- Las firmas son condicionales: se conservan en planes, informes y comunicaciones institucionales, y se excluyen de juegos, fichas breves e instrumentos cuando solo crearían una hoja vacía.
- Se renderizaron e inspeccionaron con Microsoft Word y Poppler las 57 salidas de referencia y una muestra final de arquetipos: agrupación, secuencias, presentación, PCA, rúbrica, comunicación familiar, analítica e informe.
- Se corrigieron explícitamente las páginas huérfanas del PCA y la rúbrica; el PCA termina en dos páginas útiles y la rúbrica en una.

### Hito 4 · Experiencia, seguridad y ejecución local — completado

- La espera de generación muestra etapas reales y distintas por familia: planificación, evaluación, inclusión, refuerzo, acompañamiento, tutoría, recursos y presentaciones.
- La navegación lateral se contrae, el contenido se adapta a móvil y tableta, los pasos extensos permiten desplazamiento horizontal y el calendario abre el editor de fecha con doble clic.
- Los tres tamaños de letra y los temas claro/oscuro se probaron en Inicio, Calendario, PCA, Tarea de Hogar y Presentaciones.
- Las rutas `/dashboard` exigen sesión válida y `/admin` exige rol administrador. Un `401` limpia la sesión y devuelve al inicio de sesión sin dejar datos inconsistentes.
- Se ejecutó una sugerencia contextual y una presentación real con Gemini: la primera respetó el campo específico y la segunda produjo ocho diapositivas con competencias, interacciones, edición y formatos de salida.
- El frontend y el backend quedan activos en `127.0.0.1:5173` y `127.0.0.1:8001`; salud y disponibilidad del API responden correctamente.

### Cierre técnico verificable

- Backend: 61 pruebas aprobadas y análisis estático sin observaciones.
- Frontend: 156 pruebas aprobadas en 86 archivos, lint sin observaciones y compilación de producción correcta.
- Total: 217 pruebas automatizadas aprobadas, además de validación visual responsive y renderizado real de documentos.
- Advertencia no bloqueante: Vite informa que el paquete principal supera su recomendación de tamaño; no impide funcionamiento, generación ni despliegue local y queda registrado como optimización posterior.

| Fecha | Alcance ejecutado | Resultado | Estado | Evidencia final |
|---|---|---|---|---|
| 2026-09-04 | Hitos 2C, 2D, 3 y 4 del plan de 57 herramientas | Generación especializada, salidas condicionadas, espera contextual, seguridad de sesión, responsive, claro/oscuro y ejecución local terminados. | Completado | 61 pruebas backend + 156 frontend; lint, build, salud API, Gemini real y QA visual aprobados. |
