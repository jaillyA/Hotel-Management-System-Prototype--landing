from datetime import date

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.guest import Guest
from app.models.reservation import Reservation, ReservationStatus
from app.schemas.guest import GuestCreate, GuestUpdate


async def list_guests(db: AsyncSession, q: str | None = None, limit: int = 200) -> list[Guest]:
    query = select(Guest).order_by(Guest.name).limit(limit)
    if q:
        pattern = f"%{q.lower()}%"
        conditions = [func.lower(Guest.name).like(pattern), func.lower(Guest.email).like(pattern)]
        digits = "".join(ch for ch in q if ch.isdigit())
        if digits:
            conditions.append(func.regexp_replace(Guest.cpf, r"\D", "", "g").like(f"%{digits}%"))
        query = query.where(or_(*conditions))
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_guest(db: AsyncSession, guest_id: int) -> Guest | None:
    return await db.get(Guest, guest_id)


async def get_guest_by_email(db: AsyncSession, email: str) -> Guest | None:
    result = await db.execute(select(Guest).where(func.lower(Guest.email) == email.lower()))
    return result.scalar_one_or_none()


async def get_guest_by_cpf(db: AsyncSession, cpf: str) -> Guest | None:
    result = await db.execute(select(Guest).where(Guest.cpf == cpf))
    return result.scalar_one_or_none()


async def create_guest(db: AsyncSession, data: GuestCreate) -> Guest:
    guest = Guest(**data.model_dump())
    db.add(guest)
    await db.commit()
    await db.refresh(guest)
    return guest


async def update_guest(db: AsyncSession, guest: Guest, data: GuestUpdate) -> Guest:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(guest, field, value)
    await db.commit()
    await db.refresh(guest)
    return guest


async def delete_guest(db: AsyncSession, guest: Guest) -> None:
    await db.delete(guest)
    await db.commit()


async def get_guest_stats(db: AsyncSession, guest_id: int) -> tuple[int, date | None]:
    query = select(func.count(Reservation.id), func.max(Reservation.checkout)).where(
        Reservation.guest_id == guest_id,
        Reservation.status != ReservationStatus.cancelada,
    )
    result = await db.execute(query)
    stays, last_stay = result.one()
    return stays or 0, last_stay
