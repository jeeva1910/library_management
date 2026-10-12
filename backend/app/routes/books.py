from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from backend.app.database.mongodb import get_database
from backend.app.schemas.book import BookCreate, BookUpdate, BookResponse

router = APIRouter()

def helper_format_book(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "title": doc["title"],
        "author": doc["author"],
        "isbn": doc["isbn"],
        "category": doc["category"],
        "publisher": doc.get("publisher", "Academic Press"),
        "publicationYear": doc.get("publication_year", 2024),
        "totalCopies": doc.get("total_copies", 1),
        "availableCopies": doc.get("available_copies", 1),
        "description": doc.get("description", ""),
        "locationRack": doc.get("location_rack", "GEN-A1-01"),
        "coverGradient": doc.get("cover_gradient", "from-blue-700 via-indigo-800 to-slate-900"),
        "createdAt": doc.get("created_at", datetime.utcnow()).isoformat(),
        "updatedAt": doc.get("updated_at", datetime.utcnow()).isoformat(),
    }

@router.get("", response_model=List[dict])
async def list_books(
    search: Optional[str] = Query(None, description="Search by title, author, category, ISBN, or keywords"),
    category: Optional[str] = Query(None, description="Filter by book category"),
    availableOnly: Optional[bool] = Query(False, description="Filter available copies > 0"),
    sortBy: Optional[str] = Query("title", description="Sort by title, author, year, availability"),
):
    db = await get_database()
    query_filter = {}

    # MongoDB Query Filters
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query_filter["$or"] = [
            {"title": search_regex},
            {"author": search_regex},
            {"category": search_regex},
            {"isbn": search_regex},
            {"description": search_regex},
        ]

    if category and category != "All":
        query_filter["category"] = {"$regex": f"^{category}$", "$options": "i"}

    if availableOnly:
        query_filter["available_copies"] = {"$gt": 0}

    # Sorting
    sort_spec = [("title", 1)]
    if sortBy == "author":
        sort_spec = [("author", 1)]
    elif sortBy == "year":
        sort_spec = [("publication_year", -1)]
    elif sortBy == "availability":
        sort_spec = [("available_copies", -1)]

    cursor = db.books.find(query_filter).sort(sort_spec)
    books_docs = await cursor.to_list(length=200)

    return [helper_format_book(b) for b in books_docs]

@router.get("/{book_id}", response_model=dict)
async def get_book_by_id(book_id: str):
    db = await get_database()
    try:
        obj_id = ObjectId(book_id) if ObjectId.is_valid(book_id) else book_id
        book = await db.books.find_one({"_id": obj_id})
    except Exception:
        book = await db.books.find_one({"_id": book_id})

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    return helper_format_book(book)

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_book(book_in: BookCreate):
    db = await get_database()

    # Check duplicate ISBN in MongoDB
    existing_isbn = await db.books.find_one({"isbn": book_in.isbn})
    if existing_isbn:
        raise HTTPException(status_code=400, detail="A book with this ISBN already exists")

    total = max(1, book_in.total_copies)
    now = datetime.utcnow()

    doc = {
        "title": book_in.title,
        "author": book_in.author,
        "isbn": book_in.isbn,
        "category": book_in.category,
        "publisher": book_in.publisher or "Academic Press",
        "publication_year": book_in.publication_year or now.year,
        "total_copies": total,
        "available_copies": total,
        "description": book_in.description or "",
        "location_rack": book_in.location_rack or "GEN-A1-01",
        "cover_gradient": "from-blue-700 via-indigo-800 to-slate-900",
        "created_at": now,
        "updated_at": now,
    }

    result = await db.books.insert_one(doc)
    doc["_id"] = result.inserted_id

    return helper_format_book(doc)

@router.put("/{book_id}", response_model=dict)
async def update_book(book_id: str, book_update: BookUpdate):
    db = await get_database()
    query_id = ObjectId(book_id) if ObjectId.is_valid(book_id) else book_id

    existing = await db.books.find_one({"_id": query_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Book not found")

    update_fields = {}
    for k, v in book_update.dict(exclude_unset=True).items():
        if v is not None:
            update_fields[k] = v

    update_fields["updated_at"] = datetime.utcnow()

    await db.books.update_one({"_id": query_id}, {"$set": update_fields})
    updated_doc = await db.books.find_one({"_id": query_id})

    return helper_format_book(updated_doc)

@router.delete("/{book_id}", response_model=dict)
async def delete_book(book_id: str):
    db = await get_database()
    query_id = ObjectId(book_id) if ObjectId.is_valid(book_id) else book_id

    result = await db.books.delete_one({"_id": query_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")

    return {"message": "Book deleted successfully"}
