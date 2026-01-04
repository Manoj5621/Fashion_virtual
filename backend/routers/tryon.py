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
        external_success = None
        
        if model_type == "top":
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
