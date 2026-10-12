from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResourceBase(BaseModel):
    title: str
    description: Optional[str] = ""
    category: str
    resource_url: str
    access_type: str = "all"
    file_type: str = "pdf"
    file_size: Optional[str] = "2.5 MB"
    author: Optional[str] = "Academic Repository"

class ResourceCreate(ResourceBase):
    pass

class ResourceResponse(ResourceBase):
    id: str
    download_count: int
    created_at: datetime

    class Config:
        from_attributes = True
