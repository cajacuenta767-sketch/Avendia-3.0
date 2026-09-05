# Plan vivo · Equivalencia de distribución para utilidades

> Estado: propuesto el 4 de septiembre de 2026. No implementa cambios por sí solo.
>
> Alcance: **Videos tutoriales, Historial, Ideas y mejoras, Sube tu formato, Referidos y Comunidad activa**. Este documento complementa, no reemplaza, [plan-utilidades-comunidad-vivo.md](plan-utilidades-comunidad-vivo.md). Conserva el diseño y la lógica real del proyecto nuevo; toma del anterior únicamente la jerarquía, el orden y la densidad de la distribución.

## 1. Decisión de producto

El proyecto anterior fue ejecutado localmente en `http://127.0.0.1:3000` y se revisaron sus seis rutas docentes. La versión nueva ya incorpora lógica real en sus APIs y componentes: progreso de tutoriales, historial sincronizado, documentos locales, plantillas, ideas con comentarios y votos, referidos trazables, publicaciones, reacciones, guardados y moderación.

La mejora pendiente no es sustituir esa lógica: es presentar cada utilidad con una estructura reconocible y útil, en lugar de una sucesión genérica de formularios y tarjetas.

### Se copia del anterior

- Encabezado contextual de cada utilidad y navegación lateral persistente.
- Portada inicial compacta: etiqueta de módulo, título, explicación corta, icono o imagen funcional y métricas reales.
- Zona de acción principal inmediatamente después de la portada.
- Segundo bloque con el contenido propio de cada utilidad: ruta, tabla, biblioteca, panel de seguimiento o feed.
- Controles agrupados: búsqueda, filtros, pestañas y acciones principales juntos y antes de los resultados.
- Separación visual clara entre resumen, controles y contenido.
- **Distribución de cuadros y botones:** reproducir la posición relativa, orden de lectura, agrupación y jerarquía de las tarjetas, paneles, tablas, filtros, pestañas, botones principales, botones secundarios y acciones por registro que se observan en el proyecto anterior. Esto significa conservar el patrón de uso —por ejemplo, portada → métricas → filtros → resultados; o carga → biblioteca → acciones—, no copiar literalmente sus estilos.

### No se copia del anterior

- Sus colores, marca, tipografías o fondos oscuros específicos. Se mantienen los tokens visuales actuales de Avendia en claro y oscuro.
- Datos de ejemplo permanentes, métricas inventadas ni enlaces de producción ficticios.
- Desborde horizontal que aparece en las capturas del proyecto anterior en ancho reducido.
- El copiloto fijo como elemento que tape contenido; si se usa, debe seguir la interfaz actual y respetar viewport, teclado y foco.

### Regla de reinterpretación visual

Cuando se replique una distribución anterior, cada cuadro y botón debe mapearse a un componente del sistema actual:

| Referencia estructural anterior | Implementación con la identidad actual |
|---|---|
| Tarjeta de métrica | `UtilityHero` con tokens actuales, icono actual y dato obtenido por API |
| Filtros o pestañas alineadas | `UtilityFilterBar` responsive con foco, estado activo y parámetros persistentes |
| Botón destacado | `primary-button` actual, con estado cargando, deshabilitado justificado y confirmación cuando aplique |
| Acción secundaria por registro | `secondary-button` actual, texto claro e icono accesible; no depender sólo de color |
| Tabla/listado | Tabla actual en escritorio y tarjeta etiquetada en móvil, sin pérdida de acciones |
| Cuadro de carga, publicación o propuesta | Panel actual con validaciones y mensajes de estado reales |

No se permite trasladar una combinación de color anterior «por parecerse» a la captura. La similitud exigida es de composición, comportamiento y claridad del flujo.

## 2. Evidencia de las capturas del proyecto anterior

