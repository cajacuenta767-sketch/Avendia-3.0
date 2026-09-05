# Plan maestro del backend para integrar y hacer funcionar toda Avendia

Fecha de creación: 5 de septiembre de 2026
Estado: plan aprobado pendiente de ejecución
Alcance: backend, contratos compartidos, integración con frontend, IA, persistencia, exportaciones, administración y operación de las 57 herramientas.

## 1. Objetivo

Construir una única base de backend coherente para que cada herramienta de Avendia:

- reciba exactamente los datos que necesita y no un formulario genérico;
- genere el producto pedagógico que anuncia;
- conserve borradores, resultados, relaciones, versiones y preferencias;
- reutilice de forma opcional información de documentos anteriores;
- mantenga el tema, área, grado, modalidad y propósito durante todo el flujo;
- permita reintentar una generación sin duplicar cobros ni documentos;
- exporte el formato correspondiente a cada producto;
- aplique permisos reales por propietario, rol y sensibilidad;
- informe errores recuperables al frontend;
- pueda medirse, auditarse y probarse de principio a fin.

Este plan no sustituye el diseño actual ni cambia sus colores. Su misión es hacer que toda la funcionalidad visual existente esté respaldada por contratos y persistencia reales.

## 2. Punto de partida que debe conservarse

La ejecución ampliará, en vez de duplicar, los módulos existentes:

- `auth`: registro, acceso, restablecimiento y sesión;
- `users`: perfil institucional, contexto curricular y preferencias;
- `documents`: borradores, resultados, versiones y relaciones;
- `evaluation_instruments`: rúbricas, listas, observaciones, recuperación y registros;
- `rosters`: aulas, nóminas y estudiantes;
- `templates`: plantillas institucionales y versiones;
- `calendar`: eventos del docente;
- `ai`: Gemini, sugerencias por campo, generaciones, imágenes y exportación PPTX;
- `admin`: créditos, auditoría, calidad y control de plataforma;
- `utilities` y `community`: tutoriales, formatos, ideas, referidos y comunidad.

También se conservarán las migraciones existentes, incluida la generación idempotente incorporada en `0019_ai_generation_records.py`.

## 3. Problemas estructurales que resolverá el plan

1. Frontend y backend describen parcialmente las herramientas en archivos distintos; pueden divergir sin que la compilación lo detecte.
2. Existen 58 rutas visibles que representan 57 capacidades, porque Adaptación NEE/DUA aparece en dos módulos. Se necesita una identidad canónica y rutas de acceso separadas.
3. El endpoint común de generación permite demasiada variación en un mismo esquema y no garantiza por sí solo la forma específica de cada resultado.
4. Algunos recursos especializados tienen endpoints propios y otros dependen del generador común, con diferencias en guardado, créditos y reintentos.
5. El borrador local todavía puede contener información más reciente que el backend si se cierra la página durante una sincronización.
6. Las preferencias, ayudas, plantillas personales, perfiles de aula y estados de orientación no comparten todavía un modelo de dominio completo.
7. Las exportaciones no se administran como trabajos duraderos y pueden perderse si el proceso se interrumpe.
8. Las referencias oficiales, libros, guías y normativa requieren verificación y fecha de vigencia, no solo texto generado.
9. Faltan métricas uniformes de abandono, errores, reintentos, aceptación y correcciones por herramienta.
10. Las pruebas cubren numerosos módulos, pero falta una certificación contractual que cruce catálogo, esquema, generador, persistencia, exportador y pantalla.

## 4. Principios obligatorios

1. Una capacidad pedagógica tendrá una identidad canónica estable, aunque posea más de una ruta visual.
2. FastAPI será la única puerta de acceso a datos, IA, archivos, créditos y proveedores externos.
3. PostgreSQL será obligatorio en producción; SQLite seguirá limitado a desarrollo y pruebas explícitas.
4. Ninguna regla de autorización dependerá de datos enviados por React.
5. Todo recurso perteneciente a un docente se consultará mediante identificador y propietario.
6. Toda mutación costosa aceptará una clave de idempotencia.
7. Todo cambio de esquema tendrá migración Alembic reversible y prueba de actualización.
8. No se cobrará una generación rechazada antes de producir un resultado utilizable.
9. La salida de IA se validará como dato estructurado antes de guardarse o exportarse.
10. No se declarará exitosa una operación que solo se haya completado en el navegador.
11. La información sensible de estudiantes tendrá mínimo privilegio, trazabilidad y reglas de retención.
12. Los errores públicos serán claros; los detalles técnicos y secretos permanecerán en registros protegidos.

## 5. Arquitectura objetivo

```text
React / Vite
  │
  ├── catálogo y contratos publicados por la API
  ├── borradores, documentos, instrumentos y archivos
  ├── generación, reintento, progreso y exportación
  └── administración y observabilidad autorizada
        │
        ▼
FastAPI /api/v1
  ├── identidad y autorización
  ├── catálogo pedagógico
  ├── orquestador de herramientas
  ├── documentos y relaciones
  ├── evaluaciones y nóminas
  ├── trabajos de IA y exportación
  ├── fuentes verificadas
  ├── métricas y auditoría
  └── adaptadores de proveedores
        │
        ├── PostgreSQL
        ├── almacenamiento de archivos
        ├── Gemini
        └── proveedores de imágenes y fuentes oficiales
```

La lógica se organizará por dominio. Los routers validarán y autorizarán; los servicios ejecutarán reglas; los repositorios encapsularán consultas complejas; los adaptadores aislarán Gemini, correo, imágenes y almacenamiento.

## 6. Registro canónico de las 57 capacidades

### 6.1 Modelo

Crear un registro versionado `ToolDefinition` con:

- `capability_key`: identidad funcional única;
- `route_keys`: una o más rutas compatibles;
- módulo y nombre visible;
- tipo de producto;
- versión del contrato;
- esquema de entrada;
- esquema de resultado;
- campos de contexto compartido;
- reglas pedagógicas y semánticas;
- formatos de exportación permitidos;
- costo de IA;
- nivel de sensibilidad;
- herramientas anteriores y siguientes compatibles;
- estado: borrador, interno, publicado o retirado.

La Adaptación NEE/DUA tendrá una sola `capability_key` y dos rutas de entrada con configuración contextual, evitando contabilizarla como dos herramientas diferentes.

### 6.2 Endpoint de catálogo

Implementar `GET /api/v1/tool-definitions` y `GET /api/v1/tool-definitions/{capability_key}`. El frontend consumirá versión, campos, ayudas, capacidades y formatos; su configuración local solo será una caché tipada de respaldo.

### 6.3 Comprobación de integridad

Una prueba fallará si alguna ruta visible carece de:

- definición canónica;
- contrato de entrada y resultado;
- servicio generador o servicio determinista;
- estrategia de guardado;
- regla de autorización;
- exportador cuando corresponda;
- pruebas de contrato.

## 7. Contratos tipados entre frontend y backend

1. Publicar OpenAPI en CI aunque la documentación interactiva permanezca desactivada en producción.
2. Generar automáticamente tipos TypeScript a partir de OpenAPI.
3. Eliminar progresivamente interfaces duplicadas del frontend.
4. Añadir `contract_version` a solicitudes, documentos y generaciones.
5. Rechazar versiones incompatibles con un error que permita recargar la definición.
6. Establecer una envoltura uniforme para errores:
   - `code` estable;
   - mensaje para el docente;
   - campos afectados;
   - acción recuperable;
   - `request_id` para soporte.
7. Congelar cambios incompatibles mediante pruebas de instantánea del OpenAPI.
8. Mantener compatibilidad de lectura para documentos antiguos y migrarlos al editar.

