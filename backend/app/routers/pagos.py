from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime
from io import BytesIO
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse, Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..config import settings
from ..core.deps import get_current_user
from ..database import get_db
from ..models import Factura, Pedido, Producto, Reserva, Servicio, StripeEvent, Usuario
from ..schemas.pagos import CrearSesionRequest

try:
    import stripe
except ImportError:  # pragma: no cover
    stripe = None

if stripe is not None and settings.stripe_secret_key:
    stripe.api_key = settings.stripe_secret_key

router = APIRouter(prefix="/api", tags=["pagos"])


def _stripe_dict(resource) -> dict:
    if hasattr(resource, "to_dict_recursive"):
        return resource.to_dict_recursive()
    if hasattr(resource, "to_dict"):
        return resource.to_dict()
    return resource if isinstance(resource, dict) else dict(resource)


def _ensure_invoice(db: Session, pedido: Pedido) -> Factura:
    invoice = db.scalar(select(Factura).where(Factura.pedido_id == pedido.id))
    if invoice:
        return invoice
    invoice = Factura(
        numero=f"FAC-{datetime.utcnow():%Y}-{pedido.id:06d}",
        pedido_id=pedido.id,
        usuario_id=pedido.usuario_id,
        subtotal=pedido.monto_total,
        total=pedido.monto_total,
        moneda=pedido.moneda,
        estado="emitida",
    )
    db.add(invoice)
    db.flush()
    return invoice


def _catalog_model(tipo: str):
    return Producto if tipo == "producto" else Servicio


def _decrement_stock(db: Session, pedido: Pedido) -> None:
    model = _catalog_model(pedido.tipo)
    item = db.get(model, pedido.referencia_id)
    if item is not None:
        item.stock = max(0, item.stock - pedido.cantidad)


def _build_success_url(pedido_ids: Iterable[int]) -> str:
    if settings.stripe_success_url:
        parsed = urlsplit(settings.stripe_success_url)
        query = dict(parse_qsl(parsed.query))
        query["pedido_ids"] = ",".join(str(pedido_id) for pedido_id in pedido_ids)
        if settings.stripe_mock_mode:
            query["mocked"] = "1"
        else:
            query["session_id"] = "{CHECKOUT_SESSION_ID}"
        success_url = urlunsplit(parsed._replace(query=urlencode(query)))
        return success_url.replace("%7BCHECKOUT_SESSION_ID%7D", "{CHECKOUT_SESSION_ID}")

    return f"http://localhost:5173/pago-exitoso?pedido_ids={','.join(str(pedido_id) for pedido_id in pedido_ids)}&session_id={{CHECKOUT_SESSION_ID}}"


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
    reserva = None
    if payload.reserva_id is not None:
        reserva = db.get(Reserva, payload.reserva_id)
        if not reserva or reserva.usuario_id != current_user.id:
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        if reserva.estado not in {"pendiente", "pendiente_pago"}:
            raise HTTPException(status_code=400, detail="La reserva ya fue procesada")
        if len(payload.items) != 1 or payload.items[0].tipo != "servicio" or payload.items[0].item_id != reserva.servicio_id:
            raise HTTPException(status_code=400, detail="El pago no coincide con la reserva")
        if payload.items[0].cantidad != reserva.cantidad_personas:
            raise HTTPException(status_code=400, detail="La cantidad no coincide con la reserva")

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
                reserva_id=payload.reserva_id if reserva is not None else None,
                cantidad=item.cantidad,
                monto_total=float(catalog_item.precio) * item.cantidad,
                moneda="COP",
                estado="pagado",
                stripe_session_id="mock_session",
            )
            db.add(pedido)
            db.flush()
            _decrement_stock(db, pedido)
            _ensure_invoice(db, pedido)
            orders.append(pedido)

        db.commit()
        if reserva is not None:
            reserva.estado = "confirmada"
            reserva.stripe_session_id = "mock_session"
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
            reserva_id=payload.reserva_id if reserva is not None else None,
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
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            success_url=_build_success_url(pedido_ids),
            cancel_url=_build_cancel_url(pedido_ids),
            customer_email=current_user.correo,
            metadata={"pedido_ids": ",".join(str(pedido_id) for pedido_id in pedido_ids)},
        )
    except stripe.error.StripeError as exc:
        db.rollback()
        raise HTTPException(status_code=502, detail="Stripe no está disponible en este momento") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=502, detail="No se pudo conectar con Stripe") from exc

    for pedido in pedidos:
        pedido.stripe_session_id = session.id
        pedido.estado = "pendiente"
    if reserva is not None:
        reserva.stripe_session_id = session.id
        reserva.estado = "pendiente_pago"

    db.commit()
    return {"url": session.url, "pedido_ids": pedido_ids, "session_id": session.id, "mock_mode": False}