| Ruta anterior | Distribución observada | Qué debe trasladarse | Riesgo a corregir |
|---|---|---|---|
| `/dashboard/videos-tutorial` | Portada con video destacado + dos métricas; ruta de ocho módulos en tarjetas ordenadas | Jerarquía “empezar → ruta → tarjeta de tutorial” | En pantallas pequeñas las tarjetas no deben forzar scroll horizontal |
| `/dashboard/historial` | Portada con conteos; bloque «Historial organizado por semanas»; filtros de periodo y orden | Resumen antes de los filtros y resultados agrupados por fecha | No ocultar búsqueda, favoritos, origen, papelera ni acciones actuales |
| `/dashboard/ideas` | Portada, contadores; barra de búsqueda/filtros + botón de propuesta; tablero de ideas | La barra de descubrimiento y las tarjetas con estado visible | Los votos, comentarios y estados deben proceder de API, no de maqueta |
| `/dashboard/sube-tu-formato` | Portada orientativa; dos zonas de carga por tipo; listado tabular de archivos | Flujo visual de cargar → revisar → administrar | Conservar categorías actuales, seguridad y permisos de archivos |
| `/dashboard/referidos` | Métricas, bloque de enlace, explicación de cuatro pasos, tablas de invitados/beneficios | Orden: resumen → compartir → cómo funciona → seguimiento | No mostrar créditos o invitados simulados; no incluir datos privados |
| `/dashboard/comunidad-activa` | Portada con contadores; beneficios en cuadrícula; canales oficiales | Portada social, descubrimiento de temas y espacios de confianza | La comunidad nueva debe priorizar el feed, creación, filtros y moderación reales |

## 3. Patrón de composición obligatorio

Cada pantalla tendrá esta secuencia. Los componentes podrán reutilizarse, pero el contenido de cada bloque no será genérico.

1. **Cabecera de aplicación.** Título contextual en barra superior; búsqueda global, tamaño de texto, tema, notificaciones y cuenta sin solaparse.
2. **Portada de utilidad.** Etiqueta, título, una frase de propósito, icono/ilustración no decorativa y de una a tres métricas reales. Si no hay datos, mostrar cero o estado vacío honesto.
3. **Acción primaria.** Un botón destacado o zona de trabajo que explica qué puede hacer el docente ahora.
4. **Controles de exploración.** Búsqueda, filtros, orden y pestañas agrupados en una franja responsiva.
5. **Contenido propio.** Tutoriales, historial, ideas, archivos, referidos o publicaciones, según la utilidad.
6. **Estados completos.** Carga, vacío, error recuperable, éxito y sin permisos; nunca una caja silenciosa.

### Reglas de layout

- Escritorio: contenido centrado con ancho máximo, paneles en dos o tres columnas solo donde mejora la lectura; no columnas fijas que obliguen a recortar texto.
- Tableta: portada en una columna o dos columnas flexibles; controles se envuelven; tablas usan vista de tarjetas o scroll local con encabezados persistentes.
- Móvil: una columna, acción primaria de ancho completo, botones agrupados sin tapar acciones y panel lateral como overlay desplazable.
- Las tarjetas usan `min-width: 0`, texto con salto de palabra y grillas `auto-fit`; nunca `min-width` que supere el viewport.
- Tema claro y oscuro usan variables actuales, contraste accesible y los mismos estados activos; no colores especiales heredados del proyecto viejo.

## 4. Especificación visual y funcional por utilidad

### 4.1 Videos tutoriales

**Distribución objetivo**

- Portada: «Centro de aprendizaje», total de tutoriales publicados, tutoriales completados y progreso individual real.
- Bloque destacado: siguiente tutorial recomendado, miniatura, duración, dificultad y un único botón «Continuar»/«Empezar».
- Ruta recomendada: tarjetas numeradas por módulo —Inicio, Planificamos, Evaluamos, Incluimos, Reforzamos, Acompañamos, Tutoría y Recursos—. Cada tarjeta abre el tutorial correspondiente o indica honestamente que aún no está publicado.
- Biblioteca: búsqueda, filtros por módulo/dificultad/estado y tarjetas de videos restantes.

**Lógica a preservar y ampliar**

- Mantener reproducción, guardado de avance, favorito, marcado visto, transcripción y vínculo a herramienta ya existentes.
- Métricas calculadas desde tutoriales publicados y progreso del usuario, no valores escritos en pantalla.
- Administración de alta, edición, publicación y orden conserva permisos de administrador.

**Aceptación**: al reproducir, pausar o terminar un video se guarda el progreso; al recargar se retoma; la ruta no muestra elementos inexistentes como clicables.

### 4.2 Historial

**Distribución objetivo**

- Portada: documentos visibles, favoritos y último documento actualizado, con origen sincronizado/local explicado sin tecnicismos.
- Franja «Organiza tu trabajo»: búsqueda, periodo, herramienta, estado, origen, favoritos, orden y papelera.
- Resultados: agrupación cronológica opcional (hoy, esta semana, anteriores) y tarjetas densas que conservan abrir, descargar permitido, duplicar, favorito, archivar/eliminar y restaurar.
- Vista vacía dirigida a crear un documento; no simular registros.

**Lógica a preservar y ampliar**

