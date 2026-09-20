# Plan de trabajo — Integración de reservas y pagos para Wildlife

## 1. Objetivo

Implementar en Wildlife un sistema completo de **reservas de tours/servicios y pagos con Stripe en modo de prueba**, integrado con:

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI
- **Base de datos:** MariaDB/MySQL
- **Autenticación:** JWT
- **Contraseñas:** bcrypt
- **Pagos:** Stripe Test Mode
- **Comunicación:** API REST + Webhooks de Stripe

El objetivo es que un usuario autenticado pueda seleccionar un tour, crear una reserva, pagar mediante Stripe en modo de prueba y que el sistema actualice automáticamente el estado de la reserva después de recibir la confirmación del pago.

---

# 2. Arquitectura general

```text
                    WILDLIFE
                       │
          ┌────────────┴────────────┐
          │                         │
      React + Tailwind           FastAPI
          │                         │
          │                    JWT / API REST
          │                         │
          └──────────────┬──────────┘
                         │
                      MariaDB
                         │
          ┌──────────────┴──────────────┐
          │                             │
       Reservas                       Pagos
          │                             │
          └──────────────┬──────────────┘
                         │
                       Stripe
                    Test / Sandbox
                         │
                      Webhook
                         │
                       FastAPI
```

---

# 3. Resultado esperado

El flujo principal será:

```text
Usuario inicia sesión
        ↓
Explora Tours
        ↓
Selecciona un servicio
        ↓
Consulta detalles
        ↓
Selecciona fecha y cantidad de personas
        ↓
Crea reserva
        ↓
Reserva queda PENDIENTE
        ↓
FastAPI crea Checkout Session en Stripe
        ↓
Frontend redirige al Checkout
        ↓
Usuario utiliza tarjeta de prueba
        ↓
Stripe procesa el pago de prueba
        ↓
Stripe envía webhook a FastAPI
        ↓
FastAPI verifica el webhook
        ↓
Pago → APROBADO
        ↓
Reserva → CONFIRMADA
        ↓
Usuario puede consultar su reserva
        ↓
Administrador puede consultar reservas y pagos
```

---

# 4. Modelo de base de datos

## 4.1 Tablas existentes

El proyecto ya contempla las tablas principales:

- `roles`
- `permisos`
- `usuarios`
- `productos`
- `servicios`

A estas se agregarán:

- `reservas`
- `pagos`

---

# 5. Tabla `roles`

Representa los diferentes tipos de usuario del sistema.

```sql
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);
```

Datos iniciales:

```sql
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'empleado', 'Empleado de Wildlife'),
(3, 'cliente', 'Cliente de Wildlife');
```

---

# 6. Tabla `permisos`

Permite controlar permisos específicos si el proyecto los necesita.

```sql
CREATE TABLE permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);
```

Ejemplos:

```text
usuarios.ver
usuarios.crear
usuarios.editar
usuarios.eliminar

servicios.ver
servicios.crear
servicios.editar
servicios.eliminar

reservas.ver
reservas.crear
reservas.editar
reservas.cancelar

pagos.ver
pagos.reembolsar
```

Si existe una tabla intermedia para relacionar roles y permisos, mantenerla:

```sql
CREATE TABLE rol_permisos (
    rol_id INT NOT NULL,
    permiso_id INT NOT NULL,

    PRIMARY KEY (rol_id, permiso_id),

    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (permiso_id) REFERENCES permisos(id)
);
```

---

# 7. Tabla `usuarios`

Mantener la estructura existente del proyecto y verificar que incluya como mínimo:

```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    tipo_documento VARCHAR(30),
    numero_documento VARCHAR(50) UNIQUE,
    direccion VARCHAR(255),
    telefono VARCHAR(30),
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL DEFAULT 3,
    estado BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (rol_id) REFERENCES roles(id)
);
```

La contraseña debe almacenarse usando **bcrypt**, nunca en texto plano.

---

# 8. Tabla `productos`

Mantener la tabla de productos existente para el CRUD administrativo.

Ejemplo:

```sql
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    imagen VARCHAR(255),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Los productos son independientes del sistema de reservas de tours.

---

# 9. Tabla `servicios`

Los tours serán tratados como servicios.

```sql
CREATE TABLE servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    duracion VARCHAR(100),
    imagen VARCHAR(255),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Ejemplo:

```text
Tour Amazonas
precio: 350000
duracion: 2 días / 1 noche
estado: activo
```

---

# 10. Nueva tabla `reservas`

La tabla `reservas` representa la intención y datos de la reserva del cliente.

```sql
CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,
    servicio_id INT NOT NULL,

    fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_tour DATE NOT NULL,

    cantidad_personas INT NOT NULL DEFAULT 1,

    precio_unitario DECIMAL(10,2) NOT NULL,
    precio_total DECIMAL(10,2) NOT NULL,

    estado ENUM(
        'pendiente',
        'confirmada',
        'cancelada',
        'completada'
    ) DEFAULT 'pendiente',

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);
```

## Relaciones

```text
usuarios 1 ─────── N reservas
servicios 1 ────── N reservas
```

Una persona puede tener varias reservas.

Un servicio puede ser reservado muchas veces.

---

# 11. Nueva tabla `pagos`

La tabla `pagos` representa el pago asociado a una reserva.

```sql
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    reserva_id INT NOT NULL,

    monto DECIMAL(10,2) NOT NULL,

    moneda VARCHAR(10) DEFAULT 'COP',

    metodo_pago VARCHAR(50) DEFAULT 'stripe',

    estado ENUM(
        'pendiente',
        'aprobado',
        'rechazado',
        'reembolsado'
    ) DEFAULT 'pendiente',

    stripe_checkout_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),

    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reserva_id) REFERENCES reservas(id)
);
```

## Relaciones

```text
reservas 1 ─────── N pagos
```

Aunque inicialmente una reserva tendrá un pago, mantener la relación separada permite manejar posteriormente:

- reintentos de pago
- pagos rechazados
- reembolsos
- múltiples intentos
- historial de transacciones

---

# 12. Datos que NO deben almacenarse

No guardar en MariaDB:

```text
Número completo de tarjeta
CVV
Fecha completa de expiración
Datos sensibles de autenticación bancaria
```

Stripe debe encargarse de los datos sensibles del pago.

Wildlife solamente debe almacenar identificadores y estados necesarios para relacionar la transacción con la reserva.

---

# 13. Backend FastAPI — estructura propuesta

Organizar el backend aproximadamente así:

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── config.py
│   │
│   ├── database.py
│   │
│   ├── models/
│   │   ├── usuario.py
│   │   ├── rol.py
│   │   ├── permiso.py
│   │   ├── producto.py
│   │   ├── servicio.py
│   │   ├── reserva.py
│   │   └── pago.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── usuario.py
│   │   ├── producto.py
│   │   ├── servicio.py
│   │   ├── reserva.py
│   │   └── pago.py
│   │
│   ├── crud/
│   │   ├── usuarios.py
│   │   ├── productos.py
│   │   ├── servicios.py
│   │   ├── reservas.py
│   │   └── pagos.py
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   ├── usuarios.py
│   │   ├── productos.py
│   │   ├── servicios.py
│   │   ├── reservas.py
│   │   ├── pagos.py
│   │   └── stripe_webhook.py
│   │
│   ├── dependencies/
│   │   ├── auth.py
│   │   └── roles.py
│   │
│   └── services/
│       └── stripe_service.py
│
└── .env
```

La estructura exacta puede adaptarse a la estructura actual del proyecto.

---

# 14. Dependencias del backend

Instalar las dependencias necesarias:

```bash
pip install stripe
```

Si todavía no están instaladas:

```bash
pip install fastapi uvicorn sqlalchemy pymysql python-dotenv python-jose passlib[bcrypt]
```

Actualizar `requirements.txt`:

```bash
pip freeze > requirements.txt
```

---

# 15. Variables de entorno

Crear o actualizar `.env`:

```env
DATABASE_URL=...

SECRET_KEY=...

STRIPE_SECRET_KEY=sk_test_...

STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_CURRENCY=cop

