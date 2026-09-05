# Plan de corrección responsive y QA visual de las 57 herramientas

**Estado:** ejecución local completada; validación externa pendiente
**Fecha:** 2026-09-05
**Alcance:** aplicación completa, con prioridad en los flujos que generan resultados. Este documento reemplaza cualquier certificación responsive previa para efectos de esta campaña; las capturas anteriores son solo antecedentes y no evidencia de aprobación actual.

## Resultado de la ejecución local

El catálogo contiene **57 capacidades funcionales y 58 rutas auditables** porque `adaptacion-nee-dua` tiene una entrada desde Planificamos y otra desde Incluimos. Ninguna de las 58 rutas fue omitida.

| Suite | Casos | Resultado |
|---|---:|---:|
| Resultado generado · cinco viewports principales · claro · A | 290 | 290 aprobados |
| Entrada sin resultado precargado · cinco viewports principales | 290 | 290 aprobados |
| Resultado generado · cinco viewports principales · oscuro · A | 290 | 290 aprobados |
| Resultado generado · A− y A+ · 320, 390 y 1366 px | 348 | 348 aprobados |
| Resultado generado · 568×320 y 1024×768 | 116 | 116 aprobados |
| **Total local** | **1.334** | **1.334 aprobados · 0 fallidos** |

Comprobaciones adicionales completadas:

- Frontend: lint sin errores, compilación de producción correcta y **183/183 pruebas** aprobadas en 96 archivos.
- Backend: **105/105 pruebas** aprobadas.
- Salud local: frontend, `/api/v1/health` y `/api/v1/ready` respondieron HTTP 200.
- Evidencia: **1.334 capturas**, JSON detallado y Markdown por suite. El informe principal está en `audit/responsive-57-2026-09/resultados-results.md` y la entrada en `audit/responsive-57-2026-09/resultados-smoke.md`.
- El plugin de navegador del flujo original no estaba disponible. La ejecución se realizó con Chrome mediante Puppeteer Core, conservando mediciones de viewport, consola, red, HTTP, recortes, elementos fuera de pantalla y overflow global.

Defectos detectados y corregidos durante el ciclo parche → repetición:

1. Sopa de letras y crucigrama: cuadrículas rígidas sin un contenedor local suficientemente robusto.
2. Sopa de letras en 320 px, tema oscuro y A+: barra de vista previa con 13 px fuera del viewport.
3. Steppers y tablas de instrumentos: desplazamiento local no reconocido o no suficientemente explícito.
4. Presentaciones a 768 px: stepper ancho sin clasificación local en la prueba.
5. Nombre docente y resumen de coherencia: truncamiento por elipsis en lugar de ajuste multilínea.
6. Carpetas de recuperación y registros auxiliares restaurados: no abrían directamente la vista final cuando el instrumento ya estaba generado.
7. Auditor: aislamiento por dispositivo, fixtures especializados, contratos de API simulados y bloqueo por errores de consola, red o HTTP.

Queda fuera de la certificación local y debe ejecutarse antes de publicar:

- Ronda de humo contra preproducción con su URL y CORS reales.
- Una ronda limitada con proveedor IA real, consumo de créditos y respuesta no simulada.
- Verificación manual del archivo descargado en las aplicaciones de destino cuando dependa de software externo.

## Objetivo

Corregir y certificar que Avendia funcione sin contenido recortado, superpuesto o inaccesible en todos los tamaños representativos. La revisión debe abarcar las 57 herramientas funcionales y sus estados reales: entrada de datos, avance entre pasos, generación, resultado, edición, exportación y error o vacío cuando aplique.

El caso de la **Sopa de letras** es un detector prioritario: si al generar la cuadrícula se corta, no basta con ajustar esa vista. Se debe identificar si la causa está en el contenedor de la vista previa, el papel de documento, la cuadrícula, las barras de acciones o el layout global, y aplicar la corrección compartida cuando corresponda.

## Principios de corrección

1. No se acepta una prueba que solo abra la ruta: debe llegar al resultado generado con datos de ejemplo válidos.
2. No se oculta contenido esencial para hacer que una pantalla “quepa”.
3. Tablas, calendarios, cuadrículas y documentos de ancho intrínseco usan desplazamiento o escala **local**, claramente visible y operable; nunca causan desplazamiento horizontal de toda la página.
4. Primero se corrigen componentes, estilos y contenedores compartidos; después, solo las excepciones propias de una herramienta.
5. Los cambios deben conservar la lectura, la interacción táctil, el teclado, el tema claro/oscuro y los tamaños de texto A−, A y A+.
6. Una herramienta se aprueba únicamente con capturas, mediciones automáticas y una interacción real registrada para cada estado crítico.

## Matriz obligatoria de dispositivos

| Perfil | Viewport | Finalidad |
|---|---:|---|
| Móvil compacto | 320 × 568 | Detectar mínimos rígidos, controles inaccesibles y cortes en alturas reducidas. |
| Móvil estándar | 390 × 844 | Representar teléfonos actuales y validar uso táctil normal. |
| Tableta vertical | 768 × 1024 | Validar el punto de transición entre una y dos columnas. |
| Laptop | 1366 × 768 | Detectar paneles, barras y diálogos que fallan en altura baja. |
| Escritorio amplio | 1920 × 1080 | Validar distribución, longitudes máximas y que el contenido no se estire indebidamente. |

Pruebas complementarias obligatorias:

- 568 × 320 (móvil horizontal) para menú, diálogos, teclado visual y barras de acciones.
- 1024 × 768 (tableta/laptop pequeña) para tablas, barras laterales y steppers.
- Tema claro y oscuro en todos los perfiles.
- A−, A y A+ al menos en móvil 320, móvil 390 y laptop 1366.

## Qué se revisa en cada herramienta

Para cada ruta se ejecutarán los siguientes estados, con evidencia separada:

| Estado | Comprobación mínima |
|---|---|
| Entrada | Encabezado, campos, selector de modalidad, botones y textos legibles. |
| Paso intermedio | Stepper, validaciones, retroceso sin pérdida de datos y acciones alcanzables. |
| Generación | Capa de progreso completa, texto no truncado, sin bloqueo del botón de salida. |
| Resultado | Artefacto completo, acciones de editar/regenerar/guardar/exportar y ausencia de corte. |
| Interacción propia | Ejercicio, tabla, gráfico, correo, panel, rúbrica o control específico realmente accionado. |
| Exportación | Descarga o generación iniciada; el botón sigue visible y el archivo o vista no rompe el layout. |
| Estados alternativos | Vacío, error de validación o carga cuando esa herramienta los tenga. |

## Inventario obligatorio de las 57 herramientas

La adaptación NEE/DUA se abre desde dos módulos, pero es una única capacidad funcional. Se auditan ambas rutas porque sus contenedores y navegación pueden diferir.

### Planificamos

