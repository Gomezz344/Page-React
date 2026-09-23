# Plan de trabajo — Pasarela de pago con Stripe (modo prueba)

## 0. Contexto y alcance

Se integrará Stripe sobre el backend FastAPI + PostgreSQL (`wildlife_db`) y el frontend React + Vite, para permitir el pago de **productos** y **servicios** (Tours).

Como la cuenta de Stripe está **sin activar (modo prueba)**, todo el desarrollo se hace con las llaves `pk_test_...` / `sk_test_...` y tarjetas de prueba — no se puede cobrar dinero real hasta activar la cuenta, pero **toda la integración técnica funciona igual en modo test que en modo real** (solo cambian las llaves al final).

Se usará **Stripe Checkout** (páginas de pago alojadas por Stripe) por ser la opción más simple y segura para empezar: evita manejar datos de tarjeta directamente y ya trae validaciones y estilos listos.

## 1. Arquitectura del flujo de pago

```
React (botón "Pagar")
   → POST /api/pagos/crear-sesion   (FastAPI)
        → Stripe API: crea Checkout Session (test mode)
   ← devuelve { url: "https://checkout.stripe.com/..." }
React redirige al usuario a esa url
   → Usuario paga con tarjeta de prueba en Stripe
   → Stripe redirige de vuelta a /pago-exitoso o /pago-cancelado
   → (en paralelo) Stripe envía un webhook a
        POST /api/pagos/webhook   (FastAPI)
        → Verifica la firma del evento
        → Actualiza el estado del pedido en la base de datos
```

El webhook es la fuente de verdad del pago (no la redirección del navegador), porque el usuario puede cerrar la pestaña antes de volver.

## 2. Fases de trabajo