## 8. Modelo de datos unificado

### 8.1 Documento pedagógico

Ampliar `documents` y `document_versions` para distinguir:

- capacidad y versión de contrato;
- estado: borrador, listo para revisar, aprobado, archivado;
- contexto curricular normalizado;
- entrada original;
- resultado estructurado;
- contenido editable;
- vista del estudiante;
- guía y clave del docente;
- configuración de exportación;
- paso y posición de reanudación;
- versión optimista para evitar sobrescrituras;
- fecha de última sincronización.

No se guardará un documento completo como un único texto opaco cuando el producto tenga tablas, preguntas, diapositivas, tarjetas, cuadrículas o criterios editables.

### 8.2 Contexto pedagógico

Crear una representación común con modalidad, nivel, grado/ciclo, sección, área, competencia, capacidad, desempeño, tema, propósito, periodo, ámbito rural/urbano y año lectivo. Cada herramienta declarará cuáles campos utiliza y cuáles puede heredar.

### 8.3 Relaciones en cascada

Fortalecer `document_relations` con:

- tipo de relación: deriva de, usa como fuente, evalúa, amplía, adapta o acompaña;
- secciones heredadas y su versión de origen;
- instantánea de los valores aceptados;
- política de actualización: fija, avisar o sincronizar;
- autor que confirmó la herencia;
- detección de cambios posteriores en el documento fuente.

La cascada mínima será PCA → Unidad → Sesión → Tarea/Ficha/Presentación → Instrumento → Registro/Retroalimentación, siempre opcional y confirmada por el docente.

### 8.4 Perfiles de aula y opciones recientes

Crear tablas para perfiles de aula reutilizables y preferencias recientes. Deben incluir propiedad, nombre, modalidad, nivel, grado, sección, área, nómina asociada, archivado y versión. Nunca se reutilizará un valor ocultamente: el frontend mostrará el origen y permitirá retirarlo.

### 8.5 Plantillas personales

Separar plantilla oficial, institucional y personal. Guardar alcance, versión, autor, estado, campos bloqueados, secciones aplicables y compatibilidad de contrato.

## 9. Ciclo de vida único de una herramienta

Todas las herramientas seguirán el mismo ciclo técnico, adaptando el contenido a su naturaleza:

1. `create draft`: crear borrador durable y devolver identificador;
2. `patch draft`: guardar cambios parciales con versión optimista;
3. `validate`: validar campos, dependencias y coherencia sin consumir IA;
4. `assist field`: sugerir para un campo concreto usando contexto confirmado;
5. `generate`: crear un trabajo idempotente;
6. `poll/stream`: informar preparación, validación, reparación y finalización;
7. `review`: almacenar correcciones y secciones aprobadas;
8. `finalize`: congelar una versión revisada;
9. `export`: producir el formato correcto desde la versión final;
10. `relate`: ofrecer el siguiente documento en cascada;
11. `archive/restore`: retirar sin destruir historial.

El frontend podrá reanudar cada paso únicamente con el identificador del backend; `localStorage` será una caché de recuperación y no la fuente definitiva.

## 10. Orquestador de generación con IA

### 10.1 Trabajo durable

Convertir toda generación costosa en `GenerationJob` con:

- identificador de solicitud único por usuario;
- huella de entrada;
- herramienta y contrato;
- estado y fase;
- intento actual y máximo;
- proveedor y modelo;
- resultado parcial seguro;
- validaciones fallidas;
- costo reservado, cobrado o devuelto;
- error interno y error público;
- timestamps y duración;
- documento de destino.

El registro actual `AIGenerationRecord` evolucionará a este modelo sin perder datos.

### 10.2 Contexto vinculante

El prompt se construirá desde un objeto normalizado, no concatenando campos arbitrarios. Tema, área, grado, modalidad, propósito, evidencia y documento fuente se marcarán como vinculantes. Antes de aceptar una salida se comprobará que:

- el tema principal aparece de forma suficiente;
- no se introduce un tema dominante incompatible;
- el nivel lingüístico corresponde al grado y modalidad;
- las cantidades solicitadas coinciden;
- la forma del producto corresponde a la herramienta;
- las instrucciones son realizables;
- estudiante y docente reciben contenidos separados cuando corresponde.

### 10.3 Generación por herramienta

Cada capacidad dispondrá de:

- constructor de prompt propio;
- esquema Pydantic de salida propio o discriminado;
- validador estructural;
- validador pedagógico;
- reparador limitado;
- transformador a documento almacenado;
- exportadores permitidos;
- conjunto de casos de prueba.

El generador común solo orquestará. No decidirá por sí mismo si una salida debe ser tabla, diapositiva, ejercicio, correo o informe.

### 10.4 Sugerencias contextuales por campo

Las sugerencias se cachearán por huella de campo y contexto. Cambiar tema, área, grado, propósito o fuente invalidará únicamente las sugerencias dependientes. Se guardarán aceptación, edición o rechazo para medir calidad, nunca el contenido sensible completo en métricas.

### 10.5 Reintentos y créditos

- mismo `request_id` y misma huella: devolver resultado existente;
- mismo `request_id` y distinta huella: conflicto explícito;
- trabajo activo: devolver estado, no iniciar otro;
- error transitorio: reintentar con espera limitada;
- error definitivo: conservar borrador y permitir “Usar sin IA”;
- administrador: no bloquear por saldo;
- docente: reservar crédito al iniciar y cobrar solo al completar un resultado válido;
- reparación interna del mismo resultado: no cobrar como generación adicional;
- toda variación de saldo tendrá libro contable y auditoría.

## 11. Familias de resultados y reglas backend

### 11.1 Planificaciones y documentos oficiales

PCA, Unidad, Sesión, Proyecto, Plan de refuerzo, Plan de tutoría, Plan de atención y carpetas usarán secciones, matrices, responsables, fechas y anexos tipados. Validarán continuidad curricular, cronología, sumas de tiempo y correspondencia entre propósito, actividad, evidencia y evaluación.

### 11.2 Evaluaciones

Examen, rúbrica, lista de cotejo, escala y preguntas sobre texto usarán modelos propios:

- banco de ítems;
- tipos de pregunta;
- niveles cognitivos;
- criterios observables;
- puntajes y totales;
- clave separada;
- retroalimentación;
- asignación a estudiantes o aula;
- respuestas y calificaciones revisables.

Una evaluación no podrá finalizar si cantidad, puntaje, criterios o clave no cuadran.

### 11.3 Actividades interactivas

Tarjetas, agrupación, secuencias, ahorcado, completar, emparejar, crucigrama y sopa de letras almacenarán configuración jugable y solución independiente. El backend comprobará duplicados, ambigüedad, longitud, límites, capacidad de cuadrícula y existencia de una solución.

### 11.4 Presentaciones

Guardar diapositivas como entidades ordenadas con tipo, título, bloques, imagen, atribución, interacción y notas. Aplicar límites de densidad y comprobar que todo elemento cabe antes de exportar. Las imágenes deberán registrar proveedor, consulta, licencia o procedencia, dimensiones y estado de descarga.

### 11.5 Comunicación, tutoría e inclusión

Correos, informes, fichas, alertas y planes sensibles separarán hechos, interpretación, acuerdos y próximos pasos. Se aplicarán controles de privacidad, destinatarios, acceso y retención. La IA no diagnosticará ni tomará decisiones disciplinarias o de protección.

### 11.6 Catálogos y fuentes

Normativa, libros, guías y audiovisuales usarán un modelo de fuente verificada con URL canónica, organismo, fecha de publicación, fecha de consulta, vigencia, checksum y última comprobación. El contenido no verificado se mostrará como sugerencia pendiente y no como fuente oficial.

