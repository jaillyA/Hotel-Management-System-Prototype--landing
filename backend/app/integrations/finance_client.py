import httpx

from app.core.config import settings

TIMEOUT = httpx.Timeout(3.0)
# O sistema financeiro externo, no free tier do Render, hiberna após
# inatividade e pode levar bem mais que alguns segundos para "acordar".
# Ações que o usuário pediu diretamente (registrar pagamento) esperam mais
# tempo do que ações silenciosas (fatura automática na reserva), pra não
# devolver um erro só porque o serviço ainda estava de pé.
PAYMENT_TIMEOUT = httpx.Timeout(30.0)


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
    try:
        async with httpx.AsyncClient(timeout=PAYMENT_TIMEOUT) as client:
            response = await client.post(
                f"{settings.finance_service_url}/payments",
                json={
                    "reservation_code": reservation_code,
                    "amount": amount,
                    "payment_method": payment_method,
                },
            )
    except httpx.HTTPError as exc:
        raise FinanceServiceError(
            "Sistema financeiro indisponível. Tente novamente em alguns instantes."
        ) from exc

    if response.status_code >= 400:
        raise FinanceServiceError(_extract_message(response, "Não foi possível registrar o pagamento."))
    return response.json()


async def list_payments() -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=PAYMENT_TIMEOUT) as client:
            response = await client.get(f"{settings.finance_service_url}/payments")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError:
        return []
