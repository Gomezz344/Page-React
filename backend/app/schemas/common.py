from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ProductoBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str | None = None
    precio: Decimal = Field(ge=0)
    imagen: str | None = None
    stock: int = Field(ge=0)
    estado: int = Field(default=1, ge=0)


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(ProductoBase):
    pass


class ProductoOut(ProductoBase, ORMModel):
    id: int


class ServicioBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str | None = None
    precio: Decimal = Field(ge=0)
    duracion: str | None = None
    imagen: str | None = None
    stock: int = Field(ge=0)
    estado: int = Field(default=1, ge=0)


class ServicioCreate(ServicioBase):
    pass


class ServicioUpdate(ServicioBase):
    pass


class ServicioOut(ServicioBase, ORMModel):
    id: int


class ServicioResponse(BaseModel):
    servicio: ServicioOut


class RolBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: str | None = None


class RolCreate(RolBase):
    pass


class RolUpdate(RolBase):
    pass


class RolOut(RolBase, ORMModel):
    id: int


class PermisoBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: str | None = None


class PermisoCreate(PermisoBase):
    pass


class PermisoUpdate(PermisoBase):
    pass


class PermisoOut(PermisoBase, ORMModel):
    id: int
