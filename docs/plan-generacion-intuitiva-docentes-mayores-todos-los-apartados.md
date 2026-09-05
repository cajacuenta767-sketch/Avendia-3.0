# Plan integral para una generación intuitiva en todos los apartados

> **Estado:** plan propuesto, todavía no ejecutado.
> **Alcance:** las 57 capacidades pedagógicas del producto, implementadas actualmente mediante 58 rutas, además de Inicio, Calendario, utilidades, cuenta y administración.
> **Restricción visual:** conservar la identidad, los colores y los modos claro/oscuro del proyecto actual. Este plan mejora claridad, distribución, interacción, generación, persistencia y accesibilidad; no recupera la paleta del proyecto anterior.

## 1. Objetivo

Conseguir que un docente, especialmente uno de mayor edad o con poca confianza digital, pueda comprender qué hace cada herramienta, completar solamente los datos necesarios, generar un producto pedagógico correcto, revisarlo, corregir una sección, guardarlo y exportarlo sin ayuda externa.

La mejora no será solamente visual. Cada apartado deberá integrar:

- una experiencia guiada y comprensible en el frontend;
- reglas pedagógicas propias de la herramienta;
- generación contextual mediante IA cuando corresponda;
- validaciones deterministas antes y después de generar;
- persistencia real en backend;
- edición, historial, recuperación y exportación fiel;
- pruebas funcionales, pedagógicas, responsivas y de accesibilidad.

## 2. Problema que se debe resolver

Actualmente una parte de la dificultad proviene de tratar herramientas distintas como si todas fueran formularios genéricos. Eso produce preguntas poco pertinentes, ayudas de IA repetidas, salidas que no representan el producto solicitado, errores difíciles de recuperar y pantallas densas en móvil.

El rediseño debe impedir, entre otros, estos resultados:

- una tarea para el hogar sin una tarea concreta que el estudiante pueda resolver;
- una rúbrica sin criterios observables ni niveles progresivos;
- un examen desconectado del tema ingresado o sin clave de respuestas;
- una presentación convertida en bloques de texto o con contenido desbordado;
- una sopa de letras sin cuadrícula jugable;
- una lista de cotejo sin estudiantes, indicadores y casillas de registro;
- sugerencias de IA que ignoren lo ya escrito en pasos anteriores;
- mensajes de error persistentes que sobrevivan a una recarga y bloqueen el flujo;
- cobros duplicados de créditos al reintentar una misma generación;
- exportaciones que no coincidan con la vista previa.

## 3. Usuarios y condiciones de uso

El diseño se validará al menos con estos perfiles:

1. Docente mayor con experiencia pedagógica y poca práctica digital.
2. Docente que usa principalmente un teléfono de gama media.
3. Docente experimentado que desea completar rápidamente el flujo.
4. Directivo que revisa documentos de varios docentes.
5. Administrador que gestiona usuarios, créditos, incidencias y configuración.

Se asumirán condiciones reales: visión cansada, menor precisión motriz, temor a perder información, conexión intermitente, vocabulario tecnológico limitado, zoom del navegador, archivos escaneados y necesidad de retomar el trabajo otro día.

## 4. Principios obligatorios de experiencia

### 4.1 Una decisión principal por pantalla

Cada paso tendrá un propósito explícito, una acción principal destacada y como máximo una acción secundaria al mismo nivel. Las acciones poco frecuentes se ubicarán en “Más opciones”. No se mostrarán simultáneamente botones que compitan entre sí.

### 4.2 Lenguaje docente, no lenguaje técnico

Se usarán expresiones como “Guardar borrador”, “Crear documento”, “Volver al paso anterior” o “Corregir esta sección”. Se evitarán términos como *payload*, *prompt*, *schema*, *artifact*, *endpoint* o mensajes crudos del servidor.

### 4.3 Complejidad progresiva

Cada herramienta ofrecerá una ruta sencilla con los campos indispensables. Las configuraciones especializadas se abrirán solamente al elegir “Personalizar más”. La experiencia avanzada nunca será requisito para obtener un resultado correcto.

### 4.4 Anticipación del resultado

Antes de comenzar se explicará, en dos o tres frases:

- qué creará la herramienta;
- qué información necesita;
- cuánto suele tardar;
- qué se podrá editar y descargar.

Antes de consumir créditos se mostrará un resumen de los datos y del producto que se generará.

### 4.5 Escritura mínima y datos reutilizados

Nombre, institución, DRE, UGEL, modalidad, nivel, grado, sección y preferencias se precargarán desde el perfil. Cuando exista un documento anterior compatible, el docente podrá importarlo de manera opcional y seleccionar qué datos desea reutilizar.

### 4.6 Seguridad para explorar

Todo paso tendrá guardado automático, botón Atrás, confirmación antes de perder cambios, deshacer la última sugerencia y posibilidad de continuar sin IA. Un error nunca borrará las respuestas.

### 4.7 Accesibilidad cognitiva, visual y motriz

- texto base mínimo de 16 px y etiquetas claramente legibles;
- controles táctiles de al menos 44 × 44 px, preferiblemente 48 px en móvil;
- contraste WCAG 2.2 AA en claro y oscuro;
- foco visible y orden de teclado lógico;
- estado comunicado con texto e icono, no solo con color;
- zoom al 200 % sin pérdida funcional ni desplazamiento horizontal de página;
- compatibilidad con lector de pantalla;
- animaciones reducidas cuando el sistema lo solicite;
- párrafos cortos, ejemplos concretos y una instrucción por bloque.

## 5. Flujo común de generación

Todas las herramientas usarán una estructura reconocible, pero cada una conservará preguntas, pasos y resultados propios.

### Paso 0. Elegir cómo empezar

- “Crear desde cero”, siempre disponible.
- “Usar un documento anterior”, solo si existe una referencia compatible.
- “Continuar borrador”, si hay uno pendiente.
- Mostrar una tarjeta breve con el resultado esperado y un ejemplo realista.

### Paso 1. Confirmar contexto

Presentar solamente datos esenciales precargados: modalidad, nivel, grado, área, aula y periodo. El docente podrá corregirlos sin abandonar la herramienta. Los campos dependientes deberán actualizar sus opciones; por ejemplo, grado y área no podrán quedar incompatibles con la modalidad seleccionada.

### Paso 2. Completar información específica

Las preguntas cambiarán según la naturaleza de la herramienta. Se combinarán selectores, opciones de un toque, carga de archivos y campos con ejemplos. No se colocará “Sugerir con IA” junto a todos los campos: solo aparecerá donde la IA aporte valor y exista contexto suficiente.

### Paso 3. Recibir ayuda contextual opcional

La ayuda se adaptará al campo, al tema, al área, al nivel y a las respuestas anteriores. La ventana explicará qué completará, solicitará como máximo dos datos adicionales y mostrará la propuesta antes de aplicarla. El docente podrá aplicar, editar, regenerar o descartar.

### Paso 4. Revisar antes de crear

Mostrar un resumen en lenguaje natural: “Crearás una evaluación de Matemática para 4.º de primaria sobre ecuaciones, con 10 preguntas y clave de respuestas”. Señalar campos incompletos con un enlace que lleve al lugar exacto.

### Paso 5. Generar con progreso entendible

La espera mostrará etapas reales: “Organizando datos”, “Creando contenido”, “Revisando coherencia” y “Preparando la vista previa”. Se indicará que puede tardar y se impedirá el doble envío. Si el usuario abandona la pantalla, el trabajo continuará en backend y se recuperará desde Historial.

### Paso 6. Revisar un producto auténtico

La vista previa debe parecerse al resultado final de esa herramienta, no a una respuesta genérica. Tendrá navegación por secciones, avisos de calidad y distinción clara entre material para estudiante, orientaciones docentes, soluciones y anexos.

### Paso 7. Corregir sin rehacer todo

Permitir editar texto, regenerar una sola sección, comparar antes/después, deshacer, bloquear apartados correctos y explicar el cambio deseado. Una corrección parcial conservará las demás secciones y no cobrará como una generación completa cuando solo repare un fallo del sistema.

### Paso 8. Guardar, reutilizar y exportar

Guardar versión en backend, asignar nombre comprensible, registrar la herramienta de origen y ofrecer únicamente formatos pertinentes. La exportación deberá coincidir con la vista previa y pasar verificaciones de márgenes, tablas, saltos, tipografía e imágenes.

## 6. Contexto en cascada, siempre opcional

