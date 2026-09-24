# MANUAL TÉCNICO DEL PROYECTO FORMATIVO

## Wildlife: plataforma de exploración, reservas y comercio de naturaleza

| Dato | Información |
|---|---|
| Centro / Regional | CESGE |
| Programa de formación | ADSO |
| Ficha | 3406211 |
| Competencia | **Pendiente de completar por el instructor o aprendiz** |
| Resultado de aprendizaje | **Pendiente de completar por el instructor o aprendiz** |
| Instructor | César Augusto Moreno Mena |
| Integrantes | **Pendiente de completar** |
| Fecha | 24 de septiembre de 2026 |
| Versión | 1.0 |

> Este manual fue elaborado a partir del código fuente disponible en el repositorio. Los datos que no se encuentran en el proyecto se identifican como pendientes y no se inventan.

## Tabla de contenido

1. Introducción y descripción general
2. Objetivos
3. Alcance
4. Arquitectura de la solución
5. Modelo de datos
6. Diseño de la solución
7. Instalación y configuración
8. Documentación técnica de módulos y API
9. Manual de usuario
10. Pruebas realizadas
11. Conclusiones y recomendaciones
12. Anexos

## 1. Introducción y descripción general

Wildlife es una aplicación web orientada a la exploración de la naturaleza y a la gestión de servicios turísticos y productos relacionados con la vida silvestre. La solución permite consultar contenido, explorar tours, registrar usuarios, realizar reservas, administrar un carrito de compras, iniciar pagos y consultar pedidos y facturas.

El sistema está dividido en un frontend desarrollado con React y Vite, y un backend desarrollado con FastAPI. El backend centraliza las reglas de negocio, la autenticación, la persistencia de datos, la integración con Stripe y la generación de facturas PDF.

### Problema que resuelve

La plataforma organiza en un solo sistema la publicación de tours y productos, la reserva de servicios, la compra de productos, el pago electrónico y la administración de usuarios, inventario, reservas y reportes. Esto reduce la gestión manual y ofrece al cliente un flujo digital de consulta y compra.

### Usuarios y actores

- **Visitante:** consulta la información pública, tours, productos y servicios.
- **Cliente:** se registra, inicia sesión, administra su perfil, carrito, reservas, pedidos y facturas.
- **Empleado:** gestiona operaciones autorizadas desde el panel administrativo.
- **Administrador:** administra usuarios, catálogo, roles, permisos, reservas y reportes.
- **Stripe:** proveedor externo que procesa las sesiones de pago y notifica el resultado mediante webhook.
- **OpenAI:** servicio externo opcional para responder mensajes del chatbot cuando existe `OPENAI_API_KEY`.

## 2. Objetivos

### Objetivo general

Desarrollar una plataforma web para consultar, reservar y comprar servicios y productos relacionados con la naturaleza, con autenticación, pagos, facturación y administración centralizada.

### Objetivos específicos

1. Implementar un frontend navegable para la consulta de contenido, tours, productos y servicios.
2. Construir una API REST con FastAPI para usuarios, catálogo, reservas, carrito, pedidos, pagos y reportes.
3. Proteger el acceso mediante autenticación JWT y autorización por roles.
4. Integrar Stripe Checkout y webhooks firmados para gestionar los pagos.
5. Persistir la información en una base de datos relacional mediante SQLAlchemy.
6. Proporcionar pruebas automatizadas para los flujos principales y recomendaciones de despliegue seguro.

## 3. Alcance del proyecto

### Funcionalidades incluidas

- Página de inicio, historia, contacto, exploración y contenido de Wildlife.
- Registro, inicio de sesión y recuperación de contraseña.
- Gestión del perfil del usuario.
- Catálogo de productos y servicios con precio, imagen, estado y stock.
- Carrito de productos y servicios.
- Creación de reservas de servicios con cantidad de personas, fechas y notas.
- Creación de sesiones de pago con Stripe o modo simulado.
- Confirmación de pago mediante webhook y control de idempotencia.
- Consulta de pedidos y descarga de facturas PDF.
- Chatbot mediante OpenAI, con respuesta alternativa cuando el servicio externo no está configurado.
- Panel administrativo para usuarios, productos, servicios y estadísticas.
- Gestión de roles y permisos desde la API.
- Reportes de ventas en JSON, CSV y listado histórico.
- Despliegue previsto en Render con frontend estático, API y PostgreSQL.

