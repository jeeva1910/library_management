from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    email: EmailStr
    password_hash: str
    role: str = "student" # "student", "librarian", "admin"
    student_id: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}
