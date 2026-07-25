from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=False,
    # Desliga o cache de prepared statements do asyncpg: bancos atrás de um
    # pooler em modo transação (ex.: o endpoint "-pooler" do Neon) trocam a
    # conexão física entre transações, e prepared statements cacheados por
    # esse cliente podem apontar para uma conexão que já não é mais a mesma,
    # causando erros intermitentes em requisições com várias queries.
    connect_args={"statement_cache_size": 0},
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
