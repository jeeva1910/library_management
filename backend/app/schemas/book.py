from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    category: str
    publisher: Optional[str] = "Academic Press"
    publication_year: Optional[int] = 2024
    total_copies: int = 1
    description: Optional[str] = ""
    location_rack: Optional[str] = "GEN-A1-01"

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    category: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None
    description: Optional[str] = None
    location_rack: Optional[str] = None

class BookResponse(BookBase):
    id: str
    available_copies: int
    cover_gradient: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
