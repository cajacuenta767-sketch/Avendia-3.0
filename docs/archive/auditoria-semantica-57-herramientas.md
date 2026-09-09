# Auditoría semántica de los generadores de Avendia

Fecha: 4 de septiembre de 2026  
Alcance: catálogo completo, generación con IA, representación en pantalla, exportación y persistencia asociada.  
Estado: **auditoría base actualizada tras la primera ejecución correctiva; todavía no equivale a certificación individual de todas las herramientas**.

## 1. Conclusión ejecutiva

El problema reportado era real. La aplicación tenía formularios, contratos de contenido y exportadores, pero gran parte del catálogo compartía un generador y una validación demasiado genéricos. La primera ejecución correctiva ya incorporó bloqueo P0, estados de calidad, validadores transversales y validadores profundos para las familias prioritarias; quedan familias por certificar individualmente con generación real.

En el caso de **Tarea de Extensión y Hogar**, el defecto inicial descartaba `activity.items` al exportar. Esto ya fue corregido con un artefacto `ficha_hogar`, vista y exportador especializados, tipos de respuesta reales y guía docente separada. La prueba visual final produce tres páginas utilizables sin partir consignas grandes.

El catálogo declarado tampoco es internamente inequívoco: existen **58 rutas configuradas**, aunque el proyecto las presenta como 57 herramientas. Hay conceptos repetidos en dos módulos (`adaptacion-nee-dua` y `analytics-alertas`) y los identificadores no sirven por sí solos como identidad global. Toda auditoría futura debe identificar cada producto mediante `módulo/herramienta`.

### Dictamen actual

- 58/58 rutas tienen definición de formulario y contrato de generación.
- Todas las rutas registradas pasan ahora una puerta contractual común: apartados exactos, contenido no duplicado y matrices no repetitivas.
- Las familias prioritarias ya tienen reglas profundas para secuencias de sesión, unidades, PCA, refuerzo, rúbrica, lista de cotejo, escala, registros, analítica, inclusión, comunicaciones, examen, documentos fuente, tareas y recursos interactivos.
- Un fallo P0 bloquea el resultado antes de registrar consumo y la interfaz impide exportarlo.
- Sigue pendiente sustituir por validadores profundos todas las familias que aún dependen solo de la puerta transversal.
- Las pruebas Word “QA 57” usan artefactos redactados manualmente y verifican principalmente existencia/tamaño del archivo; no certifican la salida real de Gemini.
- Por ello, **la infraestructura ya no acepta cualquier texto con forma válida, pero aún no debe afirmarse que las 57 herramientas están certificadas una por una con resultados reales de Gemini**.

## 2. Caso reproducido: Tarea de Extensión y Hogar

### Lo que debería ser

Una ficha entregable al estudiante que contenga, como mínimo:

1. propósito expresado en lenguaje del estudiante;
2. una tarea central inequívoca;
3. datos, situación o material de partida suficientes para resolverla;
4. pasos breves y numerados;
5. preguntas, operaciones, tabla o producto concreto;
6. espacios reales para responder o registrar evidencia;
7. ejemplo resuelto separado de la actividad;
8. lista de materiales auténticos;
9. criterio de éxito comprensible;
10. autoevaluación marcable;
11. apoyo familiar opcional que no sustituya el trabajo;
12. versión del docente con respuestas/orientaciones, cuando corresponda.

### Lo que genera el documento auditado

- La primera página prioriza datos institucionales y una matriz de planificación.
- La consigna auténtica aparece enterrada en prosa en la segunda página.
- No hay ejercicios concretos, datos cerrados, tabla de trabajo para el estudiante ni espacio suficiente de respuesta.
- La tercera página describe evidencia, criterios y autoevaluación, pero no proporciona controles o áreas que el estudiante pueda completar.
- La tabla llama “material” a preguntas de reflexión; eso es una categoría semántica incorrecta.
- “Guardar en el portafolio” es una acción de flujo, no una tarea de aprendizaje.
- El producto usa fracciones, pero declara Personal Social sin separar con claridad la competencia matemática y la competencia de convivencia/equidad. La interdisciplinariedad es posible, pero debe quedar explícita y ser evaluable por área.
- El contenido repite propósito, ruta, consigna, evidencia y criterios en vez de convertirlos en una experiencia de trabajo.

