from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from backend.app.database.mongodb import get_database

router = APIRouter()

def helper_format_notif(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "userId": str(doc["user_id"]),
        "title": doc["title"],
        "message": doc["message"],
        "type": doc.get("type", "announcement"),
        "isRead": doc.get("is_read", False),
        "createdAt": doc.get("created_at", datetime.utcnow()).isoformat(),
        "linkTo": doc.get("link_to"),
    }

@router.get("", response_model=List[dict])
async def get_user_notifications(userId: Optional[str] = Query("usr_std1")):
    db = await get_database()
    cursor = db.notifications.find({"user_id": userId}).sort([("created_at", -1)])
    docs = await cursor.to_list(length=100)
    return [helper_format_notif(d) for d in docs]

@router.put("/{notification_id}/read", response_model=dict)
async def mark_read(notification_id: str):
    db = await get_database()
    query_id = ObjectId(notification_id) if ObjectId.is_valid(notification_id) else notification_id

    await db.notifications.update_one({"_id": query_id}, {"$set": {"is_read": True}})
    return {"success": True}

@router.post("/read-all", response_model=dict)
async def mark_all_read(payload: dict):
    db = await get_database()
    user_id = payload.get("userId", "usr_std1")

    await db.notifications.update_many({"user_id": user_id}, {"$set": {"is_read": True}})
    return {"success": True}

@router.post("", response_model=dict)
async def send_notification(payload: dict):
    db = await get_database()
    user_id = payload.get("userId")
    title = payload.get("title")
    message = payload.get("message")

    if not user_id or not title or not message:
        raise HTTPException(status_code=400, detail="userId, title, and message are required")

    doc = {
        "user_id": str(user_id),
        "title": title,
        "message": message,
        "type": payload.get("type", "announcement"),
        "is_read": False,
        "created_at": datetime.utcnow()
    }

    result = await db.notifications.insert_one(doc)
    doc["_id"] = result.inserted_id

    return helper_format_notif(doc)
