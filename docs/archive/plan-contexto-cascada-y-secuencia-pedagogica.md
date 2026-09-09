# Plan: contexto en cascada, sugerencias IA y secuencia pedagógica

Fecha: 4 de septiembre de 2026  
Estado: ejecutado y verificado localmente.

## 1. Objetivo

Convertir los formularios de Avendia en una experiencia pedagógica conectada. Las sugerencias de IA deben responder al campo específico que el docente está completando, aprender del contexto ya ingresado y, cuando el docente lo decida, reutilizar datos de documentos previos como PCA, unidades, sesiones, evaluaciones, tareas y recursos.

El sistema debe conservar siempre dos modalidades:

1. **Crear desde cero:** el docente completa el formulario normalmente, sin referencias anteriores.
2. **Continuar una secuencia:** el docente elige un documento previo y decide qué información desea reutilizar.

Ningún dato de referencia se aplicará sin que el docente lo vea, pueda editarlo o lo descarte.

## 2. Prioridad 0: corrección visual del modal de sugerencias

### 2.1 Íconos y botones de sugerencias rápidas

- Corregir la alineación vertical del emoji/ícono dentro de cada chip de sugerencia.
- Reservar un contenedor de ancho y alto constante para el ícono; el texto deberá alinearse al centro y podrá ocupar una o dos líneas sin desplazar el ícono.
- Mantener el mismo alto mínimo, borde, radio, separación y estado de foco en todos los chips.
- El estado seleccionado debe cambiar de forma accesible: borde, fondo y texto; no depender solo del color.
- Aplicar la misma composición en modo claro, oscuro, escritorio, tableta y móvil.
- Verificar que el pie fijo del modal no cubra la última sugerencia ni los campos opcionales.

### 2.2 Criterios de aceptación visual

- Ningún ícono se ve inclinado, cortado, fuera de eje o separado del texto.
- Todos los botones mantienen lectura y pulsación cómoda en 320 px, 390 px, 768 px, 1024 px y 1440 px.
- El modal conserva contraste AA, navegación con teclado, foco visible y cierre con Escape.
- No existen desbordamientos horizontales ni textos ocultos en el cuerpo o pie del modal.

## 3. Motor de contexto pedagógico activo

### 3.1 Perfil compartido

Crear una estructura única, reutilizable por frontend y backend, llamada `PedagogicalContext` con:

- institución, DRE, UGEL y ubicación cuando estén disponibles;
- docente, rol y modalidad educativa: EBR, EBA, EBE/EBEE;
- nivel, grado/ciclo, sección, turno y área curricular;
- contexto rural, urbano, bilingüe u otra condición declarada por el docente;
- tema, propósito, competencia, capacidad, desempeño, evidencia y criterio;
- necesidad o barrera detectada, apoyos DUA y acuerdos con familia cuando apliquen;
- documento de referencia, revisión de origen y campos que fueron heredados;
- fecha de actualización y procedencia de cada valor: docente, documento previo o sugerencia IA.

### 3.2 Reglas de actualización en cascada

La dependencia deberá seguir esta cadena:

```text
Modalidad → Nivel → Grado/Ciclo → Área → Tema → Competencia/Desempeño
→ Propósito → Actividad/Evidencia → Instrumento de evaluación → Retroalimentación
```

- Al cambiar un dato de nivel superior, recalcular sugerencias de los campos dependientes.
- Nunca borrar automáticamente texto redactado por el docente.
- Marcar como **“requiere revisión”** los valores heredados o sugeridos que ya no coincidan con el área, grado o tema vigente.
- Mostrar la razón de cada actualización: por ejemplo, “actualizado porque cambiaste el área de Matemática a Comunicación”.
- Debounce de escritura y cancelación de solicitudes anteriores para impedir que una respuesta lenta sobrescriba el nuevo contexto.

## 4. Sugerencias IA por herramienta y campo

### 4.1 Contrato de una sugerencia

Cada llamada al botón “Sugerir con IA” debe enviar al backend:

- módulo y herramienta;
- identificador, etiqueta y tipo del campo activo;
- contexto pedagógico efectivo;
- valores ya escritos en campos relacionados;
- documento de referencia opcional y los campos autorizados;
- instrucciones específicas para el tipo de producto;
- restricciones de seguridad, edad, modalidad y privacidad.

La respuesta deberá devolver:

- propuesta principal corta y editable;
- hasta cinco sugerencias rápidas realmente pertinentes;
- explicación breve de los datos usados;
- advertencias de conflicto o información faltante;
- versión y huella del contexto usado, para impedir aplicar una sugerencia desactualizada.

