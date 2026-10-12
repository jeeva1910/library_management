from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId

from backend.app.database.mongodb import get_database
from backend.app.schemas.borrowing import BorrowingIssueRequest, BorrowingResponse
from backend.app.services.fine_service import calculate_overdue_fine, get_fine_per_day_rate
from backend.app.services.notification_service import create_user_notification

router = APIRouter()

def helper_format_borrowing(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "userId": str(doc["user_id"]),
        "bookId": str(doc["book_id"]),
        "userName": doc.get("user_name", "Student"),
        "userEmail": doc.get("user_email", ""),
        "bookTitle": doc.get("book_title", "Book Title"),
        "bookAuthor": doc.get("book_author", "Author"),
        "bookIsbn": doc.get("book_isbn", ""),
        "issueDate": doc.get("issue_date", datetime.utcnow()).isoformat(),
        "dueDate": doc.get("due_date", datetime.utcnow()).isoformat(),
        "returnDate": doc["return_date"].isoformat() if doc.get("return_date") else None,
        "status": doc.get("status", "borrowed"),
        "renewalCount": doc.get("renewal_count", 0),
        "fineAmount": doc.get("fine_amount", 0.0),
        "isFinePaid": doc.get("is_fine_paid", True),
    }

@router.get("/my", response_model=List[dict])
async def get_my_borrowings(userId: Optional[str] = Query("usr_std1")):
    db = await get_database()
    cursor = db.borrowings.find({"user_id": userId}).sort([("issue_date", -1)])
    docs = await cursor.to_list(length=100)
    return [helper_format_borrowing(d) for d in docs]

@router.get("/all", response_model=List[dict])
async def get_all_borrowings():
    db = await get_database()
    cursor = db.borrowings.find({}).sort([("issue_date", -1)])
    docs = await cursor.to_list(length=200)
    return [helper_format_borrowing(d) for d in docs]

@router.post("/issue", response_model=dict, status_code=status.HTTP_201_CREATED)
async def issue_book(req: BorrowingIssueRequest):
    db = await get_database()

    # 1. Find book using MongoDB ObjectId or string id
    book_query = ObjectId(req.book_id) if ObjectId.is_valid(req.book_id) else req.book_id
    book = await db.books.find_one({"_id": book_query})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # 2. Check available copies
    if book.get("available_copies", 0) <= 0:
        raise HTTPException(status_code=400, detail="No available copies of this book currently.")

    # 3. Find user
    user_query = ObjectId(req.user_id) if ObjectId.is_valid(req.user_id) else req.user_id
    user = await db.users.find_one({"_id": user_query})
    user_name = user.get("name") if user else "Student"
    user_email = user.get("email") if user else ""

    # 4. Decrease available copies
    await db.books.update_one({"_id": book_query}, {"$inc": {"available_copies": -1}})

    # 5. Dates
    issue_date = datetime.utcnow()
    if req.due_date:
        due_date = datetime.fromisoformat(req.due_date.replace("Z", "+00:00"))
    else:
        due_date = issue_date + timedelta(days=14)

    # 6. Create Borrowing document in MongoDB
    borrowing_doc = {
        "user_id": str(req.user_id),
        "book_id": str(req.book_id),
        "user_name": user_name,
        "user_email": user_email,
        "book_title": book.get("title", ""),
        "book_author": book.get("author", ""),
        "book_isbn": book.get("isbn", ""),
        "issue_date": issue_date,
        "due_date": due_date,
        "status": "borrowed",
        "renewal_count": 0,
        "fine_amount": 0.0,
        "is_fine_paid": True,
    }

    result = await db.borrowings.insert_one(borrowing_doc)
    borrowing_doc["_id"] = result.inserted_id

    # 7. Notify Student
    await create_user_notification(
        user_id=str(req.user_id),
        title="Book Issued Successfully",
        message=f'You have borrowed "{book.get("title")}". Due date: {due_date.strftime("%Y-%m-%d")}.',
        notification_type="announcement",
        link_to="/borrowings"
    )

    return helper_format_borrowing(borrowing_doc)

