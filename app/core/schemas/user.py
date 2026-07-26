from pydantic import BaseModel


# 로그인 요청
class UserLoginRequest(BaseModel):
    username: str
    password: str


# 로그인 성공 응답
class UserLoginResponse(BaseModel):
    message: str
    username: str
    name: str


class UserLoginLockedResponse(BaseModel):
    locked: bool
    remaining_seconds: int
    message: str


# 현재 로그인 세션 응답
class UserSessionResponse(BaseModel):
    authenticated: bool
    username: str | None = None
    name: str | None = None


# 로그아웃 응답
class UserLogoutResponse(BaseModel):
    message: str


# 회원가입 요청
class UserRegisterRequest(BaseModel):
    name: str
    username: str
    password: str
    password_confirm: str
    phone: str
    email: str


# 회원가입 성공 응답
class UserRegisterResponse(BaseModel):
    message: str
    username: str
