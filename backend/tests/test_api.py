from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import Rol, Usuario


def test_health_and_registration_flow():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)

    assert client.get("/health").json() == {"status": "ok"}
    response = client.post("/api/auth/register", json={
        "nombre": "Ana",
        "apellido": "Rios",
        "tipo_documento": "CC",
        "numero_documento": "12345",
        "direccion": "Selva 1",
        "telefono": "3000000000",
        "correo": "ana@example.com",
        "password": "secret123",
    })
    assert response.status_code == 201
    assert "password" not in response.json()["usuario"]

    duplicate = client.post("/api/auth/register", json={
        "nombre": "Ana",
        "apellido": "Rios",
        "tipo_documento": "CC",
        "numero_documento": "12345",
        "correo": "ana@example.com",
        "password": "secret123",
    })
    assert duplicate.status_code == 409
    assert "message" in duplicate.json()

    login = client.post("/api/auth/login", json={"correo": "ana@example.com", "password": "secret123"})
    assert login.status_code == 200
    assert login.json()["token"]
    assert "password" not in login.json()["usuario"]

    client_users = client.get("/api/usuarios", headers={"Authorization": f"Bearer {login.json()['token']}"})
    assert client_users.status_code == 403

    db = SessionLocal()
    db.add(Rol(id=1, nombre="Administrador", descripcion="Acceso total"))
    db.query(Usuario).filter(Usuario.correo == "ana@example.com").update({"rol_id": 1})
    db.commit()
    db.close()
    admin_login = client.post("/api/auth/login", json={"correo": "ana@example.com", "password": "secret123"})
    users = client.get("/api/usuarios", headers={"Authorization": f"Bearer {admin_login.json()['token']}"})
    assert users.status_code == 200
    assert len(users.json()["usuarios"]) == 1
    assert "password" not in users.json()["usuarios"][0]

    update = client.put(
        "/api/usuarios/1",
        headers={"Authorization": f"Bearer {admin_login.json()['token']}"},
        json={
            "nombre": "Ana Actualizada",
            "apellido": "Rios",
            "tipo_documento": "CC",
            "numero_documento": "12345",
            "correo": "ana@example.com",
            "password": "",
            "rol_id": 1,
            "estado": 1,
        },
    )
    assert update.status_code == 200
    assert update.json()["usuario"]["nombre"] == "Ana Actualizada"