from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY") or "YOUR_OPENAI_API_KEY")

try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": "Say hello in one word"}
        ]
    )
    print("✅ API Key is working")
    print("Response:", response.choices[0].message.content)

except Exception as e:
    print("❌ API Key failed")
    print(e)

def test_gpt_image_model():
    try:
        print("Testing gpt-image-1.5 model access...")

        img_response = client.images.generate(
            model="gpt-image-1.5",
            prompt="A simple red apple on a white background",
            size="auto"
        )

        print("✅ gpt-image-1.5 access is working")
        print("Image URL:", img_response.data[0].url)

    except Exception as e:
        print("❌ gpt-image-1.5 access failed")
        print("Reason:", e)


# test_gpt_image_model()

def list_of_models():
    try:
        models = client.models.list()
        print("Models accessible by this API key: \n")

        for m in models.data:
            print("-", m.id)
    except Exception as e:
        print("Exception: ", e)

# list_of_models()

OPENAI_IMAGE_ENABLED = False

def check_openai_image_capability():
    global OPENAI_IMAGE_ENABLED
    try:
        client.images.generate(
            model="gpt-image-1.5",
            prompt="test",
            size="auto"
        )
        OPENAI_IMAGE_ENABLED = True
        print("Working")
    except Exception as e:
        OPENAI_IMAGE_ENABLED = False
        print("Exception :", e)

check_openai_image_capability()
