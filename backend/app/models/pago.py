from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.reserva import Reserva
from backend.app.models.usuario import Usuario

from ..database import Base


class Pago(Base):
    __tablename__ = "pagos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    reserva_id: Mapped[int | None] = mapped_column(ForeignKey("reservas.id", ondelete="SET NULL"), nullable=True, index=True)
    monto: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    moneda: Mapped[str] = mapped_column(String(10), nullable=False, default="COP")
    estado: Mapped[str] = mapped_column(String(30), nullable=False, default="pendiente")
    stripe_session_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    usuario: Mapped["Usuario"] = relationship(back_populates="pagos")
    reserva: Mapped["Reserva"] = relationship(back_populates="pagos")