@router.post("/{borrowing_id}/return", response_model=dict)
async def return_book(borrowing_id: str):
    db = await get_database()
    bor_query = ObjectId(borrowing_id) if ObjectId.is_valid(borrowing_id) else borrowing_id

    borrowing = await db.borrowings.find_one({"_id": bor_query})
    if not borrowing:
        raise HTTPException(status_code=404, detail="Borrowing record not found")

    if borrowing.get("status") == "returned":
        raise HTTPException(status_code=400, detail="Book is already returned")

    # Restore book copy
    book_id = borrowing.get("book_id")
    book_query = ObjectId(book_id) if ObjectId.is_valid(book_id) else book_id
    book = await db.books.find_one({"_id": book_query})
    if book:
        await db.books.update_one({"_id": book_query}, {"$inc": {"available_copies": 1}})

        # Check pending reservations
        pending_res = await db.reservations.find_one({
            "book_id": str(book_id),
            "status": "pending"
        })
        if pending_res:
            await create_user_notification(
                user_id=str(pending_res["user_id"]),
                title="Reserved Book Available!",
                message=f'A copy of "{book.get("title")}" is now available at the desk.',
                notification_type="reservation_ready",
                link_to="/reservations"
            )

    return_date = datetime.utcnow()
    due_date = borrowing.get("due_date", return_date)

    overdue_days, fine_amount = await calculate_overdue_fine(due_date, return_date)

    fine_doc = None
    if fine_amount > 0:
        fine_rate = await get_fine_per_day_rate()
        fine_doc = {
            "user_id": borrowing.get("user_id"),
            "borrowing_id": str(borrowing["_id"]),
            "user_name": borrowing.get("user_name"),
            "book_title": borrowing.get("book_title"),
            "overdue_days": overdue_days,
            "fine_per_day": fine_rate,
            "amount": fine_amount,
            "status": "unpaid",
            "created_at": datetime.utcnow(),
        }
        res_fine = await db.fines.insert_one(fine_doc)
        fine_doc["id"] = str(res_fine.inserted_id)

        await create_user_notification(
            user_id=borrowing.get("user_id"),
            title="Overdue Fine Generated",
            message=f'Fine of ${fine_amount:.2f} generated for overdue return of "{borrowing.get("book_title")}".',
            notification_type="fine_added",
            link_to="/fines"
        )

    # Update borrowing record
    await db.borrowings.update_one(
        {"_id": bor_query},
        {
            "$set": {
                "return_date": return_date,
                "status": "returned",
                "fine_amount": fine_amount,
                "is_fine_paid": False if fine_amount > 0 else True,
            }
        }
    )

    updated_bor = await db.borrowings.find_one({"_id": bor_query})
    return {
        "borrowing": helper_format_borrowing(updated_bor),
        "fine": fine_doc
    }

@router.post("/{borrowing_id}/renew", response_model=dict)
async def renew_book(borrowing_id: str):
    db = await get_database()
    bor_query = ObjectId(borrowing_id) if ObjectId.is_valid(borrowing_id) else borrowing_id

    borrowing = await db.borrowings.find_one({"_id": bor_query})
    if not borrowing:
        raise HTTPException(status_code=404, detail="Borrowing record not found")

    if borrowing.get("status") not in ["borrowed", "renewed"]:
        raise HTTPException(status_code=400, detail="Only active borrowings can be renewed.")

    renewal_count = borrowing.get("renewal_count", 0)
    if renewal_count >= 2:
        raise HTTPException(status_code=400, detail="Maximum renewal limit (2) reached for this loan.")

    curr_due = borrowing.get("due_date", datetime.utcnow())
    if datetime.utcnow() > curr_due:
        raise HTTPException(status_code=400, detail="Overdue loans cannot be renewed online. Please visit library desk.")

    new_due = curr_due + timedelta(days=14)

    await db.borrowings.update_one(
        {"_id": bor_query},
        {
            "$set": {
                "due_date": new_due,
                "renewal_count": renewal_count + 1,
                "status": "renewed"
            }
        }
    )

    updated_bor = await db.borrowings.find_one({"_id": bor_query})
    return helper_format_borrowing(updated_bor)
