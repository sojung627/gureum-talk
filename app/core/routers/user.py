from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.schemas.user import UserLoginRequest, UserLoginResponse
from app.core.services.user import login_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/login", response_model=UserLoginResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    user, error = login_user(db, request.username, request.password)
    if error:
        raise HTTPException(status_code=401, detail=error)

    return UserLoginResponse(
        message="로그인 성공",
        username=user.username,
        name=user.name,
    )