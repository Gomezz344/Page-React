# Plan de trabajo — Backend FastAPI para Wildlife

## 0. Contexto del proyecto

El frontend (`Page-React`, React + Vite + Tailwind) ya está construido y **ya hace llamadas HTTP concretas** a un backend que todavía no existe. Esto es una ventaja: el backend debe **adaptarse al contrato que el frontend ya espera**, no al revés. De revisar el código se extrajo lo siguiente:

- Base URL usada en el frontend: `http://localhost:3000/api/...` (hardcodeada en cada `fetch`).
- Autenticación: token guardado en `localStorage`/`sessionStorage`, enviado como `Authorization: Bearer <token>`.
- Los cuerpos de las peticiones usan **los mismos nombres de columnas** que `wildlife_db.sql` (`nombre`, `apellido`, `tipo_documento`, `numero_documento`, `direccion`, `telefono`, `correo`, `password`, `rol_id`, `estado`, etc.).
- El manejo de errores en el frontend siempre lee `data.message`, así que **toda respuesta de error del backend debe tener la forma `{ "message": "..." }`**.

No se debe tocar estilos, componentes visuales ni lógica de UI — solo se ajustará, si es estrictamente necesario, la forma en que el frontend llama a la API (ver sección 9).

## 1. Arquitectura general

Siguiendo el diagrama adjunto y lo solicitado:

```
React + Vite  →  HTTP/JSON  →  FastAPI
                                  ├─ Validación Pydantic (schemas)
                                  ├─ Lógica de negocio (services)
                                  ├─ Seguridad (JWT + hash de contraseña)
                                  └─ SQLAlchemy → MySQL (wildlife_db)
                                  ←  Respuesta JSON  ←
```

Flujo por request: **Formulario React → Validación Frontend → Petición HTTP → Endpoint FastAPI → Validación Pydantic → Lógica de negocio → Hash de contraseña (si aplica) → Base de datos MySQL → Respuesta FastAPI → React**.

## 2. Estructura de carpetas propuesta

```
backend/
├── app/
│   ├── main.py                # instancia FastAPI, CORS, routers
│   ├── config.py              # variables de entorno (Settings con pydantic-settings)
│   ├── database.py            # engine, SessionLocal, get_db()
│   ├── models/                # modelos SQLAlchemy (1 archivo por tabla)
│   │   ├── usuario.py
│   │   ├── rol.py
│   │   ├── permiso.py
│   │   ├── producto.py
│   │   └── servicio.py
│   ├── schemas/                # schemas Pydantic (request/response)
│   │   ├── auth.py
│   │   ├── usuario.py
│   │   ├── rol.py
│   │   ├── permiso.py
│   │   ├── producto.py
│   │   └── servicio.py
│   ├── core/
│   │   ├── security.py        # hash de password (passlib/bcrypt), JWT (python-jose)
│   │   └── deps.py            # get_current_user, require_role, require_permiso
│   ├── routers/
│   │   ├── auth.py            # /api/auth/login, /api/auth/register
│   │   ├── usuarios.py        # /api/usuarios, /api/usuarios/me
│   │   ├── roles.py           # /api/roles
│   │   ├── permisos.py        # /api/permisos
│   │   ├── productos.py       # /api/productos
│   │   └── servicios.py       # /api/servicios
│   └── services/              # lógica de negocio separada de los routers
│       ├── auth_service.py
│       ├── usuario_service.py
│       ├── producto_service.py
│       └── servicio_service.py
├── requirements.txt
├── .env.example
└── README.md
```

## 3. Fases de trabajo

### Fase 1 — Preparación del entorno
- [ ] Crear entorno virtual (`python -m venv venv`) y estructura de carpetas de `backend/`.
- [ ] Instalar dependencias base y congelar `requirements.txt` (ver sección 6).
- [ ] Levantar MySQL localmente e importar `wildlife_db (1).sql` (ya contiene `usuarios`, `roles`, `permisos`, `rol_permisos`, `productos`, `servicios`).
- [ ] Configurar `.env` con credenciales de BD y `SECRET_KEY` para JWT (ver sección 7).

### Fase 2 — Conexión a base de datos y modelos
- [ ] `database.py`: engine con `mysqlclient`/`PyMySQL` + `SessionLocal` + `Base`.
- [ ] Modelar en SQLAlchemy las 5 tablas + la tabla intermedia `rol_permisos`, respetando **exactamente** los nombres y tipos ya definidos en el `.sql` (no renombrar columnas).
- [ ] Definir relaciones: `Usuario.rol` (FK `rol_id`), `Rol.permisos` (many-to-many vía `rol_permisos`).

