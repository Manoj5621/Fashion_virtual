import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DB_USER = os.getenv("DB_USER") or "root"
DB_PASS = os.getenv("DB_PASSWORD") or "root"
DB_HOST = os.getenv("DB_HOST") or "localhost"
DB_PORT = os.getenv("DB_PORT") or "3306"
DB_NAME = os.getenv("DB_NAME") or "fashionvirtual"

DATABASE_URL = (
    f"mysql+mysqlconnector://{DB_USER}:{DB_PASS}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

echoTF = True if os.getenv("PLATFORM") == "development" else False
print("echoTF : ", echoTF)
engine = create_engine(DATABASE_URL, echo=echoTF)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