El producto debe acompañar la secuencia natural del trabajo docente:

`PCA → Unidad → Sesión → Actividades y materiales → Instrumentos de evaluación → Evidencias → Retroalimentación y seguimiento`

Reglas:

- la creación desde cero nunca se bloqueará por no tener un documento anterior;
- el docente verá documentos compatibles con nombre, fecha, grado, área y estado;
- antes de importar se elegirán los campos que se reutilizarán;
- todo dato importado mostrará su procedencia;
- el usuario podrá desvincular la referencia sin borrar su documento;
- si cambia un dato principal, se marcarán únicamente los campos dependientes que necesitan revisión;
- ninguna actualización del documento padre sobrescribirá silenciosamente el trabajo hijo;
- backend almacenará los vínculos, versiones y campos heredados.

## 7. Arquitectura de generación y calidad

Cada herramienta deberá contar con cuatro capas propias:

1. **Contrato de entrada:** campos requeridos, tipos, dependencias y límites.
2. **Contrato de salida:** estructura exacta del producto pedagógico.
3. **Validador:** reglas deterministas y semánticas que detecten contenido vacío, incoherente o ajeno al tema.
4. **Renderizador:** vista previa y exportadores fieles al contrato.

### 7.1 Construcción de contexto

El backend compondrá el contexto con perfil, modalidad, nivel, grado, área, tema, campos anteriores, archivos autorizados y referencias en cascada. El frontend enviará datos estructurados; no construirá el prompt pedagógico definitivo.

### 7.2 Coherencia curricular

Cuando aplique, se respetará la cadena:

`modalidad → nivel/ciclo → grado → área → competencia → capacidad/desempeño → propósito → actividad → evidencia → criterio → instrumento`

Las contradicciones se resolverán o se presentarán al docente antes de generar. No se inventarán códigos normativos ni competencias inexistentes.

### 7.3 Control de calidad previo a mostrar el resultado

- presencia de todas las secciones obligatorias;
- relación verificable con el tema ingresado;
- adecuación de dificultad al nivel y grado;
- consignas accionables;
- cantidad solicitada de elementos;
- ausencia de marcadores, asteriscos de Markdown o texto técnico;
- distinción entre ejemplo y actividad que debe resolver el estudiante;
- consistencia de respuestas y claves;
- validación de tablas, cuadrículas, tiempos, puntajes y totales;
- revisión de lenguaje respetuoso, inclusivo y no diagnóstico.

Si falla una sección, el sistema intentará repararla una vez sin duplicar cargos. Si todavía falla, conservará el borrador, explicará la acción posible y permitirá reintentar o continuar sin IA.

### 7.4 Créditos, roles y reintentos

- consulta única y clara del saldo antes de iniciar;
- reserva y confirmación idempotente para evitar cobro doble;
- devolución automática cuando la generación no produce un resultado utilizable;
- política explícita para cuentas administrativas;
- error de crédito distinto de error de conexión;
- el estado de error no persistirá como contenido generado ni bloqueará una recarga;
- cada reintento usará el mismo identificador lógico hasta obtener resultado definitivo.

### 7.5 Contenido con fuentes

Normativa, recursos MINEDU, enlaces, imágenes y videos requerirán fuente, fecha y disponibilidad. Las recomendaciones externas se validarán en backend. Una imagen no podrá insertarse solo porque coincida con palabras clave: deberá ser pertinente, legible, licenciable y de resolución suficiente.

## 8. Componentes compartidos para docentes mayores

### 8.1 Modo guiado por defecto

Presentará pasos cortos, ayuda visible y botones con verbo y resultado. El modo compacto será opcional para usuarios avanzados, pero ambos producirán el mismo contrato de backend.

### 8.2 Ejemplos que enseñan

Cada campo vacío tendrá un ejemplo pertinente al área y grado, presentado como ejemplo y nunca como valor real. El botón “Ver un ejemplo completo” abrirá una muestra de la herramienta y permitirá copiar solamente las partes elegidas.

### 8.3 Sugerencias de un toque

Se actualizarán al modificar tema, propósito, área o grado. No serán chips genéricos fijos. Cada sugerencia tendrá una frase clara, estado seleccionado visible y explicación breve al enfocarla.

### 8.4 Formularios cómodos

- etiquetas siempre visibles sobre el control;
- unidades y límites junto al campo;
- listas con búsqueda cuando existan muchas opciones;
- radios para dos o tres alternativas exclusivas;
- fechas con calendario y entrada manual tolerante;
- ayuda debajo del campo, sin depender de *tooltips*;
- secciones visuales con títulos numerados y resumen al completarse;
- botón principal fijo solo si no tapa contenido ni teclado.

### 8.5 Ventana de ayuda con IA

En escritorio tendrá ancho legible; en móvil ocupará el espacio disponible sin doble desplazamiento. Cabecera, contenido y acciones no se solaparán. Al abrirse enfocará el título, atrapará correctamente el foco y al cerrar devolverá el foco al botón de origen.

### 8.6 Mensajes recuperables

Todo error responderá tres preguntas: qué ocurrió, qué se conservó y qué puede hacer el docente. La acción recomendada será específica. Nunca se aplicará un mensaje de error como propuesta al campo.

### 8.7 Preferencias persistentes

Guardar en backend tamaño de texto, modo claro/oscuro, modo guiado/compacto, institución predeterminada, formato de exportación y último filtro utilizado. Las preferencias seguirán al usuario entre dispositivos.

## 9. Plan por herramienta: 57 capacidades, 58 rutas

La siguiente matriz define la simplificación y la forma mínima correcta de generación. Los contratos pedagógicos extensos ya documentados se conservan y se usarán como especificación complementaria; esta matriz no los reemplaza.

### 9.1 Planificamos

1. **Plan Curricular Anual (PCA)** — Precargar datos institucionales y calendario; dividir selección curricular, diagnóstico, temporalización, unidades, evaluación y cierre en pasos breves; permitir importar calendario; generar matriz anual consistente, no prosa; validar distribución de semanas y servir como documento padre de unidades.
2. **Unidad de Aprendizaje** — Elegir opcionalmente un PCA, periodo y competencias; mostrar qué se heredó; guiar situación, propósito, evidencias, secuencia y evaluación; generar una unidad completa con sesiones vinculables y tiempos coherentes.
3. **Sesión de Aprendizaje** — Partir opcionalmente de una unidad; pedir propósito, duración y características del grupo; construir inicio, desarrollo y cierre con acciones reales, recursos, evidencias e instrumento; comprobar que la suma de tiempos coincida.
4. **Situación significativa** — Usar preguntas sencillas sobre contexto, problema, estudiantes y producto; ofrecer ejemplos rurales y urbanos acordes al nivel; generar reto auténtico, preguntas movilizadoras y relación curricular, sin texto ornamental.
5. **Proyectos integrados** — Guiar selección de áreas, problema, producto, roles, hitos y evaluación; representar cronograma y responsabilidades; validar integración real de áreas y un producto final alcanzable.
6. **Adaptación Inclusiva NEE (DUA), ruta Planificamos** — Preguntar barreras observables y apoyos, no diagnósticos; usar opciones DUA comprensibles; producir adaptaciones de acceso, participación y evaluación, con responsables y seguimiento; proteger información sensible.
7. **Tarea de Extensión y Hogar** — Mostrar primero “qué hará y entregará el estudiante”; generar consignas, datos o materiales, ejercicios/preguntas reales, espacios de respuesta, ejemplo separado, evidencia, criterio de éxito, autoevaluación y apoyo familiar opcional; validar que exista trabajo resoluble.
8. **Carpeta Pedagógica Oficial** — Permitir seleccionar componentes y periodo; mostrar índice y avance; ensamblar documentos existentes sin duplicarlos; identificar faltantes y exportar con portada, índice, separadores y versiones.

### 9.2 Evaluamos

