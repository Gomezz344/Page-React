from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.deps import require_role
from ..database import get_db
from ..models import Producto, Servicio, Usuario

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def stats(_: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    return {
        "usuarios": db.scalar(select(func.count()).select_from(Usuario)) or 0,
        "productos": db.scalar(select(func.count()).select_from(Producto)) or 0,
        "servicios": db.scalar(select(func.count()).select_from(Servicio)) or 0,
    }