### Fase 3 — Schemas Pydantic
- [ ] Schemas separados por caso de uso: `UsuarioCreate` (registro), `UsuarioUpdate`, `UsuarioOut` (sin `password`), `LoginRequest`, `TokenResponse`.
- [ ] Mismo criterio para `Producto`, `Servicio`, `Rol`, `Permiso`.
- [ ] `UsuarioOut` nunca debe incluir el hash de la contraseña.

### Fase 4 — Seguridad: hashing y JWT
- [ ] `security.py`: `hash_password()` y `verify_password()` con `passlib[bcrypt]` (los hashes existentes en el dump ya son `$2b$...`, compatibles con bcrypt).
- [ ] Generación de JWT con `python-jose`: payload mínimo `{ sub: usuario_id, rol_id, exp }`.
- [ ] `deps.py`: dependencia `get_current_user` que decodifica el token del header `Authorization`, y dependencias `require_role(rol_id)` / `require_permiso(nombre_permiso)` para proteger rutas según `roles`/`permisos`.

### Fase 5 — Endpoints de autenticación (`/api/auth`)
- [ ] `POST /api/auth/login` — recibe `{ correo, password }`, responde `{ token, usuario }` (así lo consume `Login.jsx`).
- [ ] `POST /api/auth/register` — recibe `{ nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password }` (igual que `Register.jsx`); asigna `rol_id = 3` (cliente) por defecto.

### Fase 6 — CRUD de Usuarios (`/api/usuarios`)
- [ ] `GET /api/usuarios` → responde `{ usuarios: [...] }` (formato exacto que espera `Usuarios.jsx`), protegido para rol admin.
- [ ] `PUT /api/usuarios/{id}` → actualiza datos + `rol_id` + `estado`.
- [ ] `GET /api/usuarios/me` y `PUT /api/usuarios/me` → perfil del usuario autenticado (usa el `token`, no requiere id en la URL), tal como en `Profile.jsx`.
- [ ] (Opcional, si se desea completar el CRUD) `DELETE /api/usuarios/{id}`.

### Fase 7 — CRUD de Roles y Permisos (`/api/roles`, `/api/permisos`)
- [ ] Endpoints de lectura para poblar selects de rol en el frontend (`GET /api/roles`, `GET /api/permisos`).
- [ ] CRUD completo protegido solo para admin, por si se agrega gestión de permisos más adelante.
- [ ] Endpoint para asignar/quitar permisos a un rol (tabla `rol_permisos`).

### Fase 8 — CRUD de Productos (`/api/productos`)
- [ ] `GET /api/productos` → responde **arreglo plano** (no envuelto en objeto), tal como lo lee `Productos.jsx`.
- [ ] `POST /api/productos` y `PUT /api/productos/{id}` con body `{ nombre, descripcion, precio, imagen, stock, estado }`.
- [ ] `DELETE /api/productos/{id}`.

### Fase 9 — CRUD de Servicios (`/api/servicios`)
- [ ] Igual patrón que Productos: `GET` (arreglo plano), `POST`, `PUT /{id}`, `DELETE /{id}`, body `{ nombre, descripcion, precio, duracion, imagen, estado }`.

### Fase 10 — Autorización por roles/permisos
- [ ] Rutas de escritura en usuarios/productos/servicios protegidas con `require_role(1)` (admin) o validando contra tabla `permisos` según el registro que ya existe en `rol_permisos` (admin=1, empleado=2, cliente=3).
- [ ] `ProtectedRoute` en el frontend ya usa `usuario.rol_id === 1` para `/admin`, así que el `usuario` devuelto por login/me debe incluir `rol_id`.

### Fase 11 — CORS y configuración de puertos
- [ ] Configurar `CORSMiddleware` permitiendo el origen de Vite (`http://localhost:5173`).
- [ ] Decidir el puerto del backend: el frontend está hardcodeado a `http://localhost:3000`. Opciones:
  - (A) Levantar FastAPI con `uvicorn ... --port 3000` para no tocar el frontend, o
  - (B) Cambiar el frontend a un cliente API centralizado con `VITE_API_URL` (recomendado a mediano plazo, ver sección 9).

### Fase 12 — Manejo de errores uniforme
- [ ] Exception handler global que devuelva siempre `{ "message": "<texto>" }` en 4xx/5xx (coincide con lo que el frontend ya lee de `data.message`).
- [ ] Validar duplicados (`correo`, `numero_documento` son `UNIQUE` en la tabla) devolviendo 409 con mensaje claro.