## 12. Archivos, importaciones y almacenamiento

1. Crear una abstracción `FileStorage` con implementación local para desarrollo y almacenamiento de objetos para producción.
2. Guardar metadatos en PostgreSQL y binarios fuera de la base.
3. Permitir PDF, DOCX, XLSX e imágenes con límites por tipo y tamaño.
4. Validar firma real del archivo, no solo extensión.
5. Analizar archivos en un trabajo separado con estado y errores por página/hoja.
6. Conservar texto extraído, metadatos y referencia al original según política.
7. Rechazar archivos cifrados, corruptos o peligrosos con instrucciones claras.
8. Normalizar nóminas y mostrar filas rechazadas antes de importar.
9. Eliminar archivos temporales mediante tarea programada.
10. Usar URL firmadas de corta duración para descargas sensibles.

## 13. Exportaciones correctas y duraderas

Crear un `ExportJob` idempotente. Cada exportación se generará desde una versión guardada, nunca desde estado no persistido del navegador.

Formatos por familia:

- Word/PDF para planes, informes, fichas, tareas e instrumentos;
- Excel para registros, nóminas, listas y datos tabulares;
- PPTX/PDF para presentaciones;
- Word/PDF imprimible y formato interactivo para juegos;
- ZIP únicamente para carpetas con varios documentos.

El backend validará encabezado, márgenes, saltos, tablas, tipografía, títulos, claves separadas y ausencia de marcas Markdown. Guardará checksum, tamaño, versión origen, formato y vencimiento del archivo.

## 14. Autenticación, autorización y privacidad

1. Mantener contraseñas hasheadas y tokens de acceso breves.
2. Añadir rotación o renovación segura de sesión si el producto la requiere.
3. Centralizar permisos por rol y propiedad.
4. Incorporar permisos específicos para datos sensibles de estudiantes.
5. Evitar enumeración de usuarios y documentos mediante errores uniformes.
6. Limitar intentos de acceso, recuperación y generación.
7. Revocar sesiones al desactivar una cuenta o cambiar credenciales críticas.
8. Auditar cambios administrativos con motivo obligatorio.
9. Definir retención y eliminación lógica para estudiantes, evidencias y alertas.
10. Excluir secretos, tokens y contenido estudiantil de logs y métricas.
11. Probar acceso horizontal: un docente nunca puede leer recursos de otro.
12. Probar acceso vertical: un docente no puede ejecutar operaciones administrativas.

## 15. Créditos y administración

Crear un libro contable de créditos con movimientos inmutables: asignación, reserva, consumo, devolución, corrección administrativa y expiración. El saldo del usuario será una proyección verificable.

El panel de administración consumirá endpoints reales para:

- usuarios activos, suspendidos y por vencer;
- créditos asignados, reservados y consumidos;
- generaciones por herramienta, proveedor y resultado;
- errores y reparaciones;
- tiempos percentiles;
- aceptación de sugerencias;
- abandonos y campos problemáticos agregados;
- trabajos atascados;
- exportaciones fallidas;
- versiones de contratos y plantillas en uso.

Toda acción administrativa deberá indicar actor, objetivo, cambio anterior, cambio nuevo, razón y fecha.

## 16. Observabilidad y soporte

1. Propagar `request_id`, `generation_id`, `document_id` y `user_id` anonimizado.
2. Emitir logs JSON estructurados por fase.
3. Medir latencia, tasa de error, reintentos, créditos y calidad.
4. Crear alertas para trabajos atascados, proveedor caído, aumento de 5xx y migración pendiente.
5. Exponer `/health` para proceso y `/ready` para base, migraciones y dependencias esenciales.
6. Añadir un estado detallado protegido para administración.
7. Implementar diagnóstico de soporte con autorización del docente y datos mínimos.
8. Conservar el mensaje público amable y asociarlo a un código técnico consultable.
9. Registrar cambios de contrato, prompt y modelo en cada generación.
10. Crear panel de colas y reintento administrativo seguro.

## 17. Rendimiento y confiabilidad

- índices por propietario, herramienta, estado, fechas y relaciones;
- paginación estable basada en cursor para historiales grandes;
- evitar consultas N+1 en documentos, nóminas y administración;
- límites de tamaño y profundidad para JSON;
- timeout diferenciado para base, IA, imágenes y exportación;
- cancelación de solicitudes abandonadas cuando sea segura;
- caché versionada para catálogos y fuentes públicas;
- bloqueo optimista al editar documentos;
- pool de conexiones configurado por entorno;
- trabajos asíncronos para IA, archivos y exportaciones;
- recuperación de trabajos huérfanos al reiniciar;
- copia de seguridad y restauración ensayada;
- política de degradación: el docente conserva edición, borrador y exportaciones previas si la IA falla.

## 18. Estrategia de migraciones

Cada fase incluirá:

1. inventario de columnas y JSON actuales;
2. migración aditiva compatible;
3. backfill idempotente por lotes;
4. lectura dual temporal cuando corresponda;
5. cambio del escritor al nuevo modelo;
6. verificación de conteos y checksums;
7. retiro posterior de campos antiguos;
8. procedimiento de rollback;
9. prueba desde una copia representativa;
10. prohibición de cambios destructivos automáticos al arrancar.

## 19. Plan de pruebas

### 19.1 Unitarias

- reglas curriculares y semánticas;
- validadores de cada herramienta;
- cálculo de créditos;
- transiciones de estado;
- normalización de contexto;
- comprobación de cuadrículas, tablas, tiempos y puntajes.

### 19.2 Contrato

- las 57 capacidades aparecen en catálogo;
- las 58 rutas resuelven a 57 identidades canónicas;
- OpenAPI coincide con tipos TypeScript;
- todas las respuestas y errores cumplen su esquema;
- documentos antiguos continúan abriendo.

### 19.3 Integración

- API con PostgreSQL real;
- almacenamiento de archivos;
- idempotencia concurrente;
- créditos bajo concurrencia;
- relaciones en cascada;
- exportación desde versión persistida;
- permisos entre usuarios y roles.

### 19.4 IA semántica

Para cada herramienta se conservarán casos dorados y casos negativos. Ejemplos obligatorios:

- aritmética nunca deriva a hábitos saludables;
- una tarea contiene consignas y ejercicios reales;
- una rúbrica contiene criterios, niveles y descriptores progresivos;
- una lista de cotejo contiene indicadores y marcas Sí/No por estudiante;
- un examen contiene preguntas, puntaje y clave;
- una presentación contiene diapositivas, interacción y notas, no campos de formulario;
- una sopa de letras contiene cuadrícula resoluble;
- un correo no afirma hechos no proporcionados;
- una norma sin fuente verificable no se presenta como vigente.

### 19.5 Extremo a extremo

Cada capacidad deberá demostrar:

1. crear borrador;
2. guardar y reabrir;
3. pedir ayuda contextual;
4. generar;
5. recuperar un corte de red;
6. corregir una sección;
7. versionar;
8. exportar;
9. crear una relación siguiente cuando aplique;
10. impedir acceso desde otra cuenta.

## 20. Fases de ejecución

### Fase 0 — Inventario y congelación

- generar matriz automática de rutas, contratos, endpoints, tablas y pruebas;
- resolver formalmente 58 rutas frente a 57 capacidades;
- congelar OpenAPI y muestras actuales;
- identificar JSON que requieren normalización;
- documentar dependencias de producción.

Salida: mapa verificable sin rutas huérfanas.

### Fase 1 — Contrato y catálogo único