### 4.2 Catálogo específico de sugerencias

| Herramienta | Campo | La IA debe proponer |
|---|---|---|
| PCA | Justificación | necesidad, brecha, logro anual, contexto y propósito institucional |
| Unidad | Situación significativa | reto auténtico, actores, contexto, producto y preguntas desafiantes |
| Sesión | Inicio | activación, saber previo, pregunta retadora y conexión con evidencia |
| Sesión | Desarrollo | modelado, práctica guiada, autonomía, recursos y verificación |
| Examen | Temas específicos | contenidos observables y evaluables, no títulos genéricos |
| Rúbrica | Criterios | desempeños observables, evidencia y progresión AD/A/B/C |
| Lista de cotejo | Indicadores | una conducta verificable por fila, sin indicadores dobles |
| Tarea de hogar | Actividades | consigna resoluble, material, producto, respuesta y apoyo familiar opcional |
| Presentación | Estructura | secuencia visual, ejemplo, interacción y cierre, no campos administrativos |
| Inclusión | Ajuste DUA | barrera, apoyo, alternativa, responsable y evidencia de acceso |
| Tutoría | Actividad | dinámica segura, reflexión, acuerdo, seguimiento y ruta de ayuda |
| Recursos | Parámetros | reglas, contenido correcto, clave y formato propio del juego o recurso |

### 4.3 Ejemplos de cascada

- Matemática + 4.º primaria + fracciones: sugerir reparto equitativo, equivalencias, material concreto, problemas cotidianos, procedimientos y evidencias matemáticas.
- Comunicación + comprensión lectora: sugerir ideas principales, inferencias, opinión sustentada, producción oral o escrita y evidencias textuales.
- Ciencia y Tecnología + ciclo del agua: sugerir observación, hipótesis, explicación causal, experimento seguro y registro de resultados.
- Si el área pasa de Matemática a Comunicación, no sugerir fracciones, operaciones ni criterios matemáticos en los campos posteriores.

## 5. Flujo opcional de documentos encadenados

### 5.1 Selector previo a la creación

Antes de abrir cada herramienta compatible, ofrecer:

- **Crear desde cero** como opción principal;
- **Usar documento anterior como referencia**;
- **Continuar una secuencia pedagógica**.

El selector debe listar documentos propios y autorizados con título, tipo, área, grado, tema, fecha, estado y versión. Debe permitir búsqueda y filtros por módulo, periodo, área, grado y estado.

### 5.2 Importación controlada

El docente debe seleccionar exactamente qué reutilizar:

- datos institucionales y modalidad;
- área, nivel, grado y sección;
- tema, situación significativa y propósito;
- competencias, capacidades y desempeños;
- actividades, evidencias, productos y criterios;
- apoyos DUA, acuerdos o recomendaciones;
- solo el tema, sin copiar el resto.

No se copian de forma automática tablas, respuestas, calificaciones, datos personales de estudiantes, claves docentes ni información sensible que no corresponda al nuevo producto.

### 5.3 Mapa de compatibilidades

```text
PCA → Unidad → Sesión → Ficha / Tarea / Presentación
                         └→ Rúbrica / Lista de cotejo / Examen

Plan de atención → Adaptación DUA → Ficha de observación / Seguimiento
Analítica de aula → Plan de refuerzo → Trabajo autónomo / Recuperación
Sesión de tutoría → Informe de tutoría → Comunicación a familias
```

- PCA a Unidad: periodos, área, competencias, productos y calendarización.
- Unidad a Sesión: propósito, desempeño, criterio, evidencia y secuencia.
- Sesión a recurso/evaluación: tema, actividad, evidencia, duración y criterio.
- Plan de atención a DUA: barreras, apoyos, responsables y fechas de revisión.
- Analítica a refuerzo: brecha, estudiantes autorizados, competencia, periodo y meta.

## 6. Persistencia y trazabilidad en backend

### 6.1 Modelo de relación documental

Añadir una relación persistente entre documentos con:

- `parent_document_id` opcional;
- tipo de relación: `reference`, `continuation`, `adaptation`, `assessment`, `resource`;
- revisión exacta del documento origen;
- campos heredados y campos modificados;
- usuario, fecha, contexto y versión utilizados;
- estado de compatibilidad: vigente, requiere revisión o desconectado.

### 6.2 Reglas de seguridad

