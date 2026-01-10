from utils.tryon_images import save_try_on_images
from models.tryon_images import SaveTryOnImage
import asyncio

async def test_SaveTryOnImage():
    data = SaveTryOnImage(
        username="manoj",
        input_bytes=b"input_image_test",
        output_bytes=b"output_image_test"
    )

    result = await save_try_on_images(data)

    print(result)

asyncio.run(test_SaveTryOnImage())
