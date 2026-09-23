from datetime import date, datetime, time, timedelta
from io import StringIO
import csv

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.deps import require_roles
from ..database import get_db
from ..models import Pedido, Producto, ReporteVenta, Servicio, Usuario

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


def _filtered_sales_query(
    fecha_inicio: date | None,
    fecha_fin: date | None,
    producto_id: int | None,
    servicio_id: int | None,
    estado: str | None,
    cliente_id: int | None,
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
    return query.order_by(Pedido.fecha_creacion, Pedido.id)


@router.get("/sales-report.csv")
def download_sales_report(
    current_admin: Usuario = Depends(require_roles(1, 2)),
    db: Session = Depends(get_db),
    fecha_inicio: date | None = Query(default=None),
    fecha_fin: date | None = Query(default=None),
    producto_id: int | None = Query(default=None, gt=0),
    servicio_id: int | None = Query(default=None, gt=0),
    estado: str | None = Query(default=None, min_length=1, max_length=30),
    cliente_id: int | None = Query(default=None, gt=0),
):
    orders = db.scalars(_filtered_sales_query(fecha_inicio, fecha_fin, producto_id, servicio_id, estado, cliente_id)).all()
    products = {item.id: item.nombre for item in db.scalars(select(Producto)).all()}
    services = {item.id: item.nombre for item in db.scalars(select(Servicio)).all()}
    users = {item.id: f"{item.nombre} {item.apellido}" for item in db.scalars(select(Usuario)).all()}
    total = sum(float(order.monto_total or 0) for order in orders)
    units = sum(order.cantidad for order in orders)
    filters = {
        "fecha_inicio": fecha_inicio.isoformat() if fecha_inicio else None,
        "fecha_fin": fecha_fin.isoformat() if fecha_fin else None,
        "producto_id": producto_id,
        "servicio_id": servicio_id,
        "estado": estado,
        "cliente_id": cliente_id,
    }
    report = ReporteVenta(
        administrador_id=current_admin.id,
        nombre="Reporte de ventas",
        filtros=filters,
        ventas=len(orders),
        unidades=units,
        total=total,
    )
    db.add(report)
    db.commit()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Reporte Wildlife", "", "", "", ""])
    writer.writerow(["Generado", report.fecha_generacion.isoformat(), "Ventas", len(orders), "Total", total])
    writer.writerow(["Pedido", "Fecha", "Cliente", "Tipo", "Concepto", "Cantidad", "Estado", "Total", "Moneda"])
    for order in orders:
        catalog = products if order.tipo == "producto" else services
        writer.writerow([
            order.id, order.fecha_creacion.isoformat(), users.get(order.usuario_id, ""), order.tipo,
            catalog.get(order.referencia_id, ""), order.cantidad, order.estado,
            float(order.monto_total or 0), order.moneda,
        ])
    filename = f"wildlife-reporte-ventas-{report.id}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/sales-reports")
def list_sales_reports(current_admin: Usuario = Depends(require_roles(1, 2)), db: Session = Depends(get_db)):
    reports = db.scalars(
        select(ReporteVenta).where(ReporteVenta.administrador_id == current_admin.id).order_by(ReporteVenta.id.desc()).limit(30)
    ).all()
    return {"reportes": [{
        "id": report.id,
        "nombre": report.nombre,
        "ventas": report.ventas,
        "unidades": report.unidades,
        "total": float(report.total),
        "filtros": report.filtros,
        "fecha_generacion": report.fecha_generacion.isoformat(),
    } for report in reports]}
