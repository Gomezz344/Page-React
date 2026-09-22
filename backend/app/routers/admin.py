from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.deps import require_roles
from ..database import get_db
from ..models import Pedido, Producto, Servicio, Usuario

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def stats(_: Usuario = Depends(require_roles(1, 2)), db: Session = Depends(get_db)):
    return {
        "usuarios": db.scalar(select(func.count()).select_from(Usuario)) or 0,
        "productos": db.scalar(select(func.count()).select_from(Producto)) or 0,
        "servicios": db.scalar(select(func.count()).select_from(Servicio)) or 0,
    }


@router.get("/sales-analytics")
def sales_analytics(
    _: Usuario = Depends(require_roles(1, 2)),
    db: Session = Depends(get_db),
    fecha_inicio: date | None = Query(default=None),
    fecha_fin: date | None = Query(default=None),
    producto_id: int | None = Query(default=None, gt=0),
    servicio_id: int | None = Query(default=None, gt=0),
    estado: str | None = Query(default=None, min_length=1, max_length=30),
    cliente_id: int | None = Query(default=None, gt=0),
    agrupacion: str = Query(default="dia", pattern="^(dia|semana|mes)$"),
):
    if fecha_inicio and fecha_fin and fecha_fin < fecha_inicio:
        raise HTTPException(status_code=400, detail="fecha_fin no puede ser anterior a fecha_inicio")

    query = select(Pedido)
    if fecha_inicio:
        query = query.where(Pedido.fecha_creacion >= datetime.combine(fecha_inicio, time.min))
    if fecha_fin:
        query = query.where(Pedido.fecha_creacion < datetime.combine(fecha_fin + timedelta(days=1), time.min))
    if estado:
        query = query.where(Pedido.estado == estado)
    if cliente_id:
        query = query.where(Pedido.usuario_id == cliente_id)
    if producto_id:
        query = query.where(Pedido.tipo == "producto", Pedido.referencia_id == producto_id)
    if servicio_id:
        query = query.where(Pedido.tipo == "servicio", Pedido.referencia_id == servicio_id)

    orders = db.scalars(query.order_by(Pedido.fecha_creacion, Pedido.id)).all()
    series = {}
    total = 0.0
    units = 0
    for order in orders:
        created = order.fecha_creacion
        if agrupacion == "mes":
            bucket = created.date().replace(day=1)
            label = bucket.strftime("%Y-%m")
        elif agrupacion == "semana":
            bucket = (created.date() - timedelta(days=created.weekday()))
            label = f"Semana {bucket.strftime('%Y-%m-%d')}"
        else:
            bucket = created.date()
            label = bucket.isoformat()
        if label not in series:
            series[label] = {"periodo": label, "ventas": 0, "unidades": 0, "total": 0.0}
        amount = float(order.monto_total or 0)
        series[label]["ventas"] += 1
        series[label]["unidades"] += order.cantidad
        series[label]["total"] += amount
        total += amount
        units += order.cantidad

    return {
        "indicadores": {
            "ventas": len(orders),
            "unidades": units,
            "total": round(total, 2),
            "promedio": round(total / len(orders), 2) if orders else 0,
        },
        "serie": list(series.values()),
        "filtros": {
            "fecha_inicio": fecha_inicio,
            "fecha_fin": fecha_fin,
            "producto_id": producto_id,
            "servicio_id": servicio_id,
            "estado": estado,
            "cliente_id": cliente_id,
            "agrupacion": agrupacion,
        },
    }
