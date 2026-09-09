# Plan vivo · Corrección semántica de las 57 herramientas

> **ESTADO: EN EJECUCIÓN POR FASES**  
> Ejecución autorizada el 4 de septiembre de 2026. Cada herramienta solo se marcará terminada después de validar backend, frontend, persistencia, semántica y exportación real.

Fecha de creación: 4 de septiembre de 2026  
Proyecto: Avendia Escala 3.0  
Documento de diagnóstico relacionado: [`auditoria-semantica-57-herramientas.md`](./auditoria-semantica-57-herramientas.md)

## 1. Objetivo principal

Corregir el motor de generación y cada herramienta de Avendia para que el resultado no sea solamente atractivo o extenso, sino que corresponda exactamente al producto pedagógico solicitado, pueda utilizarse en una situación educativa real, conserve toda su información al guardarse y se exporte sin pérdida.

La meta no es generar “documentos con texto”. La meta es producir tareas que puedan resolverse, rúbricas que puedan aplicarse, sesiones que puedan ejecutarse, evaluaciones que puedan calificarse, juegos que puedan comprobarse y fuentes que puedan verificarse.

## 2. Regla de control del plan

- Este archivo es acumulativo: no eliminar requisitos aprobados.
- Si un requisito nuevo repite otro, ampliar el existente con mayor precisión en vez de duplicarlo.
- Ejecutar por fases y registrar evidencia; la autorización no permite marcar tareas pendientes como terminadas.
- La aprobación general del plan no autoriza cambios fuera del alcance de las herramientas.
- No detener la ejecución entre herramientas por una aprobación adicional, salvo que aparezca una decisión funcional que cambie materialmente el alcance.
- Todo cambio debe respetar la arquitectura, identidad visual, autenticación, permisos y datos ya existentes.
- No sustituir lógica real por demostraciones visuales, datos falsos o contenido escrito manualmente dentro de pruebas.

## 3. Criterio de inventario

El catálogo técnico contiene 58 rutas. El producto las denomina 57 herramientas porque `Adaptación Inclusiva NEE (DUA)` se ofrece desde Planificamos e Incluimos como una misma capacidad conceptual. También existe `Analítica de aula y alertas` en dos contextos.

Antes de ejecutar se deberá definir y congelar:

- identidad canónica mediante `módulo/herramienta`;
- cuáles rutas comparten motor y cuáles comparten solamente nombre;
- cómo se contabilizarán en administración, historial, favoritos, créditos y analítica;
- cómo se migrarán registros si se unifican duplicados;
- prohibición de borrar rutas o historiales durante la normalización.

## 4. Principios obligatorios

### 4.1 Producto pedagógico real

Cada herramienta debe disponer de un contrato propio que describa exactamente lo que genera. El contrato debe definir campos, relaciones, límites, secciones, tablas, actividades, respuestas, anexos, formatos y condiciones de rechazo.

### 4.2 Coherencia curricular

Cuando corresponda, se debe verificar la cadena:

`modalidad → nivel/ciclo → grado → área → competencia → capacidad/desempeño → propósito → actividad → evidencia → criterio → instrumento`

Una contradicción importante en esta cadena debe bloquear la generación o solicitar corrección; no debe esconderse como advertencia genérica.

### 4.3 Separación de destinatarios

El modelo de datos debe distinguir explícitamente:

- material para el estudiante;
- guía o clave para el docente;
- información institucional;
- orientación para la familia;
- metadatos internos y de trazabilidad.

Nunca mezclar la solución dentro de la ficha del estudiante ni convertir una tarea en una explicación para el docente.

### 4.4 Persistencia real

Todo artefacto debe guardarse en backend con su estructura completa, propietario, versión, estado, entradas, resultado aprobado, modelo utilizado, contrato, fecha, revisiones y formatos generados.

La reapertura desde Historial debe reconstruir el resultado sin depender de `localStorage` ni de volver a llamar a la IA. Las ediciones deben crear revisiones y no sobrescribir silenciosamente la versión anterior.

### 4.5 Paridad entre salidas

El JSON aprobado será la fuente de verdad. Vista previa, edición, Word, PDF, Excel, PowerPoint o formato interactivo deben representar el mismo contenido. Una prueba automática debe detectar campos, actividades, respuestas o tablas perdidas.

### 4.6 Validación antes de presentar o cobrar

Un resultado que incumpla condiciones P0 no se mostrará como exitoso ni consumirá definitivamente créditos. El sistema podrá regenerar una vez únicamente la parte incorrecta, usando los errores detectados. Si vuelve a fallar, debe explicar al docente qué información necesita.

### 4.7 Revisión humana

La IA puede sugerir, organizar y generar borradores, pero no debe tomar decisiones definitivas sobre calificaciones, diagnósticos, alertas de protección, derivaciones o vigencia normativa.

## 5. Arquitectura objetivo

### Capa A — Contrato de entrada

Por herramienta:

- campos obligatorios y opcionales;
- tipos y límites;
- opciones dependientes por modalidad/nivel/grado;
- datos institucionales autocompletados;
- ejemplos contextuales;
- reglas de privacidad;
- archivos admitidos;
- condiciones para habilitar generación.

### Capa B — Esquema de resultado

Crear esquemas especializados por familia y extensiones por herramienta:

1. planificación curricular;
2. tarea/ficha resoluble;
3. instrumento de evaluación;
4. analítica y seguimiento;
5. comunicación;
6. inclusión y tutoría;
7. actividad/juego;
8. presentación;
9. recurso externo verificable.

### Capa C — Generación

- prompt del sistema común únicamente para seguridad, contexto peruano y estilo;
- prompt contractual específico por herramienta;
- contexto del formulario tratado como datos, no como instrucciones;
- respuesta estructurada con esquema estricto;
- temperatura y extensión adecuadas al producto;
- regeneración parcial sin destruir campos aprobados;
- protección contra instrucciones insertadas en documentos cargados.

### Capa D — Validación determinista

Aplicar reglas computables: conteos, sumas, referencias, duración, progresión, claves, cuadrículas, URLs, fechas, correspondencias y obligatoriedad. No usar una búsqueda de palabras como equivalente de calidad.

### Capa E — Crítica semántica

Una revisión estructurada debe identificar contradicciones concretas y devolver códigos de error. Debe explicar qué elemento falla, dónde falla, por qué afecta el uso pedagógico y qué dato se necesita para repararlo.

### Capa F — Persistencia y revisión

- guardar borrador de entrada;
- guardar resultado bruto de IA de forma segura para diagnóstico;
- guardar resultado normalizado;
- guardar validaciones y advertencias;
- guardar versión aprobada por el docente;
- registrar cambios, regeneraciones, exportaciones y consumo/reintegro de créditos.

### Capa G — Presentación y exportación

- editor especializado por familia;
- vista previa fiel;
- exportador especializado cuando la función lo requiera;
- Word/PDF/Excel/PowerPoint con propósito real;
- versión del estudiante y versión docente separables;
- ninguna pérdida respecto del JSON aprobado.

## 6. Clasificación de severidad

| Nivel | Definición | Comportamiento requerido |
|---|---|---|
| P0 | Falta el producto, se pierde contenido, hay una respuesta indeterminable, una fuente inventada o un riesgo sensible | Bloquear, no certificar, regenerar o pedir datos |
| P1 | El producto existe pero es incoherente, difícil de aplicar o no está alineado | Marcar “requiere revisión” y localizar el problema |
| P2 | Problema editorial, de densidad, orden o presentación | Permitir borrador y sugerir corrección |
| P3 | Mejora opcional | Registrar en backlog sin bloquear |

## 7. Fase 0 — Congelar alcance y crear línea base

### Trabajo previsto

- Resolver el conteo 57/58 sin eliminar datos.
- Generar una matriz canónica de las rutas reales.
- Identificar qué componente atiende cada ruta: dedicado o genérico.
- Identificar endpoint, esquema, persistencia, exportador y pruebas por ruta.
- Guardar ejemplos reales actuales como línea base, incluidos resultados defectuosos.
- Sustituir la etiqueta “certificada” del QA anterior por “fixture de formato” cuando corresponda.
- Definir consumo y reintegro de créditos para fallos de validación.

### Criterio de salida

Existe una matriz verificable sin herramientas huérfanas, rutas ambiguas ni certificaciones sustentadas únicamente en archivos escritos manualmente.

## 8. Fase 1 — Caso piloto: Tarea de Extensión y Hogar

### Resultado esperado

Una ficha que el estudiante pueda recibir y resolver, no una planificación acerca de la tarea.

### Modelo obligatorio

- portada breve y datos del estudiante;
- propósito en lenguaje comprensible;
- reto o tarea central;
- situación, datos o material de partida;
- instrucciones numeradas;
- ejercicios, preguntas, operaciones o producto concreto;
- ejemplo resuelto claramente separado;
- tablas y espacios de trabajo reales;
- materiales auténticos;
- evidencia de entrega;
- criterios de éxito para el estudiante;
- autoevaluación marcable;
- apoyo familiar opcional;
- ajustes DUA;
- guía docente y respuestas en sección o archivo separado.

### Correcciones previstas

- crear esquema específico de tarea;
- incluir la actividad estructurada en vista previa y exportación;
- dejar de usar el exportador curricular genérico;
- validar coherencia entre área, tema, propósito, actividad, evidencia y criterio;
- asegurar que cada consigna tenga información suficiente;
- prohibir que una reflexión se clasifique como material;
- probar reapertura, edición, regeneración parcial y exportación.

### Pruebas de aceptación

- un estudiante puede identificar qué debe hacer en menos de un minuto;
- cada pregunta tiene espacio o mecanismo de respuesta;
- la versión del estudiante no revela respuestas;
- la guía docente contiene respuestas o criterios cuando corresponda;
- el contenido de `activity.items` aparece completo en la descarga;
- vista previa y Word contienen los mismos ejercicios y conteos;
- el artefacto reaparece idéntico desde Historial;
- se prueba EBR, EBA y EBE/EBEE cuando la combinación sea aplicable;
- se prueba primaria/secundaria y contexto rural/urbano;
- un resultado sin actividad es rechazado.

## 9. Fase 2 — Instrumentos de evaluación

Herramientas incluidas:

- Rúbrica de evaluación.
- Lista de cotejo.
- Examen.
- Escala de estimación.
- Preguntas sobre texto.
- Ficha de observación.
- Calificador de rúbricas con IA.
- Retroalimentación formativa.

### Reglas comunes

- toda valoración parte de una evidencia identificada;
- criterios observables y no duplicados;
- clave o regla de interpretación explícita;
- versión estudiante/docente cuando corresponda;
- integración real con estudiantes y nóminas;
- persistencia por estudiante, criterio y periodo;
- exportación tabular fiel;
- IA propone, docente confirma la calificación.

### Puertas específicas pendientes de detallar

#### Rúbrica

- [ ] Evidencia o producto exacto.
- [ ] Entre 3 y 6 criterios independientes.
- [ ] Descriptores observables y progresivos por nivel.
- [ ] Misma dimensión medida en todos los niveles de un criterio.
- [ ] Ponderaciones suman 100% cuando estén habilitadas.
- [ ] Feedback derivado de evidencia, descriptor y siguiente aprendizaje.

#### Lista de cotejo

- [ ] Un comportamiento observable por indicador.
- [ ] Sí/No/En proceso con significado configurable.
- [ ] Estudiantes en filas y criterios en columnas.
- [ ] Observaciones y evidencia por estudiante.

#### Examen y preguntas sobre texto

- [ ] Tabla de especificaciones.
- [ ] Balance cognitivo y puntajes coherentes.
- [ ] Preguntas determinables y sin pistas involuntarias.
- [ ] Clave justificada.
- [ ] Preguntas sobre texto sustentadas únicamente en el documento fuente.

## 10. Fase 3 — Planificación curricular

Herramientas incluidas:

- Plan Curricular Anual.
- Unidad de Aprendizaje.
- Sesión de Aprendizaje.
- Situación significativa.
- Proyectos integrados.
- Carpeta Pedagógica Oficial.
- Plan de refuerzo.
- Plan de tutoría.
- Sesiones de tutoría.

### Objetivo

Convertir listados de secciones en estructuras relacionadas. Cada competencia, actividad, evidencia, criterio, periodo y sesión debe poder rastrearse dentro del documento.

### Criterios iniciales

- tiempos y periodos válidos;
- secuencias ejecutables;
- actividades vinculadas a propósitos;
- evidencia vinculada a criterios;
- cronogramas sin contradicciones;
- matrices con columnas semánticamente correctas;
- referencias CNEB revisables;
- contenido proporcional al tipo de planificación.

## 11. Fase 4 — Fichas, trabajo autónomo y recuperación

Herramientas incluidas:

- Ficha de aprendizaje.
- Trabajo autónomo para el hogar.
- Carpetas/Carpeta de recuperación.
- Acompañamiento y motivación.
- Monitoreo de avances.

### Objetivo

Toda ficha o carpeta debe contener práctica real, progresión, respuesta del estudiante, retroalimentación y verificación de salida. La cantidad de páginas nunca reemplazará la calidad de las tareas.

### Pendiente de ampliar

- [ ] estructura de práctica guiada y autónoma;
- [ ] diagnóstico y dificultad progresiva;
- [ ] máximo de sesiones/frecuencia;
- [ ] actividades individuales y carga masiva por estudiantes;
- [ ] evidencia y prueba de salida;
- [ ] espacios de respuesta e imprimibilidad;
- [ ] versión docente con solucionario.

## 12. Fase 5 — Inclusión, acompañamiento y tutoría sensible

Herramientas incluidas:

- Adaptación Inclusiva NEE (DUA), desde ambas rutas.
- Plan de atención.
- Estrategias de inclusión.
- Trabajo con familias.
- Seguimiento y evaluación.
- Correos y respuestas a familias.
- Reportes, informes y fichas de acompañamiento.
- Alertas y casos.
- Orientación vocacional.

### Reglas especiales

- no inventar diagnósticos;
- distinguir hechos, interpretación y recomendación;
- privacidad por defecto;
- no exponer información de otros estudiantes;
- planes basados en barrera, apoyo, responsable, evidencia y fecha;
- alertas sensibles siempre revisadas por una persona;
- rutas de protección institucionales y nunca improvisadas por IA;
- lenguaje respetuoso, accesible y no determinista.

## 13. Fase 6 — Analítica y calificadores

### Objetivo

Ninguna conclusión debe aparecer si no puede rastrearse hasta datos almacenados.

### Reglas

