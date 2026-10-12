import asyncio
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "digital_library")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_pw(pw: str) -> str:
    return pwd_context.hash(pw)

async function seed_database():
    print(f"Connecting to MongoDB database '{DATABASE_NAME}' at {MONGODB_URI}...")
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]

    print("Seeding initial MongoDB documents...")

    # 1. Seed Users (1 Admin, 1 Librarian, 3 Students)
    users_data = [
        {
            "_id": "usr_admin1",
            "name": "Dr. Eleanor Vance",
            "email": "admin@library.edu",
            "password_hash": hash_pw("admin123"),
            "role": "admin",
            "department": "Library Administration",
            "phone": "+1 (555) 019-2831",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": "usr_lib1",
            "name": "Sarah Connor",
            "email": "librarian@library.edu",
            "password_hash": hash_pw("lib123"),
            "role": "librarian",
            "department": "Circulation Desk",
            "phone": "+1 (555) 321-7788",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": "usr_std1",
            "name": "Alex Johnson",
            "email": "alex.johnson@student.edu",
            "password_hash": hash_pw("student123"),
            "role": "student",
            "student_id": "CS20240891",
            "department": "Computer Science",
            "phone": "+1 (555) 432-8901",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": "usr_std2",
            "name": "Maya Lin",
            "email": "maya.lin@student.edu",
            "password_hash": hash_pw("student123"),
            "role": "student",
            "student_id": "BE20240122",
            "department": "Bioengineering",
            "phone": "+1 (555) 781-3342",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": "usr_std3",
            "name": "David Chen",
            "email": "david.chen@student.edu",
            "password_hash": hash_pw("student123"),
            "role": "student",
            "student_id": "ME20240455",
            "department": "Mechanical Engineering",
            "phone": "+1 (555) 902-1188",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]

    for u in users_data:
        await db.users.update_one({"_id": u["_id"]}, {"$set": u}, upsert=True)

    print("Users seeded.")

    # 2. Seed Books
    books_data = [
        {
            "_id": "bk_001",
            "title": "Introduction to Algorithms (4th Edition)",
            "author": "Thomas H. Cormen, Charles E. Leiserson",
            "isbn": "978-0262046305",
            "category": "Computer Science",
            "publisher": "MIT Press",
            "publication_year": 2022,
            "total_copies": 6,
            "available_copies": 3,
            "description": "Comprehensive modern textbook covering algorithms in depth.",
            "location_rack": "CS-A1-04",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "bk_002",
            "title": "Deep Learning & Neural Networks",
            "author": "Ian Goodfellow, Yoshua Bengio",
            "isbn": "978-0262035613",
            "category": "Artificial Intelligence",
            "publisher": "MIT Press",
            "publication_year": 2021,
            "total_copies": 5,
            "available_copies": 1,
            "description": "Essential textbook on deep learning math and architectures.",
            "location_rack": "AI-B2-12",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "bk_003",
            "title": "Principles of Quantum Mechanics",
            "author": "R. Shankar",
            "isbn": "978-0306447908",
            "category": "Physics",
            "publisher": "Springer",
            "publication_year": 2020,
            "total_copies": 4,
            "available_copies": 2,
            "description": "Mathematical introduction to quantum mechanical principles.",
            "location_rack": "PHY-C3-08",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "bk_004",
            "title": "Clean Code: A Handbook of Agile Craftsmanship",
            "author": "Robert C. Martin",
            "isbn": "978-0132350884",
            "category": "Computer Science",
            "publisher": "Prentice Hall",
            "publication_year": 2020,
            "total_copies": 4,
            "available_copies": 0,
            "description": "Handbook of software craft and refactoring principles.",
            "location_rack": "CS-A2-01",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "bk_005",
            "title": "Principles of Modern Macroeconomics",
            "author": "N. Gregory Mankiw",
            "isbn": "978-0357722961",
            "category": "Economics & Business",
            "publisher": "Cengage Learning",
            "publication_year": 2023,
            "total_copies": 7,
            "available_copies": 5,
            "description": "Exploration of macroeconomic theory and monetary policy.",
            "location_rack": "ECO-D1-15",
            "created_at": datetime.utcnow()
        }
    ]

    for b in books_data:
        await db.books.update_one({"_id": b["_id"]}, {"$set": b}, upsert=True)

    print("Books seeded.")

    # 3. Seed Borrowings
    borrowings_data = [
        {
            "_id": "bor_101",
            "user_id": "usr_std1",
            "book_id": "bk_004",
            "user_name": "Alex Johnson",
            "user_email": "alex.johnson@student.edu",
            "book_title": "Clean Code: A Handbook of Agile Craftsmanship",
            "book_author": "Robert C. Martin",
            "book_isbn": "978-0132350884",
            "issue_date": datetime.utcnow() - timedelta(days=26),
            "due_date": datetime.utcnow() - timedelta(days=12),
            "status": "overdue",
            "renewal_count": 0,
            "fine_amount": 6.00,
            "is_fine_paid": False
        },
        {
            "_id": "bor_102",
            "user_id": "usr_std1",
            "book_id": "bk_001",
            "user_name": "Alex Johnson",
            "user_email": "alex.johnson@student.edu",
            "book_title": "Introduction to Algorithms (4th Edition)",
            "book_author": "Thomas H. Cormen",
            "book_isbn": "978-0262046305",
            "issue_date": datetime.utcnow() - timedelta(days=5),
            "due_date": datetime.utcnow() + timedelta(days=9),
            "status": "borrowed",
            "renewal_count": 0,
            "fine_amount": 0.0,
            "is_fine_paid": True
        }
    ]

    for bor in borrowings_data:
        await db.borrowings.update_one({"_id": bor["_id"]}, {"$set": bor}, upsert=True)

    print("Borrowings seeded.")

    # 4. Seed Fines
    fines_data = [
        {
            "_id": "fine_501",
            "user_id": "usr_std1",
            "borrowing_id": "bor_101",
            "user_name": "Alex Johnson",
            "book_title": "Clean Code: A Handbook of Agile Craftsmanship",
            "overdue_days": 12,
            "fine_per_day": 0.50,
            "amount": 6.00,
            "status": "pending",
            "created_at": datetime.utcnow()
        }
    ]

    for f in fines_data:
        await db.fines.update_one({"_id": f["_id"]}, {"$set": f}, upsert=True)

    print("Fines seeded.")

    # 5. Settings
    settings_data = {
        "_id": "library_settings",
        "fine_per_day": 0.50,
        "max_loan_days": 14,
        "max_books_per_student": 5,
        "library_name": "Apex University Digital Library",
        "contact_email": "library@apex.edu"
    }
    await db.settings.update_one({"_id": settings_data["_id"]}, {"$set": settings_data}, upsert=True)

    print("Settings seeded.")
    print("MongoDB Database seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_database())
