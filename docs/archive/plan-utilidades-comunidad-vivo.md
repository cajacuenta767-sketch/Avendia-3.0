# Plan vivo · Utilidades y comunidad de Avendia

> Estado: en implementación; primera entrega funcional verificada el 4 de septiembre de 2026. El alcance completo todavía no está terminado. Véase sección 21.  
> Alcance: **Videos tutoriales, Historial, Ideas y mejoras, Sube tu formato, Referidos y Comunidad activa**.  
> Regla de mantenimiento: este documento es acumulativo. No reemplaza `plan-vivo-57-herramientas.md`; añade las capacidades transversales que sirven a todas las herramientas y documentos de Avendia.

## 1. Objetivo

Convertir las seis opciones de utilidad del menú lateral en módulos funcionales, con información persistente, permisos por rol, estados de carga y error, flujos completos y administración real. No se aceptan pantallas únicamente visuales, botones sin efecto ni datos ficticios permanentes.

## 2. Prompt maestro de implementación

Actúa como arquitecto de producto educativo, diseñador UX/UI, especialista CNEB Perú, experto en IA generativa y desarrollador full-stack de Avendia. Implementa de forma completa y funcional los módulos Videos tutoriales, Historial, Ideas y mejoras, Sube tu formato, Referidos y Comunidad activa.

Respeta la identidad del proyecto nuevo: azul Avendia, violeta como acento, fondos suaves, textos oscuros legibles, bordes discretos y modo oscuro consistente. La navegación lateral debe poder desplazarse sin ocultar opciones. El diseño debe funcionar en escritorio, tableta y móvil.

Cada acción debe tener un resultado real: crear, buscar, filtrar, editar, guardar, descargar, recuperar, moderar o notificar según corresponda. Asociar los datos al usuario autenticado; aplicar validación, permisos, paginación en servidor, auditoría de acciones sensibles y estados vacíos útiles. No exponer datos privados, archivos de otros docentes, contraseñas, tokens ni información administrativa sensible.

Antes de dar cada módulo por terminado, comprobar API, permisos, persistencia tras recargar, modo claro, modo oscuro, escritorio, móvil, accesibilidad y flujo de error.

## 3. Inventario y prioridad

| N.° | Módulo | Prioridad | Dependencias | Estado |
|---:|---|---|---|---|
| 1 | Historial | Crítica | Documentos, artefactos generados, autenticación | En implementación · núcleo verificado |
| 2 | Sube tu formato | Crítica | Almacenamiento de archivos, Historial, autenticación | En implementación · núcleo verificado |
| 3 | Videos tutoriales | Alta | Biblioteca, progreso, administración | En implementación · núcleo verificado |
| 4 | Ideas y mejoras | Alta | Comentarios, notificaciones, moderación | En implementación · núcleo verificado |
| 5 | Referidos | Media | Créditos IA, auditoría, registro | En implementación · núcleo verificado |
| 6 | Comunidad activa | Alta | Publicaciones, comentarios, reacciones, moderación | En implementación · núcleo verificado |

`Mis estudiantes` no forma parte de este plan porque es una capacidad académica independiente ya integrada al ecosistema de evaluación.

## 4. Fundaciones compartidas

Estas capacidades se implementarán una sola vez y serán reutilizadas por los seis módulos.

### 4.1 Archivos y adjuntos

- Tabla de archivos con propietario, nombre original, nombre seguro, extensión, tamaño, tipo MIME, ruta segura, estado, fecha y metadatos.
- Validación de extensiones y límite configurable de peso antes de almacenar.
- Acceso mediante autorización: privado, compartido institucional o público en comunidad.
- Vista previa cuando el tipo de archivo lo permita; descarga controlada y eliminación recuperable.
- Auditoría de subida, reemplazo, descarga, cambio de visibilidad y eliminación.

### 4.2 Notificaciones

- Modelo de notificación con usuario destinatario, tipo, entidad relacionada, texto, fecha, leído/no leído y enlace de destino.
- Casos iniciales: respuesta a idea, cambio de estado, reacción/comentario comunitario y referido validado.
- Centro de notificaciones con marcar como leído, marcar todas y filtros básicos.

### 4.3 Auditoría y moderación

- Registro de actor, acción, módulo, entidad, fecha, IP o contexto técnico cuando aplique y resumen seguro del cambio.
- Acciones auditables: créditos, moderación, ocultamiento, eliminación, restauración, cambios de rol y cambio de visibilidad.
- Estados de moderación reutilizables: visible, pendiente, oculto, reportado, archivado y eliminado.

### 4.4 Experiencia transversal

- Búsqueda y filtros en servidor, paginación, ordenamiento y URL sincronizada cuando corresponda.
- Estados: cargando, sin resultados, sin permisos, error recuperable y éxito con confirmación.
- Confirmación antes de eliminar o alterar créditos; operaciones reversibles cuando sea viable.
- Cumplir contraste, foco visible, navegación por teclado, etiquetas accesibles y textos comprensibles.

## 5. Especificación por módulo

### 5.1 Historial

**Propósito.** Centralizar los documentos, recursos, presentaciones y evaluaciones creados por cada docente.

**Datos mínimos por registro.** Usuario propietario, herramienta de origen, módulo, título, tipo de artefacto, modalidad, nivel, grado, área, fecha de creación, fecha de actualización, estado, versión, favoritos, contenido o referencia segura y archivos exportados disponibles.

**Flujo docente.**

1. Ver historial reciente y favoritos.
2. Buscar por título y filtrar por módulo, herramienta, fecha, nivel, modalidad, tipo y estado.
3. Abrir, editar, duplicar, renombrar, guardar como favorito, descargar según el formato permitido y archivar.
4. Consultar versiones; restaurar una anterior tras confirmación.
5. Mover a papelera y recuperar durante el periodo de retención definido.

**Flujo administrador.** Consultar métricas globales sin acceder al contenido privado salvo necesidad autorizada; identificar fallas, herramientas más usadas, actividad reciente y volumen de generación.

**API orientativa.** `GET /history`, `GET /history/{id}`, `PATCH /history/{id}`, `POST /history/{id}/duplicate`, `POST /history/{id}/restore`, `DELETE /history/{id}`, `POST /history/{id}/recover`.

**Criterio de aceptación.** Un documento generado desde cualquier herramienta persistente aparece en Historial, conserva su contexto, puede reencontrarse mediante filtros y no puede ser visto por otro docente sin permiso.

### 5.2 Sube tu formato

**Propósito.** Permitir que cada docente conserve formatos institucionales y los use como referencia, sin modificar el original.

**Tipos iniciales.** DOCX, PDF, XLSX, imágenes y otros formatos que el administrador habilite.

**Flujo docente.**

1. Arrastrar o seleccionar archivo.
2. Validar extensión, peso, seguridad y duplicado.
3. Completar nombre, categoría, descripción y etiquetas.
4. Revisar vista previa si está disponible y confirmar guardado.
5. Abrir, descargar, renombrar, reemplazar, etiquetar, eliminar o seleccionar como referencia para una herramienta compatible.

**Categorías iniciales.** Sesión, unidad, PCA, rúbrica, lista de cotejo, ficha, informe, plan, tutoría, inclusión y otros.

**Flujo administrador.** Configurar extensiones, pesos máximos, categorías, formatos institucionales compartidos y moderar archivos reportados. Ningún docente puede ver archivos privados de otro docente.

**API orientativa.** `POST /templates/upload`, `GET /templates`, `GET /templates/{id}`, `PATCH /templates/{id}`, `POST /templates/{id}/replace`, `DELETE /templates/{id}`, `POST /templates/{id}/use-reference`.

**Criterio de aceptación.** El archivo persiste tras recargar, solo el propietario puede administrarlo, y una herramienta compatible puede recibirlo como referencia sin sobrescribirlo.

### 5.3 Videos tutoriales

**Propósito.** Formar al docente mediante una biblioteca contextual de videos del producto.

**Datos mínimos.** Título, descripción, categoría, duración, dificultad, miniatura, URL segura, etiquetas, herramienta relacionada, estado de publicación, orden y métricas agregadas.

**Flujo docente.** Buscar, filtrar por categoría/herramienta/dificultad, reproducir, continuar desde el último punto, marcar como visto, guardar favorito y ver progreso total. Recomendar tutoriales según herramientas usadas y estado de aprendizaje.

**Flujo administrador.** Crear, editar, ordenar, publicar, despublicar y eliminar tutoriales; revisar vistas, finalizaciones y tutoriales con baja finalización.

**API orientativa.** `GET /tutorials`, `GET /tutorials/{id}`, `POST /tutorials/{id}/progress`, `POST /tutorials/{id}/favorite`; administración bajo `/admin/tutorials`.

**Criterio de aceptación.** El progreso es individual, persiste entre sesiones y el contenido no publicado no es visible a docentes.

### 5.4 Ideas y mejoras

**Propósito.** Recibir propuestas de producto y reportes de problema con seguimiento transparente.

**Datos mínimos.** Autor, título, descripción, categoría, módulo relacionado, prioridad percibida, adjuntos, estado, votos, comentarios, respuesta administrativa y fechas.

**Estados.** Recibida, En revisión, Planificada, En desarrollo, Publicada, No priorizada y Resuelta.

**Flujo docente.** Crear propuesta, elegir categoría, adjuntar evidencia opcional, votar una sola vez, comentar, seguir, editar mientras esté recibida y recibir aviso al cambiar su estado.

**Flujo administrador.** Filtrar, responder, priorizar, cambiar estado, fusionar duplicados, ocultar abusos y publicar respuestas visibles.

