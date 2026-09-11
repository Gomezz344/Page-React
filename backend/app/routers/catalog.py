from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.deps import require_role
from ..database import get_db
from ..models import Permiso, Rol, Usuario, rol_permisos
from ..schemas.common import PermisoCreate, PermisoOut, PermisoUpdate, RolCreate, RolOut, RolUpdate

roles_router = APIRouter(prefix="/api/roles", tags=["roles"])
permisos_router = APIRouter(prefix="/api/permisos", tags=["permisos"])


@roles_router.get("", response_model=list[RolOut])
def list_roles(db: Session = Depends(get_db)):
    return db.scalars(select(Rol).order_by(Rol.id)).all()


@roles_router.post("", response_model=RolOut)
def create_role(payload: RolCreate, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    role = Rol(**payload.model_dump())
    db.add(role); db.commit(); db.refresh(role)
    return role


@roles_router.put("/{role_id}", response_model=RolOut)
def update_role(role_id: int, payload: RolUpdate, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    role = db.get(Rol, role_id)
    if not role: raise HTTPException(status_code=404, detail="Rol no encontrado")
    for key, value in payload.model_dump().items(): setattr(role, key, value)
    db.commit(); db.refresh(role)
    return role


@roles_router.delete("/{role_id}", status_code=204)
def delete_role(role_id: int, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    role = db.get(Rol, role_id)
    if not role: raise HTTPException(status_code=404, detail="Rol no encontrado")
    db.delete(role); db.commit()


@roles_router.put("/{role_id}/permisos/{permiso_id}", response_model=RolOut)
def assign_permission(role_id: int, permiso_id: int, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    role, permission = db.get(Rol, role_id), db.get(Permiso, permiso_id)
    if not role or not permission: raise HTTPException(status_code=404, detail="Rol o permiso no encontrado")
    if permission not in role.permisos: role.permisos.append(permission)
    db.commit(); db.refresh(role)
    return role


@roles_router.delete("/{role_id}/permisos/{permiso_id}", response_model=RolOut)
def remove_permission(role_id: int, permiso_id: int, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    role, permission = db.get(Rol, role_id), db.get(Permiso, permiso_id)
    if not role or not permission: raise HTTPException(status_code=404, detail="Rol o permiso no encontrado")
    if permission in role.permisos: role.permisos.remove(permission)
    db.commit(); db.refresh(role)
    return role


@permisos_router.get("", response_model=list[PermisoOut])
def list_permissions(db: Session = Depends(get_db)):
    return db.scalars(select(Permiso).order_by(Permiso.id)).all()


@permisos_router.post("", response_model=PermisoOut)
def create_permission(payload: PermisoCreate, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    permission = Permiso(**payload.model_dump())
    db.add(permission); db.commit(); db.refresh(permission)
    return permission


@permisos_router.put("/{permission_id}", response_model=PermisoOut)
def update_permission(permission_id: int, payload: PermisoUpdate, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    permission = db.get(Permiso, permission_id)
    if not permission: raise HTTPException(status_code=404, detail="Permiso no encontrado")
    for key, value in payload.model_dump().items(): setattr(permission, key, value)
    db.commit(); db.refresh(permission)
    return permission


@permisos_router.delete("/{permission_id}", status_code=204)
def delete_permission(permission_id: int, _: Usuario = Depends(require_role(1)), db: Session = Depends(get_db)):
    permission = db.get(Permiso, permission_id)
    if not permission: raise HTTPException(status_code=404, detail="Permiso no encontrado")
    db.delete(permission); db.commit()
