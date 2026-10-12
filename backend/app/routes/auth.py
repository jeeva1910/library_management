from fastapi import APIRouter, HTTPException, status, Depends
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os
from bson import ObjectId

from backend.app.database.mongodb import get_database
from backend.app.schemas.user import UserCreate, UserLogin, UserResponse

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_jwt_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=1440)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate):
    db = await get_database()
    
    # Check duplicate email in MongoDB
    existing = await db.users.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user_doc = {
        "name": user_in.name,
        "email": user_in.email.lower(),
        "password_hash": hash_password(user_in.password),
        "role": user_in.role if user_in.role in ["student", "librarian", "admin"] else "student",
        "student_id": user_in.student_id or f"STD{int(datetime.utcnow().timestamp())}",
        "department": user_in.department or "General Studies",
        "phone": user_in.phone or "",
        "is_active": True,
        "created_at": datetime.utcnow(),
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token({"sub": user_id, "email": user_doc["email"], "role": user_doc["role"]})

    user_response = {
        "id": user_id,
        "name": user_doc["name"],
        "email": user_doc["email"],
        "role": user_doc["role"],
        "studentId": user_doc["student_id"],
        "department": user_doc["department"],
        "phone": user_doc["phone"],
        "isActive": user_doc["is_active"],
        "createdAt": user_doc["created_at"].isoformat(),
    }

    return {"token": token, "user": user_response}

@router.post("/login", response_model=dict)
async def login_user(credentials: UserLogin):
    db = await get_database()
    
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "email": user["email"], "role": user["role"]})

    user_response = {
        "id": user_id,
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "studentId": user.get("student_id"),
        "department": user.get("department"),
        "phone": user.get("phone"),
        "isActive": user.get("is_active", True),
        "createdAt": user.get("created_at", datetime.utcnow()).isoformat(),
    }

    return {"token": token, "user": user_response}