### Funcionalidades explícitamente excluidas o limitadas

- No se observa un módulo de inventario avanzado con movimientos, proveedores o bodegas.
- No se observa una pasarela de pago diferente de Stripe.
- El proyecto no incluye migraciones versionadas como Alembic; las tablas se crean al iniciar y existen comprobaciones de compatibilidad en `main.py`.
- El envío de correos de recuperación depende de configurar SMTP; en producción no debe exponerse el token.
- El contenido administrativo avanzado depende de los endpoints disponibles; la interfaz frontend implementada muestra principalmente usuarios, productos, servicios y estadísticas.

## 4. Arquitectura de la solución

### Diagrama de arquitectura

```mermaid
flowchart LR
    U[Usuario web] --> F[React + Vite<br/>Frontend]
    F -->|HTTP/JSON + Bearer JWT| A[FastAPI<br/>API REST]
    A --> D[(PostgreSQL<br/>SQLAlchemy)]
    A --> S[Stripe Checkout<br/>Pagos y webhook]
    A --> O[OpenAI API<br/>Chatbot opcional]
    A --> M[ReportLab<br/>Facturas PDF]
    A --> E[SMTP<br/>Recuperación opcional]
```

### Stack tecnológico

| Capa | Tecnología | Uso |
|---|---|---|
| Frontend | React 19, React Router, Vite 8 | Interfaz y navegación SPA |
| Estilos | Tailwind CSS, PostCSS | Diseño visual y estilos |
| Backend | Python, FastAPI, Uvicorn | API REST y servidor ASGI |
| Validación | Pydantic / pydantic-settings | Esquemas de entrada y configuración |
| Persistencia | SQLAlchemy | ORM y conexión a la base de datos |
| Base de datos | PostgreSQL | Persistencia recomendada; SQLite para pruebas aisladas |
| Seguridad | JWT, `python-jose`, `passlib[bcrypt]` | Sesiones y contraseñas protegidas |
| Pagos | Stripe Checkout y webhooks | Pagos y confirmación de transacciones |
| Documentos | ReportLab | Generación de facturas PDF |
| IA | OpenAI API | Chatbot opcional |
| Despliegue | Render | API, frontend estático y PostgreSQL |

### Estructura principal del repositorio

```text
Page-React/
├── backend/
│   ├── app/
│   │   ├── core/          # Seguridad y dependencias
│   │   ├── models/        # Entidades SQLAlchemy
│   │   ├── routers/       # Endpoints FastAPI
│   │   ├── schemas/       # Modelos Pydantic
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── start-dev.ps1
├── page/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── package.json
├── render.yaml
└── DEPLOYMENT.md
```

### Seguridad transversal

- Las rutas protegidas esperan `Authorization: Bearer <token>`.
- Las contraseñas se almacenan usando hash, no en texto plano.
- La autorización se realiza por roles: administrador, empleado y cliente.
- Se aplica CORS configurable y `TrustedHostMiddleware`.
- En producción se desactiva la documentación pública de FastAPI.
- Se agregan cabeceras de seguridad HTTP.
- El precio se calcula en el servidor; no se confía en el precio enviado por el frontend.
- Stripe valida la firma del webhook y registra eventos para evitar reprocesarlos.

## 5. Modelo de datos

### Diagrama entidad-relación

```mermaid
erDiagram
    ROLES ||--o{ USUARIOS : asigna
    ROLES }o--o{ PERMISOS : contiene
    USUARIOS ||--o{ RESERVAS : crea
    SERVICIOS ||--o{ RESERVAS : recibe
    USUARIOS ||--o{ CARRITO_ITEMS : posee
    USUARIOS ||--o{ PEDIDOS : realiza
    USUARIOS ||--o{ PAGOS : efectua
    USUARIOS ||--o{ FACTURAS : recibe
    USUARIOS ||--o{ REPORTES_VENTAS : genera
    PEDIDOS ||--o| FACTURAS : produce
    RESERVAS ||--o{ PAGOS : relaciona

    USUARIOS { int id PK; string nombre; string apellido; string correo UK; int rol_id FK; int estado }
    ROLES { int id PK; string nombre UK; string descripcion }
    PERMISOS { int id PK; string nombre UK; string descripcion }
    PRODUCTOS { int id PK; string nombre; decimal precio; int stock; int estado }
    SERVICIOS { int id PK; string nombre; decimal precio; string duracion; int stock; int estado }
    RESERVAS { int id PK; int usuario_id FK; int servicio_id FK; int cantidad_personas; date fecha_inicio; date fecha_fin; string estado }
    CARRITO_ITEMS { int id PK; int usuario_id FK; string tipo; int item_id; int cantidad }
    PEDIDOS { int id PK; int usuario_id FK; string tipo; int referencia_id; int cantidad; decimal monto_total; string estado }
    PAGOS { int id PK; int usuario_id FK; int reserva_id FK; decimal monto; string estado; string stripe_session_id }
    FACTURAS { int id PK; string numero UK; int pedido_id FK; int usuario_id FK; decimal total; string estado }
    REPORTES_VENTAS { int id PK; int administrador_id FK; json filtros; int ventas; int unidades; decimal total }
```

