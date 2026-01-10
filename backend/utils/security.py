from passlib.context import CryptContext

# Use bcrypt as the hashing algorithm
# deprecated="auto" If an old or weak hash is detected, automatically mark it as outdated

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    safe_password = password.encode("utf-8")[:72]
    return pwd_context.hash(safe_password)

def verify_password(plain_password: str, hash_password: str) -> bool:
    safe_password = plain_password.encode("utf-8")[:72]
    return pwd_context.verify(safe_password, hash_password)

