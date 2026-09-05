import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_register_login_and_read_profile() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        register = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "maria@example.edu",
                "full_name": "María Gómez",
                "password": "a-secure-password",
                "dre": "DRE Lima Metropolitana",
                "ugel": "UGEL 03",
                "school_name": "I.E. José María Arguedas",
                "director_name": "Elena Torres",
                "education_modality": "EBR",
                "education_level": "Secundaria",
                "grade": "3° de Secundaria",
                "section": "A",
                "curricular_area": "Comunicación",
                "school_year": 2026,
            },
        )
        assert register.status_code == 201
        assert register.json()["role"] == "teacher"

        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "maria@example.edu", "password": "a-secure-password"},
        )
        assert login.status_code == 200
        token = login.json()["access_token"]

        profile = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert profile.status_code == 200
        assert profile.json()["email"] == "maria@example.edu"
        assert profile.json()["education_modality"] == "EBR"
        assert profile.json()["school_name"] == "I.E. José María Arguedas"


@pytest.mark.asyncio
async def test_password_reset_is_private_one_time_and_changes_credentials() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        registration = {
            "email": "recovery@example.edu",
            "full_name": "Rosa Palomino",
            "password": "first-secure-password",
            "dre": "DRE Cusco",
            "ugel": "UGEL Cusco",
            "school_name": "I.E. Túpac Amaru",
            "director_name": "Teresa Flores",
            "education_modality": "EBR",
            "education_level": "Primaria",
            "grade": "4° de Primaria",
            "section": "B",
            "curricular_area": "Comunicación",
            "school_year": 2026,
        }
        assert (await client.post("/api/v1/auth/register", json=registration)).status_code == 201

        unknown = await client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "unknown@example.edu"},
        )
        requested = await client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": registration["email"]},
        )
        assert unknown.status_code == requested.status_code == 200
        assert unknown.json()["message"] == requested.json()["message"]
        assert unknown.json()["development_reset_code"] is None
        code = requested.json()["development_reset_code"]
        assert code and len(code) == 6

        invalid = await client.post(
            "/api/v1/auth/password-reset/complete",
            json={
                "email": registration["email"],
                "code": "000000" if code != "000000" else "999999",
                "new_password": "second-secure-password",
            },
        )
        assert invalid.status_code == 400

        completed = await client.post(
            "/api/v1/auth/password-reset/complete",
            json={
                "email": registration["email"],
                "code": code,
                "new_password": "second-secure-password",
            },
        )
        assert completed.status_code == 200

        reused = await client.post(
            "/api/v1/auth/password-reset/complete",
            json={
                "email": registration["email"],
                "code": code,
                "new_password": "third-secure-password",
            },
        )
        assert reused.status_code == 400

        old_login = await client.post(
            "/api/v1/auth/login",
            json={"email": registration["email"], "password": registration["password"]},
        )
        new_login = await client.post(
            "/api/v1/auth/login",
            json={"email": registration["email"], "password": "second-secure-password"},
        )
        assert old_login.status_code == 401
        assert new_login.status_code == 200