**API orientativa.** `GET /ideas`, `POST /ideas`, `GET /ideas/{id}`, `PATCH /ideas/{id}`, `POST /ideas/{id}/vote`, `POST /ideas/{id}/comments`; administración bajo `/admin/ideas`.

**Criterio de aceptación.** Los votos son únicos por usuario, las actualizaciones notifican al autor y el administrador puede gestionar el ciclo completo.

### 5.5 Referidos

**Propósito.** Incentivar invitaciones válidas mediante códigos únicos y créditos IA trazables.

**Datos mínimos.** Código único, propietario, enlace de invitación, invitado, estado de registro, elegibilidad, crédito concedido, fecha, motivo de rechazo y auditoría.

**Flujo docente.** Ver código, copiar, compartir por canal disponible, revisar invitaciones, registros, referidos activos, créditos obtenidos y reglas vigentes.

**Reglas.** No permitir autoreferido, cuenta duplicada, crédito repetido ni manipulación de la misma identidad. Toda recompensa genera un movimiento de créditos con motivo y trazabilidad.

**Flujo administrador.** Configurar créditos, pausar programa, revisar alertas, aprobar o anular casos y consultar conversión.

**API orientativa.** `GET /referrals/me`, `POST /referrals/code`, `POST /referrals/claim`, `GET /admin/referrals`, `POST /admin/referrals/{id}/review`.

**Criterio de aceptación.** Una recompensa válida se concede una sola vez, es visible para ambas partes autorizadas y puede auditarse.

### 5.6 Comunidad activa

**Propósito.** Crear una comunidad docente moderada para preguntas, experiencias y recursos pedagógicos.

**Datos mínimos.** Autor, categoría, título, contenido, etiquetas, módulo opcional, modalidad, nivel, área, adjuntos, estado de moderación, fecha, reacciones, comentarios, guardados y reportes.

**Flujo docente.** Publicar, editar o eliminar publicaciones propias; comentar, responder comentarios, reaccionar, guardar, seguir temas, buscar, filtrar, adjuntar y denunciar. Mostrar recientes, destacadas, sin respuesta y recomendadas.

**Flujo administrador.** Aprobar, ocultar, fijar, etiquetar, atender reportes, bloquear contenido y aplicar acciones de cuenta según política.

**API orientativa.** `GET /community/posts`, `POST /community/posts`, `GET /community/posts/{id}`, `PATCH /community/posts/{id}`, `POST /community/posts/{id}/comments`, `POST /community/posts/{id}/reactions`, `POST /community/posts/{id}/report`; administración bajo `/admin/community`.

**Criterio de aceptación.** Los docentes solo gestionan sus propias publicaciones; comentarios, reacciones y reportes persisten; el contenido oculto desaparece del feed público.

## 6. Fases de implementación

### Fase 0 · Auditoría y contratos

- Revisar rutas actuales, componentes existentes, modelos, autenticación y datos reutilizables.
- Definir esquemas, permisos, migraciones, índices, paginación y contratos de API.
- Inventariar cuáles de las 57 herramientas ya guardan documentos y cuáles deben integrarse a Historial.
- Crear matriz de acciones por rol: docente, administrador y sistema.

### Fase 1 · Base compartida

- Implementar adjuntos, notificaciones, auditoría, estados de moderación y utilidades de búsqueda/paginación.
- Crear pruebas de autorización y acceso privado antes de conectar las pantallas.

### Fase 2 · Historial y Sube tu formato

- Conectar artefactos existentes con Historial.
- Construir papelera, favoritos, versiones y recuperación.
- Implementar biblioteca de formatos privados e institucionales.
- Permitir seleccionar una plantilla compatible desde los flujos de generación.

### Fase 3 · Videos tutoriales

- Crear catálogo, filtros, reproducción, favoritos y progreso individual.
- Crear gestión administrativa y métricas agregadas.

### Fase 4 · Ideas y mejoras

- Crear ciclo de vida de propuestas, votos, comentarios, notificaciones y mesa administrativa.

### Fase 5 · Referidos

- Crear códigos, atribución segura durante el registro, movimientos de créditos y revisión administrativa.

### Fase 6 · Comunidad activa

- Crear publicaciones, comentarios, reacciones, guardados, filtros, reportes y moderación.
- Añadir notificaciones contextuales y reglas de visibilidad.

### Fase 7 · Centro de administración y analítica

- Reunir indicadores de los seis módulos en el panel administrativo.
- Añadir filtros de periodo, exportación segura de métricas agregadas y alertas operativas.

### Fase 8 · Calidad y liberación

- Pruebas de API, migraciones, permisos, componentes, formularios y recuperación de errores.
- Prueba manual de escritorio, tableta, móvil, claro y oscuro.
- Confirmar que no hay botones inertes, datos de demostración visibles ni acceso cruzado entre cuentas.

## 7. Matriz mínima de permisos

| Acción | Docente | Administrador |
|---|---:|---:|
| Ver y editar historial propio | Sí | Solo métricas globales por defecto |
| Gestionar formatos propios | Sí | Sí, más formatos compartidos |
| Ver tutoriales publicados | Sí | Sí |
| Gestionar catálogo de tutoriales | No | Sí |
| Crear ideas, votar y comentar | Sí | Sí |
| Cambiar estado o fusionar ideas | No | Sí |
| Compartir código de referido | Sí | Sí |
| Configurar recompensas o anular créditos | No | Sí |
| Publicar y participar en comunidad | Sí | Sí |
| Moderar comunidad y reportes | No | Sí |

## 8. Reglas de calidad obligatorias

1. Cada botón visible ejecuta una acción verificable o se muestra deshabilitado con explicación.
2. Los errores de red, permisos y validación se comunican sin revelar información técnica o sensible.
3. El modo oscuro mantiene contraste suficiente, controles distinguibles y estados activos legibles.
4. Toda lista grande usa paginación o carga progresiva en servidor.
5. Los filtros y búsquedas preservan su estado mientras el usuario navega dentro del módulo.
6. El borrado material requiere confirmación y, cuando sea posible, pasa primero por papelera.
7. Los flujos de créditos, referidos y moderación quedan auditados.
8. Los archivos privados y documentos docentes nunca se exponen por URL predecible ni a usuarios no autorizados.
9. Cada módulo debe tener pruebas de permisos, persistencia, estado vacío y principal acción del usuario.
10. La versión móvil debe permitir todas las acciones sin overflow horizontal ni controles fuera de pantalla.

## 9. Criterio de terminado global

El plan se considerará terminado solo cuando los seis módulos permitan operaciones reales, los datos persistan tras recargar, las acciones estén protegidas por rol, el panel administrativo funcione, los estados claro y oscuro sean legibles, las vistas respondan en móvil y escritorio, y las pruebas automatizadas y manuales estén aprobadas.

## 10. Registro de decisiones y ampliaciones

| Fecha | Decisión o nueva solicitud | Módulos afectados | Prioridad | Estado | Evidencia requerida |
|---|---|---|---|---|---|
| 2026-09-04 | Crear los seis módulos laterales con funcionalidad real, no solo visual. | Todos | Alta | Planificado | API, persistencia, permisos y QA responsive. |

> Agregar aquí cada nueva idea aprobada. No borrar entradas anteriores: actualizar su estado y enlazar las pruebas cuando se implemente.

## 11. Ampliación aprobada · Operación, calidad y conexión entre módulos

> Esta sección amplía el alcance original. No crea módulos aislados: cada punto debe aprovechar autenticación, documentos, créditos IA, notificaciones, panel administrativo, historial y rutas ya existentes. Su implementación se planificará por fases; no debe iniciarse de manera implícita al añadir este plan.

### 11.1 Centro de actividad personal

Agregar una cronología privada para cada docente que consolide acciones relevantes sin duplicar el Historial documental: documento generado o recuperado, formato subido o reemplazado, tutorial completado, idea publicada o actualizada, referido validado, publicación comentada y crédito modificado.

- Reutilizar la auditoría con una proyección segura orientada al docente; no exponer eventos administrativos internos ni datos de terceros.
- Cada evento debe incluir tipo, resumen comprensible, fecha, icono, módulo origen y enlace a la entidad cuando el usuario conserve permiso.
- Incluir filtros por módulo y periodo, paginación y estado vacío útil.
- No usar esta cronología como sustituto del Historial: Historial administra artefactos; Actividad explica acciones recientes.

### 11.2 Filtros guardados, favoritos y colecciones

Extender Historial y Sube tu formato con vistas guardadas y colecciones privadas del docente.

- Ejemplos: “PCA 2026”, “Rúbricas de Primaria”, “Formatos institucionales”, “Pendientes de exportar” y “Favoritos”.
- Una colección solo guarda referencias a documentos o formatos; no duplica archivos ni contenido.
- Guardar nombre, filtros, orden, propietario y fecha; permitir editar, aplicar y eliminar la vista.
- Preservar filtros activos en la URL y en la sesión para que volver a un módulo no reinicie el trabajo del docente.

### 11.3 Cuotas, retención y administración de almacenamiento

Complementar el modelo de archivos con control de capacidad, sin impedir silenciosamente el trabajo.

- Mostrar espacio usado, límite asignado, porcentaje, archivos más pesados y categorías que consumen más espacio.
- Configurar límites por rol desde administración, manteniendo valores razonables para docentes y formatos institucionales.
- Advertir antes de llegar al límite y ofrecer limpiar papelera, descargar o borrar archivos seleccionados.
- Definir una política de retención: papelera recuperable con días restantes y purga automática auditada al vencer el plazo.
- La eliminación definitiva debe requerir confirmación y no debe borrar archivos que sigan referenciados por un documento histórico sin advertir al usuario.

