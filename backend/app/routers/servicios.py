from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.deps import require_role, require_roles
from ..database import get_db
from ..models import Servicio, Usuario
from ..schemas.common import ServicioCreate, ServicioOut, ServicioResponse, ServicioUpdate

router = APIRouter(prefix="/api/servicios", tags=["servicios"])


@router.get("", response_model=list[ServicioOut])
def list_services(db: Session = Depends(get_db)):
    return db.scalars(select(Servicio).where(Servicio.estado == 1).order_by(Servicio.id)).all()


@router.get("/{service_id}")
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.get(Servicio, service_id)
    if not service or service.estado != 1: raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {
        "servicio": {
            "id": service.id,
            "nombre": service.nombre,
            "descripcion": service.descripcion,
            "precio": str(service.precio),
            "duracion": service.duracion,
            "imagen": service.imagen,
            "stock": service.stock,
            "estado": service.estado,
        }
    }


@router.post("", response_model=ServicioOut)
def create_service(payload: ServicioCreate, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    service = Servicio(**payload.model_dump()); db.add(service); db.commit(); db.refresh(service); return service


@router.put("/{service_id}", response_model=ServicioOut)
def update_service(service_id: int, payload: ServicioUpdate, _: Usuario = Depends(require_roles(1, 2)), db: Session = Depends(get_db)):
    service = db.get(Servicio, service_id)
    if not service: raise HTTPException(status_code=404, detail="Servicio no encontrado")
    for key, value in payload.model_dump().items(): setattr(service, key, value)
    db.commit(); db.refresh(service); return service


@router.delete("/{service_id}", status_code=204)
def delete_service(service_id: int, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    service = db.get(Servicio, service_id)
    if not service: raise HTTPException(status_code=404, detail="Servicio no encontrado")
    db.delete(service); db.commit()
