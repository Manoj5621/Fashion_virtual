from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class SignInRequest(BaseModel):
    name: str
    username: str
    password: str