9. **Rúbrica de evaluación** — Comenzar por evidencia y propósito; sugerir criterios observables; elegir niveles; generar tabla con descriptores progresivos, específicos y mutuamente distinguibles; incluir retroalimentación accionable y edición por celda.
10. **Lista de cotejo** — Importar lista de estudiantes; definir evidencia e indicadores binarios observables; previsualizar filas por estudiante y columnas C1, C2, etc.; ofrecer Sí/No, observación y resumen; exportar correctamente a Excel y Word.
11. **Ficha de aprendizaje** — Permitir pegar texto o subir PDF/Word; extraer contenido con confirmación; generar activación, explicación, práctica gradual, aplicación, reflexión y versión docente con respuestas; separar claramente lo que completa el estudiante.
12. **Examen** — Crear primero una tabla de especificaciones simple; seleccionar tema, aprendizajes, tipos, cantidad, dificultad y tiempo; generar preguntas alineadas, puntaje, instrucciones y clave; impedir preguntas desconectadas y validar respuestas.
13. **Escala de estimación** — Definir conducta o desempeño y niveles; generar indicadores observables y una escala ordenada con anclajes claros; incluir registro, interpretación y observaciones sin convertirla en rúbrica extensa.
14. **Preguntas sobre texto** — Subir o pegar texto, elegir tamaño del texto y nivel; confirmar extracción; generar preguntas literales, inferenciales, críticas y de vocabulario según propósito; incluir respuestas y referencias al texto sin inventar información.
15. **Ficha de observación** — Elegir evento, grupo o equipo completo; importar estudiantes; generar indicadores, escala, fecha, evidencias y notas; permitir registro rápido durante el aula y sincronización posterior.
16. **Registros auxiliares** — Importar estudiantes y periodo; elegir competencias y evidencias; generar tabla editable con cálculos transparentes, filtros y observaciones; permitir Excel por filas sin perder fórmulas o encabezados.
17. **Carpetas de recuperación** — Seleccionar estudiantes uno por uno o por lote; detectar necesidades desde evidencias confirmadas; crear rutas diferenciadas con actividades, fechas, seguimiento y respuestas; nunca producir el mismo paquete para todos sin revisión.
18. **Calificador de rúbricas con IA** — Recibir rúbrica y evidencia; mostrar trazabilidad entre fragmento y criterio; proponer nivel y comentario, pero exigir confirmación docente; permitir corregir y registrar la decisión final.
19. **Retroalimentación Formativa** — Partir de evidencia, criterio y desempeño observado; generar logro, brecha, pregunta y siguiente acción concreta; ofrecer tono oral/escrito; evitar elogios genéricos o calificaciones disfrazadas.
20. **Analítica de aula y alertas, ruta Evaluamos** — Elegir periodo/bimestre, grupo e instrumentos; explicar fuentes y cálculos; mostrar tendencias, capacidades y estudiantes que requieren revisión; no emitir diagnósticos automáticos.

### 9.3 Incluimos

21. **Adaptación Inclusiva NEE (DUA), ruta Incluimos** — Reutilizar el contrato común de apoyos, con una experiencia orientada a intervención; generar al menos acceso, participación, expresión, evaluación y seguimiento; mantener consentimiento y privacidad.
22. **Plan de atención** — Colocar instrucciones y ejemplos en cuadros vacíos; guiar necesidad, barreras, fortalezas, objetivos, acciones, responsables, frecuencia y evidencias; generar plan operativo con fechas, no una descripción general.
23. **Estrategias de inclusión** — Filtrar por barrera, actividad y entorno; sugerir estrategias aplicables con materiales, pasos, señales de éxito y alternativas; permitir marcar usadas y registrar resultados.
24. **Trabajo con familias** — Elegir objetivo y canal; producir comunicación respetuosa, acuerdos, acciones sencillas y seguimiento; evitar compartir datos sensibles y adaptar lenguaje al contexto familiar.
25. **Seguimiento y evaluación** — Seleccionar plan asociado, periodo e indicadores; generar registros comparables, evidencias, ajustes y próxima revisión; mostrar evolución sin etiquetar al estudiante.

### 9.4 Reforzamos

26. **Trabajo autónomo para el hogar** — Generar una actividad posible sin supervisión permanente, instrucciones cortas, ejemplo, recursos disponibles, producto, tiempo y autoevaluación; diferenciarla de la tarea familiar.
27. **Carpeta de recuperación, ruta Reforzamos** — Importar resultados y seleccionar prioridades; crear secuencia progresiva con diagnóstico breve, práctica, aplicación y verificación; incluir versión docente y seguimiento.
28. **Monitorea avances** — Elegir bimestre o rango de fechas, competencia, capacidad y desempeño; importar estudiantes; registrar hitos y evidencias; mostrar progreso comprensible y permitir correcciones.
29. **Acompaña y motiva** — Elegir situación y objetivo; generar acciones breves, mensajes, metas alcanzables y seguimiento; evitar frases vacías y adaptar el apoyo al historial confirmado.
30. **Plan de refuerzo** — Seleccionar máximo tres frecuencias predefinidas y duración; priorizar cómo se realizará sobre cantidad de páginas; generar objetivos, sesiones, recursos, responsables, evidencias y decisión de cierre.

### 9.5 Acompañamos

31. **Correo a familias** — Elegir motivo, tono y destinatarios; generar asunto, saludo, mensaje concreto, llamada a la acción y cierre; botón Copiar y registro del envío manual, sin simular que fue enviado.
32. **Respuesta de correo** — Pegar el mensaje recibido, ocultar datos sensibles cuando sea posible y elegir intención; generar respuesta empática, clara y prudente; diferenciar borrador de envío.
33. **Analítica de aula y alertas, ruta Acompañamos** — Centrar la lectura en acompañamiento; seleccionar periodo y fuente; explicar indicadores y proponer acciones revisables; enlazar casos solo con confirmación humana.
34. **Calificador con IA** — Importar evidencia e instrumento; proponer revisión con justificación visible; el docente confirma puntaje, nivel y comentario; registrar cambios y nunca publicar automáticamente.
35. **Reporte de seguimiento** — Elegir estudiante/grupo y periodo; reunir evidencias autorizadas; generar avances, dificultades observadas, acciones realizadas, acuerdos y próximos pasos; distinguir hechos de recomendaciones.

### 9.6 Tutoría

36. **Plan de tutoría** — Precargar calendario, diagnóstico grupal y prioridades; generar objetivos, actividades, responsables, fechas e indicadores; formato formal con títulos y texto negro en documento exportado.
37. **Sesiones de tutoría** — Elegir tema, edad, duración y contexto; crear inicio seguro, dinámica, diálogo, acuerdos y cierre; incluir advertencias para temas sensibles y material listo para usar.
38. **Informe de tutoría** — Seleccionar periodo y evidencias; producir resumen, acciones, avances, incidencias y recomendaciones diferenciadas; evitar afirmaciones clínicas o no sustentadas.
39. **Informe a padres de familia** — Generar un informe comprensible y respetuoso, con fortalezas, aspectos a trabajar y acuerdos; revisar privacidad y adaptar tono; nunca exponer datos de otros estudiantes.
40. **Fichas de acompañamiento** — Importar estudiante y objetivo; generar campos de observación, conversación, acuerdos, responsables y próxima fecha; facilitar completar durante una reunión.
41. **Alertas y casos** — Formulario breve de hechos observados, urgencia y acciones; rutas de escalamiento configurables; permisos restringidos, bitácora y confirmación humana; nunca diagnosticar ni decidir sanciones con IA.
42. **Recursos de tutoría** — Filtrar por tema, edad, duración y modalidad; generar o recomendar recursos con propósito, pasos, materiales y reflexión; guardar favoritos y resultados de uso.
43. **Orientación vocacional** — Recoger intereses y fortalezas declaradas; proponer actividades exploratorias y fuentes, no destinos deterministas; generar plan de exploración, preguntas y seguimiento.

### 9.7 Recursos

