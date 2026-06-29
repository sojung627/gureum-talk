from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.schemas.user import UserLoginRequest, UserLoginResponse
from app.core.services.user import login_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/login")
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    user, error, locked, remaining_seconds = login_user(db, request.username, request.password)

    if locked:
        return JSONResponse(
            status_code=423,
            content={
                "locked": True,
                "remaining_seconds": remaining_seconds,
                "message": error,
            },
        )

    if error:
        return JSONResponse(
            status_code=401,
            content={"message": error},
        )

    return UserLoginResponse(
        message="로그인 성공",
        username=user.user_login_id,
        name=user.user_name,
    )