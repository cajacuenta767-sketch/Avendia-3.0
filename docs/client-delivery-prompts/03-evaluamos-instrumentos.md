# Prompt 03 — Evaluamos: instrumentos vinculados a estudiantes

## Objetivo

Adaptar el bloque **Evaluamos** de Avendia 3.0 para que deje de ser un conjunto de formularios genéricos y se convierta en herramientas docentes funcionales, enlazadas con la nómina central creada en el punto 02. Debe conservarse íntegramente el lenguaje visual actual del proyecto —colores claro/oscuro, barra lateral, encabezado, tipografía, espacios, botones y pasos— y copiar del proyecto anterior únicamente la profundidad funcional, los campos y la lógica pedagógica útiles.

## Alcance obligatorio

### 1. Selector común de estudiantes

- Integrar el selector reutilizable de estudiantes en Lista de cotejo, Calificador de rúbrica, Ficha de observación, Registros auxiliares y Carpetas de recuperación.
- Permitir según el contexto: un estudiante, varios estudiantes, aula completa o equipos personalizados.
- Mostrar aula, total seleccionado, buscador y estados vacíos/carga/error.
- Guardar siempre identificadores estables de nómina y estudiante; nunca copiar nombres como única referencia.
- Si todavía no existe una nómina, ofrecer acceso directo a **Mis estudiantes** y explicar qué debe hacer el docente.

### 2. Lista de cotejo aplicable

- Flujo por pasos: Datos generales → Criterios → Registro → Vista previa/descarga.
- Datos: docente, institución, modalidad EBR/EBA/EBE, nivel, grado/ciclo, área, aula, actividad o evidencia, fecha y periodo.
- Permitir crear, editar, ordenar y eliminar criterios C1…Cn con texto de ejemplo en cada cuadro vacío.
- Construir una matriz real: una fila por estudiante y una columna por criterio.
- Cada celda debe admitir **Sí / No** y, si el docente lo elige, **Sí / No / En proceso**.
- Incluir observación por estudiante y observación general.
- Guardar borrador y recuperar el trabajo sin perder marcas.
- Exportar un archivo XLSX real: encabezados visibles, estudiantes en filas, C1…Cn en columnas, valores Sí/No, observaciones y una hoja adicional con la definición completa de cada criterio.

### 3. Rúbrica y retroalimentación

- Constructor de rúbrica analítica u holística con criterios, ponderación opcional y niveles AD/A/B/C o escala configurable.
- Permitir seleccionar uno o varios estudiantes y registrar evidencia o producción por estudiante.
- Mostrar análisis por criterio, fortaleza, aspecto por mejorar y **recomendación concreta para que el estudiante escale en su aprendizaje**.
- La IA puede sugerir retroalimentación únicamente donde tiene sentido pedagógico; no debe aparecer un botón de IA en DRE, UGEL, nombre, modalidad u otros datos administrativos.
- Toda sugerencia de IA debe adaptarse al campo y al estudiante actual, abrir un diálogo contextual y quedar editable antes de guardar.
- La decisión y calificación final deben permanecer bajo control del docente.

### 4. Ficha de aprendizaje y Preguntas sobre texto

- Admitir tres fuentes excluyentes o combinables: escribir/pegar texto, subir PDF o subir Word DOC/DOCX.
- Validar extensión, tipo real, tamaño máximo y archivo vacío; presentar errores claros y no perder el formulario.
- Extraer el texto en el servidor y mostrar una vista previa editable antes de generar.
- En Preguntas sobre texto incluir selector de tamaño de texto **pequeño, mediano y grande** tanto para la lectura como para las preguntas y reflejarlo en la vista previa y exportación.
- Conservar niveles literal, inferencial y crítico-reflexivo, cantidades, tipo de pregunta, capacidades CNEB, criterios y ajustes DUA.
- La generación debe producir contenido útil, clave o respuestas esperadas y justificación; no solo un párrafo decorativo.

### 5. Ficha de observación

