# Contrato de API

Generado desde el esquema OpenAPI de la aplicación. Para regenerarlo:

```powershell
cd backend
uv run python scripts/export_api_contract.py > ../docs/api-contract.md
```

Todas las rutas cuelgan de `/api/v1`. Salvo `health`, `ready`, `auth/*` y las imágenes de presentación, requieren `Authorization: Bearer <token>`. Las rutas bajo `/admin` exigen además el rol `admin`.

Errores: cuerpo `{ detail, error: { code, message, field, retryable, request_id } }`. Códigos: `authentication_required` (401), `permission_denied` (403), `not_found` (404), `revision_conflict` (409), `validation_failed` (422), `rate_limited` (429, con cabecera `Retry-After`), `service_unavailable` (5xx).

Total: 128 operaciones.

## admin

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/admin/ai-usage/accounts` | Usage Accounts |
| `PATCH` | `/api/v1/admin/ai-usage/accounts/{user_id}` | Adjust Credits |
| `GET` | `/api/v1/admin/ai-usage/events` | Usage Events |
| `GET` | `/api/v1/admin/ai-usage/summary` | Usage Summary |
| `GET` | `/api/v1/admin/audit` | Audit Log |
| `GET` | `/api/v1/admin/content` | Content Summary |
| `GET` | `/api/v1/admin/dashboard` | Dashboard |
| `GET` | `/api/v1/admin/settings` | Read Settings |
| `PATCH` | `/api/v1/admin/settings` | Update Settings |
| `GET` | `/api/v1/admin/system/status` | System Status |
| `GET` | `/api/v1/admin/users` | List Users |
| `GET` | `/api/v1/admin/users/{user_id}` | User Detail |
| `PATCH` | `/api/v1/admin/users/{user_id}` | Update User |

## ai

| Método | Ruta | Operación |
|---|---|---|
| `POST` | `/api/v1/ai/tools/agrupar-palabras/generate` | Create Word Grouping Activity |
| `POST` | `/api/v1/ai/tools/copilot` | Create Copilot Reply |
| `POST` | `/api/v1/ai/tools/field-assist` | Create Field Assist Reply |
| `POST` | `/api/v1/ai/tools/field-assist/feedback` | Record Field Assist Feedback |
| `GET` | `/api/v1/ai/tools/field-assist/preferences` | Read Assistance Preferences |
| `PATCH` | `/api/v1/ai/tools/field-assist/preferences` | Update Assistance Preferences |
| `POST` | `/api/v1/ai/tools/ordenar-bloques/generate` | Create Sequence Ordering Activity |
| `POST` | `/api/v1/ai/tools/presentaciones-didacticas/export/pptx` | Export Presentation Pptx |
| `POST` | `/api/v1/ai/tools/presentaciones-didacticas/generate` | Create Presentation |
| `GET` | `/api/v1/ai/tools/presentation-images/{asset_id}` | Read Presentation Image |
| `POST` | `/api/v1/ai/tools/workflow/generate` | Create Workflow Artifact |

## auth

| Método | Ruta | Operación |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login |
| `POST` | `/api/v1/auth/password-reset/complete` | Complete Password Reset |
| `POST` | `/api/v1/auth/password-reset/request` | Request Password Reset |
| `POST` | `/api/v1/auth/register` | Register |

## calendar

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/calendar/events` | List Events |
| `POST` | `/api/v1/calendar/events` | Create Event |
| `DELETE` | `/api/v1/calendar/events/{event_id}` | Delete Event |
| `PATCH` | `/api/v1/calendar/events/{event_id}` | Update Event |

## community

