# Prompt maestro de paridad funcional — Avendia 3.0

## Rol y objetivo

Actúa como un equipo de producto, UX, frontend, backend, QA y especialista curricular peruano. Reconstruye Avendia 3.0 en el proyecto nuevo sin mezclar ni importar la arquitectura del proyecto anterior. El proyecto anterior es la fuente de verdad funcional; el proyecto nuevo es la fuente de verdad visual y técnica.

- Referencia funcional: `C:\Users\PC\Desktop\Avendia`.
- Proyecto de destino: `C:\Users\PC\Documents\ChatGPT\Avend Escala 3.0`.
- Referencia visual del destino: azul, violeta, blanco, Inter/Manrope, bordes suaves, jerarquía limpia y flujos por pasos.

No declares una pantalla terminada por parecerse visualmente. Debes comprobar sus campos, validaciones, botones, estados, persistencia, resultado de IA, acciones posteriores, diseño responsivo, modo claro y modo oscuro.

## Método obligatorio de auditoría archivo por archivo

1. Inventaría cada `page.tsx`, layout, componente compartido, servicio, endpoint, exportador y estado del proyecto anterior.
2. Relaciona cada ruta histórica con una de estas categorías: ruta vigente, alias histórico, utilidad, pantalla administrativa o flujo descartado explícitamente.
3. Para cada herramienta vigente registra: ruta, módulo, pasos, campos, obligatoriedad, selectores, preguntas, autocompletado, botones auxiliares, modales, calendarios, IA, vista previa, edición, guardado, copia, descarga e interacción del estudiante.
4. Localiza la implementación real detrás de cada control. No copies un botón sin copiar su comportamiento, estados de carga, error y éxito.
5. Implementa la paridad mediante componentes compartidos del proyecto nuevo. No pegues páginas heredadas ni replique errores de diseño.
6. Compara en el navegador la referencia y el destino con el mismo tamaño, tema y estado. Corrige recortes, desbordamientos, colores, contraste, espaciado y controles que no respondan.
7. Ejecuta pruebas, compilación y verificación de rutas. Una función solo pasa a “entregada” cuando existe evidencia ejecutable.

## Navegación y superficies globales obligatorias

La barra lateral debe conservar los nueve destinos principales: Inicio, Planificamos, Calendario, Evaluamos, Incluimos, Reforzamos, Acompañamos, Tutoría y Recursos. Debe conservar también las seis utilidades: Videos tutoriales, Historial, Ideas y mejoras, Sube tu formato, Referidos y Comunidad activa. El menú puede colapsarse, mantiene la ruta activa, funciona en móvil y no pierde las acciones de perfil, créditos ni cierre de sesión.

La barra superior debe incluir:

- volver a la pantalla anterior cuando corresponda;
- título dinámico de la ruta;
- buscador global y atajo `Ctrl/Cmd + K`;
- selectores persistentes `A−`, `A` y `A+`, con escalas 87,5 %, 100 % y 112,5 %;
- modo claro/oscuro persistente;
- botón para abrir o cerrar el panel contextual cuando la herramienta lo use;
- notificaciones y acceso al perfil.

Los flujos de Planificación y Tutoría que dependan de fechas deben disponer de un panel lateral contextual con calendario mensual seleccionable, indicadores de eventos, detalle del día, enlace al calendario completo e historial de creación. El panel debe poder ocultarse y convertirse en cajón superpuesto en tableta/móvil.

Debe existir un botón flotante de Gemini en todas las pantallas del espacio docente. Al abrirlo:

- reconoce la ruta, herramienta, módulo, campos y valores actuales;
- ofrece acciones rápidas específicas por módulo;
- envía la solicitud al backend autenticado;
- muestra carga, error y respuesta;
- permite copiar;
- permite elegir un campo compatible e insertar la respuesta;
- funciona y se lee correctamente en ambos temas.

## “Generar con guía”

Cada flujo por pasos debe ofrecer `Generar con guía`. El cuadro de ayuda debe:

1. mostrar el avance de todos los pasos y cuántos obligatorios faltan;
2. permitir saltar al paso elegido;
3. permitir elegir el campo de texto que se quiere preparar;
4. recoger una indicación breve del docente;
5. solicitar a Gemini una propuesta basada en todo el formulario;
6. mostrar la propuesta antes de modificar datos;
7. aplicar la propuesta únicamente tras confirmación;
8. mantener siempre el control editorial del docente.

## Contrato de las 57 herramientas

Debe haber exactamente 57 entradas de menú y exactamente 57 contratos ejecutables, sin formulario universal de respaldo. Todas incluyen modalidad educativa obligatoria: EBR, EBA o EBE. Autocompleta desde el perfil docente, DRE, UGEL, institución, director, nivel, grado, sección, área y año solo cuando sean pertinentes.

