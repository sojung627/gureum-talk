from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.schemas.user import (
    UserLoginRequest,
    UserLoginResponse,
    UserLogoutResponse,
    UserRegisterRequest,
    UserRegisterResponse,
    UserSessionResponse,
)
from app.core.services.user import login_user, register_user
from app.db.database import get_db
from app.models.user import User


# 사용자 기능 전용 API 주소
router = APIRouter(prefix="/api/users", tags=["users"])


# 로그인
@router.post("/login")
def login(
        http_request: Request,
        login_request: UserLoginRequest,
        db: Session = Depends(get_db),
):
    user, error, locked, remaining_seconds, attempt_count = login_user(
        db,
        login_request.username,
        login_request.password,
    )

    # 로그인 잠금 상태
    if locked:
        return JSONResponse(
            status_code=423,
            content={
                "locked": True,
                "remaining_seconds": remaining_seconds,
                "message": error,
            },
        )

    # 로그인 실패
    if error:
        return JSONResponse(
            status_code=401,
            content={
                "message": error,
                "attempt_count": attempt_count,
            },
        )

    # 기존 세션 정보를 지우고 로그인 사용자 기본키 저장
    http_request.session.clear()
    http_request.session["user_id"] = user.user_id

    # 로그인 성공
    return UserLoginResponse(
        message="로그인 성공",
        username=user.user_login_id,
        name=user.user_name,
    )


# 현재 로그인 세션 조회
@router.get(
    "/session",
    response_model=UserSessionResponse,
)
def get_login_session(
        http_request: Request,
        db: Session = Depends(get_db),
) -> UserSessionResponse:
    user_id = http_request.session.get("user_id")

    if user_id is None:
        return UserSessionResponse(
            authenticated=False,
        )

    user = db.get(User, user_id)
    if user is None:
        # 삭제된 사용자 정보가 세션에 남아 있으면 함께 정리한다.
        http_request.session.clear()
        return UserSessionResponse(
            authenticated=False,
        )

    return UserSessionResponse(
        authenticated=True,
        username=user.user_login_id,
        name=user.user_name,
    )


# 로그아웃
@router.post(
    "/logout",
    response_model=UserLogoutResponse,
)
def logout(
        http_request: Request,
) -> UserLogoutResponse:
    http_request.session.clear()
    return UserLogoutResponse(
        message="로그아웃 성공",
    )


# 회원가입
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


# 회원가입 - 아이디 중복 체크
@router.get("/check-username")
def check_username(username: str, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.user_login_id == username).first() is not None
    return {"available": not exists}
