from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.database.mongodb import connect_to_mongo, close_mongo_connection
from backend.app.routes import auth, books, borrowings, reservations, resources, notifications, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to MongoDB on Startup
    await connect_to_mongo()
    yield
    # Close connection on Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="Digital Library Management System - MongoDB API",
    description="Asynchronous MongoDB RESTful API built with Python FastAPI, Motor, PyMongo, and Pydantic.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(books.router, prefix="/api/books", tags=["Books"])
app.include_router(borrowings.router, prefix="/api/borrowings", tags=["Borrowings"])
app.include_router(reservations.router, prefix="/api/reservations", tags=["Reservations"])
app.include_router(resources.router, prefix="/api/resources", tags=["Digital Resources"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin Analytics"])

@app.get("/")
async def root():
    return {
        "status": "online",
        "database": "MongoDB",
        "system": "Digital Library Management System API",
        "docs": "/docs"
    }
