# Contratos de Evaluamos

Las pantallas de este módulo consumen `/api/v1/evaluation-instruments` mediante
`evaluationApi.ts`. Todos los identificadores enviados por el selector son UUID de la
nómina y nunca nombres escritos a mano.

- `POST /evaluation-instruments`: crea el instrumento del docente.
- `GET|PUT /evaluation-instruments/{id}/draft`: recupera o reemplaza en una sola
  transacción participantes, criterios, registros y observaciones. `expected_revision`
  permite detectar una edición desactualizada.
- `POST /evaluation-instruments/{id}/sources`: recibe `multipart/form-data` con el
  campo `file`, extrae PDF/DOCX/TXT en servidor y devuelve el texto editable.
- `GET|DELETE /evaluation-instruments/{id}/sources[/source_id]`: lista o elimina
  archivos fuente propiedad del docente.

Los documentos binarios de Word `.doc` se rechazan con una instrucción para convertirlos
a `.docx`; no se ejecutan macros ni contenido incrustado. El límite cliente y servidor es
10 MB y el servidor vuelve a comprobar tipo real, contenido y propiedad.
