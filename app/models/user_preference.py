from sqlalchemy import BigInteger, Boolean, Column, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db.database import Base


class UserPreference(Base):
    __tablename__ = "user_preferences"

    user_id = Column(
        BigInteger,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        primary_key=True,
    )
    voice_chat_panel_open = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