### 11.4 Compatibilidad inteligente de formatos

Profundizar la integración entre Sube tu formato y las 57 herramientas.

- Cada formato debe declarar categoría, tipo de archivo, nivel de compatibilidad y herramientas sugeridas; por ejemplo, una rúbrica con Rúbrica de evaluación o una sesión con Sesión de Aprendizaje.
- La interfaz debe mostrar “Compatible con” y permitir abrir únicamente los flujos válidos desde el formato seleccionado.
- Al elegir “usar como referencia”, enviar al generador una referencia controlada y el contenido extraíble autorizado, nunca sustituir ni modificar el archivo original.
- Si no se puede leer el archivo, conservarlo como adjunto de consulta y explicar claramente que no será interpretado de forma automática.
- El administrador podrá publicar formatos institucionales compartidos, versionarlos y marcar uno como recomendado sin reemplazar archivos personales.

### 11.5 Detección de duplicados y relaciones existentes

Reducir carga duplicada sin bloquear decisiones legítimas del docente.

- Antes de subir, comparar nombre normalizado, tamaño, hash seguro y propietario para detectar el mismo archivo; ofrecer reemplazar, conservar ambos o cancelar.
- Antes de publicar una idea, buscar títulos y etiquetas similares; mostrar coincidencias como sugerencia, nunca impedir automáticamente la publicación.
- En Comunidad activa, advertir de publicaciones propias similares recientes y permitir continuar con justificación opcional.
- Registrar la decisión tomada solo cuando haya reemplazo o fusión, manteniendo trazabilidad.

### 11.6 Versiones comparables y recuperación segura

Ampliar el control de versiones del Historial más allá de restaurar una copia.

- Mostrar fecha, autor, herramienta, versión y resumen de cambio.
- Para contenido estructurado, comparar campos o secciones: título, competencias, actividades, criterios, anexos y ajustes DUA.
- Para archivos binarios, mostrar metadatos y ofrecer vista previa de ambas versiones cuando exista soporte; no prometer comparación textual de un PDF escaneado.
- Restaurar siempre como una nueva versión, nunca destruir la versión actual; registrar la acción en auditoría y actividad del docente.

### 11.7 Tutoriales contextuales y rutas de aprendizaje

Conectar la biblioteca de videos con el trabajo real del docente.

- Cada herramienta debe poder asociar uno o más tutoriales mediante su ruta o identificador existente.
- Mostrar una ayuda contextual discreta: “Ver cómo crear una rúbrica”, “Guía para subir este formato” o “Aprende a exportar esta presentación”.
- Al finalizar un video, ofrecer “Abrir herramienta y practicar” con navegación al módulo correcto, sin completar formularios sin consentimiento.
- Crear rutas de aprendizaje: Primeros pasos, Planificación anual, Evaluación, Inclusión y DUA, Tutoría y Administración.
- Registrar progreso por usuario, reanudar reproducción, marcar finalización y medir conversión desde tutorial hacia uso exitoso de la herramienta.

### 11.8 Ideas y mejoras enriquecidas

Convertir el módulo de ideas en una fuente accionable de producto, no solo un muro de comentarios.

- Tipos explícitos: nueva herramienta, mejora de flujo, error técnico, contenido pedagógico, accesibilidad, exportación y solicitud administrativa.
- Para reportes de error, permitir adjuntar captura, ruta afectada, pasos para reproducir, resultado esperado, resultado actual y urgencia percibida.
- Mantener títulos, etiquetas y votos existentes; añadir detección de similares antes de enviar.
- Vincular ideas aprobadas con una entrada de cambio o una tarea interna, mostrando al docente un estado claro sin revelar datos privados del equipo.
- Incorporar tiempos orientativos de respuesta definidos por administración, sin generar compromisos automáticos de fecha.

### 11.9 Notificaciones, preferencias y resumen útil

Extender la base de notificaciones para que cada docente controle el ruido.

- Categorías: documentos, formatos, tutoriales, ideas, comunidad, referidos, créditos y avisos administrativos.
- Preferencias por categoría: inmediato dentro de la app, resumen semanal o silenciado.
- El resumen semanal debe contener solo hechos relevantes: documentos pendientes, respuesta a ideas, publicaciones guardadas, progreso de tutorial y movimientos de créditos.
- No enviar ni almacenar contraseñas, tokens, contenido privado de otro usuario ni detalles de moderación confidencial.
- Diseñar el centro de notificaciones con leído/no leído, filtros y enlaces seguros a la entidad disponible.

### 11.10 Referidos transparentes y protección antifraude

Hacer que Referidos sea explicable, trazable y resistente a abusos.

- Mostrar reglas vigentes, crédito posible, condiciones de elegibilidad, estado de cada invitación y motivo claro cuando sea rechazada.
- Usar estados: enlace compartido, registro iniciado, pendiente de validación, validado, acreditado, rechazado y anulado.
- Añadir controles de autoreferido, correo repetido, crédito repetido, volumen anormal y reintentos idempotentes.
- Las recompensas se ejecutan una vez mediante una operación transaccional que registra el movimiento de créditos y evita duplicados ante reintentos de red.
- El administrador puede pausar el programa, cambiar reglas futuras, revisar alertas, anular una recompensa con motivo y consultar conversión agregada.

### 11.11 Comunidad activa con recursos reutilizables y calidad

Fortalecer Comunidad activa como espacio pedagógico útil y moderado.

- Al publicar, permitir adjuntar un formato o recurso propio seleccionándolo desde Sube tu formato; el autor elige visibilidad: solo enlace privado no compartible, institución o comunidad pública.
- Exigir confirmación antes de publicar un archivo e informar que no debe contener nombres de estudiantes, notas reales ni datos personales.
- Añadir estados editoriales: reciente, destacada, fijada, sin respuesta, verificada por moderación y archivada.
- Reconocer contribuciones mediante marcadores de calidad moderados —respuesta útil, recurso destacado, aporte verificado— sin convertir el módulo en competencia de puntos.
- Incorporar búsqueda por herramienta, modalidad, área, nivel, etiqueta y tipo de recurso, respetando visibilidad y permisos.

### 11.12 Convivencia, moderación y privacidad por defecto

Formalizar reglas antes de abrir interacciones entre docentes.

- Publicar normas de convivencia, categorías de reporte, mensajes de orientación y consecuencias proporcionales.
- Reportes con estado recibido, en revisión, resuelto y descartado; las decisiones administrativas quedan auditadas.
- Separar contenido visible, reportes, notas de moderación y sanciones. Los docentes no deben ver información confidencial de una revisión.
- Configurar bloqueo, ocultamiento, fijado, cierre de comentarios y suspensión de cuenta mediante permisos administrativos explícitos.
- Todo documento, formato y evidencia comienza como privado. La visibilidad pública requiere una acción afirmativa del propietario.

### 11.13 Exportación, portabilidad y derecho a respaldo

Dar control al docente sobre sus propios datos sin exponer información de terceros.

- Permitir solicitar exportación de su Historial, formatos propios, colecciones, progreso de tutoriales, ideas propias y actividad de referidos.
- Generar archivos descargables con alcance explícito, fecha de preparación y vencimiento de enlace cuando aplique.
- Excluir comentarios o publicaciones de otros usuarios cuando no haya derecho de acceso; no incluir registros internos de moderación.
- Registrar la solicitud y descarga como evento de auditoría.

### 11.14 Panel administrativo operativo y analítica responsable

Extender el centro administrativo existente con datos accionables de los seis módulos.

- Alertas: archivos pendientes de revisión, espacio cercano al límite, reportes comunitarios, ideas sin respuesta, referidos sospechosos, tutoriales con abandono y fallos de generación relacionados con documentos.
- Indicadores agregados por periodo: documentos creados, formatos reutilizados, tutoriales finalizados, ideas por estado, participación comunitaria, conversión de referidos y consumo de almacenamiento.
- Medir resultados pedagógicos indirectos y prudentes: tutorial visto → herramienta abierta → artefacto guardado. No inferir desempeño de estudiantes ni perfilar docentes de manera invasiva.
- Permitir exportación de métricas agregadas según permisos y registrar operaciones administrativas sensibles.

### 11.15 Operación resiliente y búsqueda global

Establecer garantías técnicas reutilizables para que los módulos se comporten como un solo producto.

- Operaciones de carga, crédito, recompensa, comentario y notificación deben admitir reintentos idempotentes para no duplicar resultados por una falla de red.
- Incorporar colas o tareas diferidas cuando el procesamiento de archivos, generación de vistas previas o envío de notificaciones no deba bloquear la interfaz.
- Añadir búsqueda global en el encabezado: documentos propios, formatos permitidos, tutoriales publicados, ideas y comunidad; cada resultado respeta los permisos del usuario.
- La búsqueda global debe reutilizar un contrato de resultados común y mantener enlaces estables a las rutas existentes.
- Definir métricas operativas mínimas: errores por módulo, tiempos de respuesta, reintentos, fallos de almacenamiento y acciones pendientes de moderación.

### 11.16 Onboarding funcional por módulo

Evitar pantallas vacías sin guía para quienes ingresan por primera vez.