def _mark_session_paid(db: Session, session: dict, current_user_id: int | None = None) -> list[int]:
    session = _stripe_dict(session)
    metadata = session.get("metadata") or {}
    raw_ids = metadata.get("pedido_ids") or metadata.get("pedido_id")
    if not raw_ids:
        return []
    try:
        pedido_ids = [int(value) for value in str(raw_ids).split(",") if value.strip()]
    except ValueError:
        return []
    orders = db.scalars(select(Pedido).where(Pedido.id.in_(pedido_ids))).all()
    if current_user_id is not None and any(order.usuario_id != current_user_id for order in orders):
        raise HTTPException(status_code=403, detail="La sesión de pago no pertenece a tu cuenta")
    for pedido in orders:
        invoice = db.scalar(select(Factura).where(Factura.pedido_id == pedido.id))
        if pedido.estado != "pagado":
            pedido.estado = "pagado"
        if invoice is None:
            _decrement_stock(db, pedido)
        pedido.stripe_session_id = session.get("id") or pedido.stripe_session_id
        if invoice is None:
            _ensure_invoice(db, pedido)
        if pedido.reserva_id:
            reserva = db.get(Reserva, pedido.reserva_id)
            if reserva:
                reserva.estado = "confirmada"
                reserva.stripe_session_id = pedido.stripe_session_id
    db.commit()
    return [pedido.id for pedido in orders]


@router.post("/pagos/verificar-sesion")
def verify_checkout_session(
    session_id: str = Query(min_length=8),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if stripe is None or not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe no está configurado")
    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="No se pudo verificar la sesión de Stripe") from exc
    session_data = _stripe_dict(session)
    if session_data.get("payment_status") != "paid":
        return {"paid": False, "status": session_data.get("payment_status", "unpaid")}
    try:
        pedido_ids = _mark_session_paid(db, session_data, current_user.id)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail="No se pudo asociar la sesión con el pedido") from exc
    return {"paid": True, "pedido_ids": pedido_ids}


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

    event = _stripe_dict(event)
    event_id = event.get("id")
    if event_id:
        already_received = db.scalar(select(StripeEvent).where(StripeEvent.event_id == str(event_id)))
        if already_received:
            return JSONResponse(status_code=200, content={"received": True, "duplicate": True})
        db.add(StripeEvent(
            event_id=str(event_id),
            event_type=str(event.get("type") or "unknown"),
        ))
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            return JSONResponse(status_code=200, content={"received": True, "duplicate": True})
    event_type = event.get("type")
    session = (event.get("data") or {}).get("object", {})
    session = _stripe_dict(session)
    if event_type == "checkout.session.completed":
        _mark_session_paid(db, session)

    elif event_type in {"checkout.session.expired", "checkout.session.async_payment_failed"}:
        metadata = session.get("metadata") or {}
        raw_ids = metadata.get("pedido_ids") or metadata.get("pedido_id")
        pedido_ids = []
        try:
            pedido_ids = [int(value) for value in str(raw_ids).split(",") if value.strip()] if raw_ids else []
        except ValueError:
            pedido_ids = []
        for pedido in db.scalars(select(Pedido).where(Pedido.id.in_(pedido_ids))).all():
            if pedido.estado not in {"pagado", "cancelado"}:
                pedido.estado = "cancelado" if event_type == "checkout.session.expired" else "fallido"
                pedido.stripe_session_id = session.get("id")
                if pedido.reserva_id:
                    reserva = db.get(Reserva, pedido.reserva_id)
                    if reserva:
                        reserva.estado = "cancelada"
        db.commit()

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


