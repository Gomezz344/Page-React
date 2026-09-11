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

Configura `DATABASE_URL` en `.env` con MySQL, por ejemplo:

```text
mysql+pymysql://root:password@127.0.0.1:3306/wildlife_db
```

En XAMPP, si `root` no tiene contraseña, usa `mysql+pymysql://root:@127.0.0.1:3306/wildlife_db`.
Para pruebas aisladas sin MySQL se puede usar `sqlite:///./wildlife.db`.

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