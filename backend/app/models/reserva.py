from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Reserva(Base):
    __tablename__ = "reservas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    servicio_id: Mapped[int] = mapped_column(ForeignKey("servicios.id", ondelete="CASCADE"), nullable=False, index=True)
    cantidad_personas: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    fecha_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_fin: Mapped[date | None] = mapped_column(Date, nullable=True)
    monto_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    moneda: Mapped[str] = mapped_column(String(10), nullable=False, default="COP")
    estado: Mapped[str] = mapped_column(String(30), nullable=False, default="pendiente")
    notas: Mapped[str | None] = mapped_column(Text)
    stripe_session_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    usuario: Mapped["Usuario"] = relationship(back_populates="reservas")
    servicio: Mapped["Servicio"] = relationship(back_populates="reservas")
    pagos: Mapped[list["Pago"]] = relationship(back_populates="reserva")
