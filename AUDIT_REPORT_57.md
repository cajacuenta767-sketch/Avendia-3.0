# Bitacora Oficial de Control de Calidad y Certificacion (57 Herramientas)

Este documento registra la auditoria y certificacion real, herramienta por herramienta (del 01 al 57), con almacenamiento de archivos binarios .docx en exports-qa-word, capturas de pantalla de alta resolucion e inspeccion de apartados pedagogicos y normativos CNEB.

---

## Cuadro de Mando de Certificacion por Bloques

| N | ID de Herramienta | Nombre Oficial | Bloque | Archivo DOCX en PC | Captura HD | Estado QA | SHA-256 / Inspeccion |
|---|---|---|---|---|---|---|---|
| **01** | `recursos/ahorcado` | **Juego del Ahorcado** | B1: Recursos | `01-recursos-ahorcado.docx` | `qa-01-ahorcado-preview.png` | `[X] CERTIFICADA` | SHA256: `aa59c45d...` (12,199 B) |

---

## Detalle Quirúrgico de Auditoría por Herramienta

### Herramienta 01: Juego del Ahorcado Educativo (`recursos/ahorcado`)
- **Archivo Físico**: `exports-qa-word/01-recursos-ahorcado.docx`
- **Peso**: 12,199 bytes | **Hash SHA-256**: `aa59c45db58e032914c048b4e3fade9d7145770e13625dc8919eb78a66891f5c`
- **Captura Light**: `audit-screens/qa-01-ahorcado-preview.png`
- **Captura Dark**: `audit-screens/qa-01-ahorcado-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente. encabezado pedagógico neutral, título en mayúsculas, caja institucional con Estudiante, I.E. 0001 República del Perú, Grado 1° Primaria "A", Fecha y Área Personal Social.
  2. **Consignas Pedagógicas**: Redactadas en tono claro para 1° de Primaria ("Lee la pista, completa las casillas con letras y tacha en el abecedario. ¡Tienes 4 vidas por reto!").
  3. **Mecánica Central**: 10 retos léxicos con casillas de letras proporcionales cuadradas (`[ ][ ][ ]...`), barra de abecedario completa (`A · B · C ... Z`) y contador de vidas `[ ♥ ] [ ♥ ] [ ♥ ] [ ♥ ]`. CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia sin desbordes. Solucionario separado con `PageBreak` para no filtrarse al estudiante.
  5. **Solucionario Docente**: Tabla formal de 4 columnas (Reto N°, Pista / Adivinanza, Palabra Secreta en mayúsculas, Orientación Pedagógica formativa) con 10 filas resueltas (`ALEGRIA`, `CALMA`, `TRISTEZA`, `MIEDO`, `ENOJO`, `EMPATIA`, `RESPETO`, `ABRAZO`, `AMISTAD`, `GRATITUD`).
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En Dark Mode, la columna de palabras secretas tenía texto azul marino `#1f4d78` sobre fondo oscuro con bajo contraste, y el topbar fijo se superponía en capturas continuas.
  - *Solución*: Se migraron los estilos a clases CSS dedicadas (`.word-hangman-*`) en `word-preview.css` con variables y selectores `[data-theme="dark"]`, garantizando contraste WCAG AA (`#93c5fd` sobre `#1e3a8a` / `#0f172a`), y se aisló el topbar en la captura.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 02: Completa la Frase (`recursos/completa-frase`)
- **Archivo Físico**: `exports-qa-word/02-recursos-completa-frase.docx`
- **Peso**: 11,043 bytes | **Hash SHA-256**: `8a3768d146093f3b3c0271f1cfc58a2aca3b28028ab501e2ad28abcd9fb0a236`
- **Captura Light**: `audit-screens/qa-02-completa-frase-preview.png`
- **Captura Dark**: `audit-screens/qa-02-completa-frase-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título institucional en mayúsculas, caja para Estudiante, Grado y Sección (2° Primaria "B"), I.E. 0001 República del Perú, Fecha y Área Ciencia y Tecnología.
  2. **Consignas Pedagógicas**: Instrucción clara indicando elegir del Banco de Palabras y escribir sobre la línea punteada.
  3. **Mecánica Central**: Caja superior formal con el Banco de Palabras (`[ RAÍZ ] · [ TALLO ] · [ HOJAS ] · [ FLOR ] · [ FRUTO ] · [ SEMILLAS ] · [ CLOROFILA ] · [ FOTOSÍNTESIS ]`), seguida de 8 oraciones curriculares con líneas punteadas legibles (`_________________________`). CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Espaciado armónico, saltos de página limpios y Solucionario en página separada (`PageBreak`).
  5. **Solucionario Docente**: Tabla formal de 4 columnas (N°, Enunciado Incompleto, Palabra Clave Correcta en mayúsculas, Explicación y Fundamento Pedagógico) con las 8 oraciones resueltas y justificadas para el docente.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: Anteriormente caía en el bloque genérico `else` que renderizaba una tabla con la celda vacía `[Espacio para desarrollo]`, perdiendo la mecánica de completación y el banco de palabras.
  - *Solución*: Se implementó en `exportWorkflowDocx.ts` y `WordDocumentPreview.tsx` la rama dedicada `isCompletion` / `toolId.includes("completa")` con caja de Banco de Palabras, reemplazo regex automático para insertar líneas punteadas proporcionales, tabla de solucionario curricular y soporte completo en Dark Mode (`.word-completion-*`).
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **02** | `recursos/completa-frase` | **Completa la Frase** | B1: Recursos | `02-recursos-completa-frase.docx` | `qa-02-completa-frase-preview.png` | `[X] CERTIFICADA` | SHA256: `8a3768d1...` (11,043 B) |
### Herramienta 03: Emparejar Palabras y Glosarios (`recursos/emparejar-palabras`)
- **Archivo Físico**: `exports-qa-word/03-recursos-emparejar-palabras.docx`
- **Peso**: 10,689 bytes | **Hash SHA-256**: `1a13ffa53065efa37feacfda85fde07a3fea38b3f62e7a74a421551b47e7a989`
- **Captura Light**: `audit-screens/qa-03-emparejar-palabras-preview.png`
- **Captura Dark**: `audit-screens/qa-03-emparejar-palabras-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título institucional en mayúsculas, caja para Estudiante, Grado y Sección (3° Primaria "A"), I.E. 0001 República del Perú, Fecha y Área Personal Social.
  2. **Consignas Pedagógicas**: Indicaciones precisas solicitando relacionar Columna A y Columna B escribiendo la letra mayúscula dentro de los paréntesis vacíos `(   )`.
  3. **Mecánica Central**: Tabla de 2 columnas nítidas. Columna A (42%): lista ordenada alfabéticamente de conceptos (`A. DERECHO A LA IDENTIDAD`, `B. DERECHO A LA EDUCACIÓN`, etc.). Columna B (58%): descripciones de casos desordenadas determinísticamente con paréntesis vacíos `(       )` para respuesta del estudiante. CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Bordes nítidos, sin saltos extraños, solucionario con `PageBreak` para uso docente.
  5. **Solucionario Docente**: Tabla formal de 4 columnas (Letra, Concepto Columna A, Paréntesis Resuelto `(  A  )`, Definición Asociada Columna B) con los 6 pares resueltos y fundamentados.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: Anteriormente caía en el bloque genérico de 3 columnas que forzaba la celda `[Espacio para desarrollo]`, perdiendo la interacción de dos columnas y los paréntesis de asociación.
  - *Solución*: Se implementó la rama dedicada `isMatching` / `toolId.includes("emparejar")` con tabla dual Columna A / Columna B, permutación determinística para desordenar la columna derecha, tabla de solucionario formal y soporte en Dark Mode.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **03** | `recursos/emparejar-palabras` | **Emparejar Palabras** | B1: Recursos | `03-recursos-emparejar-palabras.docx` | `qa-03-emparejar-palabras-preview.png` | `[X] CERTIFICADA` | SHA256: `1a13ffa5...` (10,689 B) |
### Herramienta 04: Crucigramas (`recursos/crucigramas`)
- **Archivo Físico**: `exports-qa-word/04-recursos-crucigramas.docx`
- **Peso**: 12,017 bytes | **Hash SHA-256**: `71eda1dd1c32aeef1b4a2b0e17c7a4c4d91a4c1c82ca1d22da35fffc61654965`
- **Captura Light**: `audit-screens/qa-04-crucigramas-preview.png`
- **Captura Dark**: `audit-screens/qa-04-crucigramas-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título institucional en mayúsculas, caja para Estudiante, Grado y Sección (4° Primaria "A"), I.E. 0001 República del Perú, Fecha y Área Personal Social.
  2. **Consignas Pedagógicas**: Instrucción explícita de resolver pistas horizontales y verticales escribiendo una letra en cada casilla blanca según el número.
  3. **Mecánica Central**: Cuadrícula de crucigrama 10x10 con celdas cuadradas, números de referencia en esquinas de palabras iniciales y casillas bloqueadas con sombreado oscuro formal. Tabla dual de Pistas Horizontales ( $\rightarrow$ ) y Verticales ( $\downarrow$ ) numeradas. CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Cuadrícula centrada estéticamente, tabla de pistas balanceada y Solucionario en página separada (`PageBreak`).
  5. **Solucionario Docente**: Tabla formal de 5 columnas (N°, Sentido, Pista Curricular, Palabra Clave Resuelta en mayúsculas, Orientación Pedagógica) con las 8 soluciones (`COSTA`, `GRAU`, `ANDES`, `CUSCO`, `SELVA`, `AMAZONAS`, `TITICACA`, `COLCA`).
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: Anteriormente caía en el bloque genérico `else` con celda `[Espacio para desarrollo]`, careciendo por completo de cuadrícula de crucigrama y separación de pistas horizontales/verticales.
  - *Solución*: Se implementó en `exportWorkflowDocx.ts` y `WordDocumentPreview.tsx` la rama dedicada `isCrossword` / `toolId.includes("crucigrama")` con generación de matriz 10x10 de casillas numeradas y bloqueadas, tabla dual de pistas, tabla de solucionario docente y estilos dedicados en `word-preview.css` para Light y Dark Mode.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 05: Sopas de Letras (`recursos/sopas-letras`)
- **Archivo Físico**: `exports-qa-word/05-recursos-sopas-letras.docx`
- **Peso**: 11,869 bytes | **Hash SHA-256**: `af568fa0924f74ea93802c14bc16a20a9db8202f29f382522f054ff23515501b`
- **Captura Light**: `audit-screens/qa-05-sopas-letras-preview.png`
- **Captura Dark**: `audit-screens/qa-05-sopas-letras-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título institucional en mayúsculas, caja para Estudiante, Grado y Sección (5° Primaria "A"), I.E. 0001 República del Perú, Fecha y Área Ciencia y Tecnología.
  2. **Consignas Pedagógicas**: Instrucción explícita de buscar las 8 palabras en direcciones horizontal, vertical o diagonal, encerrarlas y redactar oraciones de aplicación.
  3. **Mecánica Central**: Matriz de sopa de letras 12x12 simétrica y centrada conteniendo los 8 planetas (`MERCURIO`, `VENUS`, `TIERRA`, `MARTE`, `JUPITER`, `SATURNO`, `URANO`, `NEPTUNO`), seguida de tabla de aplicación con casillas `[   ]` y líneas de trabajo para el alumno. CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Cuadrícula centrada, tabla de aplicación balanceada y Solucionario en página separada (`PageBreak`).
  5. **Solucionario Docente**: Tabla formal de 5 columnas (N°, Palabra Clave, Coordenadas Fila/Columna, Sentido de orientación y Pauta pedagógica/astronómica) para verificación inmediata del docente.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: Anteriormente la cuadrícula tenía una matriz fija con palabras genéricas de matemáticas y carecía de solucionario docente formal de coordenadas.
  - *Solución*: Se actualizó `isWordSearch` en `exportWorkflowDocx.ts` y `WordDocumentPreview.tsx` para aceptar matrices curriculares dinámicas (`artifact.activity.grid`), banco de palabras real, tabla de aplicación con líneas para el estudiante y Solucionario docente en nueva página con coordenadas de inicio y sentido.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **05** | `recursos/sopas-letras` | **Sopas de Letras** | B1: Recursos | `05-recursos-sopas-letras.docx` | `qa-05-sopas-letras-preview.png` | `[X] CERTIFICADA` | SHA256: `af568fa0...` (11,869 B) |
### Herramienta 06: Tarjetas de Estudio (`recursos/tarjetas-estudio`)
- **Archivo Físico**: `exports-qa-word/06-recursos-tarjetas-estudio.docx`
- **Peso**: 11,041 bytes | **Hash SHA-256**: `e854368f4cb91c17cb28ffdeae828961feb2012c8ed6ad32fdb17eab2ea36e50`
- **Captura Light**: `audit-screens/qa-06-tarjetas-estudio-preview.png`
- **Captura Dark**: `audit-screens/qa-06-tarjetas-estudio-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título institucional en mayúsculas, caja para Estudiante, Grado y Sección (1° Secundaria "B"), I.E. 0001 República del Perú, Fecha y Área Comunicación.
  2. **Consignas Pedagógicas**: Instrucción explícita de recortar por la línea punteada (✂), leer el concepto o pregunta del frente y comprobar con el reverso.
  3. **Mecánica Central**: Matriz de tarjetas didácticas recortables frente/dorso en dos columnas con línea punteada, encabezados en negrita (`METÁFORA`, `SÍMIL`, `HIPÉRBOLE`, `PERSONIFICACIÓN`, `ANÁFORA`, `EPÍTETO`), definiciones concisas y pistas poéticas formativas. CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Cuadrícula de tarjetas con espaciado limpio y Solucionario en página separada (`PageBreak`).
  5. **Solucionario Docente**: Tabla formal de 4 columnas (N°, Concepto/Pregunta Frente, Respuesta y Explicación Dorso, Pauta Pedagógica / Ejemplo) con las 6 tarjetas resueltas para uso del docente.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: Anteriormente la ficha Word carecía de un solucionario docente formal en página nueva que sistematizara las respuestas de las tarjetas para la evaluación rápida del profesor.
  - *Solución*: Se añadió `PageBreak()` y tabla formal de 4 columnas en `exportWorkflowDocx.ts` y se reflejó en `WordDocumentPreview.tsx` con estilos optimizados en modo claro y modo oscuro.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **06** | `recursos/tarjetas-estudio` | **Tarjetas de Estudio** | B1: Recursos | `06-recursos-tarjetas-estudio.docx` | `qa-06-tarjetas-estudio-preview.png` | `[X] CERTIFICADA` | SHA256: `e854368f...` (11,041 B) |
### Herramienta 07: Agrupar Palabras y Taxonomías (`recursos/agrupar-palabras`)
- **Archivo Físico**: `exports-qa-word/07-recursos-agrupar-palabras.docx`
- **Peso**: 10,625 bytes | **Hash SHA-256**: `b0e45991bcd3321f8d605bddf0f601587c49196eb395480b9344e5e1e86b674f`
- **Captura Light**: `audit-screens/qa-07-agrupar-palabras-preview.png`
- **Captura Dark**: `audit-screens/qa-07-agrupar-palabras-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título institucional en mayúsculas, caja para Estudiante, Grado y Sección (3° Primaria "B"), I.E. 0001 República del Perú, Fecha y Área Ciencia y Tecnología.
  2. **Consignas Pedagógicas**: Instrucción explícita de clasificar los 12 animales en las columnas según su criterio de alimentación.
  3. **Mecánica Central**: Banco de términos destacado en recuadro verde con badges de animales (`VACA`, `LEÓN`, `CERDO`, `CONEJO`, etc.), seguido de 3 columnas de categorización (`HERBÍVOROS`, `CARNÍVOROS`, `OMNÍVOROS`) con líneas de escritura punteadas legibles para el alumno. CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia, cajas de clasificación balanceadas y Solucionario en página separada (`PageBreak`).
  5. **Solucionario Docente**: Tabla formal de 4 columnas (Categoría Curricular, Criterio y Definición Biológica, Elementos Correctos Agrupados y Orientación Pedagógica) para verificación docente inmediata.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: Anteriormente en el exportador genérico caía en un bloque genérico sin banco de términos ni columnas tabulares, y en la vista previa faltaba soporte específico para visualización y descarga.
  - *Solución*: Se implementó la rama `isGrouping` en `exportWorkflowDocx.ts` y en `WordDocumentPreview.tsx`, se integró el generador dedicado `exportWordGroupingDocx.ts` y se verificó el tablero interactivo de 3 pasos en `WordGroupingTool.tsx` tanto en modo claro como en modo oscuro.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **07** | `recursos/agrupar-palabras` | **Agrupar Palabras** | B1: Recursos | `07-recursos-agrupar-palabras.docx` | `qa-07-agrupar-palabras-preview.png` | `[X] CERTIFICADA` | SHA256: `b0e45991...` (10,625 B) |
### Herramienta 08: Ordenar Bloques y Secuencias (`recursos/ordenar-bloques`)
- **Archivo Físico**: `exports-qa-word/08-recursos-ordenar-bloques.docx`
- **Peso**: 10,930 bytes | **Hash SHA-256**: `3d23a0c51f648658262ceedb7adcf8e290cce13204a7fb8ce095a67ff2a35e75`
- **Captura Light**: `audit-screens/qa-08-ordenar-bloques-preview.png`
- **Captura Dark**: `audit-screens/qa-08-ordenar-bloques-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título institucional en mayúsculas, caja para Estudiante, Grado y Sección (4° Primaria "A"), I.E. 0001 República del Perú, Fecha y Área Personal Social.
  2. **Consignas Pedagógicas**: Instrucción explícita de analizar los acontecimientos y ordenar los bloques cronológicamente del 1 al 6.
  3. **Mecánica Central**: Bloques de etapas históricas desordenados con etiqueta `✂ Bloque #`, texto pedagógico auténtico, pistas formativas y casilla cuadrada `[     ]` para que el estudiante registre su número de orden. CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación estructurada, bloques balanceados y Solucionario en página separada (`PageBreak`).
  5. **Solucionario Docente**: Tabla formal de 3 columnas (N° Orden, Acontecimiento / Bloque Oficial y Pauta Pedagógica / Criterio Temporal) con las 6 etapas ordenadas cronológicamente para verificación docente inmediata.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En el exportador genérico `exportWorkflowDocx.ts` no existía soporte para `isSequence`, y en el componente `SequenceOrderingTool.tsx` ocurría un error crítico en tiempo de ejecución: `Cannot read properties of undefined (reading 'trim')` cuando `pedagogical_rationale` o `block.hint` venían sin definir, lo que rompía la aplicación y mostraba una pantalla blanca.
  - *Solución*: Se reparó la validación en `SequenceOrderingTool.tsx` aplicando encadenamiento opcional y fallback seguro (`result.pedagogical_rationale ?? ""`), se implementó la rama `isSequence` en `exportWorkflowDocx.ts` y en `WordDocumentPreview.tsx`, y se generó y certificó el archivo DOCX físico con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **08** | `recursos/ordenar-bloques` | **Ordenar Bloques** | B1: Recursos | `08-recursos-ordenar-bloques.docx` | `qa-08-ordenar-bloques-preview.png` | `[X] CERTIFICADA` | SHA256: `3d23a0c5...` (10,930 B) |
### Herramienta 09: Dinámica de Debate en Aula (`recursos/debate-aula`)
- **Archivo Físico**: `exports-qa-word/09-recursos-debate-aula.docx`
- **Peso**: 12,473 bytes | **Hash SHA-256**: `4689976fb817cff40bb5282b6a7e0a94a83536596e7b1c60ea4a996469205189`
- **Captura Light**: `audit-screens/qa-09-debate-aula-preview.png`
- **Captura Dark**: `audit-screens/qa-09-debate-aula-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `¿SE DEBE REGULAR EL USO DE TELÉFONOS CELULARES EN LAS AULAS DE SECUNDARIA?`, cuadro para Estudiante, Grado y Sección (3° de Secundaria "A"), I.E. 0001 República del Perú, Fecha y Área DPCC.
  2. **Consignas Pedagógicas**: Moción explícita destacada en recuadro, instrucciones de argumentación rigurosa y acuerdos de convivencia democrática.
  3. **Mecánica Central**:
     - Estructura de Fases y Tiempos del Debate: Tabla formal de 4 columnas (Fase del Debate, Tiempo asignado, Rol Participante y Objetivo Pedagógico CNEB).
     - Matriz de Posturas Contrapuestas y Argumentos: Tabla de 2 columnas comparando la postura A Favor (regulación/restricción) y En Contra (integración digital activa).
     - Ficha de Observación y Registro del Estudiante / Jurado: Tabla de evaluación con criterios, líneas para notas y casillas de puntaje `[   ]`.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia, tablas de fases y posturas balanceadas, y Rúbrica en página separada (`PageBreak`).
  5. **Solucionario Docente**: Rúbrica formativa docente CNEB con 4 niveles (AD Destacado, A Esperado, B En Proceso, C En Inicio) para sustento ético, contraargumentación y competencia comunicativa oral.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportWorkflowDocx.ts` la herramienta `debate-aula` caía en el exportador genérico con cajas `[Espacio para desarrollo]` sin matriz de posturas ni fases, y en `WordDocumentPreview.tsx` no existía renderizado especializado.
  - *Solución*: Se implementó la rama `isDebate` en `exportWorkflowDocx.ts` y en `WordDocumentPreview.tsx`, se incluyó la matriz de fases, argumentos contrapuestos, ficha de jurado y rúbrica formativa CNEB, y se capturó la previsualización interactiva en Light y Dark Mode con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **09** | `recursos/debate-aula` | **Dinamica de Debate** | B1: Recursos | `09-recursos-debate-aula.docx` | `qa-09-debate-aula-preview.png` | `[X] CERTIFICADA` | SHA256: `4689976f...` (12,473 B) |
