# Prompt maestro de implementación — fases 5 a 10

## Objetivo

Completar Avendia 3.0 sin copiar la identidad visual del proyecto anterior. El proyecto anterior es la fuente funcional para pasos, campos, filtros, opciones, ayudas, botones, comportamientos y resultados; Avendia 3.0 conserva su propio sistema visual azul/violeta, sus temas claro y oscuro y su diseño adaptable.

La entrega se considera terminada únicamente cuando las 57 herramientas del menú están inventariadas, implementadas y verificadas. No se acepta una pantalla genérica repetida ni un botón de IA añadido indiscriminadamente.

## Reglas innegociables

1. No exponer credenciales de Gemini en React, variables `VITE_*`, respuestas HTTP, registros, capturas o archivos versionados. La clave vive solamente en el servidor.
2. Mantener el modelo Gemini configurable por entorno y validar que el proveedor responda antes de certificar la integración.
3. Conservar los colores, tipografía, espaciado, componentes y estados claro/oscuro del proyecto nuevo.
4. Recuperar del proyecto anterior la estructura funcional, no su marca ni su paleta.
5. Cada herramienta debe tener una definición explícita: ruta, módulo, complejidad, pasos, campos, validaciones, dependencias, resultado, historial, plantillas y formatos de descarga.
6. La modalidad educativa es obligatoria en las 57 herramientas. Nivel, grado/ciclo, área y competencia deben usar listas dependientes cuando corresponda.
7. Nombre del docente, institución, DRE, UGEL y responsables se autocompletan desde el perfil, pero siguen siendo editables cuando el documento lo requiera.
8. “Sugerir con IA” aparece solo en los campos pedagógicos comprobados en el proyecto anterior. Nunca en DRE, UGEL, institución, nombres, modalidad, nivel, grado, sección, fechas o datos de identificación.
9. La ayuda de IA debe conocer herramienta, módulo, campo seleccionado, preguntas específicas, sugerencias elegidas, detalle personalizado, valor actual y contexto completo del formulario. El servidor construye la instrucción final y trata los datos del formulario como datos no confiables, no como instrucciones.
10. Ninguna herramienta termina mostrando solo un texto suelto. Debe generar un artefacto estructurado, revisable y descargable, acorde con su tipo.

## Fase 5 — Gemini seguro y verificable

- Guardar `GEMINI_API_KEY` únicamente en `.env` local/secretos del servidor y mantener `.env` ignorado por Git.
- Configurar `GEMINI_MODEL` con un modelo Flash vigente y no fijar la clave en código.
- Exigir clave Gemini, PostgreSQL, secreto JWT robusto y SMTP cuando `ENVIRONMENT=production`.
- Ejecutar una prueba mínima contra el proveedor y una prueba autenticada contra la API de Avendia.
- Registrar consumo, modelo y herramienta sin registrar prompts sensibles ni la clave.
- Devolver errores claros: sin configuración, sin créditos y fallo temporal del proveedor.

## Fase 6 — Certificación funcional de las 57 herramientas

- Comparar cada ruta del proyecto anterior con su ruta nueva y mantener una matriz trazable.
- Certificar exactamente: 8 herramientas de Planificamos, 11 de Evaluamos, 5 de Incluimos, 5 de Reforzamos, 5 de Acompañamos, 8 de Tutoría y 15 de Recursos.
- Para cada herramienta documentar: número y nombre de pasos, campos por paso, tipo de control, obligatoriedad, opciones, ejemplos, ayudas, dependencias, botones de IA autorizados, tipo de resultado y descargas.
- Impedir rutas duplicadas, herramientas sin flujo, campos duplicados y etapas recuperadas fuera de orden.
- Mantener flujos complejos más profundos que recursos rápidos. El PCA conserva nueve etapas y la disposición institucional de tres columnas en escritorio.

## Fase 7 — Formularios, filtros y validación

- Inputs de texto y áreas de texto deben tener ejemplos útiles, no textos genéricos vacíos.
- Selectores deben mostrar opciones reales y estado deshabilitado explicativo cuando dependan de otro campo.
- Usar controles adecuados: selección única, radio, tarjetas, selección múltiple, repetidores, números y fechas.
- Mostrar obligatorio/opcional, ayuda contextual y error junto al campo.
- No avanzar de paso cuando falte un dato obligatorio o un valor esté fuera de rango.
- Restablecer dependientes cuando cambie nivel o área para impedir combinaciones CNEB inválidas.
- Conservar borrador local y servidor, reabrir documentos desde historial y evitar pérdida de información al navegar.

## Fase 8 — IA contextual, no universal

- Mantener un inventario explícito por herramienta y campo de todos los botones recuperados.
- Abrir un diálogo adaptado al campo con dos preguntas propias, al menos cinco sugerencias rápidas y un detalle opcional.
- Enviar al backend identificadores de herramienta y campo, etiquetas, preguntas, respuestas, sugerencias, valor actual y valores del formulario como estructura; no concatenar el prompt definitivo en el navegador.
- Mostrar una propuesta editable antes de aplicarla.
- Permitir reemplazar o añadir al contenido actual.
- Regenerar secciones del resultado sin reescribir el resto del documento.
- Descontar créditos solo después de una respuesta válida y conservar trazabilidad de uso.

## Fase 9 — Resultado, edición, historial, plantillas y descarga

- Generar secciones estructuradas específicas por herramienta y mantener su orden.
- Incluir resumen, secciones, puntos clave, recomendaciones y actividad interactiva cuando corresponda.
- Permitir edición de títulos y narrativas, guardado, regeneración de una sección y recuperación desde historial.
- Aplicar plantillas institucionales configuradas por el administrador.
- Descargar Word para documentos, PPTX para presentaciones y PDF cuando el tipo de artefacto lo requiera.
- Verificar que el archivo descargado tenga contenido, nombre correcto y datos de la institución.
- No marcar un flujo como completo si la respuesta no respeta las secciones solicitadas.

## Fase 10 — Calidad visual, accesibilidad y operación

- Probar menú expandido/contraído, barra superior, tamaños A−/A/A+, modales, tablas, calendarios y asistentes.
- Probar tema claro y oscuro sin superficies blancas ilegibles, textos sin contraste ni controles invisibles.
- Probar 360×800, 768×1024, 1366×768 y 1920×1080 sin desplazamiento horizontal accidental ni botones fuera de pantalla.
- Verificar navegación por teclado, foco visible, etiquetas accesibles, cierre con Escape y bloqueo correcto del fondo en diálogos.
- Ejecutar pruebas de frontend, backend, compilación, lint y análisis estático.
- Reiniciar los servicios con la configuración final y comprobar salud de frontend y API.
- Entregar un informe de certificación con evidencias, excepciones reales y trabajo pendiente; no declarar paridad basándose únicamente en que la ruta carga.

## Criterio de aceptación final

La fase 10 termina cuando: Gemini funciona desde la API sin exponer la clave; las 57 rutas tienen contrato único y probado; los botones de IA coinciden exactamente con el inventario anterior; los resultados se pueden revisar, guardar y descargar; el diseño nuevo funciona en claro/oscuro y en los cuatro tamaños objetivo; y todas las comprobaciones automatizadas pasan sin errores.
