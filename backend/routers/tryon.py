from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import base64
import traceback
import requests
from openai import OpenAI

load_dotenv()

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Missing OPENAI_API_KEY in .env")

EXTERNAL_TRYON_URL = os.getenv("HUG_VIRTUAL_TRY_ON_BACKEND_URL")
if not EXTERNAL_TRYON_URL:
    raise ValueError("Missing HUG_VIRTUAL_TRY_ON_BACKEND_URL in .env")

client = OpenAI(api_key=OPENAI_API_KEY)

def call_external_tryon_backend(person_image_bytes, cloth_image_bytes, person_content_type, cloth_content_type):
    """Call external Virtual Try-On backend service"""
    try:
        # Create file-like objects from bytes
        import io
        
        person_file = io.BytesIO(person_image_bytes)
        cloth_file = io.BytesIO(cloth_image_bytes)
        
        # Create files dictionary with proper format
        files = {
            'vton_image': ('person_image.jpg', person_file, person_content_type),
            'garment_image': ('garment_image.jpg', cloth_file, cloth_content_type)
        }
        
        response = requests.post(
            f"{EXTERNAL_TRYON_URL}/virtual-try-on",
            files=files,
            timeout=60
        )
        
        if response.status_code == 200:
            try:
                result = response.json()
                
                if result.get('status') == 'ok' and result.get('image_base64'):
                    # Validate base64 string
                    image_base64 = result['image_base64']
                    try:
                        # Test if it's valid base64
                        base64.b64decode(image_base64)
                        return f"data:image/png;base64,{image_base64}"
                    except Exception as b64_error:
                        return None
                else:
                    return None
            except ValueError as json_error:
                return None
        else:
            return None
    except requests.exceptions.Timeout:
        return None
    except requests.exceptions.ConnectionError as conn_error:
        return None
    except Exception as e:
        return None

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
        try:
            result = client.images.generate(
                model="gpt-image-1",
                prompt=prompt,
                size="1024x1024"
            )
            openai_image_base64 = result.data[0].b64_json
            openai_image_url = f"data:image/png;base64,{openai_image_base64}"
            openai_success = True
        except Exception as e:
            print(f"OpenAI generation failed: {str(e)}")
            openai_image_url = None
            openai_success = False

        # ---- Call External Backend ----
        external_image_url = None
        external_error_message = None
        try:
            external_image_url = call_external_tryon_backend(
                person_bytes, 
                cloth_bytes, 
                person_image.content_type, 
                cloth_image.content_type
            )
            external_success = external_image_url is not None
            if not external_success:
                external_error_message = "External backend returned no image"
        except Exception as e:
            print(f"External backend call failed: {str(e)}")
            external_success = False
            external_error_message = str(e)

        # Check if at least one service succeeded
        if not openai_success and not external_success:
            error_detail = "Both virtual try-on services failed. "
            if not openai_success:
                error_detail += "OpenAI service error. "
            if external_error_message:
                error_detail += f"External service error: {external_error_message}. "
            error_detail += "Please try again later."
            raise HTTPException(status_code=500, detail=error_detail)

        # Prepare response with status information
        response_content = {
            "text": "Virtual try-on completed successfully.",
            "services": {
                "openai": {
                    "success": openai_success,
                    "image": openai_image_url
                },
                "external": {
                    "success": external_success,
                    "image": external_image_url,
                    "error": external_error_message
                }
            }
        }
        
        # Add primary images to top level for backward compatibility
        response_content["openai_image"] = openai_image_url
        response_content["external_image"] = external_image_url
        
        # Add which service provided the result
        if openai_success and external_success:
            response_content["primary_result"] = "openai"  # Prefer OpenAI if both work
        elif openai_success:
            response_content["primary_result"] = "openai"
        elif external_success:
            response_content["primary_result"] = "external"
        else:
            response_content["primary_result"] = "none"

        return JSONResponse(content=response_content)

    except Exception as e:
        print("Try-on error:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")