### Herramienta 10: Presentaciones Didácticas (`recursos/presentaciones-didacticas`)
- **Archivo Físico**: `exports-qa-word/10-recursos-presentaciones-didacticas.docx`
- **Peso**: 14,606 bytes | **Hash SHA-256**: `9f677b98d9f54ac32400ae7bf5d9a5b3929fd5d05de84cf2ecf3c2da865ad9a3`
- **Captura Light**: `audit-screens/qa-10-presentaciones-preview.png`
- **Captura Dark**: `audit-screens/qa-10-presentaciones-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `EL SISTEMA SOLAR Y SUS PLANETAS`, subtítulo institucional `GUION PEDAGÓGICO DE CLASE Y RECURSO VISUAL · CIENCIA Y TECNOLOGÍA`, cuadro institucional (I.E. 0001 República del Perú, Docente, Área, Nivel Primaria, Grado 5°, Estilo visual infográfico y Propósito de aprendizaje CNEB).
  2. **Consignas Pedagógicas**: Propósito explícito de identificar características físicas, composición y orden orbital de planetas rocosos y gaseosos.
  3. **Mecánica Central**: Secuencia de 5 diapositivas estructuradas en tablas formales de 2 columnas con título en mayúsculas, subtítulo, puntos clave con viñetas formateadas, cita/idea fuerza resaltada, notas detalladas de mediación docente, dirección visual para ilustraciones e interacción/dinámica activa en aula con fondo diferenciado. CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia, encabezado institucional derecho, pie de página formal con numeración «Página X de Y».
  5. **Solucionario Docente**: Notas y preguntas de mediación docente para cada diapositiva orientando la activación de saberes previos, contraste científico y ticket de salida formativo.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportPresentation.ts`, la función `exportPresentationDocx` ejecutaba directamente `anchor.click()` en el DOM sin exponer la instancia de `Document`, impidiendo la generación física independiente y rompiendo en entornos de pruebas automatizadas por falta de soporte de navegación en JSDOM.
  - *Solución*: Se desacopló y exportó la función constructora `buildPresentationDocument` en `exportPresentation.ts`, permitiendo serializar con `Packer.toBuffer` hacia el disco local y mantener `exportPresentationDocx` para descargas web. Se validó el lienzo interactivo 16:9 con carrusel de diapositivas en `PresentationTool.tsx` en Light y Dark Mode con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **10** | `recursos/presentaciones-didacticas` | **Presentaciones Didacticas** | B1: Recursos | `10-recursos-presentaciones-didacticas.docx` | `qa-10-presentaciones-preview.png` | `[X] CERTIFICADA` | SHA256: `9f677b98...` (14,606 B) |
### Herramienta 11: Casos de Estudio ABP (`recursos/casos-estudio`)
- **Archivo Físico**: `exports-qa-word/11-recursos-casos-estudio.docx`
- **Peso**: 12,018 bytes | **Hash SHA-256**: `62ca7e126bc590c82797926e326981a0c4942296cb25338edd60f66de51665e7`
- **Captura Light**: `audit-screens/qa-11-casos-estudio-preview.png`
- **Captura Dark**: `audit-screens/qa-11-casos-estudio-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `DILEMA DE LA GESTIÓN DEL AGUA Y DESARROLLO SOSTENIBLE EN EL VALLE DE SAN LORENZO`, subtítulo institucional `FICHA DE TRABAJO Y APLICACIÓN ACTIVA · PERSONAL SOCIAL`, y cuadro institucional (Estudiante, Grado y Sección 4° de Secundaria "A", I.E. 0001 República del Perú, Fecha).
  2. **Consignas Pedagógicas**: Instrucciones del caso contextualizado en estiaje severo de cuenca costera, afectación de 45,000 habitantes y dilema ético/económico entre agricultura de panllevar, agroexportación y consumo humano.
  3. **Mecánica Central**:
     - Matriz de Actores y Posiciones en Conflicto: Tabla formal de 4 columnas (Actor Social / Institución, Interés y Postura Principal, Sustento Legal y Económico [Ley N° 29338, Art. 7-A Constitución], y Propuesta de Solución).
     - Preguntas Guía de Análisis Crítico y Propuesta ABP: 4 preguntas investigativas de alta demanda cognitiva con líneas de análisis punteadas para el equipo estudiantil.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia, tablas balanceadas y Guía Metodológica Docente en página separada (`PageBreak`).
  5. **Solucionario Docente**: Guía metodológica docente con rúbrica ABP para evaluar comprensión multicausal, ponderación ética y legal, y viabilidad técnica y ciudadana de la propuesta.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportWorkflowDocx.ts` la herramienta `casos-estudio` caía en el exportador genérico con cajas `[Espacio para desarrollo]` sin matriz de actores ni preguntas ABP, y en `WordDocumentPreview.tsx` no existía el renderizado interactivo del caso de estudio.
  - *Solución*: Se implementó la rama `isCaseStudy` en `exportWorkflowDocx.ts` y en `WordDocumentPreview.tsx`, se incluyó la matriz de actores, preguntas guía ABP y pauta de evaluación formativa docente, y se capturó la previsualización en Light y Dark Mode con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **11** | `recursos/casos-estudio` | **Casos de Estudio ABP** | B1: Recursos | `11-recursos-casos-estudio.docx` | `qa-11-casos-estudio-preview.png` | `[X] CERTIFICADA` | SHA256: `62ca7e12...` (12,018 B) |
### Herramienta 12: Banco de Recursos para Planificar (`recursos/banco-planificacion`)
- **Archivo Físico**: `exports-qa-word/12-recursos-banco-planificacion.docx`
- **Peso**: 12,921 bytes | **Hash SHA-256**: `2c84a32fb91922d31b97b062fc577a5eaeb02c0cf74f99d2dae614b765ec0e8d`
- **Captura Light**: `audit-screens/qa-12-banco-recursos-preview.png`
- **Captura Dark**: `audit-screens/qa-12-banco-recursos-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `BANCO CURRICULAR DE RECURSOS DIDÁCTICOS: COMPRENSIÓN LECTORA Y ENSAYOS ARGUMENTATIVOS`, subtítulo con Área Comunicación, Nivel Secundaria, Grado 2° y Sección "A", y tabla de datos informativos completa (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área, Docente Responsable, Director, Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Propósito general y fundamentación curricular orientada a la argumentación crítica y comprensión lectora bajo el enfoque CNEB.
  3. **Mecánica Central**:
     - Catálogo de Recursos Pedagógicos Seleccionados: Fichas de lectura crítica, organizadores visuales, guías de redacción paso a paso y portafolio de evidencias.
     - Matriz de Articulación Curricular y Desempeños: Competencias del Ciclo VI y enfoques transversales (Bien común y Ambiental).
     - Orientaciones de Adaptación DUA y Diversificación: 3 principios DUA (representación, acción/expresión e implicación).
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para la revisión docente y bloque formal de doble firma (Docente Responsable y Dirección/Equipo Directivo).
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportWorkflowDocx.ts`, la función constructora `buildDocumentDocx` no estaba exportada (lo que forzaba el uso del exportador asíncrono con navegación web y producía error en tests), carecía de encabezado y pie de página con paginación formal `PageNumber.CURRENT` / `PageNumber.TOTAL_PAGES`.
  - *Solución*: Se exportó `buildDocumentDocx` (así como `buildInstrumentDocx`, `buildAnalyticsDocx` y `buildCommunicationDocx`), se añadieron encabezados institucionales y numeración de página formal CNEB, y se capturó la previsualización interactiva en Light y Dark Mode con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **12** | `recursos/banco-planificacion` | **Banco de Recursos** | B1: Recursos | `12-recursos-banco-planificacion.docx` | `qa-12-banco-recursos-preview.png` | `[X] CERTIFICADA` | SHA256: `2c84a32f...` (12,921 B) |
