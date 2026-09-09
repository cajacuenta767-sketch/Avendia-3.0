# Prompt de implementación — cierre funcional 1 a 4

Trabaja sobre el proyecto existente **Avendia Escala 3.0** sin reemplazar su identidad visual, sus colores, su estructura de navegación ni los flujos pedagógicos ya recuperados. Implementa de extremo a extremo los cuatro bloques siguientes y no uses datos simulados cuando exista información real del usuario.

## Objetivo general

Convertir Inicio, acceso y formatos institucionales en funciones reales, seguras, persistentes y verificables. La experiencia debe funcionar en modo claro y oscuro, escritorio, tableta y móvil, conservar la estética actual de Avendia y utilizar los componentes, iconos, tipografía, radios, espaciado y estados ya existentes.

## 1. Inicio y notificaciones con datos reales

1. El contador de documentos, el historial reciente, las herramientas más utilizadas y las notificaciones deben derivarse exclusivamente de documentos, eventos y actividad pertenecientes al usuario autenticado.
2. El historial reciente debe mostrar como máximo cinco documentos ordenados por actualización, con título, estado, fecha relativa y ruta de origen. Si no existen documentos, debe mostrarse un estado vacío útil, nunca borradores de ejemplo.
3. Las herramientas más utilizadas deben calcularse a partir de documentos creados y, cuando exista, actividad de generación con IA. Si el usuario aún no tiene actividad, mostrar una selección de inicio claramente identificada como recomendada, no como “más utilizada”.
4. Las notificaciones deben construirse con eventos próximos, documentos recientes y estados accionables. El contador debe ser el número real de notificaciones; si no hay ninguna, no debe aparecer una burbuja falsa.
5. Al crear, actualizar o eliminar documentos y eventos, Inicio y la barra superior deben actualizarse sin recargar toda la aplicación.
6. Las consultas independientes deben ejecutarse en paralelo y reutilizar una caché breve para evitar solicitudes duplicadas.

## 2. Temas correctos en acceso y registro

1. Login, recuperación y registro deben soportar completamente los temas claro y oscuro mediante los mismos tokens visuales del proyecto.
2. Ningún texto, etiqueta, placeholder, borde, icono, mensaje, control, ilustración o estado puede perder contraste al conservar el tema elegido en el panel.
3. Agregar un selector de tema accesible en las pantallas públicas, persistente en `avendia.theme` y coherente con el selector interno.
4. Verificar foco visible, mensajes de error, éxito, campos deshabilitados, formularios largos y comportamiento responsivo.
5. No rediseñar la composición aprobada del login ni del registro; únicamente completar estados y temas faltantes.

## 3. Recuperación segura de contraseña

1. Sustituir el mensaje “contacta al administrador” por un flujo de tres estados: solicitar código, validar código con nueva contraseña y confirmación.
2. Crear endpoints públicos para solicitar y completar la recuperación sin revelar si un correo está registrado.
3. Generar un código criptográficamente seguro, almacenar únicamente su huella, limitar intentos, establecer expiración corta y volverlo inutilizable después del cambio.
4. Invalidar retos anteriores del mismo usuario cuando se solicite uno nuevo.
5. En producción, enviar el código por SMTP configurado. En desarrollo, permitir visualizar el código de prueba devuelto por la API para verificar el flujo local. Nunca devolverlo en producción.
6. La contraseña nueva debe respetar la política de mínimo diez caracteres y no puede reutilizar el código como contraseña.
7. Incluir pruebas de correo inexistente, código inválido, expirado, usado, límite de intentos y cambio exitoso.

## 4. Formatos institucionales utilizables

1. Migrar “Sube tu formato” de almacenamiento exclusivo del navegador a almacenamiento autenticado en el backend, aislado por propietario.
2. Aceptar DOCX, PDF, XLSX y PPTX de hasta 10 MB, validar extensión, tipo, tamaño y contenido básico, y permitir listar, descargar, establecer como predeterminado y eliminar.
3. Mostrar la biblioteca sincronizada, estado de carga, errores claros, formato predeterminado y confirmación de eliminación.
4. En el resultado de cada flujo genérico, permitir seleccionar “Diseño estándar de Avendia” o uno de los formatos institucionales del usuario.
5. Cuando se elija un formato:
   - DOCX: conservar el documento base, reemplazar marcadores conocidos cuando existan y agregar el contenido generado de forma estructurada.
   - PDF: conservar las páginas originales y anexar páginas legibles con el contenido generado.
   - XLSX: conservar el libro y agregar o actualizar una hoja `Contenido Avendia`.
   - PPTX: conservar la presentación y agregar diapositivas con título, resumen y secciones.
6. Registrar en el borrador y en el documento sincronizado el identificador y nombre de la plantilla usada.
7. Si no hay plantilla seleccionada, conservar la descarga Word estándar actual.
8. La API debe devolver el nombre de archivo y el tipo MIME correctos, sin exponer archivos de otros usuarios.

## Requisitos técnicos y de calidad

- Mantener React, TypeScript, Vite, FastAPI, SQLAlchemy y Alembic.
- Implementar componentes pequeños y funciones reutilizables; evitar duplicar consultas o lógica de estado.
- Mantener compatibilidad con los documentos y borradores existentes.
- Añadir migraciones reversibles, modelos, esquemas, rutas y pruebas de backend.
- Añadir pruebas de frontend para datos reales de Inicio, recuperación, temas y selección de formatos.
- Ejecutar y aprobar: pruebas de frontend, lint, build, pruebas de backend y revisión de migraciones.
- Verificar con el navegador integrado los flujos principales en escritorio y móvil, revisar consola y capturar evidencia visual.
- No enviar correos reales ni consumir Gemini durante las pruebas automatizadas.

## Criterio de terminado

El trabajo se considera terminado únicamente cuando no quedan datos de demostración visibles, ambos temas son legibles, un usuario puede recuperar su contraseña localmente de principio a fin, una plantilla subida queda sincronizada y puede aplicarse a una descarga generada, todas las pruebas pasan y los cuatro flujos se comprueban visualmente sin errores de consola.
