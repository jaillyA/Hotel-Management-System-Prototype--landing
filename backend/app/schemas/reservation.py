from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, model_validator

from app.models.reservation import ReservationStatus
from app.models.room import RoomType


class ReservationCreate(BaseModel):
    guest_id: int
    room_id: int
    checkin: date
    checkout: date
    guests: int

    @model_validator(mode="after")
    def checkout_after_checkin(self) -> "ReservationCreate":
        if self.checkout <= self.checkin:
            raise ValueError("checkout deve ser depois do checkin")
        return self


class PublicBookingCreate(BaseModel):
    room_id: int
    checkin: date
    checkout: date
    guests: int
    guest_name: str
    guest_email: EmailStr
    guest_phone: str
    guest_cpf: str

    @model_validator(mode="after")
    def checkout_after_checkin(self) -> "PublicBookingCreate":
        if self.checkout <= self.checkin:
            raise ValueError("checkout deve ser depois do checkin")
        return self


class ReservationUpdate(BaseModel):
    checkin: date | None = None
    checkout: date | None = None
    guests: int | None = None
    status: ReservationStatus | None = None


class ReservationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    guest_id: int
    room_id: int
    guest_name: str
    guest_cpf: str
    room_number: str
    room_type: RoomType
    checkin: date
    checkout: date
    guests: int
    status: ReservationStatus
    total: float
    nights: int
