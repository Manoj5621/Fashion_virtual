from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
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
        # ---- Validate input parameters ----
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

        # ---- OpenAI Image Generation ----
        # Since OpenAI images.generate() doesn't support reference images,
        # we create a descriptive prompt for virtual try-on
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

Generate a professional fashion photography style image showing the virtual try-on result.
"""

        result = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
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

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Clean error handling with specific error messages
        error_msg = str(e)
        error_type = type(e).__name__
        
        # Detailed error analysis
        if "401" in error_msg and "API key" in error_msg:
            clean_error = "OpenAI API key is invalid or missing. Please check your OPENAI_API_KEY environment variable."
            user_message = "API Authentication Failed: Please check your OpenAI API key configuration."
            print(f"[ERROR] Try-on API Key Issue: {clean_error}")
        elif "429" in error_msg:
            clean_error = "OpenAI API rate limit exceeded. Please try again later."
            user_message = "Rate Limit Exceeded: Too many requests. Please wait and try again."
            print(f"[ERROR] Try-on Rate Limit: {clean_error}")
        elif "quota" in error_msg.lower():
            clean_error = "OpenAI API quota exceeded. Please check your billing account."
            user_message = "API Quota Exceeded: Please check your OpenAI billing account."
            print(f"[ERROR] Try-on Quota Issue: {clean_error}")
        elif "PermissionDenied" in error_type or "permission" in error_msg.lower():
            clean_error = f"Permission denied for OpenAI API access. Details: {error_msg}"
            user_message = "Permission Denied: Unable to access OpenAI services. Please verify your API permissions."
            print(f"[ERROR] Try-on Permission Error: {clean_error}")
        elif "InvalidRequest" in error_type or "invalid_request" in error_msg.lower():
            clean_error = f"Invalid request to OpenAI API. Details: {error_msg}"
            user_message = "Invalid Request: Please check your request parameters."
            print(f"[ERROR] Try-on Invalid Request: {clean_error}")
        elif "AuthenticationError" in error_type:
            clean_error = f"OpenAI authentication failed. Details: {error_msg}"
            user_message = "Authentication Failed: Please verify your OpenAI API credentials."
            print(f"[ERROR] Try-on Authentication Error: {clean_error}")
        else:
            clean_error = f"Failed to generate image - {error_type}: {error_msg}"
            user_message = f"Image generation failed: {error_type}. Please try again later."
            print(f"[ERROR] Try-on General Error: {clean_error}")
        
        # Log full error for debugging (but show clean message to user)
        print(f"[DEBUG] Full error details: {error_msg}")
        print(f"[DEBUG] Error type: {error_type}")
        
        raise HTTPException(status_code=500, detail=user_message)
    finally:
        # Clean up any resources if needed
        print(f"Try-on request completed for {model_type} {garment_type}")
