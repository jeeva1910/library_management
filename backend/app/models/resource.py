from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DigitalResourceModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    title: str
    description: Optional[str] = ""
    category: str
    resource_url: str
    access_type: str = "all" # "all", "student", "faculty"
    file_type: str = "pdf"
    file_size: Optional[str] = "2.5 MB"
    author: Optional[str] = "Academic Repository"
    download_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}