FRONTEND_URL=http://localhost:5173
```

Las claves de Stripe deben mantenerse únicamente en el backend.

No colocar:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

en React.

---

# 16. Backend — módulo de reservas

Crear el modelo SQLAlchemy de `Reserva`.

Campos:

```text
id
usuario_id
servicio_id
fecha_reserva
fecha_tour
cantidad_personas
precio_unitario
precio_total
estado
```

Implementar CRUD según las necesidades del sistema.

---

# 17. Endpoints de reservas

Propuesta:

```http
POST /api/reservas
GET /api/reservas/mis-reservas
GET /api/reservas/{id}
PUT /api/reservas/{id}/cancelar
```

Administración:

```http
GET /api/admin/reservas
GET /api/admin/reservas/{id}
PUT /api/admin/reservas/{id}/estado
```

## Reglas

### Cliente

Puede:

- crear reservas
- consultar sus propias reservas
- consultar el detalle de sus reservas
- cancelar una reserva cuando las reglas del sistema lo permitan

No puede:

- consultar reservas de otros usuarios
- cambiar directamente un pago a aprobado
- modificar información relacionada con Stripe

### Administrador

Puede:

- consultar todas las reservas
- consultar detalles
- cambiar estados administrativos
- consultar pagos

---

# 18. Cálculo del precio

El precio debe calcularse en el backend.

Ejemplo:

```text
precio del servicio = $350.000
personas = 2

precio_total = 350.000 × 2
precio_total = 700.000
```

No confiar exclusivamente en el precio enviado por React.

React puede enviar:

```json
{
    "servicio_id": 1,
    "fecha_tour": "2026-10-15",
    "cantidad_personas": 2
}
```

FastAPI consulta el precio real del servicio y calcula:

```text
precio_unitario
precio_total
```

Esto evita que el cliente manipule el precio desde el navegador.

---

# 19. Backend — integración con Stripe

Crear:

```text
services/stripe_service.py
```

Responsabilidades:

- crear Checkout Sessions
- asociar el pago con una reserva
- almacenar el ID de la sesión
- configurar URLs de éxito y cancelación
- preparar metadata para identificar la reserva

Ejemplo conceptual de metadata:

```text
reserva_id = 15
usuario_id = 4
servicio_id = 2
```

---

# 20. Endpoint para iniciar pago

Propuesta:

```http
POST /api/pagos/crear-checkout/{reserva_id}
```

Flujo:

```text
React
  ↓
POST /api/pagos/crear-checkout/15
  ↓
FastAPI verifica JWT
  ↓
FastAPI verifica que la reserva pertenece al usuario
  ↓
FastAPI verifica que está pendiente
  ↓
FastAPI obtiene precio desde BD
  ↓
FastAPI crea Checkout Session
  ↓
Guarda stripe_checkout_session_id
  ↓
Devuelve URL de Checkout
  ↓
React redirige al usuario
```

Respuesta aproximada:

```json
{
    "checkout_url": "https://checkout.stripe.com/..."
}
```

---

# 21. Stripe Webhook

El webhook será una de las partes más importantes.

Crear:

```http
POST /api/stripe/webhook
```

Stripe enviará eventos al backend.

El backend debe:

1. recibir el evento
2. verificar la firma de Stripe
3. identificar el tipo de evento
4. localizar la reserva/pago
5. actualizar la base de datos
6. responder correctamente a Stripe

No se debe confiar únicamente en que el usuario vuelva a la página de éxito.

---

# 22. Eventos de Stripe

Como mínimo implementar:

```text
checkout.session.completed
```

Opcionalmente manejar:

```text
payment_intent.payment_failed
charge.refunded
```

Flujo de pago exitoso:

```text
checkout.session.completed
        ↓
Buscar reserva asociada
        ↓
Crear/actualizar pago
        ↓
estado_pago = aprobado
        ↓
estado_reserva = confirmada
```

---

# 23. Evitar pagos duplicados

El webhook debe ser **idempotente**.

Antes de crear un nuevo registro o confirmar una reserva:

```text
¿Este evento/payment intent ya fue procesado?
        │
      Sí ───→ No volver a procesarlo
        │
       No
        ↓
Procesar pago
```

Esto evita que un mismo evento genere múltiples pagos.

---

# 24. Frontend React + Tailwind

Crear o adaptar componentes:

```text
src/
├── pages/
│   ├── Tours/
│   ├── TourDetail/
│   ├── Reservas/
│   ├── ReservaDetalle/
│   └── PaymentResult/
│
├── components/
│   ├── tours/
│   ├── reservas/
│   └── pagos/
│
├── services/
│   ├── api.js
│   ├── reservas.js
│   └── pagos.js
│
└── context/
    └── AuthContext.jsx
