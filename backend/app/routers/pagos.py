from __future__ import annotations

from collections.abc import Iterable
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..core.deps import get_current_user
from ..database import get_db
from ..models import Pedido, Producto, Servicio, Usuario
from ..schemas.pagos import CrearSesionRequest

try:
    import stripe
except ImportError:  # pragma: no cover
    stripe = None

if stripe is not None and settings.stripe_secret_key:
    stripe.api_key = settings.stripe_secret_key

router = APIRouter(prefix="/api", tags=["pagos"])


def _catalog_model(tipo: str):
    return Producto if tipo == "producto" else Servicio


def _build_success_url(pedido_ids: Iterable[int]) -> str:
    if settings.stripe_success_url:
        parsed = urlsplit(settings.stripe_success_url)
        query = dict(parse_qsl(parsed.query))
        query["pedido_ids"] = ",".join(str(pedido_id) for pedido_id in pedido_ids)
        if settings.stripe_mock_mode:
            query["mocked"] = "1"
        return urlunsplit(parsed._replace(query=urlencode(query)))

    return f"http://localhost:5173/pago-exitoso?pedido_ids={','.join(str(pedido_id) for pedido_id in pedido_ids)}"


def _build_cancel_url(pedido_ids: Iterable[int]) -> str:
    if settings.stripe_cancel_url:
        parsed = urlsplit(settings.stripe_cancel_url)
        query = dict(parse_qsl(parsed.query))
        query["pedido_ids"] = ",".join(str(pedido_id) for pedido_id in pedido_ids)
        return urlunsplit(parsed._replace(query=urlencode(query)))

    return f"http://localhost:5173/pago-cancelado?pedido_ids={','.join(str(pedido_id) for pedido_id in pedido_ids)}"


@router.post("/pagos/crear-sesion")
def create_checkout_session(
    payload: CrearSesionRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if settings.stripe_mock_mode or not settings.stripe_secret_key:
        orders = []
        for item in payload.items:
            model = _catalog_model(item.tipo)
            catalog_item = db.get(model, item.item_id)
            if not catalog_item or catalog_item.estado != 1:
                raise HTTPException(status_code=404, detail=f"{item.tipo.capitalize()} no encontrado")
            if item.cantidad > catalog_item.stock:
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para {catalog_item.nombre}")

            pedido = Pedido(
                usuario_id=current_user.id,
                tipo=item.tipo,
                referencia_id=item.item_id,
                cantidad=item.cantidad,
                monto_total=float(catalog_item.precio) * item.cantidad,
                moneda="COP",
                estado="pagado",
                stripe_session_id="mock_session",
            )
            db.add(pedido)
            db.flush()
            orders.append(pedido)

        db.commit()
        pedido_ids = [pedido.id for pedido in orders]
        return {
            "url": _build_success_url(pedido_ids),
            "pedido_ids": pedido_ids,
            "mock_mode": True,
        }

    if stripe is None:
        raise HTTPException(status_code=500, detail="La librería de Stripe no está instalada")

    line_items = []
    pedidos = []

    for item in payload.items:
        model = _catalog_model(item.tipo)
        catalog_item = db.get(model, item.item_id)
        if not catalog_item or catalog_item.estado != 1:
            raise HTTPException(status_code=404, detail=f"{item.tipo.capitalize()} no encontrado")
        if item.cantidad > catalog_item.stock:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {catalog_item.nombre}")

        precio_total = float(catalog_item.precio) * item.cantidad
        pedido = Pedido(
            usuario_id=current_user.id,
            tipo=item.tipo,
            referencia_id=item.item_id,
            cantidad=item.cantidad,
            monto_total=precio_total,
            moneda="COP",
            estado="pendiente",
        )
        db.add(pedido)
        db.flush()
        pedidos.append(pedido)

        line_items.append({
            "price_data": {
                "currency": "cop",
                "product_data": {
                    "name": catalog_item.nombre,
                    "description": catalog_item.descripcion or "Compra Wildlife",
                },
                "unit_amount": int(round(float(catalog_item.precio) * 100)),
            },
            "quantity": item.cantidad,
        })

    pedido_ids = [pedido.id for pedido in pedidos]
    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=line_items,
        success_url=_build_success_url(pedido_ids),
        cancel_url=_build_cancel_url(pedido_ids),
        customer_email=current_user.correo,
        metadata={"pedido_ids": ",".join(str(pedido_id) for pedido_id in pedido_ids)},
    )

    for pedido in pedidos:
        pedido.stripe_session_id = session.id
        pedido.estado = "pendiente"

    db.commit()
    return {"url": session.url, "pedido_ids": pedido_ids, "session_id": session.id, "mock_mode": False}