### Fase 13 — Pruebas y documentación
- [ ] Probar cada endpoint con la colección de Postman/Thunder Client o `pytest` + `TestClient`.
- [ ] Aprovechar `/docs` (Swagger) autogenerado por FastAPI para validar contratos antes de conectar el frontend.
- [ ] `README.md` del backend con instrucciones de instalación, variables de entorno y cómo correr `uvicorn`.

## 4. Mapa de endpoints (contrato ya definido por el frontend)

| Método | Ruta                     | Usado en                          | Respuesta esperada          |
|--------|--------------------------|------------------------------------|------------------------------|
| POST   | `/api/auth/login`        | `Login.jsx`                        | `{ token, usuario }`         |
| POST   | `/api/auth/register`     | `Register.jsx`                     | `{ usuario }` o 201          |
| GET    | `/api/usuarios`          | `Admin/Usuarios.jsx`               | `{ usuarios: [...] }`        |
| PUT    | `/api/usuarios/{id}`     | `Admin/Usuarios.jsx`               | `{ usuario }`                |
| GET    | `/api/usuarios/me`       | `Profile.jsx`                      | `{ usuario }` o el usuario   |
| PUT    | `/api/usuarios/me`       | `Profile.jsx`                      | `{ usuario }`                |
| GET    | `/api/productos`         | `Admin/Productos.jsx`              | `[...]` (arreglo plano)      |
| POST   | `/api/productos`         | `Admin/Productos.jsx`              | producto creado              |
| PUT    | `/api/productos/{id}`    | `Admin/Productos.jsx`              | producto actualizado         |
| DELETE | `/api/productos/{id}`    | `Admin/Productos.jsx`              | 204 / `{ message }`          |
| GET    | `/api/servicios`         | `Admin/Servicios.jsx`              | `[...]` (arreglo plano)      |
| POST   | `/api/servicios`         | `Admin/Servicios.jsx`              | servicio creado              |
| PUT    | `/api/servicios/{id}`    | `Admin/Servicios.jsx`              | servicio actualizado         |
| DELETE | `/api/servicios/{id}`    | `Admin/Servicios.jsx`              | 204 / `{ message }`          |
| GET    | `/api/roles`             | *(nuevo, para selects de rol)*     | `[...]`                      |
| GET    | `/api/permisos`          | *(nuevo, gestión de permisos)*     | `[...]`                      |

## 5. requirements.txt propuesto

```
fastapi
uvicorn[standard]
sqlalchemy
pymysql
cryptography
pydantic
pydantic-settings
python-jose[cryptography]
passlib[bcrypt]
python-multipart
python-dotenv
```

## 6. Variables de entorno (`.env.example`)

```
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/wildlife_db
SECRET_KEY=cambia-esta-clave-por-una-segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173
```

## 7. Notas sobre los datos existentes

- La tabla `servicios` trae un registro de ejemplo con `imagen` apuntando a una URL de búsqueda de Google (no es una imagen real) — conviene limpiarlo o dejarlo como dato de prueba, mencionarlo al usuario antes de usarlo en producción.
- Hay un typo en el dump: el usuario admin tiene correo `emmagomez09090@gmail.com` (con 9), mientras que el perfil de Emmanuel usa `emmagomez08090@gmail.com` (con 8) — verificar cuál es el correcto antes de hacer pruebas de login.
- Las contraseñas ya están hasheadas con bcrypt (`$2b$10$...`), por lo que `passlib[bcrypt]` debe poder verificarlas sin necesidad de resetearlas.

## 8. Ajuste mínimo sugerido en el frontend (no rompe estilos ni UI)

No es obligatorio, pero facilita el mantenimiento: crear un único archivo `src/api/client.js` que centralice `fetch` con `import.meta.env.VITE_API_URL`, y reemplazar las URLs `http://localhost:3000/api/...` repetidas en cada página por ese cliente. Esto es puramente de conexión (URLs), **no toca estilos, componentes ni lógica visual**, y evita tener que decidir a la fuerza que FastAPI corra en el puerto 3000.

## 9. Orden de ejecución recomendado

1. Fase 1 y 2 (entorno + modelos + conexión a MySQL).
2. Fase 3 y 4 (schemas + seguridad) — sin esto no se puede avanzar en nada protegido.
3. Fase 5 (auth) — para poder generar tokens y probar el resto de rutas.
4. Fases 6 a 9 (CRUDs) en el orden: Usuarios → Roles/Permisos → Productos → Servicios.
5. Fase 10 y 11 (autorización + CORS) en paralelo con los CRUDs.
6. Fase 12 (errores uniformes) — aplicar transversalmente a medida que se agregan endpoints.
7. Fase 13 (pruebas y documentación) al cierre de cada CRUD, no solo al final.