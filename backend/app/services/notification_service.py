from datetime import datetime
from backend.app.database.mongodb import get_database

async function create_user_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "announcement",
    link_to: str = None
):
    db = await get_database()
    if db is None:
        return

    doc = {
        "user_id": str(user_id),
        "title": title,
        "message": message,
        "type": notification_type,
        "is_read": False,
        "link_to": link_to,
        "created_at": datetime.utcnow()
    }
    await db.notifications.insert_one(doc)
