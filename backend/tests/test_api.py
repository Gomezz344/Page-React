import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./wildlife_test.db")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_123")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_test_123")
os.environ.setdefault("STRIPE_MOCK_MODE", "true")

from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import Producto, Rol, Servicio, Usuario


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


def test_checkout_session_uses_cart_items():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)

    register = client.post("/api/auth/register", json={
        "nombre": "Pedro",
        "apellido": "Lopez",
        "tipo_documento": "CC",
        "numero_documento": "22222",
        "direccion": "Verde 2",
        "telefono": "3000000001",
        "correo": "pedro@example.com",
        "password": "secret123",
    })
    assert register.status_code == 201

    db = SessionLocal()
    db.add(Producto(nombre="Binocular", descripcion="Binocular de campo", precio=250000, imagen="", stock=4, estado=1))
    db.add(Servicio(nombre="Safari nocturno", descripcion="Tour nocturno", precio=400000, imagen="", stock=2, duracion="3 horas", estado=1))
    db.commit()
    db.close()

    login = client.post("/api/auth/login", json={"correo": "pedro@example.com", "password": "secret123"})
    token = login.json()["token"]

    response = client.post(
        "/api/pagos/crear-sesion",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "items": [
                {"tipo": "producto", "item_id": 1, "cantidad": 1},
                {"tipo": "servicio", "item_id": 1, "cantidad": 1},
            ]
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert data["pedido_ids"]
    assert data["mock_mode"] is True


def test_reservation_creation_and_listing():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)

    register = client.post("/api/auth/register", json={
        "nombre": "Laura",
        "apellido": "Pérez",
        "tipo_documento": "CC",
        "numero_documento": "33333",
        "direccion": "Bosque 3",
        "telefono": "3000000002",
        "correo": "laura@example.com",
        "password": "secret123",
    })
    assert register.status_code == 201

    db = SessionLocal()
    db.add(Servicio(nombre="Reserva de selva", descripcion="Tour de selva", precio=350000, imagen="", stock=10, duracion="2 días", estado=1))
    db.commit()
    db.close()

    login = client.post("/api/auth/login", json={"correo": "laura@example.com", "password": "secret123"})
    token = login.json()["token"]

    create = client.post(
        "/api/reservas",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "servicio_id": 1,
            "cantidad_personas": 2,
            "fecha_inicio": "2026-10-10",
            "fecha_fin": "2026-10-12",
            "notas": "Llegaremos temprano",
        },
    )
    assert create.status_code == 201
    payload = create.json()
    assert payload["estado"] == "pendiente"
    assert payload["servicio_id"] == 1

    listing = client.get("/api/reservas/me", headers={"Authorization": f"Bearer {token}"})
    assert listing.status_code == 200
    assert len(listing.json()["reservas"]) == 1


def test_reservation_accepts_empty_end_date():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)

    register = client.post("/api/auth/register", json={
        "nombre": "Marta",
        "apellido": "López",
        "tipo_documento": "CC",
        "numero_documento": "44444",
        "direccion": "Bosque 4",
        "telefono": "3000000003",
        "correo": "marta@example.com",
        "password": "secret123",
    })
    assert register.status_code == 201

    db = SessionLocal()
    db.add(Servicio(nombre="Tour montaña", descripcion="Tour de montaña", precio=300000, imagen="", stock=6, duracion="1 día", estado=1))
    db.commit()
    db.close()

    login = client.post("/api/auth/login", json={"correo": "marta@example.com", "password": "secret123"})
    token = login.json()["token"]

    create = client.post(
        "/api/reservas",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "servicio_id": 1,
            "cantidad_personas": 1,
            "fecha_inicio": "2026-11-10",
            "fecha_fin": "",
            "notas": "Sin retorno",
        },
    )

    assert create.status_code == 201
    assert create.json()["fecha_fin"] is None