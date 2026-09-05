import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_calendar_events_are_created_and_listed_for_owner() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "teacher@example.com",
                "full_name": "Teacher",
                "password": "secure-password",
                "dre": "DRE Lima",
                "ugel": "UGEL 03",
                "school_name": "I.E. Test",
                "director_name": "Director Test",
                "education_modality": "EBR",
                "education_level": "Primaria",
                "grade": "4° de Primaria",
                "section": "A",
                "curricular_area": "Matemática",
                "school_year": 2026,
            },
        )
        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "teacher@example.com", "password": "secure-password"},
        )
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        created = await client.post(
            "/api/v1/calendar/events",
            headers=headers,
            json={
                "title": "Reunión docente",
                "event_date": "2026-09-10",
                "event_time": "15:00:00",
                "event_type": "concurso",
                "notes": "Sala 2",
            },
        )
        assert created.status_code == 201
        listed = await client.get(
            "/api/v1/calendar/events?start=2026-09-01&end=2026-09-30",
            headers=headers,
        )
        assert listed.status_code == 200
        assert [event["title"] for event in listed.json()] == ["Reunión docente"]
        assert listed.json()[0]["event_type"] == "concurso"

        event_id = created.json()["id"]
        updated = await client.patch(
            f"/api/v1/calendar/events/{event_id}",
            headers=headers,
            json={"completed": True, "event_type": "gestion"},
        )
        assert updated.status_code == 200
        assert updated.json()["completed"] is True
        assert updated.json()["event_type"] == "gestion"

        deleted = await client.delete(f"/api/v1/calendar/events/{event_id}", headers=headers)
        assert deleted.status_code == 204
        remaining = await client.get("/api/v1/calendar/events", headers=headers)
        assert remaining.json() == []