- Planificamos (8): PCA, unidad, sesión, situación significativa, proyectos integrados, adaptación NEE–DUA, tarea de extensión y carpeta pedagógica.
- Evaluamos (11): rúbrica, lista de cotejo, ficha de aprendizaje, examen, escala, preguntas sobre texto, observación, registros, recuperación, calificador IA y analítica.
- Incluimos (5): adaptación NEE–DUA, PAI/plan de atención, estrategias, familias y seguimiento.
- Reforzamos (5): trabajo autónomo, carpeta, monitoreo, motivación y plan de refuerzo.
- Acompañamos (5): correo, respuesta, analítica, calificador y reporte.
- Tutoría (8): plan, sesiones, informe, informe a familias, fichas, alertas, recursos y orientación vocacional.
- Recursos (15): presentaciones, tarjetas, agrupar, ordenar, casos ABP, ahorcado, completar, emparejar, debate, crucigrama, sopa, banco, normativa, libros MINEDU y canales audiovisuales.

La profundidad debe depender del resultado:

- Alta: PCA, unidad, sesión, PAI, planes, analítica, alertas e informes; entre 4 y 9 pasos.
- Media: instrumentos, reportes y recursos elaborados; entre 3 y 5 pasos.
- Breve: actividades didácticas; entre 2 y 3 pasos y sin burocracia irrelevante.

El PCA conserva nueve pasos: Datos, Descripción, Calendarización, Demandas, Competencias, Materiales, Referencias, Bibliografía y Cierre. Unidad, sesión, proyectos, PAI, refuerzo, tutoría e informes incluyen propósito, evidencia, criterios, evaluación, responsables y seguimiento según corresponda.

## Calendario

El calendario completo debe conservar navegación por mes y año, vista mensual/anual, selección de periodo, creación, edición, eliminación y completado de eventos, filtros, tipos de evento, fechas cívicas, feriados, concursos, bloques lectivos y semanas de gestión. Debe mantener su panel de periodos/concursos y persistir eventos en backend cuando hay sesión, con respaldo local cuando no la hay.

## Resultados e interacción

Una herramienta no termina al mostrar un párrafo. La IA debe devolver un contrato JSON validado y el frontend debe convertirlo en el artefacto correcto:

- documentos: secciones completas, revisión, edición, guardado, copia y Word;
- instrumentos: matrices, criterios, niveles, clave o respuesta esperada;
- analítica: evidencia separada de inferencia, alerta y acción;
- presentaciones: reproductor, contenido y notas;
- tarjetas: frente/reverso;
- agrupar y ordenar: tablero manipulable, verificación y reinicio;
- ahorcado: vidas, teclado, pistas y avance;
- completar y emparejar: interacción, puntaje y solución;
- crucigrama y sopa: cuadrícula, pistas, validación y reinicio;
- casos y debate: tarjetas accionables y guía docente.

## Gemini, seguridad y créditos

La clave de Gemini vive solo en variables de entorno del backend. Todas las rutas de IA requieren autenticación, validan entrada y usan salida estructurada cuando el artefacto lo permite. El contenido del formulario se trata como datos no confiables y nunca como instrucciones del sistema.

Cada generación descuenta créditos solo después de una respuesta exitosa y registra consumo estimado y cantidad de generaciones. El administrador dispone de un panel protegido por rol para:

- ver usuarios, créditos disponibles/asignados, tokens consumidos y generaciones;
- revisar el consumo por cuenta;
- añadir o reducir créditos sin permitir saldo negativo;
- impedir generación y mostrar un mensaje claro cuando el saldo es insuficiente.

## Tema y diseño responsivo

Cada componente nuevo debe tener estados claro y oscuro explícitos: fondo, texto, borde, entrada, modal, tabla, menú, panel, tooltip, carga, error y foco. No deben quedar superficies blancas ni texto oscuro ilegible en modo oscuro.

Validar al menos 360 × 800, 768 × 1024, 1366 × 768 y 1920 × 1080. No se admite desplazamiento horizontal global, botones fuera del viewport, modales inaccesibles, barras laterales que bloqueen contenido ni acciones flotantes superpuestas al botón principal.

## Criterios de aceptación y cierre

Una ruta está terminada únicamente cuando:

1. abre desde el menú y la barra superior muestra el título correcto;
2. sus pasos y campos coinciden con el artefacto del proyecto anterior;
3. modalidad y obligatorios se validan;
4. el borrador se recupera;
5. `Generar con guía` funciona;
6. el copiloto puede usar el contexto e insertar una respuesta;
7. Gemini genera un resultado real y los créditos se actualizan;
8. el resultado puede revisarse, guardarse, copiarse y descargarse;
9. funciona en claro, oscuro, móvil, tableta y escritorio;
10. pasa pruebas, lint y compilación.

No uses frases como “todo está copiado” basándote en un inventario. Mantén una matriz de paridad con estados `pendiente`, `en progreso`, `implementado` y `verificado`; adjunta evidencia de cada estado verificado.

## Aplicación de este prompt en el incremento actual

- Inventario histórico: 97 páginas bajo el dashboard anterior.
- Contratos vigentes: 57 herramientas y 57 definiciones de flujo.
- Implementado en este incremento: A−/A/A+, volver, perfil, panel contextual en Planificación/Tutoría, calendario lateral interactivo, copiloto Gemini contextual, inserción en campos, `Generar con guía`, créditos por generación y panel administrativo de consumo.
- Pendiente de verificación final: comparación visual en cuatro anchos, recorrido de todos los accesos, pruebas directas del nuevo endpoint de copiloto y revisión de cada superficie en ambos temas.