### Diccionario de datos resumido

| Entidad | Atributos principales | Descripción |
|---|---|---|
| `usuarios` | `id`, nombre, apellido, documento, correo, password, `rol_id`, estado | Cuentas de acceso y datos del cliente o administrador. |
| `roles` | `id`, nombre, descripción | Roles iniciales: Administrador, Empleado y Cliente. |
| `permisos` | `id`, nombre, descripción | Permisos que pueden asociarse a roles. |
| `productos` | `id`, nombre, descripción, precio, imagen, stock, estado | Productos ofrecidos en la tienda. |
| `servicios` | `id`, nombre, descripción, precio, duración, imagen, stock, estado | Tours o servicios reservables. |
| `reservas` | usuario, servicio, personas, fechas, monto, estado, notas | Solicitudes de reserva de servicios. |
| `carrito_items` | usuario, tipo, `item_id`, cantidad | Elementos del carrito; `tipo` distingue producto o servicio. |
| `pedidos` | usuario, tipo, referencia, cantidad, total, moneda, estado | Registro de compras confirmadas o pendientes. |
| `pagos` | usuario, reserva, monto, moneda, estado, IDs de Stripe | Seguimiento del pago. |
| `facturas` | número, pedido, usuario, subtotal, total, estado, fecha | Factura descargable en PDF. |
| `reportes_ventas` | administrador, filtros, ventas, unidades, total | Historial de reportes generados. |
| `stripe_events` | `event_id`, tipo, payload, fecha | Idempotencia y auditoría de eventos Stripe. |
| `password_reset_tokens` | usuario, hash, expiración, uso | Recuperación segura de contraseña. |

Los tipos específicos, longitudes y restricciones se encuentran en `backend/app/models/`. Los campos monetarios utilizan precisión decimal; las fechas de reservas utilizan `DATE` y las fechas de creación utilizan `DATETIME`.

## 6. Diseño de la solución

### Casos de uso principales

| Código | Actor | Caso de uso | Resultado |
|---|---|---|---|
| CU-01 | Visitante | Consultar catálogo | Visualiza productos y servicios activos. |
| CU-02 | Visitante | Registrarse | Se crea una cuenta con rol Cliente. |
| CU-03 | Cliente | Iniciar sesión | Recibe un JWT temporal. |
| CU-04 | Cliente | Reservar servicio | Se crea una reserva pendiente con fechas y personas. |
| CU-05 | Cliente | Comprar | Se crea una sesión Stripe a partir de los elementos del carrito. |
| CU-06 | Cliente | Consultar factura | Descarga el PDF si pertenece al pedido. |
| CU-07 | Administrador | Gestionar catálogo | Crea, actualiza o elimina productos y servicios. |
| CU-08 | Administrador/Empleado | Consultar reportes | Filtra ventas y descarga un CSV. |
| CU-09 | Cliente | Usar chatbot | Envía una pregunta y recibe una respuesta. |

### Flujo de compra

1. El cliente agrega productos o servicios al carrito.
2. El frontend envía tipos, identificadores y cantidades a `POST /api/pagos/crear-sesion`.
3. El backend consulta precios y stock en la base de datos.
4. Se crea la sesión Stripe o se activa el modo simulado.
5. Stripe redirige al usuario al resultado configurado.
6. El webhook firmado confirma el estado, descuenta stock una sola vez y genera la factura.
7. El cliente consulta el pedido y descarga la factura PDF.

## 7. Manual de instalación y configuración

### Requisitos previos

