# PROMPT MAESTRO Y ESPECIFICACIÓN NORMATIVA: DOCX Y PREVISUALIZACIÓN WORD PARA LAS 57 HERRAMIENTAS PEDAGÓGICAS (CNEB - MINEDU)

## 1. MISIÓN Y OBJETIVO GENERAL
Diseñar, implementar y validar un motor unificado y especializado de generación de documentos Word (.docx) y previsualización interactiva tipo hoja de Word ("Paper View") para las 57 herramientas de la plataforma Avendia, garantizando que cada herramienta cuente con un formato institucional, visual y pedagógicamente adaptado a su naturaleza operativa, erradicando los formatos genéricos planos y aplicando las normas del Currículo Nacional de la Educación Básica (CNEB) y del Ministerio de Educación del Perú (MINEDU).

---

## 2. ARQUITECTURA DE FORMATOS POR ARQUETIPO (6 FAMILIAS PEDAGÓGICAS)

### ARQUETIPO A: DOCUMENTOS DE GESTIÓN Y PLANIFICACIÓN CURRICULAR (21 Herramientas)
- **Herramientas**:
  1. `planificamos/plan-curricular-anual`
  2. `planificamos/unidad-aprendizaje`
  3. `planificamos/sesion-aprendizaje`
  4. `planificamos/situacion-significativa`
  5. `planificamos/proyectos-integrados`
  6. `planificamos/adaptacion-nee-dua`
  7. `planificamos/carpeta-pedagogica`
  8. `evaluamos/carpetas-recuperacion`
  9. `incluimos/adaptacion-nee-dua`
  10. `incluimos/plan-atencion`
  11. `incluimos/estrategias-inclusion`
  12. `reforzamos/carpeta-recuperacion`
  13. `reforzamos/acompanamiento-motivacion`
  14. `reforzamos/plan-refuerzo`
  15. `acompanamos/reporte-seguimiento`
  16. `tutoria/plan-tutoria`
  17. `tutoria/sesiones-tutoria`
  18. `tutoria/informe-tutoria`
  19. `tutoria/informe-padres`
  20. `tutoria/fichas-acompanamiento`
  21. `tutoria/orientacion-vocacional`
- **Características de Formato DOCX y Preview**:
  - Encabezado oficial con año ministerial en cursiva («...»).
  - Tabla de Datos Informativos institucional (DRE, UGEL, I.E., Grado, Sección, Área, Docente, Director).
  - Tablas especializadas para matrices (ej. Sesión con tabla de 3 momentos: Inicio, Desarrollo y Cierre con tiempos y procesos pedagógicos; Unidad con matriz de propósitos y evidencias; Plan de tutoría con dimensiones TOE).
  - Bloque final oficial de firmas (Docente Responsable y Director/a de la I.E.).

### ARQUETIPO B: INSTRUMENTOS Y MATRICES DE EVALUACIÓN FORMATIVA (7 Herramientas)
- **Herramientas**:
  1. `evaluamos/rubrica-evaluacion`
  2. `evaluamos/lista-cotejo`
  3. `evaluamos/escala-estimacion`
  4. `evaluamos/ficha-observacion`
  5. `evaluamos/examen`
  6. `evaluamos/preguntas-texto`
  7. `evaluamos/registros-auxiliares`
- **Características de Formato DOCX y Preview**:
  - Rúbricas: Matriz analítica en orientación horizontal (Landscape) con escala AD, A, B, C, criterios y descriptores observables.
  - Listas de cotejo: Tabla con columnas N°, Criterio / Desempeño observable, Sí, No, Observaciones.
  - Examen / Prueba: Formato de prueba para el alumno con encabezado para estudiante (Apellidos y Nombres, Grado y Sección, Fecha), instrucciones, preguntas graduadas (literal, inferencial, crítico) y clave de respuestas docente.
  - Registros auxiliares: Matriz con nómina de estudiantes y columnas para criterios de evaluación bimestral.

