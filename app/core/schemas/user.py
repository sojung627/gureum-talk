from pydantic import BaseModel
from typing import Optional

#로그인
class UserLoginRequest(BaseModel):
    username: str
    password: str

class UserLoginResponse(BaseModel):
    message: str
    username: str
    name: str

class UserLoginLockedResponse(BaseModel):
    locked: bool
    remaining_seconds: int
    message: str

#회원가입
class UserRegisterRequest(BaseModel):
    name: str
    username: str
    password: str
    password_confirm: str
    phone: str
    email: str

class UserRegisterResponse(BaseModel):
    message: str
    username: str