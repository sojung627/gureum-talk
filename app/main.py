from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.core.error.error_handlers import register_error_handlers
from app.core.routers import chat as chat_router
from app.db.database import get_db
from app.core.routers import user as user_router

app = FastAPI(
    title="GureumTalk API"
)

# 공통 오류 처리
register_error_handlers(app)

# 로그인 세션 설정
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret_key,
    session_cookie="gureumtalk_session",
    max_age=60 * 60 * 24 * 7,
    same_site="lax",
    https_only=False,
)

# API 요청 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 사용자 및 AI 라우터 등록
app.include_router(user_router.router)
app.include_router(chat_router.router)

@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "message": "GureumTalk API is running"
    }


@app.get("/db-test")
def test_database(
        db: Session = Depends(get_db),
) -> dict[str, str]:
    db.execute(
        text("SELECT 1"),
    )
    return {
        "message": "PostgreSQL connection success",
    }