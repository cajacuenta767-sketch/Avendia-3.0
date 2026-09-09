# Prompt 04 — Incluimos y Reforzamos: atención diferenciada y seguimiento

## Objetivo

Convertir **Incluimos** y **Reforzamos** de Avendia 3.0 en flujos docentes completos. Se debe conservar el sistema visual actual —tema claro y oscuro, azul/violeta, barra lateral plegable, barra superior, tipografía, tarjetas y formularios— y recuperar del proyecto anterior los campos, pasos, ayudas y profundidad pedagógica, sin importar sus colores anteriores.

## Alcance obligatorio

### 1. Plan de atención inclusiva

- Ruta: `Incluimos → Plan de atención`.
- Flujo con 4 pasos: **Datos y estudiante(s) → Barreras y necesidades → Ajustes DUA/NEE → Vista previa y documento**.
- Usar la nómina central: estudiante individual, varios estudiantes o aula; no pedir nombres manuales como sustituto.
- Primer paso: docente, institución, modalidad EBR/EBA/EBE, nivel, grado/ciclo, sección, área, periodo, responsable/directivo opcional, contexto rural/urbano y modalidad de atención.
- Cada cuadro vacío debe mostrar una instrucción o ejemplo útil y real. No dejar bloques visuales vacíos ni textos genéricos.
- Segundo paso: situación inicial, fortalezas, barreras de acceso/participación/aprendizaje, necesidades educativas, evidencias de evaluación y prioridades. Ofrecer opciones seleccionables y un campo `Otra situación` editable.
- Tercer paso: medidas DUA con alternativas de representación, acción/expresión y compromiso; apoyos, ajustes razonables, recursos, responsables, familia, frecuencia y seguimiento. Debe generar como mínimo **2 páginas útiles**, y 3 cuando el docente selecciona varios tipos de ajuste.
- El botón de apoyo con IA solo debe existir para redactar diagnósticos pedagógicos, medidas DUA o seguimiento; nunca para nombres, institución, modalidad ni identificadores. El diálogo debe adaptarse al campo, ofrecer preguntas y sugerencias rápidas y dejar el resultado editable.
- Vista previa con texto negro para títulos, subtítulos y cuerpo; fondos suaves opcionales. El documento final no puede contener asteriscos Markdown.

### 2. Adaptación curricular, NEE y DUA

- Las herramientas de adaptación, NEE y DUA deben compartir el perfil educativo y usar pasos cuando el resultado requiera más de una hoja.
- Incluir propósito, competencia/capacidad/desempeño, barrera, ajuste, recurso, evidencia, criterio de logro, participación familiar y revisión programada.
- Deben existir alternativas prácticas para discapacidad, neurodiversidad, comunicación, movilidad, atención, talentos y contexto sociocultural, sin diagnosticar ni etiquetar al estudiante.
- Cada herramienta debe producir 2–3 secciones/páginas de contenido útil: diagnóstico funcional, propuesta diferenciada y seguimiento/evidencias.

### 3. Plan de refuerzo

- Ruta: `Reforzamos → Plan de refuerzo`.
- Flujo de 4 pasos: **Diagnóstico y grupo → Capacidades y desempeños → Estrategia y frecuencia → Vista previa**.
- Selección por nómina: estudiante, grupo o aula; periodo por bimestre o rango de fechas.
- Selector de capacidades y desempeños asociados a modalidad, nivel, grado y área; permitir priorizar una o varias necesidades.
- Campos con ejemplos: diagnóstico, meta observable, competencias, criterios, evidencias, actividades diferenciadas, recursos, responsables y seguimiento.
- Frecuencia de sesiones con opciones claras: 1, 2 o 3 sesiones por semana; el máximo es 3. Añadir duración, semanas de aplicación y calendario de revisión.
- Priorizar cómo se realizará el refuerzo: modelado, práctica guiada, trabajo colaborativo, estaciones, tutoría entre pares, material concreto, retroalimentación y evidencia de salida. No centrar el formulario en número de páginas.
- Generar ideas concretas, extensas y seleccionables para actividades; la IA, si se usa, solo debe proponer estrategias/contextos pedagógicos editables.

### 4. Monitoreo de avances

- Ruta: `Reforzamos → Monitoreo de avances`.
- Elegir bimestre o rango de fechas, aula/estudiantes, área, competencia, capacidades y desempeños.
- Mostrar registro por estudiante: evidencia inicial, avance, nivel actual, observación, acción siguiente y fecha de revisión.
- Filtros funcionales, estados vacíos comprensibles, resumen de estudiantes que requieren atención y exportación coherente cuando corresponda.
- Persistir cada monitoreo con propiedad del docente; permitir retomarlo desde Historial sin perder filtros ni registros.

## Persistencia, accesibilidad y calidad

- Usar contratos tipados y pertenencia estricta al docente/nómina.
- Guardado compuesto transaccional, borrador recuperable, URL con `?document=` e integración con Historial, igual que el bloque Evaluamos.
- Formularios en dos columnas en escritorio y una en móvil; matrices con desplazamiento interno, nunca horizontal global.
- Revisar A−/A/A+, claro/oscuro, teclado, foco visible y mensajes asociados a campos faltantes.
- Probar en navegador el guardado, recarga, filtros y producción de vista previa; ejecutar pruebas frontend/backend, lint y compilación.

## Criterio de finalización

El punto termina cuando Plan de atención, Adaptación/NEE/DUA, Plan de refuerzo y Monitoreo dejan de ser pantallas genéricas, conservan todos los datos relevantes del proyecto anterior, usan la nómina central, muestran ejemplos pertinentes, producen contenido real y pueden retomarse desde Historial con el diseño actual de Avendia 3.0.
