from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import base64
import traceback
from openai import OpenAI

load_dotenv()

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Missing OPENAI_API_KEY in .env")

client = OpenAI(api_key=OPENAI_API_KEY)

@router.post("/try-on")
async def try_on(
    person_image: UploadFile = File(...),
    cloth_image: UploadFile = File(...),
    instructions: str = Form(""),
    model_type: str = Form(""),
    gender: str = Form(""),
    garment_type: str = Form(""),
    style: str = Form(""),
):
    try:
        MAX_IMAGE_SIZE_MB = 20
        ALLOWED_MIME_TYPES = {
            "image/jpeg",
            "image/png",
            "image/webp",
        }

        # ---- Validate person image ----
        if person_image.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail="Unsupported person image type")

        person_bytes = await person_image.read()
        if len(person_bytes) / (1024 * 1024) > MAX_IMAGE_SIZE_MB:
            raise HTTPException(status_code=400, detail="Person image exceeds 10MB")

        # ---- Validate cloth image ----
        if cloth_image.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail="Unsupported cloth image type")

        cloth_bytes = await cloth_image.read()
        if len(cloth_bytes) / (1024 * 1024) > MAX_IMAGE_SIZE_MB:
            raise HTTPException(status_code=400, detail="Cloth image exceeds 10MB")

        # ---- Convert to base64 ----
        person_b64 = base64.b64encode(person_bytes).decode("utf-8")
        cloth_b64 = base64.b64encode(cloth_bytes).decode("utf-8")

        # ---- Prompt (kept very close to yours) ----
        prompt = f"""
You are a virtual fashion stylist.

Create a realistic virtual try-on image by placing the clothing item
onto the person while preserving facial identity and garment details.

Rules:
- Keep the face EXACTLY the same
- Preserve garment color, texture, and design
- Replace the background completely
- Maintain original pose and body proportions

Context:
- Model Type: {model_type}
- Gender: {gender}
- Garment Type: {garment_type}
- Style: {style}
- Special Instructions: {instructions}

After the image, also generate a short caption describing fit and style.
"""

        # ---- OpenAI Image Generation ----
        result = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            image=[
                f"data:{person_image.content_type};base64,{person_b64}",
                f"data:{cloth_image.content_type};base64,{cloth_b64}",
            ],
            size="1024x1024"
        )

        image_base64 = result.data[0].b64_json
        image_url = f"data:image/png;base64,{image_base64}"

        return JSONResponse(
            content={
                "image": image_url,
                "text": "Virtual try-on generated successfully.",
            }
        )

    except Exception as e:
        print("Try-on error:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")
