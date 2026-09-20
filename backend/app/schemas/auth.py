from pydantic import BaseModel, EmailStr, Field

from .usuario import UsuarioOut


class LoginRequest(BaseModel):
    correo: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    token: str
    usuario: UsuarioOut


class ForgotPasswordRequest(BaseModel):
    correo: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=32, max_length=128)
    password: str = Field(min_length=6, max_length=128)
