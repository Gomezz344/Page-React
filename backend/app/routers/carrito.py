from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from ..core.deps import get_current_user
from ..database import get_db
from ..models import CarritoItem, Producto, Servicio, Usuario
from ..schemas.carrito import CarritoUpdate

router = APIRouter(prefix="/api/carrito", tags=["carrito"])


def get_catalog_item(db: Session, tipo: str, item_id: int):
    model = Producto if tipo == "producto" else Servicio
    item = db.get(model, item_id)
    if not item or item.estado != 1:
        raise HTTPException(status_code=404, detail=f"{tipo.capitalize()} no encontrado")
    return item


def serialize_item(cart_item: CarritoItem, catalog_item) -> dict:
    return {
        "key": f"{cart_item.tipo}-{cart_item.item_id}",
        "type": cart_item.tipo,
        "id": catalog_item.id,
        "nombre": catalog_item.nombre,
        "descripcion": catalog_item.descripcion,
        "precio": catalog_item.precio,
        "imagen": catalog_item.imagen,
        "stock": catalog_item.stock,
        "cantidad": cart_item.cantidad,
    }


@router.get("")
def get_cart(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_items = db.scalars(
        select(CarritoItem).where(CarritoItem.usuario_id == current_user.id).order_by(CarritoItem.id)
    ).all()
    result = []
    changed = False
    for cart_item in cart_items:
        try:
            catalog_item = get_catalog_item(db, cart_item.tipo, cart_item.item_id)
        except HTTPException:
            db.delete(cart_item)
            changed = True
            continue
        quantity = min(cart_item.cantidad, max(0, catalog_item.stock))
        if quantity == 0:
            db.delete(cart_item)
            changed = True
            continue
        if quantity != cart_item.cantidad:
            cart_item.cantidad = quantity
            changed = True
        result.append(serialize_item(cart_item, catalog_item))
    if changed:
        db.commit()
    return {"items": result}


@router.put("")
def replace_cart(
    payload: CarritoUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    normalized = {}
    for requested in payload.items:
        if requested.cantidad == 0:
            continue
        catalog_item = get_catalog_item(db, requested.tipo, requested.item_id)
        if requested.cantidad > catalog_item.stock:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {catalog_item.nombre}")
        key = (requested.tipo, requested.item_id)
        normalized[key] = min(requested.cantidad, catalog_item.stock)

    db.execute(delete(CarritoItem).where(CarritoItem.usuario_id == current_user.id))
    for (tipo, item_id), cantidad in normalized.items():
        db.add(CarritoItem(usuario_id=current_user.id, tipo=tipo, item_id=item_id, cantidad=cantidad))
    db.commit()
    return get_cart(current_user, db)
