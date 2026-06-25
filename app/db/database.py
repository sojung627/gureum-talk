#
# database.py == 테이블 조회 및 저장 용도 !!!

# 프론트 서버 열기 - npm run dev
# 백엔드 서버 열기 - poetry run fastapi dev app/main.py

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# PostgreSQL 연결
engine = create_engine (
    settings.database_url,
    pool_pre_ping=True,
)

# DB 작업 중 세션 만듦
SessionLocal = sessionmaker (
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)

# API 요청마다 세션 열기
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()