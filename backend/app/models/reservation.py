from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReservationModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    book_id: str
    user_name: Optional[str] = None
    book_title: Optional[str] = None
    book_author: Optional[str] = None
    reservation_date: datetime = Field(default_factory=datetime.utcnow)
    queue_position: int = 1
    status: str = "active" # "active", "fulfilled", "cancelled"

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}
