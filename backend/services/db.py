import json
import os
import tempfile
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Any

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DB_FILE = DATA_DIR / "db.json"

_DB_LOCK = Lock()

ROLE_ALIASES = {
    "Public": "User",
    "public": "User",
    "user": "User",
    "Lead Analyst": "Analyst",
    "Traffic Flow Engineer": "Analyst",
    "City Planning Division": "User",
    "System Administrator": "Admin",
}


def normalize_role(role: str | None) -> str:
    if not role:
        return "User"
    normalized = ROLE_ALIASES.get(role, role)
    return normalized if normalized in {"Admin", "Analyst", "User"} else "User"


def normalize_user(user: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(user)
    normalized["email"] = normalized.get("email", "").strip().lower()
    normalized["name"] = normalized.get("name") or normalized["email"].split("@")[0] or "User"
    normalized["role"] = normalize_role(normalized.get("role"))
    normalized.setdefault("created_at", datetime.utcnow().isoformat())
    normalized.setdefault("last_login", None)
    normalized.setdefault("password_reset_token", None)
    normalized.setdefault("password_reset_expires", None)
    return normalized


def default_db() -> dict[str, Any]:
    from services.auth_handler import get_password_hash

    return {
        "users": [
            {
                "id": "admin-id",
                "name": "Administrator",
                "email": "admin@smart.com",
                "password": get_password_hash("admin123"),
                "role": "Admin",
                "created_at": datetime.utcnow().isoformat(),
                "last_login": None,
                "password_reset_token": None,
                "password_reset_expires": None,
            }
        ],
        "logs": [],
        "notifications": [
            {
                "id": "notif-1",
                "title": "Metropolitan Model Synchronized",
                "message": "The Random Forest prediction engine has successfully calibrated with the india_aqi_lite dataset. Multi-city telemetry is now 100% active.",
                "type": "success",
                "timestamp": datetime.utcnow().isoformat(),
                "user_email": "all",
                "sender": "system@nexus-mobility.io",
                "sender_role": "Core Protocol"
            },
            {
                "id": "notif-2",
                "title": "Annual Mobility Audit",
                "message": "The latest traffic trends for Q1 2026 are now available for review in the Reports section.",
                "type": "info",
                "timestamp": datetime.utcnow().isoformat(),
                "user_email": "all",
                "sender": "analyst@smart.com",
                "sender_role": "Lead Analyst"
            }
        ],
        "contacts": [],
        "user_activity": [],
        "bookmarks": [],
    }


def ensure_db_shape(db: dict[str, Any]) -> dict[str, Any]:
    shaped = default_db() | db
    shaped["users"] = [normalize_user(user) for user in shaped.get("users", []) if user.get("email")]
    shaped.setdefault("logs", [])
    shaped.setdefault("notifications", [])
    shaped.setdefault("contacts", [])
    shaped.setdefault("user_activity", [])
    shaped.setdefault("bookmarks", [])

    admin_found = any(user["email"] == "admin@smart.com" for user in shaped["users"])
    if not admin_found:
        shaped["users"].insert(0, default_db()["users"][0])

    return shaped


def save_db(data: dict[str, Any]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    normalized = ensure_db_shape(data)

    with _DB_LOCK:
        try:
            with tempfile.NamedTemporaryFile(
                "w",
                delete=False,
                dir=DATA_DIR,
                encoding="utf-8",
                suffix=".json",
            ) as temp_file:
                json.dump(normalized, temp_file, indent=4)
                temp_path = temp_file.name
            os.replace(temp_path, DB_FILE)
        except Exception as e:
            print(f"Error saving database: {e}")
            # Fallback to direct write if atomic replace fails
            with open(DB_FILE, 'w', encoding='utf-8') as f:
                json.dump(normalized, f, indent=4)


def get_db() -> dict[str, Any]:
    if not DB_FILE.exists():
        db = default_db()
        save_db(db)
        return db

    try:
        with DB_FILE.open("r", encoding="utf-8") as file:
            db = ensure_db_shape(json.load(file))
    except (json.JSONDecodeError, OSError):
        db = default_db()

    save_db(db)
    return db


def get_users() -> list[dict[str, Any]]:
    return get_db().get("users", [])


def get_user_by_email(email: str) -> dict[str, Any] | None:
    normalized_email = email.strip().lower()
    for user in get_users():
        if user["email"] == normalized_email:
            return user
    return None


def add_user(user: dict[str, Any]) -> None:
    db = get_db()
    db["users"].append(normalize_user(user))
    save_db(db)


def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    for user in get_users():
        if user["id"] == user_id:
            return user
    return None


def update_user(user_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    db = get_db()
    for index, user in enumerate(db["users"]):
        if user["id"] == user_id:
            merged_user = normalize_user(user | updates)
            db["users"][index] = merged_user
            save_db(db)
            return merged_user
    return None


def delete_user(user_id: str) -> None:
    db = get_db()
    db["users"] = [user for user in db["users"] if user["id"] != user_id]
    save_db(db)


def get_notifications(user_email: str | None = None) -> list[dict[str, Any]]:
    notifications = get_db().get("notifications", [])
    if user_email:
        normalized_email = user_email.strip().lower()
        return [
            notification
            for notification in notifications
            if notification.get("user_email") in {"all", normalized_email}
        ]
    return notifications


def add_notification(notification: dict[str, Any]) -> None:
    db = get_db()
    db["notifications"].append(notification)
    save_db(db)


def mark_notification_read(notif_id: str, user_email: str) -> bool:
    db = get_db()
    normalized_email = user_email.strip().lower()
    for notification in db.get("notifications", []):
        if notification["id"] == notif_id:
            notification.setdefault("read_by", [])
            if normalized_email not in notification["read_by"]:
                notification["read_by"].append(normalized_email)
            save_db(db)
            return True
    return False


def add_contact(contact: dict[str, Any]) -> None:
    db = get_db()
    db["contacts"].append(contact)
    save_db(db)


def get_contacts() -> list[dict[str, Any]]:
    return get_db().get("contacts", [])


def log_activity(activity: dict[str, Any]) -> None:
    db = get_db()
    db["user_activity"].append(activity)
    save_db(db)


def get_activity_logs(limit: int = 100) -> list[dict[str, Any]]:
    return get_db().get("user_activity", [])[-limit:]


def add_log(log: dict[str, Any]) -> None:
    db = get_db()
    db["logs"].append(log)
    save_db(db)


def get_logs(limit: int = 100) -> list[dict[str, Any]]:
    return get_db().get("logs", [])[-limit:]


def get_bookmarks(user_email: str) -> list[dict[str, Any]]:
    normalized_email = user_email.strip().lower()
    return [
        bookmark
        for bookmark in get_db().get("bookmarks", [])
        if bookmark.get("user_email") == normalized_email
    ]


def add_bookmark(bookmark: dict[str, Any]) -> None:
    db = get_db()
    normalized_bookmark = dict(bookmark)
    normalized_bookmark["user_email"] = normalized_bookmark.get("user_email", "").strip().lower()

    existing = {
        saved["city"].lower()
        for saved in db.get("bookmarks", [])
        if saved.get("user_email") == normalized_bookmark["user_email"]
    }
    if normalized_bookmark.get("city", "").lower() not in existing:
        db["bookmarks"].append(normalized_bookmark)
        save_db(db)


def remove_bookmark(user_email: str, city: str) -> None:
    normalized_email = user_email.strip().lower()
    normalized_city = city.strip().lower()
    db = get_db()
    db["bookmarks"] = [
        bookmark
        for bookmark in db.get("bookmarks", [])
        if not (
            bookmark.get("user_email") == normalized_email
            and bookmark.get("city", "").strip().lower() == normalized_city
        )
    ]
    save_db(db)
