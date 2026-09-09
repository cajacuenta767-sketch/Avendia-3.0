# Prompt 06 — Inicio, favoritos, Historial y calendario de aula

## Objetivo

Recuperar la profundidad del inicio y calendario del proyecto anterior dentro del diseño actual de Avendia 3.0. Debe funcionar igual en claro/oscuro y escritorio/móvil, sin copiar su antigua paleta.

## Alcance obligatorio

### 1. Inicio

- Conserva el panel de bienvenida, accesos recientes y acciones rápidas con datos reales.
- Incluye favoritos y herramientas más usadas: marcar/desmarcar desde tarjetas, persistir por docente y mostrar una cuadrícula de tres tarjetas por defecto en escritorio.
- Si una fila tiene solo una o dos tarjetas, debe conservar la alineación de la cuadrícula; no centrarla artificialmente.
- Las tarjetas abren la herramienta correcta y respetan el menú lateral plegable, tamaño de letra, tema y búsqueda.

### 2. Historial

- Mostrar documentos, instrumentos y recursos generados, con búsqueda, filtros, abrir, duplicar, descargar cuando aplique, archivar/restaurar y fechas claras.
- Cada tarjeta debe retomar la ruta y el estado del documento mediante `?document=`; no abrir una pantalla genérica ni perder información.
- Las acciones son del propietario del documento; estados vacíos y fallos de carga deben explicar qué hacer.

### 3. Calendario de aula

- Calendario mensual con navegación anterior/siguiente, selector de mes/año, día actual y fechas reales, incluidos eventos que cruzan meses.
- Vista lateral de calendario pequeño/agenda próxima cuando el diseño de la página lo requiere. Al pulsar un día o evento del calendario pequeño se abre/navega al evento del calendario principal.
- Crear evento mediante botón y doble clic en un día. El cuadro flotante debe permitir título, fecha/hora inicio-fin, tipo/color, aula/estudiantes cuando aplique, descripción, recordatorio y recurrencia si existe en el contrato.
- Editar nombre y demás datos; borrar solo con confirmación. Persistir y actualizar ambos calendarios sin recarga total.
- Mostrar eventos por día, filtros por tipo/aula, agenda accesible, mensajes de validación y descarga/exportación solo cuando esté implementada realmente.

### 4. Calidad

- Sin desbordamiento global en anchos de 320, 390, 768, 1024 y 1440 px; tablas/listas con scroll interno cuando sea necesario.
- Tema oscuro con contraste visible en días, eventos, modal, botones, filtros y calendario pequeño.
- Probar creación, edición, eliminación confirmada, navegación de mes, doble clic, favoritos e Historial. Ejecutar pruebas, lint y compilación.

## Criterio de finalización

El inicio refleja trabajo real del docente; favoritos, historial y calendario están conectados, se pueden recuperar y editar datos, y todos los controles mantienen el diseño actual de Avendia 3.0 en cualquier tamaño de pantalla.