```

---

# 25. Página de detalle del tour

La página actual de `TourDetail` debe permitir:

```text
Imagen
Nombre
Descripción
Duración
Precio
Estado

Fecha del tour
[ selector ]

Cantidad de personas
[ - ] 2 [ + ]

Total
$700.000

[ Reservar ]
```

El diseño debe mantenerse coherente con el estilo Wildlife y Tailwind existente.

---

# 26. Crear reserva desde React

Al presionar:

```text
Reservar
```

React enviará:

```json
{
    "servicio_id": 1,
    "fecha_tour": "2026-10-15",
    "cantidad_personas": 2
}
```

FastAPI responderá con la reserva creada:

```json
{
    "id": 15,
    "estado": "pendiente",
    "precio_total": 700000
}
```

Después React puede mostrar:

```text
Reserva creada correctamente

Total: $700.000

[ Continuar al pago ]
```

---

# 27. Botón de pago

El botón:

```text
Pagar con Stripe
```

llamará:

```http
POST /api/pagos/crear-checkout/15
```

Después:

```javascript
window.location.href = checkout_url;
```

El usuario llegará al Checkout de Stripe.

---

# 28. Página de éxito

Crear:

```text
/payment/success
```

No asumir que visitar esta página significa que el pago fue confirmado.

Mostrar inicialmente:

```text
Estamos verificando tu pago...
```

Después consultar el backend:

```http
GET /api/reservas/15
```

Cuando la reserva esté confirmada:

```text
¡Pago realizado correctamente!

Reserva #15
Tour Amazonas
2 personas
$700.000

Estado: Confirmada

[ Ver mis reservas ]
```

---

# 29. Página de cancelación

Crear:

```text
/payment/cancel
```

Mostrar:

```text
El proceso de pago fue cancelado.

Tu reserva permanece pendiente.

Puedes intentar pagar nuevamente.

[ Volver a la reserva ]
```

---

# 30. Página "Mis reservas"

Crear:

```text
/mis-reservas
```

Mostrar las reservas del usuario:

```text
Mis reservas

┌─────────────────────────────────────────┐
│ Tour Amazonas                           │
│ 15 de octubre de 2026                   │
│ 2 personas                              │
│ $700.000                                │
│ Estado: Confirmada                      │
│                                         │
│ [ Ver detalles ]                        │
└─────────────────────────────────────────┘
```

Filtros opcionales:

```text
Todas
Pendientes
Confirmadas
Canceladas
Completadas
```

---

# 31. Detalle de reserva

Crear:

```text
/mis-reservas/:id
```

Mostrar:

```text
Reserva #15

Tour:
Tour Amazonas

Fecha:
15/10/2026

Personas:
2

Precio unitario:
$350.000

Total:
$700.000

Estado:
Confirmada