44. **Presentaciones didácticas** — Pedir tema, audiencia, objetivo, cantidad máxima de ocho, estilo e interacción; generar guion de diapositivas con jerarquía, poco texto, imágenes pertinentes, notas docentes y actividad; ajustar automáticamente tipografía y contenido al lienzo 16:9 sin recortar contexto.
45. **Tarjetas de estudio** — Elegir concepto, cantidad y nivel; generar frente/reverso concisos, ejemplos y distractores cuando proceda; permitir repaso, volteo, orden aleatorio e impresión legible.
46. **Agrupar palabras y taxonomías** — Generar categorías inequívocas y elementos clasificables; permitir arrastrar o seleccionar; incluir solución y explicación; colocar claves al final y eliminar firmas innecesarias.
47. **Ordenar bloques y secuencias** — Crear pasos realmente ordenables en la misma línea lógica; interacción accesible por teclado además de arrastre; validar secuencia, dar retroalimentación y exportar sin romper los bloques.
48. **Casos de estudio (ABP)** — Construir caso auténtico, roles, datos, preguntas y producto; revelar información por etapas; incluir guía docente, criterios y posibles rutas sin imponer una sola respuesta.
49. **Juego del ahorcado educativo** — Seleccionar vocabulario adecuado y pistas útiles; excluir términos ambiguos o demasiado largos; ofrecer teclado accesible, intentos, retroalimentación y lista docente.
50. **Completa la frase** — Generar oraciones con una respuesta contextual clara, banco opcional y dificultad gradual; admitir equivalencias previstas y explicar la respuesta.
51. **Emparejar palabras y glosarios** — Crear pares únicos y definiciones comprensibles; mezclar orden, soportar teclado/tacto, dar retroalimentación y producir glosario imprimible.
52. **Dinámica de debate en aula** — Proponer pregunta abierta, contexto, posiciones, evidencia, reglas, tiempos y cierre; incluir roles y rúbrica breve; evitar temas inadecuados para la edad.
53. **Crucigramas** — Máximo 30 palabras; validar cruces, tildes, dimensiones y pistas; generar cuadrícula jugable, numeración, banco opcional y solución separada.
54. **Sopas de letras** — Máximo 30 palabras; ajustar cuadrícula a cantidad y longitud; equilibrar direcciones según edad; generar cuadrícula real, lista, instrucciones y solución claramente diferenciada.
55. **Banco de recursos para planificar** — Filtrar por propósito, área, grado, momento y disponibilidad; proponer actividades listas para una sesión con tiempo, materiales, procedimiento, evidencia y adaptación; guardar favoritas y uso reciente.
56. **Normativa educativa** — Buscar fuentes oficiales y actuales; mostrar título, entidad, fecha, vigencia, enlace y resumen; permitir preguntas abiertas en lenguaje amigable; advertir cuando no se pueda verificar vigencia.
57. **Libros y guías MINEDU** — Catálogo verificable por nivel, área y grado; mostrar portada, año, tipo y enlace oficial; guardar favoritos y evitar enlaces rotos o materiales inventados.
58. **Canales audiovisuales** — Recomendar videos/canales verificables por tema, duración y edad; mostrar fuente y fecha de comprobación; ofrecer guía de uso didáctico y alternativa si el enlace deja de estar disponible.

## 10. Apartados generales y utilidades

### 10.1 Inicio

- conservar distribución y colores actuales sin desbordamientos;
- mostrar “Continuar donde quedaste”, recientes, favoritas y más usadas;
- explicar cada tarjeta en una frase y ofrecer una acción principal;
- permitir ordenar favoritos y ocultar recomendaciones no útiles;
- cargar datos reales del backend, con estados vacíos y de error comprensibles.

### 10.2 Calendario

- vista mensual, semanal y lista, con fechas reales;
- doble clic o toque prolongado para crear evento;
- formulario flotante accesible para nombre, fecha, hora, color, relación con documento y recordatorio;
- calendario pequeño sincronizado con el principal;
- editar, duplicar y borrar con confirmación;
- navegación directa desde un evento al documento relacionado;
- persistencia y zona horaria en backend.

### 10.3 Videos tutoriales

- búsqueda, filtros por apartado y nivel de dificultad;
- duración, subtítulos, transcripción y pasos resumidos;
- marcar visto, continuar reproducción y guardar favoritos;
- recomendaciones ligadas a la pantalla donde el docente tuvo dificultad;
- catálogo y progreso persistidos.

### 10.4 Historial

- incluir creaciones de todas las herramientas dentro de su contexto;
- filtros por herramienta, fecha, grado, área, estado y estudiante;
- acciones Abrir, continuar, duplicar, renombrar, exportar y eliminar;
- versiones, origen en cascada y estado de generación;
- paginación y búsqueda desde backend.

### 10.5 Ideas y mejoras

- formulario guiado con categoría, descripción, captura opcional y prioridad percibida;
- guardar reporte real con identificador;
- mostrar estado recibido/en revisión/resuelto y respuesta administrativa;
- evitar prometer comunicación que el sistema no realiza.

### 10.6 Sube tu formato

- carga accesible de PDF, Word o Excel con límites visibles;
- análisis seguro y vista previa de extracción;
- confirmar secciones detectadas antes de crear una plantilla;
- estados de procesamiento recuperables;
- conservar original, versión interpretada y permisos en backend.

### 10.7 Referidos

- código y enlace verificables, reglas claras y estado de invitaciones;
- impedir duplicados o auto-referidos;
- mostrar beneficios acreditados y pendientes con historial auditable.

### 10.8 Comunidad activa

- publicaciones, comentarios, favoritos, búsqueda y moderación reales;
- categorías pedagógicas y privacidad visible;
- reportes, bloqueo y reglas de convivencia;
- paginación, notificaciones y persistencia completa.

### 10.9 Mis estudiantes

- alta individual e importación Excel con plantilla;
- previsualización y corrección de filas antes de guardar;
- grupos, secciones, estado activo/inactivo y búsqueda;
- enlace opcional a instrumentos, seguimiento y recuperación;
- permisos, historial y protección de datos.

### 10.10 Perfil y cuenta

- edición sencilla de datos docentes e institucionales;
- preferencias de accesibilidad y generación;
- seguridad, cierre de sesiones y exportación/eliminación de datos según política;
- indicador comprensible de créditos e historial de movimientos.

### 10.11 Administración

- panel responsivo con métricas explicadas y acceso por permisos;
- usuarios: buscar, filtrar, crear, editar, suspender, asignar rol y revisar actividad;
- créditos: saldo, movimientos, recargas, devoluciones y reglas administrativas;
- generaciones: estado, herramienta, duración, fallos, reintentos y costos;
- contenidos reportados, sugerencias, archivos y casos sensibles con flujos de revisión;
- configuración de catálogos curriculares, límites, modelos, plantillas y avisos;
- bitácora de acciones administrativas inmutable;
- gráficos accesibles acompañados por tablas y definiciones;
- ninguna tarjeta de administración será decorativa: toda métrica enlazará a datos filtrados.

## 11. Persistencia y modelo de datos

Cada flujo deberá guardar en backend:

- borrador y paso actual;
- entradas estructuradas y archivos asociados;
- documento fuente y campos heredados;
- trabajo de generación con estado, proveedor, intentos y consumo;
- salida estructurada validada;
- versiones y cambios por sección;
- decisión del docente sobre sugerencias;
- exportaciones generadas;
- preferencias de interfaz;
- eventos de error necesarios para soporte, sin guardar secretos.

Los datos locales se usarán únicamente como apoyo temporal. El backend será la fuente de verdad. Todas las mutaciones tendrán autorización por propietario/rol, validación, identificador idempotente y respuesta que permita recuperar el estado después de cerrar o recargar.

## 12. Navegación y responsive global

- cada ruta abrirá arriba, salvo que el usuario elija conscientemente continuar un borrador en una posición guardada;
- el menú lateral conservará encabezado y perfil, mientras la lista central podrá desplazarse;
- en móvil se convertirá en panel superpuesto con cierre visible y foco controlado;
- no habrá desplazamiento horizontal de toda la aplicación;
- tablas extensas tendrán vista de tarjetas o desplazamiento interno con encabezados persistentes;
- modales usarán una sola zona de desplazamiento y acciones visibles sin tapar contenido;
- teclado móvil no ocultará el campo ni el botón principal;
- tarjetas, gráficos, calendarios, editores, vistas previas y documentos tendrán comportamiento definido para 320, 360, 390, 768, 1024, 1366 y 1920 px;
- los tres tamaños de texto se probarán en todos esos anchos y en ambos temas.

## 13. Validación con docentes mayores

### 13.1 Tareas de prueba

1. Encontrar una herramienta sin usar el buscador.
2. Crear una sesión desde cero.
3. Crear una unidad usando un PCA previo.
4. Pedir una sugerencia contextual y corregirla.
5. Recuperarse de una pérdida de conexión.
6. Encontrar un borrador y continuar.
7. Importar estudiantes desde Excel.
8. Generar una lista de cotejo y registrar resultados.
9. Descargar y abrir un documento.
10. Aumentar tamaño de letra y usar el producto en móvil.

### 13.2 Indicadores

- porcentaje que completa sin ayuda;
- tiempo hasta la primera generación válida;
- campos que provocan duda o abandono;
- errores de validación por paso;
- reintentos de IA y fallos recuperados;
- porcentaje de propuestas aceptadas, editadas o descartadas;
- secciones regeneradas frente a documentos completos;
- coincidencia vista previa/exportación;
- legibilidad y confianza declarada;
- solicitudes de soporte por herramienta.

