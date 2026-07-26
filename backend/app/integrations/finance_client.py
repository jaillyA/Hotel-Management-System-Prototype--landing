import asyncio

import httpx

from app.core.config import settings

TIMEOUT = httpx.Timeout(3.0)
PAYMENT_TIMEOUT = httpx.Timeout(10.0)


class FinanceServiceError(Exception):
    """Erro ao registrar/consultar algo no sistema financeiro externo, para ações que o usuário pediu diretamente."""


async def register_invoice(
    reservation_code: str, guest_name: str, amount: float, kind: str
) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(
                f"{settings.finance_service_url}/invoices",
                json={
                    "reservation_code": reservation_code,
                    "guest_name": guest_name,
                    "amount": amount,
                    "kind": kind,
                },
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError:
        # Sistema financeiro externo indisponível: não bloqueia o fluxo de reserva.
        return None


async def list_invoices() -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=PAYMENT_TIMEOUT) as client:
            response = await client.get(f"{settings.finance_service_url}/invoices")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError:
        return []


def _extract_message(response: httpx.Response, fallback: str) -> str:
    try:
        detail = response.json().get("detail")
    except ValueError:
        return fallback
    if isinstance(detail, str):
        return detail
    if isinstance(detail, list) and detail:
        return detail[0].get("msg", fallback)
    return fallback


async def register_payment(reservation_code: str, amount: float, payment_method: str) -> dict:
    payload = {
        "reservation_code": reservation_code,
        "amount": amount,
        "payment_method": payment_method,
    }
    last_error: Exception | None = None
    # No free tier do Render, um sistema financeiro hibernado costuma falhar
    # rápido (não travar) na primeira requisição que o desperta; a segunda,
    # já com o serviço de pé, funciona. Por isso vale tentar de novo uma vez
    # antes de desistir, só para esta ação (o usuário está esperando o resultado).
    for attempt in range(2):
        try:
            async with httpx.AsyncClient(timeout=PAYMENT_TIMEOUT) as client:
                response = await client.post(
                    f"{settings.finance_service_url}/payments", json=payload
                )
            if response.status_code < 400:
                return response.json()
            last_error = FinanceServiceError(
                _extract_message(response, "Não foi possível registrar o pagamento.")
            )
        except httpx.HTTPError as exc:
            last_error = FinanceServiceError(
                "Sistema financeiro indisponível. Tente novamente em alguns instantes."
            )
            last_error.__cause__ = exc
        if attempt == 0:
            await asyncio.sleep(2)
    raise last_error


async def list_payments() -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=PAYMENT_TIMEOUT) as client:
            response = await client.get(f"{settings.finance_service_url}/payments")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError:
        return []
