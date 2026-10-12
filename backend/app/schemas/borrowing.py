from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BorrowingIssueRequest(BaseModel):
    user_id: str
    book_id: str
    due_date: Optional[str] = None

class BorrowingResponse(BaseModel):
    id: str
    user_id: str
    book_id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    book_title: Optional[str] = None
    book_author: Optional[str] = None
    book_isbn: Optional[str] = None
    issue_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    status: str
    renewal_count: int = 0
    fine_amount: float = 0.0

    class Config:
        from_attributes = True