El objetivo inicial será al menos 90 % de finalización asistida, cero pérdida de datos y cero bloqueos críticos en las tareas principales. Los umbrales definitivos se establecerán con una línea base real.

## 14. Pruebas obligatorias

### 14.1 Por cada una de las 58 rutas

- creación desde cero;
- creación con datos mínimos válidos;
- uso opcional de referencia en cascada;
- ayuda contextual pertinente al campo;
- cambio de tema y actualización de sugerencias;
- guardado, cierre y continuación;
- generación con IA exitosa;
- caída de red, timeout y reintento sin duplicar créditos;
- validación del contrato de salida;
- edición y regeneración parcial;
- historial y versión;
- vista previa y cada exportación admitida;
- móvil, tableta, escritorio, tres tamaños de texto, claro y oscuro;
- teclado, foco, lector de pantalla y zoom.

### 14.2 Casos semánticos transversales

- Matemática sobre aritmética no puede transformarse en hábitos saludables;
- un cambio de grado actualiza dificultad y ejemplos;
- un instrumento conserva evidencia y criterios de su documento fuente;
- contenido del estudiante no revela respuestas;
- claves y puntajes coinciden;
- recursos externos tienen fuente válida;
- una salida que no representa la herramienta es rechazada antes de mostrarse.

### 14.3 Pruebas de backend

- permisos de docente, directivo y administrador;
- propiedad de documentos y archivos;
- idempotencia de generación, créditos y exportación;
- concurrencia y doble clic;
- trabajos en segundo plano y recuperación;
- migraciones, índices, paginación y filtros;
- auditoría sin exposición de credenciales o datos sensibles.

## 15. Fases de ejecución

### Fase 0. Inventario y línea base

Congelar catálogo de 58 rutas, mapear pantallas, API, esquema, generador, exportadores y pruebas de cada una. Registrar flujo actual, fallos, tiempos y ejemplos de salida. No comenzar rediseños aislados sin esta matriz.

### Fase 1. Base compartida de experiencia

Implementar componentes accesibles, modo guiado, mensajes recuperables, autosave, preferencias, navegación, modal contextual y responsive. Corregir primero los bloqueos globales porque afectan todas las herramientas.

### Fase 2. Base compartida de backend e IA

Implementar trabajos idempotentes, persistencia de borradores/versiones, créditos seguros, contexto en cascada, contratos de entrada/salida, validadores, reparación parcial y telemetría.

### Fase 3. Planificamos

Migrar y comprobar las ocho rutas en orden PCA → Unidad → Sesión → restantes. La cascada se valida aquí de extremo a extremo.

### Fase 4. Evaluamos

Migrar las doce rutas, priorizando Examen, Rúbrica, Lista de cotejo y Ficha de aprendizaje. Verificar claves, puntajes, estudiantes y Excel.

### Fase 5. Incluimos y Reforzamos

Migrar diez rutas con revisión especial de privacidad, lenguaje no diagnóstico, seguimiento y diferenciación real.

### Fase 6. Acompañamos y Tutoría

Migrar trece rutas, implementar permisos sensibles, trazabilidad y confirmación humana.

### Fase 7. Recursos interactivos

Migrar quince rutas y probar que cada resultado sea jugable, presentable o consultable. Validar imágenes, cuadrículas, soluciones y accesibilidad de interacciones.

### Fase 8. Apartados generales y administración

Completar Inicio, Calendario, tutoriales, historial, ideas, formatos, referidos, comunidad, estudiantes, perfil y administración con datos reales y operaciones persistentes.

### Fase 9. Auditoría integral y lanzamiento

Ejecutar la matriz completa, pruebas con docentes mayores, corrección de incidencias, verificación de exportaciones y prueba de producción. No desplegar una fase si quedan bloqueos P0 o pérdidas de información.

## 16. Priorización

### P0 — bloquea el uso

- generación desconectada del tema;
- error de IA o créditos que deja la interfaz atascada;
- pérdida de respuestas o borradores;
- salida que no corresponde a la herramienta;
- rutas, usuarios o acciones administrativas que no funcionan;
- desbordamiento que impide completar en móvil;
- exportación corrupta o con respuestas expuestas.

### P1 — impide autonomía

- formularios demasiado largos sin guía;
- sugerencias genéricas;
- cascada incompleta;
- historial, versiones o reanudación deficientes;
- contraste, teclado, foco o zoom incorrectos;
- mensajes que no explican cómo recuperarse.

### P2 — mejora eficiencia y confianza

- dictado opcional;
- tutorial contextual;
- favoritos y personalización;
- recomendaciones según uso;
- métricas avanzadas y comparación de versiones.

## 17. Definición de terminado por apartado

Un apartado solo se considerará terminado cuando:

- representa correctamente su función pedagógica;
- puede completarse en modo guiado sin instrucciones externas;
- frontend y backend están conectados a datos reales;
- borrador, trabajo, resultado y versiones persisten;
- la IA usa todo el contexto relevante y no introduce temas ajenos;
- errores, créditos y reintentos son recuperables e idempotentes;
- la vista previa y las exportaciones son fieles;
- funciona en móvil, tableta y escritorio, claro/oscuro y A−/A/A+;
- pasa validación automática y revisión pedagógica;
- cuenta con pruebas, evidencia y monitoreo;
- no contiene controles decorativos o simulados.

## 18. Entregables de control

1. Matriz maestra de las 58 rutas con frontend, backend, contrato, exportación, persistencia y estado.
2. Mapa de dependencias y cascada entre documentos.
3. Biblioteca de componentes accesibles y patrones de formulario.
4. Contratos de generación y validadores por herramienta.
5. Catálogo curricular y fuentes externas versionadas.
6. Banco de casos buenos, inválidos y límites por herramienta.
7. Suite automatizada funcional, semántica, visual y responsive.
8. Evidencia de pruebas con capturas y resultados por dispositivo.
9. Panel de calidad con fallos, tiempos, aceptación y devoluciones de crédito.
10. Manual breve para docentes y guía operativa para administración.

## 19. Decisiones que este plan preserva

- conservar colores, marca y diseño visual del proyecto actual;
- mantener los modos claro y oscuro;
- mantener las 58 rutas existentes y las 57 capacidades reconocidas;
- copiar del proyecto anterior únicamente estructura, distribución o comportamiento útil cuando esté demostrado, nunca su paleta;
- no colocar IA en todos los campos;
- no hacer cambios solo visuales sin lógica y persistencia;
- no automatizar decisiones sensibles que corresponden al docente;
- no considerar “generado” un producto que no cumple la naturaleza de su herramienta.

## 20. Criterio de éxito final

El proyecto estará mejorado cuando un docente mayor pueda entrar, entender dónde está, elegir una herramienta, reconocer qué va a obtener, completar pasos pequeños con ejemplos pertinentes, recibir ayuda contextual que respete el tema, recuperarse de cualquier error, revisar un producto pedagógico auténtico, corregir solo lo necesario, guardarlo y descargarlo correctamente desde cualquier dispositivo.

Ese recorrido deberá funcionar de principio a fin en todas las rutas, no solamente en las herramientas más visibles.

## 21. Capa adicional de intuitividad aprobada

Estas mejoras se aplicarán transversalmente en frontend y backend. No reemplazan las reglas pedagógicas de cada herramienta: facilitan entenderlas y utilizarlas.

