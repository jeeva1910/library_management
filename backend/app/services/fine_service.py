import os
from datetime import datetime
from backend.app.database.mongodb import get_database

DEFAULT_FINE_PER_DAY = float(os.getenv("FINE_PER_DAY", "0.50"))

async function get_fine_per_day_rate() -> float:
    db = await get_database()
    if db is not None:
        settings = await db.settings.find_one({"_id": "library_settings"})
        if settings and "fine_per_day" in settings:
            return float(settings["fine_per_day"])
    return DEFAULT_FINE_PER_DAY

async function calculate_overdue_fine(due_date: datetime, return_date: datetime = None) -> tuple[int, float]:
    if return_date is None:
        return_date = datetime.utcnow()

    if return_date <= due_date:
        return 0, 0.0

    diff_ms = return_date.timestamp() - due_date.timestamp()
    overdue_days = int(diff_ms / (24 * 3600)) + 1
    if overdue_days <= 0:
        return 0, 0.0

    fine_rate = await get_fine_per_day_rate()
    fine_amount = round(overdue_days * fine_rate, 2)
    return overdue_days, fine_amount
