from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from ..services.ocr_service import OCRService
from ..utils.receipt_parser import ReceiptParser
from ..models.bill import OCRResult

router = APIRouter(prefix="/ocr", tags=["OCR"])

class RawTextInput(BaseModel):
    raw_text: str

@router.post("/upload", response_model=OCRResult)
async def upload_receipt(
    file: UploadFile = File(...),
):
    """
    Accepts bill image (PNG, JPG, WEBP), performs OCR extraction,
    and returns parsed items, taxes, charges, and totals.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
    
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    
    result = OCRService.process_image(contents, filename=file.filename or "receipt.jpg")
    return result

@router.post("/parse-text", response_model=OCRResult)
async def parse_receipt_text(payload: RawTextInput):
    """Parses raw OCR or typed receipt text using rule-based parsing engine."""
    return ReceiptParser.parse_text(payload.raw_text)
