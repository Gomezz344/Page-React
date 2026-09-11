from decimal import Decimal
from sqlalchemy import Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    precio: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    imagen: Mapped[str | None] = mapped_column(String(500))
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    estado: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
