from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="student") # "student" or "admin"
    student_id = Column(String, nullable=True)
    department = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    borrowings = relationship("Borrowing", back_populates="user")
    reservations = relationship("Reservation", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    fines = relationship("Fine", back_populates="user")

class Book(Base):
    __tablename__ = "books"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    author = Column(String, nullable=False, index=True)
    isbn = Column(String, unique=True, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    publisher = Column(String, nullable=True)
    publication_year = Column(Integer, nullable=True)
    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)
    description = Column(String, nullable=True)
    location_rack = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    borrowings = relationship("Borrowing", back_populates="book")
    reservations = relationship("Reservation", back_populates="book")

class Borrowing(Base):
    __tablename__ = "borrowings"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    book_id = Column(String, ForeignKey("books.id"), nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime, nullable=True)
    status = Column(String, default="borrowed") # "borrowed", "returned", "overdue", "renewed"
    renewal_count = Column(Integer, default=0)
    fine_amount = Column(Float, default=0.0)

    user = relationship("User", back_populates="borrowings")
    book = relationship("Book", back_populates="borrowings")
    fine = relationship("Fine", back_populates="borrowing", uselist=False)

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    book_id = Column(String, ForeignKey("books.id"), nullable=False)
    reservation_date = Column(DateTime, default=datetime.utcnow)
    queue_position = Column(Integer, default=1)
    status = Column(String, default="pending") # "pending", "fulfilled", "cancelled"

    user = relationship("User", back_populates="reservations")
    book = relationship("Book", back_populates="reservations")

class DigitalResource(Base):
    __tablename__ = "digital_resources"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, nullable=False)
    resource_url = Column(String, nullable=False)
    access_type = Column(String, default="all") # "all", "student", "faculty"
    file_type = Column(String, default="pdf")
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="announcement")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Fine(Base):
    __tablename__ = "fines"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    borrowing_id = Column(String, ForeignKey("borrowings.id"), nullable=False)
    overdue_days = Column(Integer, default=0)
    fine_per_day = Column(Float, default=0.50)
    amount = Column(Float, nullable=False)
    status = Column(String, default="unpaid") # "unpaid", "paid", "waived"
    paid_at = Column(DateTime, nullable=True)
    transaction_ref = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="fines")
    borrowing = relationship("Borrowing", back_populates="fine")
