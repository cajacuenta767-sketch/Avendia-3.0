# Design QA — recuperación de la distribución del Home

## Evidencia

- Verdad visual de origen: `C:\Users\PC\Documents\ChatGPT\Avend Escala 3.0\audit\avendia-old-exhaustive-2026-08-31\01-dashboard.png`
- Implementación final en tema claro: `C:\Users\PC\AppData\Local\Temp\avendia-home-distribution-audit\08-final-home-light-adjusted-1280x535.png`
- Estado adicional en tema oscuro: `C:\Users\PC\AppData\Local\Temp\avendia-home-distribution-audit\07-final-home-dark-1280x720.png`
- URL renderizada: `http://127.0.0.1:5173/dashboard`
- Origen: 1279 × 537 px, captura CSS aproximada 1279 × 537, DPR 1.
- Implementación: 1280 × 535 px, viewport CSS 1280 × 720 con recorte comparable 1280 × 535, DPR 1.
- Normalización: comparación sin marco del navegador, con diferencia no material de 1 px de ancho y 2 px de alto.
- Estado: Home autenticado, tema claro, parte superior, panel lateral abierto y calendario bimestral.

## Comparación de vista completa

La referencia y la implementación final se abrieron juntas en una misma entrada de comparación. Coinciden las regiones que definían el Home anterior:

- navegación lateral a la izquierda;
- barra superior;
- selector de nivel académico;
- bienvenida ocupando dos tercios del bloque central;
- dos tarjetas de estado apiladas;
- panel lateral independiente;
- calendario escolar 2026 con pestañas mensual, bimestral y trimestral;
- periodos escolares coloreados y desplazables;
- historial debajo del calendario.

La barra superior, el logotipo y los colores no se copiaron del proyecto anterior: conservan deliberadamente el sistema visual claro/oscuro del proyecto actual.

No fue necesario un recorte adicional: las capturas comparadas tienen solo 537 px de alto y los textos, controles, proporciones, bordes y estados relevantes son legibles en la comparación completa.

## Superficies de fidelidad

- Tipografía: se conserva Manrope y la jerarquía del proyecto actual; títulos, etiquetas y texto auxiliar mantienen pesos y saltos legibles.
- Espaciado y ritmo: se recuperaron las proporciones 2/3 + 1/3, la pila de estados, el rail derecho de 366 px y los separadores entre calendario e historial.
- Colores y tokens: el tema claro usa los tokens azul, violeta y teal actuales; el oscuro usa superficies `#09111f`, `#111c2e` y bordes `#2c3a50`, sin fondos blancos residuales.
- Imágenes y activos: la referencia no requiere imágenes raster en esta vista; se usan los iconos Lucide ya adoptados por el proyecto, sin SVG manual ni arte CSS sustitutivo.
- Contenido: se recuperaron los nombres y periodos del calendario escolar 2026, la preferencia docente, las herramientas frecuentes, los filtros de módulos y el historial.
- Estados e interacción: se probaron nivel académico, filtros, pestañas de calendario, modal de preferencia, modal de nueva creación, ocultar/mostrar panel lateral y tema oscuro.
- Accesibilidad: controles con nombre accesible, `aria-pressed` en filtros/pestañas, diálogos con nombre y botones de cierre semánticos.

## Historial de iteraciones

### Iteración 1

- Hallazgo P1: el Home actual no conservaba la distribución funcional del anterior; faltaban el selector superior, la composición de bienvenida con estados, la exploración completa y el rail contextual equivalente.
- Evidencia inicial: `C:\Users\PC\AppData\Local\Temp\avendia-home-distribution-audit\01-current-home.png`.
- Corrección: reconstrucción del Home en dos columnas, ocho herramientas frecuentes, 57 herramientas filtrables, banner de referidos, calendario e historial.

### Iteración 2

- Hallazgo P1: el rail derecho todavía mostraba una agenda semanal simplificada en lugar del calendario pedagógico del Home anterior.
- Corrección: calendario escolar funcional con vistas mensual, bimestral y trimestral, navegación por día/periodo, leyenda y panel colapsable.
- Evidencia posterior: `C:\Users\PC\AppData\Local\Temp\avendia-home-distribution-audit\04-final-home-1280x535.png`.

### Iteración 3

- Hallazgo P2: en 1280 px la frase diaria quedaba demasiado estrecha al compartir línea con dos acciones.
- Corrección: el pie de bienvenida cambia a columna en anchos intermedios y conserva los controles completos.
- Evidencia posterior: `C:\Users\PC\AppData\Local\Temp\avendia-home-distribution-audit\08-final-home-light-adjusted-1280x535.png`.

## Verificación técnica

- Interacciones primarias probadas en el navegador: correctas.
- Consola: 0 errores y 0 advertencias.
- Desbordamiento horizontal a 1280 px: no presente (`scrollWidth` 1265 para `innerWidth` 1280).
- Pruebas: 32/32 aprobadas.
- Lint: aprobado.
- Build de producción: aprobado; queda únicamente la advertencia informativa existente de tamaño de bundle.
- Brecha residual: el navegador integrado aplicó un mínimo de 1280 px pese a solicitar viewports menores; las reglas responsive fueron verificadas por código y pruebas, pero no se obtuvo una captura móvil real en esta sesión.

## Hallazgos finales

No quedan diferencias P0, P1 o P2 accionables en la distribución de escritorio comparada. Las diferencias visibles de marca, color y barra superior son intencionales para respetar el proyecto actual.

final result: passed
