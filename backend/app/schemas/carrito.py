from pydantic import BaseModel, Field


class CarritoItemInput(BaseModel):
    tipo: str = Field(pattern="^(producto|servicio)$")
    item_id: int = Field(gt=0)
    cantidad: int = Field(ge=0)


class CarritoUpdate(BaseModel):
    items: list[CarritoItemInput]
