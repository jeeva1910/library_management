from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "student"
    student_id: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Book Schemas
class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    category: str
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    total_copies: int = 1
    description: Optional[str] = None
    location_rack: Optional[str] = None

class BookCreate(BookBase):
    pass

class BookResponse(BookBase):
    id: str
    available_copies: int
    created_at: datetime

    class Config:
        from_attributes = True

# Borrowing Schemas
class BorrowingCreate(BaseModel):
    user_id: str
    book_id: str
    due_date: Optional[datetime] = None

class BorrowingResponse(BaseModel):
    id: str
    user_id: str
    book_id: str
    issue_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    status: str
    renewal_count: int
    fine_amount: float

    class Config:
        from_attributes = True

# Reservation Schemas
class ReservationCreate(BaseModel):
    user_id: str
    book_id: str

class ReservationResponse(BaseModel):
    id: str
    user_id: str
    book_id: str
    reservation_date: datetime
    queue_position: int
    status: str

    class Config:
        from_attributes = True

# Resource Schemas
class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    resource_url: str
    access_type: str = "all"
    file_type: str = "pdf"

class ResourceResponse(ResourceCreate):
    id: str
    download_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
