# Despliegue seguro de Wildlife

## Estado actual

- Base de datos: PostgreSQL (usa `postgresql+psycopg://...`).
- Pagos: Stripe Checkout con webhook firmado e idempotencia por `event_id`.
- Facturas: PDF generado en el backend, protegido por autenticación y pertenencia al pedido.
- API: CORS restringible, hosts confiables, documentación desactivada en producción y cabeceras de seguridad.
- Stripe en modo prueba: válido para desarrollo y staging; no cobra tarjetas reales.

El archivo [render.yaml](render.yaml) ya define el despliegue de demostración en Render: API FastAPI, frontend estático y PostgreSQL.

## Despliegue rápido en Render

1. Sube el repositorio a GitHub sin incluir `backend/.env` ni `page/.env`.
2. En Render selecciona **New > Blueprint** y conecta el repositorio. Render leerá `render.yaml`.
3. Completa los valores secretos solicitados (`STRIPE_*`, `OPENAI_API_KEY`) y las URLs después de conocer los subdominios generados.
4. En la API configura `CORS_ORIGINS` con la URL del frontend y `TRUSTED_HOSTS` con el hostname del backend.
5. En el frontend configura `VITE_API_URL=https://<backend>.onrender.com/api` y `VITE_STRIPE_PUBLIC_KEY=pk_test_...`; vuelve a desplegar para que Vite compile esos valores.
6. En Stripe Test crea un webhook hacia `https://<backend>.onrender.com/api/pagos/webhook` con `checkout.session.completed`, `checkout.session.expired` y `checkout.session.async_payment_failed`. Copia el `whsec_...` en Render.
7. Comprueba `https://<backend>.onrender.com/health` antes de abrir la exposición.

## Antes del primer despliegue

1. Revoca y regenera cualquier clave que haya aparecido en chats, capturas, logs o commits. Las claves nuevas solo van en variables secretas del proveedor.
2. Crea una base PostgreSQL administrada y un usuario sin privilegios de superusuario. Configura `DATABASE_URL` con SSL si el proveedor lo exige.
3. Configura el backend con `APP_ENV=production`, una `SECRET_KEY` aleatoria de al menos 32 caracteres, `EXPOSE_RESET_TOKEN=false`, `TRUSTED_HOSTS` con el dominio de la API y `CORS_ORIGINS` únicamente con el dominio del frontend HTTPS.
4. Configura SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`) y `FRONTEND_URL`; sin SMTP no se habilita recuperación de contraseña en producción.
5. Configura `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` del mismo entorno. En staging pueden ser `sk_test_...` y `whsec_...`; en producción real serán claves Live.
6. Cambia `STRIPE_SUCCESS_URL` y `STRIPE_CANCEL_URL` a URLs HTTPS del frontend.
7. Ejecuta las pruebas antes de construir:

   ```powershell
   cd backend
   .\venv\Scripts\python.exe -m pytest -q
   cd ..\page
   npm ci
   npm run build
   ```

8. Arranca el backend con un servidor de producción (por ejemplo `uvicorn app.main:app --host 0.0.0.0 --port $env:PORT`) y comprueba `GET /health`.
9. Configura el webhook público en Stripe con `checkout.session.completed`, `checkout.session.expired` y `checkout.session.async_payment_failed`. La CLI solo se usa localmente:

   ```powershell
   stripe listen --events checkout.session.completed,checkout.session.expired,checkout.session.async_payment_failed --forward-to localhost:8000/api/pagos/webhook
   ```

## Verificaciones de seguridad

- No se aceptan hosts ajenos a `TRUSTED_HOSTS`.
- No se permiten orígenes localhost ni claves `sk_test_` cuando `APP_ENV=production`.
- El endpoint de webhook exige la firma de Stripe y descarta eventos repetidos.
- El precio se calcula en el servidor; nunca se confía en el precio enviado por React.
- El stock se descuenta una sola vez al confirmar el pago.
- Las rutas de pedidos, facturas y reportes comprueban usuario/rol.
- Las facturas descargadas son `application/pdf`, no texto.
- El token de recuperación no se devuelve en producción; es obligatorio conectar un proveedor de correo antes de activar recuperación de contraseña allí.

## Observabilidad y operación

Configura logs centralizados, alertas para respuestas 5xx, errores de webhook y conexiones a PostgreSQL. Haz copias de seguridad automáticas de PostgreSQL y prueba una restauración. No registres tokens, claves, payloads completos de Stripe ni contraseñas.

## Prueba de aceptación

En staging usa una tarjeta de prueba como `4242 4242 4242 4242`, verifica que el pedido pase a `pagado`, que aparezca la factura PDF y que un segundo envío del mismo webhook no cree otra factura ni vuelva a descontar stock. Verifica también cancelación y pago rechazado.
