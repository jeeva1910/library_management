from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReservationCreate(BaseModel):
    user_id: str
    book_id: str

class ReservationResponse(BaseModel):
    id: str
    user_id: str
    book_id: str
    user_name: Optional[str] = None
    book_title: Optional[str] = None
    book_author: Optional[str] = None
    reservation_date: datetime
    queue_position: int
    status: str

    class Config:
        from_attributes = True
