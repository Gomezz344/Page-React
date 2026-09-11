from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.security import create_access_token, hash_password, verify_password
from ..database import get_db
from ..models import Usuario
from ..schemas.auth import LoginRequest, TokenResponse
from ..schemas.usuario import UsuarioCreate, UsuarioResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(Usuario).where(Usuario.correo == str(payload.correo).lower()))
    if not user or not verify_password(payload.password, user.password) or user.estado != 1:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Correo o contraseña incorrectos")
    return {"token": create_access_token(user.id, user.rol_id), "usuario": user}


@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UsuarioCreate, db: Session = Depends(get_db)):
    exists = db.scalar(select(Usuario).where(or_(Usuario.correo == str(payload.correo).lower(), Usuario.numero_documento == payload.numero_documento)))
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo o número de documento ya está registrado")
    values = payload.model_dump(exclude={"password", "correo"})
    user = Usuario(**values, correo=str(payload.correo).lower(), password=hash_password(payload.password), rol_id=3, estado=1)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo o número de documento ya está registrado")
    return {"usuario": user}