### Causa técnica exacta

1. El flujo declara correctamente el artefacto como `actividad` y pide datos pertinentes.
2. El contrato exige tarea, ejemplo, evidencia, revisión, apoyo familiar y autoevaluación.
3. La normalización específica no incluye `tarea-extension-hogar`.
4. La comprobación de actividad solo exige que exista una lista no vacía.
5. El exportador no clasifica esta clave entre las actividades y usa `buildDocumentDocx`.
6. `buildDocumentDocx` nunca inserta `artifact.activity.items`.

Resultado: aun si Gemini creó preguntas o consignas estructuradas, el Word las descarta.

## 3. Hallazgos transversales

### P0 — Bloqueadores

1. **Pérdida de contenido entre IA y Word.** El contrato de respuesta es más rico que varios exportadores; algunos campos nunca se imprimen.
2. **Validación semántica insuficiente.** Se buscan palabras iniciales de elementos contractuales en todo el texto; aproximadamente la mitad basta para aprobar.
3. **No existe política de rechazo.** Un resultado con comprobaciones fallidas sigue llegando al usuario con advertencias.
4. **Un esquema universal intenta representar productos incompatibles.** Un plan anual, una rúbrica, una ficha, una comunicación, un juego y una fuente normativa no deberían depender solo de `sections`, `tables` y una actividad opcional.
5. **Las pruebas no recorren el circuito real.** Los artefactos QA se redactan dentro del test; no pasan por formulario → API → Gemini → normalizador → vista previa → exportación.

### P1 — Riesgos pedagógicos

6. No se valida alineación `competencia → capacidad/desempeño → evidencia → criterio → actividad`.
7. No se diferencia contenido para docente, contenido para estudiante, clave de respuestas y metadatos administrativos.
8. No se comprueba que una pregunta tenga información suficiente ni una respuesta determinable.
9. No se mide edad, carga cognitiva, extensión, tiempo realista o autonomía requerida.
10. No se detecta contradicción entre área, tema, producto y criterio.
11. No se obliga a que los descriptores de rúbrica sean observables, progresivos y mutuamente distinguibles.
12. No se detectan tablas decorativas, columnas mal tipadas o filas que repiten narrativa.
13. Los recursos externos (normativa, libros MINEDU y canales) no tienen una prueba sólida de vigencia, URL oficial, fecha de consulta y trazabilidad; un modelo generativo no debe inventar fuentes.

### P2 — Calidad de uso

14. No hay prueba de espacios de respuesta ni de imprimibilidad de una ficha.
15. No hay presupuesto de página por tipo de producto.
16. No se verifica paridad entre vista previa, Word/PDF/Excel y datos persistidos.
17. Los mensajes de calidad son genéricos y no explican qué parte concreta debe regenerarse.
18. Las herramientas dedicadas tienen mejor estructura de datos, pero eso no certifica el contenido pedagógico inicial ni sus sugerencias de IA.

## 4. Auditoría del catálogo completo

Leyenda:

- **Dedicada:** pantalla/estado propios; puede tener persistencia real.
- **Genérica-S:** flujo compartido con alguna normalización específica de estructura.
- **Genérica-R:** flujo compartido sin validador semántico propio.
- **Fuente:** necesita verificación externa y trazabilidad, además de forma pedagógica.

### Planificamos

