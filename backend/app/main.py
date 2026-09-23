from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError

from .config import settings
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
    if engine.dialect.name == "postgresql":
        with engine.begin() as connection:
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
