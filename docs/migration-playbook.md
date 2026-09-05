# Plan de migración desde Avendia anterior

## Lo que se permite trasladar

- Datos reales validados.
- Contratos funcionales confirmados por pruebas.
- Catálogo curricular CNEB con procedencia conocida.
- Plantillas y recursos sobre los que exista autorización.
- Prompts después de revisión pedagógica y de seguridad.

## Lo que no se copia

- Código fuente de la aplicación anterior.
- Tokens, secretos, contraseñas o archivos `.env`.
- Usuarios ficticios, telemetría sembrada o bases locales de demostración.
- Fallbacks que inventen sesiones, respuestas o contenido.

## Secuencia

1. Congelar la versión anterior y hacer respaldo de solo lectura.
2. Inventariar la base productiva real, separada de SQLite y datos ficticios.
3. Exportar cada entidad a un formato intermedio validable.
4. Transformar identificadores, estados y fechas sin perder trazabilidad.
5. Importar a un ambiente temporal.
6. Comparar conteos, relaciones y muestras de contenido.
7. Ejecutar pruebas de contrato contra ambos sistemas.
8. Migrar usuarios sin trasladar contraseñas inseguras; forzar restablecimiento cuando corresponda.
9. Hacer corte por módulo con plan de reversión.

Cada migración debe registrar `source_id`, fecha, versión del transformador y resultado de validación.

