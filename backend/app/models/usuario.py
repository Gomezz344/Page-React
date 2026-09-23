from sqlalchemy import BigInteger, CheckConstraint, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Usuario(Base):
    __tablename__ = "usuarios"
    __table_args__ = (
        CheckConstraint("numero_documento BETWEEN 0 AND 9999999999", name="ck_usuarios_documento_max_10_digitos"),
        CheckConstraint("telefono IS NULL OR telefono BETWEEN 0 AND 9999999999", name="ck_usuarios_telefono_max_10_digitos"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(20), nullable=False)
    apellido: Mapped[str] = mapped_column(String(20), nullable=False)
    tipo_documento: Mapped[str] = mapped_column(String(30), nullable=False)
    numero_documento: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False)
    direccion: Mapped[str | None] = mapped_column(String(255))
    telefono: Mapped[int | None] = mapped_column(BigInteger)
    correo: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    rol_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False, default=3)
    estado: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    rol: Mapped["Rol"] = relationship(back_populates="usuarios")
    reservas: Mapped[list["Reserva"]] = relationship(back_populates="usuario")
    pagos: Mapped[list["Pago"]] = relationship(back_populates="usuario")
    facturas: Mapped[list["Factura"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")
    reportes: Mapped[list["ReporteVenta"]] = relationship(back_populates="administrador")