| # | Ruta | Estado de resultado que se debe fotografiar |
|---:|---|---|
| 1 | `planificamos/plan-curricular-anual` | Documento extenso con tablas y barra de acciones. |
| 2 | `planificamos/unidad-aprendizaje` | Documento de unidad, cronograma y evidencias. |
| 3 | `planificamos/sesion-aprendizaje` | Sesión, tiempos, criterios y recursos. |
| 4 | `planificamos/situacion-significativa` | Reto, preguntas y evidencia. |
| 5 | `planificamos/proyectos-integrados` | Proyecto ABP, fases y cronograma. |
| 6 | `planificamos/adaptacion-nee-dua` | Barreras, apoyos y tabla de seguimiento. |
| 7 | `planificamos/tarea-extension-hogar` | Ficha imprimible con instrucciones y actividades. |
| 8 | `planificamos/carpeta-pedagogica` | Índice y secciones documentales extensas. |

### Evaluamos

| # | Ruta | Estado de resultado que se debe fotografiar |
|---:|---|---|
| 9 | `evaluamos/rubrica-evaluacion` | Matriz de rúbrica editable. |
| 10 | `evaluamos/lista-cotejo` | Tabla de estudiantes, indicadores y observaciones. |
| 11 | `evaluamos/ficha-aprendizaje` | Ficha imprimible de práctica guiada. |
| 12 | `evaluamos/examen` | Preguntas, puntajes y clave docente. |
| 13 | `evaluamos/escala-estimacion` | Tabla de indicadores y niveles. |
| 14 | `evaluamos/preguntas-texto` | Lectura, preguntas y clave. |
| 15 | `evaluamos/ficha-observacion` | Registro de conductas y evidencias. |
| 16 | `evaluamos/registros-auxiliares` | Registro denso por estudiante y periodo. |
| 17 | `evaluamos/carpetas-recuperacion` | Actividades y metas de recuperación. |
| 18 | `evaluamos/calificador-rubrica` | Evidencia, criterio y nivel sugerido. |
| 19 | `evaluamos/retroalimentacion-formativa` | Devolución y acciones de copiar/exportar. |
| 20 | `evaluamos/analytics-alertas` | Gráficos, alertas y lista de acciones. |

### Incluimos

| # | Ruta | Estado de resultado que se debe fotografiar |
|---:|---|---|
| 6b | `incluimos/adaptacion-nee-dua` | Misma capacidad NEE/DUA desde esta entrada. |
| 21 | `incluimos/plan-atencion` | Diagnóstico, responsables y fechas. |
| 22 | `incluimos/estrategias-inclusion` | Estrategias seleccionadas y ficha. |
| 23 | `incluimos/trabajo-familias` | Acuerdos, pautas y seguimiento. |
| 24 | `incluimos/seguimiento-evaluacion` | Avances, reajustes y evidencias. |

### Reforzamos

| # | Ruta | Estado de resultado que se debe fotografiar |
|---:|---|---|
| 25 | `reforzamos/trabajo-autonomo` | Ruta semanal y actividades. |
| 26 | `reforzamos/carpeta-recuperacion` | Actividades graduadas y control. |
| 27 | `reforzamos/monitorea-avances` | Gráficos, tendencias y filtros. |
| 28 | `reforzamos/acompanamiento-motivacion` | Mensaje, reconocimiento y acuerdos. |
| 29 | `reforzamos/plan-refuerzo` | Plan de sesiones, recursos e hitos. |

### Acompañamos

| # | Ruta | Estado de resultado que se debe fotografiar |
|---:|---|---|
| 30 | `acompanamos/correo-familias` | Correo redactado y acciones de copia. |
| 31 | `acompanamos/respuesta-correo` | Respuesta, acuerdo y próximo paso. |
| 32 | `acompanamos/analytics-alertas` | Alertas, responsables y acciones. |
| 33 | `acompanamos/calificador-ia` | Evidencia y decisión docente. |
| 34 | `acompanamos/reporte-seguimiento` | Reporte formal y exportación. |

### Tutoría

| # | Ruta | Estado de resultado que se debe fotografiar |
|---:|---|---|
| 35 | `tutoria/plan-tutoria` | Plan anual, sesiones y cronograma. |
| 36 | `tutoria/sesiones-tutoria` | Sesión con dinámica y preguntas. |
| 37 | `tutoria/informe-tutoria` | Informe institucional extenso. |
| 38 | `tutoria/informe-padres` | Comunicación para familias. |
| 39 | `tutoria/fichas-acompanamiento` | Entrevista, acuerdos y seguimiento. |
| 40 | `tutoria/alertas-casos` | Registro protegido y acciones. |
| 41 | `tutoria/recursos-tutoria` | Recurso, ficha y acciones. |
| 42 | `tutoria/orientacion-vocacional` | Perfil y plan de acción. |

### Recursos

| # | Ruta | Estado de resultado que se debe fotografiar |
|---:|---|---|
| 43 | `recursos/presentaciones-didacticas` | Diapositivas, controles de navegación y exportación. |
| 44 | `recursos/tarjetas-estudio` | Tarjetas, reverso y desplazamiento. |
| 45 | `recursos/agrupar-palabras` | Categorías, banco y comprobación. |
| 46 | `recursos/ordenar-bloques` | Bloques reordenables y justificación. |
| 47 | `recursos/casos-estudio` | Caso, preguntas y guía docente. |
| 48 | `recursos/ahorcado` | Tablero, intentos, pista y reinicio. |
| 49 | `recursos/completa-frase` | Enunciados, banco de palabras y comprobación. |
| 50 | `recursos/emparejar-palabras` | Pares, explicación y comprobación. |
| 51 | `recursos/debate-aula` | Moción, roles, reglas y rúbrica. |
| 52 | `recursos/crucigramas` | Cuadrícula, pistas, solución y controles. |
| 53 | `recursos/sopas-letras` | Cuadrícula de máximo tamaño, pistas, banco y solución. |
| 54 | `recursos/banco-planificacion` | Resultados, favoritos y acciones. |
| 55 | `recursos/normativa-educativa` | Resultado de consulta y fuente. |
| 56 | `recursos/libros-guia-minedu` | Recurso, filtros y acciones. |
| 57 | `recursos/canales-audiovisuales` | Recomendaciones, accesibilidad y uso didáctico. |

## Estrategia de pruebas automatizadas

### 1. Pruebas de navegador nuevas

Crear una suite de navegador estable para la campaña, sin depender de capturas manuales en `scratch`:

- `frontend/e2e/responsive/catalog.spec.ts`: inicio, módulos, búsqueda, sidebar, topbar, diálogos y rutas de utilidades.
- `frontend/e2e/responsive/workflows.spec.ts`: las 58 rutas registradas que representan las 57 capacidades; completar datos de prueba, navegar y abrir el resultado.
- `frontend/e2e/responsive/interactive-resources.spec.ts`: 15 recursos, con énfasis en acciones de juego y cuadrículas.
- `frontend/e2e/responsive/global-layout.spec.ts`: medición de overflow, elementos fuera de viewport, botones superpuestos, foco y errores de consola.
- `frontend/e2e/fixtures/`: datos deterministas de generación, nómina y respuestas simuladas para que cada captura sea repetible.

