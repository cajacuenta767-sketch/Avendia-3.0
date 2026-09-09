# Prompt 05 — Presentaciones didácticas: contenido, formato e imágenes pertinentes

## Objetivo

Completar **Recursos → Presentaciones didácticas** en Avendia 3.0 conservando el diseño actual azul/violeta, modo claro y oscuro, sin copiar la paleta del proyecto anterior. La herramienta debe producir una presentación pedagógica útil, editable, con contenido suficiente y no solo tarjetas decorativas.

## Alcance obligatorio

### 1. Flujo y datos

- Mantener cuatro pasos visibles: **Datos generales → Estructura → Interacción → Vista previa/descarga**.
- Datos obligatorios: docente, institución, modalidad **EBR, EBA o EBE**, nivel, grado/aula, área curricular, tema/título y estilo visual.
- Cantidad de diapositivas mediante selector: 3, 5 u **8 como máximo**. Nunca permitir 9 o más por error.
- El primer paso debe conservar placeholders reales y avisos de campos faltantes antes de avanzar.
- La estructura debe pedir competencias CNEB, propósito didáctico, ideas centrales, ejemplos, interacciones y guion docente. No generar una presentación con un único bloque de texto repetido.

### 2. Prompt de generación y contenido

- El prompt enviado a Gemini debe especificar: modalidad, nivel, grado, área, tema, competencia(s), propósito, estilo visual, número máximo de tarjetas y las interacciones elegidas.
- Cada diapositiva debe tener: título breve, intención, explicación concreta, ejemplo o actividad cuando corresponde, notas docentes y una indicación de imagen solo si aporta comprensión.
- Incluir progresión: portada, activación de saberes previos, desarrollo, ejemplo contextualizado, interacción, comprobación corta, cierre/metacognición y guía docente según la cantidad elegida.
- Evitar Markdown, asteriscos, relleno, frases incompletas y afirmaciones sin relación con el CNEB.

### 3. Imágenes responsables

- No prometer ni descargar imágenes de Google sin licencia o control de calidad. Usar ilustraciones propias/permitidas, SVG/iconos del sistema o fuentes configuradas explícitamente.
- Si una diapositiva requiere imagen, mostrar una sugerencia editable de búsqueda y un recuadro de imagen con texto alternativo; no inventar una imagen como si hubiera sido encontrada.
- Rechazar URLs inseguras y dar estado vacío claro cuando no exista una imagen disponible.

### 4. Resultado y descarga

- Vista previa editable de cada diapositiva, navegación por teclado y controles para regenerar una diapositiva sin perder las demás.
- La descarga PPTX debe incluir títulos, cuerpo, ejemplos, notas y recursos visuales realmente disponibles; preservar el máximo de 8 diapositivas.
- Guardar borrador por docente, recuperarlo desde Historial con `?document=`, y mostrar errores de generación/sincronización con una acción de reintento.

### 5. Calidad

- Validar selección dependiente de modalidad/nivel/grado/área, el límite de ocho, contenido distribuido y la preservación de interacciones.
- Comprobar claro/oscuro, A−/A/A+, escritorio y móvil; sin desplazamiento horizontal de página.
- Ejecutar lint, pruebas y compilación antes de cerrar el punto.

## Criterio de finalización

La herramienta genera presentaciones de 3, 5 u 8 diapositivas con contenido pedagógico distribuido, una interacción elegida, imágenes honestas y editables, descarga coherente y recuperación desde Historial, manteniendo el estilo actual de Avendia 3.0.