| Método | Ruta | Operación |
|---|---|---|
| `PATCH` | `/api/v1/admin/community/{post_id}` | Moderate |
| `GET` | `/api/v1/community/feed` | Feed |
| `GET` | `/api/v1/community/posts` | List Posts |
| `POST` | `/api/v1/community/posts` | Create Post |
| `DELETE` | `/api/v1/community/posts/{post_id}` | Delete Post |
| `PATCH` | `/api/v1/community/posts/{post_id}` | Update Post |
| `GET` | `/api/v1/community/posts/{post_id}/comments` | Comments |
| `POST` | `/api/v1/community/posts/{post_id}/comments` | Comment |
| `PUT` | `/api/v1/community/posts/{post_id}/reactions/{kind}` | React |
| `POST` | `/api/v1/community/posts/{post_id}/useful` | Mark Useful |

## dashboard

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/dashboard/overview` | Dashboard Overview |

## documents

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/documents` | List Documents |
| `POST` | `/api/v1/documents` | Create Document |
| `GET` | `/api/v1/documents/compatible/{target_type}` | Compatible Documents |
| `POST` | `/api/v1/documents/preview-pdf` | Preview Pdf |
| `POST` | `/api/v1/documents/relations` | Create Document Relation |
| `DELETE` | `/api/v1/documents/{document_id}` | Delete Document |
| `GET` | `/api/v1/documents/{document_id}` | Get Document |
| `PATCH` | `/api/v1/documents/{document_id}` | Update Document |
| `POST` | `/api/v1/documents/{document_id}/recover` | Recover |
| `GET` | `/api/v1/documents/{document_id}/relations` | Document Relations |
| `GET` | `/api/v1/documents/{document_id}/versions` | Versions |
| `POST` | `/api/v1/documents/{document_id}/versions/{version_id}/restore` | Restore Version |

## evaluation-instruments

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/evaluation-instruments` | List Instruments |
| `POST` | `/api/v1/evaluation-instruments` | Create Instrument |
| `POST` | `/api/v1/evaluation-instruments/sources/extract` | Preview Source Extraction |
| `DELETE` | `/api/v1/evaluation-instruments/{instrument_id}` | Archive Instrument Endpoint |
| `GET` | `/api/v1/evaluation-instruments/{instrument_id}` | Get Instrument |
| `PATCH` | `/api/v1/evaluation-instruments/{instrument_id}` | Patch Instrument |
| `PUT` | `/api/v1/evaluation-instruments/{instrument_id}` | Save Instrument Draft |
| `DELETE` | `/api/v1/evaluation-instruments/{instrument_id}/draft` | Archive Instrument Endpoint |
| `GET` | `/api/v1/evaluation-instruments/{instrument_id}/draft` | Get Instrument Draft |
| `PUT` | `/api/v1/evaluation-instruments/{instrument_id}/draft` | Save Instrument Draft |
| `GET` | `/api/v1/evaluation-instruments/{instrument_id}/exports/checklist.xlsx` | Export Checklist |
| `POST` | `/api/v1/evaluation-instruments/{instrument_id}/restore` | Restore Instrument Endpoint |
| `GET` | `/api/v1/evaluation-instruments/{instrument_id}/sources` | List Sources |
| `POST` | `/api/v1/evaluation-instruments/{instrument_id}/sources` | Upload Source |
| `DELETE` | `/api/v1/evaluation-instruments/{instrument_id}/sources/{source_id}` | Delete Source |
| `GET` | `/api/v1/evaluation-instruments/{instrument_id}/sources/{source_id}/download` | Download Source |

## history

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/history` | History |
| `GET` | `/api/v1/history/feed` | Feed |

