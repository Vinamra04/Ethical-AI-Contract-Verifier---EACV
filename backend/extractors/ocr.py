import pytesseract
from PIL import Image
from io import BytesIO

def extract(image_bytes: bytes) -> str:
    img = Image.open(BytesIO(image_bytes)).convert("L")
    text = pytesseract.image_to_string(img)
    if not text.strip():
        raise ValueError("No text extracted from image.")
    return text.strip()
