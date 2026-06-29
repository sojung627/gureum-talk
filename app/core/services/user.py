from datetime import datetime, timedelta
from itertools import count

import bcrypt
from sqlalchemy.orm import Session
from app.models.user import User

#로그인 실패 횟수 저장
_login_attempts: dict[str, dict] = {}

MAX_ATTEMPTS = 5
LOCK_MINUTES = 5

#입력한 비번과 실제 비번(암호화)이 맞는지 검사 후 결과 알려줘
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def login_user(db: Session, username: str, password: str):
    now = datetime.now() #현시간 저장
    attempt_info = _login_attempts.get(username, {"count":0, "locked_until":None}) #로그인 실패 기록 + 로그인 잠금 x

    #로그인 잠긴 경우
    if attempt_info["locked_until"] and now < attempt_info["locked_until"]:
        #로그인 몇 분 뒤 가능한지 계산
        remaining = int((attempt_info["locked_until"] - now).total_seconds())
        return None, "잠금 상태입니다.", True, remaining, 0

    #로그인 잠금 풀 때 --> 실패횟수 0 / 잠금 여부 none으로 바꿈
    if attempt_info["locked_until"] and now >= attempt_info["locked_until"]:
        _login_attempts[username] = {"count":0, "locked_until":None}
        attempt_info = _login_attempts[username]

    #user 테이블에서 user_login_id랑 username이랑 같은 사람을 찾아라
    user = db.query(User).filter(User.user_login_id == username).first()

    #아이디 + 비번 틀린경우 + 없는 경우 // password.lower() == 대소문자 통일
    if not user or not verify_password(password.lower(), user.user_password_hash):
        attempt_info["count"] += 1
        _login_attempts[username] = attempt_info
        count = attempt_info["count"]

        #5회 이상 틀렸다면
        if count >= MAX_ATTEMPTS:
            _login_attempts[username]["locked_until"] = now + timedelta(minutes=LOCK_MINUTES)
            remaining = LOCK_MINUTES * 60
            return None, "로그인 5회 실패로 5분간 잠금됩니다.", True, remaining, count

        #5회 이상 안틀렸다면
        return None, "아이디 혹은 비밀번호가 올바르지 않습니다.", False, 0, count

    #로그인 성공 시 그동안 실패한 횟수 리셋
    _login_attempts[username] = {"count": 0, "locked_until": None}
    return user, None, False, 0, 0