- Modos Individual, Varios estudiantes, Equipo y Aula completa.
- En modo equipo permitir seleccionar todos los integrantes de un equipo en una sola acción.
- Registrar fecha/hora, situación, foco, criterios, hechos objetivos, factores de contexto, interpretación, conclusión y compromisos.
- Distinguir notas comunes del grupo y registros individuales.
- Mantener historial de observaciones vinculado a los estudiantes elegidos.

### 6. Recuperación y registros auxiliares

- Carpetas de recuperación debe permitir elegir uno, varios o todos los estudiantes del aula.
- Registrar diagnóstico, competencias priorizadas, criterios, evidencias, ruta de actividades, cronograma, orientaciones familiares y seguimiento individual.
- Registros auxiliares debe utilizar la nómina central para construir su matriz, no solicitar nuevamente una lista escrita a mano.

## Persistencia y API

- Crear contratos tipados para instrumentos, participantes, criterios, niveles, registros por criterio, observaciones, archivos fuente y retroalimentaciones.
- Todos los registros deben pertenecer al docente autenticado y validar que aula/estudiantes también le pertenezcan.
- Usar transacciones para guardados compuestos y evitar instrumentos parciales.
- Los borradores deben poder crear, leer, actualizar y archivar; conservar fecha de última modificación.
- Los archivos fuente se procesan con límites estrictos; no ejecutar macros, scripts ni contenido incrustado.
- No enviar contenido pedagógico sensible a la IA sin el consentimiento funcional implícito del botón Generar; los datos administrativos innecesarios no deben formar parte del prompt.

## Diseño y accesibilidad

- Respetar exactamente el sistema visual actual de Avendia 3.0 en tema claro y oscuro.
- Formularios de dos columnas en escritorio; una columna en móvil; matrices con desplazamiento interno controlado y primera columna legible.
- No crear desbordamiento horizontal global.
- Etiquetas, ayudas y ejemplos deben ser legibles; no usar textos diminutos.
- Diálogos con foco inicial, Escape, recorrido Tab contenido y retorno del foco al botón de origen.
- Errores asociados al campo, resumen de campos faltantes con enlaces de foco y estados anunciados a tecnologías de asistencia.
- Los documentos generados deben usar texto negro para títulos, subtítulos y cuerpo, fondos suaves cuando aporten claridad y no deben contener asteriscos de Markdown.

## Arquitectura y rendimiento

- Mantener módulos pequeños: API/tipos, estado, selectores, constructores, matrices, carga de archivos y exportadores separados.
- Cargar bajo demanda las pantallas especializadas y las librerías pesadas de PDF, Word y XLSX.
- Evitar cascadas de solicitudes: cargar instrumento, aula y estudiantes en paralelo cuando sean independientes.
- Usar identificadores estables, búsquedas con valor diferido y cálculos de matrices memoizados.
- No duplicar el selector de estudiantes ni los estilos de controles existentes.

## Verificación obligatoria antes de cerrar el punto

1. Pruebas unitarias de selector, criterios, matriz Sí/No, recomendaciones y validaciones de archivos.
2. Pruebas de integración de propiedad/autorización, borradores, carga PDF/DOCX y exportación XLSX.
3. Compilación, lint y suites completas de frontend y backend sin regresiones.
4. Recorrido real en navegador: crear lista, elegir aula, marcar criterios, guardar, recargar y descargar.
5. Recorrido real de carga de un documento válido y rechazo de un archivo no permitido.
6. Revisar escritorio, tableta y móvil con A−/A/A+, tema claro y oscuro, teclado y sin desbordamiento global.
7. Comparar el resultado visible con las herramientas del proyecto anterior en cantidad y disposición de campos, conservando los colores del proyecto nuevo.

## Criterio de finalización

El punto termina únicamente cuando las herramientas descritas operan con datos reales y persistentes, la nómina central reemplaza los campos manuales donde corresponde, los archivos y exportaciones son reales, la IA aparece solo en campos pedagógicos contextuales y toda la verificación anterior está en verde.
