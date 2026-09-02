from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.schemas.user import (
    PasswordResetCodeRequest,
    PasswordResetCodeSentResponse,
    PasswordResetCodeVerifyRequest,
    PasswordResetCodeVerifyResponse,
    PasswordResetRequest,
    PasswordResetResponse,
    UserLoginRequest,
    UserLoginResponse,
    UserLogoutResponse,
    UserRegisterRequest,
    UserRegisterResponse,
    UserSessionResponse,
)
from app.core.services.password_reset import (
    CODE_VALID_MINUTES,
    SmsDeliveryError,
    create_password_reset_verification,
    find_user_for_password_reset,
    get_resend_wait_seconds,
    reset_user_password,
    verify_password_reset_code,
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


@router.post(
    "/password-reset/code",
    response_model=PasswordResetCodeSentResponse,
)
def send_password_reset_code(
    request: PasswordResetCodeRequest,
    db: Session = Depends(get_db),
):
    user = find_user_for_password_reset(
        db=db,
        username=request.username,
        phone=request.phone,
    )
    if user is None:
        return JSONResponse(
            status_code=404,
            content={
                "message": "일치하는 회원이 없습니다.",
                "field": "identity",
            },
        )

    retry_after_seconds = get_resend_wait_seconds(db, user.user_id)
    if retry_after_seconds > 0:
        return JSONResponse(
            status_code=429,
            content={
                "message": "잠시 후 인증번호를 다시 요청해주세요.",
                "retry_after_seconds": retry_after_seconds,
            },
        )

    try:
        verification = create_password_reset_verification(db, user)
    except SmsDeliveryError:
        return JSONResponse(
            status_code=502,
            content={
                "message": "인증번호를 발송할 수 없습니다.",
            },
        )

    return PasswordResetCodeSentResponse(
        message="인증번호가 발송되었습니다.",
        request_id=verification.request_id,
        expires_in_seconds=CODE_VALID_MINUTES * 60,
    )


@router.post(
    "/password-reset/verify",
    response_model=PasswordResetCodeVerifyResponse,
)
def verify_password_reset(
    request: PasswordResetCodeVerifyRequest,
    db: Session = Depends(get_db),
):
    reset_token, error, error_type = verify_password_reset_code(
        db=db,
        request_id=request.request_id,
        code=request.code,
    )
    if error:
        status_code = 410 if error_type == "expired" else 400
        return JSONResponse(
            status_code=status_code,
            content={
                "message": error,
                "field": "verification_code",
            },
        )

    return PasswordResetCodeVerifyResponse(
        message="인증되었습니다.",
        reset_token=reset_token,
    )


@router.post(
    "/password-reset",
    response_model=PasswordResetResponse,
)
def change_password_with_reset_token(
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    changed, error, field = reset_user_password(
        db=db,
        reset_token=request.reset_token,
        password=request.password,
        password_confirm=request.password_confirm,
    )
    if not changed:
        status_code = 400 if field in {"password", "password_confirm"} else 401
        return JSONResponse(
            status_code=status_code,
            content={
                "message": error or "비밀번호 변경에 실패하였습니다.",
                "field": field,
            },
        )

    return PasswordResetResponse(
        message="비밀번호가 변경되었습니다.",
    )
