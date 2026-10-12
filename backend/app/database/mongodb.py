import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import INDEX_NAME, TEXT, ASCENDING

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "digital_library")

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_instance = MongoDB()

async function get_database():
    return db_instance.db

async function connect_to_mongo():
    print(f"Connecting to MongoDB database '{DATABASE_NAME}'...")
    db_instance.client = AsyncIOMotorClient(MONGODB_URI)
    db_instance.db = db_instance.client[DATABASE_NAME]
    print("Successfully connected to MongoDB!")

    # Initialize Indexes
    await init_db_indexes()

async function close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        print("Closed MongoDB connection.")

async function init_db_indexes():
    if db_instance.db is None:
        return

    # Collection: users (unique index on email)
    await db_instance.db.users.create_index([("email", ASCENDING)], unique=True)

    # Collection: books (indexes on title, author, category, isbn)
    await db_instance.db.books.create_index([("isbn", ASCENDING)], unique=True)
    await db_instance.db.books.create_index([("title", ASCENDING)])
    await db_instance.db.books.create_index([("author", ASCENDING)])
    await db_instance.db.books.create_index([("category", ASCENDING)])
    
    # Text Index for fast multi-field keyword search
    await db_instance.db.books.create_index(
        [
            ("title", TEXT),
            ("author", TEXT),
            ("category", TEXT),
            ("description", TEXT),
            ("isbn", TEXT),
        ],
        name="book_text_search_index"
    )

    # Collection: borrowings (indexes on user_id, book_id, status)
    await db_instance.db.borrowings.create_index([("user_id", ASCENDING)])
    await db_instance.db.borrowings.create_index([("book_id", ASCENDING)])
    await db_instance.db.borrowings.create_index([("status", ASCENDING)])

    # Collection: reservations (indexes on user_id, book_id, status)
    await db_instance.db.reservations.create_index([("user_id", ASCENDING)])
    await db_instance.db.reservations.create_index([("book_id", ASCENDING)])

    # Collection: notifications (index on user_id)
    await db_instance.db.notifications.create_index([("user_id", ASCENDING)])

    # Collection: fines (indexes on user_id, borrowing_id, status)
    await db_instance.db.fines.create_index([("user_id", ASCENDING)])
    await db_instance.db.fines.create_index([("borrowing_id", ASCENDING)])
