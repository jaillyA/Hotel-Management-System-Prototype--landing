from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.models.room import RoomStatus, RoomType


class RoomBase(BaseModel):
    number: str
    floor: int
    type: RoomType
    capacity: int = Field(gt=0, le=20)
    price: float = Field(gt=0)
    amenities: list[str] = []
    img: str | None = None


class RoomCreate(RoomBase):
    status: RoomStatus = RoomStatus.disponivel


class RoomUpdate(BaseModel):
    number: str | None = None
    floor: int | None = None
    type: RoomType | None = None
    status: RoomStatus | None = None
    capacity: int | None = Field(default=None, gt=0, le=20)
    price: float | None = Field(default=None, gt=0)
    amenities: list[str] | None = None
    img: str | None = None


class RoomRead(RoomBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: RoomStatus


class RoomCatalogEntry(RoomRead):
    available: bool
    available_from: date | None = None
