from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def login_user(db: Session, username: str, password: str):
    # 아이디 존재 여부 확인
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None, "아이디 또는 비밀번호가 올바르지 않습니다."

    # 비밀번호 확인
    if not verify_password(password, user.password):
        return None, "아이디 또는 비밀번호가 올바르지 않습니다."

    return user, None