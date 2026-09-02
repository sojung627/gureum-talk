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


class UserPreferenceResponse(BaseModel):
    voice_chat_panel_open: bool


class UserPreferenceUpdateRequest(BaseModel):
    voice_chat_panel_open: bool


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


class PasswordResetCodeRequest(BaseModel):
    username: str
    phone: str


class PasswordResetCodeSentResponse(BaseModel):
    message: str
    request_id: str
    expires_in_seconds: int


class PasswordResetCodeVerifyRequest(BaseModel):
    request_id: str
    code: str


class PasswordResetCodeVerifyResponse(BaseModel):
    message: str
    reset_token: str


class PasswordResetRequest(BaseModel):
    reset_token: str
    password: str
    password_confirm: str


class PasswordResetResponse(BaseModel):
    message: str