- crear registro canónico y endpoints de catálogo;
- versionar contratos;
- generar tipos TypeScript;
- unificar errores;
- agregar pruebas de correspondencia.

Salida: frontend y backend hablan el mismo contrato.

### Fase 2 — Persistencia de flujo

- crear borrador durable desde el primer paso;
- sincronización parcial y versión optimista;
- reanudación exacta;
- perfiles de aula y contexto reciente;
- plantillas personales.

Salida: ninguna creación depende exclusivamente del navegador.

### Fase 3 — Generación durable

- evolucionar `AIGenerationRecord` a trabajos completos;
- reserva y libro contable de créditos;
- estados consultables;
- reintentos y recuperación;
- validación y reparación por contrato.

Salida: generación resiliente, medible y sin duplicados.

### Fase 4 — Resultados especializados

Implementar por familias, en este orden:

1. evaluaciones e instrumentos;
2. tareas, fichas y sesiones;
3. PCA, unidades y planes largos;
4. recursos interactivos;
5. presentaciones;
6. inclusión, tutoría y comunicaciones;
7. catálogos y fuentes verificadas.

Salida: cada herramienta produce su objeto propio y no contenido genérico.

### Fase 5 — Archivos y exportaciones

- almacenamiento abstraído;
- importación segura;
- trabajos de exportación;
- formatos especializados;
- validación visual automatizada.

Salida: archivos reproducibles desde versiones guardadas.

### Fase 6 — Administración y observabilidad

- panel respaldado por métricas reales;
- trabajos atascados y reintentos;
- calidad por herramienta;
- auditoría y soporte;
- alertas operativas.

Salida: control total sin acceder manualmente a la base.

### Fase 7 — Certificación integral

- pruebas completas con PostgreSQL;
- pruebas de permisos y concurrencia;
- 57 recorridos E2E;
- exportaciones comparadas;
- migración y restauración ensayadas;
- despliegue gradual con monitoreo.

Salida: versión certificada para producción.

## 21. Orden por lotes para evitar regresiones

Cada lote incluirá backend, frontend, migración, pruebas y evidencia antes de avanzar:

1. base contractual y catálogo;
2. documentos, versiones y relaciones;
3. perfil, aulas, nóminas y preferencias;
4. IA, créditos e idempotencia;
5. Evaluamos;
6. Planificamos;
7. Recursos interactivos;
8. Presentaciones;
9. Incluimos y Reforzamos;
10. Acompañamos y Tutoría;
11. fuentes, archivos y exportaciones;
12. administración, observabilidad y producción.

No se considerará terminado un lote si el frontend muestra un control sin endpoint real o si el backend expone una capacidad que la interfaz no puede usar.

## 22. Criterio de terminado por herramienta

Una herramienta solo se marcará como terminada si cumple todo lo siguiente:

- definición canónica y versión;
- entrada específica validada;
- resultado específico estructurado;
- coherencia temática y pedagógica comprobada;
- borrador y reanudación desde backend;
- generación idempotente;
- créditos correctos;
- propiedad y permisos probados;
- historial y versiones;
- cascada opcional cuando corresponda;
- edición parcial sin regenerar todo;
- exportación propia verificada;
- errores recuperables;
- métricas y auditoría mínimas;
- pruebas unitarias, contractuales, de integración y E2E;
- funcionamiento en claro, oscuro, A−/A/A+ y tamaños responsive desde el frontend.

## 23. Criterio de terminado del backend completo

El backend estará completo cuando:

1. las 58 rutas visibles correspondan sin ambigüedad a las 57 capacidades;
2. ninguna herramienta use contenido estático como supuesto resultado exitoso;
3. cada botón con efecto tenga una mutación real y autorizada;
4. todos los borradores y resultados puedan recuperarse en otro dispositivo;
5. las generaciones sobrevivan a recargas y cortes de red;
6. el tema y contexto se conserven desde la entrada hasta la exportación;
7. cada formato exportado sea propio de la herramienta;
8. los datos sensibles estén protegidos y auditados;
9. el panel administrativo muestre estados reales;
10. las migraciones, copias y restauraciones estén probadas;
11. la suite completa sea verde en PostgreSQL;
12. exista evidencia por cada capacidad y formato.

## 24. Entregables

- matriz automática de 57 capacidades y 58 rutas;
- catálogo canónico versionado;
- OpenAPI congelado y cliente TypeScript generado;
- migraciones y scripts de backfill;
- modelos especializados de entrada y resultado;
- orquestador durable de generación y exportación;
- libro contable de créditos;
- almacenamiento seguro de archivos;
- relaciones de cascada y reanudación;
- panel administrativo con métricas reales;
- casos dorados semánticos por herramienta;
- suite de integración con PostgreSQL;
- recorridos E2E y evidencias de exportación;
- guía operativa, rollback y recuperación.

## 25. Riesgos y controles

| Riesgo | Control |
|---|---|
| Romper documentos existentes | Versionado de contrato, lectura compatible y migración progresiva |
| Duplicar lógica frontend/backend | Catálogo de API y tipos generados desde OpenAPI |
| Cobro duplicado por reintento | Idempotencia, reserva y libro contable transaccional |
| IA fuera de tema | Contexto vinculante, validación semántica y casos negativos |
| Resultado genérico | Esquema y validador específico por herramienta |
| Pérdida de borrador | Guardado temprano, patch parcial y versión optimista |
| Fuga de datos estudiantiles | Propiedad, permisos, retención, logs mínimos y URLs firmadas |
| Exportación distinta a la vista | Generar desde versión persistida y comparación visual |
| Migración incompleta | Backfill verificable, métricas, lectura dual y rollback |
| Proveedor externo caído | Trabajos recuperables, timeout, reintento y modo sin IA |

## 26. Regla final de ejecución

Cada tarea derivada de este plan deberá indicar antes de implementarse:

- capacidad y rutas afectadas;
- tablas y migraciones;
- endpoints y contratos;
- cambios de frontend consumidores;
- permisos;
- costo y comportamiento de IA;
- persistencia y reanudación;
- exportaciones;
- pruebas y evidencia;
- estrategia de compatibilidad y rollback.

No se aceptarán entregas “solo visuales”, respuestas simuladas, datos fijos en React ni endpoints sin consumidor. Backend y frontend se cerrarán juntos en cada lote.

## 27. Anexo de brechas verificadas en la implementación actual

Este anexo no reemplaza las secciones anteriores. Las convierte en tareas concretas a partir de la revisión del backend, el frontend, las migraciones, los contratos, los flujos de IA y las pruebas existentes.

### 27.1 Inventario de fuentes de verdad

Antes de ampliar funcionalidades se creará una matriz por dato que indique:

- nombre y finalidad del dato;
- entidad y columna canónica del backend;
- endpoint de lectura y escritura;
- pantalla y componente consumidor;
- uso permitido de memoria, `sessionStorage`, `localStorage` o caché;
- estrategia de migración desde el almacenamiento del navegador;
- comportamiento sin conexión;
- regla de conflicto entre dispositivos;
- plazo de retención y eliminación.

Como mínimo se migrarán al backend los favoritos de herramientas, configuración académica, fechas de referencia, bloques del calendario, preferencias de accesibilidad, herramientas recientes y configuración de asistencia. El almacenamiento local solo podrá actuar como caché reconstruible o diario temporal de cambios pendientes.

### 27.2 Sesión segura y cliente HTTP único

Se eliminará la lectura manual del token desde componentes y módulos de negocio. El frontend tendrá un único cliente de API responsable de:

- incorporar autenticación;
- renovar o reconstruir la sesión;
- cancelar solicitudes al abandonar una pantalla;
- aplicar timeout;
- interpretar el contrato de errores;
- respetar `Retry-After`;
- adjuntar identificador de correlación e idempotencia;
- impedir peticiones duplicadas por doble clic;
- limpiar el estado autenticado cuando la sesión sea revocada.

Las rutas protegidas no utilizarán una identidad de demostración como respaldo. Antes de mostrar el espacio docente o administrativo se consultará `/auth/session` o `/users/me`. Se definirá una estrategia de sesión de corta duración con renovación segura, cierre en todos los dispositivos y protección CSRF si se adoptan cookies `HttpOnly`.

### 27.3 Contrato transversal de errores

Toda respuesta fallida utilizará un sobre común con:

- `code` estable para lógica de interfaz;
- mensaje comprensible para el docente;
- detalle técnico restringido a administración y logs;
- campo o bloque afectado;
- clasificación `validation`, `authorization`, `quota`, `transient`, `provider`, `conflict` o `internal`;
- indicador de si permite reintento;
- `retry_after` cuando corresponda;
- identificador de seguimiento;
- acciones permitidas: reintentar, editar, usar sin IA, restaurar o contactar soporte.

Los modales y formularios deberán abandonar el estado `loading` en todos los caminos. Un error previo no podrá reaparecer después de recargar si no existe un trabajo fallido vigente en el servidor.

## 28. Operaciones durables, idempotencia y consistencia

### 28.1 Bandeja transaccional y cola de trabajos

Las operaciones lentas o dependientes de terceros se procesarán mediante trabajos persistentes:

- generación de IA;
- generación o búsqueda de imágenes;
- importación y análisis de archivos;
- exportación DOCX, PDF, XLSX o PPTX;
- envío de correo;
- notificaciones;
- reindexación y tareas administrativas.

Cada trabajo tendrá propietario, tipo, estado, progreso, intento, prioridad, fecha de expiración, bloqueo temporal, latido del trabajador y resultado direccionable. Los eventos derivados se escribirán en una bandeja transaccional dentro de la misma transacción que el cambio principal.

### 28.2 Máquina de estados formal

Se aplicará la secuencia:

`draft -> validating -> queued -> running -> reviewing -> completed`

con estados terminales y recuperables:

`cancelled`, `recoverable_failure`, `permanent_failure`, `expired`.

La base de datos impedirá transiciones imposibles. El usuario podrá cancelar, continuar, duplicar desde el último punto válido o descartar. Un supervisor automático recuperará trabajos abandonados y moverá a una cola de fallos aquellos que agoten sus intentos.

### 28.3 Idempotencia global

Se exigirá clave de idempotencia en creación de documentos, instrumentos, eventos, importaciones, exportaciones, publicaciones, generaciones y ajustes de crédito. El servidor conservará la huella de la solicitud y su resultado durante una ventana definida. Una misma clave con contenido diferente será rechazada.

### 28.4 Libro contable atómico de IA

El consumo de IA seguirá cuatro pasos transaccionales:

1. estimar y validar el costo;
2. reservar saldo;
3. confirmar el consumo real al completar;
4. liberar la reserva al cancelar o fallar.

Se separarán los permisos del rol, la suscripción y el saldo. La política de administrador será explícita y comprobable. Los reintentos idempotentes no volverán a cobrar. Cada movimiento tendrá saldo anterior, saldo posterior, motivo, herramienta, trabajo y actor.

## 29. Modelo funcional coherente

### 29.1 Artefacto pedagógico común

Se definirá un agregado raíz común para documentos, instrumentos de evaluación y actividades, o un protocolo obligatorio compartido si deben continuar separados. Todos deberán implementar:

- propietario e institución;
- tipo y versión del contrato;
- estado de ciclo de vida;
- contenido estructurado;
- revisión optimista;
- versiones y comparación;
- favoritos y etiquetas;
- relaciones en cascada;
- papelera y restauración;
- exportaciones y archivos;
- permisos y auditoría.

No se aceptará que el historial, las versiones o la papelera funcionen de manera distinta solo porque una herramienta se guarde en una tabla especializada.

### 29.2 Edición por bloques estables

Cada resultado se dividirá en bloques con identificador estable, tipo, orden, procedencia y versión. Se podrá:

- editar un bloque sin reenviar todo el documento;
- regenerar una sección;
- bloquear contenido aprobado;
- aceptar o rechazar una sugerencia;
- restaurar una versión del bloque;
- comparar antes y después;
- registrar comentarios de revisión;
- reordenar sin perder identidad;
- recalcular solo las dependencias afectadas.

### 29.3 Concurrencia y fusión de cambios

Todas las entidades editables usarán revisión optimista. Frente a una versión desactualizada la API devolverá la revisión actual y un resumen del conflicto. La interfaz permitirá conservar la versión del servidor, la local, ambas como copias o fusionar bloques no superpuestos.

### 29.4 Papelera y retención unificadas

Documentos, instrumentos, eventos, estudiantes, listas, plantillas, publicaciones y archivos tendrán borrado recuperable. Se definirá plazo de retención, restauración, purga, restricciones por dependencias y registro de actor. Las claves foráneas y cascadas serán probadas para evitar versiones huérfanas.

## 30. Calendario, preferencias, inicio y actividades

### 30.1 Configuración académica en backend

Persistir por usuario o institución:

- año lectivo;
- modalidad de periodos;
- bimestres o trimestres;
- semanas lectivas y de gestión;
- feriados y vacaciones;
- horarios;
- fechas institucionales;
- referencias del calendario;
- reglas regionales editables.

### 30.2 Calendario completo

Los eventos admitirán zona horaria, todo el día, recurrencia, excepciones, recordatorios, participantes, adjuntos, color semántico, relación con documentos y edición de una ocurrencia o de toda la serie. La API incluirá revisión, idempotencia, papelera y paginación por rango.

### 30.3 Preferencias sincronizadas

El backend conservará tema visual, tamaño de texto, menú contraído, herramientas favoritas, herramientas recientes, contexto usado recientemente, modo de asistencia, nivel de explicación y ajustes de accesibilidad. El navegador mantendrá una copia optimista identificada por versión.

### 30.4 Modelo de lectura para el inicio

Se creará `/dashboard/overview` para entregar en una sola consulta autorizada:

- documentos recientes;
- borradores pendientes;
- trabajos activos o fallidos;
- agenda próxima;
- favoritos;
- herramientas frecuentes;
- consumo y saldo de IA;
- documentos relacionados que quedaron desactualizados;
- alertas accionables.

No se calculará el panel descargando colecciones completas al frontend. Para administración se usarán agregados o vistas de lectura que no degraden la base transaccional.

### 30.5 Intentos de actividades y entrega a estudiantes

Las herramientas interactivas tendrán sesiones de entrega e intentos persistentes con:

- estudiante, grupo o enlace anónimo controlado;
- versión exacta de la actividad;
- respuestas y orden presentado;
- tiempo, intentos y progreso;
- puntuación y criterio de finalización;
- retroalimentación ofrecida;
- reanudación entre dispositivos;
- fecha de disponibilidad y cierre;
- resumen para el docente;
- protección contra exposición anticipada de respuestas.

## 31. IA gobernada por versiones y evidencia

### 31.1 Registro de versiones de generación

Cada resultado registrará herramienta, contrato, prompt, modelo, proveedor, parámetros, contexto, costo, duración y validadores utilizados. Los prompts tendrán estado `draft`, `candidate`, `canary`, `active` o `retired`, responsable, notas de cambio y reversión inmediata.

### 31.2 Publicación gradual y comparación

