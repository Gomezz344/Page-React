from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Usuario
from .security import decode_access_token

bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> Usuario:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token requerido")
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload.get("sub", ""))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")
    user = db.get(Usuario, user_id)
    if not user or user.estado != 1:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no autorizado")
    return user


def require_role(role_id: int) -> Callable:
    return require_roles(role_id)


def require_roles(*role_ids: int) -> Callable:
    def dependency(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.rol_id not in role_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para esta operación")
        return current_user
    return dependency


def require_permiso(permission_name: str) -> Callable:
    def dependency(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if not current_user.rol or not any(permission.nombre == permission_name for permission in current_user.rol.permisos):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para esta operación")
        return current_user
    return dependency
