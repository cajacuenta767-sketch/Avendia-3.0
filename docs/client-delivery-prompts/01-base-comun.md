# Punto 1 — Base común de formularios educativos

## Objetivo

Unificar todos los formularios de Avendia sin cambiar la identidad visual del proyecto nuevo. Cada herramienta debe orientar al docente, impedir avances con datos indispensables incompletos y ofrecer siempre las tres modalidades educativas acordadas.

## Reglas de implementación

1. Toda herramienta debe incluir un selector obligatorio de modalidad con exactamente estas opciones:
   - EBR — Educación Básica Regular.
   - EBA — Educación Básica Alternativa.
   - EBE — Educación Básica Especial.
   Al cambiar la modalidad se deben limpiar y reconstruir sus selecciones dependientes. No se debe tratar a las tres modalidades como si compartieran la misma estructura:
   - EBR: Inicial, Primaria y Secundaria con sus grados/ciclos;
   - EBA: ciclos Inicial, Intermedio y Avanzado;
   - EBE: PRITE (ciclo I, sin grado escolar) y CEBE (Inicial y Primaria).
2. No usar asteriscos para marcar obligatoriedad. Mostrar las palabras `Obligatorio` u `Opcional` junto al nombre del campo.
3. Todo campo debe tener orientación visible:
   - texto y texto largo: ejemplo contextual y una instrucción breve;
   - selector: indicar qué debe escoger el docente;
   - selector dependiente: explicar que sus opciones cambian según la selección anterior;
   - número: informar el rango admitido;
   - fecha: explicar qué fecha se espera;
   - selección múltiple: indicar que se puede elegir más de una opción;
   - listas repetibles: explicar cómo añadir, editar o eliminar filas.
4. Al pulsar `Siguiente` o `Generar con IA` con datos inválidos:
   - mostrar una alerta accesible con la cantidad de campos pendientes;
   - enumerar los campos y el problema de cada uno;
   - permitir pulsar cada elemento de la alerta para ir al campo;
   - desplazar la pantalla y enfocar el primer campo inválido;
   - si el error está en otro paso, abrir ese paso antes de enfocar;
   - marcar los controles con `aria-invalid` y enlazarlos con su mensaje.
5. Mantener colores, tipografía, espaciado, componentes y modo oscuro del proyecto nuevo.
6. En móvil, la alerta y todos los campos deben caber dentro de la pantalla sin desplazamiento horizontal.

## Criterios de aceptación

- Las 57 herramientas contienen modalidad EBR/EBA/EBE y ninguna usa `EBEE`.
- Ningún campo carece de ayuda contextual.
- Los campos de texto muestran ejemplos o instrucciones útiles, no textos genéricos vacíos.
- La validación anuncia, lista, desplaza y enfoca correctamente el primer error.
- La interfaz sigue siendo legible en tema claro y oscuro.
- Pruebas automáticas, compilación y revisión visual terminan sin errores.