Las nuevas versiones podrán activarse por herramienta, institución, usuario o porcentaje. Antes de la activación global se compararán contra la versión anterior usando el mismo conjunto de casos, sin cobrar al docente por evaluaciones internas.

### 31.3 Casos dorados y umbrales de calidad

Cada herramienta tendrá ejemplos dorados por modalidad, nivel, grado, área, zona rural o urbana, diversidad, cantidad de contenido y archivos de entrada. Se medirá:

- adherencia temática;
- estructura propia de la herramienta;
- adecuación a edad y modalidad;
- coherencia entre secciones;
- utilidad real para el docente o estudiante;
- ausencia de campos vacíos o contenido inventado;
- validez de las respuestas cuando existan;
- calidad de exportación.

Una versión no avanzará si incumple umbrales o empeora casos críticos.

### 31.4 Trazabilidad y procedencia por bloque

Cada bloque indicará si procede de entrada docente, perfil institucional, CNEB, documento adjunto, artefacto padre, generación de IA o edición manual. Las referencias normativas guardarán fuente, fecha de consulta y fragmento verificable. La interfaz podrá explicar por qué se propuso una sugerencia sin exponer razonamiento interno del modelo.

### 31.5 Protección ante contenido no confiable

Los archivos, URLs y textos pegados se tratarán como datos, nunca como instrucciones del sistema. Se aplicará separación de contexto, sanitización, límites, detección de instrucciones maliciosas, filtrado de datos sensibles y validación de salida antes de persistir o exportar.

### 31.6 Presupuestos y degradación controlada

Cada herramienta definirá presupuesto de tokens, imágenes, tiempo, intentos y costo. La degradación podrá reducir elementos no esenciales, nunca cambiar el tipo de producto. Si el proveedor falla, el sistema conservará el borrador y ofrecerá reintento, generación sin IA cuando sea pedagógicamente posible o espera en cola.

## 32. Archivos, búsqueda, notificaciones y comunicación

### 32.1 Canal seguro de archivos

Todo archivo pasará por validación de firma, tamaño real, profundidad de compresión, antivirus y cuarentena. El procesamiento ocurrirá fuera de la petición principal. Se registrará hash para deduplicación, propietario, finalidad, estado, versiones, caducidad y referencias activas antes de eliminarlo.

### 32.2 Búsqueda autorizada

Se implementará búsqueda de texto completo con filtros por herramienta, tema, área, grado, fecha, estado, estudiante, etiqueta y autor. El índice respetará permisos en origen, devolverá fragmentos y usará paginación por cursor. La eliminación o cambio de permisos actualizará el índice mediante eventos durables.

### 32.3 Correo y notificaciones durables

Los correos y avisos tendrán plantilla versionada, destinatario, estado de entrega, intentos, proveedor, error sanitizado y fecha. Se creará una bandeja de notificaciones para trabajos terminados, recordatorios, saldo bajo, documentos compartidos, errores recuperables y relaciones en cascada desactualizadas.

### 32.4 Exportaciones direccionables y deduplicadas

Cada exportación se vinculará a una revisión inmutable y guardará formato, plantilla, hash, estado, tamaño y caducidad. Si la misma revisión y configuración ya fueron exportadas se reutilizará el artefacto. Una modificación posterior nunca cambiará silenciosamente un archivo ya emitido.

## 33. Seguridad, privacidad e instituciones

### 33.1 Instituciones y membresías

Si el producto admite directivos o trabajo colaborativo, se incorporará un modelo explícito de institución, membresía, aula, equipo y rol. La propiedad individual no se reemplazará sin migración; se definirá qué contenido es privado, compartido con un aula, visible para directivos o publicable como plantilla.

### 33.2 Auditoría administrativa

Cada operación sensible guardará actor, objetivo, motivo, valores anteriores y posteriores, identificador de solicitud y fecha. Los cambios de rol, saldo, suspensión, borrado, restauración, acceso a datos estudiantiles y publicación de plantillas requerirán auditoría consultable y exportable.

### 33.3 Derechos y ciclo de vida de datos

Se documentará y automatizará la descarga de datos, eliminación de cuenta, retención por entidad, anonimización de estadísticas, purga de temporales, cifrado de campos sensibles y registro de acceso a información de estudiantes.

### 33.4 Límites de abuso

Se definirán cuotas por usuario, institución, IP, herramienta, carga de archivo y operación. Los límites devolverán estado 429 con instrucciones de recuperación y no consumirán créditos. Los umbrales administrativos serán configurables y auditados.

## 34. Preparación operativa y compatibilidad

### 34.1 Verificación de arranque y disponibilidad

El arranque validará configuración, secretos, versión de migración y compatibilidad básica. La disponibilidad diferenciará:

- proceso vivo;
- API preparada para lecturas;
- mutaciones disponibles;
- IA disponible o degradada;
- exportaciones disponibles;
- correo disponible;
- trabajador y cola saludables;
- almacenamiento disponible.

Una dependencia opcional caída no derribará todo el sistema, pero su estado será visible y la interfaz ocultará o explicará la función afectada.

### 34.2 Restricciones de base de datos

Los estados, rangos, saldos, revisiones, tamaños y relaciones importantes tendrán restricciones en la base de datos. Los campos JSON incluirán `schema_version`, límite de tamaño y validación antes de persistencia. Se revisarán todos los índices contra las consultas reales.

### 34.3 Versionado y retirada de API

OpenAPI será la fuente contractual. Se generará el cliente TypeScript y una referencia viva con ejemplos, permisos, errores y paginación. Los cambios incompatibles tendrán versión, periodo de convivencia, telemetría de consumidores y fecha de retiro.

### 34.4 Banderas de funcionalidad

Las funciones de riesgo podrán activarse por entorno, usuario, institución, herramienta o porcentaje. Toda bandera tendrá propietario, valor por defecto, fecha de expiración y plan de retirada para evitar configuración permanente accidental.

### 34.5 Copias y restauración comprobadas

Se fijarán RPO y RTO por tipo de dato. No bastará con producir copias: se ejecutarán restauraciones automáticas periódicas en un entorno aislado y se verificará integridad de documentos, relaciones, archivos, trabajos y libro de créditos.

## 35. Observabilidad y soporte accionable

### 35.1 Identificación extremo a extremo

Cada solicitud, trabajo, generación, exportación y notificación compartirá identificadores correlacionables. Los logs no almacenarán prompts completos, tokens, contraseñas ni datos estudiantiles sin protección.

### 35.2 Objetivos medibles de servicio

Se fijarán indicadores y objetivos para autenticación, lectura, guardado, generación, exportación, subida de archivos y entrega de correo. Las alertas distinguirán una caída general de un fallo de proveedor o de una sola herramienta.

### 35.3 Diagnóstico desde administración

El administrador podrá consultar, sin exponer contenido sensible:

- trabajo y estado actual;
- eventos y reintentos;
- movimiento de créditos;
- versión de contrato y prompt;
- dependencia que falló;
- identificador de seguimiento;
- acción segura de reintento, cancelación o devolución.

## 36. Pruebas adicionales obligatorias

### 36.1 Concurrencia e idempotencia

Probar doble clic, solicitudes repetidas, dos pestañas, dos dispositivos, edición simultánea, reintento tras timeout y reinicio del trabajador. Confirmar que no existan documentos, eventos, archivos ni cobros duplicados.

### 36.2 Fallos controlados

Simular caída de Gemini, proveedor de imágenes, almacenamiento, correo, cola y base de datos; respuestas lentas; resultados inválidos; trabajos abandonados y reinicio durante una exportación. Cada escenario tendrá resultado esperado y recuperación verificable.