- Historial vacío: explicar que los documentos generados aparecerán allí y ofrecer abrir una herramienta frecuente.
- Formatos vacío: invitar a subir el primer formato y explicar compatibilidad.
- Tutoriales: recomendar una ruta según el perfil registrado.
- Ideas: proponer reportar una mejora con estructura clara.
- Referidos: explicar reglas antes de compartir el código.
- Comunidad: mostrar normas, filtros y una llamada a publicar una primera consulta o experiencia.
- El onboarding se puede cerrar, no vuelve a aparecer de forma invasiva y no reemplaza datos reales cuando ya existen.

## 12. Nueva secuencia de prioridad sugerida

1. Fundaciones compartidas: archivos, permisos, auditoría, notificaciones e idempotencia.
2. Historial, versiones, papelera, filtros guardados y actividad personal.
3. Sube tu formato, cuotas, compatibilidad y selección como referencia.
4. Tutoriales contextuales y rutas de aprendizaje.
5. Ideas enriquecidas, ciclo de producto y notificaciones.
6. Referidos transparentes, movimientos de crédito y antifraude.
7. Comunidad activa, privacidad, recursos compartibles y moderación.
8. Búsqueda global, panel administrativo operativo, analítica responsable y portabilidad.

## 13. Criterios adicionales de aceptación

1. Ninguna función nueva duplica fuentes de verdad: los artefactos usan el Historial existente, los créditos usan el libro de movimientos y los eventos usan auditoría/notificaciones compartidas.
2. La interfaz nunca oculta información por overflow: las listas tienen scroll interno, paginación o recorte explicable; los controles quedan accesibles en móvil.
3. Cualquier reintento de una acción sensible no genera archivos, créditos, reacciones, comentarios o notificaciones duplicadas.
4. Los docentes pueden entender por qué un formato, referido, publicación o idea está en un estado determinado.
5. El administrador puede intervenir con trazabilidad, pero no obtiene acceso indiscriminado a contenido privado.
6. Cada mejora aprobada debe registrar ruta afectada, modelo de datos, permisos, contrato de API, caso de prueba y evidencia visual antes de marcarse como terminada.

## 14. Ampliación aprobada · Conexión con la implementación existente

> Esta sección parte de la arquitectura ya presente: `HistoryPage` combina documentos de nube y borradores del dispositivo; `TemplateLibrary` y el módulo `templates` ya cargan formatos privados; Comunidad ya persiste publicaciones; y las rutas de Videos, Ideas y Referidos deben dejar de depender de contenido estático o almacenamiento local. Ninguna mejora de este bloque debe reemplazar estas bases sin migración y pruebas de compatibilidad.

### 14.1 Sincronización de borradores y resolución de conflictos

Resolver la coexistencia entre borradores locales y documentos sincronizados que ya muestra Historial.

- Añadir identificador estable de documento, versión de servidor, fecha de última sincronización y huella de contenido en cada borrador persistente.
- Al abrir o guardar desde dos dispositivos, detectar si existe una modificación remota posterior a la copia local.
- Ofrecer tres decisiones explícitas: conservar versión local como nueva versión, conservar versión de nube o comparar antes de decidir. Nunca sobrescribir silenciosamente.
- Mantener los documentos en conflicto hasta que el docente lo resuelva; registrar la decisión en Historial y auditoría.
- El frontend debe mostrar un estado claro de sincronización: guardado localmente, sincronizado, pendiente, conflicto o error recuperable.

### 14.2 Trazabilidad de artefactos de principio a fin

Crear una relación verificable entre las entidades que ya se generan dentro de Avendia.

- Cada documento debe poder conocer herramienta de origen, documento padre, versión, plantilla seleccionada, exportaciones realizadas y duplicados derivados.
- Representar esa información como línea de origen en Historial, sin mostrar detalles técnicos innecesarios al docente.
- Al duplicar, restaurar o aplicar formato, crear referencias de procedencia en vez de duplicar información inconsistente.
- Para administración, permitir métricas agregadas de herramientas, formatos y exportaciones sin abrir el contenido privado por defecto.

### 14.3 Mapeo verificable de campos para formatos institucionales

Ampliar el uso actual de plantillas para que el resultado conserve la estructura del documento institucional.

- Definir un catálogo de campos Avendia reutilizables: docente, institución, directivo, DRE, UGEL, modalidad, nivel, grado, sección, área, competencias, desempeños, evidencias, criterios, fechas, firmas y anexos.
- Permitir que una plantilla declare qué campos admite, cuáles son obligatorios y cómo se insertan: texto, tabla, encabezado, pie, lista, fila de Excel o sección de Word.
- Ofrecer detección sugerida para formatos conocidos; el docente o administrador confirma la correspondencia antes de usarla como estándar.
- Mantener una vista de previsualización antes de exportar y reportar campos sin equivalencia, en lugar de inventar texto o dejar espacios engañosos.
- El mapeo institucional debe versionarse y su uso debe quedar ligado a la trazabilidad del documento exportado.

### 14.4 Informe privado de análisis de formato

Después de subir un archivo, generar una ficha técnica privada que ayude a usarlo correctamente.

- Detectar formato, extensión, tamaño, estructura disponible, páginas u hojas, tablas, secciones y posibles campos reconocibles.
- Clasificarlo por tipo de documento y sugerir herramientas compatibles, reutilizando las categorías del módulo de plantillas.
- Mostrar advertencias honestas: archivo escaneado sin texto extraíble, plantilla dañada, formato protegido o contenido no compatible con el renderizador actual.
- El análisis debe quedar vinculado al archivo del propietario, ser regenerable y no hacer público el contenido ni enviarlo a Comunidad.

### 14.5 Protección de datos sensibles antes de compartir

Incorporar prevención guiada antes de publicar o hacer visible contenido docente.

- Revisar títulos, textos y adjuntos destinados a Comunidad o biblioteca institucional para detectar posibles nombres completos de estudiantes, identificadores, teléfonos, correos, calificaciones u otra información personal.
- Mostrar advertencia con acciones: volver a editar, ocultar el dato, conservar como privado o confirmar que cuenta con autorización.
- No bloquear documentos privados ni enviar contenido sensible a servicios externos sin una acción informada del propietario.
- Registrar únicamente la decisión de publicación y la categoría de advertencia, no una copia del dato sensible detectado.

### 14.6 Reacciones únicas y métricas confiables en Comunidad

Sustituir el conteo acumulativo simple de “Útil” por una interacción asociada al usuario.

- Crear entidad de reacción con publicación, usuario, tipo y fecha; aplicar unicidad por usuario, publicación y tipo.
- Permitir marcar y retirar “Útil”; actualizar el contador en el frontend sin duplicar votos por recarga o reintento.
- Mantener métricas agregadas para contenido destacado, pero no revelar quién reaccionó salvo que se apruebe una política explícita de visibilidad.
- Incluir pruebas de concurrencia, permiso y operación idempotente.

### 14.7 Preguntas resueltas, respuestas aceptadas y guardado personal

Hacer que Comunidad priorice soluciones pedagógicas reutilizables.

- Las publicaciones de tipo pregunta pueden pasar a estado resuelta por su autor; una respuesta puede marcarse como aceptada.
- La respuesta aceptada queda destacada sin ocultar otras contribuciones válidas.
- Permitir guardar una publicación o respuesta en favoritos, colección personal o recurso para consultar después, respetando visibilidad y permisos.
- Registrar cambios de estado y notificar a las personas involucradas sin crear spam.

### 14.8 Comentarios anidados, menciones y límites saludables

Extender Ideas y Comunidad con conversación estructurada.

- Soportar comentarios y respuestas con profundidad limitada para garantizar lectura en móvil y moderación simple.
- Permitir menciones a usuarios autorizados mediante un selector controlado; enviar una notificación con enlace seguro a la respuesta.
- Aplicar límites de longitud, edición durante una ventana definida, eliminación propia y moderación administrativa.
- No permitir que una mención exponga usuarios no visibles en el contexto institucional o comunitario.

### 14.9 Reportar una mejora desde cualquier herramienta

Conectar las 57 herramientas con Ideas y mejoras sin obligar al docente a reconstruir el contexto.

- Añadir una acción contextual discreta de “Reportar problema o sugerir mejora” en las herramientas que producen documentos o recursos.
- Abrir Ideas y mejoras con ruta, nombre de herramienta, módulo, paso actual, tema claro/oscuro y mensaje de error seguro prellenados.
- No incluir automáticamente contenido del formulario, nombres de estudiantes, documentos privados ni tokens; el docente decide qué adjuntar.
- El administrador podrá filtrar ideas por herramienta para priorizar flujos con más incidencias.

### 14.10 Salud operativa por herramienta

Agregar una capa de observabilidad útil al Centro de administración.

- Por herramienta: intentos de generación, éxitos, fallos, tiempo de respuesta, exportaciones, abandono por paso y validaciones más frecuentes.
- Diferenciar errores de validación, autorización, servicio IA, archivo, exportación y red para orientar correcciones reales.
- Mantener las métricas agregadas y sin contenido docente; enlazar alertas a la ruta y versión del producto afectada.
- Definir umbrales configurables para alertar sobre fallos repetidos o descensos de finalización.

### 14.11 Biblioteca institucional con gobierno de versiones

Evolucionar los formatos compartidos sin debilitar la privacidad del repositorio personal.

- Un administrador institucional puede publicar una plantilla para su propia institución, con nombre, versión, vigencia, categoría, compatibilidad y notas de uso.
- El docente puede usarla como referencia, descargar una copia o guardar una copia privada; no puede modificar la fuente institucional.
- Indicar claramente si existe una versión más reciente, sin actualizar documentos o formatos personales de forma automática.
- Establecer roles de publicación, aprobación y retiro; mantener auditoría de cambios y evitar visibilidad entre instituciones distintas.

