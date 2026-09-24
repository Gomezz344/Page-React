from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import BigInteger, String, inspect, select, text
from sqlalchemy.exc import IntegrityError

from .config import settings
from .core.security import hash_password
from .database import Base, SessionLocal, engine
from . import models
from .routers import admin, auth, carrito, catalog, chatbot, pagos, productos, reservas, servicios, usuarios

if settings.is_production:
    if settings.secret_key in {"", "change-me-in-production"} or len(settings.secret_key) < 32:
        raise RuntimeError("SECRET_KEY debe ser una clave aleatoria de al menos 32 caracteres en producción")
    if not settings.stripe_secret_key or settings.stripe_secret_key.startswith("sk_test_"):
        raise RuntimeError("Stripe debe usar una clave configurada para producción")
    if settings.expose_reset_token:
        raise RuntimeError("EXPOSE_RESET_TOKEN debe estar desactivado en producción")
    if any("localhost" in origin or "127.0.0.1" in origin for origin in settings.cors_origin_list):
        raise RuntimeError("CORS_ORIGINS no puede contener localhost en producción")

app = FastAPI(
    title="Wildlife API",
    version="1.0.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.trusted_host_list or ["*"])
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if settings.is_production:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    return response

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(catalog.roles_router)
app.include_router(catalog.permisos_router)
app.include_router(productos.router)
app.include_router(servicios.router)
app.include_router(admin.router)
app.include_router(carrito.router)
app.include_router(reservas.router)
app.include_router(pagos.router)
app.include_router(chatbot.router)


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        for role_id, name, description in (
            (1, "Administrador", "Acceso total al sistema"),
            (2, "Empleado", "Gestion operativa"),
            (3, "Cliente", "Acceso publico y perfil"),
        ):
            if db.get(models.Rol, role_id) is None:
                db.add(models.Rol(id=role_id, nombre=name, descripcion=description))
        db.commit()
        _bootstrap_admin(db)
    if engine.dialect.name == "postgresql":
        with engine.begin() as connection:
            usuario_columns = {column["name"]: column for column in inspect(engine).get_columns("usuarios")}
            if usuario_columns:
                # PostgreSQL INTEGER is only 32-bit; BIGINT is required for all 10-digit values.
                if not isinstance(usuario_columns["nombre"]["type"], String) or usuario_columns["nombre"]["type"].length != 20:
                    connection.execute(text("ALTER TABLE usuarios ALTER COLUMN nombre TYPE VARCHAR(20)"))
                if not isinstance(usuario_columns["apellido"]["type"], String) or usuario_columns["apellido"]["type"].length != 20:
                    connection.execute(text("ALTER TABLE usuarios ALTER COLUMN apellido TYPE VARCHAR(20)"))
                if not isinstance(usuario_columns["correo"]["type"], String) or usuario_columns["correo"]["type"].length != 100:
                    connection.execute(text("ALTER TABLE usuarios ALTER COLUMN correo TYPE VARCHAR(100)"))
                if not isinstance(usuario_columns["numero_documento"]["type"], BigInteger):
                    connection.execute(text("ALTER TABLE usuarios ALTER COLUMN numero_documento TYPE BIGINT USING numero_documento::bigint"))
                if not isinstance(usuario_columns["telefono"]["type"], BigInteger):
                    connection.execute(text("ALTER TABLE usuarios ALTER COLUMN telefono TYPE BIGINT USING NULLIF(telefono, '')::bigint"))
                connection.execute(text("""
                    DO $$ BEGIN
                        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_usuarios_documento_max_10_digitos') THEN
                            ALTER TABLE usuarios ADD CONSTRAINT ck_usuarios_documento_max_10_digitos CHECK (numero_documento BETWEEN 0 AND 9999999999);
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_usuarios_telefono_max_10_digitos') THEN
                            ALTER TABLE usuarios ADD CONSTRAINT ck_usuarios_telefono_max_10_digitos CHECK (telefono IS NULL OR telefono BETWEEN 0 AND 9999999999);
                        END IF;
                    END $$;
                """))
            reserva_columns = {column["name"] for column in inspect(engine).get_columns("reservas")}
            if "fecha_inicio" not in reserva_columns:
                connection.execute(text("ALTER TABLE reservas ADD COLUMN fecha_inicio DATE"))
                if "fecha_reserva" in reserva_columns:
                    connection.execute(text("UPDATE reservas SET fecha_inicio = fecha_reserva::date WHERE fecha_inicio IS NULL"))
            if "fecha_fin" not in reserva_columns:
                connection.execute(text("ALTER TABLE reservas ADD COLUMN fecha_fin DATE"))
            if "stripe_session_id" not in reserva_columns:
                connection.execute(text("ALTER TABLE reservas ADD COLUMN stripe_session_id VARCHAR(255)"))

            pago_columns = {column["name"] for column in inspect(engine).get_columns("pagos")}
            if "usuario_id" not in pago_columns:
                connection.execute(text("ALTER TABLE pagos ADD COLUMN usuario_id INTEGER"))
                if "reserva_id" in pago_columns:
                    connection.execute(text("UPDATE pagos AS pagos SET usuario_id = reservas.usuario_id FROM reservas WHERE pagos.reserva_id = reservas.id AND pagos.usuario_id IS NULL"))
    columns = {column["name"] for column in inspect(engine).get_columns("servicios")}
    if "stock" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE servicios ADD COLUMN stock INTEGER NOT NULL DEFAULT 10"))


def _bootstrap_admin(db) -> None:
    """Create the first admin from Render env vars, when explicitly configured."""
    if not all((settings.admin_bootstrap_email, settings.admin_bootstrap_password, settings.admin_bootstrap_document)):
        return
    if len(settings.admin_bootstrap_password) < 6:
        raise RuntimeError("ADMIN_BOOTSTRAP_PASSWORD debe tener al menos 6 caracteres")

    email = settings.admin_bootstrap_email.strip().lower()
    user = db.scalar(select(models.Usuario).where(models.Usuario.correo == email))
    document_owner = db.scalar(
        select(models.Usuario).where(models.Usuario.numero_documento == settings.admin_bootstrap_document)
    )
    if document_owner is not None and (user is None or document_owner.id != user.id):
        raise RuntimeError("ADMIN_BOOTSTRAP_DOCUMENT ya pertenece a otro usuario")

    if user is None:
        user = models.Usuario(
            nombre=settings.admin_bootstrap_name,
            apellido=settings.admin_bootstrap_lastname,
            tipo_documento=settings.admin_bootstrap_document_type,
            numero_documento=settings.admin_bootstrap_document,
            correo=email,
            password=hash_password(settings.admin_bootstrap_password),
            rol_id=1,
            estado=1,
        )
        db.add(user)
    else:
        user.rol_id = 1
        user.estado = 1
        if settings.admin_bootstrap_force_password:
            user.password = hash_password(settings.admin_bootstrap_password)
    db.commit()

@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc):
    detail = exc.detail if isinstance(exc.detail, str) else "Error en la solicitud"
    return JSONResponse(status_code=exc.status_code, content={"message": detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"message": "Datos inválidos", "errors": exc.errors()})


@app.exception_handler(IntegrityError)
async def integrity_exception_handler(_: Request, exc: IntegrityError):
    return JSONResponse(status_code=409, content={"message": "La operación viola una restricción de datos"})


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"message": "Error interno del servidor"})


@app.get("/health")
def health():
    return {"status": "ok"}
