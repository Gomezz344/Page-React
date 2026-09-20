# Plan de trabajo — PostgreSQL para Wildlife

## Objetivo
Completar la migración de MySQL/MariaDB a PostgreSQL e integrar PostgreSQL con **FastAPI**, manteniendo React + Tailwind funcionando. El despliegue queda para una fase posterior.

## 1. Verificación de PostgreSQL
- [x] PostgreSQL instalado.
- [x] pgAdmin instalado.
- [x] Puerto `5432`.
- [x] Base `wildlife_db` creada.
- [x] Script de migración ejecutado.
- [ ] Comprobar tablas, PK, FK, índices, UNIQUE e identidades.
- [ ] Comprobar datos migrados.

Tablas:
`roles`, `usuarios`, `permisos`, `rol_permisos`, `productos`, `servicios`, `carrito_items`, `password_reset_tokens`, `pedidos`, `reservas`, `pagos`.

## 2. Preparar FastAPI
Instalar:
```bash
pip install sqlalchemy psycopg[binary]
```
Si existe `requirements.txt`, actualizarlo.

Crear `.env`:
```env
DATABASE_URL=postgresql+psycopg://postgres:TU_PASSWORD@localhost:5432/wildlife_db
```
- [ ] No guardar credenciales en el código.
- [ ] Añadir `.env` a `.gitignore`.

## 3. Conexión SQLAlchemy
Crear/adaptar `database.py`:
- [ ] Engine PostgreSQL.
- [ ] Session/SessionLocal.
- [ ] Dependencia de sesión para FastAPI.
- [ ] Probar `SELECT 1`.
- [ ] Confirmar conexión desde un endpoint o prueba local.

Flujo:
```text
FastAPI → SQLAlchemy → psycopg → PostgreSQL
```

## 4. Modelos SQLAlchemy
Crear/adaptar modelos:
```text
models/
├── rol.py
├── permiso.py
├── usuario.py
├── producto.py
├── servicio.py
├── carrito_item.py
├── password_reset_token.py
├── pedido.py
├── reserva.py
└── pago.py
```

Relaciones:
```text
Rol 1:N Usuario
Rol N:N Permiso (rol_permisos)
Usuario 1:N CarritoItem
Usuario 1:N Reserva
Servicio 1:N Reserva
Reserva 1:N Pago
Usuario 1:N PasswordResetToken
```

## 5. Autenticación
- [ ] Registro.
- [ ] Login.
- [ ] JWT.
- [ ] Bcrypt.
- [ ] Consulta del usuario autenticado.
- [ ] Roles y permisos.
- [ ] Middleware de autenticación/autorización.
- [ ] Recuperación de contraseña.
- [ ] Tokens de recuperación.

Verificar:
```text
usuarios.rol_id → roles.id
```

Roles actuales:
```text
1 = Administrador
2 = Empleado
3 = Cliente
```

## 6. CRUD de usuarios
- [ ] GET usuarios.
- [ ] GET usuario por ID.
- [ ] POST.
- [ ] PUT.
- [ ] DELETE.
- [ ] Activar/desactivar.
- [ ] Restricciones por rol.
- [ ] Protección para evitar que un administrador se elimine/modifique indebidamente a sí mismo.
- [ ] Probar desde Admin de React.

## 7. CRUD de productos
- [ ] GET.
- [ ] POST.
- [ ] PUT.
- [ ] DELETE.
- [ ] Validar nombre, descripción, precio, imagen, stock y estado.
- [ ] Probar panel Admin.

## 8. CRUD de servicios/tours
Endpoints objetivo:
```text
GET    /api/servicios
GET    /api/servicios/{id}
POST   /api/servicios
PUT    /api/servicios/{id}
DELETE /api/servicios/{id}
```
- [ ] Validar precio, duración, imagen, stock/cupos, estado y descripción.
- [ ] Probar Explore, Tours y TourDetail.

## 9. Carrito
- [ ] Consultar carrito.
- [ ] Agregar producto/servicio.
- [ ] Modificar cantidad.
- [ ] Eliminar.
- [ ] Vaciar.
- [ ] Validar usuario autenticado.
- [ ] Validar existencia y estado del artículo.

