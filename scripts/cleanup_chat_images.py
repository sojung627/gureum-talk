"""Run daily: poetry run python -m scripts.cleanup_chat_images"""
from app.core.services.chat_images import cleanup_images
from app.db.database import SessionLocal

if __name__ == "__main__":
    with SessionLocal() as db:
        cleanup_images(db)
