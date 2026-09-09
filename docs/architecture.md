# Arquitectura de Avendia 3.0

## Decisión principal

Avendia 3.0 usa una sola API FastAPI. React presenta la interfaz y consume contratos HTTP; no contiene consultas SQL, claves de IA ni reglas de autorización.

```text
Navegador React
      │ HTTPS /api/v1
      ▼
API FastAPI ──── proveedor de IA
      │
      ▼
PostgreSQL + pgvector
```

## Límites de módulos

- `auth`: identidad, contraseñas, tokens, recuperación y límites de intentos.
- `users`: perfil, rol, catálogo educativo y preferencias de experiencia.
- `documents`: historial, borradores y vista previa PDF de lo generado.
- `ai`: herramientas de generación con Gemini, copiloto, presentaciones e imágenes.
- `evaluation_instruments`: rúbricas, listas de cotejo y documentos fuente.
- `rosters`: nóminas de estudiantes e importación desde Excel.
- `calendar`: calendario escolar y eventos propios.
- `templates` y `utilities`: formatos subidos, versiones, comunidad, ideas,
  tutoriales, referidos e historial.
- `admin`: panel de control, uso y créditos de IA, auditoría y ajustes.

Transversales en `core`: configuración validada (`config.py`), envelope de
errores (`errors.py`), seguridad JWT (`security.py`), limitador de ritmo
(`ratelimit.py`) y descargas HTTPS seguras (`safe_http.py`).

Cada módulo contiene sus propios modelos de entrada/salida y rutas. Las dependencias comunes viven en `core`, `db` y `api`.

## Reglas obligatorias

- Ninguna ruta protegida confía en roles enviados por el navegador.
- Todo documento se consulta por `id` y `owner_id`.
- Las claves externas se leen únicamente del entorno del backend.
- La API falla de forma explícita si una dependencia no está disponible.
- No existe cambio automático de PostgreSQL a otra base.
- Alembic es la única vía para cambiar el esquema.
- Los contratos públicos se congelan mediante OpenAPI y pruebas.