- Windows PowerShell, macOS o Linux.
- Python 3.11 o compatible con las dependencias del proyecto.
- Node.js y npm.
- PostgreSQL para ejecución normal. SQLite puede utilizarse en pruebas aisladas.
- Cuenta y claves de Stripe para pagos reales o de prueba.
- Clave de OpenAI únicamente si se requiere el chatbot conectado al servicio externo.

### Instalación del backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Configurar en `backend/.env` una URL como:

```text
DATABASE_URL=postgresql+psycopg://postgres:TU_PASSWORD@localhost:5432/wildlife_db
```

Para una prueba local aislada puede utilizarse:

```text
DATABASE_URL=sqlite:///./wildlife.db
```

### Instalación del frontend

```powershell
cd page
npm ci
```

Crear `page/.env` con la URL de la API:

```text
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxx
```

### Variables de entorno del backend

| Variable | Obligatoria | Propósito |
|---|---:|---|
| `APP_ENV` | Sí | `development`, `staging` o `production`. |
| `DATABASE_URL` | Sí | Conexión a PostgreSQL o SQLite. |
| `SECRET_KEY` | Sí | Firma de tokens; mínimo 32 caracteres en producción. |
| `ALGORITHM` | No | Algoritmo JWT, normalmente `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Duración del token. |
| `CORS_ORIGINS` | Sí | Orígenes autorizados del frontend. |
| `TRUSTED_HOSTS` | Sí | Hosts aceptados por la API. |
| `STRIPE_SECRET_KEY` | Para pagos | Clave secreta de Stripe. |
| `STRIPE_WEBHOOK_SECRET` | Para webhook | Firma del webhook. |
| `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` | Para pagos | URLs de retorno. |
| `STRIPE_MOCK_MODE` | No | Permite probar pagos sin cobro real. |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | Chatbot | Configuración del chatbot externo. |
| `FRONTEND_URL` | Recuperación | URL usada en enlaces de contraseña. |
| `SMTP_*` | Producción | Servidor para enviar recuperación. |
| `EXPOSE_RESET_TOKEN` | No | Solo debe ser `true` en desarrollo. |

### Ejecución

Backend:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend, en otra terminal:

```powershell
cd page
npm run dev
```

Direcciones habituales:

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs` en desarrollo
- Health check: `http://localhost:8000/health`

Al iniciar, el backend crea las tablas y registra los roles iniciales si no existen. En producción se recomienda utilizar migraciones y revisar el esquema antes de recibir tráfico.

### Despliegue en Render

El archivo `render.yaml` define un servicio web para la API, un sitio estático para el frontend y una base PostgreSQL. Antes de desplegar:

1. No subir `backend/.env` ni `page/.env` al repositorio.
2. Configurar secretos en Render.
3. Definir `CORS_ORIGINS` con el dominio real del frontend.
4. Definir `TRUSTED_HOSTS` con el dominio de la API.
5. Configurar `VITE_API_URL` con la URL pública de la API.
6. Configurar el webhook de Stripe en `/api/pagos/webhook`.
7. Comprobar `/health` y revisar logs.

## 8. Documentación técnica de módulos y API

Base de la API local: `http://localhost:8000`. Las rutas que no indican “pública” requieren el encabezado `Authorization: Bearer <token>`.

### Salud y autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/health` | Público | Verifica disponibilidad. |
| POST | `/api/auth/register` | Público | Registra un cliente. |
| POST | `/api/auth/login` | Público | Devuelve token y usuario. |
| POST | `/api/auth/forgot-password` | Público | Solicita recuperación. |
| POST | `/api/auth/reset-password` | Público | Cambia la contraseña con token. |

Ejemplo de registro:

```http
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Ana",
  "apellido": "Ríos",
  "tipo_documento": "CC",
  "numero_documento": "1234567890",
  "correo": "ana@example.com",
  "password": "secret123"
}
```

Respuesta simplificada: `201 Created` con el usuario, sin devolver la contraseña.

### Catálogo

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/productos` | Público | Lista productos. |
| POST/PUT/DELETE | `/api/productos[/id]` | Admin/Empleado | Gestiona productos. |
| GET | `/api/servicios` | Público | Lista servicios. |
| GET | `/api/servicios/{id}` | Público | Consulta un servicio. |
| POST/PUT/DELETE | `/api/servicios[/id]` | Admin/Empleado | Gestiona servicios. |
| GET | `/api/roles` | Público | Lista roles. |
| POST/PUT/DELETE | `/api/roles[/id]` | Administrador | Gestiona roles. |
| GET | `/api/permisos` | Público | Lista permisos. |
| POST/PUT/DELETE | `/api/permisos[/id]` | Administrador | Gestiona permisos. |

### Usuarios y carrito

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/usuarios` | Admin/Empleado | Lista usuarios. |
| GET/PUT | `/api/usuarios/me` | Cliente autenticado | Consulta o actualiza el perfil. |
| PUT/DELETE | `/api/usuarios/{id}` | Administrador | Administra usuarios. |
| GET/PUT | `/api/carrito` | Cliente autenticado | Consulta o reemplaza el carrito. |