### 14.12 Certificación práctica de rutas de tutoriales

Medir aprendizaje aplicado, no solo reproducción de videos.

- Cada ruta puede definir un hito práctico verificable: abrir una herramienta, guardar un borrador, crear un documento, exportar una salida o subir un formato.
- El hito registra únicamente que se completó una acción; no evalúa la calidad pedagógica del docente ni expone el documento.
- Mostrar avance por módulos, pendientes y certificado o insignia interna opcional al completar la ruta.
- El administrador consulta tasas agregadas de inicio, finalización y bloqueo de las rutas para mejorar sus tutoriales.

### 14.13 Acciones masivas con revisión previa

Incorporar operaciones en lote de forma segura en Historial y Formatos.

- Seleccionar múltiples elementos para etiquetar, mover a colección, archivar, descargar o enviar a papelera.
- Antes de ejecutar, mostrar cantidad, nombres de muestra, operaciones no compatibles y efecto esperado.
- Procesar en servidor cuando aplique, informar avance y devolver un resumen de éxitos, omisiones y fallos recuperables.
- Las acciones destructivas requieren confirmación; las operaciones sobre formatos predeterminados o institucionales deben validar reglas especiales.

### 14.14 Índice de calidad y preparación de contenido

Ofrecer recomendaciones ligeras antes de usar o compartir contenido, sin convertirlas en bloqueos arbitrarios.

- Señalar metadatos faltantes: título poco descriptivo, categoría, nivel, área, compatibilidad o descripción de archivo.
- Para publicaciones: indicar si falta contexto educativo, modalidad, nivel o pregunta concreta cuando corresponda.
- Para formatos: indicar si no tiene categoría, versión, compatibilidad o campos mapeados.
- Permitir ignorar la recomendación con explicación opcional; guardar solo indicadores agregados para mejorar la interfaz, no calificar al docente.

### 14.15 Enlaces compartidos revocables y con caducidad

Preparar un mecanismo seguro para compartir recursos fuera de la plataforma cuando sea autorizado.

- Generar enlaces con alcance explícito: vista, descarga, fecha de vencimiento y revocación manual.
- Asociar cada enlace a una entidad, propietario, visibilidad, fecha de creación, último acceso y estado; nunca usar rutas de archivo predecibles.
- Mostrar al propietario los enlaces activos y permitir revocarlos inmediatamente.
- Incluir esta capacidad solo para recursos que el propietario haya marcado explícitamente como compartibles; los documentos privados permanecen privados.

### 14.16 Centro de tareas pendientes

Complementar las notificaciones con acciones concretas que el docente puede completar.

- Fuentes iniciales: borradores incompletos, formatos sin clasificar, publicaciones guardadas, ideas con respuesta, ruta de tutorial iniciada, archivos por revisar y referidos pendientes.
- Cada tarea incluye motivo, prioridad, fecha, módulo origen, acción principal y opción de descartar cuando sea pertinente.
- No duplicar la misma tarea desde notificaciones; usar un identificador de entidad y estado de resolución.
- Permitir al docente filtrar por módulo y al administrador ver métricas agregadas de tareas bloqueadas o vencidas.

## 15. Orden sugerido para esta ampliación

1. Sincronización de borradores, trazabilidad y salud operativa por herramienta.
2. Mapeo, análisis y calidad de formatos institucionales.
3. Privacidad preventiva y biblioteca institucional versionada.
4. Reacciones únicas, preguntas resueltas, comentarios y reporte contextual desde herramientas.
5. Rutas prácticas de tutoriales y centro de tareas.
6. Acciones masivas, enlaces revocables y mejoras administrativas finales.

## 16. Criterios de aceptación de la ampliación

1. Ninguna edición local puede sobrescribir una versión remota sin decisión explícita del docente.
2. Todo documento exportado puede mostrar origen, versión y formato aplicado de forma comprensible.
3. Los formatos institucionales se aplican solo cuando sus campos y compatibilidad han sido validados o el usuario acepta una advertencia visible.
4. Una reacción comunitaria no puede duplicarse por usuario ni por reintento.
5. Las sugerencias enviadas desde una herramienta incluyen contexto técnico mínimo y nunca contenido pedagógico privado sin confirmación.
6. Las alertas administrativas permiten identificar una herramienta problemática sin leer documentos docentes.
7. Todos los enlaces compartidos son revocables, tienen alcance definido y no hacen pública información privada por defecto.

## 17. Ampliación propuesta · Profundización funcional de las seis herramientas

> Este bloque amplía únicamente Historial, Sube tu formato, Videos tutoriales, Ideas y mejoras, Referidos y Comunidad activa. Cada punto exige persistencia, contratos de API, validación de permisos, estados de interfaz y pruebas; no se considera terminado si solo se representa visualmente.

### 17.1 Historial · Búsqueda indexada y filtros gestionados por servidor

- Sustituir el filtrado limitado en navegador por una consulta paginada capaz de buscar por título, metadatos permitidos, herramienta, módulo, tipo de salida, fechas, modalidad, nivel, estado y favorito.
- La API debe aceptar filtros explícitos, orden, cursor o página y tamaño de lote, siempre aplicando propiedad del usuario antes de devolver resultados.
- El frontend debe mostrar cantidad total, filtros activos, carga incremental, estado vacío real y error recuperable sin descargar el historial completo.
- Registrar métricas agregadas de consultas lentas para poder ajustar índices sin guardar contenido docente.

### 17.2 Historial · Integridad de documentos y exportaciones

- Guardar por cada exportación: tipo, tamaño, fecha, versión de origen, resultado de procesamiento y huella de integridad cuando corresponda.
- Verificar el resultado antes de declararlo disponible; si falla, conservar el documento fuente y permitir regenerar la salida con el mismo contexto.
- Exponer al docente un estado comprensible: listo, en verificación, necesita regeneración o no disponible temporalmente. Nunca presentar una descarga corrupta como exitosa.
- El administrador solo consulta indicadores agregados de fallos por tipo de exportación y herramienta.

### 17.3 Historial · Retomar creación desde el paso exacto

- Persistir herramienta, paso actual, campos válidos, validaciones pendientes, fecha de guardado y estado de generación de cada borrador.
- La API debe devolver un acceso seguro para continuar, sin exponer borradores ajenos ni restaurar datos sensibles en otro perfil.
- El frontend ofrecerá una acción contextual como “Continúa tu Plan Anual desde Competencias”, en vez de una entrada genérica sin contexto.
- El docente puede descartar o archivar un borrador; la acción conserva auditoría y no borra versiones publicadas o exportadas.

### 17.4 Sube tu formato · Laboratorio de compatibilidad

- Antes de marcar una plantilla como predeterminada, permitir una prueba con datos ficticios y no con información real de estudiantes.
- El backend procesa una copia temporal, evalúa tablas, encabezados, pies, campos, estilos y compatibilidad por herramienta, y elimina los datos temporales al finalizar.
- El frontend presenta un informe por capacidades: compatible, parcialmente compatible, no compatible y motivo concreto, además de una vista previa cuando sea segura.
- El resultado queda asociado a una versión específica de la plantilla para que no se asuma compatibilidad después de un reemplazo.

### 17.5 Sube tu formato · Reemplazo versionado con comparación de impacto

- Reemplazar un archivo debe crear una versión nueva, nunca sobrescribir el binario o la configuración anterior.
- Comparar estructura, campos mapeados, herramientas compatibles, encabezados y notas de uso; mostrar qué puede variar en exportaciones futuras.
- Mantener versiones previas recuperables y permitir que el administrador institucional revise cambios en formatos compartidos.
- Los documentos ya generados conservan la referencia a la versión usada originalmente.

### 17.6 Sube tu formato · Reglas de uso compatibles

- Cada formato podrá declarar restricciones verificables: herramienta permitida, modalidad, nivel, tipo de salida, firma requerida, campos obligatorios y compatibilidad Word/Excel/PDF.
- La API valida estas restricciones antes de iniciar una exportación y devuelve errores accionables, no un archivo incompleto.
- El selector del frontend solo muestra formatos utilizables en el contexto actual e informa por qué otros no están disponibles.
- Las reglas se versionan junto con la plantilla y requieren permisos administrativos para formatos institucionales compartidos.

### 17.7 Videos tutoriales · Subtítulos, transcripción y búsqueda por contenido

- Persistir transcripción, capítulos, subtítulos, idioma, palabras clave y puntos de inicio relevantes para cada video publicado.
- La búsqueda debe devolver el tutorial y el minuto preciso relacionado con una acción, por ejemplo “subir formato” o “recuperar borrador”.
- El reproductor ofrece subtítulos, transcripción navegable, velocidad, continuar desde el último segundo y alternativa textual accesible.
- El administrador puede corregir transcripciones, administrar idiomas y revisar búsquedas sin resultados para mejorar el catálogo.

### 17.8 Videos tutoriales · Guía interactiva vinculada a acciones reales

- Una ruta de tutorial puede abrir una guía contextual que indique una acción real dentro de Avendia, espere su resultado y guarde el hito completado.
- El backend registra solo la finalización del hito y la herramienta relacionada; no captura contenido de documentos ni datos de estudiantes.
- La interfaz debe permitir pausar, reanudar, omitir con motivo y regresar al video correspondiente sin bloquear el trabajo docente.
- Una guía no puede marcarse finalizada solo por mostrar una animación: requiere que la acción configurada haya sido efectivamente realizada.

