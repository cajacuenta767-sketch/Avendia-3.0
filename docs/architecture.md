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

- `auth`: identidad, contraseñas, tokens y sesiones.
- `users`: perfil, rol, membresía y preferencias.
- `documents`: historial y contenido generado propiedad del usuario.
- Próximos módulos: `planning`, `assessment`, `resources`, `tutoring`, `inclusion`, `credits` y `referrals`.

Cada módulo contiene sus propios modelos de entrada/salida y rutas. Las dependencias comunes viven en `core`, `db` y `api`.

## Reglas obligatorias

- Ninguna ruta protegida confía en roles enviados por el navegador.
- Todo documento se consulta por `id` y `owner_id`.
- Las claves externas se leen únicamente del entorno del backend.
- La API falla de forma explícita si una dependencia no está disponible.
- No existe cambio automático de PostgreSQL a otra base.
- Alembic es la única vía para cambiar el esquema.
- Los contratos públicos se congelan mediante OpenAPI y pruebas.