#### Requisito de integración de la suite

El proyecto cuenta hoy con pruebas unitarias y scripts de captura en `frontend/scratch`, pero no con una suite E2E formal incluida en los comandos del proyecto. Antes de iniciar la certificación se debe implementar esta base:

1. Elegir y configurar un único ejecutor de navegador para el repositorio. Se prioriza la integración de navegador disponible; si no puede utilizarse en automatización, se empleará Puppeteer Core, que ya existe como dependencia, o se incorporará Playwright con sus navegadores de forma explícita.
2. Añadir configuración versionada de dispositivos, navegador, servidor local, capturas, vídeos o trazas ante fallo, reintentos controlados y carpeta de resultados excluida de los artefactos de producción.
3. Añadir comandos visibles en `frontend/package.json`: `test:e2e`, `test:responsive` y `test:responsive:update-baseline`. El último solo podrá actualizar imágenes de referencia tras revisión humana.
4. Hacer que `test:responsive` levante o compruebe frontend y API, prepare fixtures, ejecute los viewports obligatorios y falle si falta una ruta, una captura de resultado, una medición o una interacción crítica.
5. Configurar una ejecución rápida por cambio para componentes compartidos y una ejecución completa programada o previa a publicación. Ninguna publicación se certifica únicamente con `npm run test`, `npm run lint` o `npm run build`.
6. Mantener los scripts actuales de `scratch` como antecedentes o ayudas de diagnóstico, pero no usarlos como única evidencia ni como sustituto de las pruebas E2E versionadas.

La herramienta de navegador deberá usar el flujo integrado disponible. Si no está disponible, se documentará el motivo y se usará el ejecutor configurado en el repositorio; no se declarará una prueba como aprobada por una compilación solamente.

### 2. Aserciones obligatorias por captura

Cada caso debe comprobar, además de guardar la imagen:

```text
document.documentElement.scrollWidth <= document.documentElement.clientWidth
elemento principal: boundingBox.left >= 0 y boundingBox.right <= viewport.width
acción primaria: visible, habilitada cuando corresponde y con área táctil aproximada de 44 × 44 px en móvil
sin overlay de Vite/React y sin errores relevantes de consola
contenedor de tabla/cuadrícula: overflow local permitido y operable, no overflow global
```

Las excepciones de ancho solo se permiten en una lista versionada de selectores y deben incluir la razón pedagógica, el selector del scroll local y una prueba de interacción horizontal.

### 4. Datos de estrés y estados no ideales

Cada flujo se ejecutará con datos normales y con el caso más exigente que permita la herramienta. Las pruebas no pueden limitarse a textos cortos o a resultados pequeños.

| Categoría | Datos o situación obligatoria |
|---|---|
| Texto | Títulos, nombres de institución, correos, competencias, instrucciones y observaciones extensas; palabras largas sin espacios cuando sean datos válidos. |
| Listas y tablas | Máxima cantidad de estudiantes, indicadores, columnas, criterios, periodos, filas y observaciones permitida. |
| Recursos visuales | Imágenes grandes, títulos largos, referencias extensas y resultados con múltiples tarjetas o diapositivas. |
| Juegos | Máximo de palabras, pistas extensas, dificultad más alta, solución visible y reinicio posterior. |
| Formularios | Validación vacía, datos incompletos, datos corregidos, paso atrás, recarga y recuperación de borrador. |
| Red y servidor | Carga lenta, error recuperable, respuesta vacía, generación fallida y sesión vencida, sin que la interfaz quede bloqueada. |
| Exportación | Archivo grande o documento con tablas extensas; acción de descarga visible y estado recuperable ante un fallo. |

Cada dato de estrés debe pertenecer a un fixture versionado. Se prohíbe aprobar una vista de resultado si fue generada con contenido reducido que no representa el máximo real de esa herramienta.

### 5. Persistencia y continuidad docente

Para cada familia de flujo se comprobará esta secuencia:

1. Completar información suficiente para avanzar y guardar un borrador.
2. Cambiar de tamaño de pantalla y confirmar que el contenido y la acción activa continúan accesibles.
3. Recargar la página, volver desde Historial cuando aplique y confirmar que el borrador o resultado no se perdió.
4. Editar un resultado, regenerar una sección cuando exista esa acción y comprobar que no se rompe el layout ni se elimina contenido ajeno.
5. Descargar o copiar el resultado y regresar a la herramienta sin perder el estado esperado.

## Ciclo autónomo de auditoría, reparación y verificación

La suite no debe limitarse a informar un error. Se implementará un orquestador de QA que pueda investigar y proponer o aplicar correcciones de interfaz de bajo riesgo, pero que jamás apruebe una ruta sin verificarla de nuevo. El objetivo es reducir trabajo repetitivo sin convertir una ausencia superficial de error en una certificación falsa.

### Flujo obligatorio por caso

```text
Abrir ruta → completar datos → generar resultado → medir, interactuar y capturar
      ↓
¿Falla overflow, corte, solapamiento, error, foco o interacción?
      ↓ no                                      ↓ sí
Registrar evidencia de aprobación        Clasificar causa y registrar defecto
                                            ↓
                                  Aplicar un parche acotado permitido
                                            ↓
                         Compilar + pruebas afectadas + prueba de navegador
                                            ↓
                       Repetir mismo caso, viewport, tema y acción original
                                            ↓
                                  ¿Toda la evidencia vuelve a aprobar?
                                            ↓ sí                    ↓ no
                              Guardar antes/después y continuar   Reintentar o bloquear
```

Una ruta solo puede pasar a la siguiente cuando el ciclo termina con evidencia positiva. Si el ciclo se bloquea, puede continuar la auditoría de otras rutas, pero la certificación global queda bloqueada hasta resolver el defecto o registrar una excepción aprobada explícitamente.

### Detectores automáticos obligatorios

En cada navegación y después de cada interacción, la suite debe detectar y registrar:

- `scrollWidth` global mayor que el ancho disponible, excepto en selectores declarados con desplazamiento local permitido.
- Elementos visibles fuera del viewport, texto cortado, imágenes rotas, áreas superpuestas y barras fijas que cubren contenido.
- Botones principales invisibles, deshabilitados sin explicación, demasiado pequeños o sin respuesta al toque/teclado.
- Pérdida de foco, trampas de teclado, diálogos sin cierre y scroll atrapado.
- Overlay de framework, pantalla en blanco, error de consola, petición HTTP fallida, carga que no termina y cambio de ruta inesperado.
- Diferencia visual fuera de la tolerancia aprobada con respecto a la imagen base.
- Resultado incompleto: artefacto sin secciones requeridas, tabla vacía, actividad no operable o descarga no disponible cuando el flujo la promete.

