from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 메모리 기반 실패 추적 { user_login_id: {"count": int, "locked_until": datetime | None} }
_login_attempts: dict[str, dict] = {}

MAX_ATTEMPTS = 5
LOCK_MINUTES = 5


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def login_user(db: Session, username: str, password: str):
    """
    반환: (user | None, error_message | None, locked | False, remaining_seconds | 0)
    """
    now = datetime.now()
    attempt_info = _login_attempts.get(username, {"count": 0, "locked_until": None})

    # 잠금 상태 확인
    if attempt_info["locked_until"] and now < attempt_info["locked_until"]:
        remaining = int((attempt_info["locked_until"] - now).total_seconds())
        return None, "잠금 상태입니다.", True, remaining

    # 잠금 해제된 경우 초기화
    if attempt_info["locked_until"] and now >= attempt_info["locked_until"]:
        _login_attempts[username] = {"count": 0, "locked_until": None}
        attempt_info = _login_attempts[username]

    # 사용자 조회
    user = db.query(User).filter(User.user_login_id == username).first()
    if not user or not verify_password(password, user.user_password_hash):
        attempt_info["count"] += 1
        _login_attempts[username] = attempt_info

        if attempt_info["count"] >= MAX_ATTEMPTS:
            _login_attempts[username]["locked_until"] = now + timedelta(minutes=LOCK_MINUTES)
            remaining = LOCK_MINUTES * 60
            return None, "로그인 5회 실패로 5분간 잠금됩니다.", True, remaining

        return None, "아이디 혹은 비밀번호가 올바르지 않습니다.", False, 0

    # 로그인 성공 시 초기화
    _login_attempts[username] = {"count": 0, "locked_until": None}
    return user, None, False, 0