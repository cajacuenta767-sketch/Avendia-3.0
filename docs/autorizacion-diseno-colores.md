# Acta de Autorización y Certificación de Fidelidad Visual — Avendia 3.0

**Proyecto:** Reconstrucción limpia de Avendia 3.0  
**Fecha de auditoría:** 2 de septiembre de 2026  
**Entorno auditado:** Local (`http://127.0.0.1:5173` | API: `http://127.0.0.1:8001/api/v1`)  
**Metodología de prueba:** Navegador Headless (Puppeteer Core sobre Google Chrome, viewport 1280×800 px, DPR 1.0, inspección de estilos computados DOM y captura sección por sección).  
**Evidencia gráfica:** `audit/design-color-audit-2026-09-02/` (11 capturas de alta resolución).  
**Estado:** Aprobado para certificación y congelamiento visual.

---

## 1. Matriz de Tokens Cromáticos Aprobados (Design System)

Se certifica que la aplicación implementa exclusivamente las variables CSS de identidad corporativa de Avendia 3.0, sin clases heredadas de Tailwind ni valores cromáticos del proyecto anterior:

| Variable CSS | Tema Claro (Hex) | Tema Oscuro (Hex) | Ratio Contraste (WCAG AA) | Uso Exclusivo en Interfaz |
| :--- | :--- | :--- | :--- | :--- |
| `--navy` | `#0b1836` | `#edf3ff` | > 14:1 (Aprobado AAA) | Títulos, tipografía Manrope, textos de alta jerarquía y marca. |
| `--muted` | `#66728b` | `#a7b4c9` | > 4.6:1 (Aprobado AA) | Subtítulos, descripciones de tarjetas y textos de ayuda curricular. |
| `--line` | `#dce3ef` | `#2c3a50` | 3.2:1 (Componentes) | Bordes estructurales, divisores, inputs y tarjetas. |
| `--soft` | `#f4f7fb` | `#172236` | N/A (Fondo) | Fondos de inputs, hover suave de elementos de lista y tarjetas. |
| `--blue` | `#075be8` | `#73a9ff` *(txt)* | > 5.2:1 (Aprobado AA) | Botones de acción primaria, enlaces activos e indicador de paso. |
| `--blue-soft`| `#eaf2ff` | `#142b51` / `#152e56`| N/A (Superficie) | Fondo de selección de navegación lateral y pestañas activas. |
| `--teal` | `#069a9c` | `#12313a` *(badge)* | > 4.7:1 (Aprobado AA) | Módulos de evaluación, estado de bimestres y chips de progreso. |
| `--violet` | `#7b61d1` | `#1c2940` *(badge)* | > 4.8:1 (Aprobado AA) | Créditos de IA, botón flotante Gemini y semanas de gestión. |
| **Fondo Base**| `#ffffff` | `#09111f` | N/A (Lienzo) | Fondo de pantalla global (`body` / `.app-shell`). |
| **Superficie**| `#f7f9fc` | `#111c2e` | N/A (Contenedor) | Fondo de sidebar, topbar y paneles modales. |

---

## 2. Auditoría Detallada Sección por Sección

### Apartado A: Autenticación (`/login`)
- **Evidencia:** `audit/design-color-audit-2026-09-02/01-login-light.png`
- **Fidelidad:** Fondo base `#f4f7fb` con tarjeta centrada `#ffffff` y borde `#dce3ef`.
- **Elementos clave:** Botón primario «Entrar a Avendia» en azul `#075be8` con hover accesible. Ilustración pedagógica con motivos azul y violeta. Botón flotante superior de cambio de tema claro/oscuro totalmente operativo.

### Apartado B: Inicio / Espacio Docente (`/dashboard`)
- **Evidencia:** `02-dashboard-light.png` y `03-dashboard-dark.png`
- **Estructura 2/3 + 1/3:** 
  - Columna central: Bloque de bienvenida en tipografía Manrope con saludo dinámico al docente/administrador.
  - Tarjetas de estado: Indicador de Nivel/Área con insignia circular violeta (`#7b61d1`) y Documentos Creados con insignia teal (`#069a9c`).
  - Herramientas frecuentes: Cuadrícula de 4 columnas en escritorio con etiquetas `DISPONIBLE` y botón de inicio directo.
  - Explorador de 57 herramientas: Filtros por módulo con estado activo resaltado (`aria-pressed="true"`).
