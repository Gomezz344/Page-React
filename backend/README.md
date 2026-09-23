# Wildlife Backend

Backend FastAPI para el frontend React de Wildlife.

## Instalacion

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Configura `DATABASE_URL` en `.env` con PostgreSQL, por ejemplo:

```text
postgresql+psycopg://postgres:TU_PASSWORD@localhost:5432/wildlife_db
```

Si tu PostgreSQL usa otro usuario/contraseña, ajusta la cadena de conexión. Para pruebas aisladas se puede usar `sqlite:///./wildlife.db`.

## Ejecutar

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

En Windows, si Stripe devuelve errores de conexión por un proxy local, usa el script que limpia esas variables antes de iniciar:

```powershell
.\start-dev.ps1 -Port 8001
```

La documentación queda disponible en `http://localhost:8000/docs` durante desarrollo. En producción se desactiva automáticamente. El backend usa PostgreSQL y crea las tablas nuevas al arrancar; para un despliegue serio, ejecuta la migración/verificación de esquema antes de aceptar tráfico.

Variables relevantes: `APP_ENV`, `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `TRUSTED_HOSTS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`, `EXPOSE_RESET_TOKEN` y las variables `SMTP_*` para recuperación de contraseña. No subas nunca `.env` al repositorio.

## Pruebas

```powershell
pytest -q
```

Todas las respuestas de error incluyen `message`, y las rutas protegidas esperan `Authorization: Bearer <token>`.
