from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError

from .config import settings
from .database import Base, engine
from . import models
from .routers import admin, auth, catalog, productos, servicios, usuarios

app = FastAPI(title="Wildlife API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(catalog.roles_router)
app.include_router(catalog.permisos_router)
app.include_router(productos.router)
app.include_router(servicios.router)
app.include_router(admin.router)


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    columns = {column["name"] for column in inspect(engine).get_columns("servicios")}
    if "stock" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE servicios ADD COLUMN stock INTEGER NOT NULL DEFAULT 10"))


create_tables()


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
