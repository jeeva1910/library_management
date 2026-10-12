from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    title: str
    message: str
    type: str = "announcement" # "due_soon", "overdue", "reservation_ready", "fine_added", "announcement"
    is_read: bool = False
    link_to: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}
