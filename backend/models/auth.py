from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class SignUpRequest(BaseModel):
    name: str
    username: str
    password: str
