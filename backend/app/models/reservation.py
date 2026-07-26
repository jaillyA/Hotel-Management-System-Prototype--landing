import enum
from datetime import date

from sqlalchemy import Date, Enum as SAEnum, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ReservationStatus(str, enum.Enum):
    confirmada = "confirmada"
    pendente = "pendente"
    cancelada = "cancelada"
    checkout = "checkout"


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    guest_id: Mapped[int] = mapped_column(ForeignKey("guests.id"))
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"))
    checkin: Mapped[date] = mapped_column(Date)
    checkout: Mapped[date] = mapped_column(Date)
    guests: Mapped[int] = mapped_column(Integer)
    status: Mapped[ReservationStatus] = mapped_column(
        SAEnum(ReservationStatus, name="reservation_status"),
        default=ReservationStatus.confirmada,
    )
    total: Mapped[float] = mapped_column(Numeric(10, 2))

    guest: Mapped["Guest"] = relationship(back_populates="reservations")
    room: Mapped["Room"] = relationship(back_populates="reservations")
    consumed_services: Mapped[list["ReservationService"]] = relationship(
        back_populates="reservation", cascade="all, delete-orphan"
    )

    @property
    def nights(self) -> int:
        return max(1, (self.checkout - self.checkin).days)

    @property
    def guest_name(self) -> str:
        return self.guest.name

    @property
    def guest_cpf(self) -> str:
        return self.guest.cpf

    @property
    def room_number(self) -> str:
        return self.room.number

    @property
    def room_type(self):
        return self.room.type