Los detectores deben guardar captura, DOM relevante, URL, viewport, tema, identidad de prueba, errores de consola, red y mediciones. “No se detectó error” no es un resultado aprobado si faltan interacción y evidencia del resultado.

### Clasificación antes de modificar

Antes de aplicar cualquier parche, el orquestador debe crear un diagnóstico breve:

| Clasificación | Ejemplos | Alcance de regresión obligatorio |
|---|---|---|
| Layout global | app shell, sidebar, topbar, safe area, scroll de página | Todas las rutas y tamaños principales. |
| Patrón compartido | formulario, stepper, diálogo, tabla, vista Word, barra de acciones | Todas las herramientas y páginas que usan ese patrón. |
| Herramienta específica | sopa de letras, crucigrama, presentación, rúbrica | Herramienta completa y recursos o componentes equivalentes. |
| Servicio o datos | API, sesión, IA, exportación, permisos | Flujo afectado, error asociado y regresión de la interfaz que muestra ese estado. |

No se admite un parche de una herramienta para tapar un defecto de contenedor global sin documentar por qué no corresponde una corrección compartida.

### Cambios que el ciclo puede y no puede realizar automáticamente

**Permitidos, con validación posterior obligatoria:** CSS de layout, breakpoints, `min-width`, `max-width`, `minmax(0, 1fr)`, padding, gap, wrap, scroll local, tamaño de celdas, escala de cuadrícula, z-index, safe areas, alturas dinámicas, foco visible y etiquetas de ayuda responsive.

**Prohibidos sin revisión humana explícita:** modificar reglas pedagógicas, contenidos generados, datos de estudiantes, permisos, créditos, precios, autenticación, contratos de API, migraciones, reglas de negocio, borrado de información o cualquier secreto/configuración de producción.

Cada parche debe ser el cambio más pequeño posible, estar asociado a un defecto y conservar la funcionalidad original. No se permite ocultar, eliminar o deshabilitar contenido esencial para hacer que una captura pase.

### Verificación posterior a cada parche

1. Ejecutar análisis estático, pruebas unitarias afectadas y compilación.
2. Repetir el mismo flujo que falló: mismo fixture, usuario, viewport, orientación, tema, zoom y acción.
3. Capturar antes y después; comprobar que desapareció el defecto y que no se perdió información ni interacción.
4. Ejecutar regresión de la clasificación correspondiente: global, patrón, herramienta o servicio.
5. Actualizar la línea base solo si un revisor confirma que el cambio es intencional y correcto.
6. Adjuntar al defecto los archivos modificados, comandos ejecutados, mediciones y resultado de cada prueba.

### Límites, bloqueo y honestidad de resultados

- Máximo de **tres** intentos automáticos por defecto; tras el tercero se crea un bloqueo con diagnóstico, evidencia, cambios intentados y propuesta de siguiente paso.
- Si una prueba falla por infraestructura, API no disponible o fixture inválido, se marca **bloqueada por entorno**, nunca aprobada ni omitida.
- Si una ruta no se pudo generar, no tiene captura de resultado o no ejecutó su interacción principal, queda **pendiente**, no “correcta”.
- Una corrección solo se considera resuelta si la ejecución posterior contiene verificación visual, interacción, consola y medición aprobadas.
- La matriz debe diferenciar con claridad: `aprobada con evidencia`, `fallida`, `bloqueada`, `pendiente` y `excepción aprobada`. No usar estados ambiguos como “parece bien”.

### Modos de ejecución

| Modo | Permisos | Resultado |
|---|---|---|
| Auditoría | Solo lectura y capturas. | Inventario completo de defectos, sin modificar código. |
| Reparación asistida | Aplica únicamente cambios permitidos de interfaz. | Parche, pruebas posteriores, evidencia antes/después o bloqueo. |
| Certificación | No aplica parches nuevos. | Recorre todo el catálogo y produce el estado final verificable. |

Primero se ejecuta auditoría para conocer la totalidad de fallos; después reparación asistida por familias; al final certificación desde un entorno limpio. La certificación no puede reutilizar resultados de una ejecución previa a un parche.

## Calidad preventiva, estabilidad y gobernanza de pruebas

Además de encontrar defectos en el navegador, el plan debe prevenir que se introduzcan y demostrar que las pruebas son confiables, reproducibles y seguras.

### Matriz de requisito, prueba y evidencia

Crear `audit/responsive-57-2026-09/cobertura.md` con una fila por requisito verificable. Cada fila debe enlazar la capacidad, ruta, estado, viewport, prueba automatizada, fixture, captura, medición y resultado. La suite debe fallar si algún requisito crítico no tiene prueba o evidencia vigente.

| Requisito | Prueba mínima | Evidencia exigida |
|---|---|---|
| Sin overflow global | Medición de `scrollWidth` en cada estado. | Valor medido, selector autorizado si existe scroll local y captura. |
| Acción principal accesible | Toque/clic y teclado en viewport móvil. | Estado posterior observable y tamaño del control. |
| Resultado completo | Generación con fixture de máxima densidad. | Captura del artefacto y validación de secciones. |
| Exportación correcta | Descargar o imprimir la salida disponible. | Archivo/impresión comprobable y estado de interfaz posterior. |
| Corrección sin regresión | Repetición del caso original y de rutas relacionadas. | Antes/después, pruebas de regresión y diff visual revisado. |

### Reglas estáticas antes del navegador

Incorporar una revisión de CSS/TSX que señale, como mínimo:

- `min-width`, `width`, `height` o márgenes rígidos que excedan los tamaños admitidos sin una excepción documentada.
- `100vh` en paneles, diálogos o overlays donde se requiere altura dinámica segura.
- `overflow: hidden` que pueda cortar tablas, cuadrículas, diálogos o resultados.
- `position: fixed` o `sticky` sin límites de safe area, prueba de teclado o verificación de superposición.
- z-index arbitrarios o fuera de la escala de capas definida por la aplicación.
- uso de `hover` como única forma de revelar una acción crítica.
- imágenes sin dimensiones, contenedores responsivos o texto alternativo cuando corresponda.

La regla estática no reemplaza las capturas; bloquea tempranamente patrones de alto riesgo y exige justificar por escrito las excepciones.

### Fixtures aleatorios, reproducibles y sin datos privados

- Mantener datos base ficticios, sin nombres ni información real de estudiantes, familias o docentes.
- Generar variaciones de texto largo, caracteres con tildes, idiomas o nombres válidos extensos, tablas densas y actividades máximas mediante una semilla registrada.
- En cada falla, guardar semilla y fixture exacto para repetirla localmente y en integración.
- Las capturas finales no pueden revelar tokens, correos reales, identificadores personales ni contenido sensible de casos tutoriales.
- Restablecer base de datos y almacenamiento de navegador entre rondas para impedir que un caso aprobado dependa de datos residuales.

### Resiliencia de almacenamiento, navegación y solicitudes duplicadas

Probar estas condiciones por cada familia que guarda o genera contenido:

