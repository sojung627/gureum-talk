from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.sql import func

from app.db.database import Base


class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    chat_room_id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(
        BigInteger,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chat_title = Column(
        String(150),
        nullable=False,
        default="새로운 대화",
    )
    chat_is_pinned = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )
    chat_pinned_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )
    chat_created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    chat_updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    chat_message_id = Column(BigInteger, primary_key=True, index=True)
    chat_room_id = Column(
        BigInteger,
        ForeignKey("chat_rooms.chat_room_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender_role = Column(String(20), nullable=False)
    message_type = Column(
        String(20),
        nullable=False,
        default="TEXT",
    )
    chat_content = Column(Text, nullable=True)
    voice_file_path = Column(String(512), nullable=True)
    chat_message_created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