- Conservar nube/dispositivo, filtros actuales, paginación, reabrir, papelera y protección de documentos de evaluación.
- Añadir filtro de periodo y agrupación visual sin perder los filtros de backend existentes.

**Aceptación**: una generación real aparece en el bloque temporal correcto, mantiene su referencia en cascada y ninguna acción afecta documentos de otro usuario.

### 4.3 Ideas y mejoras

**Distribución objetivo**

- Portada: ideas propias, votos emitidos y propuestas que avanzaron de estado, todos calculados desde API.
- Barra fija dentro del contenido: búsqueda, estado, «mis ideas», orden y botón «Proponer idea».
- Formulario de propuesta en diálogo o panel plegable para conservar contexto del tablero.
- Tablero de tarjetas: categoría, herramienta relacionada, estado, resumen, autor con privacidad, votos, conversación y respuesta de administración.

**Lógica a preservar y ampliar**

- Mantener creación, edición autorizada, voto único, comentarios, estado/respuesta de administración y notificación.
- Añadir vista «Implementadas» y orden «más votadas/recientes» como parámetros de API, no filtrado inventado en cliente.

**Aceptación**: votar cambia la tarjeta y persiste tras recargar; el autor recibe el estado real; no hay doble voto ni edición posterior al estado permitido.

### 4.4 Sube tu formato

**Distribución objetivo**

- Portada: biblioteca de formatos institucionales con total, categorías activas y último archivo cargado.
- Acción de carga visible: tarjetas de acceso rápido para Sesión y Unidad, seguidas por selector de otras categorías compatibles (PCA, rúbrica, lista de cotejo, ficha, informe, etc.).
- Cada zona explica formato, peso permitido, uso posterior y privacidad antes de abrir el selector.
- Biblioteca de archivos: tabla en escritorio y tarjetas en móvil con tipo, nombre, categoría, fecha, tamaño, visibilidad y acciones.

**Lógica a preservar y ampliar**

- Mantener `TemplateLibrary`, la persistencia, vista previa, reemplazo, descarga, renombrado y selección como referencia.
- Validar en backend extensión, MIME, tamaño, propietario, permisos y eliminación recuperable.

**Aceptación**: cargar, recargar, abrir y usar una plantilla como referencia conserva el original y no permite ver archivos privados ajenos.

### 4.5 Referidos

**Distribución objetivo**

- Portada: invitados registrados, conversiones válidas y créditos ya abonados; no mostrar proyecciones como saldo real.
- Dos paneles superiores: enlace/código con copiar y compartir; explicación breve del flujo y reglas.
- Seguimiento: filtros por periodo y estados; tabla de invitaciones y, debajo, historial de movimientos de crédito.
- Estados pendientes, aprobados y rechazados describen el motivo sin exponer datos del invitado.

**Lógica a preservar y ampliar**

- Conservar código único, comprobaciones anti-autorreferido, revisión administrativa, auditoría y actualización del saldo.
- Cualquier número viene de movimientos trazables y configuración real del administrador.

**Aceptación**: crear/copiar un código funciona; una recompensa requiere validación administrativa y sólo se abona una vez.

### 4.6 Comunidad activa

**Distribución objetivo**

- Portada: publicaciones recientes, aportes guardados y participación propia; una síntesis de convivencia y privacidad.
- Después, una fila de acceso rápido por tema —experiencias, preguntas, recursos e ideas— y un bloque de «Cómo aportar de forma segura»; no reemplaza el feed.
- El formulario de publicación aparece en panel inicial compacto o diálogo; filtros y buscador anteceden al feed.
- Feed con tarjetas: contexto educativo, título, contenido resumido, reacciones útiles, guardado, comentarios, edición/retirada propia y moderación administrativa.

**Lógica a preservar y ampliar**

- Mantener publicaciones, etiquetas contextuales, filtros, reacciones, guardado, comentarios, retirada y moderación con auditoría.
- Agregar estados «sin respuesta», «destacado» y «reciente» solamente si se respaldan con consulta y reglas de backend.

**Aceptación**: al publicar, reaccionar, guardar o comentar se persiste; contenido moderado sale del feed; la interfaz no solicita ni muestra información identificable de estudiantes.

## 5. Cambios técnicos propuestos

### Compartidos