- periodo y población identificados;
- denominadores y fórmulas visibles;
- umbrales configurables;
- datos faltantes declarados;
- nivel de confianza;
- diferencia entre dato, patrón e hipótesis;
- prohibición de inventar causas;
- cálculo reproducible en backend;
- filtros de bimestre, fechas, competencia, capacidad y desempeño;
- exportación consistente con lo mostrado.

## 14. Fase 7 — Juegos y recursos interactivos

Herramientas incluidas:

- Tarjetas de estudio.
- Agrupar palabras.
- Ordenar bloques.
- Casos de estudio.
- Ahorcado.
- Completar frase.
- Emparejar palabras.
- Debate en aula.
- Crucigramas.
- Sopas de letras.

### Reglas

- solución determinista y comprobable;
- ausencia de duplicados;
- consignas inequívocas;
- dificultad adecuada;
- clave/solución completa;
- máximo 30 palabras en crucigrama y sopa cuando se confirme como regla final;
- cuadrículas válidas y proporcionadas;
- categorías sin ambigüedad no declarada;
- secuencias con orden sustentable;
- estado interactivo persistente cuando corresponda;
- exportación imprimible equivalente al recurso interactivo.

## 15. Fase 8 — Presentaciones didácticas

### Objetivo

Generar una secuencia didáctica visual, no texto colocado encima de una imagen.

### Reglas iniciales

- una idea central por diapositiva;
- título, contenido e interacción sin superposición;
- ajuste automático según longitud;
- máximo de ocho diapositivas cuando lo solicite el producto;
- variedad de composiciones;
- imágenes pertinentes, con calidad mínima y fuente/licencia verificable;
- notas del docente separadas;
- actividad o pregunta con propósito;
- navegación, edición y regeneración por diapositiva;
- paridad entre editor, presentación y archivo descargado;
- accesibilidad y contraste.

## 16. Fase 9 — Recursos y fuentes externas

Herramientas incluidas:

- Banco de recursos para planificar.
- Normativa educativa.
- Libros y guías MINEDU.
- Canales audiovisuales.
- Recursos de tutoría.

### Reglas

- no confiar en memoria del modelo para URLs, normas o vigencia;
- búsqueda o catálogo verificable;
- preferencia por fuentes oficiales;
- enlace comprobado antes de mostrarlo;
- título, entidad/autor, fecha, nivel, área y fecha de consulta;
- vigencia o estado de la norma;
- advertencia clara si no puede verificarse;
- no inventar recomendaciones a partir de un recurso no recuperado.

## 17. Fase 10 — Exportación y fidelidad

### Matriz de formatos por propósito

| Familia | Formato principal | Formatos secundarios |
|---|---|---|
| Planificación institucional | Word | PDF |
| Ficha/tarea | Word o PDF imprimible | versión docente separada |
| Registro por estudiantes | Excel | Word/PDF de impresión |
| Rúbrica/lista | Excel o Word según uso | PDF |
| Presentación | PowerPoint | PDF |
| Juego | Interactivo | PDF/Word imprimible |
| Comunicación | Copiar y enviar | Word/PDF opcional |
| Analítica | Dashboard | Excel/PDF |
| Fuente externa | Enlace verificado | ficha de referencia |

### Pruebas

- conteo de secciones, filas, columnas, preguntas y respuestas;
- comparación JSON-vista-exportación;
- render de todas las páginas/diapositivas/hojas;
- ausencia de cortes, desbordes y páginas vacías;
- tipografía y colores de impresión legibles;
- ningún campo interno o solución en versión estudiante;
- archivos que reabren correctamente.

## 18. Fase 11 — Persistencia, historial y administración

- Historial dentro de las herramientas y vista global.
- Guardar, renombrar, duplicar, archivar, restaurar y borrar con confirmación.
- Versiones y comparación de cambios.
- Favoritos y más usadas basados en datos reales.
- Administración de generaciones, fallos, créditos y reintegros.
- Filtros por usuario, herramienta, módulo, fecha, modelo y estado.
- Registro de auditoría sin exponer contenido sensible innecesario.
- Reintentos idempotentes para evitar cobros o documentos duplicados.

## 19. Fase 12 — Certificación real de cada herramienta

Cada clave `módulo/herramienta` necesitará:

- [ ] caso EBR;
- [ ] caso EBA;
- [ ] caso EBE/EBEE cuando aplique;
- [ ] primaria/secundaria o nivel propio;
- [ ] contexto rural/urbano;
- [ ] entrada mínima y completa;
- [ ] resultado defectuoso que el validador rechaza;
- [ ] llamada por el endpoint real de producción;
- [ ] validación de estructura y semántica;
- [ ] guardado y reapertura desde backend;
- [ ] regeneración parcial;
- [ ] render completo de vista previa;
- [ ] exportación y comparación con JSON;
- [ ] revisión visual de todas las páginas;
- [ ] responsive y claro/oscuro para la interfaz;
- [ ] evidencia reproducible con fecha, modelo y versión del contrato.

Estados permitidos:

- `NO INICIADA`
- `EN DESARROLLO`
- `BLOQUEADA`
- `CONDICIONAL`
- `APROBADA`

Está prohibido usar `CERTIFICADA` por tamaño de archivo, apertura del contenedor o fixture manual.

## 20. Orden propuesto de ejecución

Este orden queda pendiente de aprobación:

1. infraestructura común de esquema, validación, persistencia y paridad;
2. Tarea de Extensión y Hogar como piloto;
3. rúbrica, lista de cotejo, examen y preguntas sobre texto;
4. ficha, trabajo autónomo y recuperación;
5. sesión, unidad, PCA y plan de refuerzo;
6. analítica y calificadores;
7. inclusión, acompañamiento y tutoría;
8. juegos;
9. presentaciones;
10. fuentes externas;
11. certificación integral y limpieza de afirmaciones anteriores.

## 21. Definition of Done por herramienta

Una herramienta estará terminada únicamente si:

- genera el producto correcto y no un texto acerca del producto;
- todos los campos necesarios influyen realmente en la salida;
- rechaza resultados incompletos o incoherentes;
- no pierde contenido en la vista o descarga;
- guarda y recupera el artefacto desde backend;
- permite edición y versionado acorde a su propósito;
- no inventa fuentes, diagnósticos, datos ni decisiones sensibles;
- sus pruebas atraviesan el flujo real;
- funciona en los dispositivos y modos visuales soportados;
- cuenta con evidencia reproducible y estado `APROBADA`.

## 22. Plantilla para agregar nuevos requisitos

Copiar este bloque al final del documento sin borrar el historial:

```md
### REQ-XXX · Nombre breve

- Fecha:
- Solicitado por:
- Herramienta(s):
- Problema observado:
- Comportamiento esperado:
- Datos de entrada:
- Resultado esperado:
- Lógica de backend:
- Persistencia requerida:
- Comportamiento de frontend:
- Vista previa:
- Exportación:
- Validaciones P0/P1/P2:
- Casos límite:
- Pruebas de aceptación:
- Dependencias:
- Decisión:
- Estado: PROPUESTO
```

## 23. Registro de decisiones

| ID | Fecha | Decisión | Herramientas afectadas | Estado |
|---|---|---|---|---|
| DEC-001 | 2026-09-04 | Crear este plan sin ejecutar cambios | Todas | Aprobada |
| DEC-002 | Pendiente | Definir conteo oficial 57/58 | Catálogo completo | Pendiente |
| DEC-003 | 2026-09-04 | Usar Tarea de Extensión y Hogar como piloto del contrato semántico y exportador especializado | Planificamos | Aprobada y en ejecución |

## 24. Requisitos nuevos por incorporar

Esta sección queda abierta para las próximas indicaciones. Cada requisito aceptado deberá integrarse en su fase y conservarse también en el registro histórico.

<!-- Agregar requisitos debajo de esta línea. La ejecución está autorizada por fases y cada cierre exige evidencia. -->

## 25. REQ-001 · Identidad funcional y contexto obligatorio por herramienta

**Fecha:** 2026-09-04  
**Solicitado por:** Cliente  
**Herramientas:** Las 57 herramientas funcionales y sus rutas equivalentes  
**Estado:** EN EJECUCIÓN POR FASES — CONSERVAR REQUISITOS Y REGISTRAR EVIDENCIA

### Problema que se debe evitar

No se puede usar una única salida de “título + párrafos + tablas” para productos pedagógicos distintos. Una presentación no es un formulario convertido en diapositivas; una sopa de letras no es una lista de palabras; una lista de cotejo no es una rúbrica; una tarea no es una explicación docente acerca de una tarea.

Cada herramienta debe generar, permitir usar, guardar y exportar el producto que declara ser. Si no conserva sus características funcionales, debe rechazarse aunque tenga buen diseño, texto largo o un archivo Word válido.

### Contrato de identidad funcional

Antes de crear o modificar una herramienta, se deberá documentar y aprobar esta ficha:

| Elemento | Pregunta obligatoria |
|---|---|
| Propósito | ¿Qué problema concreto resuelve para el docente o estudiante? |
| Destinatario | ¿Lo usa el docente, estudiante, familia, directivo o más de uno? |
| Entrada | ¿Qué datos necesita realmente para producir un resultado correcto? |
| Producto | ¿Qué objeto entrega: ficha, matriz, juego, presentación, análisis, comunicación, fuente o registro? |
| Interacción | ¿Qué debe poder llenar, seleccionar, arrastrar, marcar, ordenar, calificar o editar la persona? |
| Resultado docente | ¿Qué edición, clave, seguimiento, recomendación o control requiere el docente? |
| Validación | ¿Qué condiciones objetivas convierten el resultado en utilizable? |
| Persistencia | ¿Qué se guarda, versiona y recupera desde backend? |
| Exportación | ¿Qué formato sirve realmente para usar el producto? |
| Rechazo | ¿Qué fallo P0 impide presentarlo como generación exitosa? |

Regla transversal: ningún campo se incorpora por apariencia. Cada campo del formulario debe modificar el resultado, una validación, una interacción, una exportación o la persistencia. Si no afecta nada, debe eliminarse o justificarse como dato administrativo visible.

### 25.1 Presentaciones didácticas

Una presentación debe ser una secuencia visual para enseñar, no un documento con campos administrativos, párrafos extensos o tablas institucionales dentro de las diapositivas.

**Debe generar y permitir:**

- portada, propósito, desarrollo, ejemplo, interacción, síntesis y cierre según el número de diapositivas solicitado;
- una idea central por diapositiva;
- título, subtítulo, contenido breve, interacción, recurso visual y notas docentes como elementos separados;
- imágenes, ilustraciones, diagramas o recursos visuales con propósito pedagógico;
- preguntas, retos o actividades cuando la secuencia lo requiera;
- notas para el docente que no se muestren al estudiante;
- reordenar, duplicar, editar y regenerar una sola diapositiva;
- navegación y presentación a pantalla completa;
- descarga PowerPoint/PDF con la misma composición aprobada en el editor.

**Validación obligatoria:**

- ningún texto, etiqueta, interacción o crédito puede superponerse o quedar fuera del lienzo;
- el contenido largo se acorta, redistribuye o pasa a otra diapositiva; nunca se amontona;
- contraste, jerarquía tipográfica y legibilidad para el nivel educativo;
- imagen pertinente y con procedencia/licencia registrada cuando se use una fuente externa;
- no incluir datos institucionales, tablas de planificación o formularios salvo que una diapositiva lo requiera explícitamente;
- coherencia entre título, contenido, ejemplo, interacción y propósito de la diapositiva.

**P0 de rechazo:** una diapositiva recortada, ilegible, vacía, con texto superpuesto o con contenido que no corresponde a una presentación.

### 25.2 Sopa de letras

Una sopa de letras debe poder jugarse y resolverse. No es suficiente generar una cuadrícula visual o una lista de vocabulario.

**Debe generar y permitir:**

- banco de palabras asociado al tema;
- cuadrícula real con las palabras ubicadas horizontal, vertical y/o diagonalmente según dificultad;
- letras de relleno;
- selección de letras consecutivas en la versión interactiva;
- marcado de palabra correcta, avance, palabras pendientes y comprobación;
- solución docente con las palabras resaltadas;
- versión imprimible para estudiante sin solución y versión docente con solución;
- máximo de palabras y tamaño de cuadrícula configurables, respetando las reglas definidas por la herramienta.

**Validación obligatoria:**

- cada palabra del banco existe de verdad en la cuadrícula;
- no hay palabras cortadas, fuera de límites ni repetidas sin una razón declarada;
- cada recorrido seleccionado se puede verificar contra la solución;
- la cuadrícula es proporcional e imprimible;
- las palabras corresponden al grado, área, tema y dificultad solicitada.

**P0 de rechazo:** palabra inexistente, cuadrícula sin solución comprobable, solución distinta al banco o actividad que no se puede completar.

### 25.3 Crucigrama

Debe generar una cuadrícula con cruces reales y pistas que permitan resolverla, no una lista de definiciones.

**Debe generar y permitir:** cuadrícula numerada, casillas bloqueadas, pistas horizontales/verticales, ingreso letra por letra, comprobación, solución docente y formato imprimible.

**Validación obligatoria:** cada palabra se cruza de manera válida, tiene pista no circular, se numera correctamente, cabe en la cuadrícula y existe en el solucionario.

**P0 de rechazo:** palabra aislada sin integración, cruce incompatible, pista que revela la respuesta o cuadrícula inutilizable.

### 25.4 Agrupar palabras y taxonomías

Debe permitir clasificar conceptos, no mostrar únicamente categorías explicadas en texto.

**Debe generar y permitir:** categorías, palabras/conceptos mezclados, regla de clasificación, arrastre o selección hacia categorías, comprobación, retroalimentación y clave docente con justificación.

**Validación obligatoria:** las categorías deben ser comprensibles y mutuamente excluyentes salvo que la consigna declare explícitamente una clasificación múltiple; cada término debe tener una ubicación justificable.

**P0 de rechazo:** una palabra puede ir en dos categorías sin que se declare, faltan elementos clasificables o no existe solución verificable.

### 25.5 Ordenar bloques y secuencias

Debe permitir ordenar pasos, hechos, acontecimientos o procesos, con una respuesta comprobable.

**Debe generar y permitir:** bloques mezclados, zona de ordenamiento, respuesta correcta, comprobación, pista opcional, explicación del orden y solucionario docente.

**Validación obligatoria:** el orden debe ser objetivo y sustentable; si hay más de un orden válido, la herramienta debe declararlo o rediseñar la actividad.

**P0 de rechazo:** secuencia sin solución única cuando se evalúa como única, pasos redundantes o sin relación temporal/lógica.

### 25.6 Tarjetas de estudio, completar frase y emparejar palabras

Estas herramientas deben ser mecanismos de práctica, no listados de preguntas y respuestas.