def _invoice_payload(invoice: Factura) -> dict:
    return {
        "id": invoice.id,
        "numero": invoice.numero,
        "pedido_id": invoice.pedido_id,
        "subtotal": float(invoice.subtotal),
        "total": float(invoice.total),
        "moneda": invoice.moneda,
        "estado": invoice.estado,
        "fecha_emision": invoice.fecha_emision.isoformat(),
    }


@router.get("/facturas/me")
def get_my_invoices(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    invoices = db.scalars(
        select(Factura).where(Factura.usuario_id == current_user.id).order_by(Factura.id.desc())
    ).all()
    return {"facturas": [_invoice_payload(invoice) for invoice in invoices]}


@router.get("/facturas/{factura_id}/download")
def download_invoice(factura_id: int, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    invoice = db.get(Factura, factura_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    if invoice.usuario_id != current_user.id and current_user.rol_id not in (1, 2):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta factura")

    return _invoice_download_response(invoice, current_user, db)


def _invoice_download_response(invoice: Factura, current_user: Usuario, db: Session) -> Response:
    order = db.get(Pedido, invoice.pedido_id)
    buffer = BytesIO()
    document = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    document.setFillColor(colors.HexColor("#17311f"))
    document.rect(0, height - 125, width, 125, fill=1, stroke=0)
    document.setFillColor(colors.HexColor("#dfead3"))
    document.setFont("Helvetica-Bold", 22)
    document.drawString(54, height - 62, "WILDLIFE")
    document.setFont("Helvetica", 10)
    document.drawString(54, height - 82, "FACTURA DE VENTA")
    document.setFillColor(colors.HexColor("#222222"))
    document.setFont("Helvetica-Bold", 12)
    document.drawString(54, height - 170, invoice.numero)
    document.setFont("Helvetica", 10)
    lines = [
        ("Fecha de emisión", f"{invoice.fecha_emision:%Y-%m-%d %H:%M}"),
        ("Cliente", f"{current_user.nombre} {current_user.apellido}"),
        ("Correo", current_user.correo),
        ("Pedido", f"#{invoice.pedido_id}"),
        ("Concepto", order.tipo if order else "Compra Wildlife"),
        ("Cantidad", str(order.cantidad if order else 1)),
        ("Estado", invoice.estado),
    ]
    y = height - 205
    for label, value in lines:
        document.setFillColor(colors.HexColor("#777777"))
        document.drawString(54, y, f"{label}:" )
        document.setFillColor(colors.HexColor("#222222"))
        document.drawString(170, y, value[:85])
        y -= 23
    document.setStrokeColor(colors.HexColor("#c9d5bd"))
    document.line(54, y - 8, width - 54, y - 8)
    y -= 42
    document.setFillColor(colors.HexColor("#555555"))
    document.drawString(54, y, "Subtotal")
    document.drawRightString(width - 54, y, f"{invoice.subtotal:,.0f} {invoice.moneda}")
    y -= 28
    document.setFillColor(colors.HexColor("#17311f"))
    document.setFont("Helvetica-Bold", 13)
    document.drawString(54, y, "TOTAL")
    document.drawRightString(width - 54, y, f"{invoice.total:,.0f} {invoice.moneda}")
    document.setFont("Helvetica", 9)
    document.setFillColor(colors.HexColor("#777777"))
    document.drawString(54, 48, "Gracias por apoyar experiencias responsables con la naturaleza.")
    document.save()
    content = buffer.getvalue()
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{invoice.numero}.pdf"'},
    )


@router.get("/facturas/pedido/{pedido_id}/download")
def download_order_invoice(pedido_id: int, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.get(Pedido, pedido_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if order.usuario_id != current_user.id and current_user.rol_id not in (1, 2):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta factura")
    invoice = db.scalar(select(Factura).where(Factura.pedido_id == pedido_id))
    if not invoice and order.estado == "pagado":
        invoice = _ensure_invoice(db, order)
        db.commit()
    if not invoice:
        raise HTTPException(status_code=404, detail="La factura estará disponible al confirmarse el pago")
    return _invoice_download_response(invoice, current_user, db)
