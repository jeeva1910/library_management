# Digital Library Management System - MongoDB FastAPI Backend

This directory contains the asynchronous **FastAPI + MongoDB** backend implementation for the Digital Library Management System capstone project, using **Motor** (the async MongoDB driver), **PyMongo**, and **Pydantic**.

---

## 🛠 Tech Stack

- **Framework**: Python FastAPI
- **Database**: MongoDB (MongoDB Atlas or Local MongoDB)
- **MongoDB Driver**: Motor (`motor.motor_asyncio`) & PyMongo
- **Data Validation**: Pydantic v2
- **Authentication**: JWT Tokens & Bcrypt Password Hashing (`passlib`)

---

## 🚀 Setup & Execution Guide

### Step 1. Create a MongoDB Atlas Database Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2. In **Database Access**, create a database user (e.g., `lib_admin` / `securepassword`).
3. In **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere).
4. Click **Connect** > **Drivers** > Copy your MongoDB connection string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`

### Step 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and paste your `MONGODB_URI`:
```env
MONGODB_URI=mongodb+srv://lib_admin:securepassword@cluster0.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=digital_library
JWT_SECRET=super_secret_jwt_key_2026
ALGORITHM=HS256
FINE_PER_DAY=0.50
```

### Step 3. Install Python Dependencies
```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 4. Run MongoDB Seed Script
Populate your MongoDB Atlas cluster with demo users, books, borrowings, fines, and resources:
```bash
python seed.py
```

### Step 5. Launch FastAPI Server
```bash
uvicorn backend.app.main:app --reload --port 8000
```
View interactive Swagger API Docs at:
`http://localhost:8000/docs`

---

## 📂 MongoDB Collections & Indexing

- **`users`**: Unique index on `email`. Roles: `student`, `librarian`, `admin`.
- **`books`**: Indexed on `isbn` (unique), `title`, `author`, `category`, and `TEXT` multi-field search index.
- **`borrowings`**: Indexed on `user_id`, `book_id`, `status`.
- **`reservations`**: Active student book queue position tracker.
- **`digital_resources`**: Authorized PDFs, e-books, and research links.
- **`notifications`**: Student alerts and broadcast announcements.
- **`fines`**: Overdue fine calculation ledger (`overdue_days * fine_per_day`).