Pago:
Aprobado
```

---

# 32. Panel administrativo

Agregar al dashboard:

```text
Reservas
Pagos
```

## Reservas

Tabla:

```text
ID | Cliente | Tour | Fecha | Personas | Total | Estado
```

## Pagos

Tabla:

```text
ID | Reserva | Cliente | Monto | Método | Estado | Fecha
```

El administrador podrá consultar información, pero el cambio de estado de un pago no debe utilizarse para falsificar una confirmación de Stripe.

---

# 33. Seguridad

Implementar las siguientes medidas:

## JWT

Todos los endpoints privados requieren:

```http
Authorization: Bearer TOKEN
```

## Roles

Proteger endpoints administrativos:

```text
admin
empleado
```

según las reglas del proyecto.

## Ownership

Un cliente solamente puede acceder a:

```text
sus propias reservas
```

## Precios

El backend calcula el precio.

## Stripe

Las claves secretas solamente están en FastAPI.

## Webhook

Verificar la firma de Stripe.

## Validaciones

Validar:

```text
servicio existente
servicio activo
usuario autenticado
fecha válida
cantidad_personas > 0
reserva existente
reserva perteneciente al usuario
reserva no cancelada
```

---

# 34. Pruebas del backend

Probar primero con Swagger:

```text
/docs
```

## Reservas

### Crear

```http
POST /api/reservas
```

### Consultar propias

```http
GET /api/reservas/mis-reservas
```

### Consultar detalle

```http
GET /api/reservas/{id}
```

### Cancelar

```http
PUT /api/reservas/{id}/cancelar
```

---

# 35. Pruebas de Stripe

Utilizar exclusivamente claves:

```text
sk_test_...
pk_test_...
```

Nunca claves live durante el desarrollo.

Probar escenarios:

### Pago exitoso

Usar una tarjeta de prueba proporcionada por Stripe.

### Pago rechazado

Utilizar una tarjeta de prueba que produzca un rechazo.

### Cancelación

Entrar al Checkout y regresar sin completar el pago.

### Webhook

Comprobar que FastAPI recibe correctamente:

```text
checkout.session.completed
```

---

# 36. Stripe CLI durante desarrollo

Para probar webhooks localmente se puede utilizar Stripe CLI.

Conceptualmente:

```bash
stripe login
```

Después:

```bash
stripe listen --forward-to localhost:8000/api/stripe/webhook
```

Stripe proporcionará un secreto de webhook para el entorno local.

Ese valor debe colocarse en:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

# 37. Pruebas de integración completas

Realizar una prueba desde el navegador:

```text
1. Registrar usuario
2. Iniciar sesión
3. Ir a Tours
4. Seleccionar tour
5. Seleccionar fecha
6. Seleccionar cantidad
7. Crear reserva
8. Comprobar reserva pendiente
9. Pulsar pagar
10. Abrir Stripe Checkout
11. Utilizar tarjeta de prueba
12. Completar pago
13. Stripe envía webhook
14. FastAPI procesa webhook
15. BD registra/actualiza pago
16. BD cambia reserva a confirmada
17. React consulta reserva
18. Usuario ve pago confirmado
```

---

# 38. Pruebas de seguridad y errores

Comprobar:

```text
❌ Usuario sin JWT intenta crear reserva
❌ Usuario intenta consultar reserva de otro usuario
❌ Usuario modifica el precio desde DevTools
❌ Usuario intenta pagar una reserva ajena
❌ Usuario intenta pagar una reserva cancelada
❌ Servicio inexistente
❌ Servicio inactivo
❌ Cantidad de personas = 0
❌ Fecha inválida
❌ Webhook con firma incorrecta
❌ Evento Stripe duplicado
```

Todos deben ser rechazados correctamente.

---

# 39. Orden recomendado de implementación

## Fase 1 — Base de datos

- [ ] Revisar tablas actuales
- [ ] Crear/verificar `roles`
- [ ] Crear/verificar `permisos`
- [ ] Revisar `usuarios`
- [ ] Revisar `productos`
- [ ] Revisar `servicios`
- [ ] Crear `reservas`
- [ ] Crear `pagos`
- [ ] Comprobar relaciones
- [ ] Insertar datos de prueba

---

## Fase 2 — Modelos FastAPI

- [ ] Modelo `Reserva`
- [ ] Modelo `Pago`
- [ ] Relaciones SQLAlchemy
- [ ] Schemas Pydantic
- [ ] Migrar/actualizar BD si se utiliza sistema de migraciones

---

## Fase 3 — API de reservas

- [ ] Crear reserva
- [ ] Consultar reservas propias
- [ ] Consultar detalle
- [ ] Cancelar reserva
- [ ] Endpoints administrativos
- [ ] Validaciones
- [ ] Protección JWT
- [ ] Protección por rol

---

## Fase 4 — Stripe

- [ ] Crear cuenta/configuración de prueba
- [ ] Obtener claves Test
- [ ] Configurar `.env`
- [ ] Instalar SDK
- [ ] Crear servicio Stripe
- [ ] Crear Checkout Session
- [ ] Asociar metadata
- [ ] Guardar `stripe_checkout_session_id`

---

## Fase 5 — Webhooks

- [ ] Crear endpoint webhook
- [ ] Verificar firma
- [ ] Procesar `checkout.session.completed`
- [ ] Procesar pagos fallidos
- [ ] Procesar reembolsos si se implementan
- [ ] Hacer webhook idempotente
- [ ] Probar con Stripe CLI

---

## Fase 6 — Frontend

- [ ] Adaptar `TourDetail`
- [ ] Formulario de reserva
- [ ] Resumen de reserva
- [ ] Botón de pago
- [ ] Redirección a Stripe
- [ ] Página de éxito
- [ ] Página de cancelación
- [ ] Página Mis Reservas
- [ ] Detalle de reserva
- [ ] Estados visuales
- [ ] Loading/error states

---

## Fase 7 — Administración

- [ ] Página de reservas
- [ ] Detalle de reserva
- [ ] Página de pagos
- [ ] Filtros
- [ ] Estados
- [ ] Protección administrativa
- [ ] Estadísticas del dashboard

---

## Fase 8 — Pruebas

- [ ] Registro
- [ ] Login
- [ ] Crear reserva
- [ ] Pago exitoso
- [ ] Pago rechazado
- [ ] Cancelación
- [ ] Webhook
- [ ] Evento duplicado
- [ ] Acceso no autorizado
- [ ] Manipulación del precio
- [ ] Reserva ajena
- [ ] Servicio inactivo

---

# 40. Estados del sistema

## Reserva

```text
PENDIENTE
    │
    ├── pago exitoso ──→ CONFIRMADA
    │
    └── cancelación ───→ CANCELADA