| # | Herramienta | Ruta de ejecución | Riesgo principal | Puerta semántica obligatoria |
|---:|---|---|---|---|
| 1 | Plan Curricular Anual (PCA) | Genérica-R; exportación dedicada | Matrices completas pero posible desalineación anual | Cobertura de periodos, competencias, calendario, productos, evaluación y trazabilidad cruzada |
| 2 | Unidad de Aprendizaje | Genérica-R | Secciones narrativas sin secuencia verificable | Situación, propósito, evidencias, sesiones, criterios y cronograma enlazados por identificadores |
| 3 | Sesión de Aprendizaje | Genérica-R | Inicio/desarrollo/cierre genéricos | Tiempos suman duración; cada momento contiene acción docente, acción del estudiante, recurso y evidencia |
| 4 | Situación significativa | Genérica-R | Contexto decorativo sin reto auténtico | Contexto, tensión/problema, actores, reto abierto, producto y preguntas desafiantes coherentes |
| 5 | Proyectos integrados | Genérica-R | Áreas listadas sin integración real | Aporte de cada área, producto común, hitos, responsables, evidencias y evaluación interdisciplinaria |
| 6 | Adaptación Inclusiva NEE (DUA) | Genérica-R | Lista de apoyos sin barrera funcional | Barrera → principio DUA → ajuste → responsable → evidencia de acceso/progreso; sin diagnóstico clínico inventado |
| 7 | Tarea de Extensión y Hogar | Genérica-R; exportador incorrecto | La tarea estructurada desaparece del Word | Ficha resoluble, datos/preguntas, espacios, evidencia y autoevaluación; paridad total al exportar |
| 8 | Carpeta Pedagógica Oficial | Genérica-R | Índice narrativo en vez de carpeta organizada | Secciones obligatorias, índice, anexos, estado, fecha, responsable y ausencia explícita de documentos no cargados |

### Evaluamos

| # | Herramienta | Ruta de ejecución | Riesgo principal | Puerta semántica obligatoria |
|---:|---|---|---|---|
| 9 | Rúbrica de evaluación | Dedicada; persistencia | El formulario exige campos, pero no prueba calidad de criterios/descriptores | Evidencia definida; 3–6 criterios no solapados; descriptores observables y progresivos AD/A/B/C; pesos 100%; sin adjetivos vacíos |
| 10 | Lista de cotejo | Dedicada; persistencia | Indicadores genéricos o dobles | Un comportamiento observable por indicador; Sí/No/En proceso; vínculo a evidencia y estudiante; exportación por filas |
| 11 | Ficha de aprendizaje | Dedicada para documento fuente | Puede convertirse en resumen y no en práctica | Explicación breve, ejemplo, práctica guiada, práctica autónoma, respuestas/espacios y clave docente |
| 12 | Examen | Genérica-R | Preguntas sin balance ni clave confiable | Tabla de especificaciones, puntajes consistentes, niveles cognitivos, respuesta única cuando aplique y clave justificada |
| 13 | Escala de estimación | Genérica-R | Niveles no progresivos | Indicadores observables, escala ordenada, anclajes conductuales y regla clara de interpretación |
| 14 | Preguntas sobre texto | Dedicada para documento fuente | Preguntas no sustentadas en el texto | Cada respuesta debe citar/ubicar evidencia del texto; balance literal/inferencial/crítico; versión estudiante y docente |
| 15 | Ficha de observación | Dedicada; persistencia | Interpretaciones mezcladas con hechos | Hechos objetivos separados de interpretación, fecha/contexto, foco observable y compromiso de seguimiento |
| 16 | Registros auxiliares | Dedicada; persistencia | Tabla bonita sin cálculo consistente | Nómina por filas, periodos/competencias por columnas, reglas de cálculo explícitas y exportación Excel equivalente |
| 17 | Carpetas de recuperación | Dedicada; persistencia | Actividades no vinculadas a brecha individual | Diagnóstico por estudiante, meta, actividad graduada, evidencia, plazo y reevaluación; lote no borra personalización |
| 18 | Calificador de rúbricas con IA | Dedicada; IA solo para recomendación | Riesgo de que la IA decida o invente la nota | Evidencia obligatoria, criterio y nivel seleccionados por docente; IA solo propone feedback accionable y nunca cambia calificación |
| 19 | Retroalimentación Formativa | Genérica-R | Frases motivacionales sin información para avanzar | Evidencia → logro → brecha → pregunta/acción siguiente → plazo; lenguaje específico, no juicio personal |
| 20 | Analítica de aula y alertas | Genérica-R | Conclusiones sin datos suficientes | Métrica, denominador, periodo, umbral, evidencia, nivel de confianza y prohibición de inferir causas no registradas |

