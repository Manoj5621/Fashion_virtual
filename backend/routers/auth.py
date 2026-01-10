from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from models.auth import LoginRequest, SignUpRequest
from schemas.user import User
from database import get_db
from sqlalchemy.orm import Session
from utils.security import hash_password, verify_password

load_dotenv()

router = APIRouter()

@router.get("/me")
async def me(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        username == User.username
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail= "No user found"
        )

    return {
        "createdAt": user.createdAt,
        "username": user.username,
        "name": user.name,
        "id": user.id,
        "role": user.role
    }

@router.post("/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    print(data)
    user = db.query(User).filter(
        User.username == data.username
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="No user found, please SignIn")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid Password, please try again with correct password")
    
    return {"status_code":200, "detail":"Login Successful", "userId": user.id}

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
    
    hashed_password = hash_password(data.password)
    
    user_count = db.query(User).count()

    role = 1 if user_count == 0 else 0

    newUser = User(
        name=data.name,
        username=data.username,
        password=hashed_password,
        role=role
    )

    db.add(newUser)

    db.commit()

    db.refresh(newUser)
    
    print(data)
    return {
        "status_code": 200,
        "detail": "Sign In successful, you can login now"
    }
