from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from fastapi_cloud_cli.utils.api import attempt
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.schemas.user import UserLoginRequest, UserLoginResponse
from app.core.services.user import login_user
from app.core.schemas.user import UserRegisterRequest, UserRegisterResponse
from app.core.services.user import register_user
from app.models.user import User

#앞에 뭐 붙여라
router = APIRouter(prefix="/api/users", tags=["users"])

#로그인
@router.post("/login")
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    user, error, locked, remaining_seconds, attempt_count = login_user(db, request.username, request.password)

    #로그인 안풀어주기
    if locked:
        return JSONResponse(
            status_code=423,
            content={
                "locked": True,
                "remaining_seconds": remaining_seconds,
                "message": error,
            }
    )

    #에러난 경우
    if error:
        return JSONResponse(
            status_code=401,
            content={
                "message": error,
                "attempt_count": attempt_count,
            }
    )

    #로그인 성공 시
    return UserLoginResponse(
        message="로그인 성공",
        username=user.user_login_id,
        name=user.user_name,
    )

#회원가입
@router.post("/register")
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    user, error, field = register_user(
        db,
        request.name,
        request.username,
        request.password,
        request.password_confirm,
        request.phone,
        request.email,
    )

    if error:
        return JSONResponse(
            status_code=400,
            content={"message": error, "field": field},
        )

    return UserRegisterResponse(
        message="회원가입 성공",
        username=user.user_login_id,
    )

#회원가입 - 아이디 중복 체크
@router.get("/check-username")
def check_username(username: str, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.user_login_id == username).first() is not None
    return {"available": not exists}