### 36.3 Pruebas generativas de contratos

Usar combinaciones y entradas aleatorias para esquemas anidados, rangos, listas vacías, texto excesivo, Unicode, HTML, contenido hostil y relaciones circulares. El servidor nunca persistirá un estado que después no pueda leer o exportar.

### 36.4 Carga y capacidad

Medir concurrencia de usuarios, trabajos de IA, importaciones, consultas de historial y panel administrativo. Cada prueba definirá volumen objetivo, percentiles de latencia, uso de memoria, conexiones de base de datos y comportamiento de saturación.

### 36.5 Accesibilidad funcional

Los recorridos completos se probarán con teclado, lector de pantalla, zoom, texto A+, modo oscuro y pantallas estrechas. Los mensajes del backend deberán asociarse al campo correcto y anunciarse sin depender exclusivamente de color o iconos.

## 37. Nueva fase previa obligatoria

Antes de la Fase 0 del apartado 20 se ejecutará una **Fase -1: estabilización transversal**:

1. congelar inventario de estados locales y llamadas autenticadas;
2. crear contrato de errores e identificación de solicitudes;
3. centralizar sesión y cliente HTTP;
4. corregir reserva, confirmación y devolución de créditos;
5. introducir idempotencia en mutaciones críticas;
6. definir agregado común y estados de ciclo de vida;
7. implementar cola, bandeja transaccional y recuperación de trabajos;
8. migrar preferencias y calendario que hoy dependan del dispositivo;
9. actualizar OpenAPI y generar el cliente frontend;
10. certificar estos recorridos antes de ampliar generadores.

Esta fase bloquea el desarrollo de nuevas capacidades si continúan existiendo dobles fuentes de verdad, estados de carga permanentes, cobros no atómicos o autenticación manual dispersa.

## 38. Criterios de aceptación del anexo

El anexo estará completo cuando:

1. un usuario pueda comenzar en un dispositivo y continuar en otro sin perder contexto;
2. una sesión no pueda convertirse silenciosamente en un usuario de demostración;
3. ningún componente de negocio construya manualmente el encabezado de autenticación;
4. todo error permita recuperación o finalice limpiamente;
5. recargar la página muestre el estado real del trabajo;
6. ningún reintento cobre o cree resultados duplicados;
7. el administrador pueda explicar un fallo mediante su identificador de seguimiento;
8. calendario, favoritos y preferencias sean consistentes entre dispositivos;
9. documentos, evaluaciones y actividades compartan historial, revisiones y papelera;
10. toda actividad entregada conserve intentos y progreso reales;
11. cada bloque generado tenga versión y procedencia;
12. cada nueva versión de IA supere pruebas doradas antes de publicarse;
13. la restauración de una copia de seguridad haya sido ejecutada y verificada;
14. OpenAPI, cliente frontend y comportamiento real coincidan;
15. existan evidencias automáticas de escritorio, móvil, tema oscuro y accesibilidad.

## 39. Mejoras complementarias recomendadas

Estas mejoras no bloquean la estabilización inicial, pero preparan el producto para crecer sin duplicar lógica.

### 39.1 Catálogo de eventos de dominio

Definir eventos versionados como `DocumentCreated`, `GenerationCompleted`, `CreditsReserved`, `CalendarReminderDue`, `ArtifactPublished` y `StudentAttemptCompleted`. Cada evento indicará productor, consumidores, datos permitidos, idempotencia y compatibilidad.

### 39.2 Publicación y asignación

Separar claramente borrador docente, documento final, actividad publicada y asignación a estudiantes. Publicar debe congelar una versión; editar el borrador no cambiará una actividad ya asignada salvo que el docente publique una nueva versión.

### 39.3 Caché semántica segura

Reutilizar resultados solo cuando coincidan herramienta, versión, contexto no sensible y permisos. Nunca compartir respuestas entre instituciones por similitud textual sin una política expresa. El ahorro y la procedencia del resultado serán medibles.

### 39.4 Abstracción de proveedores

IA, imágenes, correo y almacenamiento tendrán interfaces internas y adaptadores. El cambio o respaldo de proveedor no modificará contratos de las herramientas. La selección considerará disponibilidad, costo, privacidad, capacidad y calidad por tipo de tarea.

### 39.5 Gobernanza de configuración

Toda configuración operativa tendrá esquema, validación, valor por entorno, responsable y auditoría. Los secretos no se mezclarán con opciones editables. El panel administrativo no podrá guardar combinaciones incompatibles.

### 39.6 Mantenimiento programado

Crear procesos idempotentes para purgar temporales, cerrar reservas vencidas, recuperar trabajos, emitir recordatorios, actualizar índices, depurar papelera y verificar integridad. Cada proceso publicará métricas y podrá ejecutarse manualmente de forma segura.

## 40. Catálogo curricular normativo versionado

El backend mantendrá un catálogo curricular con modalidad, nivel, ciclo, grado, área, competencia, capacidad, desempeño, estándar, enfoque transversal, fuente oficial y periodo de vigencia. Cada registro tendrá versión, procedencia y estado de publicación.

- Las herramientas consultarán el catálogo mediante API y no duplicarán listas curriculares en React.
- Una generación guardará la versión curricular utilizada para que siga siendo reproducible.
- Las actualizaciones se importarán en borrador, se validarán y se publicarán con fecha efectiva.
- Los administradores podrán comparar versiones, detectar referencias obsoletas y migrar voluntariamente un documento.
- Los valores institucionales o regionales ampliarán el catálogo sin alterar la fuente nacional.

## 41. Revisión y aprobación institucional

Se incorporará un flujo opcional de revisión para documentos que lo requieran:

`draft -> submitted -> changes_requested -> approved -> published`.

El docente conservará la autoría. Coordinadores y directivos podrán comentar bloques, solicitar cambios, aprobar una revisión exacta y consultar el historial, pero no modificar silenciosamente el original. Las notificaciones, plazos y permisos se resolverán en backend. La aprobación quedará invalidada si se modifica contenido material después de aprobarlo.

## 42. Biblioteca institucional compartida

Los usuarios autorizados podrán publicar una copia controlada de un recurso en la biblioteca de su institución. La publicación tendrá categoría, modalidad, nivel, área, etiquetas, licencia, versión y moderación.

- Reutilizar creará una copia o derivación con trazabilidad; nunca editará el original.
- Se registrarán usos, favoritos, reportes y valoraciones sin convertirlos en rankings perjudiciales.
- La retirada de una publicación no eliminará las copias privadas ya autorizadas.
- La búsqueda respetará institución, rol y estado de moderación.

## 43. Entrega segura a estudiantes

Se creará un canal independiente del panel docente para asignar actividades. Una asignación congelará la revisión publicada y definirá aula, estudiantes, apertura, cierre, número de intentos, retroalimentación y adaptaciones.

- Los enlaces públicos usarán tokens revocables, de alcance limitado y con caducidad.
- Las respuestas correctas no se enviarán antes del momento permitido.
- El estudiante podrá reanudar cuando la actividad lo permita.
- El docente verá estado de entrega y progreso, no vigilancia innecesaria.
- Los resultados se integrarán con lista de cotejo, rúbrica o registro solo con confirmación docente.

## 44. Integraciones educativas

Las integraciones con Google Classroom, Microsoft Teams, sistemas de matrícula u otros servicios se construirán como adaptadores opcionales y desacoplados.

- Autorización OAuth por institución o usuario, con alcances mínimos.
- Estado de sincronización, cursor, reintentos e idempotencia.
- Vista previa antes de importar o publicar.
- Mapeo explícito entre cursos, aulas, estudiantes, tareas y calificaciones.
- Revocación y eliminación de credenciales.
- Registro de qué datos salieron o ingresaron al sistema.

