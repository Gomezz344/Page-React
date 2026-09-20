from pydantic import BaseModel, Field


class PagoItemInput(BaseModel):
    tipo: str = Field(pattern="^(producto|servicio)$")
    item_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)


class CrearSesionRequest(BaseModel):
    items: list[PagoItemInput] = Field(min_length=1)


class PedidoOut(BaseModel):
    id: int
    usuario_id: int
    tipo: str
    referencia_id: int
    cantidad: int
    monto_total: float
    moneda: str
    estado: str
    stripe_session_id: str | None = None
