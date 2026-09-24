"""Create or promote a Wildlife administrator from the Render Shell."""

from __future__ import annotations

import argparse
import getpass
import sys
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

# Supports: python scripts/create_admin.py (run from backend/).
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.security import hash_password  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.models import Rol, Usuario  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Crear o promover un administrador")
    parser.add_argument("--email", required=True, help="Correo del administrador")
    parser.add_argument("--numero-documento", required=True, type=int, help="Documento, maximo 10 digitos")
    parser.add_argument("--nombre", default="Administrador")
    parser.add_argument("--apellido", default="Wildlife")
    parser.add_argument("--tipo-documento", default="CC")
    parser.add_argument("--direccion", default=None)
    parser.add_argument("--telefono", type=int, default=None)
    args = parser.parse_args()

    email = args.email.strip().lower()
    password = getpass.getpass("Contrasena del administrador: ")
    confirmation = getpass.getpass("Repite la contrasena: ")
    if not password or password != confirmation:
        raise SystemExit("Las contrasenas no coinciden o estan vacias.")
    if len(password) < 6:
        raise SystemExit("La contrasena debe tener al menos 6 caracteres.")

    with SessionLocal() as db:
        role = db.get(Rol, 1)
        if role is None:
            db.add(Rol(id=1, nombre="Administrador", descripcion="Acceso total al sistema"))
            db.flush()

        user = db.scalar(select(Usuario).where(Usuario.correo == email))
        document_owner = db.scalar(select(Usuario).where(Usuario.numero_documento == args.numero_documento))
        if document_owner is not None and (user is None or document_owner.id != user.id):
            raise SystemExit("Ese numero de documento ya pertenece a otro usuario.")

        if user is None:
            user = Usuario(
                nombre=args.nombre, apellido=args.apellido, tipo_documento=args.tipo_documento,
                numero_documento=args.numero_documento, direccion=args.direccion, telefono=args.telefono,
                correo=email, password=hash_password(password), rol_id=1, estado=1,
            )
            db.add(user)
            action = "creado"
        else:
            user.nombre = args.nombre
            user.apellido = args.apellido
            user.tipo_documento = args.tipo_documento
            user.numero_documento = args.numero_documento
            user.direccion = args.direccion
            user.telefono = args.telefono
            user.password = hash_password(password)
            user.rol_id = 1
            user.estado = 1
            action = "actualizado y promovido"

        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise SystemExit("No se pudo guardar el administrador: revisa los datos unicos.") from exc

        print(f"Administrador {action}: {email}")
        print("Ya puedes iniciar sesion con ese correo y la contrasena indicada.")


if __name__ == "__main__":
    main()