1. `localStorage` lleno, corrupto, deshabilitado o con borrador de versión anterior.
2. Recarga, cierre de pestaña, navegación atrás y cambio de ruta durante generación, guardado, exportación o importación.
3. Doble clic, toque repetido o dos solicitudes simultáneas de generar, guardar, descargar, eliminar o restaurar.
4. Reintento después de error, reconexión de red y respuesta lenta.

La aplicación debe evitar duplicados, cobros repetidos, pérdida silenciosa de borrador y botones permanentemente bloqueados. Cuando no pueda continuar, debe comunicar el estado y ofrecer una acción de recuperación.

### Accesibilidad y preferencias del dispositivo

- Integrar evaluación automatizada de accesibilidad para roles, nombres accesibles, etiquetas, estructura de encabezados, contraste y foco; cualquier hallazgo crítico bloquea la aprobación.
- Ejecutar casos con `prefers-reduced-motion`, alto contraste, modo oscuro del sistema y escala DPI de Windows.
- Probar que animaciones, loaders y transiciones no impidan leer, pulsar, cerrar o continuar; debe existir una alternativa sin depender del movimiento.
- Comprobar idiomas, acentos y longitudes de texto propias de EBR, EBA y EBE sin degradar la tipografía o el orden de lectura.

### Dispositivos físicos y política de pruebas inestables

- Además de emulación, realizar una ronda de aceptación en al menos un Android físico; incluir iPhone/iPad físico si esos dispositivos forman parte del público objetivo.
- Registrar modelo, sistema operativo, navegador, orientación, zoom y conexión de cada prueba física.
- Repetir los casos críticos al menos tres veces. Un fallo intermitente se registra como defecto; no se elimina con un reintento exitoso.
- Clasificar la causa de una prueba inestable: aplicación, red, fixture, entorno o automatización. Corregir la causa o bloquear la certificación; no aumentar reintentos para ocultarla.

### Reversión segura y presupuesto de calidad

- Cada parche automático debe ser una unidad reversible con defecto, diff, evidencia previa y resultado posterior asociado.
- Si un parche produce una regresión, revertir únicamente esa unidad, conservar su evidencia y devolver el defecto a estado abierto.
- Definir antes de ejecutar los presupuestos máximos de peso inicial, tiempo de carga, respuesta al toque, generación, exportación, diferencia visual y tasa de inestabilidad permitida.
- Si un presupuesto se excede, la ruta queda fallida aunque visualmente parezca correcta.

### Revisión humana y definición de listo para publicación

La automatización detecta, propone y verifica, pero no sustituye la aprobación visual final. Un revisor debe recorrer la galería de resultados de las 57 herramientas y aprobar explícitamente las nuevas imágenes base y excepciones documentadas.

Una versión solo queda lista para publicación si aprueba simultáneamente:

- Responsive y evidencia de todos los estados exigidos.
- Accesibilidad, interacción por teclado y toque.
- Flujos de backend, sesión, permisos, guardado, IA y exportaciones.
- Pruebas unitarias, E2E, regresión visual, revisión estática, lint y compilación.
- Presupuestos de rendimiento y estabilidad.
- Revisión humana final sin defectos críticos, altos ni requisitos pendientes.

## Cobertura de apartados que no pertenecen a las 57 herramientas

La certificación también debe cubrir las superficies que permiten utilizar las herramientas; si alguna falla, un docente no podrá completar el flujo aunque el resultado sea responsive.

| Área | Rutas, estados o interacciones mínimas |
|---|---|
| Acceso | Inicio de sesión, registro, recuperación de contraseña, validaciones y mensajes de error. |
| Inicio | Dashboard, herramientas frecuentes, filtros, búsqueda, historial y tarjetas con textos largos. |
| Navegación global | Sidebar expandido/contraído, menú móvil, topbar, búsqueda, notificaciones, tema, control tipográfico y perfil. |
| Gestión docente | Perfil institucional, Mis estudiantes, creación/edición de aula, importación y tablas de nómina. |
| Utilidades | Calendario, historial, videos tutoriales, ideas y mejoras, Sube tu formato, referidos y comunidad activa. |
| Administración | Resumen, usuarios, consumo IA, contenido, auditoría, configuración, cajón lateral y permisos. |
| Superficies transversales | Diálogos, confirmaciones, toasts, carga, errores, vacíos, panel de IA, borradores, exportación y vista previa Word/PDF. |

Estas rutas tendrán la misma matriz de dispositivos, temas, mediciones de overflow y evidencia visual. No se cerrará la campaña si alguna barra global, diálogo o página de apoyo bloquea los flujos docentes.

## Accesibilidad, orientación y compatibilidad

### Accesibilidad operativa

- Recorrer con `Tab` y `Shift+Tab` cada acción principal; el foco debe ser visible y no quedar detrás de un panel fijo.
- Verificar `Escape` para cerrar diálogos y paneles, retorno del foco al disparador y ausencia de trampas de teclado.
- Confirmar etiquetas accesibles, orden lógico de lectura, contraste suficiente en ambos temas y mensaje de error asociado al campo.
- Medir controles táctiles en móvil: área objetivo de aproximadamente 44 × 44 px, separación suficiente y sin acciones críticas pegadas al borde.

### Orientación, zoom y teclado virtual

- Probar 568 × 320 con menú móvil, formularios extensos, panel de IA y diálogos abiertos.
- Simular el teclado virtual enfocando los últimos campos y la acción final: el campo activo y el botón de continuar o guardar deben poder alcanzarse.
- Comprobar zoom de navegador al 200 % y tamaños A−/A/A+ en las rutas más densas: tablas, resultados Word, analíticas, sopa de letras, crucigrama y administración.
- Incluir `safe-area-inset` y `100dvh` en los criterios de revisión para dispositivos con recorte de pantalla.

### Compatibilidad de navegador

- Certificar Chrome y Edge en Windows como mínimo.
- Ejecutar una ronda móvil en Chrome Android o emulación equivalente y una ronda en Safari/iOS cuando el producto vaya a utilizarse en iPhone o iPad.
- Cada diferencia de motor debe registrarse como defecto independiente: una aprobación en Chrome no cubre automáticamente Safari.

## Adaptación continua, no solo cinco tamaños fijos

Los cinco perfiles principales son puntos de evidencia, pero no representan todos los anchos reales. La interfaz deberá adaptarse fluidamente entre ellos y conservar la funcionalidad cuando el espacio disponible cambie por orientación, zoom, paneles o ventanas divididas.

### Barrido automático de ancho

1. Ejecutar un barrido de viewport de 280 a 1920 px, al menos cada 40 px; reducir el salto a 20 px alrededor de los breakpoints y de cualquier fallo detectado.
2. En cada punto medir overflow global, elementos recortados, superposición de acciones fijas, campos demasiado estrechos y visibilidad del botón principal.
3. Al detectar un fallo, guardar automáticamente la captura, el ancho exacto, el selector involucrado y el cálculo de sus límites; el defecto no se registrará solamente como “falla en móvil”.
4. Añadir una prueba de regresión en el ancho mínimo que falló, además de los viewports principales.

