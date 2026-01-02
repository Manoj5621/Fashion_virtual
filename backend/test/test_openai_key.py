from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY") or "YOUR_OPENAI_API_KEY")

try:
    print(os.getenv("OPENAI_API_KEY"))
except:
    print("I couldn't find OpenAPI key!")

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
