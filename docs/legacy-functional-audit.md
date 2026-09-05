# Auditoría funcional del proyecto anterior

Fecha: 31 de agosto de 2026.

## Alcance revisado

Se inventariaron 97 páginas del dashboard anterior. La distribución encontrada fue: Recursos 16, Tutoría 15, Evaluamos 12, Planificamos 7, Incluimos 6, Reforzamos 6, Acompañamos 6 y 29 páginas raíz, utilidades o alias históricos.

El destino contiene 57 herramientas registradas y 57 contratos de flujo. La diferencia no representa 40 herramientas omitidas: el proyecto anterior conserva alias y versiones antiguas como `plan-anual`, `unidades`, `sesiones`, `fichas`, `lista-cotejo`, `rubrica-evaluacion`, `fichas-aprendizaje`, `examenes`, `materiales`, `herramientas`, `generar`, `formato` y `planificacion/proyectos-integrados`. La ruta funcional vigente se mapea a una sola herramienta del catálogo nuevo.

## Paridad global

| Área | Referencia anterior | Destino nuevo | Estado |
|---|---|---|---|
| Menú principal | 9 destinos | 9 destinos | Implementado |
| Utilidades | 6 destinos | 6 destinos | Implementado |
| Colapso de menú | Sí | Sí, persistente | Implementado |
| A− / A / A+ | 87,5 / 100 / 112,5 % | Misma escala y persistencia | Implementado |
| Modo claro/oscuro | Persistente | Persistente | Verificado en los ocho módulos, calendario, historial, perfil, formatos y administración |
| Buscador global | Barra superior | Barra superior + Ctrl/Cmd K | Implementado |
| Panel lateral contextual | Calendario e historial | Planificación y Tutoría | Implementado |
| Calendario completo | Mes, año, fechas, concursos, bloques | Mes, año, eventos, fechas, concursos, bloques | Implementado |
| Lápiz/copiloto | Cajón IA con acciones e inyección | Cajón Gemini contextual con copia e inserción | Implementado |
| Generar con guía | Ayuda contextual | Progreso, campo, instrucción, propuesta y aplicación | Implementado |
| Créditos/tokens | Panel administrativo | Saldo, consumo, generaciones y ajustes | Implementado |
| IA | Gemini | Gemini solo desde backend autenticado | Implementado |

## Mapeos históricos principales

- `/dashboard/plan-anual` → `/dashboard/planificamos/plan-curricular-anual`.
- `/dashboard/unidades` y `/dashboard/unidad-aprendizaje` → `/dashboard/planificamos/unidad-aprendizaje`.
- `/dashboard/sesiones` → `/dashboard/planificamos/sesion-aprendizaje`.
- `/dashboard/rubrica-evaluacion` → `/dashboard/evaluamos/rubrica-evaluacion`.
- `/dashboard/lista-cotejo` → `/dashboard/evaluamos/lista-cotejo`.
- `/dashboard/fichas` y `/dashboard/fichas-aprendizaje` → `/dashboard/evaluamos/ficha-aprendizaje`.
- `/dashboard/examenes` → `/dashboard/evaluamos/examen`.
- `/dashboard/tutoria/informe` y `/dashboard/tutoria/informe-tutoria` → `/dashboard/tutoria/informe-tutoria`.
- `/dashboard/tutoria/plan` y `/dashboard/tutoria/plan-tutoria` → `/dashboard/tutoria/plan-tutoria`.
- `/dashboard/tutoria/sesiones` y `/dashboard/tutoria/sesiones-tutoria` → `/dashboard/tutoria/sesiones-tutoria`.
- `/dashboard/recursos/juego-ahorcado` → `/dashboard/recursos/ahorcado`.
- `/dashboard/recursos/dinamica-debate` → `/dashboard/recursos/debate-aula`.
- `/dashboard/recursos/sopa-letras` → `/dashboard/recursos/sopas-letras`.
- `/dashboard/recursos/banco-recursos` → `/dashboard/recursos/banco-planificacion`.
- `/dashboard/recursos/libros-minedu` → `/dashboard/recursos/libros-guia-minedu`.

## Exclusiones conscientes

Las rutas históricas `aulas`, `salas`, `chat`, `documentos`, `materiales`, `formato`, `generar` y `herramientas` no se añadieron como entradas duplicadas al menú nuevo. Sus capacidades útiles se distribuyen entre módulos, historial, carga de formato, creación guiada y copiloto. Antes de eliminar definitivamente su código de referencia debe comprobarse que ningún contrato exclusivo quede sin mapear.

## Regla de seguimiento

“Implementado” significa que existe la función en el destino. “Verificado” exige recorrido en navegador, prueba de interacción, comprobación en claro/oscuro y al menos un tamaño móvil y uno de escritorio. Esta auditoría no marca toda la aplicación como verificada hasta completar ese recorrido.

## Evidencia de cierre

- 57 de 57 herramientas recorridas en escritorio y móvil; ninguna presentó desbordamiento horizontal ni pantalla de error.
- Muestras oscuras verificadas en Planificamos, Evaluamos, Incluimos, Reforzamos, Acompañamos, Tutoría y Recursos, además de calendario, historial, perfil, formatos y administración.
- Los controles A−, A y A+ se comprobaron a 14, 16 y 18 píxeles base, equivalentes a 87,5 %, 100 % y 112,5 %.
- El asistente “Generar con guía” se comprobó con modal contextual, preguntas, sugerencias rápidas, detalle libre y acción Gemini.
- El calendario de agosto de 2026 se comprobó con días, eventos, concursos, bloques académicos, filtros y navegación mensual/anual.
- Evidencia visual: `audit/avendia-pca-dark-final.png`.
