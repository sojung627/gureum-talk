from datetime import datetime, timedelta
import bcrypt
from sqlalchemy.orm import Session
from app.models.user import User

_login_attempts: dict[str, dict] = {}

MAX_ATTEMPTS = 5
LOCK_MINUTES = 5


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def login_user(db: Session, username: str, password: str):
    now = datetime.now()
    attempt_info = _login_attempts.get(username, {"count": 0, "locked_until": None})

    if attempt_info["locked_until"] and now < attempt_info["locked_until"]:
        remaining = int((attempt_info["locked_until"] - now).total_seconds())
        return None, "잠금 상태입니다.", True, remaining, 0

    if attempt_info["locked_until"] and now >= attempt_info["locked_until"]:
        _login_attempts[username] = {"count": 0, "locked_until": None}
        attempt_info = _login_attempts[username]

    user = db.query(User).filter(User.user_login_id == username).first()

    if not user or not verify_password(password.lower(), user.user_password_hash):
        attempt_info["count"] += 1
        _login_attempts[username] = attempt_info
        count = attempt_info["count"]

        if count >= MAX_ATTEMPTS:
            _login_attempts[username]["locked_until"] = now + timedelta(minutes=LOCK_MINUTES)
            remaining = LOCK_MINUTES * 60
            return None, "로그인 5회 실패로 5분간 잠금됩니다.", True, remaining, count

        return None, "아이디 혹은 비밀번호가 올바르지 않습니다.", False, 0, count

    _login_attempts[username] = {"count": 0, "locked_until": None}
    return user, None, False, 0, 0