- Respetar propiedad, permisos y alcance del documento fuente.
- No exponer estudiantes, calificaciones, observaciones sensibles ni acuerdos familiares a una herramienta que no los necesita.
- Registrar consentimiento docente al reutilizar información de un documento.
- Si el origen cambia después, no sobrescribir el documento derivado; ofrecer comparación y actualización voluntaria.

### 6.3 Historial como cadena pedagógica

Mostrar una vista de relaciones, por ejemplo:

```text
PCA 2026
 └─ Unidad 2: Fracciones
     └─ Sesión 3: Repartimos en partes iguales
         ├─ Presentación didáctica
         ├─ Tarea para el hogar
         ├─ Lista de cotejo
         └─ Rúbrica de evaluación
```

El docente podrá abrir el origen, crear un derivado, comparar cambios o desligar el documento sin borrar su contenido.

## 7. Contratos de IA y prevención de errores

- El prompt debe priorizar el campo activo y el tipo de herramienta antes que instrucciones genéricas.
- La IA debe declarar los datos utilizados y las suposiciones visibles.
- Prohibir inventar estudiantes, notas, porcentajes, normas, enlaces, fechas, diagnósticos o resultados.
- Si falta contexto P0, devolver una pregunta breve o una plantilla parcial; nunca completar silenciosamente datos sensibles.
- Validar que las sugerencias mantengan coherencia con modalidad, nivel, grado, área y tema.
- Rechazar una respuesta cuya huella de contexto no coincida con la versión actual del formulario.
- Permitir aplicar, reemplazar, combinar, editar o descartar la propuesta antes de modificar el campo.

## 8. Cambios de frontend

- Extraer el modal actual a un componente accesible y reutilizable con contrato tipado por campo.
- Crear un proveedor de `PedagogicalContext` conectado al formulario, Historial y selector de referencias.
- Mostrar chips de procedencia: “escrito por ti”, “tomado de Unidad 2”, “sugerido por IA” o “requiere revisión”.
- Añadir un panel compacto de “Contexto usado por la IA” dentro del modal.
- Incorporar selector de referencia antes de cada herramienta compatible y una opción visible para crear desde cero.
- Agregar acciones de deshacer y comparación para una sugerencia aplicada.
- Mantener colores actuales, contraste en ambos temas y comportamiento responsive.

## 9. Cambios de backend

- Crear esquemas `PedagogicalContext`, `FieldSuggestionRequest`, `FieldSuggestionResponse` y `DocumentReference`.
- Implementar endpoint para sugerencias de campo con contexto, versión y validación de propiedad.
- Implementar endpoint para buscar documentos compatibles y otro para crear/consultar relaciones documentales.
- Persistir las relaciones en base de datos y devolverlas al recuperar el Historial.
- Crear matriz de compatibilidades entre herramientas; el backend debe ser la fuente de verdad.
- Reutilizar los contratos semánticos existentes para verificar que una sugerencia corresponde al producto solicitado.
- Registrar telemetría agregada: sugerencias aceptadas, editadas, descartadas, contexto incompleto y conflicto detectado.

## 10. Pruebas de aceptación

### 10.1 Contexto y sugerencias

- [x] Cambiar área, modalidad, nivel, grado o tema actualiza sugerencias dependientes.
- [x] Una sugerencia de Matemática no aparece en Comunicación sin justificación explícita.
- [x] Un cambio de contexto no borra texto escrito manualmente.
- [x] Una respuesta IA tardía no sobrescribe un contexto nuevo.
- [x] El modal muestra el campo correcto, sugerencias propias, fuente del contexto y controles de aplicar/editar/descartar.
- [x] Íconos y chips se ven alineados en claro, oscuro, móvil y escritorio.

### 10.2 Referencias entre documentos

- [x] PCA puede alimentar una Unidad; Unidad puede alimentar una Sesión; Sesión puede alimentar recursos y evaluación.
- [x] El docente puede crear la misma herramienta sin referencia.
- [x] El docente elige qué campos heredar y puede modificarlos antes de guardar.
- [x] Una revisión posterior del documento origen no cambia el derivado sin aprobación docente.
- [x] Historial muestra y recupera la relación origen/derivado desde backend, sin depender de `localStorage`.
- [x] Permisos impiden referenciar documentos ajenos o información sensible no autorizada.

### 10.3 Calidad y compatibilidad