### Fase 1 — Cuenta y llaves de prueba
- [ ] Crear cuenta en Stripe (aunque quede "no activa", el modo test funciona sin activarla).
- [ ] Copiar del Dashboard (en modo **Test**): `Publishable key` (`pk_test_...`) y `Secret key` (`sk_test_...`).
- [ ] Instalar la [Stripe CLI](https://stripe.com/docs/stripe-cli) para probar webhooks en local (`stripe login`, `stripe listen`).

### Fase 2 — Dependencias
- [ ] Backend: agregar `stripe` a `requirements.txt`.
- [ ] Frontend: agregar `@stripe/stripe-js` (solo se usa para redirigir a Checkout, no hace falta `react-stripe-js` si no se hace formulario de tarjeta embebido).

### Fase 3 — Variables de entorno
- [ ] Backend (`.env`):
  ```
  STRIPE_SECRET_KEY=sk_test_xxxxxxxx
  STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
  STRIPE_SUCCESS_URL=http://localhost:5173/pago-exitoso
  STRIPE_CANCEL_URL=http://localhost:5173/pago-cancelado
  ```
- [ ] Frontend (`.env`):
  ```
  VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxx
  ```
- [ ] Confirmar que ninguna de estas llaves quede commiteada en el repo (`.gitignore` sobre `.env`).

### Fase 4 — Modelo de datos: pedidos/pagos
- [ ] Nueva tabla `pedidos` (o `ordenes`) en PostgreSQL:
  - `id`, `usuario_id` (FK a `usuarios`), `tipo` (`producto` o `servicio`), `referencia_id` (FK al producto/servicio), `cantidad`, `monto_total`, `moneda`, `estado` (`pendiente`, `pagado`, `fallido`, `cancelado`), `stripe_session_id`, `fecha_creacion`.
- [ ] Modelo SQLAlchemy + schema Pydantic correspondientes, siguiendo el mismo patrón del resto del backend.

### Fase 5 — Endpoint: crear sesión de pago
- [ ] `POST /api/pagos/crear-sesion` (requiere usuario autenticado):
  - Recibe `{ tipo, referencia_id, cantidad }`.
  - Busca el producto/servicio en la BD y toma el precio **desde el backend** (nunca confiar en un precio que venga del frontend, para evitar manipulación).
  - Crea un registro en `pedidos` con estado `pendiente`.
  - Llama a `stripe.checkout.Session.create(...)` con `mode="payment"`, `line_items` (nombre, precio en centavos, cantidad), `success_url`, `cancel_url`, y `metadata={ pedido_id }`.
  - Responde `{ url: session.url }`.

### Fase 6 — Webhook de confirmación
- [ ] `POST /api/pagos/webhook` (ruta pública, sin JWT, protegida por firma de Stripe):
  - Verifica la firma con `stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)`.
  - Escucha el evento `checkout.session.completed`: marca el pedido (`metadata.pedido_id`) como `pagado`.
  - Escucha `checkout.session.expired` / pagos fallidos para marcar `fallido`/`cancelado`.
  - Responde 200 rápido (Stripe reintenta si no recibe respuesta a tiempo).

### Fase 7 — Endpoints de consulta
- [ ] `GET /api/pedidos/me` — historial de pedidos del usuario autenticado (para mostrarlo en `Profile.jsx` más adelante).
- [ ] `GET /api/pedidos/{id}` — detalle de un pedido puntual (validando que sea del usuario dueño o de un admin).

### Fase 8 — Frontend: botón de pago
- [ ] Agregar un botón "Comprar" / "Reservar" en `Productos`/`Tours`/`TourDetail` que:
  1. Llama a `POST /api/pagos/crear-sesion`.
  2. Redirige con `window.location.href = data.url` (no hace falta `stripe.redirectToCheckout`, que ya está deprecado en favor de usar directamente la `url` devuelta por la sesión).
- [ ] Crear página `PagoExitoso.jsx` y `PagoCancelado.jsx` (rutas nuevas en `App.jsx`), coherentes con el estilo visual ya existente.
- [ ] `PagoExitoso.jsx` puede llamar a `GET /api/pedidos/{id}` para mostrar el resumen (sin confiar solo en el parámetro de la URL, ya que el estado real lo define el webhook).

### Fase 9 — Pruebas en modo test
- [ ] Correr `stripe listen --forward-to localhost:8000/api/pagos/webhook` mientras se desarrolla, para recibir eventos localmente.
- [ ] Probar con tarjetas de prueba de Stripe:
  - Pago exitoso: `4242 4242 4242 4242`
  - Pago rechazado: `4000 0000 0000 0002`
  - Requiere autenticación 3D Secure: `4000 0025 0000 3155`
  - Cualquier fecha futura y cualquier CVC de 3 dígitos.
- [ ] Verificar que el estado en la tabla `pedidos` cambie correctamente según el resultado.
- [ ] Probar el caso de cierre de pestaña antes de volver (el webhook debe igual actualizar el pedido).

### Fase 10 — Seguridad y buenas prácticas
- [ ] Nunca exponer `STRIPE_SECRET_KEY` en el frontend (solo la `pk_test_...` pública va ahí).
- [ ] Calcular siempre el monto en el backend, no confiar en el precio enviado desde React.
- [ ] Verificar la firma del webhook (evita que cualquiera falsifique un "pago exitoso" llamando directo al endpoint).
- [ ] Idempotencia: si Stripe reenvía el mismo evento, no duplicar la actualización (chequear si el pedido ya está en estado `pagado` antes de reprocesar).
- [ ] Loggear los eventos de Stripe recibidos para poder depurar sin exponer datos sensibles.

### Fase 11 — Camino a producción (cuando se active la cuenta)
- [ ] Repetir el proceso de llaves pero en modo **Live** (`pk_live_...` / `sk_live_...`).
- [ ] Configurar el webhook real desde el Dashboard de Stripe (apuntando al dominio de producción) en vez de la Stripe CLI.
- [ ] Activar la cuenta de Stripe (datos fiscales/bancarios) solo cuando se vaya a cobrar dinero real — no bloquea nada del desarrollo actual.

## 3. Dependencias a agregar

**Backend (`requirements.txt`):**
```
stripe
```

**Frontend (`package.json`):**
```
@stripe/stripe-js
```

## 4. Orden de ejecución recomendado

1. Fase 1-3: cuenta, dependencias y variables de entorno.
2. Fase 4: tabla `pedidos` (depende de que ya existan `usuarios`, `productos`, `servicios` del backend base).
3. Fase 5-6: crear sesión + webhook (el corazón del flujo, probar con Stripe CLI antes de tocar el frontend).
4. Fase 7: endpoints de consulta.
5. Fase 8: integración visual en el frontend.
6. Fase 9-10: pruebas con tarjetas de test y hardening de seguridad.
7. Fase 11: solo al final, cuando se decida activar cobros reales.