### Incluimos

| # | Herramienta | Ruta de ejecución | Riesgo principal | Puerta semántica obligatoria |
|---:|---|---|---|---|
| 21 | Adaptación Inclusiva NEE (DUA) | Genérica-R; concepto repetido | Duplicidad y resultados divergentes | Misma regla semántica que la herramienta 6 y una única fuente de verdad |
| 22 | Plan de atención | Genérica-R | Plan general sin caso, plazo o evidencia | Necesidad/barrera, línea base, objetivo medible, apoyo, responsable, frecuencia, evidencia y fecha de revisión |
| 23 | Estrategias de inclusión | Genérica-R | Catálogo de consejos genéricos | Estrategia vinculada a barrera y tarea; cómo aplicarla, recurso, indicador de acceso y alternativa DUA |
| 24 | Trabajo con familias | Genérica-R | Comunicación prescriptiva o invasiva | Objetivo, acuerdo voluntario, acciones posibles, responsable, canal, fecha y resguardo de privacidad |
| 25 | Seguimiento y evaluación | Genérica-R | Informe sin comparación temporal | Línea base vs. avance, periodo, evidencia, barrera persistente, ajuste acordado y siguiente revisión |

### Reforzamos

| # | Herramienta | Ruta de ejecución | Riesgo principal | Puerta semántica obligatoria |
|---:|---|---|---|---|
| 26 | Trabajo autónomo para el hogar | Genérica-R | Ruta descrita pero no resoluble | Máximo tres sesiones/frecuencias, microtareas graduadas, respuestas, evidencia y autoevaluación autónoma |
| 27 | Carpeta de recuperación | Genérica-R | Documento repetitivo sin actividades | Secuencia diagnóstica, práctica guiada/autónoma, dificultad progresiva, soluciones y prueba de salida |
| 28 | Monitorea avances | Genérica-R | Analítica inventada desde texto libre | Bimestre/fechas, competencia/capacidad/desempeño, datos por estudiante, tendencia calculada y alertas trazables |
| 29 | Acompaña y motiva | Genérica-R | Mensajes genéricos | Mensaje basado en logro observable, meta alcanzable, estrategia concreta y seguimiento sin etiquetar al estudiante |
| 30 | Plan de refuerzo | Genérica-R | Se valora cantidad de páginas, no intervención | Brecha priorizada, hasta tres sesiones, modelado/práctica/verificación, recursos, criterio y decisión posterior |

### Acompañamos

| # | Herramienta | Ruta de ejecución | Riesgo principal | Puerta semántica obligatoria |
|---:|---|---|---|---|
| 31 | Correo a familias | Genérica-R | Texto correcto pero poco accionable | Asunto, saludo, hecho verificable, propósito, acuerdo/acción, fecha, canal y cierre; botón copiar conserva formato |
| 32 | Respuesta de correo | Genérica-R | Responde sin atender cada inquietud | Identificar solicitudes del mensaje, responder una a una, distinguir hechos de opinión y proponer siguiente paso |
| 33 | Analítica de aula y alertas | Genérica-R; concepto repetido | Resultado diferente a herramienta 20 con mismos datos | Unificar motor de métricas; diferenciar solo presentación/flujo de acompañamiento |
| 34 | Calificador con IA | Genérica-R | Valoración automática sin instrumento suficiente | Evidencia + criterio/rúbrica + decisión humana; explicación por criterio; no crear nota si faltan datos |
| 35 | Reporte de seguimiento | Genérica-R | Resumen narrativo sin trazabilidad | Periodo, objetivo anterior, evidencia, cambio observado, acuerdos, responsables, fecha y estado |

### Tutoría