- [x] Backend advierte referencias con tipo incompatible y el generador mantiene los contratos semánticos por herramienta.
- [x] Se conserva trazabilidad de contexto, revisión y campos heredados.
- [x] Se prueban rutas compatibles con documentos de ejemplo y sin referencia.
- [x] No hay errores de consola, desbordamiento horizontal ni pérdida de foco en el flujo validado.
- [x] Las pruebas cubren frontend, API, persistencia, reapertura, claro/oscuro y dispositivos pequeños.

## 11. Orden de implementación

1. Corregir iconos y estructura responsive del modal.
2. Tipar catálogo de campos y sugerencias específicas por herramienta.
3. Implementar `PedagogicalContext` en formularios y actualización en cascada.
4. Crear endpoint de sugerencia contextual y validación de huella de contexto.
5. Diseñar y persistir relaciones entre documentos.
6. Implementar selector de referencia y mapa de compatibilidades.
7. Integrar cadena pedagógica en Historial.
8. Añadir auditoría, seguridad, pruebas unitarias, integración, navegador y responsive.

## 12. Definición de terminado

El trabajo estará terminado cuando un docente pueda crear un PCA, decidir usarlo o no como referencia para una Unidad, continuar hacia una Sesión y generar una evaluación o recurso coherente; cuando cada sugerencia cambie según el campo y contexto real; y cuando toda la relación sea persistente, editable, segura, visible en Historial y verificable en frontend y backend.

## 13. Ayuda adaptativa durante el formulario

### 13.1 Ayuda según el momento

- La ayuda deberá distinguir si el docente está iniciando, completando, revisando o cerrando un paso.
- Al iniciar, mostrará ejemplos breves y requisitos mínimos; durante la escritura, relaciones con los datos ya ingresados; al revisar, inconsistencias y vacíos; al cerrar, un resumen de coherencia.
- No repetirá explicaciones ya descartadas ni interrumpirá la escritura con ventanas automáticas.

### 13.2 Ejemplos y marcadores dinámicos

- Los ejemplos de cada campo se actualizarán con modalidad, nivel, grado, área, tema y herramienta.
- Un ejemplo nunca se guardará como respuesta ni se confundirá visualmente con contenido real.
- Los campos sin contexto conservarán un ejemplo pedagógico neutral y declararán qué dato permitiría personalizarlo.

### 13.3 Niveles de asistencia

Cada modal permitirá elegir uno de estos niveles, conservando la elección durante la herramienta:

1. **Idea rápida:** frase corta o conjunto de opciones para desbloquear la escritura.
2. **Propuesta completa:** texto listo para revisar, coherente con el campo y el producto.
3. **Guía paso a paso:** preguntas pequeñas que construyen la respuesta sin reemplazar el criterio docente.

## 14. Coherencia en cascada y control docente

### 14.1 Detector de impacto

- Antes de cambiar modalidad, nivel, grado, área, tema, competencia o propósito, identificar los campos dependientes ya completados.
- Después del cambio, marcar solamente los campos afectados y explicar la causa.
- Ofrecer conservar, revisar con ayuda, regenerar o deshacer; nunca reemplazar automáticamente contenido del docente.

### 14.2 Indicador de coherencia en tiempo real

- Mostrar un estado discreto: contexto incompleto, coherente o requiere revisión.
- El estado deberá provenir de reglas deterministas del frontend y confirmación del backend al guardar o generar.
- La advertencia indicará el conflicto concreto y una acción posible, no mensajes genéricos.

### 14.3 Resumen cruzado antes de generar

Antes de generar el producto completo, presentar un resumen editable de modalidad, nivel, grado, área, tema, competencia, propósito, evidencia, instrumento, referencia y campos pendientes. El docente podrá volver directamente al campo con conflicto.

## 15. Reutilización segura y granular

### 15.1 Compatibilidad de referencias

- Calcular compatibilidad por tipo de herramienta, modalidad, nivel, grado, área, periodo y vigencia de la revisión.
- Clasificar la referencia como compatible, compatible con ajustes o no recomendada, explicando cada diferencia.
- No bloquear una referencia razonable; requerir confirmación explícita cuando existan ajustes pedagógicos.

### 15.2 Importación parcial por bloques

- Permitir seleccionar bloques completos y, dentro de ellos, campos individuales.
- Mostrar origen, revisión, valor anterior y destino antes de importar.
- Registrar cada campo heredado y cada modificación posterior.

### 15.3 Alertas de reutilización incompatible

- Detectar cruces como primaria/secundaria, EBR/EBA/EBE, Matemática/Comunicación o periodo vencido.
- Evitar copiar instrumentos, diagnósticos o datos de estudiantes a destinos que no los necesiten.
- Permitir continuar solo con los campos compatibles o crear desde cero.

