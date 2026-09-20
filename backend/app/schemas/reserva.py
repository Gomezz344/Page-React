from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .common import ORMModel


class ReservaBase(BaseModel):
    servicio_id: int = Field(gt=0)
    cantidad_personas: int = Field(default=1, ge=1)
    fecha_inicio: date
    fecha_fin: date | None = None
    notas: str | None = None

    @field_validator("fecha_fin", mode="before")
    @classmethod
    def normalize_fecha_fin(cls, value):
        if value in (None, "", "null"):
            return None
        return value


class ReservaCreate(ReservaBase):
    pass


class ReservaUpdate(BaseModel):
    servicio_id: int | None = Field(default=None, gt=0)
    cantidad_personas: int | None = Field(default=None, ge=1)
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    notas: str | None = None
    estado: str | None = None


class ReservaOut(ReservaBase, ORMModel):
    id: int
    usuario_id: int
    monto_total: float
    moneda: str
    estado: str
    stripe_session_id: str | None = None
    fecha_creacion: datetime

    model_config = ConfigDict(from_attributes=True)
