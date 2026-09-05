# Plan responsive integral de Avendia

## Objetivo

Garantizar que Avendia conserve su sistema visual azul/violeta actual y todas sus funciones entre 320 y 1920 px, sin desplazamiento horizontal global, controles fuera de pantalla, solapamientos ni pérdida de contexto. Las correcciones deben aplicarse primero a componentes compartidos y luego a excepciones justificadas.

## Matriz de tamaños

| Familia | Ancho de control | Uso esperado |
| --- | ---: | --- |
| Móvil pequeño | 320–389 px | Teléfonos compactos y zoom aumentado |
| Móvil | 390–599 px | Teléfonos actuales en vertical |
| Móvil horizontal / tableta pequeña | 600–767 px | Teléfonos horizontales y tabletas compactas |
| Tableta | 768–1023 px | Tabletas verticales y horizontales |
| Laptop | 1024–1279 px | Portátiles y ventanas divididas |
| Escritorio | 1280–1599 px | Monitores habituales |
| Pantalla amplia | 1600–1920 px | Monitores grandes sin estirar excesivamente el contenido |

También se validan alturas cortas de 568–650 px, modo claro/oscuro y tamaños tipográficos A−, A y A+.

## Plan de ejecución

1. Auditar automáticamente rutas representativas en 360×640, 768×1024, 1024×768 y 1440×900, midiendo desbordamiento global y elementos visibles fuera del viewport.
2. Corregir la estructura global: barra lateral superpuesta, barra superior compacta, panel contextual, notificaciones, márgenes seguros y bloqueo de scroll.
3. Corregir páginas de utilidades y, en especial, **Sube tu formato**: encabezado, métricas, zona de carga, lista de archivos, botones y confirmaciones.
4. Corregir patrones reutilizados por las 57 herramientas: formularios, steppers, barras de acciones, vistas previas, tablas, calendarios, diálogos, paneles de IA y estados de carga/error.
5. Asegurar objetivos táctiles de al menos 44 px, foco visible, texto envolvente y desplazamiento local únicamente en tablas/calendarios que lo requieran.
6. Verificar que el modo oscuro y A+ no introduzcan cortes ni colores heredados del proyecto anterior.
7. Ejecutar pruebas del frontend, compilación de producción y una segunda auditoría renderizada con capturas de móvil, tableta, laptop y escritorio.

## Reglas de aceptación

- `scrollWidth` global no supera el ancho visible en ninguna ruta auditada.
- La navegación lateral abre, permite desplazarse y cierra desde teclado o toque en móvil.
- La barra superior conserva siempre menú, tipografía y tema; los accesos secundarios se compactan sin solaparse.
- Formularios de dos columnas pasan a una columna antes de perder legibilidad.
- Botones y grupos de acciones envuelven o se apilan; nunca salen del contenedor.
- Diálogos usan altura dinámica, cuerpo desplazable y acciones alcanzables con teclado virtual.
- Tablas, calendarios y steppers anchos se desplazan dentro de su propio contenedor, no en toda la página.
- Las vistas previas conservan su proporción y escala sin cortar contenido.
- No aparecen overlays del framework ni errores relevantes de consola.
- Las pruebas y la compilación finalizan correctamente.

## Estado

- [x] Plan y criterios definidos.
- [x] Auditoría inicial por tamaño: 11 rutas × 4 viewports.
- [x] Correcciones compartidas: barra superior, navegación, notificaciones y contenedores.
- [x] Corrección de Sube tu formato: hero, métricas, carga, acciones, lista y confirmación.
- [x] Corrección de Mis estudiantes: navegación interna y tabla sin desbordamiento en tableta/laptop.
- [x] Validación claro/oscuro y A−/A/A+.
- [x] Pruebas, compilación y auditoría final.

## Resultado de la ejecución

- 44 combinaciones de ruta y viewport verificadas sin overlay ni errores de consola.
- Cero desbordamiento horizontal en las rutas auditadas después de las correcciones.
- Menú móvil verificado: abre, su contenido se desplaza y cierra mediante el fondo de bloqueo.
- Papelera de formatos verificada como interacción real.
- Modo oscuro con A+ verificado a 360 px sin desbordamiento.
- Frontend: 94 archivos de prueba y 176 pruebas aprobadas.
- Compilación de producción aprobada.
