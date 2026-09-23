from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Pedido(Base):
    __tablename__ = "pedidos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False, default="producto")
    referencia_id: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    monto_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    moneda: Mapped[str] = mapped_column(String(10), nullable=False, default="COP")
    estado: Mapped[str] = mapped_column(String(20), nullable=False, default="pendiente")
    stripe_session_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    factura: Mapped["Factura | None"] = relationship(back_populates="pedido", uselist=False, cascade="all, delete-orphan")