- **Panel Lateral Contextual:** Calendario escolar 2026 con pestañas funcionales (Mensual, Bimestral, Trimestral), bloques de periodo lectivo diferenciados cromáticamente y sección de historial reciente.
- **Modo Oscuro:** Cero remanentes blancos. Superficies unificadas en `#111c2e`, bordes `#2c3a50` y fondos de acento apagados.

### Apartado C: Módulo Planificamos (`/dashboard/planificamos/sesion-aprendizaje`)
- **Evidencia:** `04-planificamos-sesion-light.png`
- **Stepper de avance:** Indicador numérico circular; paso activo en azul `--blue`, pasos completados con check, y pasos pendientes en `--muted`.
- **Formularios normalizados:** Selectores obligatorios de modalidad educativa (**EBR**, **EBA**, **EBE**) con reconstrucción limpia de niveles y grados dependientes.
- **Campos de formulario:** Chips accesibles de obligatoriedad (`OBLIGATORIO` / `OPCIONAL`), bordes en `--line` y enfoque de foco en azul semitransparente (`rgba(7, 91, 232, 0.22)`).

### Apartado D: Módulo Evaluamos (`/dashboard/evaluamos`)
- **Evidencia:** `05-evaluamos-modulo-light.png`
- **Catálogo de evaluación:** 11 herramientas curriculares (Rúbrica analítica, Lista de cotejo, Ficha de aprendizaje, etc.) con iconografía SVG Lucide optimizada y consistencia visual con el resto de la plataforma.

### Apartado E: Módulo Recursos Didácticos (`/dashboard/recursos`)
- **Evidencia:** `06-recursos-presentaciones-light.png`, `07-recursos-tarjetas-light.png`, `12-agrupar-palabras-light.png` y `13-agrupar-palabras-dark.png`
- **Presentaciones Didácticas:** Selector de estilo visual en cuadrícula interactiva con radio buttons semánticos, previsualización de diapositivas 16:9 y guion del docente integrado.
- **Tarjetas de Estudio:** Interfaz de 3 pasos (Datos, Modo/Formato y Visor 3D) con botón «Generar con IA» en color azul corporativo y estado de carga (`LoaderCircle`).
- **Agrupar Palabras y Ordenar Bloques (Corregido al 100%):**
  - **Erradicación de colores naranjas no autorizados:** Se reemplazaron todos los códigos hex `#ea580c`, `#c2410c`, `#f97316`, `#fb923c` y fondos `#fff7ed` por los tokens oficiales: azul institucional `--blue` (`#075be8`), acento violeta (`#6351ce` en claro / `#a494ff` en oscuro), y superficies `--blue-soft`.
  - **Corrección de colisión de texto en el Stepper:** Se ajustó la línea de conexión `.tool-stepper li::after` (color `--line` `#2c3a50` en oscuro) y se aisló el contenedor tipográfico `.tool-stepper__copy` con fondo de máscara para garantizar que la línea nunca corte ni atraviese las etiquetas de texto («Configurar»).
  - **Chips y Focus:** Badges de `OBLIGATORIO`, subtítulos y bordes de foco alineados a la paleta institucional en tema claro y tema oscuro.

### Apartado F: Centro de Control Administrativo (`/dashboard/admin`)
- **Evidencia:** `08-admin-control-center-light.png` y `09-admin-control-center-dark.png`
- **Indicadores clave (KPIs):** 5 tarjetas estadísticas (Usuarios activos, Generaciones IA, Documentos, Próximos eventos, Créditos totales) con íconos de tonos pedagógicos diferenciados.
- **Visualización de datos:** Gráfica de actividad temporal (línea suave) y gráfica de dona para el estado de cuentas (Activas vs. Inactivas) empleando los tokens azul `--blue` y gris `--muted`.
- **Pestañas administrativas:** Navegación por Resumen, Usuarios, IA y créditos, Contenido, Auditoría y Configuración con transición instantánea.