## 16. Calidad de sugerencias y transparencia

### 16.1 Biblioteca de patrones por herramienta

- Mantener plantillas estructurales propias para PCA, unidad, sesión, evaluación, rúbrica, lista de cotejo, tarea, presentación, inclusión, tutoría y recursos.
- Cada una definirá propósito, longitud, componentes obligatorios, contenido prohibido, validaciones y ejemplos válidos.
- El patrón deberá complementar los contratos semánticos de las 57 herramientas, no sustituirlos por una respuesta genérica.

### 16.2 Procedencia por bloque

- Cada respuesta aplicada conservará si fue escrita por el docente, heredada, sugerida por IA o editada después.
- Guardar huella de contexto, modelo/proveedor cuando aplique, fecha y revisión del documento fuente.
- La procedencia será visible sin ensuciar los documentos exportados.

### 16.3 Comparación antes de aplicar

- Mostrar contenido actual y propuesta en una comparación legible.
- Permitir reemplazar, insertar, combinar o cancelar.
- Mantener una acción inmediata de deshacer y conservar la versión anterior en backend.

### 16.4 Modo sin IA

- Todas las herramientas seguirán siendo utilizables sin proveedor de IA.
- Ofrecer patrones, ejemplos contextuales, relaciones documentales y validaciones locales/backend deterministas.
- Identificar con claridad qué parte requiere IA y cuál funciona sin ella; nunca simular una respuesta generada.

### 16.5 Retroalimentación mínima

- Después de aplicar o descartar una sugerencia, permitir registrar: útil, editada, incorrecta, repetitiva o demasiado extensa.
- Persistir el evento sin guardar contenido sensible innecesario.
- Usar métricas agregadas para ajustar patrones por herramienta y campo, sin alterar automáticamente el trabajo del docente.

## 17. Continuidad y personalización opcional

### 17.1 Preferencias del docente

- Con consentimiento explícito, recordar longitud, tono, modalidad frecuente, nivel, área y nivel de asistencia.
- Permitir revisar, desactivar y borrar preferencias.
- No convertir una preferencia en dato institucional ni reutilizar información sensible entre docentes.

### 17.2 Siguiente documento recomendado

- Al terminar, sugerir el siguiente producto lógico según el mapa de compatibilidades.
- Explicar qué datos puede reutilizar y permitir crear con referencia, abrir Historial o finalizar.
- No crear documentos ni gastar créditos sin una acción expresa del docente.

## 18. Criterios de aceptación adicionales

- [x] La ayuda y los ejemplos cambian con el paso, campo y contexto sin escribir por el docente.
- [x] Los tres niveles de asistencia generan respuestas de alcance distinto y mantienen la semántica del campo.
- [x] Cambiar un dato superior identifica dependencias, conserva valores y permite deshacer.
- [x] El indicador de coherencia explica conflictos concretos y coincide con la validación del backend.
- [x] La importación permite elegir bloques y campos, registra procedencia y evita datos incompatibles.
- [x] La comparación muestra antes/después y ninguna sugerencia se aplica de forma silenciosa.
- [x] El flujo principal funciona sin IA mediante patrones y reglas reales.
- [x] El feedback y las preferencias se persisten con propiedad, consentimiento y privacidad.
- [x] La recomendación final respeta el mapa pedagógico y nunca crea contenido automáticamente.
- [x] El resumen cruzado impide generar silenciosamente con campos P0 faltantes o incoherentes.

## 19. Registro de ejecución

- Motor transversal de contexto, huella, ejemplos, sugerencias y dependencias aplicado al flujo común de herramientas.
- Modal contextual accesible con iconos alineados, contexto visible, tres niveles de ayuda, modo sin IA, comparación y deshacer.
- Sugerencias vivas verificadas: una entrada sobre aritmética y fracciones actualiza inmediatamente los cinco accesos rápidos.
- Selector opcional de referencias con compatibilidad calculada por backend, importación campo a campo, exclusión de datos sensibles y consentimiento.
- Relaciones documentales, revisión origen, procedencia de campos, preferencias y feedback persistidos en base de datos.
- Historial identifica documentos derivados y conserva la referencia de origen.
- Migración `0017_document_relations` aplicada en la base local.
- Regresión completa: 174 pruebas frontend y 91 pruebas backend aprobadas; lint, Ruff y compilación de producción aprobados.
- QA visual realizada en escritorio y 390 × 844, modo claro y oscuro, sin desbordamiento horizontal del modal ni solapamiento del botón flotante.
