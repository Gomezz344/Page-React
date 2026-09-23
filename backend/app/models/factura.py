from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Factura(Base):
    __tablename__ = "facturas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    numero: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)
    pedido_id: Mapped[int] = mapped_column(ForeignKey("pedidos.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    moneda: Mapped[str] = mapped_column(String(10), nullable=False, default="COP")
    estado: Mapped[str] = mapped_column(String(20), nullable=False, default="emitida")
    fecha_emision: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    pedido: Mapped["Pedido"] = relationship(back_populates="factura")
    usuario: Mapped["Usuario"] = relationship(back_populates="facturas")
