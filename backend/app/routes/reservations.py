from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from backend.app.database.mongodb import get_database
from backend.app.schemas.reservation import ReservationCreate
from backend.app.services.notification_service import create_user_notification

router = APIRouter()

def helper_format_res(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "userId": str(doc["user_id"]),
        "bookId": str(doc["book_id"]),
        "userName": doc.get("user_name", ""),
        "bookTitle": doc.get("book_title", ""),
        "bookAuthor": doc.get("book_author", ""),
        "reservationDate": doc.get("reservation_date", datetime.utcnow()).isoformat(),
        "queuePosition": doc.get("queue_position", 1),
        "status": doc.get("status", "pending"),
    }

@router.get("/my", response_model=List[dict])
async def get_my_reservations(userId: Optional[str] = Query("usr_std1")):
    db = await get_database()
    cursor = db.reservations.find({"user_id": userId}).sort([("reservation_date", -1)])
    docs = await cursor.to_list(length=100)
    return [helper_format_res(d) for d in docs]

@router.get("/all", response_model=List[dict])
async def get_all_reservations():
    db = await get_database()
    cursor = db.reservations.find({}).sort([("reservation_date", -1)])
    docs = await cursor.to_list(length=200)
    return [helper_format_res(d) for d in docs]

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_reservation(req: ReservationCreate):
    db = await get_database()

    book_query = ObjectId(req.book_id) if ObjectId.is_valid(req.book_id) else req.book_id
    book = await db.books.find_one({"_id": book_query})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if book.get("available_copies", 0) > 0:
        raise HTTPException(status_code=400, detail="This book has available copies for direct borrowing.")

    # Check existing active reservation in MongoDB
    existing = await db.reservations.find_one({
        "user_id": req.user_id,
        "book_id": req.book_id,
        "status": "pending"
    })
    if existing:
        raise HTTPException(status_code=400, detail="You already have an active reservation for this book.")

    user_query = ObjectId(req.user_id) if ObjectId.is_valid(req.user_id) else req.user_id
    user = await db.users.find_one({"_id": user_query})

    queue_count = await db.reservations.count_documents({"book_id": req.book_id, "status": "pending"})
    queue_pos = queue_count + 1

    doc = {
        "user_id": str(req.user_id),
        "book_id": str(req.book_id),
        "user_name": user.get("name") if user else "Student",
        "book_title": book.get("title"),
        "book_author": book.get("author"),
        "reservation_date": datetime.utcnow(),
        "queue_position": queue_pos,
        "status": "pending"
    }

    result = await db.reservations.insert_one(doc)
    doc["_id"] = result.inserted_id

    await create_user_notification(
        user_id=str(req.user_id),
        title="Reservation Confirmed",
        message=f'Reserved "{book.get("title")}". You are position #{queue_pos} in queue.',
        notification_type="reservation_ready",
        link_to="/reservations"
    )

    return helper_format_res(doc)

@router.put("/{reservation_id}", response_model=dict)
async def update_reservation_status(reservation_id: str, payload: dict):
    db = await get_database()
    res_query = ObjectId(reservation_id) if ObjectId.is_valid(reservation_id) else reservation_id

    new_status = payload.get("status", "fulfilled")
    await db.reservations.update_one({"_id": res_query}, {"$set": {"status": new_status}})

    updated = await db.reservations.find_one({"_id": res_query})
    if not updated:
        raise HTTPException(status_code=404, detail="Reservation not found")

    return helper_format_res(updated)