### 17.9 Videos tutoriales · Recomendación contextual y responsable

- Recomendar contenido usando herramientas aún no usadas, tareas pendientes, modalidad, nivel, errores frecuentes agregados y progreso de aprendizaje.
- Mantener una explicación simple de cada recomendación y permitir ocultarla o indicar que no es útil.
- El motor de recomendación utiliza metadatos y eventos mínimos; no analiza documentos privados para inferir intereses.
- El administrador mide inicio, finalización y utilidad de las recomendaciones de manera agregada.

### 17.10 Ideas y mejoras · Reporte técnico seguro y reproducible

- Para reportes de error, adjuntar de forma controlada ruta, versión de aplicación, tipo de navegador, resolución aproximada, tema activo, código de error seguro y acción declarada.
- Nunca adjuntar automáticamente formularios, documentos, nombres de estudiantes, archivos privados, credenciales o tokens.
- El backend separa reporte funcional y diagnóstico técnico, aplica retención limitada y asocia registros repetidos sin revelar información entre docentes.
- El frontend permite revisar y desmarcar cada dato técnico antes de enviar.

### 17.11 Ideas y mejoras · Validación posterior a una mejora publicada

- Cuando una propuesta pasa a Publicada o Resuelta, notificar al autor y permitir confirmar si el problema quedó solucionado, calificar la utilidad y añadir seguimiento.
- Registrar resultados de verificación, reapertura justificada y relación con la versión del producto que atendió el caso.
- Administración visualiza proporción de mejoras verificadas, reabiertas o sin respuesta, en lugar de medir solo propuestas cerradas.
- La opinión del autor es privada por defecto; las respuestas públicas requieren decisión explícita.

### 17.12 Ideas y mejoras · Priorización con impacto verificable

- Complementar el voto único con contexto estructurado: módulo afectado, frecuencia, impacto educativo, tipo de centro y severidad estimada.
- El administrador configura reglas de priorización auditables que impidan que votos repetidos o campañas artificiales oculten incidencias críticas.
- El docente ve por qué una propuesta está en revisión, planificada o no priorizada, sin revelar datos internos de otros usuarios.
- Los cálculos de prioridad se ejecutan en backend y guardan la explicación de factores usados.

### 17.13 Referidos · Atribución segura desde el registro

- El enlace debe registrar código, origen de campaña permitido, fecha, consentimiento y evento de llegada antes del registro de la persona invitada.
- Al completar el registro, el backend valida el vínculo contra correo, identidad, elegibilidad y reglas activas sin exponer datos del invitado al referente.
- El panel docente muestra estados claros: enviado, visitado cuando haya consentimiento, registrado, validado, pendiente, acreditado o rechazado con motivo permitido.
- Las capturas deben ser idempotentes para evitar varias atribuciones por recargas, enlaces repetidos o cambios de dispositivo.

### 17.14 Referidos · Billetera trazable de créditos IA

- Crear un libro mayor de créditos con movimientos inmutables: otorgamiento por referido, consumo por generación, vencimiento, ajuste, reversión y saldo disponible.
- Cada movimiento indica motivo, fecha, entidad relacionada y saldo posterior; los administradores aplican ajustes mediante una operación auditada.
- El frontend presenta saldo disponible, movimientos, créditos pendientes y alertas de vencimiento sin depender de números simulados.
- Ningún flujo puede descontar o conceder créditos dos veces ante reintentos de red.

### 17.15 Referidos · Prevención de abuso en tiempo real

- Aplicar límites de envío, detección de patrones de autoreferido, reutilización sospechosa, automatización y campañas masivas anómalas.
- Los casos dudosos pasan a revisión con estado visible y derecho de explicación; no se bloquea una cuenta legítima solo por una señal aislada.
- Administración dispone de cola de casos, evidencia mínima, decisión, motivo y opción de reversión auditada.
- La detección no debe perfilar contenido pedagógico ni usar datos fuera de la finalidad del programa.

### 17.16 Comunidad activa · Licencia, autoría y reutilización responsable

- Cada recurso compartido debe declarar permiso de uso: consulta, reutilización con atribución o adaptación permitida.
- Al guardar, copiar o adaptar un aporte, persistir autor original, publicación fuente, versión, licencia y relación de procedencia.
- La interfaz muestra las condiciones antes de reutilizar y añade atribución donde el formato de salida lo permita.
- El backend impide marcar como reutilizable contenido que permanezca privado, esté retirado o no tenga permiso explícito.

### 17.17 Comunidad activa · Adaptaciones vinculadas y comparables

- Permitir crear una adaptación de una publicación o recurso, sin copiar silenciosamente su procedencia.
- La nueva publicación declara cambios realizados: grado, modalidad, área, contexto rural/urbano, nivel, duración o estrategia didáctica.
- El feed puede agrupar original y variantes, filtrar adaptaciones relevantes y conservar reconocimiento de autoría.
- Si el original es ocultado o se retira, las adaptaciones conservan su contenido propio pero muestran el cambio de disponibilidad de la fuente.

### 17.18 Comunidad activa · Espacios temáticos con visibilidad controlada

- Incorporar grupos por institución, modalidad, área, territorio o práctica docente, con visibilidad privada institucional, restringida a grupo o abierta a toda la comunidad.
- La API verifica membresía antes de listar, publicar, comentar, reaccionar o descargar adjuntos; las búsquedas no deben filtrar títulos no autorizados.
- El frontend identifica el alcance de cada aporte antes de publicarlo y deja claro quién podrá verlo.
- Administración cuenta con gobierno de miembros, reglas, moderadores y auditoría de cambios sin acceso indiscriminado a contenido privado.

### 17.19 Comunidad activa · Moderación preventiva basada en reglas

- Antes de publicar, revisar enlaces sospechosos, archivos no permitidos, datos personales evidentes, lenguaje ofensivo y similitud con aportes recientes.
- La detección genera advertencia, edición asistida o revisión humana según severidad; no elimina automáticamente contenido pedagógico válido sin trazabilidad.
- Guardar categoría de la alerta, decisión y responsable de moderación, evitando almacenar copias adicionales de datos sensibles.
- El autor recibe un motivo entendible y puede editar o apelar dentro de las reglas definidas.

### 17.20 Comunidad activa · Reconocimiento pedagógico con límites sanos

- Reconocer contribuciones verificables: respuestas aceptadas, recursos reutilizados con atribución, aportes útiles y convivencia respetuosa.
- El cálculo debe limitar reacciones repetidas, autoimpulsos y campañas coordinadas; ninguna métrica puede modificar permisos académicos ni convertirse en clasificación invasiva.
- El frontend explica de dónde proviene cada reconocimiento y permite ocultar su visualización pública cuando la política lo admita.
- Administración consulta indicadores agregados y puede corregir abusos mediante acciones auditadas.

### 17.21 Base compartida · Procesos asíncronos confiables

- Cargas, análisis de archivos, renderizado de formatos, transcodificación de videos, exportaciones y revisiones de seguridad se ejecutan como tareas persistentes.
- Cada tarea debe tener identificador, propietario, tipo, estado, avance, mensaje seguro, resultado, error recuperable, reintento controlado e idempotencia.
- El frontend consulta o recibe el estado real, evita duplicar operaciones por doble clic y permite continuar navegando mientras el trabajo se completa.
- Los trabajadores no pueden procesar recursos no autorizados; las tareas fallidas conservan contexto para soporte sin filtrar contenido.

### 17.22 Base compartida · Contratos, permisos y pruebas por módulo

- Cada endpoint nuevo debe contar con pruebas de propietario, otro docente, administrador, entrada inválida, límite de archivo, reintento, red caída y operación duplicada.
- Mantener contratos tipados entre backend y frontend para que estados, filtros y errores no sean interpretados de forma diferente.
- Cada pantalla debe cubrir carga, estado vacío, éxito, error, permiso denegado y recuperación, también en modo oscuro y vista móvil.
- La liberación de una mejora requiere pruebas automatizadas, revisión de accesibilidad y comprobación de que no se muestra información de otro usuario.

## 18. Secuencia sugerida para esta ampliación

1. Base asíncrona, contratos, permisos, historial paginado y recuperación por paso.
2. Integridad de exportaciones, laboratorio de formatos, versiones y reglas de compatibilidad.
3. Transcripciones, guías prácticas y recomendaciones de tutoriales.
4. Reportes seguros, priorización y verificación de Ideas y mejoras.
5. Atribución, billetera y protección antifraude de Referidos.
6. Licencias, adaptaciones, grupos, moderación y reconocimiento de Comunidad activa.

## 19. Criterio de aceptación de la profundización funcional

Una mejora de este bloque se acepta solo cuando su entidad persiste, la API aplica permisos, el frontend refleja estados reales, los reintentos no duplican efectos y las pruebas cubren propietario, administración y error. No basta con mostrar una tarjeta, contador, botón o mensaje sin operación verificable en backend.

## 20. Regla obligatoria · Persistencia y lógica real en cada apartado

> Esta regla prevalece sobre cualquier descripción visual anterior o futura del plan. Toda acción que el docente o administrador pueda crear, editar, seleccionar, guardar, seguir, votar, descargar, publicar, eliminar, recuperar, marcar o consultar debe tener una fuente de verdad en backend cuando su resultado deba mantenerse después de recargar, iniciar sesión en otro dispositivo o ser visible para otro usuario autorizado. `localStorage` solo puede utilizarse para preferencias estrictamente locales y recuperables —por ejemplo, estado temporal de una interfaz—, nunca como base única de datos institucionales, créditos, formatos, publicaciones, avances, ideas, historial o referidos.

