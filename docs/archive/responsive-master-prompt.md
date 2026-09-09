# Prompt maestro — Adaptación responsive integral y QA multidispositivo de Avendia

## Misión

Actúa como especialista en diseño responsive, accesibilidad, frontend React, QA visual y experiencia docente. Audita y corrige Avendia 3.0 completa para que todas sus rutas, componentes, formularios, calendarios, tablas, gráficos, paneles, menús, diálogos, artefactos interactivos y estados funcionen correctamente desde 320 px hasta pantallas de escritorio amplias.

Proyecto: `C:\Users\PC\Documents\ChatGPT\Avend Escala 3.0`.

No reduzcas la revisión a que la aplicación “quepa”. Cada pantalla debe conservar jerarquía, legibilidad, controles táctiles, acciones accesibles, contexto y funcionalidad. No ocultes información esencial para resolver desbordamientos. Cuando una superficie sea intrínsecamente ancha —por ejemplo un calendario mensual o una tabla administrativa— utiliza un contenedor de desplazamiento local claramente utilizable, sin producir desplazamiento horizontal en toda la página.

## Matriz obligatoria de dispositivos

Prueba cada familia de pantalla en estos tamaños representativos:

1. **Móvil pequeño:** 320 × 568 px.
2. **Móvil moderno:** 390 × 844 px.
3. **Tableta vertical:** 768 × 1024 px.
4. **Portátil:** 1366 × 768 px.
5. **Escritorio amplio:** 1920 × 1080 px.

Además, comprueba alturas reducidas, orientación horizontal y zoom tipográfico A−/A/A+ mediante reglas fluidas en lugar de depender de un único dispositivo comercial.

## Familias de rutas que deben cubrirse

- autenticación: `/login` y `/registro`;
- inicio y navegación global: `/dashboard`;
- calendario: `/dashboard/calendario` en mes, año, panel lateral y diálogos;
- módulos: Planificamos, Evaluamos, Incluimos, Reforzamos, Acompañamos, Tutoría y Recursos;
- herramientas de flujo: formularios de varios pasos, vista previa, generación y descarga;
- recursos interactivos: agrupar palabras y ordenar bloques;
- utilidades: historial, ideas, formatos, referidos, comunidad, perfil y configuración;
- administración: resumen, usuarios, IA, contenido, auditoría, configuración y cajón de usuario;
- superficies globales: barra lateral, barra superior, control tipográfico, tema, búsqueda, panel contextual, copiloto Gemini, notificaciones y diálogos.

## Reglas de implementación

### Estructura global

- La aplicación no debe tener `overflow-x` global accidental.
- A menos de 860 px, la barra lateral debe convertirse en panel superpuesto con fondo de bloqueo y cierre visible.
- La barra superior debe mantener menú, identidad mínima, tamaño de letra, tema y accesos prioritarios sin solaparse.
- En móvil, los controles secundarios pueden compactarse por prioridad, pero deben seguir disponibles y etiquetados.
- Respeta `env(safe-area-inset-*)` para móviles con recortes y barras del sistema.
- Usa `100dvh` con respaldo seguro para paneles y diálogos de altura completa.

### Contenido, tarjetas y formularios

- Usa anchos fluidos, `minmax(0, 1fr)`, `clamp()` y saltos 1260/1080/860/768/620/390 cuando sean necesarios.
- Ningún texto, correo, nombre de institución, título o botón debe quedar cortado sin alternativa legible.
- Los formularios de dos columnas deben pasar a una columna antes de que sus campos pierdan legibilidad.
- Los botones principales deben ser fáciles de pulsar, con un mínimo aproximado de 44 px en móvil.
- Las barras de acciones deben envolver o apilarse; no pueden salir de la pantalla.
- Mensajes de error, carga, éxito y vacío deben mantenerse dentro del contenedor.

### Calendario y datos densos

- En móvil, el calendario mensual puede mantener una cuadrícula ancha dentro de desplazamiento horizontal local.
- Debe existir indicación visual o contexto suficiente para que el usuario entienda que puede desplazarse.
- Los paneles laterales pasan debajo del contenido principal.
- Las tablas administrativas mantienen encabezados y columnas mediante desplazamiento local; nunca ensanchan el documento.
- Los gráficos usan contenedores responsivos y alturas adecuadas al dispositivo.

### Diálogos, paneles y copiloto

- Todo diálogo debe caber en ancho y alto, tener encabezado/acción alcanzables y cuerpo desplazable.
- El cajón administrativo y el copiloto ocupan todo el ancho en móviles pequeños y respetan `100dvh`.
- El fondo de bloqueo debe impedir interacción accidental y el botón de cierre permanecer visible.
- El teclado virtual no debe ocultar el campo activo ni la acción principal de autenticación o Gemini.

### Tema y tipografía

- Verifica claro y oscuro en las cinco familias de tamaño.
- A−, A y A+ no deben romper navegación, tablas, steppers o acciones.
- Mantén contraste, foco visible, etiquetas accesibles y `prefers-reduced-motion`.

## Protocolo de QA por tamaño

En cada tamaño:

1. Confirma URL/título y contenido significativo.
2. Comprueba que `documentElement.scrollWidth <= documentElement.clientWidth` salvo superficies locales autorizadas.
3. Busca elementos visibles fuera del viewport, texto recortado, controles menores de tamaño táctil, posiciones fijas solapadas y contenedores sin desplazamiento.
4. Abre y cierra menú lateral.
5. Acciona al menos un control principal de la familia de pantalla.
6. Abre un diálogo o panel cuando exista.
7. Comprueba errores y advertencias de consola.
8. Captura evidencia del estado de escritorio y móvil.
9. Repite tras cada corrección relevante.

## Criterios de aceptación

- Cero desplazamiento horizontal global accidental entre 320 y 1920 px.
- Navegación y acciones principales alcanzables con mouse, teclado y toque.
- Sin botones, tarjetas, campos o diálogos fuera de pantalla.
- Calendario, tablas y steppers anchos contenidos localmente.
- Temas claro/oscuro y tamaños A−/A/A+ funcionales.
- Pruebas unitarias, lint y compilación aprobadas.
- Las rutas representativas se verifican en la matriz definida y cualquier limitación queda documentada con precisión.

## Resultado esperado

Aplica las correcciones en componentes compartidos antes de añadir excepciones. Conserva el diseño azul/violeta actual, las funcionalidades existentes y los datos reales. Entrega una matriz final con cada dispositivo, rutas verificadas, resultado y riesgos restantes.
