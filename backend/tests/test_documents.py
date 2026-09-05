import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


async def register_and_login(client: AsyncClient, email: str) -> dict[str, str]:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Docente Historial",
            "password": "secure-password",
            "dre": "DRE Lima",
            "ugel": "UGEL 03",
            "school_name": "I.E. Test",
            "director_name": "Director Test",
            "education_modality": "EBR",
            "education_level": "Primaria",
            "grade": "4° de Primaria",
            "section": "A",
            "curricular_area": "Comunicación",
            "school_year": 2026,
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "secure-password"},
    )
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


@pytest.mark.asyncio
async def test_document_crud_is_scoped_to_owner() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_headers = await register_and_login(client, "owner@example.com")
        other_headers = await register_and_login(client, "other@example.com")
        created = await client.post(
            "/api/v1/documents",
            headers=owner_headers,
            json={
                "title": "Plan anual de prueba",
                "document_type": "planificamos/plan-curricular-anual",
                "content": "Versión inicial",
                "metadata": {
                    "version": 1,
                    "source_route": "/dashboard/planificamos/plan-curricular-anual",
                },
            },
        )
        assert created.status_code == 201
        document_id = created.json()["id"]

        forbidden = await client.get(f"/api/v1/documents/{document_id}", headers=other_headers)
        assert forbidden.status_code == 404

        updated = await client.patch(
            f"/api/v1/documents/{document_id}",
            headers=owner_headers,
            json={
                "content": "Versión corregida",
                "status": "completed",
                "metadata": {"version": 2},
            },
        )
        assert updated.status_code == 200
        assert updated.json()["content"] == "Versión corregida"
        assert updated.json()["status"] == "completed"
        assert updated.json()["metadata_json"]["version"] == 2

        deleted = await client.delete(f"/api/v1/documents/{document_id}", headers=owner_headers)
        assert deleted.status_code == 204
        listed = await client.get("/api/v1/documents", headers=owner_headers)
        assert listed.json() == []


@pytest.mark.asyncio
async def test_document_relations_are_persistent_consent_bound_and_owner_scoped() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_headers = await register_and_login(client, "sequence-owner@example.com")
        other_headers = await register_and_login(client, "sequence-other@example.com")
        source = await client.post(
            "/api/v1/documents",
            headers=owner_headers,
            json={
                "title": "PCA 2026",
                "document_type": "planificamos/plan-curricular-anual",
                "content": "Plan anual",
                "metadata": {
                    "fields": {"modality": "EBR", "level": "Primaria", "topic": "Cuidado del agua"}
                },
            },
        )
        target = await client.post(
            "/api/v1/documents",
            headers=owner_headers,
            json={
                "title": "Unidad 1",
                "document_type": "planificamos/unidad-aprendizaje",
                "metadata": {},
            },
        )

        compatible = await client.get(
            "/api/v1/documents/compatible/unidad-aprendizaje", headers=owner_headers
        )
        source_match = next(item for item in compatible.json() if item["id"] == source.json()["id"])
        assert source_match["compatibility_status"] == "compatible"

        without_consent = await client.post(
            "/api/v1/documents/relations",
            headers=owner_headers,
            json={
                "parent_document_id": source.json()["id"],
                "child_document_id": target.json()["id"],
                "inherited_fields": ["topic"],
                "consent": False,
            },
        )
        assert without_consent.status_code == 422

        relation = await client.post(
            "/api/v1/documents/relations",
            headers=owner_headers,
            json={
                "parent_document_id": source.json()["id"],
                "child_document_id": target.json()["id"],
                "relation_type": "continuation",
                "inherited_fields": ["modality", "level", "topic"],
                "context": {"area": "Ciencia y Tecnología"},
                "compatibility_status": "compatible",
                "consent": True,
            },
        )
        assert relation.status_code == 201
        assert relation.json()["source_revision"] == source.json()["revision"]

        listed = await client.get(
            f"/api/v1/documents/{target.json()['id']}/relations", headers=owner_headers
        )
        assert listed.status_code == 200
        assert listed.json()[0]["inherited_fields_json"] == ["modality", "level", "topic"]

        private = await client.get(
            f"/api/v1/documents/{target.json()['id']}/relations", headers=other_headers
        )
        assert private.status_code == 404
