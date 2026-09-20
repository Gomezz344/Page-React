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
uvicorn app.main:app --reload --host 0.0.0.0 --port 3000
```

La documentacion queda disponible en `http://localhost:3000/docs`. El backend crea las tablas si no existen; para una base existente, importa primero el dump SQL y verifica que sus columnas coincidan con los modelos.

## Pruebas

```powershell
pytest -q
```

Todas las respuestas de error incluyen `message`, y las rutas protegidas esperan `Authorization: Bearer <token>`.