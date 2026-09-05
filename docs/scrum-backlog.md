# Scrum de reconstrucción funcional — Avendia 3.0

## Objetivo de producto

Reconstruir Avendia sin mezclar el código heredado, conservando sus contratos funcionales útiles, la generación con IA, el vocabulario educativo peruano y la identidad visual azul/violeta del proyecto nuevo.

## Definition of Done

Una herramienta solo se considera terminada cuando:

- aparece en el menú y su ruta abre correctamente;
- tiene modalidad educativa obligatoria;
- pide únicamente los datos que modifican su resultado;
- autocompleta el perfil sin bloquear la edición;
- valida campos y pasos;
- genera contenido real en el backend con salida estructurada;
- permite revisar, guardar, copiar y descargar;
- funciona en 360 px, tableta y escritorio;
- tiene prueba de contrato o cobertura en el registro;
- no usa plantillas estáticas presentadas como IA;
- mantiene la decisión final del docente en evaluación, alertas e inclusión.

## Incremento entregado — Sprint 0: contrato y plataforma común

- Inventario de 57 herramientas y siete módulos.
- Matriz ejecutable con 57 contratos, sin fallback genérico.
- Modalidad obligatoria verificada automáticamente para todas.
- Flujos de 2 a 9 pasos según complejidad.
- Endpoint autenticado de generación estructurada con Gemini.
- Protección de instrucciones: los textos del formulario se tratan como datos.
- Borradores locales, sincronización, copia y exportación Word.
- Diseño responsivo reutilizando colores, tipografía, bordes y componentes actuales.
- Pruebas: cobertura del registro, autenticación, validación y respuesta estructurada.

## Incremento entregado — Sprint 1: resultados interactivos

- Contrato de IA con carga interactiva validada para los 15 recursos.
- Reproductor de presentaciones y tarjetas con giro.
- Ahorcado con vidas, teclado, pistas, avance y reinicio.
- Completar y emparejar con comprobación y puntaje.
- Crucigrama generado con cruces, cuadrícula y corrección por letra.
- Sopa de letras con cuadrícula seleccionable y palabras encontradas.
- Casos, debate, normativa, banco, libros y canales en tarjetas accionables.
- Exportación Word ampliada para conservar consignas, respuestas, pistas y opciones.
- Pruebas de renderizado para todos los modos interactivos.

## Product backlog priorizado

### Épica 1 — Planificación curricular compleja

1. PCA: validar los nueve pasos, calendarización y secciones de documento.
2. Unidad: conectar selección de competencias oficiales por nivel y área.
3. Sesión: ofrecer fuentes tema/libro/apuntes y edición temporal de momentos.
4. Proyecto integrado: matriz por área, roles y cronograma.
5. Carpeta pedagógica: índice y anexos reordenables.

Criterio de aceptación: los documentos mantienen consistencia entre modalidad, nivel, área, propósito, evidencia, criterio y evaluación.

### Épica 2 — Evaluación y analítica

1. Rúbrica, lista, escala y observación en tablas editables.
2. Examen y preguntas sobre texto con clave separada.
3. Registros auxiliares con filas de estudiantes.
4. Calificador con citas de evidencia y confirmación docente.
5. Analítica con indicadores, alertas y acciones diferenciadas.

Criterio de aceptación: ninguna calificación automática se guarda como decisión final sin revisión docente.

### Épica 3 — Inclusión, refuerzo y acompañamiento

1. PAI y DUA con barreras, fortalezas, apoyos, responsables y seguimiento.
2. Plan de refuerzo y recuperación con agrupamiento flexible.
3. Seguimiento socioemocional con lenguaje no clínico.
4. Correos e informes con edición previa.
5. Alertas con acceso protegido y ruta de derivación.

Criterio de aceptación: los documentos no inventan diagnósticos, normas, personas ni estadísticas.

### Épica 4 — Tutoría

1. Plan, sesiones e informe articulados por periodo.
2. Atención a familias y fichas con acuerdos trazables.
3. Alertas con medidas de protección y seguimiento.
4. Orientación vocacional con exploración, no recomendación determinista.

Criterio de aceptación: los datos sensibles no aparecen en listados generales y los casos requieren sesión autenticada.

### Épica 5 — Recursos didácticos interactivos

1. Entregado: presentaciones con reproductor, contenido y notas docentes.
2. Entregado: tarjetas con giro y repaso.
3. Entregado: ahorcado con partida, vidas, pistas y resultado.
4. Entregado: completar y emparejar con interacción, corrección y reinicio.
5. Entregado: crucigrama y sopa con cuadrícula, selección y solución.
6. Entregado: debate y caso ABP con tarjetas accionables y guía docente.
7. Entregado: exportación nativa a PPTX y PDF para presentaciones, con edición, duplicado, reordenamiento y regeneración de diapositivas.
8. Mejora futura: temporizador persistente de debate.

Criterio de aceptación: cada actividad funciona como actividad; no se limita a mostrar un párrafo generado.

### Épica 6 — Integraciones y datos oficiales

1. Catálogo CNEB por modalidad, nivel, grado y área.
2. Fuentes MINEDU verificables.
3. Historial, versiones y recuperación de borradores.
4. Plantillas institucionales cargadas por el usuario.

## Riesgos controlados

- El código anterior tiene rutas duplicadas y estilos inconsistentes: se usa como referencia funcional, no como base copiada.
- Los modelos pueden producir información incorrecta: se fuerza estructura y revisión docente.
- «Modalidad» no basta para adaptar el resultado: nivel, grado, área y propósito también son obligatorios cuando corresponden.
- Pedir director en juegos crea fricción sin valor: se reserva para documentos oficiales.
- Un formulario enorme en una sola página falla en móvil: la navegación es por pasos y guarda el avance.

## Orden recomendado de validación con el usuario

1. PCA, unidad y sesión.
2. Rúbrica, examen y calificador.
3. PAI, plan de refuerzo y alertas.
4. Plan e informe de tutoría.
5. Presentaciones y juegos interactivos.
