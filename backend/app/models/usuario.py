from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    tipo_documento: Mapped[str] = mapped_column(String(30), nullable=False)
    numero_documento: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    direccion: Mapped[str | None] = mapped_column(String(255))
    telefono: Mapped[str | None] = mapped_column(String(30))
    correo: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    rol_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False, default=3)
    estado: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    rol: Mapped["Rol"] = relationship(back_populates="usuarios")
    reservas: Mapped[list["Reserva"]] = relationship(back_populates="usuario")
    pagos: Mapped[list["Pago"]] = relationship(back_populates="usuario")