## referrals

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/admin/referrals` | Review List |
| `PUT` | `/api/v1/admin/referrals/settings` | Configure |
| `POST` | `/api/v1/admin/referrals/{referral_id}/review` | Decide |
| `PUT` | `/api/v1/referrals/code` | Issue |
| `GET` | `/api/v1/referrals/me` | Mine |

## rosters

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/rosters` | List Rosters |
| `POST` | `/api/v1/rosters` | Create Roster |
| `GET` | `/api/v1/rosters/template` | Download Import Template |
| `DELETE` | `/api/v1/rosters/{roster_id}` | Deactivate Roster |
| `GET` | `/api/v1/rosters/{roster_id}` | Get Roster |
| `PATCH` | `/api/v1/rosters/{roster_id}` | Update Roster |
| `POST` | `/api/v1/rosters/{roster_id}/imports/confirm` | Confirm Import |
| `POST` | `/api/v1/rosters/{roster_id}/imports/preview` | Preview Import |
| `GET` | `/api/v1/rosters/{roster_id}/students` | List Students |
| `POST` | `/api/v1/rosters/{roster_id}/students` | Create Student |
| `POST` | `/api/v1/rosters/{roster_id}/students/reorder` | Reorder Students |
| `DELETE` | `/api/v1/rosters/{roster_id}/students/{student_id}` | Deactivate Student |
| `PATCH` | `/api/v1/rosters/{roster_id}/students/{student_id}` | Update Student |

## system

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/health` | Health |
| `GET` | `/api/v1/ready` | Ready |

## templates

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/templates` | List Templates |
| `POST` | `/api/v1/templates` | Upload Template |
| `DELETE` | `/api/v1/templates/{template_id}` | Delete Template |
| `POST` | `/api/v1/templates/{template_id}/analyze` | Analyze |
| `PATCH` | `/api/v1/templates/{template_id}/default` | Set Default Template |
| `GET` | `/api/v1/templates/{template_id}/details` | Details |
| `PUT` | `/api/v1/templates/{template_id}/details` | Edit |
| `GET` | `/api/v1/templates/{template_id}/download` | Download Template |
| `POST` | `/api/v1/templates/{template_id}/recover` | Recover |
| `POST` | `/api/v1/templates/{template_id}/render` | Render With Template |
| `POST` | `/api/v1/templates/{template_id}/replace` | Replace |
| `GET` | `/api/v1/templates/{template_id}/versions` | Versions |
| `GET` | `/api/v1/templates/{template_id}/versions/{version_id}/download` | Download |
| `POST` | `/api/v1/templates/{template_id}/versions/{version_id}/restore` | Restore |

## users

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/users/me` | Read Me |
| `PATCH` | `/api/v1/users/me` | Update Me |
| `GET` | `/api/v1/users/me/experience-preferences` | Read Experience Preferences |
| `PATCH` | `/api/v1/users/me/experience-preferences` | Update Experience Preferences |
| `GET` | `/api/v1/users/me/workspace-preferences` | Read Workspace Preferences |
| `PATCH` | `/api/v1/users/me/workspace-preferences` | Update Workspace Preferences |

## utilities

| Método | Ruta | Operación |
|---|---|---|
| `PATCH` | `/api/v1/admin/ideas/{idea_id}` | Review Idea |
| `POST` | `/api/v1/admin/tutorials` | Create Tutorial |
| `PUT` | `/api/v1/admin/tutorials/{tutorial_id}` | Edit Tutorial |
| `GET` | `/api/v1/ideas` | List Ideas |
| `POST` | `/api/v1/ideas` | Create Idea |
| `PATCH` | `/api/v1/ideas/{idea_id}` | Edit Idea |
| `GET` | `/api/v1/ideas/{idea_id}/comments` | Comments |
| `POST` | `/api/v1/ideas/{idea_id}/comments` | Add Comment |
| `PUT` | `/api/v1/ideas/{idea_id}/vote` | Vote |
| `GET` | `/api/v1/notifications` | Notifications |
| `PUT` | `/api/v1/notifications/read` | Read Notifications |
| `GET` | `/api/v1/tutorials` | Tutorials |
| `PUT` | `/api/v1/tutorials/{tutorial_id}/progress` | Progress |

## utilities-admin

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/v1/admin/utilities/overview` | Overview |
| `GET` | `/api/v1/utilities/summary` | Personal Summary |

