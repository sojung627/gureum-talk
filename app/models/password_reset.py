from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Index,
    String,
)
from sqlalchemy.sql import func

from app.db.database import Base


class PasswordResetVerification(Base):
    __tablename__ = "password_reset_verifications"

    request_id = Column(String(64), primary_key=True)
    user_id = Column(
        BigInteger,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    code_hash = Column(String(64), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    attempt_count = Column(Integer, nullable=False, default=0)
    is_verified = Column(Boolean, nullable=False, default=False)
    reset_token_hash = Column(String(64), nullable=True, unique=True)
    reset_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


Index(
    "idx_password_reset_user_created",
    PasswordResetVerification.user_id,
    PasswordResetVerification.created_at.desc(),
)
