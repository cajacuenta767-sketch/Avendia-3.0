# Contrato inicial de API

Base: `/api/v1`

| Método | Ruta | Autenticación | Propósito |
|---|---|---:|---|
| `GET` | `/health` | No | Estado del proceso |
| `GET` | `/ready` | No | Disponibilidad de PostgreSQL |
| `POST` | `/auth/register` | No | Crear cuenta docente |
| `POST` | `/auth/login` | No | Obtener token de acceso |
| `GET` | `/users/me` | Sí | Perfil del usuario actual |
| `GET` | `/documents` | Sí | Historial propio |
| `POST` | `/documents` | Sí | Crear borrador propio |

Los módulos antiguos se incorporarán únicamente después de documentar para cada endpoint: entrada, salida, autorización, consumo de créditos, efectos en datos y errores posibles.

