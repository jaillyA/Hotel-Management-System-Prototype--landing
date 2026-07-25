"""
Fixtures compartilhadas pelos testes de caixa cinza.

Esses testes rodam contra a stack real do docker-compose (API principal,
sistema financeiro externo e Postgres), batendo nas interfaces públicas —
não importam nada de dentro de `app/`. O conhecimento "interno" usado para
desenhar cada caso (ex.: que existem dois serviços, que o rate limit é
5/minuto, que a transição de status roda na leitura) vem da leitura do
código, mas a verificação em si é sempre pela borda do sistema.
"""

import os

import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import app

API_BASE = os.environ.get("TEST_API_BASE", "http://localhost:8000")
FINANCE_BASE = os.environ.get("TEST_FINANCE_BASE", "http://localhost:8001")
DB_DSN = os.environ.get("TEST_DATABASE_URL", "postgresql://hotel:hotel@localhost:5433/hotel")

STAFF_EMAIL = "ana.souza@hotel.com"
STAFF_PASSWORD = "demo1234"


@pytest.fixture(scope="session")
def api_base() -> str:
    return API_BASE


@pytest.fixture(scope="session")
def finance_base() -> str:
    return FINANCE_BASE


@pytest.fixture(scope="session")
def db_dsn() -> str:
    return DB_DSN


@pytest.fixture(scope="session")
def auth_token(api_base: str) -> str:
    response = httpx.post(
        f"{api_base}/auth/login",
        json={"email": STAFF_EMAIL, "password": STAFF_PASSWORD},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token: str) -> dict:
    return {"Authorization": f"Bearer {auth_token}"}


# Cliente de teste in-process (ASGI), para testes de caixa branca que não
# precisam da stack real subida via docker-compose.
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