**Tarjetas de estudio:** anverso con pregunta/concepto/imagen; reverso con respuesta, explicación y pista; acciones “lo sé”, “debo repasar” y progreso de repaso.

**Completar frase:** oración con contexto suficiente, un espacio en blanco controlado, respuesta válida, distractores opcionales y explicación posterior.

**Emparejar palabras:** dos conjuntos de términos/definiciones/ejemplos/imágenes, interacción de unión, comprobación y clave.

**Validación común:** elementos atómicos, no repetidos, dificultad pertinente, respuesta inequívoca y feedback útil.

**P0 de rechazo:** pregunta sin respuesta determinable, distractores con más de una solución correcta no declarada o clave incompleta.

### 25.7 Casos de estudio y debate en aula

Un caso y un debate requieren estructura de pensamiento, no solo contenido narrativo.

**Caso de estudio:** situación verosímil, actores, datos, restricciones, dilema, preguntas de análisis, producto esperado y guía docente que no anticipe indebidamente la solución.

**Debate:** moción debatible, contexto neutral, roles, reglas, tiempos, fuentes o datos, argumentos iniciales, preguntas de réplica, criterios de participación, síntesis y reflexión final.

**P0 de rechazo:** caso sin información para decidir, debate sesgado por la propia consigna o solución presentada antes del análisis del estudiante.

### 25.8 Tarea de extensión y hogar, trabajo autónomo y ficha de aprendizaje

Estas herramientas deben ser fichas resolubles para el estudiante; no pueden ser planes docentes con una consigna escondida entre párrafos.

**Debe generar y permitir:**

- propósito comprensible para el estudiante;
- reto o tarea central inequívoca;
- situación, lectura, datos, imagen, problema o material de partida;
- pasos numerados;
- ejercicios, preguntas, operaciones, tablas o producto concreto;
- espacios físicos o digitales de respuesta;
- ejemplo resuelto, visualmente separado de la actividad;
- materiales auténticos;
- evidencia de entrega;
- autoevaluación marcable;
- apoyo familiar opcional que no reemplaza el trabajo;
- ajustes DUA;
- guía docente/clave separada de la ficha del estudiante.

**Validación obligatoria:** cada consigna debe tener información suficiente, la actividad debe poder resolverse con los materiales indicados, el área y competencia deben ser coherentes con el tipo de tarea y toda respuesta esperada debe tener espacio o interacción para registrarse.

**P0 de rechazo:** no existen ejercicios reales, falta espacio de respuesta, se mezclan respuestas docentes con la ficha del estudiante o la actividad no se puede resolver.

### 25.9 Evaluaciones, exámenes y preguntas sobre texto

Una evaluación debe poder aplicarse y calificarse. No puede ser una colección de preguntas sin clave, puntaje o información suficiente.

**Debe generar y permitir:**

- instrucciones y datos del estudiante;
- preguntas alineadas al propósito y nivel;
- variedad de procesos cognitivos cuando corresponda;
- puntaje por pregunta y total coherente;
- espacio de respuesta;
- clave y criterios de calificación para docente;
- versión estudiante sin respuestas y versión docente con respuestas;
- tabla de especificaciones cuando el tipo de evaluación lo requiera.

**Preguntas sobre texto:** solo pueden basarse en el texto cargado/seleccionado; deben distinguir preguntas literales, inferenciales y críticas; las respuestas docentes deben señalar evidencia o ubicación del texto.

**P0 de rechazo:** pregunta sin información para responder, más de una respuesta correcta accidental, puntaje inconsistente, clave ausente o respuesta inventada fuera del texto fuente.

### 25.10 Rúbrica de evaluación

Una rúbrica debe ser una matriz aplicable a una evidencia, no un conjunto de recomendaciones ni una lista de criterios sin niveles.

**Debe generar y permitir:**

- evidencia o producto exacto a evaluar;
- entre tres y seis criterios independientes y observables;
- niveles AD/A/B/C o la escala institucional configurada;
- descriptores distintos y progresivos por cada criterio/nivel;
- ponderaciones opcionales que sumen 100 %;
- nómina de estudiantes;
- registro de evidencia por estudiante;
- fortalezas, oportunidad de mejora y recomendación para progresar;
- exportación tabular utilizable.

**Validación obligatoria:** los criterios no se duplican ni miden dos veces lo mismo; todos los niveles miden la misma dimensión con progresión observable; se prohíben descriptores vacíos como “lo hace bien”; la recomendación debe derivar de la evidencia y del descriptor seleccionado.

**P0 de rechazo:** rúbrica sin evidencia, sin descriptores de nivel, criterios solapados o una IA que decide la calificación sin revisión docente.

### 25.11 Lista de cotejo, escala de estimación, observación y registros auxiliares

Cada instrumento debe conservar su forma de uso profesional.

**Lista de cotejo:** estudiantes en filas, indicadores observables en columnas, valores Sí/No/En proceso, observaciones y resumen de cumplimiento.

**Escala de estimación:** indicadores con niveles ordenados de frecuencia o calidad y anclajes conductuales claros para cada nivel.

**Ficha de observación:** fecha, contexto, foco, hechos objetivos, interpretación separada, acuerdos y seguimiento. Nunca confundir una observación con una opinión.

**Registros auxiliares:** estudiantes en filas; periodos, competencias, criterios o calificaciones en columnas; reglas de cálculo, filtros y exportación Excel coherente.

**P0 de rechazo:** instrumento que no permite registrar datos, columnas/filas sin semántica, cálculos no reproducibles o mezcla de hechos e interpretaciones como si fueran iguales.

### 25.12 Planificaciones: PCA, unidad, sesión, proyecto, refuerzo y carpeta pedagógica

Estas herramientas deben conservar formato de planificación institucional y no convertirse en fichas, juegos o presentaciones.

**Debe generar y permitir:** datos institucionales, modalidad/nivel/grado/área/responsables, competencia/capacidad/desempeño, propósito, evidencia, criterios, secuencia o cronograma, recursos, DUA cuando aplique, instrumento de evaluación y matrices específicas por tipo documental.

**Validación obligatoria:** cada actividad contribuye al propósito; cada evidencia está vinculada a criterios; las fechas y tiempos son posibles; las columnas de una matriz corresponden a lo que declaran; la planificación no inventa referencias curriculares.

**P0 de rechazo:** cronograma contradictorio, evidencia sin criterio, actividad sin propósito o matriz institucional incompleta.

### 25.13 Inclusión, atención, recuperación, acompañamiento y tutoría

Los productos sensibles deben ser planes o registros concretos, no consejos genéricos ni diagnósticos inventados.

**Debe generar y permitir:** barrera/necesidad identificada, objetivo medible, apoyo o ajuste específico, responsable, frecuencia, evidencia, fecha de revisión, progreso y acuerdos. Las fichas de acompañamiento deben separar motivo, hechos, voz del estudiante, orientación, derivación y seguimiento.

**Validación obligatoria:** prohibir diagnósticos clínicos inventados, separar hechos de interpretación, proteger la privacidad, impedir exposición de terceros y exigir revisión humana en alertas y casos sensibles.

**P0 de rechazo:** diagnóstico no respaldado, divulgación innecesaria de información sensible, recomendación que sustituye protocolos institucionales o alerta sin evidencia.

### 25.14 Analítica, seguimiento y calificadores con IA

Una analítica no debe inventar datos ni presentar texto como si fuera estadística.

**Debe generar y permitir:** periodo/bimestre o fechas, población analizada, indicador, fórmula, datos de origen, tendencia, alerta, evidencia, acción sugerida, responsable y fecha de revisión.

**Validación obligatoria:** cada número debe ser reproducible desde datos persistidos; declarar denominadores, datos faltantes y umbrales; diferenciar dato, patrón e hipótesis; la IA puede proponer una lectura, no crear una calificación o causa inexistente.

**P0 de rechazo:** cifras sin origen, alerta sin regla, conclusión causal inventada o valoración automática definitiva.

### 25.15 Correos, informes y comunicaciones

Estos productos deben quedar listos para revisar, copiar y enviar, con privacidad y una acción concreta.

**Debe generar y permitir:** asunto, destinatario, saludo, hechos verificables, mensaje claro, acuerdo/acción, fecha, canal de contacto y cierre. Los informes deben indicar periodo, evidencia, logros, necesidades, compromisos y responsable.

**P0 de rechazo:** datos de otros estudiantes, afirmaciones no verificables, ausencia de destinatario/acción o exposición innecesaria de información sensible.

### 25.16 Recursos externos: normativa, MINEDU, banco de recursos y canales audiovisuales

Estas herramientas deben recuperar y presentar recursos verificables; no pueden inventar nombres, enlaces o vigencias desde la memoria del modelo.

**Debe generar y permitir:** título exacto, entidad o autor, año, enlace comprobado, fecha de consulta, vigencia/estado cuando aplique, nivel/área/tema y propuesta de uso pedagógico.

**Validación obligatoria:** fuente oficial o procedencia declarada, URL válida, metadatos verificables y advertencia clara cuando no se pueda comprobar un dato.

**P0 de rechazo:** norma, libro, video, canal o enlace inventado; fuente derogada presentada como vigente; recomendación creada a partir de un recurso no recuperado.

### 25.17 Regla final de aceptación

Antes de aprobar cualquier generación, el sistema y el equipo deben responder afirmativamente:

> ¿Un docente o estudiante puede usar este producto inmediatamente, sin reconstruir lo que la herramienta prometía hacer?

Si la respuesta es no, el resultado se rechaza o queda como borrador incompleto. Un archivo bonito, largo o técnicamente descargable no es evidencia de que la herramienta funcione.

### Pruebas de aceptación de REQ-001

- [ ] Cada una de las 57 herramientas tiene ficha de identidad funcional aprobada.
- [ ] Cada campo visible influye en salida, validación, interacción, exportación o persistencia.
- [ ] Cada herramienta conserva su forma propia en pantalla y descarga.
- [ ] Vista previa, edición, backend e impresión contienen los mismos elementos funcionales.
- [ ] Cada P0 tiene una prueba automatizada de rechazo.
- [ ] Ninguna prueba certifica lógica usando solamente contenido manual o tamaño de archivo.
- [ ] El producto se puede usar por su destinatario sin reconstrucción manual.

## 26. REQ-002 · Especificación funcional individual de las 57 herramientas

**Fecha:** 2026-09-04  
**Estado:** EN EJECUCIÓN POR FASES — CONSERVAR REQUISITOS Y REGISTRAR EVIDENCIA  
**Regla:** cada ficha siguiente es un contrato de producto. La IA, el frontend, el backend, el historial y la exportación deben respetarlo. Si el resultado no cumple la ficha, no se presenta como final.

### A. Planificamos

#### 1. Plan Curricular Anual (PCA)

Debe crear un documento institucional anual, no una colección de textos. Requiere DRE, UGEL, institución, modalidad, nivel, grado/ciclo, secciones, áreas, docente/directivos, año lectivo, periodos, calendario y prioridades.

- Resultado: matriz anual con calendarización, demandas del contexto, competencias/capacidades/desempeños, metas por periodo, unidades, evidencias, recursos, evaluación, referencias y cierre.
- Interacción: seleccionar áreas, periodos, grado o ciclo; editar una matriz sin romper las relaciones; abrir un periodo o unidad desde el calendario.
- Validación: las fechas pertenecen al año lectivo; cada unidad tiene periodo, propósito, competencias, evidencia y evaluación; no hay competencias incompatibles con nivel/modalidad; los totales de semanas son posibles.
- Exportación: Word institucional y PDF, con matrices legibles y ninguna firma inventada.
- P0: periodos contradictorios, matriz vacía, fechas imposibles o evidencia sin unidad/criterio.

#### 2. Unidad de Aprendizaje

Debe construir una unidad ejecutable, conectando contexto, propósito, actividades y evidencias.

- Entrada: situación significativa, área(s), competencia, desempeño, duración, producto, contexto, saberes previos, recursos y necesidades DUA.
- Resultado: situación, propósito, criterios, evidencias, secuencia de sesiones, actividades, instrumentos, recursos, evaluación y cronograma.
- Interacción: editar sesiones, mover actividades, añadir una evidencia, ligar cada actividad a criterio y producto.
- Validación: una situación plantea un reto real; cada sesión aporta al producto; cada evidencia tiene criterio; duración y número de sesiones coinciden.
- P0: unidad con actividades desconectadas del propósito o producto sin evidencia evaluable.

#### 3. Sesión de Aprendizaje

Debe ser una guía de clase lista para ejecutar, no un resumen de tema.

- Entrada: tema, propósito, competencia, desempeño, grado, duración, recursos, evidencia, criterios, contexto y ajustes DUA.
- Resultado: inicio, desarrollo y cierre con tiempo, acción docente, acción del estudiante, preguntas, recurso, evidencia y retroalimentación; incluye instrumento o enlace al instrumento.
- Interacción: temporizador/tiempo editable, duplicar momentos, marcar recursos disponibles, abrir la actividad o instrumento asociado.
- Validación: los tiempos suman la duración; no falta inicio o cierre; cada momento tiene actividad observable; la evidencia se recoge antes del cierre.
- P0: sesión sin actividad del estudiante, sin criterio o con tiempos que exceden la clase.

#### 4. Situación significativa

Debe generar un reto contextualizado que movilice aprendizaje y no una introducción decorativa.

- Entrada: contexto local, problema, área, grado, competencia, actores, restricciones y producto posible.
- Resultado: relato breve, necesidad o tensión, actores, datos iniciales, pregunta retadora, producto, criterios de éxito y preguntas movilizadoras.
- Interacción: cambiar contexto rural/urbano/intercultural, editar actores/datos y ver qué competencias moviliza.
- Validación: el problema se puede comprender con los datos presentados; no contiene una respuesta escondida; el producto responde al reto.
- P0: reto abstracto, sin datos, sin actores o sin conexión curricular.

#### 5. Proyectos integrados

Debe gestionar un ABP interdisciplinario real.

- Entrada: desafío, áreas participantes, duración, producto público, contexto, recursos, roles, grado y competencias por área.
- Resultado: fases del proyecto, pregunta guía, aportes por área, actividades, hitos, productos parciales, producto final, criterios, evaluación, cronograma y riesgos.
- Interacción: tablero de fases, responsables, dependencia entre hitos y edición por área.
- Validación: cada área aporta algo indispensable; el producto final integra y no suma trabajos aislados; hay evidencias por fase.
- P0: proyecto con áreas listadas pero sin contribución concreta o cronograma sin hitos.

#### 6. Adaptación Inclusiva NEE (DUA)

Debe crear apoyos educativos verificables, no diagnósticos ni recomendaciones genéricas.