### Orientación, pantallas divididas y plegables

- Probar anchos de 280–360 px para móviles compactos y estados plegados.
- Probar 540–720 px para móvil horizontal, plegables y pantallas divididas en tableta.
- Iniciar una generación, abrir una cuadrícula o editar una tabla en vertical; cambiar a horizontal y volver a vertical sin perder borrador, scroll útil, foco ni controles.
- Probar aplicación con sidebar, búsqueda, copiloto o panel contextual abierto, porque reducen el ancho efectivo aunque el viewport no cambie.
- Todos los paneles internos usarán `min-width: 0`, grillas fluidas y, donde aplique, consultas de contenedor; no deben depender únicamente de breakpoints globales.

### Zoom, texto del sistema y primera pantalla

- Probar navegador a 80 %, 100 %, 125 %, 150 % y 200 %, además de A−/A/A+.
- El primer pantallazo de cada flujo debe mostrar contexto, título y una acción de continuación clara sin que un encabezado o barra fija ocupe todo el alto útil.
- Revisar retornos de historial, impresión, descarga y edición: la aplicación debe recuperar una posición de scroll útil y nunca dejar el foco detrás de una cabecera, teclado o panel fijo.
- Las fuentes, títulos y mensajes deben envolver o ajustar su escala sin truncarse; una fuente lenta o fallida no puede desplazar el layout de forma que corte acciones.

### Toque, puntero y zonas seguras

- Ninguna función debe depender de `hover`: pistas, menús, acciones secundarias y controles de juego deben estar disponibles por toque y teclado.
- Validar arrastrar y soltar, selección de palabras, desplazamiento de cuadrículas y edición de tablas con touch, mouse y lápiz cuando el dispositivo lo soporte.
- Probar áreas seguras de iOS/Android: botones flotantes, notificaciones, barras inferiores, diálogos y panel de IA deben respetar `env(safe-area-inset-*)` y no tapar campos o acciones.
- Usar alturas dinámicas seguras (`100dvh` cuando corresponda) para que teclado virtual, barra del navegador y cambio de orientación no oculten la acción crítica.

### Rendimiento y estabilidad de dispositivos modestos

- Simular CPU limitada y red lenta en móvil para resultados de máxima densidad: sopa de letras, crucigrama, presentación, documento con tablas, nómina grande y analítica.
- Medir tiempo de interacción después de generar, desplazar, abrir solución y exportar; un artefacto no se aprueba si congela el navegador o retrasa significativamente el toque.
- Cargar imágenes lentas, ausentes o pesadas y confirmar espacios reservados, texto legible y acciones disponibles.
- Definir presupuestos de rendimiento y peso de recursos antes de ejecutar la certificación; una regresión de rendimiento bloquea la salida aunque la captura se vea correcta.

### Impresión y formatos de salida

- Verificar vistas imprimibles en A4 y carta, vertical y horizontal, incluyendo páginas con tablas, cuadrículas, tarjetas y solucionarios.
- Confirmar que al imprimir no aparecen sidebar, controles de edición, botones ni contenido cortado por salto de página evitable.
- Mantener las pruebas de pantalla y las de impresión como dos aprobaciones distintas: un resultado responsive no se da por correcto hasta que ambas pasen cuando ofrezca PDF o Word.

## Prueba de estrés docente

Además de las pruebas automatizadas, se realizará una prueba manual por cada módulo con el siguiente recorrido completo, sin herramientas de desarrollador:

1. Entrar desde un móvil 390 × 844 como docente autenticado.
2. Buscar o navegar hasta una herramienta del módulo.
3. Completar el formulario, guardar borrador, generar el resultado y revisar el artefacto.
4. Editar o interactuar con el resultado, descargar o copiar la salida y volver al inicio.
5. Repetir con una herramienta documental y una herramienta interactiva por módulo.

La prueba se rechaza si el docente necesita reducir el zoom, girar el teléfono, recargar para desbloquear la pantalla, usar scroll horizontal de toda la página o adivinar cómo acceder a una acción.

## Regresión visual y control de calidad continuo

1. Conservar una imagen base aprobada por ruta, estado, viewport y tema.
2. En cada cambio de estilos compartidos, ejecutar comparación visual contra la línea base y revisar manualmente las diferencias relevantes.
3. Ninguna diferencia se aprueba automáticamente: se clasifica como mejora intencional, variación permitida o regresión.
4. Mantener una lista de excepciones visuales con fecha de vencimiento; una excepción nunca debe ocultar un corte de contenido o una acción inaccesible.
5. Añadir la suite responsive al control previo a publicación para impedir que un cambio futuro vuelva a cortar una cuadrícula, una tabla o una barra de acciones.

## Cobertura derivada de la arquitectura real

La revisión del código confirma que no todas las herramientas comparten el mismo componente ni el mismo servicio. Por tanto, la campaña debe probar las variantes reales de la aplicación y sus contratos de servidor, no asumir que una corrección de `WorkflowTool` cubre por sí sola toda la plataforma.

### Variantes de frontend que requieren recorridos propios

| Superficie real | Motivo de prueba independiente | Recorrido obligatorio |
|---|---|---|
| `WorkflowTool` | Aloja la mayoría de herramientas de flujo, borradores locales, historial, copiloto, edición, regeneración y exportación. | Formulario → guardado → IA → edición de sección o tabla → descarga → reapertura desde historial. |
| Plan Curricular Anual | Tiene implementación y vista previa documental propias. | Formulario extenso → tablas editables → impresión/PDF → recarga. |
| Presentaciones didácticas | Editor cargado de forma diferida y tres salidas: PPTX, PDF e historia/guion. | Generar → navegar diapositivas → exportar PPTX/Word → imprimir → copiar. |
| Agrupar palabras | Actividad interactiva propia con arrastre, guardado y Word. | Generar → clasificar → comprobar → guardar → descargar. |
| Ordenar bloques | Actividad interactiva y exportador propios. | Generar → reordenar → comprobar → justificación → descargar. |
| Rúbrica, lista de cotejo, observación, registros y recuperación | Instrumentos de evaluación con tablas, selección de estudiantes y exportadores distintos. | Crear o seleccionar nómina → editar tabla densa → guardar → exportar → recuperar. |
| Vistas Word/PDF e impresión | Algunos resultados usan `window.print`, otros generan el archivo en el navegador y otros lo reciben del API. | Abrir vista → controlar barra de acciones → imprimir/descargar → comprobar que el diálogo o archivo no oculta el contenido. |
| Carga diferida | Administración, presentaciones y nómina muestran pantallas de carga mientras se descarga el módulo. | Navegar con red lenta → verificar estado de carga legible y sin salto o pantalla vacía. |

### Contratos de API y fallos que deben verse correctamente en la interfaz