@router.post("/pagos/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    if settings.stripe_mock_mode:
        return JSONResponse(status_code=200, content={"received": True})

    if stripe is None:
        return JSONResponse(status_code=500, content={"message": "Stripe no disponible"})

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not sig_header or not settings.stripe_webhook_secret:
        return JSONResponse(status_code=400, content={"message": "Firma de Stripe requerida"})

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except ValueError:
        return JSONResponse(status_code=400, content={"message": "Payload inválido"})
    except stripe.error.SignatureVerificationError:
        return JSONResponse(status_code=400, content={"message": "Firma inválida"})

    event_type = event.get("type")
    session = event.get("data", {}).get("object", {})
    pedido_ids_raw = session.get("metadata", {}).get("pedido_ids") or session.get("metadata", {}).get("pedido_id")
    pedido_ids = [int(value) for value in str(pedido_ids_raw).split(",") if value.strip()]

    if event_type == "checkout.session.completed":
        for pedido in db.scalars(select(Pedido).where(Pedido.id.in_(pedido_ids))).all():
            if pedido.estado != "pagado":
                pedido.estado = "pagado"
                pedido.stripe_session_id = session.get("id")
        db.commit()

    elif event_type in {"checkout.session.expired", "checkout.session.async_payment_failed"}:
        for pedido in db.scalars(select(Pedido).where(Pedido.id.in_(pedido_ids))).all():
            if pedido.estado not in {"pagado", "cancelado"}:
                pedido.estado = "cancelado" if event_type == "checkout.session.expired" else "fallido"
                pedido.stripe_session_id = session.get("id")
        db.commit()

    return JSONResponse(status_code=200, content={"received": True})


@router.get("/pedidos/me")
def get_my_orders(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.scalars(
        select(Pedido)
        .where(Pedido.usuario_id == current_user.id)
        .order_by(Pedido.id.desc())
    ).all()
    return {"pedidos": [
        {
            "id": order.id,
            "tipo": order.tipo,
            "referencia_id": order.referencia_id,
            "cantidad": order.cantidad,
            "monto_total": float(order.monto_total),
            "moneda": order.moneda,
            "estado": order.estado,
            "stripe_session_id": order.stripe_session_id,
            "fecha_creacion": order.fecha_creacion.isoformat(),
        }
        for order in orders
    ]}


@router.get("/pedidos/{pedido_id}")
def get_order_detail(pedido_id: int, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    pedido = db.get(Pedido, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if pedido.usuario_id != current_user.id and current_user.rol_id not in (1, 2):
        raise HTTPException(status_code=403, detail="No tienes acceso a este pedido")

    return {
        "id": pedido.id,
        "usuario_id": pedido.usuario_id,
        "tipo": pedido.tipo,
        "referencia_id": pedido.referencia_id,
        "cantidad": pedido.cantidad,
        "monto_total": float(pedido.monto_total),
        "moneda": pedido.moneda,
        "estado": pedido.estado,
        "stripe_session_id": pedido.stripe_session_id,
        "fecha_creacion": pedido.fecha_creacion.isoformat(),
    }
