from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BookModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    title: str
    author: str
    isbn: str
    category: str
    publisher: Optional[str] = "Academic Press"
    publication_year: Optional[int] = 2024
    total_copies: int = 1
    available_copies: int = 1
    description: Optional[str] = ""
    location_rack: Optional[str] = "GEN-A1-01"
    cover_gradient: Optional[str] = "from-blue-700 via-indigo-800 to-slate-900"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}
