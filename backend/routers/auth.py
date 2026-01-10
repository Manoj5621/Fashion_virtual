from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from models.auth import LoginRequest, SignUpRequest
from models.user import User
from database import get_db
from sqlalchemy.orm import Session

load_dotenv()

router = APIRouter()

@router.get("/me")
async def me():
    return "Hello"

@router.post("/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    print(data)
    user = db.query(User).filter(
        User.username == data.username
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="No user found, please SignIn")

    if user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid Password, please try again with correct password")
    
    return {"status_code":200, "detail":"Login Successful"}

@router.post("/signUp")
async def signUp(data: SignUpRequest, db: Session= Depends(get_db)):
    existing_user = db.query(User).filter(
        User.username == data.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=401,
            detail="User already present, you need use different username or try to login"
        )
    
    newUser = User(
        name=data.name,
        username=data.username,
        password=data.password
    )

    db.add(newUser)

    db.commit()

    db.refresh(newUser)
    
    print(data)
    return {
        "status_code": 200,
        "detail": "Sign In successful, you can login now"
    }