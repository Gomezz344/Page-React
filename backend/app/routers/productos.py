from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.deps import require_role, require_roles
from ..database import get_db
from ..models import Producto, Usuario
from ..schemas.common import ProductoCreate, ProductoOut, ProductoUpdate

router = APIRouter(prefix="/api/productos", tags=["productos"])


@router.get("", response_model=list[ProductoOut])
def list_products(db: Session = Depends(get_db)):
    return db.scalars(select(Producto).where(Producto.estado == 1).order_by(Producto.id)).all()


@router.post("", response_model=ProductoOut)
def create_product(payload: ProductoCreate, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    product = Producto(**payload.model_dump()); db.add(product); db.commit(); db.refresh(product); return product


@router.put("/{product_id}", response_model=ProductoOut)
def update_product(product_id: int, payload: ProductoUpdate, _: Usuario = Depends(require_roles(1, 2)), db: Session = Depends(get_db)):
    product = db.get(Producto, product_id)
    if not product: raise HTTPException(status_code=404, detail="Producto no encontrado")
    for key, value in payload.model_dump().items(): setattr(product, key, value)
    db.commit(); db.refresh(product); return product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    product = db.get(Producto, product_id)
    if not product: raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(product); db.commit()
