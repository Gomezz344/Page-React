import hashlib
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.security import create_access_token, hash_password, verify_password
from ..config import settings
from ..database import get_db
from ..models import PasswordResetToken, Usuario
from ..schemas.auth import ForgotPasswordRequest, LoginRequest, ResetPasswordRequest, TokenResponse
from ..schemas.usuario import UsuarioCreate, UsuarioResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _send_reset_email(recipient: str, token: str) -> None:
    if not all((settings.smtp_host, settings.smtp_username, settings.smtp_password, settings.smtp_from_email)):
        raise RuntimeError("SMTP no está configurado")
    link = f"{settings.frontend_url.rstrip('/')}/forgot-password?token={token}"
    message = EmailMessage()
    message["Subject"] = "Recuperación de contraseña — Wildlife"
    message["From"] = settings.smtp_from_email
    message["To"] = recipient
    message.set_content(
        "Solicitaste cambiar tu contraseña de Wildlife. "
        f"Este enlace vence en 30 minutos:\n\n{link}\n\n"
        "Si no solicitaste este cambio, ignora este mensaje."
    )
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
        server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(message)


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


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(Usuario).where(Usuario.correo == str(payload.correo).lower()))
    response = {"message": "Si el correo existe, generamos un enlace de recuperación."}
    if not user or user.estado != 1:
        return response

    raw_token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    db.query(PasswordResetToken).filter(
        PasswordResetToken.usuario_id == user.id,
        PasswordResetToken.used_at.is_(None),
    ).update({"used_at": datetime.now(timezone.utc).replace(tzinfo=None)})
    db.add(PasswordResetToken(
        usuario_id=user.id,
        token_hash=token_hash,
        expires_at=(datetime.now(timezone.utc) + timedelta(minutes=30)).replace(tzinfo=None),
    ))
    db.commit()
    # En desarrollo se devuelve para facilitar las pruebas sin proveedor de correo.
    # En producción debe permanecer desactivado y sustituirse por un enlace enviado por email.
    if settings.is_production or not settings.expose_reset_token:
        try:
            _send_reset_email(user.correo, raw_token)
        except Exception as exc:
            raise HTTPException(status_code=503, detail="El servicio de correo no está disponible") from exc
    else:
        response["reset_token"] = raw_token
    return response


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    reset_token = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash))
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if not reset_token or reset_token.used_at is not None or reset_token.expires_at <= now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El enlace no es válido o ya expiró")

    user = db.get(Usuario, reset_token.usuario_id)
    if not user or user.estado != 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La cuenta no está disponible")

    user.password = hash_password(payload.password)
    reset_token.used_at = now
    db.commit()
    return {"message": "Contraseña actualizada correctamente."}
