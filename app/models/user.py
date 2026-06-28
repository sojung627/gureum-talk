from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base, get_db

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())