| # | Herramienta | Ruta de ejecución | Riesgo principal | Puerta semántica obligatoria |
|---:|---|---|---|---|
| 36 | Plan de tutoría | Genérica-R | Temas sueltos sin diagnóstico y calendario | Diagnóstico, objetivos, líneas de acción, sesiones, familias, cronograma, indicadores y evaluación del plan |
| 37 | Sesiones de tutoría | Genérica-R | Charla informativa, no experiencia tutorial | Propósito socioemocional, apertura segura, dinámica, reflexión, acuerdo y ruta de ayuda; tiempos coherentes |
| 38 | Informe de tutoría | Genérica-R | Opiniones sin evidencia | Acciones y atenciones agregadas, logros/dificultades con evidencia, casos anonimizados y recomendaciones |
| 39 | Informe a padres de familia | Genérica-R | Exceso técnico o exposición de terceros | Lenguaje claro, datos del estudiante propio, fortalezas, necesidad, acuerdo y privacidad |
| 40 | Fichas de acompañamiento | Genérica-R | Formato sin continuidad | Motivo, hechos, voz del estudiante, orientación, acuerdo, derivación, responsable y fecha de seguimiento |
| 41 | Alertas y casos | Genérica-R | IA improvisa protocolos sensibles | Hechos, riesgo, urgencia, acciones inmediatas y ruta institucional; nunca diagnosticar ni sustituir protocolo humano |
| 42 | Recursos de tutoría | Genérica-R | Lista de ideas sin instrucciones | Objetivo, edad, duración, materiales, preparación, pasos, cuidado, preguntas y cierre por recurso |
| 43 | Orientación vocacional | Genérica-R | Recomendación de carrera determinista | Intereses/fortalezas/evidencias, opciones múltiples, exploración, restricciones, plan de acción y revisión |

### Recursos

| # | Herramienta | Ruta de ejecución | Riesgo principal | Puerta semántica obligatoria |
|---:|---|---|---|---|
| 44 | Presentaciones didácticas | Dedicada | Diapositivas saturadas, imágenes o textos sin función | Una idea por diapositiva, jerarquía y ajuste automático, ejemplo/actividad/notas, contraste, fuente visual y vista/exportación equivalentes |
| 45 | Tarjetas de estudio | Genérica-S | Mecánicamente completas pero pedagógicamente triviales | Una pregunta atómica, respuesta breve inequívoca, pista no reveladora, sin duplicados y dificultad adecuada |
| 46 | Agrupar palabras y taxonomías | Dedicada | Categorías ambiguas o palabras con pertenencia múltiple | Categorías excluyentes según consigna, solución única o ambigüedad declarada, mezcla aleatoria y clave |
| 47 | Ordenar bloques y secuencias | Dedicada | Secuencia discutible | Orden objetivo sustentado, bloques autosuficientes, distractores solo si se explican y clave justificable |
| 48 | Casos de estudio (ABP) | Genérica-S | Preguntas presentes pero caso sin evidencia suficiente | Dilema auténtico, actores, datos, restricciones, preguntas investigables, producto y guía sin resolver el caso |
| 49 | Juego del ahorcado educativo | Genérica-S | Palabras válidas pero pistas pobres | Palabra curricular, pista informativa no idéntica, normalización de tildes/ñ y número de intentos razonable |
| 50 | Completa la frase | Genérica-S | Solo valida un espacio en blanco | Contexto suficiente, una respuesta preferida, distractores plausibles, concordancia y explicación de respuesta |
| 51 | Emparejar palabras y glosarios | Genérica-S | Solo valida unicidad | Relación pedagógica inequívoca, definiciones paralelas, sin pistas por longitud/orden y clave completa |
| 52 | Dinámica de debate en aula | Genérica-R | Documento con argumentos prefabricados | Moción debatible, contexto neutral, roles, reglas, tiempos, fuentes, repreguntas y criterios; no sesgar postura |
| 53 | Crucigramas | Genérica-S | Palabras válidas sin garantizar cuadrícula útil | Cruces reales, numeración, pistas no circulares, máximo solicitado, solución y proporción imprimible |
| 54 | Sopas de letras | Genérica-S | Lista correcta pero diseño deficiente | Cuadrícula proporcionada, palabras colocadas y verificadas, dificultad/diagonales, máximo 30, solución marcada |
| 55 | Banco de recursos para planificar | Genérica-R | “Banco” inventado o poco aplicable | Recurso/actividad, momento de sesión, objetivo, duración, materiales, pasos, adaptación y fuente si es externa |
| 56 | Normativa educativa | Fuente | Norma inventada, derogada o sin enlace oficial | Identificador exacto, entidad, fecha, estado/vigencia, artículo relevante, URL oficial y fecha de consulta |
| 57 | Libros y guías MINEDU | Fuente | Título/enlace alucinado | Repositorio oficial, título exacto, año, nivel/grado/área, URL comprobada, derechos y uso didáctico |
| 58 | Canales audiovisuales | Fuente | Videos inexistentes o de baja calidad | URL comprobada, autor/canal, duración, fecha, calidad mínima, seguridad, pertinencia y momento de uso |