- Entrada: actividad original, barrera observada, modalidad, nivel, contexto, fortalezas, apoyos disponibles y responsable.
- Resultado: barrera, objetivo de acceso/participación, principio DUA, ajuste concreto, recurso, forma alternativa de respuesta, responsable, evidencia y fecha de revisión.
- Interacción: elegir barreras, aplicar ajustes a una actividad existente, comparar versión original/adaptada y registrar avance.
- Validación: un ajuste responde a una barrera concreta; no usa etiquetas clínicas no proporcionadas; conserva el propósito de aprendizaje.
- P0: diagnóstico inventado, ajuste sin barrera o adaptación que elimina el aprendizaje esperado sin justificación.

#### 7. Tarea de Extensión y Hogar

Debe ser una ficha que el estudiante pueda resolver en casa sin que la familia tenga que inventar el trabajo.

- Entrada: tema, propósito, grado, área, tiempo máximo, materiales disponibles, contexto familiar, evidencia, fecha, ajustes DUA y participación familiar opcional.
- Resultado estudiante: reto, datos/lectura/imagen de partida, pasos, ejercicios, preguntas, tablas o espacios de respuesta, ejemplo separado, reto opcional, entrega y autoevaluación. Resultado docente: clave, criterios y retroalimentación esperada.
- Interacción: completar digitalmente o imprimir; marcar avance; adjuntar evidencia; el docente revisa sin revelar la clave al estudiante.
- Validación: cada consigna es resoluble con la ficha; existe espacio para toda respuesta; familia acompaña sin reemplazar; propósito, área, actividad y criterio son coherentes.
- P0: actividad perdida en exportación, ficha sin ejercicios, sin espacio de respuesta o con soluciones visibles para estudiante.

#### 8. Carpeta Pedagógica Oficial

Debe ser un sistema de organización documental, no un documento que inventa anexos.

- Entrada: año, institución, docente, áreas, periodos y documentos que el docente ya tiene o desea crear.
- Resultado: índice navegable, secciones, anexos reales, estado de cada evidencia, responsables, fechas, documentos faltantes y enlaces al historial.
- Interacción: adjuntar, clasificar, archivar, buscar, filtrar, renombrar y abrir documentos sin duplicarlos.
- Validación: un anexo solo aparece si existe o se marca como pendiente; no hay archivos ficticios; cada elemento tiene tipo y fecha.
- P0: afirmar que un documento existe cuando no fue cargado o generado.

### B. Evaluamos

#### 9. Rúbrica de evaluación

Debe ser una matriz aplicable a una evidencia específica.

- Entrada: producto/evidencia, área, competencia, desempeño, grado, criterios, escala, ponderación y nómina.
- Resultado: 3–6 criterios independientes, niveles AD/A/B/C u otra escala, descriptores observables por nivel, ponderación, tabla de evaluación y feedback por estudiante.
- Interacción: editar criterios/niveles, seleccionar nivel por estudiante, adjuntar evidencia, calcular resultado y redactar recomendación con IA como borrador.
- Validación: descriptores progresan en la misma dimensión; criterios no se solapan; pesos suman 100 % cuando se usan; IA no decide la nota final.
- P0: rúbrica sin evidencia, descriptores vagos, criterios repetidos o calificación automática sin docente.

#### 10. Lista de cotejo

Debe ser un registro binario o de progreso aplicado a estudiantes.

- Entrada: competencia/evidencia, indicadores observables, nómina, periodo, valores permitidos y observaciones.
- Resultado: estudiantes en filas, indicadores en columnas, Sí/No/En proceso, observación, resumen individual y resumen grupal.
- Interacción: marcar por celda, filtrar estudiantes/periodo, registrar evidencia y exportar Excel.
- Validación: un indicador mide una acción observable; no hay indicadores dobles; cada marca pertenece a estudiante y criterio existentes.
- P0: tabla sin estudiantes o indicadores, valores sin significado o exportación que altera filas/columnas.

#### 11. Ficha de aprendizaje

Debe enseñar y permitir practicar.

- Entrada: tema, grado, área, propósito, contenido previo, dificultad, cantidad de actividades, materiales y DUA.
- Resultado estudiante: explicación breve, ejemplo resuelto, práctica guiada, práctica autónoma, reto, espacios de respuesta y autoevaluación. Resultado docente: respuestas y criterios.
- Interacción: responder, guardar borrador, adjuntar foto/archivo cuando se solicite y recibir feedback posterior.
- Validación: la explicación ayuda a resolver la práctica; cada ejercicio tiene datos suficientes; el ejemplo no copia la respuesta del reto.
- P0: ficha solo informativa, sin práctica, sin espacios o con clave visible al estudiante.

#### 12. Examen

Debe ser aplicable, calificable y proporcional al nivel.

- Entrada: competencias, contenidos, grado, tiempo, cantidad/tipo de preguntas, dificultad, puntaje y texto/material fuente si aplica.
- Resultado: instrucciones, datos del estudiante, preguntas organizadas, puntajes, espacio de respuesta, tabla de especificaciones, clave y rúbrica/criterio docente.
- Interacción: modo estudiante, revisión docente, calificación por ítem, control de tiempo opcional y exportación separada de clave.
- Validación: puntajes suman correctamente; pregunta tiene respuesta determinable; dificultad y verbo cognitivo son adecuados; clave coincide con ítem.
- P0: clave faltante, pregunta ambigua, total incorrecto o evaluación sin información de resolución.

#### 13. Escala de estimación

Debe medir frecuencia o calidad de desempeño mediante niveles definidos.

- Entrada: conducta/indicador, escala institucional, contexto, estudiantes, periodo y evidencia.
- Resultado: matriz con indicadores, niveles ordenados, anclajes observables, registros, observaciones y síntesis.
- Interacción: elegir nivel, explicar una marca, filtrar y comparar periodos.
- Validación: niveles tienen una progresión comprensible; no mezclan frecuencia con calidad sin declararlo; indicador es observable.
- P0: niveles sin definición, indicador subjetivo o escala imposible de interpretar.

#### 14. Preguntas sobre texto

Debe analizar un texto real, no inventar contenido.

- Entrada: texto/PDF/Word, grado, área, objetivo, cantidad de preguntas y distribución literal/inferencial/crítica.
- Resultado estudiante: texto o referencia autorizada, preguntas, espacios de respuesta e instrucciones. Resultado docente: respuestas justificadas con evidencia textual.
- Interacción: subir archivo, previsualizar extracción, seleccionar fragmentos, editar preguntas y exportar ambas versiones.
- Validación: cada respuesta se sustenta en fragmento existente; no se inventan personajes/datos; balance de niveles cognitivos respetado.
- P0: pregunta o respuesta fuera del texto fuente, extracción incompleta no declarada o clave sin evidencia.

#### 15. Ficha de observación

Debe registrar observaciones profesionales separando hecho e interpretación.

- Entrada: estudiante/grupo, fecha, situación, foco, contexto, hechos, evidencia y seguimiento.
- Resultado: registro cronológico con hechos objetivos, contexto, interpretación docente separada, conclusión, acuerdos y próxima revisión.
- Interacción: captura rápida, voz a texto opcional, adjuntos, historial y filtros por estudiante/fecha.
- Validación: hechos no contienen juicios; interpretación se identifica como tal; seguimiento tiene responsable y fecha.
- P0: diagnóstico inventado, mezcla de opinión con hecho o datos sensibles sin control de acceso.

#### 16. Registros auxiliares

Debe ser una hoja de seguimiento, no una tabla estática.

- Entrada: nómina, áreas, competencias, periodos, criterios, escala y reglas de cálculo.
- Resultado: estudiantes en filas, variables en columnas, promedios/resúmenes, observaciones, filtros, alertas y exportación Excel.
- Interacción: editar celda, importar/exportar, filtrar, congelar encabezados y visualizar progreso.
- Validación: fórmulas reproducibles en backend; columnas describen la misma unidad; no se calculan promedios de escalas incompatibles.
- P0: cálculo no trazable, filas/estudiantes perdidos o datos no persistidos.

#### 17. Carpetas de recuperación

Debe gestionar recuperación individual o por grupo con actividades graduadas.

- Entrada: estudiante(s), diagnóstico, competencia, brecha, nivel, periodo, meta, tiempo y recursos.
- Resultado: plan de recuperación, actividades base y avanzadas, evidencias, fechas, criterios, feedback y prueba de salida.
- Interacción: carga de estudiantes en lote o individual, asignación de actividades, progreso y reapertura de carpeta.
- Validación: toda actividad responde a brecha diagnosticada; hay evidencia de inicio y salida; no se borra personalización al cargar lote.
- P0: carpeta sin meta, sin actividad resoluble o con estudiantes mezclados incorrectamente.

#### 18. Calificador de rúbricas con IA

Debe asistir feedback, no sustituir juicio docente.

- Entrada: rúbrica existente, evidencia del estudiante, nivel marcado por docente, fortalezas y necesidad de mejora.
- Resultado: explicación de la decisión, evidencia citada, fortaleza, siguiente paso y recomendación editable.
- Interacción: docente confirma/edita/descarta sugerencia; historial de decisión; nunca se cambia nivel sin confirmación.
- Validación: recomendación depende de evidencia y descriptor; no promete certeza; no revela información de otro estudiante.
- P0: IA asigna nota definitiva, inventa evidencia o altera rúbrica.

#### 19. Retroalimentación formativa

Debe ayudar al estudiante a avanzar con acciones concretas.

- Entrada: evidencia, criterio, logro, dificultad, nivel, tono, formato y siguiente aprendizaje.
- Resultado: mensaje con evidencia observada, fortaleza, brecha, pregunta/reflexión, acción siguiente y plazo o momento de revisión.
- Interacción: copiar, adaptar tono, guardar en historial del estudiante y vincular a una evaluación.
- Validación: no usar elogios vacíos; no señalar identidad personal; toda recomendación es realizable.
- P0: feedback sin evidencia, humillante, genérico o que contradice la evaluación registrada.

#### 20. Analítica de aula y alertas

Debe analizar registros reales del aula.

- Entrada: periodo, grupo, área, competencia, criterios, fuentes de datos, umbrales y filtros.
- Resultado: indicadores, denominadores, gráficos, tendencias, estudiantes/grupos que requieren apoyo, alertas explicables y acciones sugeridas.
- Interacción: filtrar, abrir evidencia de una alerta, ajustar umbral y registrar acción tomada.
- Validación: cada cifra se reproduce desde backend; distingue datos faltantes; no inventa causas o diagnósticos.
- P0: gráfico sin datos reales, alerta sin regla o porcentaje sin denominador.

### C. Incluimos

#### 21. Plan de atención

Debe crear un plan de apoyo con seguimiento verificable.

- Entrada: estudiante/grupo, barrera/necesidad observada, fortalezas, objetivo, apoyos, responsables, frecuencia y fecha de revisión.
- Resultado: línea base, objetivo medible, acciones, recursos, responsables, evidencias, cronograma, acuerdos y evaluación de avance.
- Interacción: editar metas, registrar evidencia, revisar progreso y compartir solo con usuarios autorizados.
- Validación: objetivo medible, apoyo proporcional y responsable/fecha presentes; no diagnostica sin información válida.
- P0: plan sin evidencia, sin revisión o con información sensible expuesta.

#### 22. Estrategias de inclusión

Debe recomendar estrategias aplicables a una barrera y actividad concretas.

- Entrada: actividad, barrera, nivel, recursos, tamaño de grupo, contexto y principio DUA.
- Resultado: estrategia paso a paso, material, ajuste, alternativa de participación, indicador de acceso y forma de verificar eficacia.
- Interacción: seleccionar estrategia, adaptarla a sesión/ficha y guardar como favorito.
- Validación: estrategia responde a una barrera real y conserva propósito; no propone apoyos imposibles sin alternativa.
- P0: consejo genérico que no se puede aplicar o intervención discriminatoria.

#### 23. Trabajo con familias

Debe crear colaboración respetuosa, no trasladar la responsabilidad educativa a la familia.

- Entrada: objetivo, situación, canal, idioma, disponibilidad familiar, acciones posibles y fecha.
- Resultado: comunicación, acuerdo, actividades breves opcionales, recursos accesibles, responsable, seguimiento y devolución.
- Interacción: copiar mensaje, registrar respuesta, marcar acuerdo y programar revisión.
- Validación: lenguaje claro, no culpabilizador; no revela datos de terceros; actividades no requieren recursos inaccesibles.
- P0: información sensible, exigencia desproporcionada o mensaje sin acción concreta.

#### 24. Seguimiento y evaluación inclusiva

Debe mostrar si los apoyos favorecen participación y progreso.

- Entrada: línea base, objetivo, barrera, estrategia, evidencia, periodo y responsable.
- Resultado: comparación temporal, avance, barreras persistentes, ajuste acordado, evidencia y próxima fecha.
- Interacción: registrar evidencia, ver tendencias, revisar ajustes y enlazar plan de atención.
- Validación: no confunde asistencia con progreso; cada conclusión tiene evidencia; datos faltantes se declaran.
- P0: concluir mejora sin evidencia o mantener apoyo sin fecha de revisión.

### D. Reforzamos

#### 25. Trabajo autónomo para el hogar

Debe ser una práctica breve y autónoma, no una planificación docente.

- Entrada: brecha, tema, nivel, tiempo, frecuencia máxima, materiales, apoyo familiar y evidencia.
- Resultado: ruta semanal, actividades graduadas, ejemplo, respuestas, autoevaluación, reto opcional y guía docente.
- Interacción: marcar sesiones, guardar respuestas, adjuntar evidencia y retomar avance.
- Validación: máximo de sesiones/frecuencia configurado; cada actividad es resoluble; carga razonable para edad.
- P0: ruta sin tarea concreta, sin respuesta posible o excesiva para el tiempo indicado.

#### 26. Carpeta de recuperación

Debe permitir recuperar un aprendizaje priorizado mediante progresión.

- Entrada: diagnóstico, competencia, criterios no logrados, estudiante/grupo, plazo, recursos y meta.
- Resultado: diagnóstico inicial, actividades de apoyo, práctica guiada, práctica autónoma, verificación final, soluciones y registro de avance.
- Interacción: asignar por estudiante, desbloquear etapas y comparar entrada/salida.
- Validación: dificultad aumenta gradualmente; prueba final evalúa la misma brecha; existe retroalimentación entre etapas.
- P0: actividades sin relación al diagnóstico o ausencia de prueba de salida.

#### 27. Monitorea avances

Debe ofrecer una lectura temporal de progreso real.

