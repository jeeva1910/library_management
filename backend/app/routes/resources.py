from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from backend.app.database.mongodb import get_database
from backend.app.schemas.resource import ResourceCreate, ResourceResponse

router = APIRouter()

def helper_format_resource(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "title": doc["title"],
        "description": doc.get("description", ""),
        "category": doc["category"],
        "resourceUrl": doc["resource_url"],
        "accessType": doc.get("access_type", "all"),
        "fileType": doc.get("file_type", "pdf"),
        "fileSize": doc.get("file_size", "2.5 MB"),
        "author": doc.get("author", "Academic Repository"),
        "downloadCount": doc.get("download_count", 0),
        "createdAt": doc.get("created_at", datetime.utcnow()).isoformat(),
    }

@router.get("", response_model=List[dict])
async def list_resources():
    db = await get_database()
    cursor = db.digital_resources.find({}).sort([("created_at", -1)])
    docs = await cursor.to_list(length=100)
    return [helper_format_resource(d) for d in docs]

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_resource(res_in: ResourceCreate):
    db = await get_database()

    doc = {
        "title": res_in.title,
        "description": res_in.description or "",
        "category": res_in.category,
        "resource_url": res_in.resource_url,
        "access_type": res_in.access_type or "all",
        "file_type": res_in.file_type or "pdf",
        "file_size": res_in.file_size or "3.0 MB",
        "author": res_in.author or "Academic Repository",
        "download_count": 0,
        "created_at": datetime.utcnow(),
    }

    result = await db.digital_resources.insert_one(doc)
    doc["_id"] = result.inserted_id

    return helper_format_resource(doc)

@router.delete("/{resource_id}", response_model=dict)
async def delete_resource(resource_id: str):
    db = await get_database()
    res_query = ObjectId(resource_id) if ObjectId.is_valid(resource_id) else resource_id

    result = await db.digital_resources.delete_one({"_id": res_query})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")

    return {"message": "Resource deleted successfully"}

@router.post("/{resource_id}/download", response_model=dict)
async def increment_download(resource_id: str):
    db = await get_database()
    res_query = ObjectId(resource_id) if ObjectId.is_valid(resource_id) else resource_id

    await db.digital_resources.update_one({"_id": res_query}, {"$inc": {"download_count": 1}})
    return {"message": "Download count updated"}