> Nota de inventario: si el producto comercial debe mantener exactamente “57 herramientas”, hay que decidir cuál de las dos duplicidades conceptuales se contabiliza una sola vez y normalizar el catálogo, sin borrar rutas hasta migrar historiales y favoritos.

## 5. Auditoría específica de rúbricas

La ruta dedicada es mejor que el generador genérico: maneja rúbrica analítica/holística, niveles, 3–6 criterios, descriptores, ponderaciones, estudiantes, evidencia, fortalezas, mejora y recomendación; además valida referencias y persiste el instrumento compuesto en backend.

Sin embargo, sus validadores actuales comprueban principalmente **presencia**, unicidad referencial y suma de pesos. No prueban que:

- cada criterio corresponda a la evidencia solicitada;
- dos criterios no midan lo mismo;
- los descriptores AD/A/B/C cambien en la misma dimensión;
- cada descriptor sea observable y no use adjetivos vagos;
- exista progresión real entre niveles;
- el lenguaje corresponda al grado/modalidad;
- la recomendación derive de la evidencia y del descriptor seleccionado.

Además, la ayuda de IA del calificador redacta una recomendación contextual, pero no constituye un generador validado de la rúbrica completa. La prueba Word actual construye una rúbrica fija dentro del test y solo comprueba que el archivo exista y supere un tamaño; no prueba Gemini, el formulario real, persistencia ni equivalencia de exportación.

## 6. Modelo de validación que falta

Cada herramienta debe tener cuatro capas obligatorias:

1. **Esquema propio:** tipos de datos específicos del producto; no solo secciones narrativas.
2. **Validador determinista:** reglas computables de cantidades, correspondencias, sumas, claves, cuadrículas, tiempos y campos.
3. **Crítico semántico:** segunda revisión estructurada que explique incoherencias pedagógicas concretas; nunca autoaprueba por longitud.
4. **Paridad de salida:** comparación automática entre JSON aprobado, vista previa, Word/PDF/Excel y registro persistido.

Política recomendada:

- P0 fallido: no mostrar ni cobrar como generación exitosa; regenerar una vez con errores concretos y, si vuelve a fallar, devolver un mensaje accionable.
- P1 fallido: permitir borrador marcado “requiere revisión”, identificando campos/secciones.
- P2: advertencia editorial sin bloquear.

## 7. Pruebas mínimas para declarar una herramienta aprobada

Por cada clave `módulo/herramienta`:

1. un caso EBR, uno EBA y uno EBE/EBEE cuando corresponda;
2. primaria y secundaria, además del nivel propio cuando aplique;
3. caso rural y urbano;
4. entrada mínima válida y entrada completa;
5. salida defectuosa simulada que el sistema debe rechazar;
6. llamada al mismo endpoint usado en producción;
7. comprobación de esquema y validador semántico;
8. guardado y reapertura desde backend;
9. render de toda la vista previa;
10. exportación real y extracción del Word/PDF/Excel;
11. comparación de campos y conteos con el JSON aprobado;
12. revisión visual de todas las páginas;
13. prueba responsive y modos claro/oscuro para la interfaz;
14. registro del modelo, contrato, fecha y huella del resultado;
15. dictamen `APROBADA`, `CONDICIONAL` o `BLOQUEADA` con evidencia reproducible.