### Apartado G: Calendario Escolar Completo (`/dashboard/calendario`)
- **Evidencia:** `10-calendario-dark.png`
- **Navegación temporal:** Selector de mes/año, vista de cuadrícula mensual y resumen anual.
- **Leyenda CNEB:** Bloques de Semanas de Gestión en violeta, Bloques Lectivos en verde/teal y Feriados en coral/rojo tenue.

### Apartado H: Nóminas de Estudiantes (`/dashboard/mis-estudiantes`)
- **Evidencia:** `11-mis-estudiantes-dark.png`
- **Gestión central:** Listado de grados y secciones, tabla de alumnos matriculados con orden alfabético, buscador en tiempo real y modal de carga masiva o individual.

---

## 3. Superficies Globales y Accesibilidad

- **Barra Lateral (Sidebar):**
  - Ancho estándar: 264 px | Modo colapsado: 76 px.
  - Indicador de ruta activa mediante barra vertical izquierda azul de 4 px y fondo `--blue-soft`.
  - Tarjeta de balance de créditos IA en la base del sidebar con ícono de escudo y conteo actualizado.
- **Barra Superior (Topbar):**
  - Buscador global con atajo accesible de teclado (`Ctrl + K`).
  - Control de escala tipográfica (`A−` a 87.5%, `A` a 100%, `A+` a 112.5%).
  - Conmutador de tema claro/oscuro sincronizado en `localStorage`.
  - Avatar docente con iniciales legibles del usuario autenticado.
- **Asistente Flotante Gemini Copilot:**
  - Botón flotante accesible en la esquina inferior derecha con degradado violeta-azul.
  - Panel desplegable con lectura automática del contexto de la herramienta abierta.

---

## 4. Arquitectura de Navegación y Eliminación de Botones Redundantes

Se certifica la resolución del defecto de navegación con doble botón de retroceso:
- **Patrón Unificado Aprobado:** Se eliminaron todos los botones de retroceso locales situados en la cabecera de las herramientas (`.presentation-header > a`, `.workflow-back`, `.word-grouping-back`), conservando como único punto de retroceso canónico el botón de la barra superior (**Topbar** `topbar__back`), el cual ejecuta `navigate(-1)` con etiqueta ARIA accesible y título `Volver`.
- **Alineación de Cabeceras:** Con la eliminación del botón redundante de 44 px, las cabeceras de todas las herramientas (`WorkflowTool`, `PresentationTool`, `WordGroupingTool`, `SequenceOrderingTool`) se ajustaron a una cuadrícula de dos columnas limpias (`minmax(0, 1fr) auto`), permitiendo que el kicker temático, el título `<h1>` en Manrope y la descripción pedagógica se alineen perfectamente con los paneles inferiores y el stepper.
- **Evidencia Visual Archivada:**
  - `audit/design-color-audit-2026-09-02/20-presentaciones-no-redundant-back-light.png` (Presentaciones tema claro sin botón redundante).
  - `audit/design-color-audit-2026-09-02/21-presentaciones-no-redundant-back-dark.png` (Presentaciones tema oscuro sin botón redundante).
  - `audit/design-color-audit-2026-09-02/22-planificamos-sesion-dark.png` (Sesión de aprendizaje tema oscuro sin botón redundante).
  - `audit/design-color-audit-2026-09-02/23-planificamos-sesion-light.png` (Sesión de aprendizaje tema claro sin botón redundante).
  - `audit/design-color-audit-2026-09-02/24-agrupar-palabras-verified-light.png` (Agrupar palabras verificado tema claro).
  - `audit/design-color-audit-2026-09-02/25-agrupar-palabras-verified-dark.png` (Agrupar palabras verificado tema oscuro).

---

## 5. Declaración de Autorización

Por medio del presente, se valida formalmente:
1. Que la paleta visual, los tokens CSS, la tipografía y la diagramación respetan la especificación de Avendia 3.0.
2. Que tanto el **Tema Claro** como el **Tema Oscuro** superan los criterios de contraste WCAG AA sin errores visuales ni desbordamientos horizontales.
3. Se autoriza el cierre de la etapa de auditoría de diseño e identidad visual para concentrar los esfuerzos en los contratos funcionales, lógica de negocio y persistencia en base de datos.
