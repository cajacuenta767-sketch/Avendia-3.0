# Punto 8 · Recursos didácticos y actividades generadas

## Prompt de implementación

Actúa como responsable de producto, especialista en diseño didáctico CNEB y desarrollador full-stack de Avendia. Revisa todas las rutas de `Recursos`, el código del frontend y los endpoints de IA. Completa cada herramienta con el formato nuevo de Avendia (tipografía, bordes, tarjetas, colores claro/oscuro y navegación actuales), pero recupera la profundidad funcional del proyecto anterior. No reemplaces herramientas diferentes por un formulario genérico: cada una debe conservar sus propios campos, límites, pasos, botones, instrucciones, resultado y exportación.

### Contrato común de cada herramienta

1. Mostrar un flujo de pasos visible y navegable. El docente puede volver a un paso sin perder datos; los campos obligatorios se validan antes de avanzar y cada campo vacío muestra una instrucción o ejemplo útil.
2. Incluir siempre modalidad educativa seleccionable (EBR, EBA y EBE), nivel, grado/ciclo, sección, área, docente e institución cuando el recurso lo necesite. Los selectores dependientes deben actualizarse al cambiar nivel o modalidad.
3. El botón de IA debe usar el contexto del formulario y generar contenido real estructurado, no una pantalla de texto fijo. El resultado debe quedar editable, permitir regenerar, guardar en historial, copiar/descargar y mostrar recomendaciones para revisión docente.
4. No añadir “Sugerir con IA” a todos los campos. Solo mostrar asistencia contextual donde el proyecto anterior la tenía o donde aporte una sugerencia concreta (por ejemplo, el tema o las pistas); la acción debe abrir preguntas adaptadas al campo.
5. Sanitizar la salida: texto negro en documentos, sin asteriscos, firmas inventadas, Markdown decorativo ni afirmaciones de fuentes no verificadas. Mantener accesibilidad, foco visible, teclado, lector de pantalla y modo oscuro sin texto ilegible.

### Comportamiento por recurso

- **Tarjetas de estudio:** tema, cantidad (4–30), tipo de tarjeta y dificultad. Resultado como tarjetas volteables frente/reverso, pista, navegación, repaso espaciado y edición individual.
- **Agrupar palabras:** tema y 2–4 categorías. Resultado como tablero de arrastrar/seleccionar, explicación del criterio y botón de comprobar; al exportar, conservar cada categoría en su propia fila/columna y no insertar firmas.
- **Ordenar bloques:** tipo de secuencia, tema y 4–8 bloques. Mostrar bloques reordenables, comprobar orden, pistas y justificación; en Word cada bloque debe permanecer en una misma línea.
- **Casos de estudio y debate:** relato contextualizado (rural o urbano), actores, dilema, perspectivas, preguntas abiertas, evidencias, acuerdos de convivencia y guía para el docente.
- **Ahorcado, completar y emparejar:** respetar sus mecánicas interactivas, contador de intentos, respuestas/distractores, comprobación y reinicio. No presentar solo la respuesta generada.
- **Crucigrama:** aceptar de 5 a 30 palabras. Generar pistas y cruces posibles, tablero editable, numeración, comprobación y solución; si una palabra no cruza, ubicarla de forma legible y advertirlo.
- **Sopa de letras:** aceptar de 5 a 30 palabras. Escalar la cuadrícula proporcionalmente al número y longitud de palabras, mantener celdas cuadradas legibles con desplazamiento en pantallas pequeñas, incluir horizontal/vertical/diagonal/inversa según dificultad, selección continua o por celdas, lista de palabras tachable y comprobación.
- **Banco de recursos para planificar:** filtros por tipo, modalidad, nivel, área, enfoque transversal y duración. Generar propuestas concretas de actividades para una sesión (inicio, desarrollo, cierre), materiales, adaptación DUA/NEE, evaluación y fuente o criterio de verificación. Permitir guardar favoritos y reutilizar una propuesta.
- **Normativa educativa:** filtros por tipo de norma, ámbito, modalidad, nivel y propósito; preguntas abiertas y amigables para contexto rural/urbano. Mostrar resumen, obligaciones, aplicación en aula y enlaces o referencias oficiales para verificar; no inventar normas.
- **Libros/guías MINEDU y canales audiovisuales:** buscar por tema, propósito, idioma, accesibilidad y duración. Entregar recurso, uso antes/durante/después, preguntas guía, adaptación y referencia verificable. Para imágenes, usar solo fuentes autorizadas o una referencia visual honesta; no afirmar que se descargó una imagen de Google.

### Calidad, persistencia y pruebas

- Guardar formularios, resultados, favoritos e historial en la base de datos por usuario; aislar datos entre cuentas y permitir archivar/restaurar.
- Probar cada ruta con datos válidos, campos faltantes, límites mínimos/máximos, regeneración, edición, guardado, exportación, recarga y error de IA/API.
- Ejecutar pruebas unitarias y de integración del backend, lint, build y pruebas visuales en escritorio, tableta y móvil. Verificar que no exista overflow horizontal, que los controles se adapten y que el modo oscuro tenga contraste correcto.
- Documentar cualquier dato que deba revisarse por el docente (normativa, fuente, imagen o recomendación) y no bloquear la generación por un campo opcional.