- Entrada: bimestre/fechas, estudiantes, competencia, capacidades, desempeños y fuente de registros.
- Resultado: línea de progreso, distribución de niveles, alertas, evidencias y acciones de refuerzo.
- Interacción: seleccionar periodo, comparar grupos, abrir estudiante y exportar vista.
- Validación: no compara escalas distintas sin normalización; señala datos incompletos y fecha de actualización.
- P0: tendencia fabricada, periodo mezclado o cálculo no reproducible.

#### 28. Acompaña y motiva

Debe generar acompañamiento individual basado en evidencia.

- Entrada: logro observado, reto actual, preferencia del estudiante, meta, contexto y tono.
- Resultado: reconocimiento específico, estrategia pequeña, acuerdo, recurso, frase de aliento y seguimiento.
- Interacción: editar, copiar, registrar entrega y verificar cumplimiento.
- Validación: no etiquetar al estudiante; no prometer resultados; mensaje vinculable a una meta observable.
- P0: motivación genérica sin contexto o mensaje que juzga/discrimina.

#### 29. Plan de refuerzo

Debe organizar una intervención breve y eficaz.

- Entrada: brecha, estudiantes, competencia, duración, máximo tres sesiones, recursos, estrategias y evidencia.
- Resultado: diagnóstico, meta, sesiones con modelado/práctica/verificación, materiales, criterios, instrumentos y evaluación de salida.
- Interacción: elegir frecuencia, duplicar sesión, registrar asistencia/evidencia y reajustar meta.
- Validación: sesiones responden a brecha; duración posible; evidencia final compara con línea base.
- P0: plan centrado solo en cantidad de páginas o sesiones sin actividades concretas.

### E. Acompañamos

#### 30. Correo a familias

Debe ser una comunicación lista para revisar y enviar.

- Entrada: destinatario, motivo, hechos, tono, acuerdo, fecha, canal y datos autorizados.
- Resultado: asunto, saludo, mensaje claro, hechos verificables, solicitud/acción, cierre y firma configurable.
- Interacción: copiar, editar, guardar borrador, registrar envío y respuesta.
- Validación: lenguaje respetuoso, breve y sin datos de terceros; incluye acción concreta.
- P0: información privada indebida, tono acusatorio o afirmaciones no verificables.

#### 31. Respuesta de correo

Debe responder lo que una familia preguntó, no producir un correo genérico.

- Entrada: correo original, hechos disponibles, límites de privacidad, acuerdo posible y tono.
- Resultado: respuesta que reconoce cada punto, aclara hechos, propone siguiente paso y evita compromisos no autorizados.
- Interacción: comparar mensaje original/respuesta, editar y copiar.
- Validación: no ignora preguntas centrales; no inventa datos ni comparte información de otros estudiantes.
- P0: respuesta que evade, promete algo imposible o revela datos sensibles.

#### 32. Analítica de acompañamiento y alertas

Debe priorizar seguimiento con base en evidencia y no etiquetar estudiantes.

- Entrada: indicadores, periodo, grupos, registros, umbrales y responsables.
- Resultado: prioridades, nivel de alerta, evidencia asociada, acción sugerida, responsable y fecha.
- Interacción: filtrar, justificar alerta, registrar acción y cerrar/reabrir caso.
- Validación: alerta explicable; datos y umbral visibles; no usar IA para diagnosticar causas personales.
- P0: alerta sin fuente de datos, clasificación sensible automática o falta de control de acceso.

#### 33. Calificador con IA

Debe asistir al docente en análisis de evidencia con criterios seleccionados.

- Entrada: evidencia, criterios/rúbrica, nivel, respuesta esperada, observaciones y contexto.
- Resultado: análisis por criterio, evidencia citada, propuesta de feedback y dudas que requieren revisión docente.
- Interacción: aceptar/editar/rechazar; decisión humana obligatoria; historial de versiones.
- Validación: no asigna resultado definitivo; señala incertidumbre; no evalúa contenido no cargado.
- P0: decisión automática, evidencia inventada o modificación silenciosa de nota.

#### 34. Reporte de seguimiento

Debe mostrar avances y acuerdos en el tiempo.

- Entrada: periodo, objetivo anterior, evidencias, avances, dificultades, acuerdos y responsables.
- Resultado: informe con comparación temporal, hechos, logros, necesidades, compromisos y próxima revisión.
- Interacción: editar, compartir con roles autorizados y enlazar evidencias.
- Validación: separa dato de interpretación; toda recomendación tiene responsable y fecha.
- P0: informe sin periodo/evidencia o con información privada no autorizada.

### F. Tutoría

#### 35. Plan de tutoría

Debe organizar el acompañamiento tutorial del periodo.

- Entrada: diagnóstico grupal, grado, periodo, ejes temáticos, calendario, necesidades y participación familiar.
- Resultado: objetivos, sesiones, estrategias, cronograma, recursos, trabajo con familias, indicadores y evaluación.
- Interacción: reordenar sesiones, abrir sesión asociada, registrar ejecución y evaluar el plan.
- Validación: objetivos se reflejan en sesiones; calendario posible; no se generan casos sensibles ficticios.
- P0: plan sin diagnóstico, sesiones aisladas o actividades sin propósito tutorial.

#### 36. Sesiones de tutoría

Debe facilitar una experiencia socioemocional segura.

- Entrada: tema, edad, duración, objetivo, contexto, recursos, nivel de sensibilidad y acuerdos de cuidado.
- Resultado: apertura segura, dinámica, preguntas, actividad, reflexión, acuerdo, cierre y ruta de apoyo si aparece una situación sensible.
- Interacción: notas docentes, temporizador, variantes de participación y registro de acuerdos grupales.
- Validación: lenguaje adecuado; no obliga a revelar experiencias personales; cada dinámica tiene cierre protector.
- P0: actividad que expone estudiantes, carece de ruta de apoyo o trata temas sensibles sin salvaguardas.

#### 37. Informe de tutoría

Debe consolidar acciones reales de un periodo.

- Entrada: periodo, sesiones realizadas, atenciones, evidencias agregadas, logros, dificultades y acuerdos.
- Resultado: informe con acciones, resultados, casos anonimizados, necesidades, recomendaciones y próximos pasos.
- Interacción: seleccionar evidencias, anonimizar y exportar para directivos autorizados.
- Validación: no inventa atenciones; datos sensibles se agregan o anonimizan; distingue hechos de análisis.
- P0: nombres/detalles sensibles no autorizados o acciones reportadas sin registro.

#### 38. Informe a padres de familia

Debe comunicar información útil y privada de manera comprensible.

- Entrada: estudiante/familia autorizada, periodo, evidencias, avances, necesidad, acuerdos y tono.
- Resultado: mensaje con fortalezas, necesidad concreta, apoyo posible en casa, acuerdo y fecha de seguimiento.
- Interacción: revisar, adaptar tono, copiar, registrar entrega y respuesta.
- Validación: evita jerga, comparaciones con otros estudiantes y diagnósticos no confirmados.
- P0: divulgar datos de terceros o usar lenguaje estigmatizante.

#### 39. Fichas de acompañamiento

Debe registrar una conversación o intervención con continuidad.

- Entrada: motivo, fecha, participantes, hechos, voz del estudiante/familia, orientación, acuerdos y derivación.
- Resultado: ficha con secciones separadas, compromisos, responsable, fecha de seguimiento y adjuntos autorizados.
- Interacción: guardar borrador, firmar/confirmar cuando aplique y consultar historial protegido.
- Validación: no reescribe la voz del estudiante como hecho docente; derivaciones requieren motivo y responsable.
- P0: ficha sin control de acceso o sin separación entre relato, hecho e interpretación.

#### 40. Alertas y casos

Debe documentar y canalizar, no diagnosticar ni resolver automáticamente.

- Entrada: hechos observados, fecha, evidencia, nivel de urgencia, personas autorizadas y protocolo institucional.
- Resultado: registro de hechos, medidas inmediatas, responsables, ruta de derivación, seguimiento y auditoría de acciones.
- Interacción: acceso restringido, registro de decisiones, adjuntos protegidos y cierre controlado.
- Validación: la IA no diagnostica; todo riesgo tiene protocolo y revisión humana; no hay datos innecesarios.
- P0: caso sensible accesible sin autorización o recomendación que sustituye protección institucional.

#### 41. Recursos de tutoría

Debe ofrecer materiales utilizables, no solo enlaces o ideas.

- Entrada: tema, edad, duración, propósito, tamaño de grupo, recursos y sensibilidad.
- Resultado: dinámica/ficha/lectura/juego con objetivo, materiales, preparación, pasos, preguntas, cuidado, cierre y adaptación.
- Interacción: guardar favorito, añadir a una sesión y descargar versión imprimible.
- Validación: recurso corresponde a edad y tema; no requiere materiales inaccesibles; incluye forma de cierre.
- P0: recurso peligroso, sin instrucciones o inapropiado para la edad.

#### 42. Orientación vocacional

Debe abrir opciones y planificar exploración, no decidir por el estudiante.

- Entrada: intereses, fortalezas, experiencias, contexto, opciones conocidas, restricciones y metas.
- Resultado: perfil exploratorio, opciones múltiples, preguntas de investigación, actividades de exploración, recursos y plan de acción revisable.
- Interacción: autoevaluación, favoritos, metas, evidencias de exploración y actualización del perfil.
- Validación: no determina carrera; diferencia interés de capacidad; presenta rutas diversas y verificables.
- P0: recomendación determinista, prejuicios por contexto o datos de opciones inventados.

### G. Recursos didácticos

#### 43. Presentaciones didácticas

Debe crear una secuencia visual para enseñar, no diapositivas que parezcan formularios o documentos.

- Entrada: tema, modalidad, nivel, grado, área, competencia, propósito, cantidad máxima de 8 diapositivas, duración, saberes previos, estilo, contexto, conceptos obligatorios, interacción y DUA.
- Resultado: secuencia adaptable de portada, conexión con saberes previos, propósito, conceptos, ejemplo guiado, interacción, aplicación y cierre; cada diapositiva incluye título, contenido breve, composición visual, interacción y notas docentes separadas.
- Interacción: editar contenido/imagen/notas, cambiar tipo de diapositiva, mover, duplicar, eliminar, regenerar solo texto/imagen/diapositiva, presentar y descargar PPTX/PDF.
- Validación: una idea por diapositiva; límites de texto; contraste; ningún objeto superpuesto o fuera del lienzo; imagen pertinente; ejemplo e interacción reales; notas docentes no visibles al estudiante.
- P0: contenido amontonado, texto ilegible, campos administrativos dentro de la diapositiva, falta de cierre/interacción o exportación distinta al editor.

#### 44. Tarjetas de estudio

Debe implementar repaso activo.

- Entrada: tema, nivel, cantidad, dificultad, formato pregunta/concepto/imagen y pista.
- Resultado: anverso, reverso, respuesta, explicación, pista y etiqueta temática para cada tarjeta.
- Interacción: voltear, marcar “lo sé/debo repasar”, repetir falladas, barajar, medir avance e imprimir.
- Validación: pregunta atómica, respuesta única o alternativas declaradas, sin duplicados y con dificultad adecuada.
- P0: tarjetas repetidas, respuestas incorrectas o sin mecanismo de repaso.

#### 45. Agrupar palabras y taxonomías

Debe permitir clasificar conceptos.

- Entrada: tema, grado, categorías, número de elementos, complejidad y explicación deseada.
- Resultado: categorías, términos mezclados, consigna, solución, explicación de clasificación y feedback.
- Interacción: arrastrar/seleccionar término, comprobar, reintentar, ver pistas y guardar resultado.
- Validación: categoría excluyente o ambigüedad declarada; cada elemento tiene clasificación válida; no existen elementos repetidos.
- P0: término sin categoría, múltiples soluciones ocultas o imposibilidad de completar.

#### 46. Ordenar bloques y secuencias

Debe enseñar orden lógico, temporal o procedimental.

- Entrada: proceso, nivel, cantidad de pasos, tipo de secuencia, pistas y contexto.
- Resultado: bloques mezclados, orden correcto, explicación de cada transición y solución docente.
- Interacción: arrastrar bloques, comprobar, recibir feedback y reiniciar.
- Validación: orden único o alternativas declaradas; bloques autosuficientes; no falta paso esencial.
- P0: secuencia imposible, ambigua o con solución sin justificación.

#### 47. Casos de estudio (ABP)

Debe presentar un dilema que requiera investigar y decidir.

- Entrada: tema, complejidad, extensión, actores, datos obligatorios, foco curricular y número de preguntas.
- Resultado: relato, contexto, personajes, dilema, datos/evidencias, preguntas de análisis, reto ABP, producto y guía docente.
- Interacción: leer, subrayar datos, responder, adjuntar producto y consultar rúbrica.
- Validación: caso tiene información suficiente; preguntas no revelan solución; solución docente se separa.
- P0: dilema falso, datos contradictorios o producto sin relación con caso.

#### 48. Juego del ahorcado educativo

Debe ser un juego de vocabulario comprobable.

- Entrada: tema, nivel, palabras, pistas, cantidad de intentos y normalización de tildes/ñ.
- Resultado: palabras, pistas educativas, letras permitidas, solución y feedback final.
- Interacción: seleccionar teclado, registrar letras usadas, mostrar intentos y pasar a siguiente palabra.
- Validación: palabra pertenece al tema, pista no la revela, normalización consistente y respuesta aceptada con/sin tilde según regla.
- P0: palabra inválida, pista que revela respuesta o imposibilidad de completarla.

#### 49. Completa la frase

Debe practicar comprensión y uso de conceptos en contexto.

- Entrada: tema, nivel, cantidad, banco de palabras, distractores y dificultad.
- Resultado: oraciones con un espacio controlado, respuesta, distractores, explicación y clave docente.
- Interacción: escribir/elegir, comprobar, recibir pista y reintentar.
- Validación: una respuesta preferida, concordancia gramatical, contexto suficiente y un único espacio cuando así se configure.
- P0: oración con múltiples respuestas no declaradas, respuesta incongruente o espacio mal formado.

#### 50. Emparejar palabras y glosarios

Debe relacionar pares conceptuales reales.

- Entrada: tema, pares, tipo de relación, nivel, imágenes/ejemplos y dificultad.
- Resultado: dos conjuntos desordenados, pares correctos, explicación y solución.
- Interacción: unir pares, deshacer, comprobar y recibir feedback.
- Validación: cada término tiene un único par o relación declarada; definiciones no se copian entre sí; no hay pistas de posición.
- P0: pares ambiguos, término repetido o solución incompleta.

#### 51. Dinámica de debate en aula

Debe facilitar pensamiento crítico y convivencia.