Ninguna integración será requisito para utilizar normalmente las 57 herramientas.

## 45. Licencias y calidad de recursos visuales

Toda imagen o recurso externo guardará URL de origen, proveedor, autor cuando exista, licencia, fecha de consulta, dimensiones, formato, hash y herramienta que lo utilizó.

- Solo se aceptarán fuentes cuya licencia y condiciones sean compatibles con el uso previsto.
- Se validará resolución, proporción, legibilidad, pertinencia pedagógica y ausencia de marcas de agua no autorizadas.
- La exportación incluirá atribución cuando la licencia lo exija.
- Si el recurso deja de estar disponible, la revisión publicada conservará una copia autorizada o un sustituto registrado.
- El administrador podrá bloquear proveedores o recursos inapropiados.

## 46. Legibilidad y adecuación automática

Cada generador aplicará validadores específicos de edad, grado, modalidad y finalidad. Se revisarán vocabulario, longitud de instrucciones, densidad visual, cantidad de conceptos nuevos, ambigüedad, contraste, tamaño de fuente y carga cognitiva.

El resultado mostrará advertencias accionables, no una calificación opaca. El docente podrá aceptar una excepción indicando motivo. Las adaptaciones NEE y DUA propondrán alternativas sin reducir injustificadamente el objetivo de aprendizaje.

## 47. Retroalimentación para mejorar generadores

Cada resultado permitirá indicar de forma opcional:

- utilidad general;
- sección incorrecta o fuera de tema;
- nivel de dificultad inadecuado;
- formato poco práctico;
- información inventada;
- corrección realizada por el docente.

La retroalimentación se separará de los datos personales, respetará consentimiento y retención, y alimentará evaluaciones agregadas. Nunca se usará directamente para cambiar prompts de producción sin revisión, casos dorados y publicación versionada.

## 48. Centro administrativo de migraciones

El panel administrativo mostrará migraciones de datos y procesos de backfill con estado, alcance, versión, progreso, errores, registros omitidos, fecha, actor y posibilidad segura de reintento.

- Las migraciones serán reanudables e idempotentes.
- Se ejecutarán por lotes con límites para no bloquear la aplicación.
- Habrá simulación y reporte antes de cambios irreversibles.
- Las transformaciones conservarán correspondencia entre identificadores antiguos y nuevos.
- El cierre exigirá verificación de conteos, integridad y muestras funcionales.

## 49. Soporte autorizado y temporal

Se podrá emitir acceso de soporte de duración limitada, autorizado por el usuario o por una política administrativa documentada. Nunca se conocerá ni reemplazará su contraseña.

- Alcance limitado por caso, entidad y acción.
- Motivo obligatorio y vencimiento automático.
- Indicador visible cuando exista una sesión de soporte.
- Auditoría completa y notificación al propietario.
- Ocultamiento de datos estudiantiles que no sean necesarios.
- Prohibición de exportar, borrar o compartir salvo autorización específica.

## 50. Identidad y formatos institucionales

Cada institución podrá definir logotipo, encabezado, pie, denominaciones, firmas, paleta documental, numeración y plantillas aprobadas. Estas preferencias se validarán y versionarán en backend.

La identidad institucional modificará la presentación del documento, no su estructura pedagógica ni los colores funcionales de la aplicación. La vista previa y la exportación usarán exactamente la misma versión de plantilla.

## 51. Analítica pedagógica responsable

Se construirá una capa analítica separada de la operación transaccional para medir uso, finalización, errores, abandono, tiempos, reutilización y resultados agregados.

- Las métricas tendrán definición, propietario, unidad, filtros y fecha de actualización.
- Se evitarán rankings simplistas de docentes o estudiantes.
- Los grupos pequeños se anonimizarán o no se mostrarán.
- Toda métrica permitirá llegar a una acción concreta de mejora.
- Los paneles indicarán cobertura y datos faltantes.
- La analítica no alterará saldos, documentos ni calificaciones.

## 52. Incorporación de las ampliaciones al criterio de terminado

Cuando una herramienta participe en publicación, asignación, biblioteca, integración o analítica, su criterio de terminado también exigirá:

1. referencia curricular versionada;
2. revisión y permisos institucionales probados;
3. identidad exacta de la revisión publicada;
4. licencia y procedencia de recursos externos;
5. legibilidad acorde al público;
6. entrega y progreso persistentes cuando corresponda;
7. retroalimentación protegida;
8. integración revocable e idempotente;
9. métricas con privacidad y definiciones estables;
10. migración y rollback verificables.

## 53. Registro de ejecución

Este registro se actualizará por lotes. Una marca completada significa que existe implementación frontend/backend y verificación proporcional, no solamente diseño.

### 53.1 Fase -1 — lote de sesión, errores y preferencias

Estado al 5 de septiembre de 2026: **implementado y verificado en código; despliegue pendiente**.

- [x] Cliente HTTP capaz de adjuntar la autenticación desde un punto central.
- [x] Timeout uniforme y distinción entre desconexión y espera agotada.
- [x] Lectura del sobre de error estructurado, reintento, campo, seguimiento y `Retry-After`.
- [x] Limpieza central de sesión ante respuestas 401 protegidas.
- [x] Validación de la identidad mediante `/users/me` antes de mostrar rutas protegidas.
- [x] Eliminación del usuario de demostración como autorización de rutas.
- [x] Funciones únicas para guardar, actualizar y limpiar la sesión.
- [x] Middleware backend con `X-Request-ID` y tiempo de servidor.
- [x] Contrato compatible de errores HTTP y de validación.
- [x] Endpoint backend de preferencias de espacio de trabajo.
- [x] Persistencia sin destruir las preferencias de asistencia o IA existentes.
- [x] Migración progresiva de tema, tamaño de letra, menú y panel contextual desde datos locales.
- [x] Sincronización de preferencias de experiencia al iniciar o cambiar sesión.
- [x] Tema, tamaño de texto y disposición principal conectados a la preferencia sincronizada.
- [x] Favoritos, frase diaria y nivel activo del inicio conectados a la cuenta.
- [x] Referencias y bloques académicos del calendario conectados a la cuenta, conservando caché local.
- [x] Servicios compartidos de listas, evaluaciones, utilidades y plantillas migrados al cliente autenticado central.
- [x] Endpoint agregado `/dashboard/overview` con conteo, recientes, herramientas frecuentes y alertas próximas.
- [x] Inicio migrado del cálculo por descarga completa al modelo de lectura backend.
- [x] Aislamiento por propietario y navegación correcta al mes del evento comprobados en backend.
- [x] Descuento de créditos y contadores convertido en actualización atómica condicionada por saldo.
- [x] Generaciones administrativas registradas con costo cero también en las métricas de calidad.
- [x] Pruebas backend del contrato de errores y persistencia de preferencias.
- [x] Pruebas frontend del cliente central y protección de sesión.
- [x] Suite backend completa: 111 pruebas superadas.
- [x] Suite frontend completa: 186 pruebas superadas.
- [x] Lint frontend y Ruff backend superados.
- [x] Compilación frontend de producción superada.
- [x] Recorrido E2E representativo aprobado en 320, 390, 768, 1366 y 1920 píxeles.

Pendiente dentro del mismo lote:

- [ ] retirar encabezados manuales redundantes de todos los consumidores;
- [ ] implementar diario de mutaciones sin conexión y resolución de conflictos;
- [ ] completar renovación segura y revocación de sesiones;
- [ ] verificar visualmente escritorio y móvil mediante el recorrido E2E.