Un archivo que abre y pesa más de 5 KB solo prueba integridad básica del contenedor; no prueba que sea una buena tarea, rúbrica, sesión, juego o fuente.

## 8. Orden recomendado de corrección

1. Tarea de Extensión y Hogar: esquema propio + exportador de ficha + espacios de trabajo + clave docente.
2. Rúbrica, lista de cotejo, examen, escala y preguntas sobre texto: validadores de evidencia y criterios.
3. Sesión, unidad, PCA y plan de refuerzo: grafo de alineación curricular y coherencia temporal.
4. Fichas, trabajo autónomo y recuperación: actividades resolubles y progresivas.
5. Analíticas/calificadores: cálculos trazables y prohibición de inferencias sin datos.
6. Inclusión y tutoría: barrera/apoyo/evidencia, privacidad y rutas sensibles.
7. Juegos: solución determinista, imprimibilidad e interacción.
8. Presentaciones: composición adaptable, densidad y equivalencia exportada.
9. Normativa y recursos externos: búsqueda verificable, enlaces oficiales y vigencia.
10. Sustituir la “certificación 57” por una matriz generada desde ejecuciones reales.

## 9. Archivos clave que sustentan el diagnóstico

- `frontend/src/config/tools.ts`: inventario visible.
- `frontend/src/config/workflows.ts`: formularios, tipos de artefacto y secciones solicitadas.
- `backend/app/modules/ai/tool_contracts.py`: contratos redactados para cada herramienta.
- `backend/app/modules/ai/service.py`: prompt común, normalización parcial y control de calidad no bloqueante.
- `backend/app/modules/ai/schemas.py`: respuesta compartida entre productos diferentes.
- `frontend/src/features/tools/exportWorkflowDocx.ts`: selección de exportador y pérdida de la actividad de tarea.
- `frontend/src/features/tools/ToolWorkspace.tsx`: rutas evaluativas dedicadas.
- `frontend/src/features/evaluations/rubric/*`: construcción, calificación y persistencia de rúbrica.
- `frontend/src/features/tools/qaExport22TareaExtension.test.ts`: fixture manual de tarea.
- `frontend/src/features/tools/qaExport24Rubrica.test.ts`: fixture manual de rúbrica.
- `AUDIT_REPORT_57.md`: certificación anterior que debe reclasificarse como QA de formato con fixtures, no como auditoría semántica del generador en producción.

## 10. Criterio de cierre

La auditoría se cerrará únicamente cuando las herramientas dejen de aprobar por “tener texto” y aprueben por producir un objeto pedagógico ejecutable, verificable, persistente y exportado sin pérdida. Hasta entonces, el estado global correcto es **NO CERTIFICADO SEMÁNTICAMENTE**.

## 11. Estado verificado de la primera ejecución correctiva

- Backend: 89 pruebas aprobadas y análisis estático sin errores.
- Frontend: 93 archivos de prueba y 171 pruebas aprobadas; compilación de producción correcta y análisis estático sin errores.
- Catálogo: los 58 contratos técnicos registrados rechazan apartados ajenos; la identidad se valida como `módulo/herramienta`.
- Tarea de Extensión y Hogar: vista y Word especializados, consignas resolubles, seis tipos de respuesta y guía docente separada; documento real abierto y revisado en Microsoft Word.
- Preguntas sobre texto: formatos de respuesta acordes, clave separada, criterios antes de responder y dos páginas sin hoja vacía intermedia; documento real abierto y revisado en Microsoft Word.
- Examen: formatos tipados, matriz alineada, puntajes, demanda cognitiva, clave y guía separadas; documento real abierto y revisado en Microsoft Word.
- Navegador: inicio autenticado verificado en escritorio claro/oscuro y móvil 390×844; sin desbordamiento horizontal, menú lateral desplazable y sin errores de consola.
- Servicios locales: frontend, API y documentación responden HTTP 200.

Este estado certifica el núcleo y los pilotos indicados; no reemplaza la matriz pendiente de generación real y exportación individual para cada herramienta.
