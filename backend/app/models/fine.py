from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FineModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    borrowing_id: str
    user_name: Optional[str] = None
    book_title: Optional[str] = None
    overdue_days: int = 0
    fine_per_day: float = 0.50
    amount: float
    status: str = "pending" # "pending", "paid"
    paid_at: Optional[datetime] = None
    payment_method: Optional[str] = None
    transaction_ref: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}
