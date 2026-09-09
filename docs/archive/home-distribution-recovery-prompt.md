# Prompt de implementación — recuperar la distribución del Home anterior

## Objetivo

Reconstruye la ruta `/dashboard` de Avendia 3.0 tomando el proyecto anterior `C:\Users\PC\Desktop\Avendia` únicamente como referencia funcional y de distribución. No copies su paleta, tipografía, logo, sombras ni clases Tailwind. Todo debe renderizarse con los tokens, componentes, iconos y modos claro/oscuro del proyecto nuevo.

## Fuente de verdad

- Distribución anterior: `frontend/src/app/dashboard/page.tsx` del proyecto anterior.
- Panel lateral contextual anterior: `frontend/src/components/dashboard/PanelDerechoContexto.tsx`.
- Catálogo vigente: `frontend/src/config/tools.ts` del proyecto nuevo.
- Identidad visual vigente: `frontend/src/styles/global.css`, `theme.css` y `responsive.css` del proyecto nuevo.

## Distribución obligatoria

1. Mantén el sidebar y topbar actuales sin alterar su identidad visual.
2. Dentro del contenido crea un layout principal de dos columnas:
   - columna central flexible;
   - panel contextual derecho de aproximadamente 340–366 px.
3. En la columna central coloca, en este orden:
   - una barra compacta de perfil académico con selector de nivel;
   - un bloque de bienvenida de dos tercios de ancho;
   - dos tarjetas de estado apiladas en el tercio restante: nivel/área y documentos creados;
   - sección “Herramientas más utilizadas” con ocho tarjetas en una cuadrícula de cuatro columnas por dos filas en escritorio;
   - sección “Explorar por módulos” con filtros funcionales para Todas, Planificamos, Evaluamos, Incluimos, Reforzamos, Acompañamos, Tutoría y Recursos;
   - cuadrícula filtrable construida desde las 57 herramientas reales del catálogo actual;
   - banner final de referidos con acciones para invitar y consultar el plan profesional.
4. En el panel derecho coloca:
   - encabezado “Panel lateral” con control funcional para ocultarlo y restaurarlo;
   - calendario escolar 2026 con vistas Mensual, Bimestral y Trimestral;
   - periodos de gestión y periodos lectivos con fechas, semanas, unidades, leyenda y desplazamiento interno;
   - navegación desde cada día o periodo al calendario completo con fecha/mes/año en la URL;
   - historial reciente con accesos reales a los documentos/herramientas.

## Comportamiento

- Las ocho herramientas frecuentes deben abrir directamente sus rutas reales.
- Los filtros deben actualizar la cuadrícula sin recargar la página y exponer `aria-pressed`.
- El selector de nivel debe actualizar las tarjetas de estado y conservar la selección durante la sesión.
- “Cambiar preferencia” debe abrir un diálogo diario, guardar la elección y actualizar el mensaje de bienvenida.
- “Nueva creación” y el acceso profesional deben abrir sus diálogos correspondientes.
- El banner de referidos debe navegar a `/dashboard/referidos`.
- Calendario, panel lateral e historial deben conservar sus interacciones existentes.
- No uses datos o enlaces del proyecto anterior cuando exista un equivalente vigente.

## Responsive

- ≥1280 px: dos columnas, tarjetas frecuentes 4×2.
- 900–1279 px: panel contextual debajo o en columna completa; tarjetas 2×N.
- <640 px: una columna, filtros con desplazamiento o ajuste seguro, botones a ancho completo y sin desbordamiento horizontal.
- Los controles deben mantener objetivos táctiles de al menos 40 px y foco visible.

## Tema claro y oscuro

- Usa exclusivamente variables como `--navy`, `--muted`, `--line`, `--soft`, `--blue`, `--blue-soft`, `--teal` y `--violet`.
- Añade los estados oscuros mediante `theme.css`; ningún panel puede permanecer blanco en modo oscuro.
- No pegues valores cromáticos del proyecto anterior.

## Criterios de aceptación

- La jerarquía y el orden de secciones coinciden con el Home anterior.
- Las 57 herramientas aparecen bajo el filtro “Todas”.
- Los ocho accesos frecuentes funcionan.
- Los ocho filtros cambian el contenido correctamente.
- El selector académico, la agenda, el historial, los diálogos y las acciones finales son utilizables.
- No hay errores de consola, overlays del framework ni desbordamientos en escritorio o móvil.
- Pruebas, lint y build finalizan correctamente.
- La comparación visual confirma que la distribución viene del proyecto anterior y la identidad visual pertenece al proyecto nuevo.
