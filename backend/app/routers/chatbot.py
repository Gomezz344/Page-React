from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import Producto, Servicio
from ..schemas.chatbot import ChatbotRequest, ChatbotResponse

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

SYSTEM_INSTRUCTIONS = """Eres el asistente virtual de Wildlife, una empresa de turismo y productos de naturaleza.
Responde siempre en español, con tono amable, breve y claro.
Puedes orientar sobre productos, servicios, compras, reservas, pagos y preguntas frecuentes.
Si el usuario quiere presentar una PQR, solicita nombre, correo, asunto y descripción, y aclara que
la recepción formal debe completarse con un asesor; no inventes un número de PQR ni confirmes un
estado que no exista en el sistema.
No inventes precios, stock, políticas ni datos de pedidos. Si no tienes el dato, indica que un asesor
debe confirmarlo. No solicites contraseñas, tokens, números completos de tarjeta ni claves secretas.
"""


def _category(message: str) -> str:
    text = message.lower()
    if any(word in text for word in ("pqr", "queja", "reclamo", "petición", "peticion", "sugerencia")):
        return "pqr"
    if any(word in text for word in ("comprar", "compra", "carrito", "pago", "precio", "producto")):
        return "compras"
    if any(word in text for word in ("tour", "servicio", "reserva", "reservar", "experiencia")):
        return "servicios"
    return "general"


def _fallback_reply(message: str, catalog: str) -> str:
    category = _category(message)
    if category == "pqr":
        return "Claro. Para recibir tu PQR necesito tu nombre, correo, asunto y una descripción detallada. Un asesor revisará la solicitud y te dará seguimiento."
    if category == "compras":
        return f"Puedes revisar el catálogo, agregar productos o experiencias al carrito e iniciar el pago desde la sección Compras. Catálogo disponible: {catalog or 'consulta la sección Compras.'}"
    if category == "servicios":
        return f"Puedes explorar y reservar nuestras experiencias desde la sección Tours. {catalog or 'También puedo orientarte sobre el proceso de reserva.'}"
    return "Puedo ayudarte con productos, servicios, reservas, compras, pagos y la recepción inicial de una PQR. ¿Qué necesitas consultar?"


def _catalog_context(db: Session) -> str:
    products = db.scalars(select(Producto).where(Producto.estado == 1).order_by(Producto.id).limit(30)).all()
    services = db.scalars(select(Servicio).where(Servicio.estado == 1).order_by(Servicio.id).limit(30)).all()
    entries = [f"Producto: {item.nombre} | precio: {item.precio} COP | stock: {item.stock}" for item in products]
    entries += [f"Servicio: {item.nombre} | precio: {item.precio} COP | cupos: {item.stock}" for item in services]
    return "; ".join(entries)


async def _openai_reply(payload: ChatbotRequest, catalog: str) -> str | None:
    if not settings.openai_api_key:
        return None

    import httpx

    conversation = [{"role": item.role, "content": item.content} for item in payload.history[-12:]]
    conversation.append({"role": "user", "content": payload.message})
    instructions = f"{SYSTEM_INSTRUCTIONS}\nCatálogo actual:\n{catalog or 'No hay elementos activos registrados.'}"

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.openai.com/v1/responses",
                headers={"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"},
                json={"model": settings.openai_model, "instructions": instructions, "input": conversation, "max_output_tokens": 400},
            )
        if response.is_error:
            return None
        data = response.json()
        if data.get("output_text"):
            return data["output_text"].strip()
        for output in data.get("output", []):
            for content in output.get("content", []):
                if content.get("type") == "output_text" and content.get("text"):
                    return content["text"].strip()
    except (httpx.HTTPError, ValueError, KeyError):
        return None
    return None


@router.post("/message", response_model=ChatbotResponse)
async def chatbot_message(payload: ChatbotRequest, db: Session = Depends(get_db)):
    catalog = _catalog_context(db)
    reply = await _openai_reply(payload, catalog)
    source = "openai" if reply else "fallback"
    if not reply:
        reply = _fallback_reply(payload.message, catalog)
    return {"reply": reply, "source": source, "category": _category(payload.message)}