### 20.1 Contrato mínimo obligatorio para cualquier función nueva

Antes de considerar terminada una función de cualquiera de las seis herramientas, debe cumplir todo lo siguiente:

1. **Entidad y migración.** Definir modelo persistente, identificador estable, propietario o alcance institucional, fechas de creación y actualización, estado y relaciones necesarias. Si modifica datos existentes, preparar una migración compatible y una estrategia de recuperación.
2. **Regla de negocio en backend.** Implementar validaciones, transiciones de estado, límites, idempotencia, auditoría y cálculo de resultados en servicios o rutas de servidor. El frontend no debe decidir quién puede acceder, cuánto crédito corresponde, si un voto es único o si un documento es compatible.
3. **API tipada y documentada.** Crear endpoints con solicitudes y respuestas explícitas, códigos de error comprensibles, paginación cuando aplique y mensajes que no revelen datos de otros usuarios.
4. **Autorización verificable.** Validar usuario propietario, miembro de grupo, rol institucional o administrador en cada lectura y escritura. Ocultar una opción visual no reemplaza una comprobación de permisos en servidor.
5. **Interfaz conectada.** La pantalla debe leer el estado de la API, ejecutar una operación real y actualizarse solo con la respuesta confirmada. Quedan prohibidos contadores, listas, saldos, avances o mensajes de éxito simulados.
6. **Estados completos.** Representar carga, vacío, procesando, éxito, error, sin permiso, reintento y resultado parcial cuando correspondan. Una operación larga debe informar su avance real sin congelar la pantalla.
7. **Trazabilidad.** Registrar quién realizó la acción, cuándo, sobre qué entidad, resultado, versión y motivo cuando la operación sea administrativa, sensible o irreversible.
8. **Pruebas.** Cubrir al menos caso correcto, propiedad, acceso ajeno denegado, administrador autorizado, validación inválida, reintento duplicado y persistencia después de recargar.
9. **Accesibilidad y respuesta visual.** Mantener la función usable en móvil, escritorio, tema claro y oscuro, navegación por teclado y lector de pantalla. La adaptación visual no debe alterar la lógica ni ocultar acciones críticas.

### 20.2 Historial · Obligaciones de lógica real

| Función | Persistencia y lógica de backend obligatoria | Comportamiento obligatorio en frontend |
|---|---|---|
| Documento, recurso o exportación creada | Registro único de artefacto con propietario, herramienta origen, contenido o referencia segura, versión, estado, metadatos y salidas disponibles. | Mostrar solo registros devueltos por API; abrir, descargar y continuar usando identificador real. |
| Favorito, etiqueta, colección, archivado y papelera | Relaciones persistentes por usuario, reglas de retención, recuperación y auditoría; impedir que un usuario afecte registros ajenos. | Confirmar el cambio cuando el servidor responda; reflejar error y permitir reintento. |
| Duplicar, restaurar o recuperar versión | Crear procedencia, versión nueva o restauración explícita sin sobrescribir silenciosamente. | Mostrar comparación, confirmación y resultado real de la versión activa. |
| Búsqueda y filtros | Consulta paginada, filtrada por propiedad y ordenada en backend; índices según los campos permitidos. | Mostrar filtros activos, total real, carga incremental y estado vacío verificable. |
| Borrador y continuar por paso | Guardar paso, datos, validaciones y estado de sincronización por usuario y herramienta. | Ofrecer continuar desde el punto exacto, con conflicto o error si el servidor lo informa. |

### 20.3 Sube tu formato · Obligaciones de lógica real

| Función | Persistencia y lógica de backend obligatoria | Comportamiento obligatorio en frontend |
|---|---|---|
| Cargar, clasificar y administrar formato | Archivo seguro, metadatos, propietario, categoría, etiquetas, tamaño, tipo, versión y estado persistentes. Validar firma, extensión, peso y permisos en servidor. | Progreso real de carga, resultado de validación, lista sincronizada y mensajes de archivo inválido o no compatible. |
| Predeterminado, reemplazo y recuperación | Un único predeterminado por alcance; versiones inmutables, historial de reemplazo y restauración controlada. | Indicar versión activa, versiones anteriores, impacto y confirmación antes de cambiar. |
| Análisis, mapeo y compatibilidad | Tarea persistente que analice una copia temporal; campos, reglas y resultado asociados a la versión del formato. | Consultar estado de análisis, presentar hallazgos reales y no prometer compatibilidad inexistente. |
| Uso en una herramienta y exportación | Validar herramienta, modalidad, campos obligatorios y formato de salida antes de renderizar. Registrar plantilla y versión usada en el artefacto. | Ofrecer únicamente formatos compatibles; mostrar advertencias y archivo final devuelto por backend. |

### 20.4 Videos tutoriales · Obligaciones de lógica real

| Función | Persistencia y lógica de backend obligatoria | Comportamiento obligatorio en frontend |
|---|---|---|
| Catálogo, publicación y orden | Tutorial con estado publicado/no publicado, metadatos, URL segura, capítulos, transcripción, etiquetas, permisos y orden. Solo administración puede modificar publicaciones. | Cargar catálogo desde API; nunca mostrar como disponible un video retirado o no publicado. |
| Progreso, favorito y continuar | Progreso individual por usuario, último segundo, completado, favorito y fechas; validación de que el video existe y es visible. | Reanudar en el punto real, actualizar avance confirmado y manejar conexión interrumpida. |
| Ruta guiada e hitos prácticos | Definir hitos vinculados a acciones verificables de herramientas; guardar solo evento de cumplimiento y no contenido privado. | Marcar un paso completado solo tras respuesta exitosa de la acción real. |
| Recomendaciones | Servicio de recomendaciones basado en metadatos y actividad permitida; explicación, exclusión y preferencias persistentes. | Mostrar motivo de recomendación, permitir descartarla y sincronizar la decisión. |

### 20.5 Ideas y mejoras · Obligaciones de lógica real

| Función | Persistencia y lógica de backend obligatoria | Comportamiento obligatorio en frontend |
|---|---|---|
| Propuesta o reporte | Idea persistente con autor, contexto seguro, categoría, estado, prioridad, adjuntos, historial de cambios y relación opcional con herramienta. | Enviar a API, mostrar número/estado real y conservar borrador solo como respaldo temporal. |
| Votos, seguimiento y comentarios | Relaciones únicas por usuario para voto y seguimiento; comentarios con propiedad, edición controlada y moderación. | Evitar doble voto, mostrar conteo confirmado y actualizar con respuesta del servidor. |
| Priorización y cambio de estado | Solo roles autorizados aplican estado, fusión, respuesta, prioridad y publicación; toda transición queda auditada. | Mostrar estado devuelto por servidor, responsable cuando corresponda y notificaciones reales. |
| Verificación de solución | Persistir confirmación, reapertura, valoración y versión relacionada, con permisos de autor y administración. | Permitir confirmar o reabrir solo cuando la API lo habilite; reflejar resultado verificable. |

### 20.6 Referidos · Obligaciones de lógica real

| Función | Persistencia y lógica de backend obligatoria | Comportamiento obligatorio en frontend |
|---|---|---|
| Código y enlace de referido | Código único ligado al propietario, estado de programa, fecha, campaña permitida y reglas vigentes. | Mostrar código y enlace emitidos por backend, no valores fijos ni inventados. |
| Registro y atribución | Registrar visita y reclamación de manera idempotente, con consentimiento y validación de elegibilidad. | Mostrar estados reales sin revelar correo, identidad o actividad del invitado. |
| Crédito y saldo | Libro mayor inmutable de movimientos, consumo, reversión, vencimiento y saldo calculado en servidor. | Consultar saldo y movimientos reales; no actualizar créditos visualmente antes de confirmación. |
| Revisión y antifraude | Reglas de detección, cola de revisión, decisión administrativa, motivo permitido y auditoría. | Indicar pendiente, aprobado o rechazado con lenguaje claro y acción disponible cuando aplique. |

### 20.7 Comunidad activa · Obligaciones de lógica real

| Función | Persistencia y lógica de backend obligatoria | Comportamiento obligatorio en frontend |
|---|---|---|
| Publicaciones, recursos y visibilidad | Publicación con propietario, alcance, estado de moderación, metadatos pedagógicos, licencia, adjuntos y procedencia. Aplicar visibilidad en cada consulta. | Mostrar solo contenido autorizado; informar alcance antes de publicar y estado de moderación real. |
| Comentarios, respuestas y menciones | Entidades con autor, relación, límite de anidación, edición/eliminación controlada, notificación y moderación. | Cargar hilos reales, confirmar publicación y no representar respuestas locales como publicadas. |
| Reacciones, guardados y respuesta aceptada | Relaciones únicas por usuario; transacciones idempotentes; autor de pregunta controla resolución y respuesta aceptada. | Alternar estado confirmado, impedir duplicados y reflejar conteos del servidor. |
| Adaptaciones y licencias | Relación entre original y variante, licencia declarada, atribución, estado del origen y permisos de reutilización. | Mostrar fuente, condiciones de uso y cambios declarados antes de adaptar o descargar. |
| Reportes y moderación | Reporte persistente, categoría, evidencia mínima, estado, decisión, apelación y auditoría. | Ofrecer reporte seguro, confirmación real y razones de moderación sin revelar datos restringidos. |

### 20.8 Lista de verificación de implementación por apartado

Para cada historia de usuario de las secciones 5, 11, 14 y 17, incluir una ficha de entrega con estas preguntas obligatorias:

