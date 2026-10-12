from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BorrowingModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    book_id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    book_title: Optional[str] = None
    book_author: Optional[str] = None
    book_isbn: Optional[str] = None
    issue_date: datetime = Field(default_factory=datetime.utcnow)
    due_date: datetime
    return_date: Optional[datetime] = None
    status: str = "borrowed" # "borrowed", "returned", "overdue", "renewed"
    renewal_count: int = 0
    fine_amount: float = 0.0

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}
