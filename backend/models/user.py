from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    username = Column(String(50), unique=True, index=True)
    password = Column(String(255))
    createdAt = Column(DateTime, nullable=False , server_default=func.now())