### Nota sobre `carrito_items`
Actualmente usa `tipo + item_id` para referirse a productos o servicios. PostgreSQL no puede crear una FK tradicional hacia dos tablas.

Por ahora:
```text
tipo=producto → validar productos.id
tipo=servicio → validar servicios.id
```
desde FastAPI.

Más adelante se puede normalizar a `producto_id`/`servicio_id` con FKs reales si resulta conveniente.

## 10. Reservas
Relación:
```text
usuarios → reservas ← servicios
```

Campos:
```text
id
usuario_id
servicio_id
fecha_reserva
cantidad_personas
precio_unitario
monto_total
moneda
estado
notas
fecha_creacion
fecha_actualizacion
```

Estados:
```text
pendiente
confirmada
pagada
cancelada
completada
```

Endpoints:
```text
POST   /api/reservas
GET    /api/reservas
GET    /api/reservas/{id}
PUT    /api/reservas/{id}
DELETE /api/reservas/{id}
```

Validar:
- [ ] Usuario existente.
- [ ] Servicio existente y activo.
- [ ] Cantidad válida.
- [ ] Precio calculado en backend.
- [ ] Usuario no puede modificar reservas ajenas.
- [ ] Permisos de administrador/empleado.

## 11. Pagos
Relación:
```text
reservas 1:N pagos
```

Campos principales:
```text
id
reserva_id
proveedor
stripe_session_id
stripe_payment_intent_id
monto
moneda
estado
fecha_creacion
fecha_pago
```

Estados:
```text
pendiente
procesando
pagado
fallido
cancelado
reembolsado
```

- [ ] Crear registro de pago.
- [ ] Evitar duplicados de Stripe.
- [ ] Relacionar pago con reserva.
- [ ] Preparar integración Stripe.
- [ ] Implementar webhook posteriormente.

## 12. Revisar `pedidos`
La base original tenía `pedidos`. Antes de eliminarlo:
- [ ] Revisar cómo lo utiliza actualmente el backend/frontend.
- [ ] Decidir si `pedidos` queda para compras de productos.
- [ ] Usar `reservas` para tours/servicios.
- [ ] Migrar/eliminar solo cuando no haya dependencias.

## 13. Pruebas
### Base de datos
- [ ] Crear/editar/eliminar registros.
- [ ] Probar FKs.
- [ ] Probar UNIQUE.
- [ ] Probar cascadas.
- [ ] Probar identidades/autoincrementos.
- [ ] Comprobar datos migrados.

### Backend
- [ ] Auth.
- [ ] Usuarios.
- [ ] Productos.
- [ ] Servicios.
- [ ] Carrito.
- [ ] Reservas.
- [ ] Pagos.

### Frontend
- [ ] Login/registro.
- [ ] Perfil.
- [ ] Explore.
- [ ] Tours.
- [ ] Detalle.
- [ ] Carrito.
- [ ] Admin y sus CRUD.

## 14. Limpieza
- [ ] Eliminar código específico de MySQL/MariaDB.
- [ ] Eliminar dependencias innecesarias.
- [ ] Revisar consultas SQL manuales.
- [ ] Actualizar `requirements.txt`.
- [ ] Crear `.env.example`.
- [ ] Revisar `.gitignore`.
- [ ] Actualizar documentación.

## Orden de implementación
```text
1. Verificar PostgreSQL
       ↓
2. database.py
       ↓
3. SQLAlchemy
       ↓
4. Modelos y relaciones
       ↓
5. Autenticación
       ↓
6. Usuarios
       ↓
7. Productos
       ↓
8. Servicios
       ↓
9. Carrito
       ↓
10. Reservas
       ↓
11. Pagos
       ↓
12. Stripe
       ↓
13. Pruebas
       ↓
14. Limpieza
```

## Criterio de terminado
La migración estará completa cuando FastAPI utilice PostgreSQL correctamente y funcionen autenticación, roles, CRUD, servicios, productos, carrito, reservas y pagos sin depender de MySQL/MariaDB.

> El despliegue a producción se tratará después. Aun así, desde ahora las credenciales y configuraciones deben estar separadas mediante variables de entorno.
