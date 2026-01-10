from pydantic import BaseModel

class SaveTryOnImage(BaseModel):
    username: str
    input_bytes: bytes
    output_bytes: bytes
