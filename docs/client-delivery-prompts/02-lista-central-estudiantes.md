# Punto 2 · Lista central de estudiantes reutilizable

## Objetivo

Implementar en Avendia una nómina central por docente, persistida en la base de datos y reutilizable por todas las herramientas que trabajan con estudiantes. Debe reemplazar los cuadros de nombres separados por comas por una selección segura, ordenada y editable, conservando el diseño azul/violeta actual, los modos claro y oscuro y el comportamiento responsive.

## Alcance funcional

1. Crear la sección **Mis estudiantes** accesible desde el perfil docente y desde los selectores de estudiante de cada herramienta.
2. Organizar las nóminas por año lectivo, modalidad, nivel/ciclo, grado, sección e institución.
3. Permitir:
   - crear una nómina;
   - agregar un estudiante manualmente;
   - editar nombre y datos pedagógicos no sensibles;
   - desactivar o retirar un estudiante sin perder documentos anteriores;
   - reordenar la nómina;
   - buscar y filtrar;
   - seleccionar uno, varios o toda el aula.
4. Importar archivos reales `.xlsx`, `.xls` y `.csv`:
   - detectar columnas habituales como N.°, apellidos y nombres, nombre completo, DNI/código, sexo y observación;
   - mostrar una vista previa antes de guardar;
   - permitir corregir el mapeo de columnas;
   - ignorar filas totalmente vacías;
   - detectar duplicados dentro del archivo y contra la nómina existente;
   - nunca inventar estudiantes si el archivo no puede leerse;
   - explicar el error con una solución concreta.
5. Ofrecer una plantilla Excel descargable con encabezados claros y una fila de ejemplo que no se importe.
6. Crear un selector reutilizable para las herramientas, con estas variantes:
   - un estudiante;
   - varios estudiantes;
   - aula completa;
   - grupo con nombre y miembros.
7. Mantener compatibilidad temporal con los campos de texto existentes, pero convertir los nombres ingresados en una vista previa de estudiantes antes de generar.

## Datos y privacidad

- Cada nómina pertenece al usuario autenticado; un docente no puede leer ni modificar la de otro.
- El nombre completo es obligatorio. El código interno y documento son opcionales.
- No guardar diagnósticos médicos en esta tabla.
- Los borrados deben ser lógicos para conservar la trazabilidad de documentos.
- Validar tipo MIME, extensión y tamaño del archivo; rechazar libros corruptos o con macros.
- No escribir nombres ni documentos de identidad en los registros técnicos.

## Modelo mínimo

### Aula / nómina

- id
- owner_id
- school_year
- institution_name
- modality
- education_level
- grade
- section
- name opcional
- active
- created_at / updated_at

### Estudiante

- id
- roster_id
- full_name
- internal_code opcional
- document_number opcional
- notes opcional
- sort_order
- active
- created_at / updated_at

## Interfaz

- Encabezado con nombre de aula, total de estudiantes y acciones **Importar archivo**, **Agregar estudiante** y **Descargar plantilla**.
- Tabla de escritorio y tarjetas compactas en móvil.
- Los cuadros vacíos siempre muestran ejemplos y una breve instrucción.
- Antes de importar, usar un asistente de tres pasos: Archivo → Revisar columnas y filas → Confirmar.
- Mostrar un resumen de validación accesible y llevar el foco al error.
- En móvil, modales y acciones deben permanecer dentro de la pantalla y las tablas usar desplazamiento propio.
- Todos los textos, bordes y estados deben tener contraste suficiente en claro y oscuro.

## API

- CRUD de nóminas y estudiantes bajo `/api/v1/rosters`.
- Endpoint multipart para vista previa de importación.
- Endpoint de confirmación que reciba las filas ya revisadas.
- Endpoint para descargar plantilla `.xlsx`.
- Respuestas paginadas y validadas; ownership obligatorio en cada consulta.

## Integración inicial

- Añadir el enlace **Mis estudiantes** sin alterar el orden de los módulos pedagógicos.
- Crear el componente compartido `StudentSelector` y dejarlo listo para el punto 3.
- Integrarlo como mínimo en Lista de cotejo, Rúbrica, Ficha de observación, Carpetas de recuperación, Plan de atención y Monitoreo de avances cuando esos formularios se aborden.

## Criterios de aceptación

- Se puede crear un aula y estudiantes manualmente.
- Se puede importar y confirmar un `.xlsx` y un `.csv` válidos.
- Los duplicados se detectan y no se insertan silenciosamente.
- Un archivo inválido no crea registros.
- La plantilla descargada se abre y puede reimportarse.
- El selector reutilizable devuelve IDs estables, no una cadena separada por comas.
- Un usuario no accede a una nómina ajena.
- Pruebas backend, pruebas de componentes, compilación y lint pasan.
- QA visual e interactivo en 360×800, 768×1024 y escritorio; claro y oscuro, sin desbordamiento global.
