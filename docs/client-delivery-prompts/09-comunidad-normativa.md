# Punto 9 · Comunidad activa y consultas normativas

## Prompt de implementación

Implementa la Comunidad activa de Avendia como un espacio colaborativo real, integrado al backend y coherente con el diseño actual. Las publicaciones deben persistir en la base de datos, estar aisladas por permisos y mostrarse de forma responsive en escritorio, tableta y móvil.

### Comunidad activa

- Crear publicación con título, contenido, categoría (idea, experiencia, recurso, pregunta), modalidad EBR/EBA/EBE, nivel, área y contexto urbano/rural/rural multigrado.
- Validar título y contenido, mostrar ejemplos en campos vacíos y permitir editar o eliminar solo la publicación propia; el administrador puede moderar.
- Listar publicaciones recientes con búsqueda, filtros por categoría/modalidad/nivel/contexto, autor, fecha y estado. Mostrar estados de carga, vacío, error y confirmación.
- Añadir acciones de copiar enlace, marcar útil y reportar contenido; no exponer datos personales sensibles ni permitir HTML inseguro.
- Persistir todo en la base de datos con autor, fechas, estado de moderación y metadatos. No depender únicamente de localStorage.
- Mantener enlaces externos (WhatsApp/Telegram) como accesos opcionales, claramente separados del contenido interno.

### Normativa educativa

- Mantener la herramienta como flujo de consulta con filtros por tipo de norma, ámbito, modalidad, nivel, área y propósito.
- Formular preguntas abiertas y amigables tanto para contexto rural como urbano. La respuesta debe separar marco aplicable, obligaciones, aplicación en aula y fuentes oficiales para verificación.
- No inventar normas, vigencias, códigos ni enlaces. Señalar siempre qué debe confirmar el docente en MINEDU, DRE o UGEL.

### Calidad

- Probar autenticación, autorización, persistencia, filtros, edición, borrado, moderación y paginación.
- Asegurar contraste en modo claro/oscuro, controles de teclado, textos negros en documentos generados y cero overflow horizontal.