### Herramienta 13: Normativa Educativa (`recursos/normativa-educativa`)
- **Archivo Físico**: `exports-qa-word/13-recursos-normativa-educativa.docx`
- **Peso**: 13,003 bytes | **Hash SHA-256**: `c24e876908b9ffd347cee77db2abb7613210c815e4a150df452f050ae94c25a9`
- **Captura Light**: `audit-screens/qa-13-normativa-preview.png`
- **Captura Dark**: `audit-screens/qa-13-normativa-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `SÍNTESIS Y MARCO NORMATIVO MINEDU: EVALUACIÓN FORMATIVA Y PROMOCIÓN GUIADA (RVM N° 094-2020-MINEDU)`, subtítulo institucional `EDUCACIÓN BÁSICA · NIVEL: SECUNDARIA · GRADO: 1° A 5° DE SECUNDARIA "TODAS"`, y tabla de datos informativos completa (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área, Docente Responsable, Director, Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Fundamentación técnico-jurídica formal sobre la RVM N° 094-2020-MINEDU y la Ley General de Educación N° 28044 orientada a la consistencia pedagógica y seguridad jurídica docente.
  3. **Mecánica Central**:
     - Marco Legal Vigente y Jerarquía Normativa: Detalle de la Ley N° 28044, RVM N° 094-2020-MINEDU, resoluciones anuales y Ley N° 29719 de convivencia escolar.
     - Disposiciones Clave sobre Evaluación Formativa y Retroalimentación: Criterios, escalas cualitativas (AD, A, B, C) e informes descriptivos obligatorios.
     - Protocolo de Aplicación en el Aula y Promoción Acompañada: Conclusiones descriptivas, adaptaciones DUA y carpetas de recuperación pedagógica.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para la revisión docente con protocolos de verificación en Gob.pe y bloque formal de doble firma (Docente Responsable y Dirección/Equipo Directivo).
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `tools.ts` y `workflows.ts`, el identificador de la herramienta es `normativa-educativa` y su ruta es `/dashboard/recursos/normativa-educativa`. Se requería validar que el visor `legacy-viewer` cargara correctamente el draft curricular en `WorkflowTool.tsx` sin redirecciones ni discrepancias de esquema.
  - *Solución*: Se generó el documento DOCX con la arquitectura `buildDocumentDocx`, se verificó la ausencia de marcadores vacíos, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **13** | `recursos/normativa-educativa` | **Normativa Educativa** | B1: Recursos | `13-recursos-normativa-educativa.docx` | `qa-13-normativa-preview.png` | `[X] CERTIFICADA` | SHA256: `c24e8769...` (13,003 B) |
### Herramienta 14: Libros y Guías MINEDU (`recursos/libros-guia-minedu`)
- **Archivo Físico**: `exports-qa-word/14-recursos-libros-guia-minedu.docx`
- **Peso**: 13,328 bytes | **Hash SHA-256**: `4bef4ae35c1edcea666b9c93db1fa001fd34495a6c8fc09f4df4863de3efc67a`
- **Captura Light**: `audit-screens/qa-14-libros-minedu-preview.png`
- **Captura Dark**: `audit-screens/qa-14-libros-minedu-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `GUÍA PEDAGÓGICA Y USO DIDÁCTICO DE MATERIALES MINEDU: RESOLVAMOS PROBLEMAS 1 (MATEMÁTICA)`, subtítulo institucional `PERSONAL SOCIAL · NIVEL: SECUNDARIA · GRADO: 1° DE SECUNDARIA "A"`, y tabla de datos informativos completa (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área, Docente Responsable, Director, Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Fundamentación y dosificación curricular para integrar las fichas de trabajo del MINEDU ("Resolvamos Problemas 1") con el desarrollo de competencias de cantidad en 1° de Secundaria.
  3. **Mecánica Central**:
     - Ficha Técnica y Referencias Bibliográficas Oficiales MINEDU: Texto escolar, Cuaderno de Trabajo (Ficha 4, Páginas 45-56), Guía Docente y repositorio PerúEduca.
     - Articulación Curricular y Desempeños Priorizados: Competencia de cantidad y desempeños de fracciones, decimales y porcentajes.
     - Secuencia Metodológica de Integración en el Aula: Momentos didácticos claros (Inicio 15 min, Desarrollo 60 min con regletas y Cierre 15 min).
     - Adaptaciones DUA y Andamiajes Didácticos: Cuadrículas de 10x10, nivelación con fichas complementarias y problemas abiertos de investigación.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para la revisión docente (monitoreo de estrategias heurísticas, metacognición) y bloque formal de doble firma (Docente Responsable y Dirección/Equipo Directivo).
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportWorkflowDocx.ts`, las herramientas de consulta bibliográfica y curricular requerían un exportador limpio que respetara la estructura formal MINEDU con encabezados, pie de página formal y tablas informativas sin campos vacíos.
  - *Solución*: Se utilizó `buildDocumentDocx` con la estructura curricular completa, se verificó la ausencia total de marcadores aleatorios, se capturó la pantalla en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **14** | `recursos/libros-guia-minedu` | **Libros y Guias MINEDU** | B1: Recursos | `14-recursos-libros-guia-minedu.docx` | `qa-14-libros-minedu-preview.png` | `[X] CERTIFICADA` | SHA256: `4bef4ae3...` (13,328 B) |
### Herramienta 15: Canales y Recursos Audiovisuales (`recursos/canales-audiovisuales`)
- **Archivo Físico**: `exports-qa-word/15-recursos-canales-audiovisuales.docx`
- **Peso**: 13,332 bytes | **Hash SHA-256**: `b48f7ff938a485162960501435eb193d290cfe5dba1ecd0bd1c47f20cf0244b7`
- **Captura Light**: `audit-screens/qa-15-canales-audio-preview.png`
- **Captura Dark**: `audit-screens/qa-15-canales-audio-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `CURADURÍA AUDIOVISUAL Y GUÍA DE OBSERVACIÓN ACTIVA: ECOSISTEMAS DEL PERÚ Y BIODIVERSIDAD`, subtítulo institucional `PERSONAL SOCIAL · NIVEL: PRIMARIA · GRADO: 3° DE PRIMARIA "A"`, y tabla de datos informativos completa (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área, Docente Responsable, Director, Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Fundamentación de mediación activa para el desarrollo de la competencia de Ciencia y Tecnología en 3° de Primaria.
  3. **Mecánica Central**:
     - Canales Educativos y Videos Curados Recomendados: Fuentes oficiales verificadas (SERNANP Oficial, TVPerú Educa, Curiosamente Kids, Aprendo en Casa MINEDU).
     - Criterios de Calidad Pedagógica y Accesibilidad DUA: Rigor curricular, subtítulos en español para inclusión auditiva y entornos seguros sin anuncios.
     - Estrategia de Mediación (Antes, Durante y Después): Secuencia didáctica dosificada (activación de saberes, pausas activas reflexivas y fichas de consolidación).
     - Preguntas Guía para el Pensamiento Crítico Infantil: Preguntas socráticas de análisis ecológico.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para la revisión docente (previsualización, condiciones técnicas y conexión con proyectos vivenciales) y bloque formal de doble firma (Docente Responsable y Dirección/Equipo Directivo).
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: Los recursos audiovisuales requerían una estructura de guía de mediación docente formal con pautas pedagógicas antes/durante/después y preguntas de criticidad, evitando enlaces rotos o descripciones vacías.
  - *Solución*: Se generó el documento DOCX oficial con `buildDocumentDocx`, se verificó la ausencia de marcadores vacíos, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **15** | `recursos/canales-audiovisuales` | **Recursos Audiovisuales** | B1: Recursos | `15-recursos-canales-audiovisuales.docx` | `qa-15-canales-audio-preview.png` | `[X] CERTIFICADA` | SHA256: `b48f7ff9...` (13,332 B) |

---

## RESUMEN DE CIERRE DEL BLOQUE 1: RECURSOS DIDÁCTICOS (Herramientas 01 a 15)
- **Total Herramientas Bloque 1**: 15 / 15 (100% Completado).
- **Archivos DOCX Físicos Generados e Inspeccionados**: 15 archivos en `exports-qa-word/`.
- **Capturas de Pantalla HD (Light y Dark)**: 30 capturas en `audit-screens/`.
- **Ocurrencias de `[Espacio para desarrollo]`**: 0 (CERO en todo el bloque).
- **Estado de Bloque**: **FINALIZADO Y CERTIFICADO PARA VALIDACIÓN HUMANA**.

---

## BLOQUE 2: PLANIFICAMOS (Herramientas 16 a 23)

### Herramienta 16: Plan Curricular Anual - PCA (`planificamos/plan-curricular-anual`)
- **Archivo Físico**: `exports-qa-word/16-planificamos-plan-curricular-anual.docx`
- **Peso**: 21,784 bytes | **Hash SHA-256**: `4db4260adf8160ce319d9a8fcb51df07fef6601beae6f529c9a47f3f50e350a8`
- **Captura Light**: `audit-screens/qa-16-plan-anual-preview.png`
- **Captura Dark**: `audit-screens/qa-16-plan-anual-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `PLANIFICACIÓN CURRICULAR ANUAL 2026`, subtítulo institucional `ÁREA: MATEMÁTICA · NIVEL: SECUNDARIA · GRADO: 3° DE SECUNDARIA "A"`, y tabla de información general con 14 filas completas (DRE, UGEL, I.E., Nivel, Ciclo/Grado, Sección, Modalidad EBR, Turno, Área, Horas semanales, Docente, Directora, Subdirector y Tiempo de ejecución).
  2. **Consignas Pedagógicas**: Justificación curricular, necesidades de aprendizaje, perfil de egreso del Ciclo VII, propósitos anuales por competencia, vínculos interdisciplinarios, características biopsicosociales del estudiante y contexto socioproductivo.
  3. **Mecánica Central**:
     - 17 tablas formales de planificación ministerial CNEB.
     - Diagnóstico y metas de aprendizaje con porcentajes de logro (Inicio, Proceso, Logrado, Destacado).
     - Organización de 8 unidades didácticas bimestrales con situaciones significativas, ejes y duraciones exactas.
     - Matriz de demandas educativas, causas y alternativas comunales.
     - Competencias transversales (TIC y autonomía) y matriz de 7 enfoques transversales con actitudes observables.
     - Plan de Tutoría y Orientación Educativa (TOE) con dimensiones y cronograma anual.
     - Sistema de evaluación formativa y escalas cualitativas ministeriales (AD, A, B, C).
     - Recursos, materiales y bibliografía oficial diferenciada para docente y estudiante.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia, tablas formateadas con bordes nítidos, cabeceras sombreadas y saltos de sección ordenados.
  5. **Solucionario Docente**: Orientaciones técnicas de retroalimentación formativa y bloque formal de doble firma (Prof. Manuel Cárdenas Vega - Docente Responsable y Lic. Rosa Alvarado Torres - Directora/Equipo Directivo).
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `WordDocumentPreview.tsx`, el Plan Curricular Anual posee un visor de alta especialización (`PlanAnualDocumentPreview`) con 17 tablas pedagógicas. Se verificó que el selector `.word-document-paper` estuviera sincronizado con el renderizado real tanto en modo claro como en modo oscuro.
  - *Solución*: Se generó el documento DOCX oficial mediante `buildPlanAnualDocxDocument`, se inspeccionó la integridad de las 17 tablas y 40 párrafos con Python, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **16** | `planificamos/plan-curricular-anual` | **Plan Curricular Anual (PCA)** | B2: Planificamos | `16-planificamos-plan-curricular-anual.docx` | `qa-16-plan-anual-preview.png` | `[X] CERTIFICADA` | SHA256: `4db4260a...` (21,784 B) |
### Herramienta 17: Unidad de Aprendizaje (`planificamos/unidad-aprendizaje`)
- **Archivo Físico**: `exports-qa-word/17-planificamos-unidad-aprendizaje.docx`
- **Peso**: 13,822 bytes | **Hash SHA-256**: `b764033364aadbe1b641ccc02471eba0e8f78807b9fad309cfc2bc6d4a855770`
- **Captura Light**: `audit-screens/qa-17-unidad-aprendizaje-preview.png`
- **Captura Dark**: `audit-screens/qa-17-unidad-aprendizaje-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `UNIDAD DE APRENDIZAJE N° 02: PROMOVEMOS EL CONSUMO RESPONSABLE Y EL CUIDADO DEL AGUA EN NUESTRA COMUNIDAD`, subtítulo institucional `ÁREA: COMUNICACIÓN · NIVEL: SECUNDARIA · GRADO: 3° DE SECUNDARIA "A"`, y tabla de información general con 8 filas completas (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área, Docente Responsable, Director y Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Fundamentación y propósito general de la unidad didáctica de 4 semanas enfocada en la producción y difusión de un manifiesto juvenil y una infografía comunitaria bajo el CNEB.
  3. **Mecánica Central**:
     - Situación Significativa y Desafío del Contexto: Problemática hídrica comunal en época de sequía, preguntas retadoras y producto integrador.
     - Matriz de Propósitos de Aprendizaje: Competencias comunicativas (Lee y Escribe), competencia transversal de autonomía y enfoques Ambiental y Bien Común.
     - Secuencia Didáctica de 5 Sesiones Articuladas: Momentos claros de activación, lectura crítica, textualización, coevaluación entre pares y socialización comunitaria.
     - Criterios de Evaluación, Evidencias e Instrumentos: Lista de cotejo, ficha de observación y rúbrica analítica de desempeño.
     - Adaptaciones Curriculares DUA: 3 principios DUA para inclusión educativa.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para la revisión docente (articulación interdisciplinaria, acuerdos en el hogar, registro auxiliar) y bloque formal de doble firma (Docente Responsable y Dirección/Equipo Directivo).
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la unidad de aprendizaje tiene 4 etapas (`legacy-data`, `legacy-content`, `legacy-generate`, `legacy-document`). Para renderizar el visor Word directamente, el borrador debía encontrarse en el step 3 (`legacy-document`).
  - *Solución*: Se configuró el step final en el inyector del borrador, se generó el DOCX mediante `buildDocumentDocx` verificando la ausencia de campos vacíos, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **17** | `planificamos/unidad-aprendizaje` | **Unidad de Aprendizaje** | B2: Planificamos | `17-planificamos-unidad-aprendizaje.docx` | `qa-17-unidad-aprendizaje-preview.png` | `[X] CERTIFICADA` | SHA256: `b7640333...` (13,822 B) |
### Herramienta 18: Sesión de Aprendizaje (`planificamos/sesion-aprendizaje`)
- **Archivo Físico**: `exports-qa-word/18-planificamos-sesion-aprendizaje.docx`
- **Peso**: 13,990 bytes | **Hash SHA-256**: `4a076ecae16308a7065754acde30310d0aae77746be8d41d69e71559cb5c7da7`
- **Captura Light**: `audit-screens/qa-18-sesion-aprendizaje-preview.png`
- **Captura Dark**: `audit-screens/qa-18-sesion-aprendizaje-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `SESIÓN DE APRENDIZAJE N° 04: IDENTIFICAMOS TESIS Y ARGUMENTOS EN ENSAYOS SOBRE BIODIVERSIDAD`, subtítulo institucional `ÁREA: COMUNICACIÓN · NIVEL: SECUNDARIA · GRADO: 2° DE SECUNDARIA "A"`, y tabla de información general con 8 filas completas (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área, Docente Responsable, Director y Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Fundamentación y propósito general de la sesión pedagógica de 90 minutos diseñada para 2° de Secundaria en el área de Comunicación, orientada a desarrollar la lectura crítica y la discriminación entre posturas, tesis y evidencias bajo el enfoque CNEB.
  3. **Mecánica Central**:
     - Tabla Oficial de Secuencia Didáctica y Procesos Pedagógicos: 3 momentos claros (INICIO: 15-20 min, DESARROLLO: 55-60 min, CIERRE: 10-15 min) con mediación activa docente y procesos pedagógicos.
     - Propósitos de Aprendizaje y Criterios de Evaluación CNEB: Competencia, 3 capacidades precisadas y enfoques transversal ambiental y bien común.
     - Procesos Didácticos del Área de Comunicación: Antes, durante y después de la lectura con técnicas de sumillado, subrayado cromático y árbol de tesis.
     - Evidencia de Aprendizaje e Instrumento: Árbol de tesis completado y Lista de Cotejo Formativa con retroalimentación reflexiva.
     - Adaptaciones Curriculares DUA: Ajustes razonables según los 3 principios DUA.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones técnicas de mediación docente ante confusiones frecuentes de los estudiantes y bloque formal de doble firma (Docente Responsable y Dirección/Equipo Directivo).
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la sesión de aprendizaje posee 6 etapas (`legacy-data`, `legacy-course`, `legacy-competencies`, `legacy-approaches`, `legacy-generate`, `legacy-document`). La visualización completa de la hoja Word requiere ubicarse en el step 5 (`legacy-document`).
  - *Solución*: Se ajustó el stepper del borrador a step 5, se verificó la generación de la tabla de 3 momentos didácticos mediante `buildDocumentDocx` (con `isSession` activo), se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **18** | `planificamos/sesion-aprendizaje` | **Sesión de Aprendizaje** | B2: Planificamos | `18-planificamos-sesion-aprendizaje.docx` | `qa-18-sesion-aprendizaje-preview.png` | `[X] CERTIFICADA` | SHA256: `4a076eca...` (13,990 B) |
### Herramienta 19: Situación Significativa (`planificamos/situacion-significativa`)
- **Archivo Físico**: `exports-qa-word/19-planificamos-situacion-significativa.docx`
- **Peso**: 14,081 bytes | **Hash SHA-256**: `fac880714271c78d41fa0ff8ae7b5d58d0ab2a8101f3029fb84266c27d4870b3`
- **Captura Light**: `audit-screens/qa-19-situacion-significativa-preview.png`
- **Captura Dark**: `audit-screens/qa-19-situacion-significativa-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `SITUACIÓN SIGNIFICATIVA 2026: FORTALECEMOS LA SEGURIDAD ALIMENTARIA Y REVALORAMOS LOS CULTIVOS ANCESTRALES EN LAMAS`, subtítulo institucional `ÁREA: PERSONAL SOCIAL · NIVEL: SECUNDARIA · GRADO: 3° DE SECUNDARIA "A"`, y tabla de información general con 8 filas completas (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área, Docente Responsable, Director y Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Fundamentación y propósito general de la situación significativa contextualizada para 3° de Secundaria, orientada a movilizar competencias de indagación científica, construcción histórica y producción escrita frente a la malnutrición infantil y el abandono de cultivos nativos en Lamas.
  3. **Mecánica Central**:
     - Caracterización del Contexto Sociocultural y Diagnóstico de la Problemática: Agrobiodiversidad de Lamas, abandono de saberes y aumento de ultraprocesados en quioscos escolares.
     - Formulación del Reto y Preguntas Provocadoras: Pregunta central de impacto y subpreguntas de indagación científica, sociohistórica y comunicativa.
     - Justificación Pedagógica y Articulación con el Perfil de Egreso: Aprendizaje basado en indagación y resolución de problemas auténticos.
     - Matriz de Competencias y Enfoques Transversales Articulados: Ciencia y Tecnología, Ciencias Sociales, Comunicación y DPCC con Enfoques Intercultural y Ambiental.
     - Producto Integrador y Evaluación Auténtica: Guía Gastronómica y Nutricional Comunitaria con Rúbrica Analítica Holística ministerial.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para alianzas comunales (posta médica, asociación de agricultores, respeto ético a la tradición oral) y bloque formal de doble firma (Docente Responsable y Dirección/Equipo Directivo).
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la situación significativa posee 5 etapas (`legacy-context`, `legacy-challenge`, `legacy-purpose`, `legacy-product`, `legacy-document`). Para que el visor Word se muestre inmediatamente en el navegador, el borrador debía colocarse en el step 4 (`legacy-document`).
  - *Solución*: Se configuró el step final del workflow en el inyector, se generó el DOCX formal con `buildDocumentDocx`, se inspeccionó con Python verificando cero textos prohibidos, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **19** | `planificamos/situacion-significativa` | **Situación Significativa** | B2: Planificamos | `19-planificamos-situacion-significativa.docx` | `qa-19-situacion-significativa-preview.png` | `[X] CERTIFICADA` | SHA256: `fac88071...` (14,081 B) |
### Herramienta 20: Proyectos Integrados ABP (`planificamos/proyectos-integrados`)
- **Archivo Físico**: `exports-qa-word/20-planificamos-proyectos-integrados.docx`
- **Peso**: 14,319 bytes | **Hash SHA-256**: `b58f2061cd934b544a89a4c5c488889c7fe3b58d7899f7b15fe5e18fd89fb083`
- **Captura Light**: `audit-screens/qa-20-proyectos-integrados-preview.png`
- **Captura Dark**: `audit-screens/qa-20-proyectos-integrados-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `PROYECTO INTEGRADOR INTERDISCIPLINARIO ABP: ECOSISTEMAS SOSTENIBLES Y BIOHUERTO AUTOMATIZADO ESCOLAR`, subtítulo institucional `EDUCACIÓN BÁSICA · NIVEL: SECUNDARIA · GRADO: 4° DE SECUNDARIA "A Y B"`, y tabla de información general con 8 filas completas (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área, Docente Responsable [Equipo Colegiado Interdisciplinar], Director y Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Fundamentación y propósito general del proyecto ABP de 6 semanas de duración para 4° de Secundaria, articulando Ciencia y Tecnología, Matemática, Educación para el Trabajo (EPT) y Comunicación para diseñar e implementar un sistema de biohuerto con riego tecnificado por goteo y compostaje orgánico.
  3. **Mecánica Central**:
     - Identidad del Proyecto y Situación Desafiante Auténtica: Pregunta motriz desafiante, duración de 6 semanas (30 horas pedagógicas) y 12 equipos cooperativos.
     - Matriz de Propósitos y Competencias Interdisciplinarias CNEB: CyT (Diseña soluciones tecnológicas), Matemática (Forma, movimiento y localización), EPT (Gestión de proyectos de emprendimiento) y Comunicación (Se comunica oralmente), con Enfoques Ambiental y Búsqueda de la Excelencia.
     - Ruta Metodológica y Secuencia de 5 Fases ABP: Inmersión y diagnóstico, Ideación y modelado técnico, Construcción y montaje, Experimentación/registro fenológico, y Evaluación/Feria tecnológica escolar.
     - Roles del Equipo Docente, Estudiantes y Alianzas Estratégicas: Trabajo colegiado (GIA), roles rotativos estudiantiles y alianzas con MIDAGRI, Municipalidad y APAFA.
     - Sistema de Evaluación Formativa y Criterios Integrados: Rúbrica de solución tecnológica, lista de cotejo técnica, escala valorativa de costos y rúbrica de expresión oral.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Recomendaciones para visitas de campo, rol de guardianía escolar y postulación al concurso nacional FONDEP, con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, proyectos integrados tiene 5 etapas (`legacy-context`, `legacy-competencies`, `legacy-phases`, `legacy-generate`, `legacy-document`). Para que el visor de documento Word se abra directamente, el borrador debía encontrarse en step 4 (`legacy-document`).
  - *Solución*: Se fijó `currentStep: 4` en el script inyector, se generó el DOCX mediante `buildDocumentDocx` verificando la articulación interdisciplinaria, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **20** | `planificamos/proyectos-integrados` | **Proyectos Integrados ABP** | B2: Planificamos | `20-planificamos-proyectos-integrados.docx` | `qa-20-proyectos-integrados-preview.png` | `[X] CERTIFICADA` | SHA256: `b58f2061...` (14,319 B) |
### Herramienta 21: Adaptación Inclusiva NEE DUA (`planificamos/adaptacion-nee-dua`)
- **Archivo Físico**: `exports-qa-word/21-planificamos-adaptacion-nee-dua.docx`
- **Peso**: 14,320 bytes | **Hash SHA-256**: `0eb2b50fb9094b77ce59d5f65241e6d174d7b10dcba3464615c4e80c42852094`
- **Captura Light**: `audit-screens/qa-21-adaptacion-nee-dua-preview.png`
- **Captura Dark**: `audit-screens/qa-21-adaptacion-nee-dua-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `PLAN DE ADAPTACIÓN CURRICULAR INCLUSIVA Y MATRIZ DUA: TRASTORNO DEL ESPECTRO AUTISTA (TEA GRADO 1) Y DIFICULTADES ESPECÍFICAS DE APRENDIZAJE`, subtítulo institucional `PERSONAL SOCIAL · NIVEL: SECUNDARIA · GRADO: 2° DE SECUNDARIA "A"`, y tabla de información general con 8 filas completas (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área, Docente Responsable [Prof. Manuel Cárdenas / Equipo SAANEE], Director y Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Fundamentación técnico pedagógica de diversificación e inclusión educativa diseñada bajo los lineamientos del Diseño Universal para el Aprendizaje (DUA) y la RVM 222-2021-MINEDU para eliminar barreras y garantizar la participación plena de estudiantes con NEE asociadas a TEA Grado 1 en 2° de Secundaria.
  3. **Mecánica Central**:
     - Caracterización del Estudiante, Fortalezas y Barreras BAP: Fortalezas en memoria visual y barreras sensoriales, cognitivas y sociales ante consignas no estructuradas.
     - Matriz de los Tres Principios DUA: Principio I (Compromiso y motivación con horarios visuales y pausas activas), Principio II (Representación accesible con tipografía nítida y esquemas previos) y Principio III (Acción y expresión flexible con infografías y formatos multimodales).
     - Adaptaciones Curriculares Específicas en Desempeños y Criterios: Fragmentación en microentregables para Comunicación, apoyo de fórmulas y calculadora en Matemática, y tiempo adicional del 25%.
     - Acompañamiento en Aula y Tutoría entre Pares: Compañero tutor de apoyo, espacio de autorregulación sensorial y contrato conductual anticipado.
     - Articulación con Familia y SAANEE: Protocolo de pautas para el hogar, reuniones técnicas mensuales y bitácora quincenal de progreso.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Recomendaciones para anticipar cambios de horario con 24 horas de antelación, evitar lecturas orales improvisadas y sensibilizar al grupo aula, con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la adaptación NEE DUA tiene 5 etapas (`legacy-diagnosis`, `legacy-dua`, `legacy-adjustments`, `legacy-family`, `legacy-document`). Para que el visor de documento Word se abra directamente, el borrador debía encontrarse en step 4 (`legacy-document`).
  - *Solución*: Se configuró `currentStep: 4` en el inyector, se generó el DOCX formal con `buildDocumentDocx`, se inspeccionó la ausencia total de campos vacíos con Python, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **21** | `planificamos/adaptacion-nee-dua` | **Adaptación Inclusiva NEE DUA** | B2: Planificamos | `21-planificamos-adaptacion-nee-dua.docx` | `qa-21-adaptacion-nee-dua-preview.png` | `[X] CERTIFICADA` | SHA256: `0eb2b50f...` (14,320 B) |
### Herramienta 22: Tarea de Extensión y Hogar (`planificamos/tarea-extension-hogar`)
- **Archivo Físico**: `exports-qa-word/22-planificamos-tarea-extension.docx`
- **Peso**: 14,064 bytes | **Hash SHA-256**: `930acc92252225ce239fd45949bb2e9f87389888dc1740416efb68a233553359`
- **Captura Light**: `audit-screens/qa-22-tarea-extension-preview.png`
- **Captura Dark**: `audit-screens/qa-22-tarea-extension-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `TAREA DE EXTENSIÓN Y CONEXIÓN CON EL HOGAR: REGISTRO DE HÁBITOS DE CONSUMO ENERGÉTICO FAMILIAR`, subtítulo institucional `ÁREA: CIENCIA Y TECNOLOGÍA · NIVEL: SECUNDARIA · GRADO: 1° DE SECUNDARIA "A"`, y tabla de información general con 8 filas completas (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área, Docente Responsable, Director y Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Actividad de aprendizaje autónomo y vinculación familiar diseñada para 1° de Secundaria que articula Ciencia y Tecnología con Matemática, orientada a que los estudiantes registren, analicen y calculen el consumo eléctrico de su vivienda durante 3 días para acordar compromisos de eficiencia energética en familia bajo el enfoque CNEB.
  3. **Mecánica Central**:
     - Propósito de Aprendizaje y Vinculación Curricular: Competencia CyT (Explica el mundo físico), Matemática (Cantidad y proporcionalidad), Autonomía y Enfoque Ambiental.
     - Consigna de Trabajo Autónomo Paso a Paso: 4 pasos estructurados (inventario de 4 artefactos en watts/kW, registro de 3 días, cálculo de kWh con tarifa local y formulación de acuerdos familiares).
     - Materiales Accesibles y Apoyos DUA: Recursos del hogar sin costo, plantilla de recibo modelo y flexibilidad de formatos.
     - Orientaciones y Rol Pedagógico de la Familia: Supervisar lectura técnica sin resolver los cálculos, propiciar diálogo reflexivo y firmar el acta de acuerdos.
     - Criterios de Evaluación y Autoevaluación Metacognitiva: 4 criterios formativos precisos y preguntas metacognitivas.
     - CERO ocurrencias de `[Espacio para desarrollo]` (sustituido por líneas nítidas de evidencia del estudiante).
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Recomendaciones docentes para comparación inicial en aula, reconocimiento de iniciativas de ahorro de huella de carbono y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `WordDocumentPreview.tsx` (L1438) y en `exportWorkflowDocx.ts` (L2448), el bloque de actividades genérico generaba la etiqueta literal `[Espacio para desarrollo]`. Asimismo, `tarea-extension-hogar` estaba clasificada erróneamente bajo actividades lúdicas cuando constituye un documento curricular integral.
  - *Solución*: Se erradicó el texto prohibido `[Espacio para desarrollo]` en todo el frontend, reemplazándolo por líneas guiadas de respuesta del estudiante. Se enrutó `tarea-extension-hogar` al constructor curricular `buildDocumentDocx` garantizando la estructura formal de 5 apartados y se revalidó la paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **22** | `planificamos/tarea-extension-hogar` | **Tarea de Extensión y Hogar** | B2: Planificamos | `22-planificamos-tarea-extension.docx` | `qa-22-tarea-extension-preview.png` | `[X] CERTIFICADA` | SHA256: `930acc92...` (14,064 B) |
### Herramienta 23: Carpeta Pedagógica Oficial (`planificamos/carpeta-pedagogica`)
- **Archivo Físico**: `exports-qa-word/23-planificamos-carpeta-pedagogica.docx`
- **Peso**: 14,451 bytes | **Hash SHA-256**: `2a10072fb3eba3ae3330914863ea8683cc428185ef04bdad188d554a204ff5aa`
- **Captura Light**: `audit-screens/qa-23-carpeta-pedagogica-preview.png`
- **Captura Dark**: `audit-screens/qa-23-carpeta-pedagogica-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `CARPETA PEDAGÓGICA INSTITUCIONAL 2026: PORTAFOLIO OFICIAL DE GESTIÓN DOCENTE Y DESEMPEÑO CNEB`, subtítulo institucional `EDUCACIÓN BÁSICA · NIVEL: SECUNDARIA · GRADO: 3° DE SECUNDARIA "A"`, y tabla de información general con 8 filas completas (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área, Docente Responsable, Director y Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Portafolio oficial y sistemático de gestión curricular, pedagógica y tutorial para el año lectivo 2026, estructurado bajo las orientaciones del Marco de Buen Desempeño Docente (MBDD) y las normativas vigentes del MINEDU para optimizar los procesos de mediación, acompañamiento formativo y evaluación continua de los aprendizajes.
  3. **Mecánica Central**:
     - Ideario, Marco Ético y Filosofía Pedagógica del Docente: Misión pedagógica, visión y valores de justicia y excelencia bajo el MBDD.
     - Calendarización Anual y Semanas de Gestión: Programación de 4 bimestres lectivos y 7 semanas de gestión alineadas a la RVM N° 587-2023-MINEDU.
     - Comisiones Institucionales y Comités de Gestión Escolar: Coordinación pedagógica, brigada ambiental/riesgos y tutoría de aula.
     - Diagnóstico de Aula y Caracterización de Aprendizajes: Distribución de estilos de aprendizaje (visual, kinestésico, auditivo) y atención inclusiva DUA.
     - Acuerdos de Convivencia Escolar y Clima Positivo: Protocolos de prevención contra la violencia escolar (Ley 29719 y portal SiseVe).
     - Estructura Oficial del Portafolio Docente Físico y Digital: Organización sistemática en 5 módulos operativos de acreditación profesional.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Pautas para la actualización semanal en archivador físico y Google Drive institucional, con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, carpeta pedagógica consta de 5 etapas (`legacy-identity`, `legacy-calendar`, `legacy-diagnosis`, `legacy-portfolio`, `legacy-document`). La visualización en hoja de Word requiere el step 4 (`legacy-document`).
  - *Solución*: Se fijó `currentStep: 4` en el inyector del borrador, se generó el DOCX formal con `buildDocumentDocx` comprobando la completitud de sus 6 módulos, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **23** | `planificamos/carpeta-pedagogica` | **Carpeta Pedagógica Oficial** | B2: Planificamos | `23-planificamos-carpeta-pedagogica.docx` | `qa-23-carpeta-pedagogica-preview.png` | `[X] CERTIFICADA` | SHA256: `2a10072f...` (14,451 B) |

---

## RESUMEN DE CIERRE DEL BLOQUE 2: PLANIFICAMOS (Herramientas 16 a 23)
- **Total Herramientas Bloque 2**: 8 / 8 (100% Completado).
- **Archivos DOCX Físicos Generados e Inspeccionados**:
  - `16-planificamos-plan-curricular-anual.docx` (21,784 B, SHA256: `4db4260a...`)
  - `17-planificamos-unidad-aprendizaje.docx` (13,822 B, SHA256: `b7640333...`)
  - `18-planificamos-sesion-aprendizaje.docx` (13,990 B, SHA256: `4a076eca...`)
  - `19-planificamos-situacion-significativa.docx` (14,081 B, SHA256: `fac88071...`)
  - `20-planificamos-proyectos-integrados.docx` (14,319 B, SHA256: `b58f2061...`)
  - `21-planificamos-adaptacion-nee-dua.docx` (14,320 B, SHA256: `0eb2b50f...`)
  - `22-planificamos-tarea-extension.docx` (14,064 B, SHA256: `930acc92...`)
  - `23-planificamos-carpeta-pedagogica.docx` (14,451 B, SHA256: `2a10072f...`)
- **Capturas de Pantalla HD (Light y Dark)**: 16 capturas en `audit-screens/`.
- **Ocurrencias de `[Espacio para desarrollo]`**: 0 (CERO en todo el bloque).
- **Estado de Bloque**: **FINALIZADO Y CERTIFICADO PARA VALIDACIÓN HUMANA**.

---

## BLOQUE 3: EVALUAMOS (Herramientas 24 a 32)

| N° | ID de Herramienta | Nombre Oficial | Bloque | Archivo DOCX | Captura Pantalla | Estado Auditoría | Hash SHA-256 / Peso |
|---|---|---|---|---|---|---|---|
### Herramienta 24: Rúbrica Analítica de Evaluación (`evaluamos/rubrica-evaluacion`)
- **Archivo Físico**: `exports-qa-word/24-evaluamos-rubrica-evaluacion.docx`
- **Peso**: 13,265 bytes | **Hash SHA-256**: `0bdda88b12c37dfee72db67487a41ac593ba080dc89e15fe68aa33d51667506d`
- **Captura Light**: `audit-screens/qa-24-rubrica-preview.png`
- **Captura Dark**: `audit-screens/qa-24-rubrica-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `RÚBRICA ANALÍTICA DE EVALUACIÓN FORMATIVA: ENSAYO ARGUMENTATIVO SOBRE BIODIVERSIDAD AMAZÓNICA`, subtítulo institucional `INSTRUMENTO OFICIAL DE EVALUACIÓN FORMATIVA · COMUNICACIÓN / CNEB`, y tabla de información general (Institución Educativa, Área Curricular / Grado, Docente Evaluador y Propósito de la Evaluación).
  2. **Consignas Pedagógicas**: Instrumento técnico de evaluación auténtica y formativa diseñado para 4° de Secundaria, orientado a valorar el nivel de desarrollo de la competencia 'Escribe diversos tipos de textos en su lengua materna' mediante la producción de un ensayo científico-argumentativo sobre la conservación de la biodiversidad y el desarrollo sostenible.
  3. **Mecánica Central**:
     - Matriz Analítica CNEB en orientación apaisada (Landscape) para máxima legibilidad tipográfica.
     - 4 Criterios / Capacidades: C1. Tesis y Postura Crítica, C2. Sustento Argumentativo y Evidencia Científica, C3. Coherencia y Cohesión Textual, C4. Adecuación Pragmática y Ética de las Fuentes.
     - 4 Escalas CNEB: Inicio (C), En proceso (B), Logro esperado (A) y Logro destacado (AD) con descriptores cualitativos exhaustivos y diferenciados.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia en formato horizontal con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Evaluación Formativa CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones pedagógicas para compartir la rúbrica con los estudiantes previo a la redacción, pautas de mediación formativa para borradores intermedios, coevaluación entre pares y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En la UI web, `evaluamos/rubrica-evaluacion` utiliza el componente especializado `RubricTool` con stepper de 4 fases (Datos, Diseño, Calificación y Vista previa), cuyo borrador se almacena bajo la clave `avendia.evaluations.rubric.v1.${scope}`. Para visualizar la matriz analítica completa, el borrador debía inyectarse con `currentStep: 3`.
  - *Solución*: Se configuró `currentStep: 3` en el inyector con los 4 criterios y escalas completas, se generó el DOCX formal apaisado con `buildInstrumentDocx`, se verificó la ausencia de placeholders vacíos con Python, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **24** | `evaluamos/rubrica-evaluacion` | **Rúbrica Analítica de Evaluación** | B3: Evaluamos | `24-evaluamos-rubrica-evaluacion.docx` | `qa-24-rubrica-preview.png` | `[X] CERTIFICADA` | SHA256: `0bdda88b...` (13,265 B) |
### Herramienta 25: Lista de Cotejo Formativa (`evaluamos/lista-cotejo`)
- **Archivo Físico**: `exports-qa-word/25-evaluamos-lista-cotejo.docx`
- **Peso**: 12,574 bytes | **Hash SHA-256**: `c71089e00a77cdf9d97a298af393914e9e05c858799e9374451b82e68fbcc09e`
- **Captura Light**: `audit-screens/qa-25-lista-cotejo-preview.png`
- **Captura Dark**: `audit-screens/qa-25-lista-cotejo-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `LISTA DE COTEJO FORMATIVA: EXPOSICIÓN ORAL Y DEBATE SOBRE CONSERVACIÓN DE CUENCAS HIDROGRÁFICAS`, subtítulo institucional `INSTRUMENTO OFICIAL DE EVALUACIÓN FORMATIVA · COMUNICACIÓN / ORALIDAD CNEB`, y tabla de información general (Institución Educativa, Área Curricular / Grado, Docente Evaluador y Propósito de la Evaluación).
  2. **Consignas Pedagógicas**: Instrumento de evaluación formativa diseñado para 3° de Secundaria, orientado a verificar desempeños observables de la competencia 'Se comunica oralmente en su lengua materna' durante la sustentación de propuestas de cuidado del agua y preservación ecológica.
  3. **Mecánica Central**:
     - Matriz de Desempeños y Rasgos Observables con 5 criterios formativos:
       - C1: Postura clara y delimitada sobre la problemática de la cuenca hídrica local.
       - C2: Sustento con al menos dos fuentes técnicas o normativas verificables (ANA, MINAM).
       - C3: Recursos no verbales y paraverbales apropiados.
       - C4: Asertividad y respeto ante repreguntas de pares y jurado.
       - C5: Registro lingüístico formal y vocabulario disciplinar preciso.
     - Columnas de verificación dicotómica formal: `N°`, `Criterio / Desempeño Observable`, `Sí`, `No` y `Observaciones / Pautas`.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Evaluación Formativa CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Recomendaciones docentes para socializar previamente los 5 desempeños, registro de notas cualitativas para la devolución formativa y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En la UI web, `evaluamos/lista-cotejo` opera con el componente especializado `ChecklistTool` con stepper de 4 fases (Datos, Criterios, Registro y Vista previa), cuyo borrador se almacena bajo `avendia.evaluations.checklist.v1.${scope}`. Para la visualización de la matriz y el listado de criterios, el borrador debía inyectarse con `currentStep: 3`.
  - *Solución*: Se inyectó `currentStep: 3` en el borrador con los 5 criterios y datos informativos, se generó el DOCX formal con `buildInstrumentDocx`, se verificó la ausencia de placeholders vacíos con Python, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **25** | `evaluamos/lista-cotejo` | **Lista de Cotejo Formativa** | B3: Evaluamos | `25-evaluamos-lista-cotejo.docx` | `qa-25-lista-cotejo-preview.png` | `[X] CERTIFICADA` | SHA256: `c71089e0...` (12,574 B) |
### Herramienta 26: Escala de Estimación / Valoración (`evaluamos/escala-estimacion`)
- **Archivo Físico**: `exports-qa-word/26-evaluamos-escala-estimacion.docx`
- **Peso**: 12,624 bytes | **Hash SHA-256**: `10c37b476ccb13fc7425d2a044b117d2f89cf512463c2f70a956bb0db5df93d5`
- **Captura Light**: `audit-screens/qa-26-escala-estimacion-preview.png`
- **Captura Dark**: `audit-screens/qa-26-escala-estimacion-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `ESCALA DE ESTIMACIÓN Y VALORACIÓN CUALITATIVA: TRABAJO COLABORATIVO E INDAGACIÓN CIENTÍFICA`, subtítulo institucional `INSTRUMENTO OFICIAL DE EVALUACIÓN FORMATIVA (CNEB)`, y tabla de información general con 4 filas completas (Institución Educativa, Área Curricular / Grado, Docente Responsable y Propósito de la Evaluación).
  2. **Consignas Pedagógicas**: Instrumento de estimación del desempeño formativo diseñado para 2° de Secundaria, orientado a valorar de manera progresiva y cualitativa las habilidades socioemocionales y procedimentales de la competencia 'Indaga mediante métodos científicos' durante las sesiones de experimentación y trabajo en equipo.
  3. **Mecánica Central**:
     - 3 Dimensiones de Evaluación Cualitativa Progresiva:
       - 1. Participación Activa y Compromiso en el Equipo de Indagación (Formulación de hipótesis, roles de equipo y bioseguridad).
       - 2. Rigor Metodológico en el Registro y Manejo de Datos (Tablas sistemáticas, instrumentos analíticos y contraste empírico).
       - 3. Comunicación Asertiva y Construcción Colectiva de Conclusiones (Sustento empírico, escucha de objeciones y consensos).
     - Escala cualitativa progresiva (Siempre / A veces / Raras veces / Nunca).
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Evaluación Formativa CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para la aplicación post-sesión, espacio de autovaloración de 5 minutos y conformación heterogénea de equipos, con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la escala de estimación utiliza un flujo de 2 fases (`legacy-data` y `legacy-result`), cuyo borrador se almacena bajo `avendia.draft.workflow.evaluamos/escala-estimacion.v2.${scope}`. Para visualizar la matriz en la hoja de Word web, el borrador debía inyectarse con `currentStep: 1`.
  - *Solución*: Se fijó `currentStep: 1` en el inyector del borrador, se generó el DOCX formal con `buildInstrumentDocx`, se verificó la ausencia total de campos vacíos con Python, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **26** | `evaluamos/escala-estimacion` | **Escala de Estimación / Valoración** | B3: Evaluamos | `26-evaluamos-escala-estimacion.docx` | `qa-26-escala-estimacion-preview.png` | `[X] CERTIFICADA` | SHA256: `10c37b47...` (12,624 B) |
### Herramienta 27: Examen / Prueba Escrita CNEB (`evaluamos/examen`)
- **Archivo Físico**: `exports-qa-word/27-evaluamos-examen.docx`
- **Peso**: 13,442 bytes | **Hash SHA-256**: `a1c6eeadb2329bf4868cbd361fdc598e4d6b805d4ec252378edb80c6389059ad`
- **Captura Light**: `audit-screens/qa-27-examen-preview.png`
- **Captura Dark**: `audit-screens/qa-27-examen-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `EVALUACIÓN ESCRITA FORMATIVA CNEB: COMPRENSIÓN LECTORA Y RAZONAMIENTO CRÍTICO`, subtítulo institucional `INSTRUMENTO OFICIAL DE EVALUACIÓN FORMATIVA (CNEB)`, y tabla institucional de encabezado de evaluación del estudiante con 3 filas: (I.E., Área, Grado y Sección; Apellidos y Nombres con línea formal de llenado y Fecha; Docente Evaluador y recuadro destacado de calificación `Puntaje: ____ / 20`).
  2. **Consignas Pedagógicas**: Prueba escrita estandarizada de evaluación formativa orientada a medir los tres niveles de comprensión lectora (literal, inferencial y crítico-valorativo) de la competencia 'Lee diversos tipos de textos escritos en su lengua materna' para 3° de Secundaria.
  3. **Mecánica Central**:
     - Texto Base Contextualizado: "El Guardián Invisible de los Bosques de Neblina" sobre deforestación y comités comunales con drones.
     - Nivel Literal (Reactivos 1 y 2 - 6 Puntos): Preguntas de opción múltiple (A, B, C, D) con alternativas de causa y tecnología de vigilancia.
     - Nivel Inferencial (Reactivos 3 y 4 - 6 Puntos): Deducción de la relación bosques-seguridad hídrica e intencionalidad del autor.
     - Nivel Crítico-Valorativo (Reactivo 5 - 8 Puntos): Pregunta abierta de juicio ciudadano con líneas guiadas de desarrollo y criterios de ponderación (Postura 2 pts, Argumento 1 3 pts, Argumento 2 3 pts).
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Evaluación Formativa CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Clave de respuestas oficial completa (Reactivos 1 a 5), justificación pedagógica de la deducción inferencial, criterio de devolución formativa y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, examen posee 3 etapas (`legacy-data`, `legacy-config`, `legacy-document`). Para que el visor de documento Word de la prueba se abra directamente, el borrador debía inyectarse con `currentStep: 2`.
  - *Solución*: Se fijó `currentStep: 2` en el inyector del borrador con los 5 reactivos y pautas, se generó el DOCX formal con `buildInstrumentDocx` comprobando la presencia del encabezado estudiantil y el puntaje vigesimal, se tomó la captura en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **27** | `evaluamos/examen` | **Examen / Prueba Escrita CNEB** | B3: Evaluamos | `27-evaluamos-examen.docx` | `qa-27-examen-preview.png` | `[X] CERTIFICADA` | SHA256: `a1c6eead...` (13,442 B) |
### Herramienta 28: Preguntas sobre un Texto (`evaluamos/preguntas-texto`)
- **Archivo Físico**: `exports-qa-word/28-evaluamos-preguntas-texto.docx`
- **Peso**: 13,717 bytes | **Hash SHA-256**: `8a7220e6fb0e7c4c75fa47ef8d4ef4e61458114c0245c32fe270f8d9460d5d38`
- **Captura Light**: `audit-screens/qa-28-preguntas-texto-preview.png`
- **Captura Dark**: `audit-screens/qa-28-preguntas-texto-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `FICHA DE LECTURA CRÍTICA Y PREGUNTAS SOBRE TEXTO: 'EL MISTERIO DE LAS LÍNEAS DE NAZCA'`, subtítulo institucional `INSTRUMENTO OFICIAL DE EVALUACIÓN FORMATIVA (CNEB)`, y tabla institucional de evaluación del estudiante (I.E., Área, Grado/Sección, Apellidos y Nombres, Fecha, Docente Evaluador y recuadro de puntaje `Puntaje: ____ / 20`).
  2. **Consignas Pedagógicas**: Ficha técnica de comprensión lectora multinivel diseñada para 2° de Secundaria, orientada a evaluar las tres capacidades de la competencia 'Lee diversos tipos de textos escritos en su lengua materna' mediante la lectura rigurosa de un texto expositivo-científico sobre arqueología peruana.
  3. **Mecánica Central**:
     - Lectura Base Contextualizada: 'El Legado Astronómico y Ritual de los Antiguos Nazca' (comparación entre la hipótesis de María Reiche y los hallazgos de Isla y Reindel).
     - Nivel Literal (Reactivos 1 y 2 - 6 Puntos): Preguntas de opción múltiple (A, B, C, D) con alternativas de identificación de hipótesis y culto asociado.
     - Nivel Inferencial (Reactivos 3 y 4 - 6 Puntos): Deducción de la evolución del conocimiento arqueológico y el significado simbólico del paisaje sagrado.
     - Nivel Crítico-Reflexivo (Reactivo 5 - 8 Puntos): Pregunta abierta de valoración ética y patrimonial con líneas guiadas de desarrollo y criterios de ponderación (Propuesta equilibrada, Argumentación legal-patrimonial y Viabilidad social).
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Evaluación Formativa CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Clave de respuestas oficial completa (Preguntas 1 a 5), orientaciones de retroalimentación formativa, adaptaciones DUA y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En la UI web, `evaluamos/preguntas-texto` opera con el componente de última generación `SourceDocumentTool` con asistente de 5 etapas (`frame`, `levels`, `format`, `criteria`, `preview`). El instrumento se gestiona transaccionalmente mediante la API `/api/v1/evaluation-instruments` con identificador UUID.
  - *Solución*: Se creó e inyectó un instrumento transaccional con datos informativos, texto fuente, diseño de 5 reactivos y borrador de artefacto generado; se navegó a la fase de vista previa, se generó el DOCX formal mediante `buildInstrumentDocx` respetando el formato de prueba y puntaje vigesimal, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **28** | `evaluamos/preguntas-texto` | **Preguntas sobre un Texto** | B3: Evaluamos | `28-evaluamos-preguntas-texto.docx` | `qa-28-preguntas-texto-preview.png` | `[X] CERTIFICADA` | SHA256: `8a7220e6...` (13,717 B) |
### Herramienta 29: Ficha de Observación en Aula (`evaluamos/ficha-observacion`)
- **Archivo Físico**: `exports-qa-word/29-evaluamos-ficha-observacion.docx`
- **Peso**: 13,102 bytes | **Hash SHA-256**: `c22e0e0273f08d6e83420b42c44e013b4fb9e288560cc5d9e9e4199fb1ba54f6`
- **Captura Light**: `audit-screens/qa-29-ficha-observacion-preview.png`
- **Captura Dark**: `audit-screens/qa-29-ficha-observacion-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `FICHA DE OBSERVACIÓN SISTEMÁTICA EN AULA: RESOLUCIÓN DE PROBLEMAS MATEMÁTICOS`, subtítulo institucional `INSTRUMENTO OFICIAL DE EVALUACIÓN FORMATIVA (CNEB)`, y tabla institucional de datos informativos de 4 filas completas (Institución Educativa, Área Curricular / Grado, Docente Responsable y Propósito de la Evaluación).
  2. **Consignas Pedagógicas**: Instrumento técnico de observación directa y formativa diseñado para 4° de Secundaria, orientado a registrar de manera sistemática las evidencias de desempeño de la competencia 'Resuelve problemas de cantidad' y el clima socioemocional de aprendizaje durante las sesiones de modelación financiera.
  3. **Mecánica Central**:
     - Focalización y Situación de Aprendizaje Observada: Modelación algebraica de interés compuesto e inflación económica en proyectos familiares.
     - Criterios de Observación y Conductas Visibles:
       - C1: Explora y ensaya diversas estrategias heurísticas (tablas, gráficos) antes de formalizar la ecuación financiera.
       - C2: Comunica con vocabulario formal y precisión simbólica los pasos seguidos para llegar a la solución.
       - C3: Asume el error de cálculo como oportunidad de aprendizaje y solicita retroalimentación específica a su par.
     - Interpretación Pedagógica y Hallazgos Objetivos (análisis contextualizado de interacciones, fortalezas y aspectos a reforzar).
     - Conclusiones y Compromisos de Mejora Docente (andamiaje con microfinanzas comunales y glosario financiero).
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Evaluación Formativa CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Pautas de contraste con evidencias escritas, devolución formativa colectiva, registro en anecdotario y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En la UI web, `evaluamos/ficha-observacion` opera con el componente reactivo `ObservationTool` que incluye selector de estudiantes por nómina y asistente de 5 etapas (`frame`, `criteria`, `records`, `analysis`, `preview`). La transición al paso 5 valida la existencia de un estudiante seleccionado y notas objetivas.
  - *Solución*: Se creó transaccionalmente el instrumento de observación vía API, se simuló la selección del estudiante de nómina en el paso 0, se navegó fluidamente al paso 5 (Vista e historial), se generó el DOCX formal con `buildInstrumentDocx`, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **29** | `evaluamos/ficha-observacion` | **Ficha de Observación en Aula** | B3: Evaluamos | `29-evaluamos-ficha-observacion.docx` | `qa-29-ficha-observacion-preview.png` | `[X] CERTIFICADA` | SHA256: `c22e0e02...` (13,102 B) |
### Herramienta 30: Retroalimentación Formativa (`evaluamos/retroalimentacion-formativa`)
- **Archivo Físico**: `exports-qa-word/30-evaluamos-retroalimentacion.docx`
- **Peso**: 13,171 bytes | **Hash SHA-256**: `a92ed8aa24bb34750908db543ca2aeb820954828b4fb2344b2e0ec0f7af10fcf`
- **Captura Light**: `audit-screens/qa-30-retroalimentacion-preview.png`
- **Captura Dark**: `audit-screens/qa-30-retroalimentacion-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `GUÍA DE RETROALIMENTACIÓN FORMATIVA Y DEVOLUCIÓN PEDAGÓGICA: ESCALERA DE WILSON`, subtítulo institucional `PERSONAL SOCIAL · NIVEL: SECUNDARIA · GRADO: 3° DE SECUNDARIA "A"`, y tabla institucional de datos informativos de 8 filas completas (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Documento técnico de acompañamiento formativo diseñado para 3° de Secundaria, orientado a estructurar la devolución pedagógica de la competencia 'Escribe diversos tipos de textos en su lengua materna' mediante los 4 peldaños de la Escalera de Wilson (Clarificar, Valorar, Expresar inquietudes y Sugerir).
  3. **Mecánica Central**:
     - Peldaño 1: Clarificar (Preguntas para comprender la intención del estudiante sobre fuentes estadísticas, destinatario y contrastación local/normativa).
     - Peldaño 2: Valorar (Reconocimiento explícito de fortalezas en tesis, conectores lógicos de contraargumentación y vocabulario formal).
     - Peldaño 3: Expresar Inquietudes (Cuestionamientos reflexivos sobre impacto socioeconómico, llamado a la acción y respaldo empírico).
     - Peldaño 4: Hacer Sugerencias (Pautas operativas de mejora continua para reescritura, puntuación compleja y autoevaluación con rúbrica).
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para la devolución en 48 horas, clima empático de diálogo reflexivo, monitoreo de reescritura y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `tools.ts` y `workflows.ts`, la herramienta figuraba conceptualmente pero carecía de su definición de flujo dedicada y mapeo en `legacyWorkflowShapes.ts`.
  - *Solución*: Se implementó la definición de workflow con 2 fases activas (`legacy-focus`, `legacy-steps`) y visor Word directo en fase 2, se integró a `tools.ts`, se generó el DOCX físico con `buildDocumentDocx`, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **30** | `evaluamos/retroalimentacion-formativa` | **Retroalimentación Formativa** | B3: Evaluamos | `30-evaluamos-retroalimentacion.docx` | `qa-30-retroalimentacion-preview.png` | `[X] CERTIFICADA` | SHA256: `a92ed8aa...` (13,171 B) |
### Herramienta 31: Calificador Automático de Evidencias (`evaluamos/calificador`)
- **Archivo Físico**: `exports-qa-word/31-evaluamos-calificador.docx`
- **Peso**: 11,321 bytes | **Hash SHA-256**: `ad8159531e754e3da4e008f684232758d666fdedfbad7d83da09a54af32e17a7`
- **Captura Light**: `audit-screens/qa-31-calificador-preview.png`
- **Captura Dark**: `audit-screens/qa-31-calificador-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `INFORME TÉCNICO DE CALIFICACIÓN FORMATIVA DE EVIDENCIAS CON IA`, subtítulo institucional `INFORME TÉCNICO PEDAGÓGICO DE SEGUIMIENTO Y ALERTAS`, y tabla institucional de datos del informe (Institución Educativa, Grado y Sección evaluada: 4° "A" · Ciencias Sociales, Docente Responsable, Director(a) y Propósito de la Evaluación).
  2. **Consignas Pedagógicas**: Reporte pedagógico individualizado de calificación formativa asistida con IA bajo supervisión y decisión docente, correspondiente a la competencia 'Construye interpretaciones históricas' para 4° de Secundaria, evaluando el análisis crítico de fuentes y causalidad múltiple.
  3. **Mecánica Central**:
     - Datos de la Evidencia y Estudiante Evaluado (Lucila Vílchez Barzola, Ensayo histórico sobre Reformas Borbónicas y Túpac Amaru II, nivel global sugerido A y validado por el docente).
     - Desglose del Análisis Cualitativo por Criterios (Contraste de fuentes virreinales con cartas pastorales, Causalidad múltiple y Perspectiva histórica sin anacronismos).
     - Fortalezas Destacadas en la Producción Estudiantil (Rigor conceptual, articulación lógica y postura crítica).
     - Pautas de Mejora y Retroalimentación Descriptiva CNEB (Investigación de curacas fidelistas, normas de citación y reflexión metacognitiva).
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Seguimiento y Alertas Pedagógicas · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones sobre la centralidad de la decisión humana frente a la IA, reunión breve de devolución de 5 minutos, archivo en portafolio de evidencias y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En la UI web, `evaluamos/calificador` despacha hacia `RubricTool` con `variant="grader"` en `ToolWorkspace.tsx`. Para la visualización de la rúbrica y las recomendaciones por estudiante en la vista previa, el borrador debía inyectarse con `currentStep: 3`.
  - *Solución*: Se habilitó el alias `calificador` junto a `calificador-rubrica` en `ToolWorkspace.tsx`, se inyectó `currentStep: 3` en el borrador con los 3 criterios y descriptores CNEB, se generó el DOCX formal con `buildAnalyticsDocx`, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **31** | `evaluamos/calificador` | **Calificador Automático de Evidencias** | B3: Evaluamos | `31-evaluamos-calificador.docx` | `qa-31-calificador-preview.png` | `[X] CERTIFICADA` | SHA256: `ad815953...` (11,321 B) |
### Herramienta 32: Registros Auxiliares Oficiales (`evaluamos/registros-auxiliares`)
- **Archivo Físico**: `exports-qa-word/32-evaluamos-registros-auxiliares.docx`
- **Peso**: 12,987 bytes | **Hash SHA-256**: `02edce27184b6d57415f7569156be60ac6d0e7ad04fcd77f640bce93709148c8`
- **Captura Light**: `audit-screens/qa-32-registros-auxiliares-preview.png`
- **Captura Dark**: `audit-screens/qa-32-registros-auxiliares-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `REGISTRO AUXILIAR OFICIAL DE EVALUACIÓN FORMATIVA CNEB - BIMESTRE I`, subtítulo institucional `INSTRUMENTO OFICIAL DE EVALUACIÓN CURRICULAR CNEB`, y tabla institucional de datos del registro (Institución Educativa, Grado y Sección: 5° "A" · Comunicación, Docente Responsable y Propósito de la Evaluación).
  2. **Consignas Pedagógicas**: Documento normativo de seguimiento y valoración formativa correspondiente al Primer Bimestre del año lectivo 2026 para 5° de Secundaria. Articula la nómina escolar con los criterios de evaluación de la competencia 'Lee diversos tipos de textos escritos en su lengua materna', asistencia y conclusiones descriptivas para el SIAGIE.
  3. **Mecánica Central**:
     - Competencias y Capacidades Evaluadas (Obtiene información, infiere e interpreta, reflexiona y evalúa forma/contenido).
     - Matriz de Criterios de Evaluación y Evidencias (C1: posturas y contraargumentos, C2: intención comunicativa y sesgos, C3: juicio crítico y realidad nacional).
     - Balance de Asistencia y Permanencia Escolar (28 estudiantes matriculados, 96.4% de asistencia, 0 deserción).
     - Conclusiones Descriptivas Oficiales CNEB (Por niveles de logro B, A, AD y plan de refuerzo focalizado).
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Instrumento de Evaluación CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para el registro de conclusiones en el SIAGIE, informe de progreso para familias, articulación con el Plan de Refuerzo Escolar y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En la UI web, `evaluamos/registros-auxiliares` opera con `AuxiliaryRegisterTool` y `EvaluationWizard` de 5 etapas (`frame`, `criteria`, `attendance`, `conclusions`, `preview`). La navegación a la etapa final requiere asociar un aula o estudiantes y criterios definidos.
  - *Solución*: Se vincularon estudiantes reales a la nómina de la I.E., se persistió el instrumento con los criterios CNEB y nómina completa vía API, se navegó al paso 5 (Vista e historial), se generó el DOCX formal con `buildInstrumentDocx`, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **32** | `evaluamos/registros-auxiliares` | **Registros Auxiliares Oficiales** | B3: Evaluamos | `32-evaluamos-registros-auxiliares.docx` | `qa-32-registros-auxiliares-preview.png` | `[X] CERTIFICADA` | SHA256: `02edce27...` (12,987 B) |

---

## CIERRE DE BLOQUE 3: EVALUAMOS (100% COMPLETADO Y CERTIFICADO)
Todas las herramientas del Bloque 3 (`evaluamos/rubrica-evaluacion`, `evaluamos/lista-cotejo`, `evaluamos/escala-estimacion`, `evaluamos/examen`, `evaluamos/preguntas-texto`, `evaluamos/ficha-observacion`, `evaluamos/retroalimentacion-formativa`, `evaluamos/calificador`, `evaluamos/registros-auxiliares`) han sido auditadas, corregidas y certificadas con archivos `.docx` físicos en disco local, capturas HD en modo claro y oscuro, e inspección programática rigurosa.

---

## BLOQUE 4: INCLUIMOS (Herramientas 33 a 37)

| N° | ID de Herramienta | Nombre Oficial | Bloque | Archivo DOCX en PC | Captura HD | Estado QA | SHA-256 / Inspeccion |
|---|---|---|---|---|---|---|---|
| **33** | `incluimos/adaptacion-nee-dua` | **Adaptación Inclusiva NEE (DUA)** | B4: Incluimos | `33-incluimos-adaptacion-nee-dua.docx` | `qa-33-adaptacion-nee-dua-preview.png` | `[X] CERTIFICADA` | SHA256: `bfafc28c...` (13,591 B) |
| **34** | `incluimos/plan-atencion` | **Plan de Atención a la Diversidad** | B4: Incluimos | `34-incluimos-plan-atencion.docx` | `qa-34-plan-atencion-preview.png` | `[X] CERTIFICADA` | SHA256: `03b71453...` (13,654 B) |
| **35** | `incluimos/estrategias-inclusion` | **Estrategias de Inclusión** | B4: Incluimos | `35-incluimos-estrategias-inclusion.docx` | `qa-35-estrategias-inclusion-preview.png` | `[X] CERTIFICADA` | SHA256: `cef76373...` (13,610 B) |
| **36** | `incluimos/trabajo-familias` | **Trabajo con Familias Inclusivas** | B4: Incluimos | `36-incluimos-trabajo-familias.docx` | `qa-36-trabajo-familias-preview.png` | `[X] CERTIFICADA` | SHA256: `8d70387e...` (11,510 B) |
| **37** | `incluimos/seguimiento-evaluacion` | **Seguimiento y Evaluación Inclusiva** | B4: Incluimos | `37-incluimos-seguimiento-evaluacion.docx` | `qa-37-seguimiento-evaluacion-preview.png` | `[X] CERTIFICADA` | SHA256: `6e810c19...` (13,492 B) |

### Herramienta 33: Adaptación Inclusiva NEE (DUA) (`incluimos/adaptacion-nee-dua`)
- **Archivo Físico**: `exports-qa-word/33-incluimos-adaptacion-nee-dua.docx`
- **Peso**: 13,591 bytes | **Hash SHA-256**: `bfafc28c4a2563dad4fd754710dec6b66529edabc1ab3e54664b1a4990577e38`
- **Captura Light**: `audit-screens/qa-33-adaptacion-nee-dua-preview.png`
- **Captura Dark**: `audit-screens/qa-33-adaptacion-nee-dua-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `PLAN DE ADAPTACIÓN CURRICULAR INDIVIDUALIZADA Y AJUSTES RAZONABLES (DUA)`, subtítulo institucional `PERSONAL SOCIAL · NIVEL: PRIMARIA · GRADO: 4° DE PRIMARIA "B"`, y tabla institucional de 8 filas completas (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Documento pedagógico normativo de inclusión educativa diseñado para 4° de Primaria. Establece adaptaciones curriculares, metodológicas y de acceso basadas en los tres principios del Diseño Universal para el Aprendizaje (DUA) para garantizar el progreso formativo y la participación plena del estudiante focalizado.
  3. **Mecánica Central**:
     - Diagnóstico Pedagógico y Barreras para el Aprendizaje (BAP): Mateo Saldaña Paredes, fortalezas en memoria auditiva y trabajo cooperativo; barreras en alineación de columnas de cifras y densidad textual.
     - Matriz de Ajustes Razonables basada en Principios DUA: Principio I (problemas de economía familiar), Principio II (material multibase, regletas Cuisenaire y cuadrículas macro con código de color posicional), Principio III (verbalización oral y tarjetas recortables).
     - Adaptaciones Curriculares en Desempeños y Evaluación (Resolución de problemas con material estructurado, rúbrica descriptiva y 25% de tiempo adicional).
     - Coordinación SAANEE, Familia y Cronograma de Monitoreo (Asesoría quincenal, juegos matemáticos en casa y meta bimestral).
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Pautas de articulación con docentes de otras áreas, erradicación de etiquetado, portafolio de atención a la diversidad y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `workflows.ts`, el path estaba registrado como `/dashboard/incluimos/adaptacion-nee` en lugar de `/dashboard/incluimos/adaptacion-nee-dua`, lo que ocasionaba desajuste de navegación desde la barra lateral.
  - *Solución*: Se unificó la ruta en `workflows.ts` a `/dashboard/incluimos/adaptacion-nee-dua`, se estructuró el flujo en `legacyWorkflowShapes.ts` con vista previa Word en fase 5, se generó el DOCX formal con `buildDocumentDocx`, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 34: Plan de Atención a la Diversidad (`incluimos/plan-atencion`)
- **Archivo Físico**: `exports-qa-word/34-incluimos-plan-atencion.docx`
- **Peso**: 13,654 bytes | **Hash SHA-256**: `03b714533642b77209065cc19230c1cb32e21109e6e0f999bf510f42b87238b0`
- **Captura Light**: `audit-screens/qa-34-plan-atencion-preview.png`
- **Captura Dark**: `audit-screens/qa-34-plan-atencion-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `PLAN DE ATENCIÓN INDIVIDUALIZADO (PAI) PARA LA DIVERSIDAD Y LA INCLUSIÓN EDUCATIVA`, subtítulo institucional `EDUCACIÓN BÁSICA · NIVEL: PRIMARIA · GRADO: 5° DE PRIMARIA "A"`, y tabla institucional de 8 filas completas (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Documento normativo institucional de planificación y seguimiento pedagógico para 5° de Primaria. Define la caracterización del estudiante focalizado, sus fortalezas y barreras (BAP), adaptaciones curriculares DUA, metas formativas bimestrales y los compromisos articulados entre la I.E., el equipo SAANEE y la familia.
  3. **Mecánica Central**:
     - Caracterización del Estudiante, Diagnóstico y Antecedentes: Camila Nicole Mendoza Huamán, 10 años, Condición del Espectro Autista (TEA Nivel 1 - Apoyo leve); rendimiento destacado en decodificación literal, necesidad de mediación en inferencias de lenguaje figurado.
     - Perfil Funcional, Talentos y Barreras para el Aprendizaje (BAP): Gran memoria visual y dibujo botánico; barreras identificadas en ruido ambiental imprevisto y consignas orales extensas sin soporte visual.
     - Medidas DUA y Adaptaciones Curriculares Específicas: Checklists numerados, ubicación en zona de baja reverberación, audífonos sensoriales y evaluación en ambiente estructurado con 25% de tiempo adicional.
     - Metas Bimestrales, Compromisos y Articulación Familiar-SAANEE: Gestión autónoma de horarios, réplica de anticipación en el hogar y reuniones mensuales de asesoría especializada.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Pautas de actualización de agenda visual diaria, valoración pública de talentos neurodivergentes, erradicación de sobreprotección y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la etapa final estaba configurada como `download("legacy-document", "PAI oficial & descarga")`, renderizando el visor Word y botón de descarga.
  - *Solución*: Se inyectaron los datos psicopedagógicos completos en el borrador con `currentStep: 4`, se generó el DOCX formal con `buildDocumentDocx`, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 35: Estrategias de Inclusión (`incluimos/estrategias-inclusion`)
- **Archivo Físico**: `exports-qa-word/35-incluimos-estrategias-inclusion.docx`
- **Peso**: 13,610 bytes | **Hash SHA-256**: `cef76373f147fac439be2b53531a0970b2284172d9bd66e6cdd31af6910a25cf`
- **Captura Light**: `audit-screens/qa-35-estrategias-inclusion-preview.png`
- **Captura Dark**: `audit-screens/qa-35-estrategias-inclusion-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `GUÍA DE ESTRATEGIAS PEDAGÓGICAS PARA LA INCLUSIÓN EDUCATIVA Y ELIMINACIÓN DE BARRERAS`, subtítulo institucional `PERSONAL SOCIAL · NIVEL: SECUNDARIA · GRADO: 2° DE SECUNDARIA "B"`, y tabla institucional de 8 filas completas (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Documento metodológico institucional para 2° de Secundaria en el área de Ciencia y Tecnología. Articula el aprendizaje cooperativo, el trabajo por estaciones y el Diseño Universal para el Aprendizaje (DUA) con el fin de eliminar barreras en el laboratorio escolar y promover la participación plena y equitativa de todo el alumnado.
  3. **Mecánica Central**:
     - Caracterización de la Diversidad y Dinámica del Aula: 30 estudiantes con ritmos diversos, dos alumnos con dificultades de lectura científica y un alumno con baja visión leve; objetivo de inclusión mediante aprendizaje cooperativo estructurado.
     - Metodología Central: Estaciones de Aprendizaje Cooperativo: Cuatro estaciones rotativas (Acceso visual/digital con modelos 3D, Manipulativa con microscopios y lupas, Lectura guiada con macrotipos y debate/expresión multimimodal).
     - Clima de Aula, Convivencia y Tutoría entre Pares: Roles cooperativos rotativos (coordinador, gestor, relator, verificador), pares solidarios y cultura del error formativo constructivo.
     - Ajustes de Accesibilidad, Tiempos e Indicadores de Seguimiento: Alto contraste, iluminación focalizada, pausas activas de 2 minutos y 100% de asunción de roles activos sin exclusión.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Pautas de rotación efectiva de roles cooperativos, retroalimentación inmediata en transiciones, anecdotario de ajustes exitosos y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la etapa final estaba configurada como `download("legacy-document", "Guía oficial & descarga")`.
  - *Solución*: Se inyectaron los datos de diversidad y estaciones cooperativas en el borrador con `currentStep: 4`, se generó el DOCX formal con `buildDocumentDocx`, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 36: Trabajo con Familias Inclusivas (`incluimos/trabajo-familias`)
- **Archivo Físico**: `exports-qa-word/36-incluimos-trabajo-familias.docx`
- **Peso**: 11,510 bytes | **Hash SHA-256**: `8d70387e425def7553c35e21be1d38717bcc65166e29243b0735cf0a18c889cd`
- **Captura Light**: `audit-screens/qa-36-trabajo-familias-preview.png`
- **Captura Dark**: `audit-screens/qa-36-trabajo-familias-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `I.E. 0001 REPÚBLICA DEL PERÚ`, subtítulo `COMUNICACIÓN OFICIAL A LA FAMILIA · CICLO ESCOLAR 2026`, y cuadro formal de comunicación (Para, Estudiante/Grado, Asunto, Fecha).
  2. **Consignas Pedagógicas**: Documento institucional de vinculación formativa entre la escuela y el hogar para 3° de Primaria. Registra el diálogo sostenido en la entrevista individual con la madre de familia, las barreras identificadas en casa, las pautas psicopedagógicas acordadas para el estudio diario y el cronograma de seguimiento coordinado.
  3. **Mecánica Central**:
     - Diagnóstico Compartido y Puntos Tratados en el Encuentro: Sebastián Morales Quispe (3° 'A'), avances en socialización; barreras en casa por distractores digitales (pantallas/TV) y fatiga vespertina; acuerdos de rutinas predecibles y motivación positiva.
     - Pautas de Organización de Rutinas y Estudio en el Hogar: Mesa despejada y sin pantallas, horario vespertino fijo de 35 minutos (4:30 a 5:15 p.m.) con pausa de hidratación, tareas fraccionadas y mínimo 9 horas de sueño.
     - Compromisos Específicos Asumidos por la Familia: Revisar/firmar cuaderno de control a diario, 15 min de lectura compartida y preparación autónoma de mochila.
     - Canales de Comunicación y Fecha de Próxima Revisión: Cuaderno de control, llamada quincenal, cita presencial el 22 de mayo de 2026 y talón desglosable firmado.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Doble firma reglamentaria (Docente Tutor y Dirección General) más **Talón desglosable inferior con línea de corte («✂ TALÓN DE ACUSE DE RECIBO») para firma del padre/madre y registro de DNI**.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportWorkflowDocx.ts`, la función `buildCommunicationDocx` no tenía la palabra clave `export`, impidiendo su invocación modular en tests unitarios.
  - *Solución*: Se exportó `buildCommunicationDocx`, se configuró el borrador con `currentStep: 4` en `legacyWorkflowShapes.ts`, se generó el DOCX formal con talón de acuse de recibo, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 37: Seguimiento y Evaluación Inclusiva (`incluimos/seguimiento-evaluacion`)
- **Archivo Físico**: `exports-qa-word/37-incluimos-seguimiento-evaluacion.docx`
- **Peso**: 13,492 bytes | **Hash SHA-256**: `6e810c197c7b4c4ea115be676c16450121a1daf73e0f9896fc71a62b171f0a77`
- **Captura Light**: `audit-screens/qa-37-seguimiento-evaluacion-preview.png`
- **Captura Dark**: `audit-screens/qa-37-seguimiento-evaluacion-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `INFORME PEDAGÓGICO DE SEGUIMIENTO Y EVALUACIÓN DE AJUSTES RAZONABLES (DUA)`, subtítulo `INFORME TÉCNICO PEDAGÓGICO DE SEGUIMIENTO Y ALERTAS`, y tabla de datos del informe de 4 filas (I.E., Grado/Sección evaluada, Docente Responsable, Fecha de Emisión).
  2. **Consignas Pedagógicas**: Informe evaluativo institucional bimestral para 4° de Primaria. Documenta la eficacia de las medidas DUA y ajustes razonables aplicados durante el Bimestre 1, el progreso cognitivo y socioemocional del estudiante focalizado, las dificultades aún observadas y las decisiones pedagógicas de reajuste para el siguiente periodo lectivo.
  3. **Mecánica Central**:
     - Caracterización del Estudiante, Periodo y Adaptaciones Implementadas: Mateo Saldaña Paredes (4° 'B'), evaluación del Bimestre 1; apoyos de cuadrículas macro (1 cm × 1 cm) con código posicional de color, regletas Cuisenaire y tiempo adicional del 25%.
     - Logros de Aprendizaje, Avances Socioemocionales y Evidencias: Alineación correcta de columnas de cifras en el 85% de problemas aditivos; disminución drástica de ansiedad matemática y mayor verbalización oral; logro esperado (A) en la competencia.
     - Evaluación de la Efectividad de los Apoyos y Dificultades Persistentes: Matriz analítica de apoyos indispensables (cuadrículas macro y verbalización previa) frente a persistencia de fatiga en enunciados textuales extensos de dos etapas sin soporte gráfico.
     - Reajustes DUA, Orientaciones Familiares y Metas del Bimestre 2: Incorporación de organizadores gráficos y diagramas de barras ilustrados, juegos familiares de fin de semana y meta de resolución autónoma de problemas de dos etapas.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Plan de acción institucional, articulación con SAANEE y comisión de inclusión, y bloque formal de doble firma técnica (Docente Responsable del Análisis y Dirección / Coordinación Pedagógica).
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la etapa final estaba configurada como `preview("legacy-document", "Informe oficial A4")`.
  - *Solución*: Se inyectaron los datos de progreso, efectividad y reajustes DUA en el borrador con `currentStep: 4`, se generó el DOCX formal con `buildDocumentDocx`, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

---

## CIERRE DE BLOQUE 4: INCLUIMOS (100% COMPLETADO Y CERTIFICADO)
Todas las herramientas del Bloque 4 (`incluimos/adaptacion-nee-dua`, `incluimos/plan-atencion`, `incluimos/estrategias-inclusion`, `incluimos/trabajo-familias`, `incluimos/seguimiento-evaluacion`) han sido auditadas, corregidas y certificadas con archivos `.docx` físicos en disco local, capturas HD en modo claro y oscuro, e inspección programática rigurosa.

---

## BLOQUE 5: REFORZAMOS (Herramientas 38 a 42)

| N° | ID de Herramienta | Nombre Oficial | Bloque | Archivo DOCX en PC | Captura HD | Estado QA | SHA-256 / Inspeccion |
|---|---|---|---|---|---|---|---|
| **38** | `reforzamos/trabajo-autonomo` | **Fichas de Trabajo Autónomo** | B5: Reforzamos | `38-reforzamos-trabajo-autonomo.docx` | `qa-38-trabajo-autonomo-preview.png` | `[X] CERTIFICADA` | SHA256: `34e69dcb...` (11,287 B) |
| **39** | `reforzamos/carpeta-recuperacion` | **Carpeta de Recuperación Pedagógica** | B5: Reforzamos | `39-reforzamos-carpeta-recuperacion.docx` | `qa-39-carpeta-recuperacion-preview.png` | `[X] CERTIFICADA` | SHA256: `3dd9a976...` (13,385 B) |
| **40** | `reforzamos/monitorea-avances` | **Monitoreo de Avances y Aprendizajes** | B5: Reforzamos | `40-reforzamos-monitorea-avances.docx` | `qa-40-monitorea-avances-preview.png` | `[X] CERTIFICADA` | SHA256: `66e72839...` (11,843 B) |
| **41** | `reforzamos/acompanamiento-motivacion` | **Acompañamiento y Motivación** | B5: Reforzamos | `41-reforzamos-acompana-motiva.docx` | `qa-41-acompana-motiva-preview.png` | `[X] CERTIFICADA` | SHA256: `3481b046...` (13,501 B) |
| **42** | `reforzamos/plan-refuerzo` | **Plan de Refuerzo Escolar CNEB** | B5: Reforzamos | `42-reforzamos-plan-refuerzo.docx` | `qa-42-plan-refuerzo-preview.png` | `[X] CERTIFICADA` | Regenerada y validada en la auditoría final |

### Herramienta 38: Fichas de Trabajo Autónomo (`reforzamos/trabajo-autonomo`)
- **Archivo Físico**: `exports-qa-word/38-reforzamos-trabajo-autonomo.docx`
- **Peso**: 11,287 bytes | **Hash SHA-256**: `34e69dcbabe3c9c96955e51a5109d42dcff131c880f0d7513baac5c2d3230b1c`
- **Captura Light**: `audit-screens/qa-38-trabajo-autonomo-preview.png`
- **Captura Dark**: `audit-screens/qa-38-trabajo-autonomo-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `FICHA DE REFUERZO Y TRABAJO AUTÓNOMO: LOS ECOSISTEMAS Y CADENAS TRÓFICAS DEL PERÚ`, subtítulo `FICHA DE TRABAJO Y APLICACIÓN ACTIVA · PERSONAL SOCIAL`, y cuadro institucional del estudiante (Estudiante, Grado y Sección, Institución Educativa, Fecha).
  2. **Consignas Pedagógicas**: Ficha didáctica de aprendizaje autónomo diseñada para 5° de Primaria en Ciencia y Tecnología. Articula explicaciones conceptuales accesibles sobre el flujo de energía en la biodiversidad peruana, retos escalonados de indagación y una pauta de autoevaluación reflexiva con acompañamiento familiar en el hogar.
  3. **Mecánica Central**:
     - ¿Qué aprenderé hoy y por qué es importante? (Fundamentación y Conceptos Clave): Productores en lomas costeras, captura de energía solar y clasificación de fauna peruana (vicuña, zorro andino, puma, cóndor).
     - Práctica Guiada y Análisis de Situaciones Ecológicas: Construcción de cadena trófica de cuatro eslabones en el lago Titicaca e hipótesis sobre desequilibrios ecológicos ante la merma de consumidores primarios.
     - Reto de Aplicación en el Hogar y Autoevaluación: Compromisos familiares de protección ambiental y lista de cotejo formativa para verificar la comprensión autónoma.
     - Tablas estructuradas por "Paso | Consigna / Reto a Resolver | Respuesta o Evidencia del Estudiante" con líneas de desarrollo para el alumno. CERO textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Sección de Solucionario y Clave de Verificación (Uso Docente) con línea de corte punteada para doblar o desglosar antes de entregar la ficha al estudiante, con pautas de mediación familiar y respuestas técnicas de cada reto.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportWorkflowDocx.ts`, `key.includes("trabajo-autonomo")` se procesa a través de `buildActivityDocx`, la cual formatea las actividades en tablas didácticas paso a paso con solucionario desglosable.
  - *Solución*: Se configuró el borrador con `currentStep: 2` (tercera etapa del flujo), se generó el DOCX formal, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 39: Carpeta de Recuperación Pedagógica (`reforzamos/carpeta-recuperacion`)
- **Archivo Físico**: `exports-qa-word/39-reforzamos-carpeta-recuperacion.docx`
- **Peso**: 13,385 bytes | **Hash SHA-256**: `3dd9a97678ab0218ea7946ab0f90263e0cc2762490284bb71a64bab0a22f5c90`
- **Captura Light**: `audit-screens/qa-39-carpeta-recuperacion-preview.png`
- **Captura Dark**: `audit-screens/qa-39-carpeta-recuperacion-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `CARPETA DE RECUPERACIÓN PEDAGÓGICA Y NIVELACIÓN DE APRENDIZAJES CNEB`, subtítulo institucional `PERSONAL SOCIAL · NIVEL: SECUNDARIA · GRADO: 3° DE SECUNDARIA "A"`, y tabla institucional de 8 filas completas (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Documento técnico-pedagógico institucional para 3° de Secundaria en el área de Matemática. Establece la ruta formativa de recuperación para los estudiantes que requieren consolidar aprendizajes en las competencias 'Resuelve problemas de cantidad' y 'Resuelve problemas de regularidad, equivalencia y cambio', mediante experiencias de aprendizaje guiadas, criterios de evaluación formativa y cronograma de seguimiento coordinado con la familia.
  3. **Mecánica Central**:
     - Diagnóstico Pedagógico y Estudiantes Focalizados: 8 estudiantes en nivel inicio (C) y proceso (B); justificación basada en evaluación de término de periodo y necesidad de afianzar nociones matemáticas aplicadas a situaciones de la vida real.
     - Competencias Priorizadas y Criterios de Evaluación: 'Resuelve problemas de cantidad' (números racionales y porcentajes) y 'Resuelve problemas de regularidad, equivalencia y cambio' (modelado de ecuaciones lineales y proporcionalidad); cuaderno de campo financiero como evidencia integradora.
     - Ruta Diferenciada de Experiencias de Aprendizaje: Tres experiencias escalonadas (Presupuesto familiar, Optimización de costos en emprendimiento local y Modelado de ecuaciones en ahorro de energía) con ejemplos resueltos paso a paso.
     - Cronograma de Entregas, Asesorías y Compromiso Familiar: 4 semanas lectivas con entregas parciales, asesorías presenciales semanales, firma de avance familiar y fecha límite al 30 de abril de 2026.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Pautas de retroalimentación descriptiva a tiempo, prevención de acumulación de tareas, emisión de actas oficiales de recuperación y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la etapa final estaba configurada como `download("legacy-document", "Carpeta & descarga")`.
  - *Solución*: Se inyectaron los datos de la ruta de recuperación en el borrador con `currentStep: 1` (segunda etapa), se generó el DOCX formal con `buildDocumentDocx`, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 40: Monitoreo de Avances y Aprendizajes (`reforzamos/monitorea-avances`)
- **Archivo Físico**: `exports-qa-word/40-reforzamos-monitorea-avances.docx`
- **Peso**: 11,843 bytes | **Hash SHA-256**: `66e72839eb4ca5371458525a3da048d7f6785b18337be780dd23e1c1ce34ef30`
- **Captura Light**: `audit-screens/qa-40-monitorea-avances-preview.png`
- **Captura Dark**: `audit-screens/qa-40-monitorea-avances-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `INFORME TÉCNICO DE MONITOREO DE AVANCES DE APRENDIZAJE Y DECISIONES PEDAGÓGICAS`, subtítulo `INFORME TÉCNICO PEDAGÓGICO DE SEGUIMIENTO Y ALERTAS`, y tabla de datos del informe (4 filas).
  2. **Consignas Pedagógicas**: Informe analítico de seguimiento formativo del progreso de los aprendizajes para 4° de Primaria en Comunicación. Sistematiza la línea de base, el registro semanal de hitos evaluativos en comprensión lectora inferencial, la categorización en grupos flexibles de atención y las decisiones de reajuste pedagógico para cerrar brechas formativas.
  3. **Mecánica Central**:
     - Línea de Base y Caracterización Inicial del Aula: 12 estudiantes en inicio (C); meta de transitar al 85% a niveles de proceso o logro esperado en la competencia 'Lee diversos tipos de textos'.
     - Matriz Semanal de Hitos, Evidencias y Análisis Cualitativo: Cuatro semanas de andamiaje (pistas contextuales, esquemas gráficos y fichas de inferencia en textos divulgativos); 9 estudiantes superaron inicio.
     - Agrupamiento Flexible y Estrategias Remediales Diferenciadas: Tres grupos dinámicos sin estigmatización (Prioritario en contraturno, Proceso con listas de verificación y Avanzado con lectura crítica).
     - Decisiones Pedagógicas Institucionales y Cronograma de Reajuste: Estrategias de subrayado cromático colegiado, 'Mochila Viajera' con las familias y fecha de corte al 12 de junio de 2026.
     - Matriz semaforizada de riesgo y estado pedagógico con badges "Crítico (Alerta)", "En Proceso", "Monitoreo". CERO textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Plan de acción y compromisos institucionales (retroalimentación en <48 horas, motivación intrínseca y conclusiones para el SIAGIE) y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportWorkflowDocx.ts`, `key.includes("monitorea")` se procesa a través de `buildAnalyticsDocx`, renderizando la matriz semaforizada y tablas analíticas de seguimiento.
  - *Solución*: Se inyectaron los datos de línea de base e hitos en el borrador con `currentStep: 4`, se generó el DOCX formal, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 41: Acompañamiento y Motivación (`reforzamos/acompanamiento-motivacion`)
- **Archivo Físico**: `exports-qa-word/41-reforzamos-acompana-motiva.docx`
- **Peso**: 13,501 bytes | **Hash SHA-256**: `3481b046be8f9b16b28fc61060b2265d369364b1dccee8c5a229167b414ecd8c`
- **Captura Light**: `audit-screens/qa-41-acompana-motiva-preview.png`
- **Captura Dark**: `audit-screens/qa-41-acompana-motiva-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `PLAN DE ACOMPAÑAMIENTO SOCIOEMOCIONAL, MICRO-METAS Y MOTIVACIÓN ESCOLAR`, subtítulo institucional `EDUCACIÓN BÁSICA · NIVEL: SECUNDARIA · GRADO: 1° DE SECUNDARIA "B"`, y tabla institucional de 8 filas completas (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Documento institucional de tutoría y orientación educativa (TOE) para 1° de Secundaria. Articula la caracterización del estado socioafectivo del estudiante focalizado frente a episodios de ansiedad y frustración en la transición a secundaria, definiendo micro-metas progresivas, canales de reconocimiento positivo y mensajes formativos articulados con el hogar.
  3. **Mecánica Central**:
     - Lectura Socioemocional, Estado Inicial y Detonantes: Diego Alonso Quispe Huanca (12 años, 1° 'B'); ansiedad transitoria ante evaluaciones de álgebra y temor al error público; factores protectores en dibujo técnico y deportes.
     - Fortalezas, Intereses y Recursos Personales: Gran talento para la representación gráfica; familia comprometida que necesita transformar exigencia de notas en refuerzo del esfuerzo.
     - Plan de Micro-Metas y Reconocimiento Positivo: Resolver dos ejercicios autónomamente por sesión y formular una duda en voz alta; reconocimiento semanal mediante notas adhesivas de aliento.
     - Mensajes Formativos, Compromiso Familiar y Seguimiento: Mensaje inspirador centrado en la perseverancia y el error como aprendizaje valiente; diálogo nocturno familiar de 15 minutos sin reproches.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Pautas de validación emocional docente, erradicación de presiones públicas en pizarra y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `workflows.ts`, el path estaba registrado como `/dashboard/reforzamos/acompana-motiva` en lugar de `/dashboard/reforzamos/acompanamiento-motivacion`, lo que provocaba redirección al dashboard general al no coincidir con el identificador del catálogo.
  - *Solución*: Se unificó el path en `workflows.ts` a `/dashboard/reforzamos/acompanamiento-motivacion`, se estructuró el flujo en `legacyWorkflowShapes.ts` con vista previa en la etapa final con `currentStep: 4`, se generó el DOCX formal con `buildDocumentDocx`, se verificó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 42: Plan de Refuerzo (`reforzamos/plan-refuerzo`)
- **Archivo Físico**: `exports-qa-word/42-reforzamos-plan-refuerzo.docx`
- **Peso**: 14,048 bytes | **Hash SHA-256**: `4570fd4903a94dbf5f8dcfa69e87f3fd0b70cfdfc872f7fb90a69ccd1d268d38`
- **Captura Light**: `audit-screens/qa-42-plan-refuerzo-preview.png`
- **Captura Dark**: `audit-screens/qa-42-plan-refuerzo-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `PLAN DE REFUERZO ESCOLAR ANUAL CNEB - FORTALECIMIENTO DE COMPETENCIAS MATEMÁTICAS`, subtítulo institucional `PERSONAL SOCIAL · NIVEL: SECUNDARIA · GRADO: 2° DE SECUNDARIA "A"`, y tabla institucional de 8 filas completas (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Documento curricular y de gestión pedagógica institucional elaborado conforme a las directivas del MINEDU (RVM N° 045-2022-MINEDU). Articula el diagnóstico de la evaluación diagnóstica de entrada, la focalización de estudiantes en niveles 'En Inicio' y 'En Proceso', las metas de aprendizaje bimestrales, la matriz de acciones diferenciadas y el sistema de monitoreo formativo y compromisos tripartitos.
  3. **Mecánica Central**:
     - I. Diagnóstico de Entrada y Focalización Pedagógica: 32 evaluados, 12 en Inicio (37.5%), 14 en Proceso (43.8%) y 6 en Logro Esperado; brechas en modelos algebraicos, razones y proporciones y justificación de procedimientos.
     - II. Metas de Aprendizaje y Criterios CNEB: 75% en Proceso al II Bimestre y 80% en Logro Esperado al IV Bimestre; criterios de modelación y justificación; carpeta de evidencias y rúbrica analítica.
     - III. Acciones Diferenciadas y Estrategias Pedagógicas: Talleres de nivelación en horario alterno (2 horas semanales), andamiaje cognitivo graduado con material concreto/GeoGebra y tutoría entre pares.
     - IV. Cronograma, Hitos y Compromisos Tripartitos: Hitos en Mayo, Julio, Octubre y Diciembre; compromisos docentes, estudiantiles y familiares; reuniones quincenales de monitoreo.
     - CERO tablas genéricas o textos `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para la revisión docente (monitoreo de asistencia extracurricular, articulación con SAANEE, informes de progreso a Dirección) y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la herramienta cuenta con 5 etapas estructuradas (`legacy-diagnosis`, `legacy-goals`, `legacy-actions`, `legacy-schedule`, `legacy-document`). La vista previa y descarga oficial se ubican en la etapa final (`currentStep: 4`).
  - *Solución*: Se implementó el generador de pruebas Vitest para compilar `42-reforzamos-plan-refuerzo.docx` mediante `buildDocumentDocx`, se verificaron los 5 apartados y ausencia total de placeholders con Python, se generaron las capturas HD en modo Claro y Oscuro con Puppeteer enfocando la hoja de trabajo oficial y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

---

## BLOQUE 5: REFORZAMOS (Herramientas 38 a 42) — 100% COMPLETADO Y CERTIFICADO
- Herramienta 38: Trabajo Autónomo (`reforzamos/trabajo-autonomo`) — **CERTIFICADO**
- Herramienta 39: Carpeta de Recuperación (`reforzamos/carpeta-recuperacion`) — **CERTIFICADO**
- Herramienta 40: Monitoreo de Avances (`reforzamos/monitorea-avances`) — **CERTIFICADO**
- Herramienta 41: Acompañamiento y Motivación (`reforzamos/acompanamiento-motivacion`) — **CERTIFICADO**
- Herramienta 42: Plan de Refuerzo (`reforzamos/plan-refuerzo`) — **CERTIFICADO**

---

## BLOQUE 6: ACOMPAÑAMOS (Herramientas 43 a 47)

### Herramienta 43: Correo a Familias (`acompanamos/correo-familias`)
- **Archivo Físico**: `exports-qa-word/43-acompanamos-correo-familias.docx`
- **Peso**: 11,586 bytes | **Hash SHA-256**: `090688a4210324e3d2ec42a4ca7dcc93e341486d2073ac18e7a8bfd368f35fca`
- **Captura Light**: `audit-screens/qa-43-correo-familias-preview.png`
- **Captura Dark**: `audit-screens/qa-43-correo-familias-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral `DOCUMENTO PEDAGÓGICO EDITABLE`, nombre institucional formal `I.E. 0001 REPÚBLICA DEL PERÚ`, título `COMUNICACIÓN OFICIAL A LA FAMILIA · CICLO ESCOLAR 2026` y tabla de metadatos (Para, Fecha, Estudiante, Asunto).
  2. **Consignas Pedagógicas**: Comunicación institucional orientada a fortalecer la alianza formativa escuela-familia. Presenta un balance cualitativo del avance académico y socioemocional de la estudiante en 4° de Primaria, destacando fortalezas e identificando oportunidades de mejora en el hogar.
  3. **Mecánica Central**:
     - I. Saludo institucional y propósito del comunicado con enfoque asertivo y respetuoso.
     - II. Logros destacados y fortalezas observadas (expresión oral, empatía y creatividad artística).
     - III. Oportunidades de mejora y pautas de acompañamiento domiciliario (rutina fija de estudio de 40 min y verificación de agenda).
     - IV. Citación presencial a entrevista formativa individual (fecha, hora, lugar y canal de atención docente).
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior y pie de página formal con numeración «Página X de Y».
  5. **Solucionario Docente**: Doble bloque de firmas institucionales (Docente Responsable / Tutor y Dirección General) y **Talón Desglosable de Acuse de Recibo** con línea de corte formal (`✂ - - - - - -`), DNI, teléfono y firma del apoderado para archivo en la carpeta tutorial.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportWorkflowDocx.ts`, la herramienta está enrutada hacia `buildCommunicationDocx` para asegurar la inclusión del talón desglosable de acuse de recibo y la ficha de citación oficial.
  - *Solución*: Se adaptó el generador de pruebas Vitest para inyectar los metadatos completos en `values`, se validó la estructura documental de 5 secciones y talón de recibo con Python, se tomaron capturas en Light y Dark Mode con Puppeteer y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 44: Respuesta de Correo (`acompanamos/respuesta-correo`)
- **Archivo Físico**: `exports-qa-word/44-acompanamos-respuesta-correo.docx`
- **Peso**: 11,635 bytes | **Hash SHA-256**: `7bfb5e23c43b0a0e6083cc3fadef5c660e34961e2bbfa592a1b82b85b2c89a80`
- **Captura Light**: `audit-screens/qa-44-respuesta-correo-preview.png`
- **Captura Dark**: `audit-screens/qa-44-respuesta-correo-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral `DOCUMENTO PEDAGÓGICO EDITABLE`, nombre institucional formal `I.E. 0001 REPÚBLICA DEL PERÚ`, título `COMUNICACIÓN OFICIAL A LA FAMILIA · CICLO ESCOLAR 2026` y tabla de metadatos (Para, Fecha, Estudiante, Asunto).
  2. **Consignas Pedagógicas**: Respuesta institucional pedagógica emitida por la tutoría de 2° de Secundaria a la consulta formal remitida por la madre de familia. Brinda una explicación clara, fundamentada en la RVM N° 094-2020-MINEDU, sobre los criterios de la escala de calificación cualitativa (AD, A, B, C), detalla las evidencias evaluadas en el área de Ciencias Sociales y plantea acuerdos formativos conjuntos.
  3. **Mecánica Central**:
     - I. Consulta recibida y encuadre institucional: Atención a la consulta de la apoderada respecto al nivel de logro 'B' y equivalencia con el sistema vigesimal, encuadrada en la evaluación auténtica por competencias.
     - II. Fundamentación pedagógica del nivel de logro: Esclarecimiento del nivel 'En Proceso' en la competencia "Construye interpretaciones históricas", evidencia analizada (ensayo y fuentes) y valoración de la participación oral.
     - III. Plan de acompañamiento y acuerdos de aprendizaje: Guías de andamiaje, oportunidad de mejora y reescritura del ensayo con rúbrica analítica, fecha límite y diálogo en el hogar.
     - IV. Canales de coordinación y conclusión institucional: Horario de atención presencial docente y compromiso compartido de logro.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior y pie de página formal con numeración «Página X de Y».
  5. **Solucionario Docente**: Doble bloque de firmas institucionales (Docente Responsable / Tutor y Dirección General) y **Talón Desglosable de Acuse de Recibo** con línea de corte formal (`✂ - - - - - -`), DNI, teléfono y firma del apoderado para archivo en la carpeta tutorial.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: Al igual que la herramienta 43, `respuesta-correo` canaliza a través de `buildCommunicationDocx`, requiriendo parámetros claros en `values` para renderizar el talonario de confirmación y el cuerpo de respuesta epistolar.
  - *Solución*: Se implementó el generador Vitest `qaExport44RespuestaCorreo.test.ts`, se verificaron los 5 apartados y ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode y se certificó con paridad absoluta.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 45: Analítica de Aula y Alertas (`acompanamos/analytics-alertas`)
- **Archivo Físico**: `exports-qa-word/45-acompanamos-analytics-alertas.docx`
- **Peso**: 11,993 bytes | **Hash SHA-256**: `e05296923104e8d13d0dc13d93677f2ae230aef89000917d5549e629e0d7b03c`
- **Captura Light**: `audit-screens/qa-45-analytics-alertas-preview.png`
- **Captura Dark**: `audit-screens/qa-45-analytics-alertas-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral `DOCUMENTO PEDAGÓGICO EDITABLE`, título oficial `INFORME ANALÍTICO DE AULA Y SISTEMA DE ALERTAS TEMPRANAS PARA EL ACOMPAÑAMIENTO INTEGRAL`, subtítulo `INFORME TÉCNICO PEDAGÓGICO DE SEGUIMIENTO Y ALERTAS`, y tabla de metadatos (Institución Educativa, Grado y Sección, Docente Responsable, Fecha de Emisión).
  2. **Consignas Pedagógicas**: Reporte analítico y predictivo de gestión tutorial para 3° de Secundaria 'B'. Consolida la triangulación de indicadores multidimensionales (rendimiento académico, asistencia escolar, convivencia y bienestar socioafectivo) a fin de priorizar oportunamente a los estudiantes en situación de riesgo formativo.
  3. **Mecánica Central**:
     - I. Datos del informe e identificación de la muestra de aula (34 estudiantes).
     - II. Resumen ejecutivo y diagnóstico cuali-cuantitativo de necesidades de acompañamiento.
     - III. **Matriz Semaforizada de Riesgo y Estado Pedagógico**:
       - *Dimensión Académica*: Riesgo de desaprobación simultánea (Alerta Crítica - Rojo Claro); inclusión en refuerzo escolar y tutoría entre pares.
       - *Dimensión de Asistencia y Puntualidad*: Ausentismo injustificado reiterado y tardanzas (Riesgo Moderado - Amarillo Claro); entrevistas de encuadre y flexibilización horaria.
       - *Dimensión Socioemocional y Clima*: Aislamiento y mutismo selectivo (Monitoreo - Verde Claro); dinámicas de cohesión grupal y derivación a psicología escolar.
       - *Matriz de Casos Prioritarios*: Ruta de atención nominal (Kevin R., Camila T., Matías G.) y fecha de evaluación de impacto.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado superior formal y pie de página institucional «Página X de Y».
  5. **Solucionario Docente**: Plan de acción y compromisos institucionales (reuniones colegiadas, confidencialidad del registro y pactos de apoyo con familias) y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `workflows.ts`, el path estaba definido como `/dashboard/acompanamos/analitica-alertas`, discrepando con el catálogo de `tools.ts` (`/dashboard/acompanamos/analytics-alertas`), lo que impedía la resolución de ruta en `getToolByPath`.
  - *Solución*: Se unificó el path en `workflows.ts` a `/dashboard/acompanamos/analytics-alertas`, se verificó la generación con `buildAnalyticsDocx` integrando la tabla semaforizada, se validó la ausencia de placeholders con Python, se tomaron capturas en Light y Dark Mode con Puppeteer y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 46: Calificador con IA (`acompanamos/calificador-ia`)
- **Archivo Físico**: `exports-qa-word/46-acompanamos-calificador-ia.docx`
- **Peso**: 11,865 bytes | **Hash SHA-256**: `67e1cbe79d606e367589abaf459616d9b39809a95a4fc3c68ed815ef801ed012`
- **Captura Light**: `audit-screens/qa-46-calificador-ia-preview.png`
- **Captura Dark**: `audit-screens/qa-46-calificador-ia-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral `DOCUMENTO PEDAGÓGICO EDITABLE`, título oficial `INFORME TÉCNICO DE CALIFICACIÓN ASISTIDA CON IA: VALORACIÓN DE EVIDENCIA Y RETROALIMENTACIÓN FORMATIVA`, subtítulo `INFORME TÉCNICO PEDAGÓGICO DE SEGUIMIENTO Y ALERTAS`, y tabla de metadatos (Institución Educativa, Grado y Sección, Docente Responsable, Fecha de Emisión).
  2. **Consignas Pedagógicas**: Dictamen pedagógico de evaluación formativa asistida con IA bajo el principio de soberanía y control docente para 5° de Secundaria en Comunicación. Analiza la evidencia de producción escrita contrastándola con la rúbrica analítica CNEB y propone pautas de retroalimentación reflexiva guiada.
  3. **Mecánica Central**:
     - *Adecuación al Propósito y Registro Formal*: Tesis clara en el párrafo inicial, registro académico formal; nivel sugerido Logro Esperado (A).
     - *Cohesión Textual y Conectores Lógicos*: Uso de conectores de causa y consecuencia; sugerencia de sustitución de conectores repetitivos; nivel Logro Esperado (A).
     - *Argumentación Crítica y Respaldo de Fuentes*: Argumentos basados en la cotidianeidad con necesidad de incorporar citas documentadas (SUNASS/ANA); nivel En Proceso (B).
     - *Dictamen Consolidado y Decisión Docente Soberana*: Nivel final validado (A) y compromiso de devolución con diálogo reflexivo de 10 minutos.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones institucionales enfatizando que la sugerencia de la IA es consultiva y que la decisión evaluativa soberana reside exclusivamente en el docente, culminando con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportWorkflowDocx.ts`, la herramienta procesa mediante `buildAnalyticsDocx`, renderizando la matriz estructurada de criterios, niveles sugeridos y acciones remediales docentes.
  - *Solución*: Se elaboró el generador Vitest `qaExport46CalificadorIA.test.ts`, se verificaron los 5 apartados y ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 47: Reporte de Seguimiento (`acompanamos/reporte-seguimiento`)
- **Archivo Físico**: `exports-qa-word/47-acompanamos-reporte-seguimiento.docx`
- **Peso**: 13,683 bytes | **Hash SHA-256**: `ffc2b6ab4fae5b517b281f492d96d13ef841b28e8619946a578a8f7df74ff87a`
- **Captura Light**: `audit-screens/qa-47-reporte-seguimiento-preview.png`
- **Captura Dark**: `audit-screens/qa-47-reporte-seguimiento-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral `DOCUMENTO PEDAGÓGICO EDITABLE`, título oficial `INFORME TÉCNICO DE SEGUIMIENTO INTEGRAL, ACUERDOS FORMATIVOS Y PRÓXIMOS PASOS`, subtítulo institucional `EDUCACIÓN BÁSICA · NIVEL: PRIMARIA · GRADO: 6° DE PRIMARIA "B"`, y tabla institucional de 8 filas completas (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Documento pedagógico de seguimiento individualizado para 6° de Primaria. Sistematiza el balance bimestral del acompañamiento académico, socioemocional y familiar del estudiante focalizado, documentando la evolución de sus aprendizajes, las barreras persistentes, los compromisos suscritos por los actores educativos y el cronograma de verificación continua.
  3. **Mecánica Central**:
     - I. Encuadre del caso, tipo de acompañamiento y antecedentes (Matías Gabriel Benavides Flores, 11 años, 6° 'B'; seguimiento mixto académico-convivencial-familiar).
     - II. Balance de avances cualitativos y logros consolidados (integración en equipos, comprensión lectora e indagación científica).
     - III. Dificultades persistentes y nudos críticos de aprendizaje (cálculo de fracciones y decimales, desvelo por videojuegos).
     - IV. Compromisos suscritos, responsabilidades y ruta de próximos pasos (compromisos tripartitos estudiante-familia-docente, fecha de revisión 26 de junio de 2026).
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones institucionales para el registro anecdotario, refuerzo de autoeficacia matemática y archivo en el comité de tutoría, con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la herramienta se estructura en 3 etapas (`legacy-context`, `legacy-progress`, `legacy-document`), procesándose en la etapa final (`currentStep: 2`) mediante `buildDocumentDocx`.
  - *Solución*: Se diseñó el generador Vitest `qaExport47ReporteSeguimiento.test.ts`, se certificó la integridad técnica y ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode y se certificó con paridad absoluta.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

---

## BLOQUE 6: ACOMPAÑAMOS (Herramientas 43 a 47) — 100% COMPLETADO Y CERTIFICADO
- Herramienta 43: Correo a Familias (`acompanamos/correo-familias`) — **CERTIFICADO**
- Herramienta 44: Respuesta de Correo (`acompanamos/respuesta-correo`) — **CERTIFICADO**
- Herramienta 45: Analítica de Aula y Alertas (`acompanamos/analytics-alertas`) — **CERTIFICADO**
- Herramienta 46: Calificador con IA (`acompanamos/calificador-ia`) — **CERTIFICADO**
- Herramienta 47: Reporte de Seguimiento (`acompanamos/reporte-seguimiento`) — **CERTIFICADO**

---

## BLOQUE 7: TUTORÍA Y ORIENTACIÓN EDUCATIVA (Herramientas 48 a 54)

### Herramienta 48: Plan de Tutoría (`tutoria/plan-tutoria`)
- **Archivo Físico**: `exports-qa-word/48-tutoria-plan-tutoria.docx`
- **Peso**: 13,862 bytes | **Hash SHA-256**: `54281737fd1ad42adbe19ddaca4e9fc325259b262a48f05ba62b37f6d218a6c9`
- **Captura Light**: `audit-screens/qa-48-plan-tutoria-preview.png`
- **Captura Dark**: `audit-screens/qa-48-plan-tutoria-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral `DOCUMENTO PEDAGÓGICO EDITABLE`, título oficial `PLAN TUTORIAL DE AULA ANUAL CNEB - TUTORÍA Y ORIENTACIÓN EDUCATIVA (TOE)`, subtítulo institucional `EDUCACIÓN BÁSICA · NIVEL: SECUNDARIA · GRADO: 3° DE SECUNDARIA "B"`, y tabla institucional de 8 filas completas (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Documento de gestión pedagógica tutorial elaborado de acuerdo a las directivas del CNEB y la RVM N° 212-2020-MINEDU para 3° de Secundaria. Articula el diagnóstico socioafectivo y de convivencia del grupo clase, define los objetivos por dimensiones formativas (personal, social y de los aprendizajes), y programa las acciones de tutoría grupal, acompañamiento individual, orientación familiar y derivación comunitaria.
  3. **Mecánica Central**:
     - I. Diagnóstico de Necesidades de Orientación y Caracterización del Aula: 32 estudiantes (17 mujeres, 15 varones); diagnóstico en dimensión personal (autoimagen, presión de grupo), dimensión social (convivencia, redes sociales) y de los aprendizajes (organización del tiempo).
     - II. Objetivos del Plan por Dimensiones Formativas: Objetivo general y metas específicas por dimensión personal, social y aprendizajes; articulación con tutoría grupal e individual.
     - III. Plan de Acción (36 sesiones grupales anuales, entrevistas individuales bimensuales prioritarias, 4 escuelas de padres y coordinación con CSMC/DEMUNA).
     - IV. Cronograma de Implementación Bimestral, Recursos Educativos y Criterios de Evaluación del Plan Tutorial.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para la confidencialidad estricta en entrevistas individuales, articulación docente de aula y protocolos de protección institucional, con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `workflows.ts`, el path de la herramienta estaba registrado como `/dashboard/tutoria/plan` en lugar de `/dashboard/tutoria/plan-tutoria`, produciendo desajustes de enrutamiento al navegar desde el menú lateral y catálogo.
  - *Solución*: Se homologaron los paths de todo el bloque de tutoría en `workflows.ts` con `tools.ts`, se estructuró la descarga oficial con `buildDocumentDocx`, se verificó la ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 49: Sesiones de Tutoría (`tutoria/sesiones-tutoria`)
- **Archivo Físico**: `exports-qa-word/49-tutoria-sesiones-tutoria.docx`
- **Peso**: 14,607 bytes | **Hash SHA-256**: `857432631c0fac96b604164c0000faa1e5c54a1f95a6e8d542283362aef0ae0b`
- **Captura Light**: `audit-screens/qa-49-sesiones-tutoria-preview.png`
- **Captura Dark**: `audit-screens/qa-49-sesiones-tutoria-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral `DOCUMENTO PEDAGÓGICO EDITABLE`, título oficial `SESIÓN DE TUTORÍA Y ORIENTACIÓN EDUCATIVA: DECISIONES ASERTIVAS FRENTE A LA PRESIÓN DE GRUPO`, subtítulo institucional `EDUCACIÓN BÁSICA · NIVEL: SECUNDARIA · GRADO: 3° DE SECUNDARIA "A"`, y tabla de metadatos completa (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Diseño de sesión tutorial formativa bajo el marco de la RVM N° 212-2020-MINEDU para 3° de Secundaria. Articula el desarrollo de la dimensión personal y socioemocional, dotando a los adolescentes de estrategias de autorregulación y asertividad ante influencias negativas del entorno social.
  3. **Mecánica Central**:
     - I. Propósito Formativo, Dimensión TOE y Enfoques Transversales: Dimensión Personal (autoconocimiento, autoestima, habilidades socioemocionales); enfoque de derechos y bien común.
     - II. Secuencia Didáctica Detallada: Inicio (15 min, caso motivador 'El desafío de Mateo' y conflicto cognitivo sobre por qué cuesta decir 'No'); Desarrollo (50 min, dramatización de dilemas reales de presión social y entrenamiento vivencial en 'Disco Rayado' y 'Asertividad Positiva'); Cierre (25 min, elaboración individual de 'Mi Escudo Protector' con compromisos y síntesis metacognitiva).
     - III. Cuidado Socioemocional, Factores Protectores y Rutas de Derivación: Clima de aula respetuoso, detección de señales de angustia o retraimiento, activación de protocolo SíseVe y derivación protegida a psicología.
     - IV. Instrumento de Evaluación Formativa: Criterios observables de reconocimiento de presión, respuestas asertivas y compromisos personales.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para validar emociones adolescentes, monitoreo de lenguaje corporal y articulación colegiada de aula, culminando con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la herramienta se estructura en 3 etapas (`legacy-purpose`, `legacy-sequence`, `legacy-document`), procesándose en la etapa final (`currentStep: 2`) mediante `buildDocumentDocx`.
  - *Solución*: Se implementó el generador Vitest `qaExport49SesionesTutoria.test.ts`, se verificaron los 5 apartados y ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode inyectando el borrador completo y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 50: Informe de Tutoría (`tutoria/informe-tutoria`)
- **Archivo Físico**: `exports-qa-word/50-tutoria-informe-tutoria.docx`
- **Peso**: 13,636 bytes | **Hash SHA-256**: `8251ba1912eeed135b652adc334b704b1d2dc60a859e47652887e65e5f5abf45`
- **Captura Light**: `audit-screens/qa-50-informe-tutoria-preview.png`
- **Captura Dark**: `audit-screens/qa-50-informe-tutoria-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral `DOCUMENTO PEDAGÓGICO EDITABLE`, título oficial `INFORME TÉCNICO BIMESTRAL DE GESTIÓN DE TUTORÍA Y ORIENTACIÓN EDUCATIVA (TOE)`, subtítulo institucional `EDUCACIÓN BÁSICA · NIVEL: SECUNDARIA · GRADO: 4° DE SECUNDARIA "B"`, y tabla institucional completa de metadatos (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Informe oficial de balance tutorial del I Bimestre 2026 para 4° de Secundaria 'B' elaborado conforme a las directivas del CNEB y la RVM N° 212-2020-MINEDU. Consolida el reporte de acciones ejecutadas en tutoría grupal, acompañamiento individual, articulación con familias y seguimiento a casos focalizados.
  3. **Mecánica Central**:
     - I. Datos de Cobertura, Población Atendida y Caracterización Inicial: 30 estudiantes (16 mujeres, 14 varones), 96.8% de permanencia tutorial; diagnóstico de necesidades en gestión del tiempo y uso responsable de móviles.
     - II. Reporte Consolidado de Acciones Ejecutadas por Líneas de Acción: 8 sesiones grupales de convivencia, asertividad, ciberacoso y proyecto de vida; 12 entrevistas individuales con 6 alumnos focalizados; 1 Escuela de Padres y 6 entrevistas concertadas.
     - III. Balance Cualitativo: Logros Alcanzados (cero incidentes graves, reducción de tardanzas), Dificultades Detectadas (ausentismo laboral familiar en 3 casos) y Medidas Remediales (adecuación horaria y actas de compromiso).
     - IV. Conclusiones y Recomendaciones para la Gestión Tutorial del II Bimestre: Intensificación de orientación vocacional, coordinación docente bimensual y seguimiento con asistencia social.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Pautas para custodia confidencial de expedientes, alianzas con familias y articulación con psicología escolar, concluyendo con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la herramienta se compone de 2 etapas (`legacy-data`, `legacy-document`), procesándose en la etapa final (`currentStep: 1`) mediante `buildDocumentDocx`.
  - *Solución*: Se implementó el generador Vitest `qaExport50InformeTutoria.test.ts`, se certificaron los 5 apartados y ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode con inyección del borrador oficial y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 51: Informe a Padres de Familia (`tutoria/informe-padres`)
- **Archivo Físico**: `exports-qa-word/51-tutoria-informe-padres.docx`
- **Peso**: 11,594 bytes | **Hash SHA-256**: `72c4700ae56622d02b3975e1bd03c5221bca0cf7ea81a196ed7e73b0bcca68f3`
- **Captura Light**: `audit-screens/qa-51-informe-padres-preview.png`
- **Captura Dark**: `audit-screens/qa-51-informe-padres-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral `DOCUMENTO PEDAGÓGICO EDITABLE`, nombre institucional formal `I.E. 0001 REPÚBLICA DEL PERÚ`, título `COMUNICADO OFICIAL A LA FAMILIA · CICLO ESCOLAR 2026` y tabla de metadatos (Para: Sres. Roberto Morales y Carmen Castro, Fecha, Estudiante: Valeria Andrea Morales Castro - 2° Secundaria "A", Asunto: Informe Individual a las Familias).
  2. **Consignas Pedagógicas**: Comunicación oficial a los padres de familia y apoderados emitida por la tutoría escolar en coordinación con la Dirección de la I.E. 0001 República del Perú. Informa los avances socioemocionales, logros de aprendizaje y pautas de acompañamiento domiciliario con talón desglosable de cargo firmado.
  3. **Mecánica Central**:
     - I. Saludo Institucional y Propósito Formativo del Encuentro: Encuadre afectuoso de alianza escuela-familia.
     - II. Logros Socioafectivos y Potencialidades Observadas en el Aula: Alta sensibilidad empática, solidaridad, liderazgo positivo y participación activa en Comunicación y Arte.
     - III. Aspectos de Acompañamiento Prioritario y Pautas para el Hogar: Rutina fija de 45 minutos sin distracciones digitales, gestión de la autoexigencia ante Matemática y diálogo afectivo diario.
     - IV. Acuerdos Suscritos, Canales de Contacto y Próxima Verificación: Compromisos de descanso nocturno, agenda diaria, seguimiento docente quincenal y revisión fijada para el 26 de junio de 2026.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior y pie de página formal con numeración «Página X de Y».
  5. **Solucionario Docente**: Doble bloque de firmas institucionales (Docente Responsable / Tutor y Dirección General) y **Talón Desglosable de Acuse de Recibo** con línea de corte formal (`✂ - - - - - -`), DNI, teléfono y firma del apoderado para archivo en la carpeta tutorial.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportWorkflowDocx.ts`, la herramienta se canalizó hacia `buildCommunicationDocx` para renderizar el formato oficial epistolar a las familias junto con el talón desglosable de cargo.
  - *Solución*: Se implementó el generador Vitest `qaExport51InformePadres.test.ts`, se certificaron los 5 apartados y ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode con inyección del borrador oficial y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 52: Fichas de Acompañamiento (`tutoria/fichas-acompanamiento`)
- **Archivo Físico**: `exports-qa-word/52-tutoria-fichas-acompanamiento.docx`
- **Peso**: 13,570 bytes | **Hash SHA-256**: `1004eefe08637020bedea4f36fd5e80c4649303ae22e52de018ba9a35521eef7`
- **Captura Light**: `audit-screens/qa-52-fichas-acompanamiento-preview.png`
- **Captura Dark**: `audit-screens/qa-52-fichas-acompanamiento-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral `DOCUMENTO PEDAGÓGICO EDITABLE`, título oficial `FICHA OFICIAL DE ACOMPAÑAMIENTO Y ORIENTACIÓN SOCIOEMOCIONAL TUTORIAL`, subtítulo institucional `EDUCACIÓN BÁSICA · NIVEL: SECUNDARIA · GRADO: 3° DE SECUNDARIA "B"`, y tabla de metadatos completa (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Instrumento técnico de registro y seguimiento de tutoría individualizada elaborado conforme a los lineamientos del CNEB y la RVM N° 212-2020-MINEDU para 3° de Secundaria. Documenta la entrevista de orientación personal, el diagnóstico de necesidades afectivas, las estrategias de soporte y los acuerdos vinculantes asumidos con el estudiante.
  3. **Mecánica Central**:
     - I. Datos Informativos de la Atención y Motivo de la Entrevista: Sebastián Alonso Quispe Mendoza (14 años, 3° 'B'), entrevista individual presencial reservada; motivo: aislamiento recurrente en trabajos grupales y baja de notas.
     - II. Indagación Socioafectiva, Escucha Activa y Manifestaciones del Estudiante: Preocupación por reorganización familiar por viaje laboral paterno, sobrecarga de tareas domésticas, autocrítica constructiva y voluntad de superación.
     - III. Orientaciones Pedagógicas y Estrategias Socioemocionales: Validación emocional y técnicas de respiración consciente, cronograma de estudio autónomo de 45 minutos y reintegración social al periódico mural.
     - IV. Acuerdos y Compromisos Vinculantes, Derivación y Ruta de Seguimiento: Cumplir horario de actividades, cita reservada con la madre de familia y próxima sesión tutorial fijada para el 11 de junio de 2026.
- **Peso**: 13,570 bytes | **Hash SHA-256**: `1004eefe08637020bedea4f36fd5e80c4649303ae22e52de018ba9a35521eef7`
- **Captura Light**: `audit-screens/qa-52-fichas-acompanamiento-preview.png`
- **Captura Dark**: `audit-screens/qa-52-fichas-acompanamiento-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral `DOCUMENTO PEDAGÓGICO EDITABLE`, título oficial `FICHA OFICIAL DE ACOMPAÑAMIENTO Y ORIENTACIÓN SOCIOEMOCIONAL TUTORIAL`, subtítulo institucional `EDUCACIÓN BÁSICA · NIVEL: SECUNDARIA · GRADO: 3° DE SECUNDARIA "B"`, y tabla de metadatos completa (DRE, UGEL, Institución Educativa, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Director(a), Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Instrumento técnico de registro y seguimiento de tutoría individualizada elaborado conforme a los lineamientos del CNEB y la RVM N° 212-2020-MINEDU para 3° de Secundaria. Documenta la entrevista de orientación personal, el diagnóstico de necesidades afectivas, las estrategias de soporte y los acuerdos vinculantes asumidos con el estudiante.
  3. **Mecánica Central**:
     - I. Datos Informativos de la Atención y Motivo de la Entrevista: Sebastián Alonso Quispe Mendoza (14 años, 3° 'B'), entrevista individual presencial reservada; motivo: aislamiento recurrente en trabajos grupales y baja de notas.
     - II. Indagación Socioafectiva, Escucha Activa y Manifestaciones del Estudiante: Preocupación por reorganización familiar por viaje laboral paterno, sobrecarga de tareas domésticas, autocrítica constructiva y voluntad de superación.
     - III. Orientaciones Pedagógicas y Estrategias Socioemocionales: Validación emocional y técnicas de respiración consciente, cronograma de estudio autónomo de 45 minutos y reintegración social al periódico mural.
     - IV. Acuerdos y Compromisos Vinculantes, Derivación y Ruta de Seguimiento: Cumplir horario de actividades, cita reservada con la madre de familia y próxima sesión tutorial fijada para el 11 de junio de 2026.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Pautas de custodia confidencial del expediente individual, verificación discreta de acuerdos y articulación tutorial con el hogar, concluyendo con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la herramienta se compone de 2 etapas (`legacy-data`, `legacy-document`), procesándose en la etapa final (`currentStep: 1`) mediante `buildDocumentDocx`.
  - *Solución*: Se implementó el generador Vitest `qaExport52FichasAcompanamiento.test.ts`, se certificaron los 5 apartados y ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode con inyección del borrador oficial y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 53: Alertas y Casos (`tutoria/alertas-casos`)
- **Archivo Físico**: `exports-qa-word/53-tutoria-alertas-casos.docx`
- **Peso**: 11,426 bytes | **Hash SHA-256**: `e07d236d85802daa3616b76a7e8bb50cd3d235126058846e7bffb2b37bdd2e37`
- **Captura Light**: `audit-screens/qa-53-alertas-casos-preview.png`
- **Captura Dark**: `audit-screens/qa-53-alertas-casos-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado institucional neutro y editable, sin atribuir un lema oficial no verificado; incluye el título `REGISTRO OFICIAL DE ALERTAS TEMPRANAS Y RUTA DE PROTECCIÓN INTEGRAL ESCOLAR`, el subtítulo `INFORME TÉCNICO PEDAGÓGICO DE SEGUIMIENTO Y ALERTAS` y la tabla de metadatos correspondiente.
  2. **Consignas Pedagógicas**: Documento de gestión tutorial y protección de derechos elaborado conforme al D.S. N° 004-2018-MINEDU y la plataforma SíseVe para 3° de Secundaria. Sistematiza la matriz de alertas tempranas, el registro objetivo de hechos, las medidas de contención inmediata y las rutas de derivación institucional protegida.
  3. **Mecánica Central**:
     - I. Datos del informe e identificación de la muestra de aula.
     - II. Resumen ejecutivo y marco normativo institucional (Ley N° 29719 y D.S. N° 004-2018-MINEDU).
     - III. **Matriz Semaforizada de Riesgo y Estado Pedagógico**:
       - *Alerta Crítica (Rojo Claro)*: Convivencia y presunto ciberacoso entre pares; activación del Libro de Incidencias, código SíseVe, separación de ambientes y contención inmediata.
       - *Alerta Moderada (Amarillo Claro)*: Vulnerabilidad socioemocional y aislamiento persistente; derivación protegida al CSMC y andamiaje tutorial.
       - *Alerta Preventiva (Verde Claro)*: Inasistencia reiterada y desenganche temprano; acta de compromiso de permanencia y flexibilización de tareas.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado superior formal y pie de página institucional «Página X de Y».
  5. **Solucionario Docente**: Plan de acción institucional, preservación de confidencialidad y plazos normativos estrictos de 24 horas, concluyendo con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `exportWorkflowDocx.ts`, la herramienta se canaliza hacia `buildAnalyticsDocx` para renderizar la matriz semaforizada de clasificación de casos, protocolos y seguimiento tutorial.
  - *Solución*: Se diseñó el generador Vitest `qaExport53AlertasCasos.test.ts`, se certificó la integridad técnica y ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode con inyección del borrador oficial y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

### Herramienta 54: Recursos de Tutoría (`tutoria/recursos-tutoria`)
- **Archivo Físico**: `exports-qa-word/54-tutoria-recursos-tutoria.docx`
- **Peso**: 13,710 bytes | **Hash SHA-256**: `e9c385313d5660c6daf6b6be1c0decee457d6e3b48ed742811d143b179baca12`
- **Captura Light**: `audit-screens/qa-54-recursos-tutoria-preview.png`
- **Captura Dark**: `audit-screens/qa-54-recursos-tutoria-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado institucional neutro y editable, sin atribuir un lema oficial no verificado; incluye el título `GUÍA OFICIAL DE RECURSOS DIDÁCTICOS Y DINÁMICAS VIVENCIALES DE TUTORÍA (TOE)`, el subtítulo institucional y la tabla de metadatos correspondiente.
  2. **Consignas Pedagógicas**: Compendio metodológico de dinámicas grupales, fichas de reflexión socioemocional y guías de facilitación tutorial para Educación Secundaria elaborado bajo el marco del CNEB y la RVM N° 212-2020-MINEDU. Proporciona herramientas estructuradas para el fortalecimiento de la cohesión grupal, la empatía activa y la convivencia democrática.
  3. **Mecánica Central**:
     - I. Fundamentación Curricular y Dimensión de la Tutoría: Dimensión Social y Convivencia Escolar; propósito: escucha activa, interdependencia positiva y enfoque del bien común.
     - II. Dinámica Vivencial Central ('La Red de Apoyo y el Puente de la Confianza'): Preparación de materiales (lana, pelota liviana), fases de facilitación (lanzamiento del ovillo, tensión compartida y corte simbólico).
     - III. Ficha de Trabajo Reflexivo y Preguntas Metacognitivas Guiadas: Identificación emocional, análisis de interdependencia grupal y compromiso solidario por escrito.
     - IV. Pautas de Cuidado Socioemocional y Adaptaciones Inclusivas (DUA): Resguardo afectivo para estudiantes tímidos, adaptaciones para discapacidad y alertas de derivación.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones para ambientación previa, validación empática de respuestas y réplica institucional, culminando con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la herramienta se estructura en 3 etapas (`legacy-params`, `legacy-bank`, `legacy-document`), procesándose en la etapa final (`currentStep: 2`) mediante `buildDocumentDocx`.
  - *Solución*: Se diseñó el generador Vitest `qaExport54RecursosTutoria.test.ts`, se certificó la integridad técnica y ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode con inyección del borrador oficial y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **54** | `tutoria/recursos-tutoria` | **Recursos de Tutoría** | B7: Tutoría y Orientación | `54-tutoria-recursos-tutoria.docx` | `qa-54-recursos-tutoria-preview.png` | `[X] CERTIFICADA` | SHA256: `e9c38531...` (13,710 B) |

### Herramienta 55: Orientación Vocacional (`tutoria/orientacion-vocacional`)
- **Archivo Físico**: `exports-qa-word/55-tutoria-orientacion-vocacional.docx`
- **Peso**: 13,644 bytes | **Hash SHA-256**: `94c288c2e2bd038a1154e0190e92054407f5abf03d3bea215f41615adca7a076`
- **Captura Light**: `audit-screens/qa-55-orientacion-vocacional-preview.png`
- **Captura Dark**: `audit-screens/qa-55-orientacion-vocacional-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado institucional neutro y editable, sin atribuir un lema oficial no verificado; incluye el título `PLAN Y RUTA INTEGRAL DE ORIENTACIÓN VOCACIONAL: CONSTRUCCIÓN DEL PROYECTO DE VIDA`, el subtítulo institucional y la tabla de metadatos correspondiente.
  2. **Consignas Pedagógicas**: Documento de orientación vocacional y ocupacional diseñado para 5° de Secundaria bajo las directivas del CNEB y la RVM N° 212-2020-MINEDU. Proporciona una ruta metodológica estructurada para la exploración de intereses, la identificación de habilidades y la toma informada de decisiones formativas y profesionales con proyección comunitaria.
  3. **Mecánica Central**:
     - I. Síntesis del Perfil Vocacional, Intereses y Fortalezas Personales: Leonardo Fabricio Vega Chumpitaz (16 años, 5° 'A'); razonamiento computacional, robótica, alto rendimiento en matemática y ciencias, vocación de servicio social.
     - II. Áreas Vocacionales Compatibles y Exploración de Oferta Formativa: Ingeniería de Sistemas / Ciencias de la Computación (UNMSM/UNI), Mecatrónica Industrial (SENATI/TECSUP); postulación a PRONABEC Beca 18 y consulta en el portal 'Mi Carrera' del MTPE.
     - III. Ruta de Exploración Activa y Plan de Próximos Pasos: Batería de test vocacionales MTPE, ferias vocacionales, simulacros de examen de admisión y carpeta de méritos académicos.
     - IV. Orientación Familiar, Diálogo en el Hogar y Decisión Informada: Diálogo sin presiones parentales, presupuesto familiar de estudios y acompañamiento tutorial socioafectivo.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones pedagógicas sobre dinamismo vocacional, acceso al Aula de Innovación (AIP) y prevención de estrés preuniversitario, concluyendo con bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En `legacyWorkflowShapes.ts`, la herramienta no contaba con una definición explícita de etapas, lo que producía una vista predeterminada no homologada con el resto del módulo.
  - *Solución*: Se integró la definición de etapas en `legacyWorkflowShapes.ts` (`legacy-student`, `legacy-exploration`, `legacy-route`, `legacy-document`), se diseñó el generador Vitest `qaExport55OrientacionVocacional.test.ts`, se certificó la integridad técnica y ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **55** | `tutoria/orientacion-vocacional` | **Orientación Vocacional** | B7: Tutoría y Orientación | `55-tutoria-orientacion-vocacional.docx` | `qa-55-orientacion-vocacional-preview.png` | `[X] CERTIFICADA` | SHA256: `94c288c2...` (13,644 B) |

---

## BLOQUE 7: TUTORÍA Y ORIENTACIÓN EDUCATIVA (Herramientas 48 a 55) — 100% COMPLETADO Y CERTIFICADO
- Herramienta 48: Plan de Tutoría (`tutoria/plan-tutoria`) — **CERTIFICADO**
- Herramienta 49: Sesiones de Tutoría (`tutoria/sesiones-tutoria`) — **CERTIFICADO**
- Herramienta 50: Informe de Tutoría (`tutoria/informe-tutoria`) — **CERTIFICADO**
- Herramienta 51: Informe a Padres de Familia (`tutoria/informe-padres`) — **CERTIFICADO**
- Herramienta 52: Fichas de Acompañamiento (`tutoria/fichas-acompanamiento`) — **CERTIFICADO**
- Herramienta 53: Alertas y Casos (`tutoria/alertas-casos`) — **CERTIFICADO**
- Herramienta 54: Recursos de Tutoría (`tutoria/recursos-tutoria`) — **CERTIFICADO**
- Herramienta 55: Orientación Vocacional (`tutoria/orientacion-vocacional`) — **CERTIFICADO**

---

## BLOQUE 8: EVALUAMOS ESPECIALIZADO (Herramientas 56 y 57) — 100% COMPLETADO Y CERTIFICADO

### Herramienta 56: Ficha de Aprendizaje (`evaluamos/ficha-aprendizaje`)
- **Archivo Físico**: `exports-qa-word/56-evaluamos-ficha-aprendizaje.docx`
- **Peso**: 13,818 bytes | **Hash SHA-256**: `137035181225c03d53049922787ef5ea6665d3a572b2814fb58cf3f907920aa3`
- **Captura Light**: `audit-screens/qa-56-ficha-aprendizaje-preview.png`
- **Captura Dark**: `audit-screens/qa-56-ficha-aprendizaje-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `FICHA DE APRENDIZAJE Y EVALUACIÓN AUTÉNTICA: GESTIÓN SOSTENIBLE DE LOS RECURSOS HÍDRICOS`, subtítulo institucional `ÁREA: CIENCIA Y TECNOLOGÍA · NIVEL: SECUNDARIA · GRADO: 2° DE SECUNDARIA "A"`, y tabla institucional de información general con 8 campos completos (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Directora, Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Ficha técnica de aprendizaje activo, modelación científica y evaluación formativa orientada a la competencia 'Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo' para 2° de Secundaria.
  3. **Mecánica Central**:
     - I. Propósito de Aprendizaje, Competencias y Criterios CNEB (desempeños precisados, enfoque ambiental y derechos).
     - II. Práctica Guiada de Tratamiento Fisicoquímico (análisis comparativo de coagulación, sedimentación y biofiltración).
     - III. Reto Autónomo de Auditoría Hídrica (cálculo de consumo familiar de 18 m³ mensuales y prototipo de biofiltro para aguas grises).
     - IV. Cuestionario Multinivel de Comprensión Científica (reactivos literales, inferenciales y juicio crítico).
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («I.E. 0001 REPÚBLICA DEL PERÚ · Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Clave de respuestas fundamentada, pautas de retroalimentación reflexiva, rúbrica analítica holística y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En la UI web, `evaluamos/ficha-aprendizaje` opera con el asistente especializado `SourceDocumentTool` con asistente de 5 etapas (`frame`, `source`, `activities`, `criteria`, `preview`). El instrumento se gestiona transaccionalmente mediante la API `/api/v1/evaluation-instruments` con identificador UUID.
  - *Solución*: Se diseñó el generador Vitest `qaExport56FichaAprendizaje.test.ts`, se certificó la integridad técnica y ausencia total de placeholders con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode con inyección del borrador oficial vía API y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **56** | `evaluamos/ficha-aprendizaje` | **Ficha de Aprendizaje** | B8: Evaluamos Especializado | `56-evaluamos-ficha-aprendizaje.docx` | `qa-56-ficha-aprendizaje-preview.png` | `[X] CERTIFICADA` | SHA256: `13703518...` (13,818 B) |

### Herramienta 57: Carpetas de Recuperación (`evaluamos/carpetas-recuperacion`)
- **Archivo Físico**: `exports-qa-word/57-evaluamos-carpetas-recuperacion.docx`
- **Peso**: 14,279 bytes | **Hash SHA-256**: `1156ea3a3c4fcaedf11cf142d1b791cb8c348acad75d2a955d6fc67c7100b120`
- **Captura Light**: `audit-screens/qa-57-carpetas-recuperacion-preview.png`
- **Captura Dark**: `audit-screens/qa-57-carpetas-recuperacion-dark.png`
- **Inspección de 5 Apartados**:
  1. **Membrete CNEB**: Presente con encabezado pedagógico neutral, título oficial `CARPETA DE RECUPERACIÓN PEDAGÓGICA 2026: MATEMÁTICA Y RESOLUCIÓN DE PROBLEMAS AUTÉNTICOS`, subtítulo institucional `ÁREA: MATEMÁTICA · NIVEL: SECUNDARIA · GRADO: 2° DE SECUNDARIA "B"`, y tabla institucional de metadatos (DRE, UGEL, I.E. 0001 República del Perú, Nivel/Grado/Sección, Área Curricular, Docente Responsable, Directora, Año Lectivo 2026).
  2. **Consignas Pedagógicas**: Instrumento curricular y pedagógico de recuperación de aprendizajes para estudiantes que requieren consolidación en competencias matemáticas prioritarias de Educación Secundaria (Ciclo VI / 2° de Secundaria), conforme a la RVM N° 094-2020-MINEDU y los lineamientos del CNEB. Organiza actividades desafiantes, criterios de autoevaluación y compromisos familiares para el logro del nivel esperado.
  3. **Mecánica Central**:
     - I. Diagnóstico de Necesidades de Aprendizaje y Grupo Focalizado (4 estudiantes de 2° B, brechas en problemas de cantidad y regularidad).
     - II. Competencias Priorizadas, Criterios de Evaluación y Evidencias (Resuelve problemas de cantidad y Resuelve problemas de regularidad con rúbrica analítica y portafolio).
     - III. Ruta Metodológica y Secuencia de 4 Actividades de Recuperación (Presupuesto de emprendimiento familiar, Distribución en biohuerto escolar, Comparación de ofertas comerciales y porcentajes, Plan de ahorro y consumo eficiente).
     - IV. Cronograma de Trabajo Autónomo de 4 Semanas y Orientaciones para el Acompañamiento Familiar (horario fijo de 60 min, compromiso de firma y asesoría presencial los miércoles).
     - V. Sistema de Retroalimentación, Evaluación Formativa y Cierre en SIAGIE.
     - CERO textos genéricos o `[Espacio para desarrollo]`.
  4. **Paginación y Formato**: Paginación limpia con encabezado institucional superior derecho («Planificación Curricular CNEB · 2026») y pie de página formal con numeración de páginas «Página X de Y».
  5. **Solucionario Docente**: Orientaciones pedagógicas para la revisión docente, valoración del error constructivo, pautas para la entrevista formativa con apoderados y bloque formal de doble firma docente y directiva.
- **Diagnóstico y Corrección Aplicada**:
  - *Diagnóstico*: En la UI web, `evaluamos/carpetas-recuperacion` utiliza el asistente `RecoveryFolderTool` con selección de nómina de estudiantes, 5 etapas de trabajo (`diagnosis`, `competencies`, `activities`, `family`, `preview`) e integración con la API de instrumentos bajo el tipo `recovery`.
  - *Solución*: Se implementó el generador Vitest `qaExport57CarpetasRecuperacion.test.ts`, se verificó la ausencia total de placeholders y la presencia de los 5 apartados con Python, se ejecutó Puppeteer para capturar en Light y Dark Mode con persistencia en la API `/api/v1/evaluation-instruments` y se certificó con paridad total.
- **Veredicto**: **APROBADO Y CERTIFICADO**.

| **57** | `evaluamos/carpetas-recuperacion` | **Carpetas de Recuperación** | B8: Evaluamos Especializado | `57-evaluamos-carpetas-recuperacion.docx` | `qa-57-carpetas-recuperacion-preview.png` | `[X] CERTIFICADA` | SHA256: `1156ea3a...` (14,279 B) |

---

## RESUMEN DE CIERRE DEL BLOQUE 8: EVALUAMOS ESPECIALIZADO (Herramientas 56 y 57)
- **Total Herramientas Bloque 8**: 2 / 2 (100% Completado).
- **Archivos DOCX Físicos Generados e Inspeccionados**:
  - `56-evaluamos-ficha-aprendizaje.docx` (13,818 B, SHA256: `1370351812...`)
  - `57-evaluamos-carpetas-recuperacion.docx` (14,279 B, SHA256: `1156ea3a3c...`)
- **Capturas de Pantalla HD (Light y Dark)**: 4 capturas en `audit-screens/`.
- **Ocurrencias de `[Espacio para desarrollo]`**: 0 (CERO en todo el bloque).
- **Estado de Bloque**: **FINALIZADO Y CERTIFICADO PARA VALIDACIÓN HUMANA**.

---

## BALANCE GLOBAL DE LA AUDITORÍA: 57 DE 57 HERRAMIENTAS CERTIFICADAS (100%)
- **Bloque 1: Recursos Didácticos (Herramientas 01 a 15)**: 15 / 15 (100% Certificadas)
- **Bloque 2: Planificamos (Herramientas 16 a 23)**: 8 / 8 (100% Certificadas)
- **Bloque 3: Evaluamos Principal (Herramientas 24 a 32)**: 9 / 9 (100% Certificadas)
- **Bloque 4: Incluimos (Herramientas 33 a 37)**: 5 / 5 (100% Certificadas)
- **Bloque 5: Reforzamos (Herramientas 38 a 42)**: 5 / 5 (100% Certificadas)
- **Bloque 6: Acompañamos (Herramientas 43 a 47)**: 5 / 5 (100% Certificadas)
- **Bloque 7: Tutoría y Orientación Educativa (Herramientas 48 a 55)**: 8 / 8 (100% Certificadas)
- **Bloque 8: Evaluamos Especializado (Herramientas 56 y 57)**: 2 / 2 (100% Certificadas)
- **GRAN TOTAL**: **57 / 57 HERRAMIENTAS AUDITADAS Y CERTIFICADAS AL 100%**.

---

## Auditoría final de integración · 2026-09-04

Esta sección reemplaza como evidencia vigente los pesos y hashes históricos de los apartados anteriores, ya que los DOCX fueron regenerados después de las correcciones finales.

- Cobertura funcional: 57 herramientas y 58 rutas registradas; la adaptación NEE/DUA está disponible en dos módulos.
- Generación: contrato específico por herramienta, campos contextuales, matrices estructuradas, edición parcial y validación de calidad.
- IA: Gemini validado con una sugerencia contextual y una presentación real de ocho diapositivas.
- Exportación: 57 documentos de referencia regenerados; revisión visual completa de las últimas nueve salidas y revisión final por arquetipos.
- Correcciones visuales finales: PCA compactado a dos páginas útiles; rúbrica compactada a una; firmas condicionales; agrupación y secuencias separan ficha y solucionario; encabezado neutro sin lemas no verificados.
- Interfaz: responsive en móvil/tableta/escritorio, temas claro y oscuro, tres tamaños de letra, calendario con alta/edición de fechas y barra lateral adaptable.
- Seguridad: dashboard protegido por sesión, administración protegida por rol y cierre automático de sesión ante credenciales vencidas.
- Automatización: 61 pruebas backend y 156 pruebas frontend aprobadas; lint de ambos proyectos y compilación de producción aprobados.
- Ejecución local verificada: frontend en `http://127.0.0.1:5173` y API en `http://127.0.0.1:8001`.

### Rutas funcionales incorporadas después del inventario histórico

| Ruta | Evidencia de salida | Validación final |
|---|---|---|
| `evaluamos/ficha-aprendizaje` | `56-evaluamos-ficha-aprendizaje.docx` | Ficha extensa con aplicación, actividades, respuestas, criterios y orientación docente; render visual aprobado. |
| `evaluamos/carpetas-recuperacion` | `50-evaluamos-carpetas-recuperacion.docx` | Recuperación individual/grupal con diagnóstico, ruta, evidencias, cronograma y seguimiento; render visual aprobado. |
| `evaluamos/analytics-alertas` | Renderizador analítico compartido y contrato propio de ruta | Indicadores, riesgos, hallazgos y acciones correctivas con matriz semaforizada; pruebas automatizadas aprobadas. |

El inventario técnico contiene 58 rutas porque `adaptacion-nee-dua` existe en Planificamos e Incluimos; ambas representan una sola herramienta funcional dentro del catálogo de 57.

**Veredicto final:** implementación terminada y validada conforme al plan vivo; no quedan defectos bloqueantes conocidos. La advertencia de tamaño de paquete emitida por Vite es una optimización de rendimiento posterior y no impide el funcionamiento.

---