1. **Entrada por objetivo docente.** El Inicio preguntará qué desea lograr —planificar, evaluar, crear una actividad, acompañar, incluir o comunicarse— y mostrará las herramientas adecuadas sin exigir que memorice sus nombres.
2. **Asistente inicial en lenguaje natural.** El docente podrá escribir una frase como “Quiero una evaluación de ecuaciones para cuarto de primaria”. El sistema propondrá herramienta, grado, área y tema, y pedirá confirmación antes de rellenar el formulario.
3. **Recorrido inicial breve por herramienta.** La primera apertura explicará qué se completará, qué creará Avendia y cómo se revisará. Podrá cerrarse y reabrirse desde “¿Cómo funciona?”.
4. **Preguntas con estructura conversacional.** Los campos se agruparán como una conversación pedagógica: para quién, qué aprenderá, cómo trabajará y cómo se comprobará. No se expondrán formularios extensos de una sola vez.
5. **Separación visible entre información necesaria y opcional.** Se usarán los rótulos “Necesario para crear”, “Puedes completarlo después” e “Información avanzada”, evitando una acumulación de asteriscos y avisos.
6. **Creación rápida con datos mínimos.** Cuando el contrato mínimo sea válido, se ofrecerá “Crear primera versión”. Las opciones avanzadas permanecerán disponibles para mejorarla después.
7. **Explicación de por qué se solicita cada dato.** Los campos complejos indicarán en una frase cómo influirán en el documento o actividad resultante.
8. **Relación visible entre campo y resultado.** Al enfocar un campo, la miniatura o esquema de salida señalará dónde aparecerá esa información.
9. **Progreso con nombres y trabajo restante.** En vez de solo números, se mostrarán etapas como “Datos del aula”, “Aprendizaje esperado”, “Actividades” y “Revisión”, además de una indicación aproximada de lo que falta.
10. **Estado de preparación tipo semáforo accesible.** Verde, amarillo y rojo siempre estarán acompañados por texto, explicación y enlace al dato que requiere atención.
11. **Sugerencias completas y contextualizadas.** Los accesos de un toque serán propuestas concretas, no etiquetas genéricas, y se recalcularán cuando cambien tema, grado, área, modalidad o propósito.
12. **Acción “No estoy seguro, ayúdame a elegir”.** Los campos pedagógicos complejos abrirán una comparación sencilla de opciones y una recomendación explicada, sin decidir por el docente.
13. **Comparadores de opciones.** Cuando dos instrumentos o configuraciones puedan confundirse, se mostrará cuándo conviene cada uno y qué resultado produce.
14. **Ejemplos situados.** Los ejemplos cambiarán por herramienta, área, grado, modalidad y contexto rural/urbano. Nunca se reutilizará un ejemplo incompatible con el tema actual.
15. **Validación inmediata y amable.** Cada problema se explicará al salir del campo, con un ejemplo válido y una acción que devuelve el foco al control correspondiente.
16. **Resumen permanente de contexto.** Una franja editable mostrará grado, área, tema, sección y periodo para que el docente sepa en todo momento qué contexto usa la IA.
17. **Detección pedagógica de contradicciones.** Si un dato parece incompatible con el grado, modalidad o propósito, Avendia preguntará si se desea adaptar o conservar, sin corregir silenciosamente.
18. **Vista del estudiante y vista del docente.** Cuando corresponda, la revisión separará material entregable, guía docente, respuestas, criterios y anexos para impedir filtraciones accidentales.
19. **Lista de revisión en lenguaje cotidiano.** Antes de descargar se preguntará si el contenido corresponde al tema, si la dificultad es apropiada y si las instrucciones se entienden.
20. **Corrección guiada por intención.** En lugar de un único “Regenerar”, se ofrecerán acciones como simplificar, ampliar, agregar ejemplo, cambiar contexto, mejorar instrucciones o adaptar a otro grado.
21. **Protección de secciones aprobadas.** El docente podrá marcar “Esta parte está bien”; las siguientes correcciones no modificarán ese contenido.
22. **Historial visual de versiones.** Cada versión indicará qué cambió y permitirá comparar o restaurar sin perder las posteriores.
23. **Estado de guardado permanente.** La interfaz comunicará “Guardando”, “Guardado”, “Guardado sin conexión” o “Pendiente de sincronizar” con fecha y hora cuando sea útil.
24. **Salida segura y reanudación exacta.** Al salir se explicará qué se conservó. Al volver, se ofrecerá continuar en el paso, sección y posición relevantes.
25. **Lectura en voz alta.** Instrucciones, preguntas y resultados podrán escucharse por bloque, con controles de pausar, continuar y velocidad.
26. **Dictado por voz revisable.** Los campos largos admitirán dictado; el texto reconocido se mostrará antes de aplicarlo y podrá corregirse manualmente.
27. **Iconos siempre acompañados por texto.** Guardar, descargar, editar, volver y ayuda no dependerán de símbolos aislados.
28. **Acciones destructivas separadas.** Eliminar, descartar y salir sin guardar estarán alejadas de la acción principal y explicarán exactamente qué se perderá.
29. **Centro de ayuda contextual.** Cada paso tendrá explicación específica, ejemplo, video breve, preguntas frecuentes y acceso a soporte relacionado con esa herramienta.
30. **Solicitud de soporte con diagnóstico autorizado.** Con permiso del docente, el reporte incluirá ruta, paso, identificador y estado técnico, nunca secretos, para evitar que tenga que describir errores técnicos.
31. **Modo cómodo persistente.** Además de A−/A/A+, se podrán guardar mayor separación, controles grandes, contraste reforzado, movimiento reducido e instrucciones siempre visibles.
32. **Un solo desplazamiento principal.** En móvil se evitarán paneles, modales y listas con desplazamientos anidados. El teclado no ocultará el campo activo ni la acción principal.
33. **Inicio centrado en la siguiente acción.** Se priorizarán “Continuar”, “Crear”, “Revisar documentos”, “Mis estudiantes” y “Necesito ayuda”; el catálogo completo quedará accesible en “Ver todas”.
34. **Buscador por necesidad.** Admitirá frases como “quiero hacer una prueba” o “necesito comunicarme con una familia” y devolverá opciones explicadas.
35. **Nombres consistentes y diferencias explicadas.** Las herramientas relacionadas conservarán nombres estables y una descripción que aclare cuándo utilizar cada una.
36. **Ayudas administrables y versionadas.** Personal autorizado podrá actualizar ejemplos, textos, videos y preguntas frecuentes desde backend, con historial y publicación controlada.
37. **Medición de confusión.** Se registrarán, respetando privacidad, pasos abandonados, campos corregidos repetidamente, ayudas consultadas y errores para priorizar mejoras reales.

### Exclusión acordada

No se implementará un modo de práctica o demostración independiente. Los ejemplos, recorridos y ayudas estarán integrados en el flujo real de cada herramienta, sin crear una experiencia paralela.

## 22. Intuitividad específica para cada herramienta

Todas compartirán la capa anterior, pero cada ruta tendrá un comportamiento guiado propio. Esta especificación se suma a la definición pedagógica de la sección 9.

### 22.1 Planificamos

1. **PCA:** abrir con “Completemos primero los datos de tu institución”; agrupar el formulario por capítulos; mostrar un mapa anual pequeño; explicar el efecto de cada decisión curricular; permitir completar áreas una por una y enseñar un resumen antes de avanzar.
2. **Unidad de Aprendizaje:** comenzar eligiendo “usar PCA” o “crear sin referencia”; mostrar lo heredado en una tarjeta; convertir competencias, evidencias y sesiones en bloques editables y señalar qué falta para que la unidad sea coherente.
3. **Sesión de Aprendizaje:** preguntar duración y propósito primero; representar inicio, desarrollo y cierre en una línea de tiempo; recalcular minutos al editar; mostrar advertencias comprensibles si el tiempo no alcanza.
4. **Situación significativa:** usar preguntas cotidianas sobre lo que ocurre en la comunidad; transformar las respuestas en una vista previa de contexto, reto y producto; permitir ajustar cada parte mediante acciones concretas.
5. **Proyectos integrados:** presentar las áreas como tarjetas seleccionables; explicar qué aporta cada área; mostrar hitos en una línea temporal y responsables en una tabla simple.
6. **Adaptación NEE/DUA de Planificamos:** reemplazar lenguaje clínico por barreras observables; ofrecer grupos claros de apoyo —acceso, participación, expresión y evaluación— y advertir qué información sensible no debe escribirse.
7. **Tarea de Extensión y Hogar:** comenzar por “¿Qué debe hacer y entregar el estudiante?”; mostrar la tarea real antes de orientaciones; separar materiales, pasos, ejercicios y evidencia; ofrecer vista estudiante/familia/docente.
8. **Carpeta Pedagógica:** mostrar índice con casillas, documentos existentes y faltantes; permitir ordenar mediante botones además de arrastrar; enseñar porcentaje completado y tamaño estimado de exportación.

### 22.2 Evaluamos