Ejemplo de carrito:

```http
PUT /api/carrito
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {"tipo": "producto", "item_id": 1, "cantidad": 2},
    {"tipo": "servicio", "item_id": 3, "cantidad": 1}
  ]
}
```

### Reservas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/reservas` | Cliente | Crea una reserva. |
| GET | `/api/reservas` | Admin/Empleado | Lista reservas. |
| GET | `/api/reservas/me` | Cliente | Lista reservas propias. |
| GET/PUT | `/api/reservas/{id}` | Según rol/pertenencia | Consulta o actualiza una reserva. |
| PUT | `/api/reservas/{id}/estado` | Admin/Empleado | Cambia el estado. |

Ejemplo:

```json
{
  "servicio_id": 1,
  "cantidad_personas": 2,
  "fecha_inicio": "2026-10-10",
  "fecha_fin": "2026-10-12",
  "notas": "Llegaremos temprano"
}
```

### Pagos, pedidos y facturas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/pagos/crear-sesion` | Cliente | Crea sesión Stripe usando el carrito. |
| POST | `/api/pagos/verificar-sesion` | Cliente | Verifica una sesión. |
| POST | `/api/pagos/webhook` | Stripe | Recibe eventos firmados. |
| GET | `/api/pedidos/me` | Cliente | Lista pedidos propios. |
| GET | `/api/pedidos/{id}` | Cliente/Admin | Consulta un pedido autorizado. |
| GET | `/api/facturas/me` | Cliente | Lista facturas propias. |
| GET | `/api/facturas/{id}/download` | Cliente/Admin | Descarga una factura PDF. |
| GET | `/api/facturas/pedido/{id}/download` | Cliente/Admin | Descarga factura por pedido. |

### Administración y reportes

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin/Empleado | Indicadores generales. |
| GET | `/api/admin/sales-analytics` | Admin/Empleado | Serie analítica filtrable. |
| GET | `/api/admin/sales-report.csv` | Admin/Empleado | Descarga reporte CSV. |
| GET | `/api/admin/sales-reports` | Admin/Empleado | Lista reportes generados. |

### Chatbot

```http
POST /api/chatbot/message
Authorization: Bearer <token>
Content-Type: application/json

{"message": "¿Qué tours están disponibles?"}
```

La respuesta contiene el mensaje generado. Si no existe una clave válida de OpenAI, el backend utiliza una respuesta alternativa local para mantener disponible el módulo.

### Respuestas de error

La aplicación normaliza errores HTTP con una propiedad `message`. Los errores de validación responden con estado `422` y agregan `errors`; una violación de integridad responde con `409`. Los errores no controlados responden con `500` sin exponer detalles internos.

## 9. Manual de usuario

### Visitante

1. Abrir la página de inicio.
2. Usar el menú para acceder a Explore, Wildlife, Tours o Shop.
3. Consultar el detalle de un tour o producto.
4. Seleccionar “Registrarse” para crear una cuenta o “Iniciar sesión” para entrar.

### Cliente

1. Registrarse con datos personales, correo y contraseña.
2. Iniciar sesión.
3. Explorar un servicio y elegir fechas y cantidad de personas para crear una reserva.
4. Agregar productos o servicios al carrito.
5. Revisar el carrito y continuar al pago.
6. Completar Stripe o el flujo simulado configurado para desarrollo.
7. Consultar el resultado en `pago-exitoso` o `pago-cancelado`.
8. Entrar al perfil para revisar reservas, pedidos y facturas.
9. Descargar una factura en formato PDF.

### Administrador o empleado

1. Iniciar sesión con una cuenta autorizada.
2. Entrar a `/admin`.
3. Consultar las estadísticas del panel.
4. Administrar productos y servicios desde sus secciones.
5. Administrar usuarios si el rol tiene permiso.
6. Revisar reservas y reportes mediante la API o las vistas disponibles.