Las pruebas de navegador deben interceptar o usar entornos controlados para ejecutar cada respuesta. La aceptación se basa en el comportamiento visible: mensaje entendible, acción de recuperación, estado coherente y layout intacto.

| Servicio existente | Escenarios que se deben incorporar |
|---|---|
| Generación IA (`/ai/tools/*`) | Éxito, demora, cancelación cuando exista, 402 sin créditos, 502 de proveedor, 503 de configuración, respuesta de contenido inválido o calidad bloqueada. Confirmar que no se descuenta o duplica crédito visualmente de forma errónea y que el docente puede reintentar. |
| Documentos (`/documents`) | Crear, actualizar, borrar a papelera, recuperar, restaurar versión y conflicto 409 por edición en otra sesión. La interfaz debe preservar el contenido local y explicar cómo resolver el conflicto. |
| Autenticación | Token vencido/401, inicio de sesión inválido, cuenta inactiva, registro duplicado y recuperación de contraseña. Confirmar redirección, limpieza de sesión y retorno seguro a la pantalla de acceso. |
| Formatos institucionales (`/templates`) | Archivo permitido, extensión falsa, archivo dañado, mayor de 10 MB, 413, 422, formato por defecto, borrado, recuperación, reemplazo y conflicto de versión. |
| Nóminas (`/rosters`) | Importar XLSX/CSV válido e inválido, archivo grande, columnas faltantes, estudiantes duplicados/409, nómina inactiva y tabla de 200 registros. |
| Calendario y comunidad | Sin registros, permisos, creación, edición, borrado, paginación o filtros y error de red. |
| Administración y utilidades | Usuario docente sin privilegios, administrador, datos vacíos, carga lenta y exportación CSV. |
| Archivos e imágenes | Imagen de presentación inexistente/404, archivo descargable dañado, nombre Unicode y respuesta sin nombre de archivo. |

### Sesiones, permisos y aislamiento de datos

Se crearán al menos tres identidades de prueba: docente A, docente B y administrador. Cada ronda verificará que los cambios responsive no muestren ni permitan operar datos de otra cuenta.

- Docente A no puede abrir por URL documentos, formatos, nóminas, historial ni versiones de Docente B.
- Un docente no accede a las rutas administrativas mediante navegación, URL directa o estados guardados del navegador.
- El administrador conserva sus paneles y acciones sin que tablas o permisos fallen en móvil.
- Al recibir 401, la aplicación limpia sesión, cancela acciones pendientes de forma segura y no conserva contenido sensible en una pantalla visible.
- Probar dos pestañas con el mismo documento o formato para comprobar el conflicto de revisión y el mensaje de recuperación.

### Calidad y consistencia de artefactos de IA

El backend valida estructuras y registra controles de calidad en la generación. La campaña añadirá pruebas para que esos resultados se traduzcan en una experiencia segura y legible.

- Resultado completo y apto: se muestra, guarda y exporta.
- Resultado reparado: se identifica de forma no intrusiva, conserva la estructura y permite revisión docente.
- Resultado bloqueado o incompleto: no debe presentarse como documento listo ni habilitar una descarga engañosa.
- La edición parcial y regeneración no deben desplazar la vista al inicio, romper tablas o perder cambios no relacionados.
- Cada familia tendrá un fixture de respuesta IA con secciones largas, tablas anchas y actividades de máxima densidad para probar el renderizado sin depender de una respuesta variable del proveedor.

### Descargas, impresión y compatibilidad de archivos

El producto usa exportadores del navegador y respuestas de archivo del API. Para cada salida disponible se deberá verificar:

1. Nombre de archivo legible, incluidos acentos y caracteres Unicode.
2. Tipo y extensión correctos: DOCX, PDF, XLSX, PPTX o CSV según corresponda.
3. Archivo no vacío y abrible con su aplicación objetivo o mediante una comprobación estructural automatizada.
4. Una descarga lenta, bloqueada o fallida no deja el botón permanentemente deshabilitado.
5. La impresión muestra el resultado completo, sin barra lateral, controles de edición ni cortes de tabla evitables.
6. Copiar al portapapeles tiene confirmación y alternativa manual cuando el navegador niega permiso.

### Disponibilidad, rendimiento y observabilidad

- Incluir pruebas a `/health` y `/ready` antes de las rondas integradas; si falla la disponibilidad, la ejecución se marca como bloqueada, no como un defecto visual.
- Registrar para cada prueba el tiempo de carga inicial, de generación, de apertura de resultado, de exportación y de respuesta a interacción. Definir umbrales por dispositivo antes de certificar.
- Simular red lenta, red desconectada y respuesta que no llega; todo estado debe informar qué ocurre y ofrecer reintento o salida.
- Vigilar consumo de memoria en recursos de cuadrícula, presentaciones, tablas de nómina y documentos extensos; el navegador no debe quedarse sin responder.
- Guardar consola, errores de red, respuesta HTTP, viewport, tema, identidad de prueba y revisión de la aplicación junto con cada captura defectuosa.

### Entorno y despliegue

- Ejecutar cada suite contra el entorno local integrado y una ronda de humo contra la versión de preproducción antes de publicar.
- Confirmar que la variable de URL de API apunta al ambiente correcto y que CORS permite el origen esperado sin ocultar errores de autenticación.
- Validar migraciones, salud de base de datos y que los datos de fixture se reinicien entre rondas para evitar resultados falsos por contaminación.
- Separar claramente evidencia con IA simulada —repetible y apta para regresión— de una ronda limitada con IA real —necesaria para verificar proveedor, créditos y calidad—.

## Matriz de trazabilidad obligatoria

La matriz final debe permitir responder, sin revisar código, qué se probó para cada resultado y qué servicio lo respaldó.

| Campo | Ejemplo |
|---|---|
| Capacidad | `53 · Sopas de letras` |
| Ruta y variante | `recursos/sopas-letras · WorkflowTool` |
| Estado | `resultado máximo + solución abierta` |
| Fixture / API | `sopa-30-palabras.json · IA simulada` |
| Usuario | `docente A` |
| Dispositivo / tema | `320×568 · oscuro · A+` |
| Interacción | `desplazamiento local + marcar palabra + reiniciar` |
| Evidencia | captura, vídeo corto si es necesario, consola y medición |
| Resultado | aprobado / bloqueado / defecto vinculado |

No se puede cerrar una fila con “probado manualmente” sin especificar estado, usuario, viewport, interacción y evidencia.

## Registro de defectos y responsabilidades

Cada fallo debe registrarse en la matriz final con los siguientes campos:

| Campo | Contenido requerido |
|---|---|
| Identificador | Código único, por ejemplo `RESP-053-320-01`. |
| Severidad | Crítica, alta, media o baja. |
| Ruta y estado | Herramienta, paso y acción exacta donde ocurre. |
| Dispositivo y tema | Viewport, orientación, navegador, tema y tamaño de texto. |
| Evidencia | Enlace a captura, mediciones, errores de consola y reproducción. |
| Causa probable | Contenedor global, componente compartido o componente específico. |
| Responsable | Persona o área que implementará la corrección. |
| Validación | Prueba de regresión que debe aprobar para cerrar el defecto. |

