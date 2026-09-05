# ESPECIFICACIÓN DETALLADA — MÓDULO 1: PLANIFICAMOS (8 HERRAMIENTAS)

Esta especificación detalla la homologación completa de los formularios, generación IA y formato Word de cada una de las 8 herramientas del módulo **Planificamos**, replicando exactamente los cuadros, opciones y notas de `C:\Users\PC\Desktop\Avendia` con el diseño y paleta oficial de Avend Escala 3.0.

---

## 1. PLAN CURRICULAR ANUAL (PCA) (`/dashboard/planificamos/plan-curricular-anual`)

### A. Campos y Cuadros de Entrada (9 Pasos)
- **Paso 1: DATOS INFORMATIVOS Y ESTRUCTURA**
  * **Bloque 1: 1. DATOS INFORMATIVOS (DRE / UGEL / I.E.)** (Grid 3 columnas)
    - DRE *: Input texto | Placeholder: "Ej: SAN MARTÍN"
    - UGEL *: Input texto | Placeholder: "Ej: LAMAS"
    - Institución Educativa *: Input texto | Placeholder: "Ej: MARTÍN DE LA RIVA Y HERRERA"
  * **Bloque 2: 2. ESTRUCTURA Y MODALIDAD CURRICULAR** (Grid 3 columnas)
    - Modelo de Servicio Educativo (MSE): Select con 6 opciones:
      ["JER (Jornada Escolar Regular)", "JEC (Jornada Escolar Completa)", "MSR (Modelo de Servicio en Secundaria Rural)", "SRE (Secundaria con Residencia Estudiantil)", "ST (Secundaria Tutorial)", "EIB (Educación Intercultural Bilingüe)"]
    - Modalidad: Select con ["EBR (Educación Básica Regular)", "EBA (Educación Básica Alternativa)", "EBE (Educación Básica Especial)"]
    - Nivel Académico: Select con ["Inicial", "Primaria", "Secundaria"]
    - Generar PCA por: Radio buttons (•) Grado | ( ) Ciclo
    - Grado Académico / Ciclo: Select dinámico según el nivel y radio seleccionado.
    - Secciones: Input texto | Placeholder: "Ej: A, B, C, D"
    - Tiempo de Ejecución: Input texto | Placeholder: "Ej: Del 16 de marzo al 18 de diciembre"
    - Año Lectivo: Input numérico con valor predeterminado "2026"
  * **Bloque 3: 3. SELECCIÓN DE ÁREAS CURRICULARES**
    - Multi-select con chips interactivos de áreas CNEB del nivel.
  * **Bloque 4: 4. RESPONSABLES Y ENFOQUE DEL DOCUMENTO**
    - Docente responsable *, Director(a) *, Subdirector(a) (opcional).
    - Enfoque pedagógico: Select ["Constructivista / sociocognitivo", "ABP", "Aula invertida", "STEM"]
    - Tono de redacción: Select ["Técnico y formal", "Práctico y sencillo", "Innovador y tecnológico"]
    - Enfoque de evaluación: Select ["Evaluación formativa (continua)", "Sumativa", "Autoevaluación y coevaluación"]
- **Paso 2: DESCRIPCIÓN Y DIAGNÓSTICO**
  * 4 Textareas con botón Sugerir / Pulir con IA: Justificación, Perfil de egreso, Características de los estudiantes y Contexto territorial.
- **Paso 3: CALENDARIZACIÓN DEL AÑO ESCOLAR**
  * Subtítulo: "SUBA LA IMAGEN DE SU CALENDARIZACIÓN DEL AÑO ESCOLAR (OPCIONAL). SI NO LA SUBE, EN EL DOCUMENTO WORD APARECERÁ UN ESPACIO PARA QUE LA PEGUE DESPUÉS."
  * Dropzone interactivo de imagen (PNG, JPG, máx. 5MB) con previsualización y botón de quitar.
  * Consejo metodológico rotulado con icono de bombilla.
- **Paso 4: DEMANDAS Y MATRIZ DE PROBLEMAS**
  * Selector: Bimestral (4 unidades) o Trimestral (3 unidades).
  * Matriz de problemas priorizados: Lista dinámica de filas con botón + Añadir problema y modal para pegar problemas en lote.
  * Prioridades institucionales 1, 2 y 3.
- **Paso 5: COMPETENCIAS, ENFOQUES Y TUTORÍA**
  * Selección de competencias CNEB priorizadas.
  * Enfoques transversales multicheck (Derechos, Inclusivo, Intercultural, Género, Ambiental, Bien común, Excelencia).
  * Dimensiones de tutoría (Personal, Social, Aprendizaje) y actividades vinculadas.
- **Paso 6: MATERIALES Y RECURSOS**
  * Listas dinámicas de recursos del docente, del estudiante y catálogo de textos MINEDU.
- **Paso 7: REFERENCIAS NORMATIVAS**
  * Resoluciones RVM MINEDU vigentes y marco curricular CNEB.
- **Paso 8: BIBLIOGRAFÍA**
  * Bibliografía APA para docente y estudiante + libros propios del docente.
- **Paso 9: CIERRE, VALIDACIÓN Y EXPORTACIÓN**
  * Vista previa integral del PCA y botón de descarga en formato Word (.docx).

### B. Generación con IA
- Rol: Asesor Pedagógico y Metodólogo del MINEDU especialista en el CNEB.
- Parámetros: Inyecta DRE, UGEL, I.E., MSE, Nivel, Grado, Áreas y Enfoques.
- Salida: Textos técnicos en tercera persona por campo y matriz anual completa en formato tabular.

### C. Formato Word Generado (.docx)
- Encabezado formal PLAN CURRICULAR ANUAL - 2026.
- Tabla I de datos generales sombreada en azul institucional tenue.
- Imagen de calendarización incrustada o cuadro punteado rotulado.
- Matriz anual en orientación horizontal con 8 columnas.
- Firmas en dos columnas del Docente y Dirección.
