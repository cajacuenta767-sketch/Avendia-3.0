# Prompt maestro — Centro de control administrativo de Avendia

## Rol y misión

Actúa como un equipo integrado de arquitectura, seguridad, operaciones, analítica de producto, UX, frontend, backend, QA y administración educativa. Amplía el panel de Avendia 3.0 hasta convertirlo en un centro de control operativo completo, basado exclusivamente en datos reales de la aplicación y coherente con el diseño azul/violeta, claro/oscuro y responsivo existente.

Proyecto objetivo: `C:\Users\PC\Documents\ChatGPT\Avend Escala 3.0`.

No construyas tarjetas decorativas, gráficos con datos inventados ni botones sin comportamiento. Cada cifra debe proceder de usuarios, documentos, eventos de calendario, generaciones de IA, consumo de créditos, registros de auditoría o configuración persistida. Cuando todavía no exista histórico para una métrica, muéstrala como dato no disponible o empieza a registrarla desde este incremento; nunca fabriques una serie temporal.

## Trabajo administrativo que debe resolver

El panel es una superficie de monitoreo y operación para administradores autorizados. Debe permitir responder, al menos, estas preguntas:

1. ¿Cuántas cuentas existen, cuántas están activas y cómo se distribuyen por rol, modalidad y nivel?
2. ¿Cuántos documentos, eventos de calendario y generaciones se están creando?
3. ¿Qué herramientas y módulos consumen más IA, créditos y tokens?
4. ¿Qué cuentas tienen poco saldo, están inactivas o presentan actividad anómala?
5. ¿Qué acciones administrativas se realizaron, quién las hizo, sobre qué entidad y con qué motivo?
6. ¿Está disponible la API, la base de datos y la integración con Gemini?
7. ¿Qué configuración global rige el registro y la asignación inicial de créditos?
8. ¿Puede el administrador investigar una cuenta y actuar sin perder trazabilidad?

## Arquitectura de información

Mantén una sola ruta administrativa principal y organiza el contenido mediante pestañas persistentes dentro del panel:

- **Resumen:** estado general, alertas operativas, actividad temporal y distribución de cuentas.
- **Usuarios:** búsqueda, filtros, detalle, rol, estado, créditos y actividad de cada cuenta.
- **IA y créditos:** consumo acumulado y reciente, herramientas más utilizadas, cuentas con mayor consumo y movimientos.
- **Contenido:** documentos y eventos creados, estados, tipos, actividad reciente y propietarios.
- **Auditoría:** registro cronológico de acciones administrativas con actor, acción, objetivo, motivo, fecha y datos relevantes no sensibles.
- **Configuración:** registro abierto/cerrado, créditos iniciales y umbral de saldo bajo, además del estado sanitario del sistema.

Las pestañas no deben duplicar la navegación global. El panel debe conservar la barra lateral, barra superior, A−/A/A+, tema, búsqueda, perfil y copiloto existentes.

## Métricas obligatorias y definición

Calcula en el backend y devuelve con un contrato tipado:

- usuarios totales;
- usuarios activos e inactivos;
- docentes y administradores;
- altas dentro del periodo seleccionado;
- créditos disponibles y total histórico asignado;
- tokens estimados consumidos;
- generaciones acumuladas;
- documentos totales y documentos creados en el periodo;
- eventos de calendario totales, próximos y completados;
- cuentas bajo el umbral configurado;
- consumo medio de créditos por generación, calculado solo cuando existen generaciones;
- actividad diaria del periodo para altas, documentos, eventos y generaciones;
- distribución por rol, modalidad y nivel;
- ranking por cuenta y por herramienta usando medidas no negativas y aditivas.

Cada etiqueta debe ser neutral y seguir siendo verdadera cuando cambien filtros o datos. No uses titulares del tipo “el consumo está creciendo” ni recomendaciones automáticas sin evidencia.

## Filtros y estado

Incluye filtros funcionales y accesibles:

- periodo: 7, 30 o 90 días;
- búsqueda por nombre, correo o institución;
- rol: todos, docente, administrador;
- estado: todos, activo, inactivo;
- modalidad y nivel cuando existan en los datos;
- módulo o herramienta para consumo de IA.

El filtro temporal debe actualizar métricas recientes, series y tablas afectadas. Los filtros de usuarios deben actuar solo sobre esa vista. Mantén selección, carga, vacío y error claramente diferenciados.

## Visualizaciones

Usa gráficos simples y legibles:

- área o líneas para actividad diaria, con fechas horizontales y valores visibles en tooltip;
- barras para consumo por herramienta o cuenta;
- dona solo para composición mutuamente excluyente, como activo/inactivo o docente/administrador;
- barras de progreso para saldo utilizado por cuenta;
- tabla detallada como fuente principal de investigación.

No uses 3D, medidores decorativos ni colores sin significado. Mantén una paleta semántica: azul para actividad, violeta para IA, verde para correcto/activo, ámbar para advertencia y rojo para bloqueo/error. Todo gráfico debe tener título de medición, descripción accesible, leyenda clara, estado vacío y alternativa textual suficiente.

## Gestión de usuarios

La tabla debe mostrar nombre, correo, institución, rol, estado, modalidad/nivel, saldo, generaciones, último dato disponible y fecha de alta. Debe permitir:

- abrir un panel de detalle;
- activar o desactivar una cuenta;
- cambiar entre docente y administrador;
- añadir o descontar una cantidad personalizada de créditos con motivo obligatorio;
- ver documentos, eventos y consumo de la cuenta;
- exportar la vista filtrada a CSV sin exponer contraseña, token ni clave.

Reglas de seguridad:

- impedir que el administrador se desactive a sí mismo;
- impedir desactivar o degradar al último administrador activo;
- impedir saldo negativo;
- validar todo nuevamente en backend;
- exigir motivo para cambios de estado, rol y créditos;
- registrar cada operación en auditoría;
- no implementar borrado definitivo de cuentas desde esta pantalla.

## Trazabilidad de IA

Registra cada generación exitosa en una tabla de eventos con usuario, herramienta, módulo, modelo, créditos descontados, tokens estimados y fecha. No registres el prompt completo ni el contenido generado. Los totales actuales del usuario siguen siendo la fuente acumulada; los nuevos eventos permiten series, rankings y auditoría a partir de este incremento.

No descuentes créditos si Gemini falla. Las rutas de IA continúan autenticadas y la clave permanece exclusivamente en variables de entorno del backend.

## Auditoría administrativa

Registra acciones como:

- ajuste de créditos;
- activación o desactivación;
- cambio de rol;
- actualización de configuración.

Cada registro contiene actor, acción, tipo e identificador del objetivo, motivo, detalle estructurado sin secretos y fecha. La auditoría es de solo lectura desde el frontend; no debe ofrecer eliminación.

## Configuración funcional

Persiste una configuración global con:

- registro público abierto o cerrado;
- créditos iniciales para cuentas nuevas;
- umbral de saldo bajo.

La ruta de registro debe respetar `registration_open`. Las nuevas cuentas deben tomar `default_ai_credits`. Los cambios requieren administrador y generan auditoría. No añadas interruptores que no estén conectados a comportamiento real.

## Salud del sistema

Muestra únicamente información segura:

- estado de API;
- conectividad de base de datos;
- Gemini configurado/no configurado;
- nombre del modelo configurado;
- entorno;
- hora de comprobación.

Nunca muestres claves, secretos, cadenas de conexión, rutas internas sensibles ni contenido de prompts.

## Backend

Implementa modelos, migración, esquemas y endpoints protegidos por rol. Conserva compatibilidad con los endpoints administrativos existentes cuando sea razonable. Prefiere una respuesta de resumen agregada para evitar cascadas de solicitudes y endpoints específicos para tablas, detalle y mutaciones.