- Crear `UtilityHero` con slots de etiqueta, título, descripción, icono/ilustración, métricas y acción; no convertirlo en tarjeta con contenido fijo.
- Crear `UtilityFilterBar` con búsqueda, filtros, orden y acción primaria que se adapte de horizontal a vertical.
- Añadir parámetros de URL para filtros persistentes cuando ya estén soportados por backend.
- Extender `utilities.css` con variantes por utilidad, sin imponer el mismo componente de resultado a tutoriales, documentos, archivos, referidos y comunidad.
- Revisar `AppShell`, `Sidebar` y `Topbar` para asegurar sidebar desplazable, colapsable y navegable con teclado; la cuenta queda fija y sólo el listado central hace scroll.

### Datos y servicios

- Auditar cada métrica propuesta y exponer endpoint agregado cuando la lista existente no pueda calcularla de manera correcta y eficiente.
- Nunca reemplazar APIs actuales con arreglos de frontend ni contadores hardcodeados.
- Agregar pruebas de autorización, paginación, filtros y persistencia cada vez que se incorpore un nuevo campo o filtro.

## 6. Secuencia de implementación

- [ ] **Fase A — Baseline visual.** Capturar las seis rutas actuales en escritorio, tableta y móvil, en claro y oscuro. Registrar diferencias frente a las seis capturas antiguas.
- [ ] **Fase B — Marco común.** Implementar hero, barra de filtros y layout responsive compartidos; validar sidebar, topbar y accesibilidad sin cambiar la lógica de negocio.
- [ ] **Fase C — Biblioteca personal.** Aplicar Historial y Sube tu formato, pues comparten estados, archivos y acciones de documento.
- [ ] **Fase D — Aprendizaje y producto.** Aplicar Videos tutoriales e Ideas y mejoras, con progreso, filtros y comunicación de estado.
- [ ] **Fase E — Crecimiento y comunidad.** Aplicar Referidos y Comunidad activa, preservando controles de privacidad, auditoría y moderación.
- [ ] **Fase F — Pruebas.** Verificar cada operación real, recarga, permisos por rol, error de API, claro/oscuro y viewport de 360, 768, 1024 y 1440 px.
- [ ] **Fase G — Aprobación visual.** Comparar nuevas capturas con el referente: mismo orden conceptual y mejor adaptación, sin copiar colores ni defectos del legado.

## 7. Criterios de no regresión

1. Ningún botón que actualmente persiste datos pierde su conexión a backend.
2. Ninguna métrica se muestra si no puede explicarse con datos reales.
3. Ninguna pantalla debe crear scroll horizontal global a 360 px.
4. En modo oscuro, texto, bordes, controles, foco y estados de error son legibles.
5. El menú lateral contiene todas las utilidades, se desplaza de forma independiente y mantiene acceso a perfil/créditos/contraer.
6. No se introducen datos personales de estudiantes, créditos ficticios ni plantillas de otro docente.
7. Cada nueva mejora debe añadirse a este plan con: utilidad afectada, contrato/API, migración si aplica, caso de prueba, criterio visual y criterio de persistencia.

## 8. Registro de futuras decisiones

| Fecha | Utilidad | Decisión o mejora agregada | API/datos afectados | Prueba requerida | Estado |
|---|---|---|---|---|---|
| 2026-09-04 | Las seis | Se crea plan de equivalencia de distribución basado en la revisión local del proyecto anterior | Pendiente de auditoría por fase | Comparación visual y funcional por viewport | Propuesto |
| 2026-09-04 | Las seis | Se implementa `UtilityHero` y resumen autenticado de métricas por docente; las seis portadas consumen datos reales sin adoptar la paleta anterior | `GET /utilities/summary`, consultas privadas por usuario y caché de cliente | Pruebas backend de privacidad y pruebas frontend completas | Implementado · validado por pruebas |

## 9. Sistema visual actual, experiencia y control de calidad

Esta sección es obligatoria para toda mejora futura de las seis utilidades. El proyecto anterior es una referencia de **estructura y jerarquía**, no una fuente de diseño. Se conserva exclusivamente la identidad visual actual de Avendia, tanto en modo claro como en modo oscuro.

### 9.1 Contrato visual de Avendia

- [ ] Definir y usar únicamente los tokens visuales vigentes de Avendia: fondo, superficie, texto principal/secundario, borde, foco, acento, éxito, advertencia y error.
- [ ] Prohibir la reutilización de colores, logos, tipografías, fondos oscuros o degradados característicos del proyecto anterior.
- [ ] Documentar muestras de cada utilidad en tema claro y oscuro como referencia de aprobación antes/después.
- [ ] Usar color como apoyo, nunca como único indicador de estado: todo estado debe tener texto, icono o etiqueta legible.
- [ ] Revisar contraste, foco y legibilidad para texto, iconos, gráficos, controles deshabilitados y estados de alerta en ambos temas.

