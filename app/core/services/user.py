from datetime import datetime, timedelta
from itertools import count

import bcrypt
from sqlalchemy.orm import Session
from app.models.user import User
import re

#로그인 실패 횟수 저장
_login_attempts: dict[str, dict] = {}

#로그인 실패 횟수 / 시간
MAX_ATTEMPTS = 5
LOCK_MINUTES = 5

#회원가입 제약조건
USERNAME_PATTERN = re.compile(r"^[a-z0-9]{5,15}$")
PASSWORD_PATTERN = re.compile(r"^(?=.*[a-z])(?=.*[0-9])[a-z0-9]{5,15}$")
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

#입력한 비번과 실제 비번(암호화)이 맞는지 검사 후 결과 알려줘
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

#로그인
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

#회원가입 - 비밀번호
def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

#회원가입
def register_user(db: Session, name: str, username: str, password: str, password_confirm: str, phone: str, email: str):
    #빈칸 체크
    if not name.strip() or not username.strip() or not password.strip() or not password_confirm.strip() or not phone.strip() or not email.strip():
        return None, "모든 항목을 입력해주세요.", "common"

    #아이디 중복 체크
    if db.query(User).filter(User.user_login_id == username).first():
        return None, "이미 사용 중인 아이디입니다.", "username"

    #비밀번호 제약조건 - 영소문자 + 숫자, 5~15자
    if not PASSWORD_PATTERN.match(password):
        return None, "비밀번호는 영문 소문자와 숫자를 포함해 5~15자로 입력해주세요.", "password"

    #비밀번호 확인 일치 체크
    if password != password_confirm:
        return None, "비밀번호가 일치하지 않습니다.", "password_confirm"

    #이메일 형식 체크
    if not EMAIL_PATTERN.match(email):
        return None, "올바른 이메일 형식이 아닙니다.", "email"

    #이메일 중복 체크
    if db.query(User).filter(User.user_email == email).first():
        return None, "이미 사용 중인 이메일입니다.", "email"

    #전화번호 중복 체크
    if db.query(User).filter(User.user_tel == phone).first():
        return None, "이미 사용 중인 전화번호입니다.", "phone"

    new_user = User(
        user_login_id=username,
        user_name=name,
        user_tel=phone,
        user_email=email,
        user_password_hash=hash_password(password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user, None, None