from pydantic import BaseModel
from typing import Optional


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