### 9.2 Distribución, densidad y adaptación

- [ ] Aplicar una portada estructurada común, conservando título, resumen, icono, métrica y acción propios de cada utilidad; no usar una portada genérica con contenido intercambiable.
- [ ] Antes de implementar cada utilidad, crear un mapa de distribución de su referencia: filas y columnas, tamaño relativo de cuadros, orden de bloques, ubicación de botones, acciones por tarjeta, filtros y recorrido de lectura. El resultado deberá adaptar esa disposición al sistema visual actual, nunca copiar su CSS ni sus colores.
- [ ] Mantener la jerarquía de botones del anterior: una acción principal visible, acciones secundarias próximas a la entidad que modifican y acciones destructivas separadas con confirmación. Un botón no debe trasladarse si su acción no existe o no es válida en el flujo nuevo.
- [ ] Aplicar tamaños de cuadro coherentes por función: métricas compactas, zonas de trabajo amplias, formularios con campos legibles, tarjetas de resultado escaneables y tablas para comparación. No igualar todos los paneles por defecto.
- [ ] Diseñar densidad adaptable: cómoda en escritorio, compacta en laptop y una columna clara en móvil.
- [ ] Convertir tablas de Historial, formatos y Referidos en tarjetas con etiquetas cuando el ancho sea reducido; el scroll horizontal local sólo será el último recurso y debe conservar encabezados.
- [ ] Mantener la acción principal visible sin superponerse a contenido, navegación, paneles de edición o teclado móvil.
- [ ] Garantizar `min-width: 0`, grillas flexibles, saltos de texto, botones envolventes y ausencia de scroll horizontal global a 360 px.
- [ ] Mantener el menú lateral con scroll interno, estado activo, cuenta accesible y control de contraer/expandir; en móvil debe abrirse como overlay y cerrarse sin perder el contexto de la página.

### 9.3 Estados y navegación que se recuerdan

- [ ] Toda métrica debe proceder de datos persistentes; si no hay información, mostrar cero o un estado vacío honesto con la acción siguiente adecuada.
- [ ] Conservar búsqueda, filtros, orden, página y pestaña al volver a Historial, Ideas, Comunidad, Referidos o biblioteca de tutoriales, mediante URL o estado persistido acorde al caso.
- [ ] Definir para cada utilidad carga contextual, vacío útil, error recuperable, éxito verificable, falta de permiso y reintento; nunca exponer mensajes técnicos como `Failed to fetch`.
- [ ] Usar animaciones breves y sobrias al filtrar, abrir paneles o guardar; respetar la preferencia del sistema para reducir movimiento.
- [ ] Añadir ayuda contextual opcional y concisa, sin quitar espacio de trabajo ni repetir instrucciones evidentes.

### 9.4 Accesibilidad, privacidad y rendimiento

- [ ] Verificar navegación por teclado, foco visible, orden semántico, etiquetas de lector de pantalla y controles A-/A/A+ sin rupturas de layout.
- [ ] Solicitar confirmación y explicar consecuencias antes de eliminar, archivar, retirar una publicación o alterar créditos.
- [ ] Mostrar avisos de privacidad antes de publicar en Comunidad, cargar formatos o compartir referidos; no exponer datos personales de estudiantes ni archivos privados.
- [ ] Añadir carga diferida, paginación real, esqueletos de carga y consultas eficientes para listas extensas.
- [ ] Mantener analítica administrativa agregada y autorizada: métricas globales sí; contenido privado de docentes, no salvo flujo autorizado y auditado.

### 9.5 Matriz de equivalencia y pruebas de liberación

- [ ] Mantener una fila por utilidad con: referencia estructural anterior, equivalente visual nuevo, operación de backend, origen de métricas, estados vacíos, prueba de permisos y estado de aprobación.
- [ ] Probar cada utilidad en 360, 768, 1024 y 1440 px; en tema claro, oscuro y tamaño de texto normal/aumentado.
- [ ] Probar las operaciones reales de cada pantalla: crear, consultar, filtrar, editar, persistir tras recargar, manejar errores, descargar cuando corresponda y restringir por rol.
- [ ] Aprobar una pantalla sólo cuando conserve la distribución conceptual anterior, respete por completo los colores actuales y no tenga datos simulados ni controles inertes.
- [ ] Registrar cada mejora futura en la tabla de decisiones con utilidad afectada, API/datos, prueba requerida y criterio visual/persistente.