### Capturas de pantalla para la entrega

Para cumplir el requisito académico de evidencias visuales, insertar en la versión Word/PDF capturas de:

1. Página de inicio.
2. Registro e inicio de sesión.
3. Catálogo de tours o productos.
4. Carrito y pantalla de pago.
5. Perfil con reservas o pedidos.
6. Panel administrativo.
7. Swagger en `/docs` durante desarrollo.

Las capturas deben ocultar contraseñas, tokens, claves secretas y datos personales que no sean necesarios.

## 10. Pruebas realizadas

El proyecto contiene pruebas en `backend/tests/test_api.py` usando `pytest`, `TestClient` y SQLite para aislar la ejecución.

### Casos automatizados identificados

| Prueba | Resultado esperado |
|---|---|
| Salud y registro | `/health` responde `ok`; el registro devuelve `201`. |
| Registro duplicado | Devuelve `409` y una propiedad `message`. |
| Inicio de sesión | Devuelve un token JWT. |
| Autorización | Un cliente no puede listar usuarios; un administrador sí. |
| Actualización de usuario | El administrador puede modificar un usuario autorizado. |
| Límites de documento y teléfono | Acepta valores de hasta 10 dígitos y rechaza datos fuera de las restricciones. |
| Sesión de checkout | Usa productos y servicios del carrito y permite modo simulado. |
| Creación de reserva | Crea una reserva pendiente y permite listar las reservas propias. |
| Fecha final vacía | Acepta una reserva sin fecha de fin cuando el esquema lo permite. |

### Ejecución

```powershell
cd backend
pytest -q
```

### Validación manual recomendada

- Ejecutar `GET /health` después del arranque.
- Probar el flujo registro → login → carrito → checkout.
- Probar reserva con fecha de inicio y fecha final.
- Verificar que un usuario no acceda a pedidos o facturas de otro usuario.
- Probar un webhook Stripe repetido y comprobar que no duplica factura ni descuento de stock.
- Ejecutar la compilación del frontend:

```powershell
cd page
npm run build
```

## 11. Conclusiones y recomendaciones

### Conclusiones

La solución integra frontend, API, persistencia, autenticación, reservas, compras, pagos y facturación en una arquitectura separada por responsabilidades. FastAPI facilita la documentación automática y la validación de datos; SQLAlchemy permite mantener el modelo relacional en código; React proporciona una interfaz modular y navegable.

### Recomendaciones

1. Incorporar Alembic para migraciones versionadas y evitar depender únicamente de `create_all` y ajustes de arranque.
2. Agregar pruebas de integración para Stripe, webhooks, permisos, facturas y concurrencia de stock.
3. Configurar SMTP antes de activar recuperación de contraseña en producción.
4. Mantener las claves y archivos `.env` fuera del repositorio y rotar secretos expuestos.
5. Implementar copias de seguridad automáticas y pruebas de restauración de PostgreSQL.
6. Agregar observabilidad centralizada, alertas de errores `5xx` y monitoreo del webhook.
7. Completar las capturas y datos institucionales antes de entregar el PDF o Word.
8. Documentar una política de privacidad y tratamiento de datos personales para el uso real del sistema.

## 12. Anexos

### A. Archivos técnicos de referencia

- `backend/app/main.py`: creación de la aplicación, middleware, routers y arranque.
- `backend/app/config.py`: configuración mediante variables de entorno.
- `backend/app/database.py`: conexión SQLAlchemy.
- `backend/app/models/`: entidades de persistencia.
- `backend/app/schemas/`: validación y serialización.
- `backend/app/routers/`: módulos de API.
- `backend/tests/test_api.py`: pruebas automatizadas.
- `DEPLOYMENT.md`: despliegue y controles de seguridad.
- `render.yaml`: definición del despliegue en Render.

### B. Enlace al repositorio

**Pendiente de completar con la URL del repositorio o carpeta de entrega.**

### C. Lista de verificación de entrega

- [ ] Completar integrantes.
- [ ] Completar competencia y resultado de aprendizaje.
- [ ] Agregar tabla de contenido con páginas después de exportar.
- [ ] Insertar capturas de pantalla.
- [ ] Agregar URL del repositorio.
- [ ] Revisar ortografía y nombres propios.
- [ ] Exportar a PDF o Word según indique el instructor.
- [ ] Nombrar el archivo según el formato solicitado por el instructor.

