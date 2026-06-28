from pydantic import BaseModel

class UserLoginRequest(BaseModel):
    username: str
    password: str

class UserLoginResponse(BaseModel):
    message: str
    username: str
    name: str