9. **Rúbrica:** guiar evidencia → criterios → niveles → descriptores; explicar cada término con un ejemplo; editar directamente en la tabla y resaltar descriptores repetidos o poco observables.
10. **Lista de cotejo:** ofrecer primero importar estudiantes o continuar sin nombres; mostrar una tabla reconocible desde el comienzo; crear indicadores uno por uno y previsualizar inmediatamente las columnas Sí/No.
11. **Ficha de aprendizaje:** presentar tres entradas claras —escribir tema, pegar texto o subir archivo—; mostrar qué contenido fue detectado; organizar la ficha por momentos y separar automáticamente la clave docente.
12. **Examen:** empezar por tema, propósito y cantidad; utilizar una tabla visual para tipos y dificultad; mostrar contador de preguntas/puntos; permitir revisar pregunta por pregunta antes de generar el archivo.
13. **Escala de estimación:** enseñar una mini escala de ejemplo; preguntar primero qué se observará; permitir renombrar niveles y comprobar que sus descripciones avanzan ordenadamente.
14. **Preguntas sobre texto:** mostrar el texto importado y permitir corregirlo; elegir tipos de pregunta con ejemplos; presentar cada pregunta junto al fragmento que la sustenta.
15. **Ficha de observación:** comenzar por quién o qué se observará; permitir elegir grupo completo; usar controles grandes para registrar en clase y guardar cada marca inmediatamente.
16. **Registros auxiliares:** ofrecer plantilla e importación; mostrar una previsualización de filas con errores señalados; explicar cálculos al tocar el encabezado y mantener acciones frecuentes visibles.
17. **Carpetas de recuperación:** separar “un estudiante” y “varios estudiantes”; resumir necesidades detectadas antes de crear; mostrar las diferencias entre carpetas para evitar resultados idénticos involuntarios.
18. **Calificador de rúbricas con IA:** colocar evidencia y rúbrica lado a lado cuando haya espacio; vincular cada propuesta con el fragmento que la respalda; pedir confirmación criterio por criterio.
19. **Retroalimentación formativa:** usar cuatro tarjetas: logro, aspecto por mejorar, pregunta y próximo paso; ofrecer tonos de comunicación; impedir guardar una retroalimentación sin acción concreta.
20. **Analítica y alertas de Evaluamos:** comenzar por periodo y fuente; explicar cada indicador al seleccionarlo; mostrar primero un resumen textual y luego el gráfico; enlazar toda alerta con los datos que la originan.

### 22.3 Incluimos

21. **Adaptación NEE/DUA de Incluimos:** presentar fortalezas antes que barreras; ofrecer apoyos mediante ejemplos visuales; confirmar quién podrá ver el documento y mostrar seguimiento en pasos simples.
22. **Plan de atención:** dividir en “qué observamos”, “qué queremos lograr”, “qué haremos” y “cómo sabremos si funciona”; mostrar ejemplos situados en campos vacíos y una tabla operativa en la revisión.
23. **Estrategias de inclusión:** permitir buscar por dificultad cotidiana; mostrar tarjetas con preparación, aplicación y evidencia; incluir “Guardar como favorita” y “Ya la utilicé” con resultado.
24. **Trabajo con familias:** preguntar primero el propósito de la comunicación; ofrecer tonos explicados; mostrar exactamente lo que recibirá la familia y advertir si contiene información sensible.
25. **Seguimiento y evaluación:** elegir el plan asociado desde una lista comprensible; mostrar comparación entre fecha anterior y actual; pedir evidencia y próximo ajuste sin formularios clínicos.

### 22.4 Reforzamos

26. **Trabajo autónomo:** elegir tiempo disponible y recursos del hogar; mostrar una actividad completa y realizable; separar instrucciones al estudiante y verificación docente.
27. **Carpeta de recuperación:** presentar aprendizajes prioritarios como tarjetas; ordenar actividades de fácil a desafiante; mostrar avance por estudiante y permitir ajustar una carpeta sin afectar las demás.
28. **Monitorea avances:** empezar por bimestre o fechas; seleccionar estudiantes y capacidades con buscador; mostrar una línea de progreso y explicar en palabras qué cambió.
29. **Acompaña y motiva:** elegir situación mediante frases cercanas; proponer una acción pequeña y una fecha de revisión; evitar pantallas densas y mostrar el historial de acompañamiento como conversación.
30. **Plan de refuerzo:** ofrecer tres opciones máximas de frecuencia claramente comparadas; construir sesiones en tarjetas; mostrar quién hace qué, cuándo y cómo se comprobará.

### 22.5 Acompañamos

31. **Correo a familias:** preguntar motivo y resultado esperado; mostrar asunto y mensaje en formato real de correo; ofrecer copiar completo o por sección y confirmar que copiar no significa enviar.
32. **Respuesta de correo:** separar claramente mensaje recibido y borrador; ofrecer tonos con ejemplo; resaltar preguntas del remitente que todavía no fueron respondidas.
33. **Analítica y alertas de Acompañamos:** mostrar primero “qué necesita atención” y “por qué”; permitir filtrar sin conocer términos estadísticos; convertir cada hallazgo en una acción revisable.
34. **Calificador con IA:** explicar el orden subir → revisar → confirmar; mostrar la sugerencia como recomendación, no resultado final; conservar siempre una opción visible para modificar manualmente.
35. **Reporte de seguimiento:** seleccionar persona, periodo y evidencias mediante pasos; construir el reporte por bloques; distinguir visualmente hechos, interpretación y recomendación.

### 22.6 Tutoría

36. **Plan de tutoría:** presentar prioridades y calendario en paralelo; sugerir actividades por periodo; indicar de forma clara cuáles datos son institucionales y cuáles debe completar el tutor.
37. **Sesiones de tutoría:** comenzar por propósito y clima esperado; mostrar la sesión como secuencia de momentos; incluir advertencias y rutas de ayuda para temas sensibles sin alarmar al usuario.
38. **Informe de tutoría:** reunir evidencias mediante selección, no copia manual; mostrar resumen por periodo; señalar frases que requieren sustento antes de permitir la exportación.
39. **Informe a padres:** ofrecer vista previa con lenguaje familiar; explicar términos pedagógicos difíciles; incluir revisión de privacidad y una confirmación antes de descargar o copiar.
40. **Fichas de acompañamiento:** diseñar para completar durante la conversación; controles grandes, guardado inmediato y pocos campos por pantalla; mostrar acuerdos y próxima fecha al finalizar.
41. **Alertas y casos:** usar una ruta corta para urgencias y otra normal; indicar acciones institucionales disponibles; confirmar hechos, responsables y permisos en cada avance.
42. **Recursos de tutoría:** búsqueda por necesidad y duración; tarjetas con “para qué sirve”, materiales y pasos; vista previa antes de guardar o utilizar.
43. **Orientación vocacional:** presentar intereses como opciones explorables; explicar que no es un diagnóstico; convertir resultados en actividades y próximos pasos, no en una profesión definitiva.

### 22.7 Recursos

44. **Presentaciones didácticas:** mostrar miniaturas desde el inicio; usar controles como “menos texto”, “imagen más grande” o “hacer más participativa”; advertir desbordamientos y ajustar cada diapositiva al lienzo automáticamente.
45. **Tarjetas de estudio:** crear y revisar una tarjeta por vez; alternar frente/reverso; mostrar contador y detección de duplicados; permitir cambiar dificultad con una opción clara.
46. **Agrupar palabras:** enseñar las categorías como contenedores y una palabra de muestra; permitir probar la clasificación; avisar si una palabra admite varias respuestas antes de publicar.
47. **Ordenar bloques:** mostrar una secuencia de ejemplo breve integrada en la ayuda; permitir mover con botones arriba/abajo; validar inmediatamente y explicar el orden correcto.
48. **Casos ABP:** presentar el caso como historia por etapas; mostrar roles y preguntas en tarjetas; indicar qué información ve primero el estudiante y qué conserva el docente.
49. **Ahorcado:** previsualizar palabra, pista e intentos; avisar términos inadecuados o muy largos; mostrar una vista jugable antes de guardar.
50. **Completa la frase:** mostrar oración, espacio y respuesta en una tarjeta; permitir equivalencias; señalar ambigüedad antes de crear el ejercicio.
51. **Emparejar palabras:** presentar pares de muestra y vista mezclada; detectar definiciones demasiado parecidas; permitir probar un emparejamiento.
52. **Debate:** guiar pregunta → posiciones → evidencia → reglas → cierre; mostrar un cronómetro visual configurable y tarjetas de rol listas para usar.
53. **Crucigramas:** mostrar tamaño estimado y palabras que no cruzan; permitir corregir esas palabras; ofrecer vista actividad y solución separadas.
54. **Sopa de letras:** actualizar la cuadrícula al cambiar palabras; indicar si una palabra no cabe; permitir elegir dificultad mediante ejemplos visuales, no términos abstractos.
55. **Banco para planificar:** buscar por una necesidad expresada en palabras; tarjetas comparables por tiempo, material y propósito; insertar una actividad en una planificación con confirmación de campos.
56. **Normativa educativa:** búsqueda con preguntas sencillas; resultado con vigencia y fuente en primer plano; resumen comprensible y acceso al texto oficial sin confundirlo con una recomendación de IA.
57. **Libros y guías MINEDU:** filtros grandes y dependientes; portadas y metadatos claros; acciones “Ver”, “Guardar” y “Usar en una planificación” con explicación.
58. **Canales audiovisuales:** filtrar por duración, edad y tema; mostrar miniatura, fuente y objetivo didáctico; comprobar enlace antes de ofrecerlo y sugerir alternativa cuando falle.

