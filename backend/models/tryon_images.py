from pydantic import BaseModel

class SaveTryOnImage(BaseModel):
    username: str
    person_bytes: bytes
    cloth_bytes: bytes
    output_bytes: bytes