CONFIRMADA
    │
    └── tour realizado ─→ COMPLETADA
```

## Pago

```text
PENDIENTE
    │
    ├── pago exitoso ──→ APROBADO
    │
    └── fallo ─────────→ RECHAZADO

APROBADO
    │
    └── devolución ────→ REEMBOLSADO
```

---

# 41. Consideraciones importantes

### No confiar en React

React solamente representa la interfaz.

Las decisiones importantes deben ocurrir en FastAPI:

```text
precio
usuario
reserva
estado
permisos
pago
```

### No confirmar el pago desde el frontend

La confirmación real debe venir del backend mediante Stripe/Webhook.

### No almacenar tarjetas

Stripe gestiona la información sensible del medio de pago.

### Mantener Stripe en Test Mode

Durante el desarrollo:

```text
Stripe Test
    ↓
Tarjetas de prueba
    ↓
Sin dinero real
```

---

# 42. Mejoras futuras

Una vez funcionando la versión inicial se podrían añadir:

- [ ] Cupos máximos por tour
- [ ] Disponibilidad por fecha
- [ ] Evitar sobre-reservas
- [ ] Código de reserva
- [ ] Correo de confirmación
- [ ] Recibo de pago
- [ ] Sistema de reembolsos
- [ ] Historial de pagos
- [ ] Cupones/descuentos
- [ ] Pago parcial
- [ ] Notificaciones
- [ ] Exportación de reservas
- [ ] Estadísticas de ventas
- [ ] Reportes administrativos

---

# 43. Estructura final esperada

```text
Wildlife
│
├── Frontend
│   ├── React
│   ├── Vite
│   ├── Tailwind
│   ├── AuthContext
│   ├── Tours
│   ├── Reservas
│   ├── Pagos
│   └── Panel Admin
│
├── Backend
│   ├── FastAPI
│   ├── JWT
│   ├── bcrypt
│   ├── SQLAlchemy
│   ├── CRUD
│   ├── Reservas API
│   ├── Pagos API
│   └── Stripe Webhook
│
└── Base de datos
    ├── roles
    ├── permisos
    ├── usuarios
    ├── productos
    ├── servicios
    ├── reservas
    └── pagos
```

# 44. Prioridad de desarrollo

La implementación debe hacerse en este orden:

```text
BASE DE DATOS
      ↓
MODELOS FASTAPI
      ↓
API RESERVAS
      ↓
FRONTEND RESERVAS
      ↓
STRIPE CHECKOUT
      ↓
WEBHOOK
      ↓
ACTUALIZACIÓN AUTOMÁTICA
      ↓
MIS RESERVAS
      ↓
PANEL ADMIN
      ↓
PRUEBAS
```

De esta forma se evita intentar integrar Stripe antes de tener correctamente definida la relación entre **usuario → servicio → reserva → pago**.
