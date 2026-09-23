from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UsuarioBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=20)
    apellido: str = Field(min_length=1, max_length=20)
    tipo_documento: str = Field(min_length=1, max_length=30)
    numero_documento: int = Field(ge=0, le=9_999_999_999)
    direccion: str | None = None
    telefono: int | None = Field(default=None, ge=0, le=9_999_999_999)
    correo: EmailStr = Field(max_length=100)


class UsuarioCreate(UsuarioBase):
    password: str = Field(min_length=6, max_length=128)


class UsuarioUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=20)
    apellido: str | None = Field(default=None, min_length=1, max_length=20)
    tipo_documento: str | None = Field(default=None, min_length=1, max_length=30)
    numero_documento: int | None = Field(default=None, ge=0, le=9_999_999_999)
    direccion: str | None = None
    telefono: int | None = Field(default=None, ge=0, le=9_999_999_999)
    correo: EmailStr | None = Field(default=None, max_length=100)
    password: str | None = Field(default=None, min_length=6, max_length=128)
    rol_id: int | None = Field(default=None, ge=1)
    estado: int | None = Field(default=None, ge=0)

    @field_validator("password", mode="before")
    @classmethod
    def empty_password_is_unchanged(cls, value):
        return None if isinstance(value, str) and not value.strip() else value


class UsuarioMeUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=20)
    apellido: str | None = Field(default=None, min_length=1, max_length=20)
    direccion: str | None = None
    telefono: int | None = Field(default=None, ge=0, le=9_999_999_999)
    correo: EmailStr | None = Field(default=None, max_length=100)
    password: str | None = Field(default=None, min_length=6, max_length=128)

    @field_validator("password", mode="before")
    @classmethod
    def empty_password_is_unchanged(cls, value):
        return None if isinstance(value, str) and not value.strip() else value


class UsuarioOut(UsuarioBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    rol_id: int
    estado: int


class UsuarioResponse(BaseModel):
    usuario: UsuarioOut


class UsuariosResponse(BaseModel):
    usuarios: list[UsuarioOut]
