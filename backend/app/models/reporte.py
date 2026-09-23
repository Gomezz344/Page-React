from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class ReporteVenta(Base):
    __tablename__ = "reportes_ventas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    administrador_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    nombre: Mapped[str] = mapped_column(String(160), nullable=False)
    filtros: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    ventas: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    unidades: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    fecha_generacion: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    administrador: Mapped["Usuario"] = relationship(back_populates="reportes")