## 23. Criterios adicionales de terminado para la intuitividad

Además de la sección 17, ninguna herramienta estará terminada hasta demostrar que:

- el docente puede encontrarla describiendo su necesidad;
- entiende qué producto obtendrá antes de rellenar información;
- reconoce cuáles datos son indispensables y cuáles puede omitir;
- puede completar el flujo sin conocer vocabulario técnico;
- recibe ejemplos compatibles con su contexto actual;
- las sugerencias cambian cuando cambia el tema;
- puede identificar y corregir un error sin perder respuestas;
- distingue material del estudiante, contenido docente y soluciones;
- puede modificar una parte sin rehacer todo;
- sabe cuándo su trabajo está guardado y cómo retomarlo;
- todas las ayudas y estados existen realmente en backend cuando requieren persistencia;
- el flujo conserva legibilidad, orden y acciones accesibles en móvil y con tamaño A+.

## 24. Mejoras adicionales aprobadas para reducir dudas y esfuerzo

Estas capacidades también forman parte de la ejecución. Se implementarán reutilizando componentes y servicios comunes, con adaptación de contenido y comportamiento para cada herramienta.

1. **Pantalla “Esto es lo que necesitas”.** Antes de comenzar, cada herramienta mostrará en pocas líneas los datos que se solicitarán y el producto concreto que se obtendrá.
2. **Tiempo estimado para completar.** Se calculará según los pasos, campos opcionales y archivos seleccionados; se actualizará cuando el docente cambie el nivel de personalización.
3. **Estado por sección.** Cada bloque mostrará “Sin comenzar”, “Incompleto”, “Listo” o “Necesita revisión”, con texto e icono y acceso directo al problema.
4. **Procedencia de cada dato.** Los valores distinguirán si fueron escritos por el docente, recuperados de su perfil, heredados de otro documento o propuestos por Avendia.
5. **Explicación del autocompletado.** Todo valor aplicado automáticamente indicará su origen y permitirá cambiarlo o restaurarlo.
6. **Botones deshabilitados con causa visible.** Ninguna acción importante aparecerá inactiva sin explicar qué falta y cómo resolverlo.
7. **Valores recomendados explicados.** Cantidades, duraciones, niveles y formatos sugeridos mostrarán el motivo pedagógico o práctico de la recomendación.
8. **Advertencia antes de cambios con dependencias.** Antes de modificar grado, modalidad, área, tema o documento fuente se informarán las secciones afectadas y se protegerán las aprobadas.
9. **Mapa del documento.** Las herramientas extensas ofrecerán un índice navegable con las secciones, su estado y errores pendientes.
10. **Sección actual destacada.** Título, progreso y acción principal comunicarán el mismo paso; no se dependerá de círculos numéricos pequeños.
11. **Últimas opciones utilizadas.** El sistema podrá recordar grado, sección, área, duración y formatos, pero mostrará una confirmación antes de aplicarlos a una creación nueva.
12. **Perfiles de aula.** El docente podrá guardar combinaciones como “4.º A · Matemática” y reutilizarlas en herramientas compatibles; backend controlará propiedad, actualización y archivado.
13. **Plantillas personales.** Se podrán guardar estructuras aprobadas por el docente, aplicarlas parcialmente y versionarlas sin alterar las plantillas oficiales.
14. **Asistente para archivos problemáticos.** Ante un PDF, Word o Excel inválido se indicará qué se pudo leer, qué falló, cómo corregirlo y qué información quedó guardada.
15. **Detección de documentos similares.** Antes de crear un posible duplicado, se ofrecerá continuar, duplicar conscientemente o iniciar uno nuevo.
16. **Confirmaciones breves no bloqueantes.** Guardados y cambios comunes usarán avisos discretos; los modales se reservarán para decisiones de riesgo.
17. **Resumen final de lo creado.** Al terminar se describirán tipo, tema, grado, cantidad de elementos, anexos y formatos disponibles.
18. **Siguiente paso recomendado.** Después de guardar se ofrecerá una sola continuación pedagógica opcional, preservando el vínculo en cascada.
19. **Guía rápida imprimible.** Cada herramienta tendrá una hoja de ayuda accesible con propósito, pasos, campos y solución de problemas frecuentes.
20. **Panel de orientación permanente.** El usuario podrá consultar dónde está, qué debe hacer, qué creará Avendia, si está guardado y cómo regresar.
21. **Glosario contextual.** Los términos pedagógicos mostrarán definición sencilla y ejemplo relacionado con el grado, área y herramienta actuales.
22. **Detección de respuestas demasiado extensas.** Se ofrecerá resumir mostrando comparación y sin sustituir el original hasta recibir confirmación.
23. **Límite de carga cognitiva.** No se presentarán más de cinco decisiones nuevas simultáneamente; listas largas se agruparán y tendrán búsqueda.
24. **Pruebas de comprensión con docentes.** La validación incluirá explicar con palabras propias qué se está creando y cuál es el siguiente paso, además de completar técnicamente el flujo.
25. **Indicadores administrativos de dificultad.** Administración mostrará abandono, errores, apertura de ayudas, reintentos y regeneraciones por herramienta, con acceso al detalle agregado y respetando privacidad.

### Persistencia de esta capa

Perfiles de aula, plantillas personales, estados por sección, procedencia de datos, preferencias, progreso, documentos similares, ayudas consultadas y siguientes pasos deberán tener contratos y almacenamiento reales. No se simularán mediante valores fijos en React ni se dependerá exclusivamente de `localStorage`.

## 25. Registro de ejecución verificable

### Implementado en la base transversal

- Entrada por necesidad docente desde “Nueva creación” y desde el buscador global, con interpretación de frases cotidianas y recomendación explicada de herramientas.
- Traspaso del pedido del docente al formulario compatible como dato editable; se detecta el área curricular cuando la frase contiene un contexto reconocido.
- Panel previo “Antes de comenzar” con datos necesarios, producto esperado y tiempo aproximado en los flujos comunes y en las once rutas especiales.
- Progreso por requisitos, trabajo restante y estados textuales de cada paso.
- Distinción de procedencia de datos: perfil, docente, documento de referencia o IA.
- Validación amable al abandonar un campo y navegación al dato que requiere corrección.
- Preferencias persistentes por cuenta para controles amplios, ayuda visible, reducción de movimiento y preparación de lectura en voz alta.
- Persistencia idempotente de generaciones de flujo: el mismo intento de red conserva su identificador, recupera el resultado ya creado y no duplica generación ni consumo.
- Guardado inmediato del resultado generado en el historial del backend.
- Conservación de preferencias de asistencia con IA y de experiencia docente dentro del mismo registro, sin que una configuración borre la otra.

### Evidencia automática de esta entrega

- Backend: 107 pruebas aprobadas y revisión de estilo aprobada.
- Frontend: 183 pruebas aprobadas, revisión de estilo aprobada y compilación de producción aprobada.
- Auditoría responsive sin resultado: 290 de 290 combinaciones aprobadas.
- Auditoría responsive con resultado visible: 290 de 290 combinaciones aprobadas.
- Matriz visual: 57 herramientas en 320×568, 390×844, 768×1024, 1366×768 y 1920×1080.
- En ambas matrices: cero desbordamientos globales, cero controles críticos inaccesibles y cero errores de consola o red no permitidos.

### Continuidad obligatoria del plan

Este registro no elimina ni reduce las secciones anteriores. Las capacidades especializadas que requieran nuevos modelos —perfiles de aula, plantillas personales versionadas, telemetría administrativa de dificultad, glosario administrable y comparación visual de versiones— seguirán implementándose sobre esta base, con migración, autorización, pruebas y frontend real antes de marcarse como terminadas.
