from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.deps import get_current_user
from ..database import get_db
from ..models import Reserva, Servicio, Usuario
from ..schemas.reserva import ReservaCreate, ReservaOut, ReservaUpdate

router = APIRouter(prefix="/api/reservas", tags=["reservas"])


@router.post("", response_model=ReservaOut, status_code=status.HTTP_201_CREATED)
def create_reserva(
    payload: ReservaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    servicio = db.get(Servicio, payload.servicio_id)
    if not servicio or servicio.estado != 1:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    if payload.cantidad_personas > servicio.stock:
        raise HTTPException(status_code=400, detail="No hay suficientes cupos para esta reserva")

    if payload.fecha_fin and payload.fecha_fin < payload.fecha_inicio:
        raise HTTPException(status_code=400, detail="La fecha de fin no puede ser anterior a la de inicio")

    total = float(servicio.precio) * payload.cantidad_personas
    reserva = Reserva(
        usuario_id=current_user.id,
        servicio_id=servicio.id,
        cantidad_personas=payload.cantidad_personas,
        fecha_inicio=payload.fecha_inicio,
        fecha_fin=payload.fecha_fin,
        monto_total=total,
        moneda="COP",
        estado="pendiente",
        notas=payload.notas,
    )
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return reserva


@router.get("", response_model=dict)
def list_reservas(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.rol_id not in (1, 2):
        raise HTTPException(status_code=403, detail="No tienes permisos para listar reservas")

    reservas = db.scalars(select(Reserva).order_by(Reserva.id.desc())).all()
    return {"reservas": [
        {
            "id": reserva.id,
            "usuario_id": reserva.usuario_id,
            "servicio_id": reserva.servicio_id,
            "cantidad_personas": reserva.cantidad_personas,
            "fecha_inicio": str(reserva.fecha_inicio),
            "fecha_fin": str(reserva.fecha_fin) if reserva.fecha_fin else None,
            "monto_total": float(reserva.monto_total),
            "moneda": reserva.moneda,
            "estado": reserva.estado,
            "notas": reserva.notas,
            "stripe_session_id": reserva.stripe_session_id,
            "fecha_creacion": reserva.fecha_creacion.isoformat(),
        }
        for reserva in reservas
    ]}


@router.get("/me", response_model=dict)
def my_reservas(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reservas = db.scalars(
        select(Reserva).where(Reserva.usuario_id == current_user.id).order_by(Reserva.id.desc())
    ).all()
    return {"reservas": [
        {
            "id": reserva.id,
            "usuario_id": reserva.usuario_id,
            "servicio_id": reserva.servicio_id,
            "cantidad_personas": reserva.cantidad_personas,
            "fecha_inicio": str(reserva.fecha_inicio),
            "fecha_fin": str(reserva.fecha_fin) if reserva.fecha_fin else None,
            "monto_total": float(reserva.monto_total),
            "moneda": reserva.moneda,
            "estado": reserva.estado,
            "notas": reserva.notas,
            "stripe_session_id": reserva.stripe_session_id,
            "fecha_creacion": reserva.fecha_creacion.isoformat(),
        }
        for reserva in reservas
    ]}


@router.get("/{reserva_id}", response_model=dict)
def get_reserva(
    reserva_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reserva = db.get(Reserva, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if reserva.usuario_id != current_user.id and current_user.rol_id not in (1, 2):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta reserva")

    return {
        "id": reserva.id,
        "usuario_id": reserva.usuario_id,
        "servicio_id": reserva.servicio_id,
        "cantidad_personas": reserva.cantidad_personas,
        "fecha_inicio": str(reserva.fecha_inicio),
        "fecha_fin": str(reserva.fecha_fin) if reserva.fecha_fin else None,
        "monto_total": float(reserva.monto_total),
        "moneda": reserva.moneda,
        "estado": reserva.estado,
        "notas": reserva.notas,
        "stripe_session_id": reserva.stripe_session_id,
        "fecha_creacion": reserva.fecha_creacion.isoformat(),
    }


@router.put("/{reserva_id}", response_model=dict)
def update_reserva(
    reserva_id: int,
    payload: ReservaUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reserva = db.get(Reserva, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if reserva.usuario_id != current_user.id and current_user.rol_id not in (1, 2):
        raise HTTPException(status_code=403, detail="No tienes permisos para editar esta reserva")

    if payload.servicio_id is not None:
        servicio = db.get(Servicio, payload.servicio_id)
        if not servicio or servicio.estado != 1:
            raise HTTPException(status_code=404, detail="Servicio no encontrado")
        reserva.servicio_id = servicio.id

    if payload.cantidad_personas is not None:
        if payload.cantidad_personas <= 0:
            raise HTTPException(status_code=400, detail="La cantidad de personas debe ser mayor a cero")
        reserva.cantidad_personas = payload.cantidad_personas

    if payload.fecha_inicio is not None:
        reserva.fecha_inicio = payload.fecha_inicio
    if payload.fecha_fin is not None:
        reserva.fecha_fin = payload.fecha_fin
    if payload.notas is not None:
        reserva.notas = payload.notas
    if payload.estado is not None:
        if current_user.rol_id not in (1, 2):
            raise HTTPException(status_code=403, detail="Solo administradores pueden cambiar el estado")
        reserva.estado = payload.estado

    if reserva.fecha_fin and reserva.fecha_fin < reserva.fecha_inicio:
        raise HTTPException(status_code=400, detail="La fecha de fin no puede ser anterior a la de inicio")

    if reserva.servicio_id:
        servicio = db.get(Servicio, reserva.servicio_id)
        if servicio:
            reserva.monto_total = float(servicio.precio) * reserva.cantidad_personas

    db.commit(); db.refresh(reserva)
    return {
        "id": reserva.id,
        "usuario_id": reserva.usuario_id,
        "servicio_id": reserva.servicio_id,
        "cantidad_personas": reserva.cantidad_personas,
        "fecha_inicio": str(reserva.fecha_inicio),
        "fecha_fin": str(reserva.fecha_fin) if reserva.fecha_fin else None,
        "monto_total": float(reserva.monto_total),
        "moneda": reserva.moneda,
        "estado": reserva.estado,
        "notas": reserva.notas,
        "stripe_session_id": reserva.stripe_session_id,
        "fecha_creacion": reserva.fecha_creacion.isoformat(),
    }


@router.put("/{reserva_id}/estado")
def change_reserva_state(
    reserva_id: int,
    estado: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.rol_id not in (1, 2):
        raise HTTPException(status_code=403, detail="No tienes permisos para cambiar el estado")
    reserva = db.get(Reserva, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    reserva.estado = estado
    db.commit()
    return {"mensaje": "Estado actualizado", "estado": reserva.estado}