- Entrada: moción, edad, contexto, duración, roles, fuentes/datos, normas y criterios.
- Resultado: moción neutral, contexto, roles, reglas, tiempos, argumentos iniciales, preguntas de réplica, criterios y síntesis.
- Interacción: asignar roles, temporizar turnos, registrar argumentos y cerrar con reflexión.
- Validación: tema apto para edad, no sesga postura, incluye respeto y no exige revelar experiencias privadas.
- P0: moción dañina, sesgada, sin reglas o sin protección para participación.

#### 52. Crucigramas

Debe generar un rompecabezas con cruces comprobables.

- Entrada: tema, palabras, máximo de términos, dificultad, tipo de pistas y tamaño.
- Resultado: cuadrícula numerada, casillas bloqueadas, palabras horizontales/verticales, pistas y solucionario.
- Interacción: ingresar letras, navegar, comprobar y revelar solución docente.
- Validación: cada palabra cabe, cruza correctamente, se numera y tiene pista no circular; cuadrícula imprimible.
- P0: palabra aislada, cruce inválido, pista que da respuesta o solución incompleta.

#### 53. Sopas de letras

Debe ser una actividad interactiva e imprimible.

- Entrada: tema, lista/máximo de palabras, dirección permitida, dificultad, tamaño y pistas opcionales.
- Resultado: cuadrícula, banco de palabras, letras de relleno, solución marcada y guía docente.
- Interacción: seleccionar letras consecutivas, marcar aciertos, mostrar pendientes, comprobar y reiniciar.
- Validación: toda palabra está en cuadrícula, no sale de límites, dirección permitida y cuadrícula proporcional.
- P0: banco no coincide, palabra ausente, actividad no seleccionable o solución errónea.

#### 54. Banco de recursos para planificar

Debe organizar recursos aplicables, no inventar una lista de nombres.

- Entrada: tema, nivel, área, momento de sesión, tiempo, recursos disponibles y objetivo.
- Resultado: actividades/materiales por inicio-desarrollo-cierre, con duración, pasos, adaptación, evidencia y procedencia.
- Interacción: filtrar, guardar favorito, añadir a sesión/unidad, copiar y registrar uso.
- Validación: recurso tiene propósito, pasos y tiempo; procedencia declarada si es externo; no duplica recursos irrelevantes.
- P0: fuente inventada, recurso sin instrucciones o actividad incompatible con grado.

#### 55. Normativa educativa

Debe ofrecer normas comprobadas y vigentes.

- Entrada: tema normativo, entidad, fecha, ámbito, consulta y palabras clave.
- Resultado: título exacto, tipo/número, entidad, fecha, vigencia, artículo relevante, resumen y URL oficial con fecha de consulta.
- Interacción: abrir fuente, guardar referencia, filtrar por vigencia y copiar cita.
- Validación: URL responde, origen oficial o declarado, fecha/estado verificable y resumen diferenciado de texto legal.
- P0: norma inventada, enlace falso o documento derogado presentado como vigente.

#### 56. Libros y guías MINEDU

Debe recuperar materiales oficiales o declarar claramente su procedencia.

- Entrada: nivel, grado, área, tema, año, idioma y tipo de material.
- Resultado: título, entidad, año, nivel/área, enlace comprobado, disponibilidad, descripción y propuesta didáctica.
- Interacción: abrir, guardar, filtrar, añadir a sesión y reportar enlace roto.
- Validación: metadatos coinciden con fuente, enlace válido, no se inventan libros ni se atribuyen a MINEDU sin respaldo.
- P0: material inexistente, enlace no verificado o atribución institucional falsa.

#### 57. Canales audiovisuales

Debe seleccionar recursos visuales seguros y útiles para una clase.

- Entrada: tema, nivel, área, duración máxima, idioma, tipo de recurso y momento didáctico.
- Resultado: título, canal/autor, duración, enlace, fecha, sinopsis, calidad, advertencias, preguntas antes-durante-después y uso en sesión.
- Interacción: previsualizar, guardar favorito, añadir a sesión, reportar problema y crear guía de visualización.
- Validación: enlace y duración comprobados, contenido adecuado a edad, calidad mínima, procedencia visible y actividad pedagógica asociada.
- P0: video inexistente/no verificable, contenido inadecuado, enlace roto o uso sin objetivo pedagógico.

### Pruebas de aceptación de REQ-002

- [ ] Cada herramienta tiene entrada, salida, interacción, validación, persistencia y exportación definidas.
- [ ] Ninguna herramienta usa una vista genérica si su producto requiere una experiencia especializada.
- [ ] Las pruebas incluyen un caso correcto y un caso P0 rechazado para cada herramienta.
- [ ] El historial guarda el objeto completo y no solo texto plano.
- [ ] Las descargas conservan las características funcionales de la herramienta.
- [ ] El contenido generado se adapta a modalidad, nivel, grado, área, contexto y destinatario.

## 27. REQ-003 · Calidad pedagógica, continuidad y control responsable de IA

**Fecha:** 2026-09-04  
**Estado:** EN EJECUCIÓN POR FASES — CONSERVAR REQUISITOS Y REGISTRAR EVIDENCIA  
**Propósito:** impedir que una herramienta genere contenido genérico, aislado, repetido o pedagógicamente imposible de aplicar, aunque su archivo sea visualmente correcto.

### 27.1 Perfil pedagógico reutilizable

Cada generación debe recibir un perfil de contexto consistente y versionado: docente, institución, modalidad, nivel, grado/ciclo, sección, área, competencia, calendario, contexto rural/urbano/intercultural, idioma, necesidades DUA y recursos disponibles.

- El perfil se autocompleta desde datos aprobados, pero el docente puede corregirlo antes de generar.
- Solo se reutiliza información pertinente y autorizada para la herramienta activa.
- El resultado debe registrar qué versión del perfil utilizó.
- Una contradicción entre perfil y formulario debe solicitar corrección antes de generar.

### 27.2 Mapa pedagógico entre herramientas

Los productos no deben vivir aislados. Debe existir una relación trazable:

`PCA → Unidad → Sesión → Presentación/Ficha/Tarea → Evidencia → Rúbrica/Lista → Analítica → Refuerzo/Retroalimentación`

Y para inclusión:

`Plan de atención → Ajuste DUA → Actividad adaptada → Evidencia → Seguimiento`

- El docente decide qué datos enlazar o reutilizar.
- La copia de contexto no debe reemplazar la revisión del docente.
- Cada vínculo debe conservar origen, versión y fecha.
- Un cambio en un producto padre debe avisar a productos vinculados, pero nunca sobrescribirlos sin confirmación.

### 27.3 Patrones pedagógicos por finalidad

Antes de generar, cada herramienta debe permitir escoger un patrón funcional cuando corresponda. Ejemplos:

- tarea de aplicación, investigación, observación, creación o práctica;
- ficha de comprensión, resolución de problemas, laboratorio, lectura o producción;
- presentación de concepto, procedimiento, caso, comparación o proyecto;
- rúbrica de producto, exposición, proceso, debate o trabajo colaborativo;
- evaluación diagnóstica, formativa, sumativa o de recuperación.

El patrón modifica estructura, tipo de actividades, criterios, ejemplos y exportación. No se debe usar el mismo prompt para productos de finalidades distintas.

### 27.4 Ejemplos funcionales en los formularios

Cada campo debe mostrar un ejemplo útil y contextualizado para la herramienta activa.

- No usar placeholders vacíos como “ingrese información”.
- Las tareas deben mostrar ejemplos de datos, tablas y consignas.
- Las rúbricas deben mostrar criterios y descriptores observables.
- Las planificaciones deben mostrar ejemplos de evidencia, cronograma y actividades.
- Los ejemplos se adaptan a grado, área y modalidad y se distinguen claramente de una respuesta final.

### 27.5 Biblioteca interna de patrones validados

Crear una biblioteca de estructuras pedagógicas revisadas para evitar que toda generación dependa de invención libre.

- Plantillas para lectura, fracciones, escritura, experimentos, debate, tutoría, recuperación, evaluación y actividades de hogar.
- Cada plantilla tendrá nivel, propósito, pasos, tipo de evidencia, criterios y variantes DUA.
- La IA adapta una estructura validada al contexto docente; no la copia literalmente ni inventa el formato desde cero.
- Cada uso de plantilla queda registrado para detectar repetición.

### 27.6 Diversidad y control de repetición

El sistema debe detectar repetición de actividades, ejemplos, preguntas, respuestas, imágenes, cierres y recomendaciones.

- Comparar con resultados recientes del mismo docente, grado y herramienta.
- Cambiar formato de interacción, ejemplo, contexto o estrategia cuando una estructura se repite demasiado.
- Informar al docente si se reutiliza una actividad por decisión explícita.
- No sacrificar coherencia por variedad artificial: la variación debe ser pedagógicamente pertinente.

### 27.7 Carga de trabajo y tiempo real

Toda actividad debe estimar tiempo y carga según edad, complejidad y recursos.

- Las sesiones deben sumar tiempos reales.
- Las tareas de hogar deben tener duración máxima visible y carga razonable.
- Las evaluaciones deben caber dentro del tiempo indicado.
- Las presentaciones deben corresponder a la duración de la clase.
- Si se excede el tiempo configurado, el sistema debe proponer recortar, dividir o convertir actividades en opcionales.

### 27.8 Edad, lenguaje y nivel lector

La IA debe adaptar vocabulario, extensión, abstracción, instrucciones y ejemplos al nivel real.

- Inicial/primaria: consignas cortas, material concreto, apoyo visual y menor carga textual.
- Secundaria/EBA: mayor autonomía, análisis, fuentes y argumentación según corresponda.
- EBE/EBEE: alternativas de acceso, expresión y participación según el perfil definido.
- El validador debe alertar vocabulario o longitud inadecuada para el nivel seleccionado.

### 27.9 Separación de consigna, ejemplo, respuesta y clave

Toda herramienta con preguntas o actividades debe etiquetar y separar:

- consigna para el estudiante;
- información/datos de partida;
- ejemplo guiado;
- actividad por resolver;
- respuesta o solución esperada;
- distractor, si corresponde;
- explicación/retroalimentación;
- clave exclusiva para el docente.

La versión del estudiante nunca puede revelar respuesta, criterio oculto o solucionario. La versión docente no puede omitir la clave necesaria para revisar.

### 27.10 Consistencia interna automática

Antes de presentar un resultado, el sistema debe buscar contradicciones entre título, tema, área, competencia, actividad, evidencia, criterio, nivel, duración y exportación.

Ejemplos de rechazo o advertencia:

- título de fracciones y actividades de otro tema;
- competencia de Comunicación con criterios de Matemática sin integración declarada;
- rúbrica de exposición para una tarea de cálculo;
- lenguaje universitario en primaria;
- “8 actividades” declaradas pero solo 3 generadas;
- imagen que contradice el contenido o contexto.

### 27.11 Edición y regeneración por bloques

El docente debe corregir solo la parte defectuosa sin perder contenido aprobado.

- Regenerar una pregunta, criterio, tabla, actividad, ejemplo, recomendación, imagen, diapositiva o momento de sesión.
- Conservar bloques aprobados y su historial.
- Explicar qué contexto usa la regeneración parcial.
- Comparar antes/después y permitir restaurar una versión.
- Prohibir regeneración global automática que destruya cambios manuales.

### 27.12 Semáforo de calidad accionable

Cada resultado debe mostrar estado y motivo:

- **Verde:** listo para usar; pasó estructura, semántica, exportación y persistencia.
- **Amarillo:** borrador utilizable con elementos concretos por revisar.
- **Rojo:** no utilizable; existe un fallo P0 que debe corregirse antes de entregar/exportar como final.

El mensaje debe señalar el bloque afectado, la razón, el impacto y la acción propuesta; no usar advertencias vagas como “revisa el documento”.

### 27.13 Casos pedagógicos de prueba permanentes

Cada herramienta debe probarse con casos reproducibles, no solo con fixtures escritos manualmente.

- Primaria rural y urbana.
- Secundaria.
- EBA.
- EBE/EBEE cuando aplique.
- Actividad individual y grupal.
- Conectividad limitada o nula.
- Información incompleta.
- Estudiante con necesidad de apoyo.
- Caso válido y caso P0 que debe rechazarse.

Las pruebas deben llamar al endpoint real, validar el resultado estructurado, guardar, reabrir, renderizar y exportar.

### 27.14 Revisión humana de muestras reales

Antes de aprobar una versión de herramienta, docentes revisarán muestras generadas con una pauta:

- pertinencia curricular;
- claridad para el destinatario;
- aplicabilidad inmediata;
- adecuación a grado/modalidad;
- carga y tiempo real;
- calidad de ejemplos;
- calidad de descarga;
- seguridad, inclusión y privacidad.

La aprobación técnica no sustituye esta revisión. Sus observaciones se convierten en requisitos, validadores o plantillas mejoradas.

### 27.15 Registro de errores y aprendizaje continuo

Cada generación fallida, rechazada, editada o regenerada debe dejar evidencia interna:

- herramienta y versión de contrato;
- campo/contexto relevante;
- tipo de error;
- validador que falló;
- corrección aplicada;
- resultado posterior;
- modelo y fecha.

Este registro debe permitir mejorar prompts y validadores con datos reales, sin conservar contenido sensible más tiempo del necesario.

### 27.16 Créditos justos e idempotencia

No se debe descontar crédito definitivo si ocurre alguno de estos casos:

- falla de proveedor de IA;
- resultado P0 rechazado;
- exportación que pierde contenido;
- fuente externa no verificable;
- error de servidor o persistencia;
- reintento técnico duplicado.

Los reintentos deben ser idempotentes: una misma solicitud no puede producir doble cobro ni dos documentos persistidos accidentalmente.

### 27.17 Historial pedagógico y trazabilidad

El historial debe mostrar más que nombre y fecha:

- herramienta y módulo de origen;
- perfil pedagógico utilizado;
- versión y estado de calidad;
- relaciones con sesión, tarea, evaluación o estudiante;
- edición/regeneración realizada;
- evidencia asociada;
- exportaciones;
- responsable y permisos.

Debe permitir reabrir el objeto completo, no solo un texto plano o una descarga pasada.

### 27.18 Privacidad y permisos específicos

Los permisos dependen de la sensibilidad del producto.

- Planificaciones y recursos: acceso docente según propiedad/compartición.
- Evaluaciones y registros: acceso docente autorizado y directivo cuando corresponda.
- Alertas, atención, tutoría y acompañamiento: acceso mínimo necesario, auditoría de acceso y datos protegidos.
- Las exportaciones deben omitir información sensible cuando el destinatario no está autorizado.

### 27.19 Modo de conectividad limitada

La aplicación debe ofrecer alternativas para contextos rurales o de baja conectividad:

- fichas y recursos imprimibles ligeros;
- guardado pendiente y sincronización posterior;
- actividades sin video obligatorio;
- alternativas sin internet ni impresora;
- exportación optimizada;
- aviso claro si un recurso externo no estará disponible fuera de línea.

### 27.20 Matriz de decisiones que la IA no puede tomar

Se debe mantener una lista explícita de operaciones prohibidas para la IA sin revisión humana:

- diagnóstico clínico, psicológico o de discapacidad;
- decisión final de nota/calificación;
- determinación de riesgo o medidas de protección;
- derivación a servicios especializados;
- vigencia legal/normativa sin fuente verificada;
- estadísticas sin registros persistidos;
- inferencias sobre datos personales faltantes;
- contenido sensible que requiere protocolo institucional.

En estos casos la IA puede ordenar información, identificar campos faltantes o redactar un borrador claramente marcado, pero no decidir.

### Pruebas de aceptación de REQ-003

- [ ] El perfil pedagógico se reutiliza de forma coherente y autorizada.
- [ ] Los productos vinculados conservan origen y versión sin sobrescribirse.
- [ ] Cada patrón modifica estructura y no solo el título del resultado.
- [ ] El sistema detecta repetición, carga excesiva, contradicción curricular y lenguaje inadecuado.
- [ ] El estudiante no ve claves ni soluciones; el docente sí puede revisarlas.
- [ ] La regeneración parcial conserva cambios aprobados.
- [ ] El semáforo explica fallos concretos y bloquea P0.
- [ ] Las pruebas recorren generación real, persistencia, reapertura, render y exportación.
- [ ] No se cobran créditos por un fallo atribuible al sistema.
- [ ] Las operaciones sensibles requieren revisión humana y permisos correctos.

## 28. REQ-004 · Confiabilidad de generación, revisión y mantenimiento

**Fecha:** 2026-09-04  
**Estado:** EN EJECUCIÓN POR FASES — CONSERVAR REQUISITOS Y REGISTRAR EVIDENCIA  
**Propósito:** asegurar que la calidad se controle antes, durante y después de generar, y que el sistema pueda mantenerse sin degradar las herramientas ya aprobadas.

### 28.1 Asistente previo a la generación

Antes de llamar a la IA, el sistema debe revisar los campos y solicitar únicamente información que sea indispensable para mejorar el producto.

- Detectar propósito débil, evidencia ausente, duración imposible, grado no seleccionado o consigna ambigua.
- Hacer preguntas breves según la herramienta: por ejemplo, evidencia para una rúbrica, datos iniciales para una tarea o interacción para una presentación.
- No bloquear por detalles ornamentales; sí por información P0 necesaria para que el producto sea utilizable.
- Permitir modo rápido con mínimos válidos y modo guiado con mayor contexto.

### 28.2 Vista de estructura antes de generar

Antes de consumir IA, el docente debe ver una descripción concreta del producto que se preparará.

Ejemplo para tarea: “Se generarán propósito, ejemplo, cuatro actividades, tabla de respuesta, autoevaluación, evidencia y guía docente”.

- Mostrar secciones, cantidades, formato de salida y datos que influyen.
- Permitir volver a editar campos antes de confirmar.
- Prohibir promesas que el generador o exportador no puede cumplir.

### 28.3 Originalidad pedagógica y diversidad controlada

El sistema debe detectar resultados excesivamente similares a producciones recientes del mismo contexto.

- Comparar estructura, enunciados, ejemplos, preguntas, respuestas e imágenes.
- Permitir reutilización explícita y marcada por el docente.
- Proponer variaciones útiles, no cambios superficiales de vocabulario.
- Mantener coherencia con las plantillas validadas y evitar repetición mecánica.

### 28.4 Simulación de resolución

Toda herramienta con actividad, pregunta o solución debe validar que puede resolverse antes de entregarse.

- Resolver internamente ejercicios contra su clave.
- Comprobar banco de palabras, respuestas, pares, secuencias, cuadrículas, puntajes y criterios.
- Detectar preguntas incompletas, más de una respuesta correcta no declarada o datos insuficientes.
- Informar si la respuesta admite alternativas válidas y cómo se revisarán.

### 28.5 Análisis de dificultad real

La dificultad debe calcularse a partir de elementos observables, no solo de una etiqueta.

- Vocabulario y nivel lector.
- Cantidad de pasos, operaciones o inferencias.
- Extensión de lectura/escritura.
- Conocimientos previos requeridos.
- Tiempo probable y materiales.
- Ajustes por grado, modalidad y contexto.

Si el resultado excede la capacidad o duración declarada, debe simplificarse, dividirse o ofrecer una alternativa.

### 28.6 Validación visual por familia de herramienta

Además de responsive general, cada producto debe aprobar un control visual propio.

- Presentación: lienzo sin superposiciones, jerarquía, contraste, margen seguro y densidad controlada.
- Tarea/ficha/evaluación: áreas suficientes para responder, saltos de página correctos y lectura imprimible.
- Rúbrica/lista/registro: tablas legibles, filas y columnas sin pérdida, encabezados repetidos cuando sea necesario.
- Juego: interacción visible, área táctil adecuada, solución y progreso claros.
- Analítica: gráficos sin truncamiento, leyenda, unidades y filtros visibles.

### 28.7 Versiones separadas por destinatario

Cuando corresponda, la generación debe crear productos distintos desde el mismo resultado estructurado:

- versión estudiante: consigna, actividad y espacios, sin soluciones;
- versión docente: clave, criterios, notas y guía de revisión;
- versión familia: orientación breve de acompañamiento sin resolver la tarea;
- versión directiva: información agregada y autorizada, sin datos sensibles innecesarios.

La separación se debe validar al exportar y compartir.

### 28.8 Fuentes, citas y trazabilidad factual

Todo dato factual relevante debe indicar origen o declarar que requiere verificación.

- Citas, normas, estadísticas, hechos históricos, contenidos científicos y recursos externos.
- Título, autor/entidad, fecha, enlace, fecha de consulta y nivel de confianza cuando aplique.
- No presentar una inferencia generativa como fuente oficial.
- Si la fuente no puede verificarse, la herramienta debe advertirlo o excluirla según la severidad.

### 28.9 Contexto cultural y equidad

Las salidas deben funcionar en distintos contextos peruanos sin asumir recursos, conectividad, composición familiar, prácticas culturales o experiencias urbanas únicas.

- Alternativas sin internet, impresora o materiales costosos.
- Ejemplos interculturales y cercanos al contexto configurado.
- Lenguaje libre de estereotipos de género, origen, capacidad, economía o familia.
- Opciones de participación que no obliguen a revelar situaciones personales.

### 28.10 Seguridad y contenido inadecuado

Antes de mostrar o exportar, revisar contenido riesgoso, discriminatorio, inseguro o no apto para edad.

- Lenguaje ofensivo, estigmatizante o humillante.
- Instrucciones peligrosas o experimentos sin medidas de seguridad.
- Exposición de datos personales.
- Violencia, salud mental, sexualidad u otros temas sensibles fuera de la finalidad y salvaguardas definidas.
- Sesgos y afirmaciones sin fundamento.

El sistema debe bloquear P0, explicar el motivo y permitir una alternativa segura.

### 28.11 Prueba de impresión y exportación real

Toda exportación debe validarse mediante render de archivos reales, no solo por existencia o tamaño.

- Márgenes, orientación, saltos de página, tablas cortadas, encabezados y pies.
- Tamaño de letra, contraste, espacios de respuesta y cuadrículas.
- Apertura con Microsoft Word, Excel, PDF y PowerPoint según corresponda.
- Paridad con la vista previa y el JSON aprobado.

### 28.12 Prueba de edición posterior

Modificar un elemento no puede romper el artefacto.

- Editar título, pregunta, criterio, imagen, tabla, actividad o diapositiva.
- Recalcular derivados cuando aplique, como puntajes, totales y alertas.
- Conservar respuestas, vínculos, versiones y exportación.
- Probar edición antes y después de guardar/reabrir.

### 28.13 Explicabilidad de generación

El docente debe poder saber de dónde sale la estructura, sin exponer instrucciones internas sensibles.

- Mostrar los datos utilizados: nivel, área, propósito, competencia, evidencia, tiempo y contexto.
- Explicar la elección de patrón: por ejemplo, “ficha de práctica guiada” o “presentación de procedimiento”.
- Indicar campos faltantes o supuestos aprobados.
- Permitir corregir el contexto y regenerar solo el bloque afectado.

### 28.14 Métricas administrativas de calidad

El panel administrativo debe medir calidad real por herramienta:

- tasa de resultados verdes, amarillos y rojos;
- fallos P0 por tipo;
- regeneraciones y correcciones manuales;
- campos que más causan errores;
- fallos de exportación;
- tiempo de generación;
- créditos reintegrados;
- herramientas con menor utilidad o mayor abandono.

Las métricas deben estar agregadas y respetar privacidad.

### 28.15 Contrato de mantenimiento por herramienta

Cada herramienta tendrá ficha de mantenimiento con:

- responsable funcional y técnico;
- versión del contrato;
- última revisión pedagógica;
- pruebas asociadas;
- dependencias de backend/frontend/exportación;
- cambios pendientes;
- estado de producción;
- historial de incidentes conocidos.

No se debe modificar un motor compartido sin ejecutar la matriz de regresión de las herramientas dependientes.

### 28.16 Evaluación de trabajo entregado

Las herramientas de tarea, ficha y evaluación deben poder recibir evidencia del estudiante cuando esté autorizado.

- Texto, fotografía, PDF, Word u otros formatos permitidos.
- Extracción con confirmación docente.
- Relación con actividad, estudiante, criterio y fecha.
- Borrador de feedback para revisión humana.
- Protección de archivos y retención acorde a permisos.

La IA no puede emitir nota final automáticamente.

### 28.17 Prohibición de datos ficticios

La IA no debe completar silenciosamente datos inexistentes.

- Estudiantes, institución, fechas, notas, porcentajes, leyes, fuentes, enlaces, resultados, firmas o estadísticas.
- Si falta información, debe usar un estado “pendiente”, una pregunta al docente o una plantilla con campo explícito.
- Toda suposición permitida debe ser visible, editable y registrada.

### 28.18 Compatibilidad de archivos

Probar los formatos resultantes en aplicaciones reales y escenarios comunes.

- Word abre y mantiene tablas/estilos.
- Excel conserva datos, fórmulas, filtros y filas.
- PDF imprime correctamente.
- PowerPoint conserva composición, texto e imágenes.
- Archivos no incorporan contenido oculto sensible ni enlaces inseguros.

### 28.19 Recuperación ante fallos

No se debe perder el trabajo docente por falla de IA, navegador, red, exportación o servidor.

- Guardado temporal seguro de formulario y borrador.
- Reintentos claros y no duplicados.
- Recuperación de sesión al volver a abrir.
- Aviso de estado de sincronización.
- Registro del fallo para soporte sin exponer información sensible.

### Pruebas de aceptación de REQ-004

- [ ] Antes de generar se detectan los datos P0 faltantes.
- [ ] El docente ve la estructura y formato antes de confirmar.
- [ ] Las actividades se simulan contra sus soluciones antes de entregarse.
- [ ] La carga, dificultad y lenguaje se adaptan al contexto configurado.
- [ ] Toda familia pasa su validador visual y de impresión especializado.
- [ ] Versiones estudiante/docente/familia no filtran información entre sí.
- [ ] Fuentes y datos factuales son verificables o se marcan como pendientes.
- [ ] Los resultados peligrosos, discriminatorios o inadecuados se bloquean.
- [ ] Las exportaciones se abren y se renderizan correctamente en software destino.
- [ ] Los cambios manuales sobreviven guardado, reapertura y exportación.
- [ ] El panel mide calidad sin exponer datos personales.
- [ ] Los fallos recuperan el borrador sin doble cobro ni duplicación.

## 29. Registro de ejecución

### 29.1 Núcleo transversal iniciado el 4 de septiembre de 2026

- [x] Añadir severidad P0, P1 y P2 a las comprobaciones devueltas por el backend.
- [x] Añadir estado computable `ready`, `review` o `blocked` al resultado.
- [x] Bloquear en backend un resultado que falle una comprobación P0 antes de registrar consumo de créditos.
- [x] Mostrar el estado de calidad y la severidad en frontend.
- [x] Impedir exportar artefactos históricos marcados como `blocked`.
- [x] Sustituir la cobertura contractual basada en palabras por validadores semánticos propios para cada familia; la cobertura léxica queda solo como aviso P1 y las reglas estructurales/funcionales P0 deciden si el resultado puede entregarse.
- [x] Implementar regeneración automática controlada de una sola parte ante un P0 reparable.
- [x] Completar telemetría agregada de errores, reparaciones y rechazos sin cobro.

### 29.2 Piloto Tarea de Extensión y Hogar

- [x] Exigir actividad estructurada `ficha_hogar` con entre 3 y 6 consignas.
- [x] Rechazar consignas duplicadas, demasiado breves o sin producto o respuesta esperada.
- [x] Normalizar identificadores estables para mantener paridad entre JSON, vista y Word.
- [x] Crear vista especializada con ficha del estudiante y guía docente separadas.
- [x] Evitar que la vista interactiva genérica revele respuestas de esta herramienta.
- [x] Crear exportador Word propio que conserva todas las actividades.
- [x] Incluir espacios de respuesta y autoevaluación marcable en la versión del estudiante.
- [x] Separar las respuestas y recomendaciones en una página exclusiva para el docente.
- [x] Verificar automáticamente backend, frontend y generación DOCX.
- [x] Abrir el DOCX con Microsoft Word, convertirlo y revisar visualmente sus dos páginas sin recortes ni tablas partidas.
- [x] Añadir tipos de respuesta especializados: tabla, operación, dibujo, texto breve, desarrollo y producto adjunto; la IA debe elegir el formato por actividad y combinar al menos dos cuando la ficha tenga tres o más consignas.
- [x] Validar combinaciones EBR, EBA y EBE/EBEE, nivel y contexto rural/urbano; el prompt conserva explícitamente modalidad, nivel, territorio y condiciones familiares.
- [x] Probar reapertura completa desde Historial sin depender de `localStorage`, incluyendo las actividades y sus tipos de respuesta recuperados desde la revisión del backend.
- [x] Certificar la paridad de contenido mediante comparación automática de los identificadores de actividad dentro del DOCX; cada consigna se guarda como marcador Word estable y se comprueba junto con su producto esperado.
- [x] Renderizar nuevamente la tarea con tablas y cuadrícula de operación; mantener cada actividad grande junto con su consigna y revisar las tres páginas sin pérdidas de contexto.