Contratos mínimos sugeridos:

- `GET /admin/dashboard?days=30`;
- `GET /admin/users` con filtros;
- `GET /admin/users/{id}`;
- `PATCH /admin/users/{id}` para rol/estado;
- `PATCH /admin/ai-usage/accounts/{id}` para créditos;
- `GET /admin/ai-usage/events`;
- `GET /admin/content`;
- `GET /admin/audit`;
- `GET /admin/settings`;
- `PATCH /admin/settings`;
- `GET /admin/system/status`.

Todos los agregados deben contar UUID, no campos opcionales; fechas y agrupaciones deben ser compatibles con SQLite de desarrollo y PostgreSQL de producción.

## Frontend

Construye componentes React tipados, separa datos, visualización y operaciones. Ejecuta solicitudes independientes en paralelo y evita recargas en cascada. Carga la librería de gráficos solo dentro de la ruta administrativa si su peso es significativo. Usa `ResponsiveContainer`, tooltips temáticos y valores formateados en español.

Incluye:

- encabezado compacto con periodo y actualización;
- pestañas accesibles;
- KPI compactos;
- gráfico de actividad;
- composición de cuentas;
- ranking de consumo;
- alertas operativas accionables;
- tabla de usuarios con búsqueda y filtros;
- panel lateral o modal de detalle;
- cuadro de confirmación para acciones sensibles con motivo;
- tablas de IA, contenido y auditoría;
- formulario de configuración;
- exportación CSV de la vista de usuarios.

No presentes datos de ejemplo como reales. Los estados sin histórico deben explicar desde qué momento se empezará a registrar.

## Diseño claro, oscuro y responsivo

Usa los colores, tipografía, bordes y radios actuales. Define explícitamente ambos temas para tarjetas, gráficos, ejes, tooltips, tablas, modales, pestañas, filtros, estados y formularios.

- escritorio: composición densa y legible sin superar el ancho útil del shell;
- tableta: gráficos apilados, tabla con desplazamiento interno;
- móvil: KPIs en una columna, pestañas desplazables, gráficos con altura controlada, filtros apilados y acciones de cuenta dentro del panel de detalle;
- no debe existir desplazamiento horizontal global;
- todas las acciones deben tener foco visible y texto o `aria-label`;
- no dependas exclusivamente del color o del hover.

## Pruebas y criterios de aceptación

1. Un docente recibe 403 en todas las rutas administrativas.
2. Un administrador obtiene métricas reales y filtradas.
3. El último administrador activo no puede ser desactivado ni degradado.
4. Un administrador no puede desactivarse a sí mismo.
5. Los ajustes nunca producen saldo negativo y generan auditoría.
6. Los cambios de rol, estado y configuración generan auditoría.
7. El registro cerrado rechaza cuentas nuevas; abierto usa los créditos configurados.
8. Una generación exitosa crea evento de consumo; una fallida no descuenta ni registra.
9. Los gráficos muestran los mismos totales que sus tablas y estados vacíos.
10. La exportación CSV respeta los filtros y omite campos sensibles.
11. Tema claro y oscuro son legibles.
12. Frontend: lint, pruebas y compilación aprobados.
13. Backend: migración, lint y pruebas aprobados.
14. Salud y preparación de la API continúan respondiendo.

## Ideas posteriores, fuera de este incremento salvo que ya exista soporte

- presupuestos mensuales por institución o grupo;
- permisos granulares más allá de docente/administrador;
- autenticación multifactor;
- restablecimiento seguro de contraseña mediante enlace de un solo uso;
- notificaciones por correo ante saldo bajo o actividad anómala;
- límites por herramienta, usuario o periodo;
- retención configurable de auditoría;
- comparación entre instituciones con consentimiento y anonimización;
- panel de costos monetarios cuando exista una tarifa verificable por modelo;
- exportación programada y alertas automáticas.

No implementes estas ideas como interruptores visuales hasta disponer de backend, política y fuente de verdad.
