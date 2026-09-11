from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.deps import get_current_user, require_role
from ..core.security import hash_password
from ..database import get_db
from ..models import Rol, Usuario
from ..schemas.usuario import UsuarioMeUpdate, UsuarioOut, UsuarioResponse, UsuarioUpdate, UsuariosResponse

router = APIRouter(prefix="/api/usuarios", tags=["usuarios"])


def update_user(user: Usuario, payload: UsuarioUpdate | UsuarioMeUpdate, db: Session) -> Usuario:
    values = payload.model_dump(exclude_unset=True)
    if values.get("password") is None:
        values.pop("password", None)
    if values.get("password"):
        values["password"] = hash_password(values["password"])
    if "correo" in values and values["correo"]:
        values["correo"] = str(values["correo"]).lower()
    for key, value in values.items():
        setattr(user, key, value)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo o número de documento ya está registrado")
    return user


@router.get("", response_model=UsuariosResponse)
def list_users(_: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    users = db.scalars(select(Usuario).order_by(Usuario.id)).all()
    return {"usuarios": [UsuarioOut.model_validate(user) for user in users]}


@router.get("/me", response_model=UsuarioResponse)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return {"usuario": current_user}


@router.put("/me", response_model=UsuarioResponse)
def update_me(payload: UsuarioMeUpdate, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"usuario": update_user(current_user, payload, db)}


@router.put("/{user_id}", response_model=UsuarioResponse)
def update_user_admin(user_id: int, payload: UsuarioUpdate, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    user = db.get(Usuario, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if payload.rol_id is not None and not db.get(Rol, payload.rol_id):
        raise HTTPException(status_code=400, detail="El rol indicado no existe")
    return {"usuario": update_user(user, payload, db)}


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    user = db.get(Usuario, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
