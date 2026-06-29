from sqlalchemy import Column, BigInteger, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(BigInteger, primary_key=True, index=True)
    user_login_id = Column(String(50), unique=True, nullable=False)
    user_name = Column(String(50), nullable=False)
    user_tel = Column(String(20), unique=True, nullable=False)
    user_email = Column(String(100), unique=True, nullable=False)
    user_password_hash = Column(String(255), nullable=False)
    user_created_at = Column(DateTime(timezone=True), server_default=func.now())