### 29.3 Próximo lote en ejecución

1. Rúbrica de evaluación y calificador de rúbricas.
2. Lista de cotejo y su exportación Excel por estudiantes y criterios.
3. Examen, preguntas sobre texto y ficha de observación.
4. Planificación curricular y fichas resolubles restantes.
5. Juegos, presentaciones, recursos verificables y certificación cruzada de las 57 herramientas.

### 29.4 Instrumentos de evaluación iniciados el 4 de septiembre de 2026

- [x] Exigir participantes reales antes de guardar una rúbrica o lista de cotejo como generada.
- [x] Rechazar rúbricas generadas con menos de 3 criterios, escalas incompatibles o descriptores vacíos/duplicados.
- [x] Exigir que la suma de ponderaciones de una rúbrica generada sea exactamente 100 %.
- [x] Exigir un registro completo por estudiante y criterio, con evidencia, fortaleza, mejora y recomendación en rúbricas.
- [x] Rechazar listas de cotejo generadas con menos de 2 indicadores o sin respuesta por estudiante e indicador.
- [x] Mantener el estado `draft` durante la edición y usar `generated` solamente cuando el instrumento esté completo.
- [x] Cubrir estas reglas con pruebas de validación del backend y pruebas de flujo del frontend.
- [x] Completar exportadores propios: rúbrica Word con matriz y feedback individual; lista de cotejo Excel con paridad respecto del instrumento guardado.
- [x] Añadir libro Excel de lista de cotejo en formato matriz: una fila por estudiante, columnas C1…Cn, Sí/No/En proceso y observaciones.
- [x] Guardar la revisión exacta en backend antes de imprimir o descargar una rúbrica/lista, evitando exportaciones locales desactualizadas.
- [x] Abrir la rúbrica DOCX con Microsoft Word y revisar visualmente matriz apaisada y páginas individuales sin recortes ni desbordes.
- [x] Certificar reapertura, edición, versionado e historial desde persistencia del servidor para rúbrica y lista de cotejo, conservando estudiantes, criterios, registros y feedback.

### 29.5 Ficha de observación, preguntas sobre texto y ficha de aprendizaje

- [x] Diferenciar guardado de borrador y finalización: el borrador admite trabajo incompleto; el final exige un producto semánticamente válido.
- [x] Exigir en la ficha de observación estudiantes, criterios, hechos objetivos, interpretación, conclusión y compromisos antes de usar estado `generated`.
- [x] Validar en backend que Preguntas sobre texto respete exactamente la cantidad literal, inferencial y crítico-reflexiva solicitada.
- [x] Validar que cada pregunta tenga respuesta esperada en una guía docente y que no se filtren marcadores de solución en la ficha del estudiante.
- [x] Comprobar relación mínima entre el texto fuente y el contenido generado antes de aprobar Preguntas sobre texto.
- [x] Validar que la Ficha de aprendizaje contenga exactamente la cantidad de actividades solicitada entre activación, práctica guiada, aplicación y reto.
- [x] Exigir una respuesta o pauta docente por cada actividad de la Ficha de aprendizaje.
- [x] Rechazar en la API la finalización de fichas sin fuente, sin artefacto generado, con calidad bloqueada o con estructura incompleta.
- [x] Guardar en backend la revisión exacta del artefacto antes de descargar el Word.
- [x] Crear un Word con versión del estudiante resoluble: fuente, preguntas/actividades numeradas y espacios reales para responder.
- [x] Separar respuestas, justificaciones, retroalimentación y recomendaciones en una página `GUÍA DOCENTE · NO ENTREGAR AL ESTUDIANTE`.
- [x] Verificar automáticamente que ninguna respuesta de la guía aparezca antes de la separación docente.
- [x] Abrir el DOCX en Microsoft Word, convertirlo y revisar visualmente las páginas de estudiante y docente sin recortes ni filtración de respuestas.
- [x] Certificar carga y reapertura de fuentes PDF/Word junto con el texto corregido, tamaños de lectura/preguntas y la última revisión generada desde Historial.
- [x] Añadir formatos de respuesta especializados por pregunta: alternativa, texto breve, desarrollo, tabla, dibujo y resolución matemática; validar en backend la selección Abiertas/Opción múltiple/Mixtas y reproducir el espacio correspondiente en Word sin mostrar el prefijo técnico.
- [x] Corregir el orden y la paginación del Word de Preguntas sobre texto: criterios visibles antes de responder, ficha del estudiante en una página, guía docente en una segunda página forzada sin hoja vacía intermedia.
- [x] Abrir el Word final con Microsoft Word y revisar visualmente ambas páginas a tamaño original.

### 29.6 Examen aplicable y puntuable

- [x] Añadir al formulario un puntaje total configurable entre 10 y 100, además de 5 a 30 reactivos.
- [x] Exigir que la sección Preguntas contenga exactamente la cantidad solicitada, sin duplicados ni marcadores de solución.
- [x] Exigir una entrada de clave por cada reactivo y conservar el mismo orden para corrección.
- [x] Validar que la suma de `Cantidad` de la matriz sea igual al número de preguntas.
- [x] Validar que la suma de `Puntaje` de la matriz sea igual al puntaje total configurado.
- [x] Rechazar en backend cantidades no numéricas o fuera de rango antes de invocar la generación.
- [x] Guardar la revisión exacta del flujo genérico en backend antes de permitir la exportación.
- [x] Exportar una versión del estudiante con identificación, matriz de cobertura, instrucciones, puntaje, reactivos y espacio de respuesta.
- [x] Separar clave, criterios de corrección y orientaciones en una página docente que no se entrega al estudiante.
- [x] Verificar automáticamente que las respuestas no aparezcan antes de la guía docente.
- [x] Abrir el examen DOCX con Microsoft Word y revisar visualmente sus dos páginas sin recortes, hojas vacías ni filtración de respuestas.
- [x] Exigir en el contrato de IA un prefijo estructurado por reactivo y comprobar que los formatos generados pertenecen a la selección docente.
- [x] Exigir cuatro alternativas completas en opción múltiple y ambas columnas en los reactivos de relación.
- [x] Añadir render especializado según formato de reactivo: alternativas marcables, V/F, relación de columnas, respuesta corta y desarrollo.
- [x] Revisar visualmente en Microsoft Word las tres páginas del examen especializado: sin recortes, con espacios visibles y guía docente separada.
- [x] Comprobar que la matriz declare exactamente la misma cantidad de reactivos por formato que el examen generado.
- [x] Validar la presencia de demanda cognitiva básica, intermedia o avanzada según la dificultad seleccionada; en modo mixto, exigir al menos dos niveles.

### 29.7 Reapertura real desde Historial

- [x] Hacer que los flujos genéricos recuperen el documento por su identificador desde el backend aunque `localStorage` esté vacío.
- [x] Restaurar desde la revisión persistida los campos del formulario, el artefacto generado, el paso activo, la versión y la plantilla institucional.
- [x] Evitar mezclar silenciosamente el artefacto recuperado con un resultado antiguo guardado solo en el navegador.
- [x] Añadir una prueba automatizada que abre un examen desde Historial con almacenamiento local vacío y comprueba datos, paso y resultado del servidor.
- [x] Abrir automáticamente la vista previa editable cuando un documento especializado recuperado ya tiene un artefacto generado.
- [x] Añadir una prueba de reapertura para Preguntas sobre texto que recupera desde backend el PDF vinculado, su texto editado, la configuración y el resultado generado.
- [x] Certificar el mismo recorrido de reapertura para los instrumentos especializados: rúbrica, lista de cotejo, ficha de observación y documentos con archivo fuente.
- [x] Conservar y recuperar las relaciones con nóminas, estudiantes y archivos adjuntos mediante sus identificadores estables, además de los nombres visibles.
- [x] Añadir control de concurrencia visible cuando dos navegadores intenten editar revisiones diferentes del mismo documento: lista de cotejo y rúbrica bloquean guardado/exportación obsoleta y explican cómo recuperar la revisión actual.

### 29.8 Recursos y actividades interactivas

- [x] Normalizar cada actividad con identificadores estables y consecutivos (`item-1`, `item-2`…) para conservar edición, exportación y resultados sin depender del texto visible.
- [x] Asignar un modo semántico real por herramienta: tarjetas, sopa de letras, crucigrama, ahorcado, completar oraciones, relacionar, debate, catálogo pedagógico o presentación.
- [x] Incorporar el control crítico `resource_semantics`: un recurso no puede quedar listo si su estructura no corresponde a lo que afirma ser.
- [x] Exigir tarjetas con frente, respuesta y pista, sin alternativas que conviertan la tarjeta en otra actividad.
- [x] Exigir en sopa de letras y crucigrama palabras normalizadas, únicas y con correspondencia exacta entre actividad y banco de palabras.
- [x] Exigir en ahorcado una respuesta normalizada y una pista, sin alternativas de opción múltiple ajenas al juego.
- [x] Exigir en completar oraciones una sola línea en blanco por consigna y distractores suficientes cuando no se selecciona escritura libre.
- [x] Exigir en relacionar pares una correspondencia inequívoca por elemento y una pista contextual, sin listas de alternativas incrustadas.
- [x] Exigir a los bancos y catálogos entre cinco y ocho recursos utilizables, con orientación para verificar o adaptar cada propuesta.
- [x] Exigir en debate al menos dos consignas con preguntas de seguimiento que permitan sostener la interacción en el aula.
- [x] Rechazar automáticamente un rompecabezas alterado cuando su banco de palabras ya no coincide con las respuestas generadas.
- [ ] Certificar en navegador, edición y exportación cada familia de recurso con el mismo identificador y contenido guardado en backend.

### 29.9 Validadores semánticos transversales y por familia

- [x] Exigir que los títulos y el orden de los apartados generados coincidan con el contrato específico de la herramienta; ya no basta devolver la misma cantidad de secciones con nombres ajenos.
- [x] Rechazar apartados vacíos o completamente duplicados aunque el JSON y el diseño visual sean válidos.
- [x] Rechazar matrices con filas duplicadas que repitan la misma decisión, actividad o evidencia.
- [x] En Sesión de Aprendizaje, exigir exactamente Inicio, Desarrollo y Cierre, sumar la duración declarada y separar acciones del docente, acciones del estudiante y evidencia.
- [x] En Unidad de Aprendizaje, exigir exactamente la cantidad solicitada de sesiones y que cada fila tenga propósito, actividad, evidencia, criterio y tiempo propios.
- [x] En PCA, exigir que la calendarización contenga exactamente el número solicitado de unidades distintas.
- [x] En Plan de Refuerzo, limitar la matriz a entre una y tres sesiones diferenciadas con meta, mediación, evidencia, criterio y ajuste DUA.
- [x] En Rúbrica, exigir la cantidad solicitada de criterios, cuatro niveles realmente progresivos y una recomendación accionable por criterio.
- [x] En Lista de Cotejo, generar dinámicamente C1…Cn hasta 15 indicadores, conservar la nómina en el mismo orden y exigir leyenda completa de criterios y evidencias.
- [x] Ampliar el esquema estructurado para admitir matrices de hasta 20 columnas, necesarias para nómina + C1…C15 + observaciones.
- [x] En Escala de Estimación, exigir una fila observable y diferenciada por cada criterio solicitado.
- [x] En Registros Auxiliares, exigir una fila por estudiante y conservar exactamente la nómina aportada cuando exista.
- [x] En Analítica de Aula, bloquear porcentajes incompatibles y exigir que cada alerta se convierta en una acción con responsable y fecha de revisión.
- [x] En productos de inclusión y acompañamiento sensible, bloquear lenguaje determinista, culpabilizador o excluyente.
- [x] En comunicaciones, comprobar que la acción o acuerdo solicitado por el docente sobreviva en el mensaje final.
- [x] Añadir casos automatizados positivos y P0 negativos para estas reglas; backend completo: 89 pruebas aprobadas.
- [x] Recorrer automáticamente los 58 contratos técnicos registrados (57 productos conceptuales más la ruta duplicada de Adaptación DUA) y bloquear una estructura con apartados ajenos en cualquiera de ellos.

### 29.10 Certificación responsive del contenedor principal

- [x] Comprobar el inicio autenticado en 1440×900 sin desbordamiento horizontal y con región lateral desplazable.
- [x] Comprobar tema oscuro real en escritorio sin errores de consola ni pérdida de contraste funcional.
- [x] Comprobar el inicio en 390×844 sin desbordamiento horizontal y con menú móvil desplegable.
- [x] Verificar mediante interacción que el menú lateral puede desplazarse hasta Comunidad activa y Mis estudiantes.
- [x] Corregir la superposición del nombre y rol del usuario en el pie del menú móvil; ambos se muestran ahora en líneas separadas.
- [x] Verificar carga local de frontend, API y documentación: respuestas HTTP 200.
- [x] Compilar el frontend de producción y ejecutar la suite completa: 94 archivos y 176 pruebas aprobadas.

### 29.11 Reparación semántica y telemetría de calidad

- [x] Ejecutar un único reintento cuando el primer resultado falla una regla P0; la segunda solicitud recibe los códigos, detalles y el JSON previo para corregir solo lo observado.
- [x] Volver a ejecutar todos los validadores sobre la propuesta reparada; si sigue bloqueada, no mostrarla como éxito ni intentar indefinidamente.
- [x] Mantener el cobro después de la validación final: un resultado rechazado conserva el saldo y el contador de generaciones del docente.
- [x] Exponer en la respuesta si hubo reparación, si fue exitosa y qué fallos originaron el reintento.
- [x] Mostrar en el control de calidad del frontend que la propuesta visible fue corregida y validada automáticamente.
- [x] Persistir un evento de calidad por intento de flujo con herramienta, módulo, modelo, resultado, reparación, fallos y créditos realmente cobrados.
- [x] Incorporar en el panel administrativo los contadores de intentos validados, aprobados directos, reparados y rechazados sin cobro.
- [x] Añadir pruebas que garantizan un solo reintento, reparación exitosa, detención tras el segundo fallo, persistencia del evento y ausencia de cobro en rechazos.
- [x] Aplicar la migración `0018_ai_generation_quality` en la base local.
- [x] Verificar visualmente el panel administrativo autenticado: los cuatro indicadores aparecen en la pestaña IA y las generaciones anteriores permanecen separadas del nuevo conteo de calidad.
- [x] Añadir prueba de integración del agregado administrativo, incluyendo el caso exacto de rechazo sin cobro y evitando clasificar como gratuito un rechazo que sí tenga consumo registrado.
- [x] Ejecutar la certificación completa posterior a estos cambios: 98 pruebas backend, 176 pruebas frontend, análisis estático sin errores y compilación de producción correcta.