### ARQUETIPO C: ACTIVIDADES PRÁCTICAS Y JUEGOS DIDÁCTICOS (12 Herramientas)
- **Herramientas**:
  1. `planificamos/tarea-extension-hogar`
  2. `reforzamos/trabajo-autonomo`
  3. `recursos/tarjetas-estudio`
  4. `recursos/agrupar-palabras`
  5. `recursos/ordenar-bloques`
  6. `recursos/casos-estudio`
  7. `recursos/ahorcado`
  8. `recursos/completa-frase`
  9. `recursos/emparejar-palabras`
  10. `recursos/debate-aula`
  11. `recursos/crucigramas`
  12. `recursos/sopas-letras`
- **Características de Formato DOCX y Preview**:
  - Ficha de aplicación lista para imprimir para el estudiante.
  - Cuadrículas formateadas (crucigramas y sopas de letras con tablas simétricas centradas de alta precisión).
  - Tarjetas de estudio en cuadrícula recortable con línea discontinua.
  - Sección de Solucionario y Orientaciones para el Docente al final.

### ARQUETIPO D: ANÁLISIS, MÉTRICAS Y ALERTAS PEDAGÓGICAS (7 Herramientas)
- **Herramientas**:
  1. `evaluamos/calificador-rubrica`
  2. `evaluamos/analytics-alertas`
  3. `incluimos/seguimiento-evaluacion`
  4. `reforzamos/monitorea-avances`
  5. `acompanamos/analytics-alertas`
  6. `acompanamos/calificador-ia`
  7. `tutoria/alertas-casos`
- **Características de Formato DOCX y Preview**:
  - Informe Técnico Pedagógico Ejecutivo.
  - Tabla semaforizada de estudiantes según nivel de riesgo (Crítico/Inicio, En proceso, Logrado).
  - Resumen cuantitativo y cualitativo de indicadores.
  - Plan de acción remedial o ruta de derivación tutoral con responsables y firmas.

### ARQUETIPO E: COMUNICACIONES OFICIALES Y FAMILIARES (3 Herramientas)
- **Herramientas**:
  1. `incluimos/trabajo-familias`
  2. `acompanamos/correo-familias`
  3. `acompanamos/respuesta-correo`
- **Características de Formato DOCX y Preview**:
  - Formato de Carta / Oficio / Comunicado institucional membretado.
  - Encabezado con datos del destinatario (Familia / Apoderado / Autoridad).
  - Cuerpo de la comunicación en párrafos formales con acuerdos y citaciones.
  - Espacio para firma del docente / tutor y talón desglosable de acuse de recibo de la familia.

### ARQUETIPO F: RECURSOS DIDÁCTICOS Y GUÍAS CURRICULARES (7 Herramientas)
- **Herramientas**:
  1. `evaluamos/ficha-aprendizaje`
  2. `tutoria/recursos-tutoria`
  3. `recursos/presentaciones-didacticas`
  4. `recursos/banco-planificacion`
  5. `recursos/normativa-educativa`
  6. `recursos/libros-guia-minedu`
  7. `recursos/canales-audiovisuales`
- **Características de Formato DOCX y Preview**:
  - Fichas de aprendizaje con propósitos claros, actividades graduadas y autoevaluación.
  - Guiones didácticos estructurados con tablas de tiempos, objetivos, recursos y enlaces pedagógicos.

---

## 3. ESTÁNDAR TÉCNICO Y VISUAL APLICADO A TODAS LAS HERRAMIENTAS
1. **Paleta Institucional**:
   - Primario: Azul profundo MINEDU (`#1F4D78`).
   - Secundario: Azul medio (`#2E74B5`).
   - Cabeceras de tabla: `#BDD7EE` (o `#1F4D78` con texto blanco).
   - Filas alternas (Cebra): `#F8FAFC`.
   - Bordes: `#BDD7EE` o `#D1D5DB`.
2. **Tipografía**:
   - Títulos en Calibri / Aptos 14-16pt negrita.
   - Encabezados de sección 11-12pt negrita.
   - Tablas y cuerpo 9-10pt con interlineado 1.15.
3. **Previsualización en Pantalla**:
   - Todas las 57 herramientas renderizan una hoja de papel Word realista (`.word-document-paper`) en su paso de resultados.
   - Soporte nativo para modo claro y modo oscuro.
   - Barra con selector de vistas y botones de descarga e impresión.