Severidad mínima:

- **Crítica:** impide acceder, generar, guardar, descargar o usar el recurso.
- **Alta:** corta información esencial, oculta una acción principal, produce overflow global o bloquea la interacción.
- **Media:** dificulta una acción secundaria, genera solapamiento menor o reduce la legibilidad.
- **Baja:** detalle visual sin pérdida de información ni de interacción.

### 3. Capturas y archivo de evidencia

- Carpeta de salida temporal: fuera del repositorio durante el desarrollo.
- Carpeta de evidencia final versionada: `audit/responsive-57-2026-09/`.
- Nombre: `<numero>-<ruta>-<estado>-<viewport>-<tema>.png`.
- Ejemplo: `53-recursos-sopas-letras-resultado-320x568-claro.png`.
- Cada herramienta debe tener al menos una captura de resultado para cada uno de los cinco perfiles y una captura móvil adicional en tema oscuro. Las superficies con resultado complejo requieren también una captura enfocada en el artefacto.
- Publicar una matriz `audit/responsive-57-2026-09/resultados.md` que enlace cada evidencia, medición y defecto corregido.

## Caso prioritario: sopa de letras y otras cuadrículas

### Reproducción que se debe automatizar

1. Abrir `recursos/sopas-letras`.
2. Crear una sopa con 30 palabras y la dificultad más amplia permitida.
3. Llegar al resultado; abrir pistas, banco de palabras y solución.
4. Repetir en 320 × 568, 390 × 844, 768 × 1024, 1366 × 768 y 1920 × 1080, claro y oscuro.
5. Confirmar que la cuadrícula completa es visible mediante escala proporcional o desplazamiento **del contenedor de la cuadrícula**; la página no debe ensancharse.
6. Arrastrar o desplazar horizontalmente el contenedor local en móvil cuando sea necesario, y comprobar que sigue siendo posible marcar palabras y usar acciones de comprobación/reinicio.

### Corrección esperada

- El wrapper de cuadrícula deberá tener `max-width: 100%`, `min-width: 0`, indicación de desplazamiento local cuando exceda el ancho, y espaciado suficiente para toque.
- La cuadrícula debe calcular una celda fluida o una escala controlada; nunca usar celdas rígidas que obliguen a cortar la última columna.
- El papel de vista previa, panel de acciones, lista de palabras y solucionario deben colapsar a una columna sin forzar el ancho de la cuadrícula.
- Aplicar el mismo patrón a crucigramas, tablas de rúbricas/listas, tableros de juegos, calendarios, gráficos y documentos con tablas extensas.

## Orden de ejecución

### Fase 0 — Línea base y clasificación

1. Ejecutar la suite sobre el estado actual en todos los viewports.
2. Crear un inventario de defectos con: ruta, estado, viewport, tema, captura, selector responsable, severidad y reproducción.
3. Clasificar cada defecto en: global, patrón compartido o caso exclusivo.
4. No marcar ninguna ruta como aprobada antes de llegar al resultado generado.

### Fase 1 — Fundaciones compartidas

Corregir contenedor de aplicación, sidebar, topbar, safe areas, diálogos, overlays, tipografía, grids, botones, steppers, barras de acciones, documentos, tablas y scroll local. Ejecutar de nuevo todas las pruebas que fallen por una causa compartida.

### Fase 2 — Artefactos densos e interactivos

Corregir y certificar primero: sopa de letras, crucigramas, ahorcado, emparejar palabras, completar frase, agrupar palabras, ordenar bloques, tarjetas, presentaciones, tablas de evaluación, registros auxiliares, analíticas y calendario.

### Fase 3 — Flujos documentales y formularios

Recorrer las restantes herramientas de Planificamos, Incluimos, Reforzamos, Acompañamos y Tutoría. Verificar paso a paso, generación, documento, edición y exportación.

### Fase 4 — Regresión completa y accesibilidad

Ejecutar las 57 herramientas, ambas entradas de NEE/DUA, rutas globales y utilidades. Repetir en claro/oscuro, A−/A/A+, móvil horizontal y alturas cortas. Revisar teclado, foco, lectura de etiquetas y ausencia de errores de consola.

### Fase 5 — Cierre de evidencia

1. Ejecutar pruebas unitarias, pruebas de navegador, lint y compilación.
2. Revisar visualmente la galería completa; una captura guardada no equivale automáticamente a aprobación.
3. Registrar fallas restantes con severidad y bloquear la certificación si existe corte, solapamiento, botón inaccesible u overflow global.
4. Actualizar este documento con resultados reales, nunca con afirmaciones genéricas como “responsive validado”.

## Criterios de aprobación por herramienta

Una herramienta obtiene estado **Aprobada** solo si cumple todos los puntos:

- [ ] Entrada, paso intermedio, generación y resultado revisados.
- [ ] Resultado generado con datos de prueba representativos o de máxima densidad.
- [ ] Cinco perfiles principales capturados; móvil en tema oscuro incluido.
- [ ] Sin overflow horizontal global ni contenido truncado.
- [ ] Controles visibles, pulsables, navegables por teclado y sin solapamiento.
- [ ] Artefactos anchos usan un mecanismo local y funcional de escala o desplazamiento.
- [ ] Exportación o acción final comprobada.
- [ ] Sin errores relevantes de consola ni overlays de framework.
- [ ] Defectos encontrados corregidos y prueba de regresión aprobada.
- [ ] Si hubo parche automático, incluye diagnóstico, antes/después, límites respetados y nueva ejecución completa del caso.

## Criterios de salida de la campaña

- 57 de 57 capacidades aprobadas, más la segunda entrada de NEE/DUA.
- 0 defectos críticos o altos abiertos: corte de contenido, acción fuera de pantalla, bloqueo de generación, overlay, pérdida de datos o overflow global.
- Todas las capturas y mediciones enlazadas en la matriz final.
- Ninguna certificación se deriva de una única ruta, una única captura, un único escritorio o la compilación.
- Las correcciones de componentes compartidos cuentan con pruebas de regresión sobre todas las rutas afectadas.
- Los comandos `test:e2e` y `test:responsive` existen, se ejecutan desde un entorno limpio y publican resultados interpretables; una falla de navegador bloquea el cierre.
- Ninguna ruta tiene estado ambiguo, omitido o aprobado sin resultado generado, interacción, mediciones y evidencia verificable.

## Entregables

1. Código de corrección responsive y componentes reutilizables.
2. Suite de navegador reproducible y fixtures de generación.
3. Galería de capturas por herramienta, estado, viewport y tema.
4. Matriz de resultados con defectos, correcciones y evidencia.
5. Reporte final con pruebas ejecutadas, rutas aprobadas, riesgos remanentes y capturas representativas.