1. ¿Qué entidad o entidades se crean o modifican y cómo se migran?
2. ¿Cuál es la fuente de verdad de cada dato mostrado?
3. ¿Qué endpoint lee o escribe el dato y qué permisos valida?
4. ¿Cuál es la regla de negocio que no puede delegarse al navegador?
5. ¿Qué ocurre al recargar, abrir desde otro dispositivo o reintentar la operación?
6. ¿Qué ve el usuario durante carga, error, vacío, proceso y éxito?
7. ¿Qué se audita, qué se retiene y qué información privada se protege?
8. ¿Qué pruebas demuestran propiedad, autorización, persistencia, idempotencia y adaptación móvil/tema oscuro?

No se aprobará una entrega que responda “se ve”, “aparece”, “muestra”, “simula” o “guarda en el navegador” sin identificar su operación verificable, fuente de datos y prueba de backend.

## 21. Registro de ejecución · 4 de septiembre de 2026

Esta sección registra lo implementado, no sustituye ni reduce ninguna exigencia de las secciones 1–20. **No equivale a la finalización del plan.** Las extensiones no enumeradas como verificadas continúan pendientes.

### 21.1 Entrega integrada por apartado

| Apartado | Implementación conectada frontend/backend | Persistencia, permisos y comprobación |
|---|---|---|
| Historial | Listado unificado paginado de documentos e instrumentos de evaluación, búsqueda, filtro de estado y favoritos de documentos. Renombrado, versiones, restauración, papelera y recuperación de documentos. | Consulta `/history/feed` filtrada por propietario. `DocumentVersion` conserva instantáneas; revisión evita sobrescritura concurrente. Restaurar crea una revisión nueva. Acceso ajeno denegado. Borradores locales limitados a la cuenta activa, sin atribuir borradores antiguos a otro usuario. |
| Sube tu formato | Biblioteca existente ampliada con clasificación, etiquetas, descripción, análisis estructural, reemplazo, versiones descargables y papelera recuperable. | Archivo y versiones almacenados por propietario. Reemplazo comprueba revisión; conserva binario anterior y descarta análisis obsoleto. Análisis guarda huella y marcadores reales, limita descompresión y advierte que no certifica fidelidad de diseño. DOCX/PDF/XLSX/PPTX hasta 10 MB; no se promete soporte universal de imágenes. |
| Videos tutoriales | Catálogo real paginado y buscable; administración crea, edita, ordena, publica y retira. URL validada, transcripción, enlace a herramienta, favoritos y avance individual. | Tutorial y progreso guardados en backend. Videos no publicados protegidos por rol. MP4/WebM usan eventos de reproducción para guardar avance. YouTube permite confirmación manual explícita; no se simula seguimiento automático. No se añadieron videos ficticios al catálogo real. |
| Ideas y mejoras | Crear y editar propuesta propia recibida, búsqueda, filtro de estado/autor, voto único, conversación paginada, respuesta administrativa y cambio de estado. | Ideas, votos, comentarios y notificaciones persistentes. Identificador de petición evita duplicación al reintentar publicación. Cambio administrativo auditado. Fallo de guardado mantiene el formulario para reintentar. |
| Referidos | Código único, enlace vinculado al registro, estado y saldo reales, programa configurable y cola administrativa de aprobación/rechazo. | Atribución a cuenta nueva; privacidad del invitado en vista docente. Recompensa congelada por invitación. Aprobación y aumento de saldo transaccionales, movimiento único, auditoría y notificación. Repetir aprobación no duplica créditos. Programa desactivado por defecto hasta configuración administrativa. |
| Comunidad activa | Publicar/editar, contexto pedagógico, búsqueda, filtros, paginación, comentarios, reacción útil única, guardados privados y ocultamiento con motivo administrativo. | Publicaciones y comentarios con identificador de petición para reintentos; reacciones únicas por usuario. Feed y permisos en servidor. Retirar oculta en lugar de borrar físicamente. Moderación auditada y comentarios notifican al autor. |

### 21.2 Fundaciones realmente incorporadas

- Notificaciones privadas paginadas en la campana, contador consultado a la API y acción de marcar todas como leídas. Conviven con los recordatorios existentes; no sustituyen sus datos.
- Panel `/admin/utilidades`: indicadores agregados de los seis módulos, propuestas e invitaciones pendientes, créditos concedidos y volumen de formatos. No entrega contenido privado de otros docentes.
- Se reutilizan autenticación, créditos, auditoría, documentos, plantillas y publicaciones del proyecto; no se introdujo un backend paralelo ni otra identidad visual.
- Migraciones `0010_utilities` a `0016_publication_requests`, aplicadas a la base local y verificadas desde una base vacía. Se conservó una copia local de la base anterior a las migraciones.
- Retiradas las implementaciones de utilidades que usaban contenido estático o propuestas únicamente en almacenamiento local. No se migraron datos locales sin una atribución de propietario comprobable.
- Protección de errores de descarga; validación de campos nulos no permitidos en documentos; controles de formulario adaptados a temas claro/oscuro y móvil.

### 21.3 Evidencia de pruebas y límites

1. Suite backend completa: **71 pruebas aprobadas**. Después del endurecimiento final de validaciones: **9 pruebas del módulo aprobadas de nuevo**. Incluye permisos, propietario ajeno, votos únicos, reintentos, notificaciones privadas, versiones, recuperación, análisis, administración y crédito no duplicado.
2. Frontend: **3 pruebas aprobadas** de propuestas/reintento, biblioteca y barra lateral. Compilación y revisión estática correctas; permanece advertencia de tamaño del paquete principal, que no se considera resuelta.
3. Navegador Chrome automatizado: **24 combinaciones iniciales** de seis rutas, escritorio/móvil y claro/oscuro sin desbordamiento horizontal ni errores detectados de ejecución/API. Revisión adicional de **12 pantallas** y administración móvil tras ampliaciones.
4. Prueba real navegador → API → base aislada: crear idea, recargar, votar, comentar y comprobar persistencia; subir DOCX, analizar, recargar informe, reemplazar conservando versión, enviar a papelera y recuperar.
5. Prueba HTTP sobre base aislada con migraciones reales: registrar invitado con código, rechazar revisión no administrativa, aprobar una vez, rechazar aprobación repetida y comprobar aumento exacto de saldo. No se modificaron saldos reales para probar recompensas.
6. El análisis estructural no es una aprobación de compatibilidad de todos los formatos ni una verificación de fidelidad Word. No se certificó reproducción de un catálogo audiovisual real, comportamiento en todos los dispositivos ni PostgreSQL en producción.
7. Las pruebas manuales de todos los estados de teclado/lector de pantalla y todos los errores de red siguen pendientes. Los recorridos automáticos no las sustituyen.

### 21.4 Pendientes obligatorios: no darlos por hechos

| Apartado | Siguiente alcance pendiente del plan acumulado |
|---|---|
| Historial | Sincronización universal de borradores/paso de las 57 herramientas; filtros completos por contexto/fecha; colecciones y etiquetas; duplicación con procedencia; comparación visual de versiones; retención/purga configurable; convergencia completa de artefactos y salidas especializadas. Las operaciones de versiones/papelera de esta entrega corresponden a documentos, no a todas las evaluaciones. |
| Sube tu formato | Mapeo de campos editable; trabajos persistentes de análisis con progreso; laboratorio de compatibilidad y prueba real de exportación por herramienta; formatos compartidos institucionales/roles; cuotas y deduplicación; vista previa segura; trazabilidad completa de uso y descargas. No convertir un informe de marcadores en una promesa de exportación idéntica. |
| Videos tutoriales | Incorporar material real autorizado; capítulos y rutas con hitos verificables; recomendaciones explicadas y preferencias guardadas; continuidad audiovisual completa según proveedor; métricas con criterios de privacidad. |
| Ideas y mejoras | Adjuntos seguros, seguimiento individual, fusión de duplicadas, prioridades, historial detallado de cambios, confirmación de solución/reapertura y valoración; controles de edición/moderación de comentarios completos. |
| Referidos | Campañas, reglas completas de elegibilidad/antifraude, atribución/consentimiento ampliados, reversión/vencimiento/consumo conciliados en libro mayor y conciliación con todos los movimientos de créditos. La revisión manual implementada no reemplaza esas reglas. |
| Comunidad activa | Grupos y alcances institucionales, adjuntos y licencias, procedencia/adaptaciones, respuestas anidadas/menciones/respuesta aceptada, reportes/apelaciones y restauración moderada con interfaz; reglas completas de reutilización segura. |
| Transversal de los seis | Lectura individual y preferencias de notificaciones; trabajos persistentes y reintentos con observabilidad; filtros sincronizados con URL; políticas de retención; pruebas de carga, accesibilidad y producción; trazabilidad exhaustiva de todas las operaciones especificadas. |

### 21.5 Secuencia siguiente sin ampliar el alcance

1. Completar notificaciones individuales/preferencias y trazabilidad de acciones de archivos sobre los modelos actuales.
2. Completar Historial y compatibilidad/versionado de formatos antes de prometer reutilización transversal en las 57 herramientas.
3. Completar ciclo de solución de Ideas y reportes/moderación de Comunidad, conservando permisos de propietario y administración.
4. Completar hitos de Tutoriales y conciliación/antifraude de Referidos con pruebas de aceptación por operación.
5. Revisar las fichas obligatorias de la sección 20.8 contra cada historia de las secciones anteriores; solo cambiar un módulo a terminado cuando sus pendientes y pruebas estén cerrados con evidencia.
