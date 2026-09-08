import io
import json
import base64
import requests
from PIL import Image
import numpy as np
from ..config import settings
from ..models.bill import OCRResult, BillItem
from ..utils.receipt_parser import ReceiptParser

class OCRService:
    @staticmethod
    def process_image(image_bytes: bytes, filename: str = "receipt.jpg") -> OCRResult:
        # 1. Check if Gemini API key is provided
        if settings.GEMINI_API_KEY:
            try:
                gemini_res = OCRService._call_gemini_vision(image_bytes)
                if gemini_res and gemini_res.items:
                    return gemini_res
            except Exception as e:
                print(f"[OCR] Gemini vision call failed: {e}")

        # 2. Check if OpenAI API key is provided
        if settings.OPENAI_API_KEY:
            try:
                openai_res = OCRService._call_openai_vision(image_bytes)
                if openai_res and openai_res.items:
                    return openai_res
            except Exception as e:
                print(f"[OCR] OpenAI vision call failed: {e}")

        # 3. Local OCR using pytesseract / OpenCV if installed
        try:
            import pytesseract
            import cv2
            
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is not None:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                thresh = cv2.adaptiveThreshold(
                    gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
                )
                extracted_text = pytesseract.image_to_string(thresh)
                if extracted_text and len(extracted_text.strip()) > 20:
                    return ReceiptParser.parse_text(extracted_text)
        except Exception as e:
            print(f"[OCR] Local pytesseract note: {e}")

        raise ValueError("Could not extract receipt items from image. Please try a clearer picture or enter items manually.")

    @staticmethod
    def _call_gemini_vision(image_bytes: bytes) -> OCRResult | None:
        """Extracts structured JSON from bill using Gemini Vision API."""
        b64_img = base64.b64encode(image_bytes).decode("utf-8")
        
        # Working vision models for this key
        models_to_try = [
            "gemini-3.5-flash-lite",
            "gemini-3.7-flash",
            "gemini-3.1-flash-lite-preview",
        ]
        
        prompt = """
        You are an expert receipt OCR engine. Carefully read the receipt image and extract the exact merchant name, date, all line items with quantity, unit rate/price, total amount, subtotal, taxes (CGST, SGST, GST, VAT), discounts, and grand total.

        Return strictly a JSON object with this structure:
        {
          "merchant_name": "Exact store/restaurant name printed at top",
          "date": "YYYY-MM-DD (e.g. 2025-08-27 or as printed on bill)",
          "category": "Groceries or Food or Shopping or Restaurant",
          "items": [
            {
              "name": "Exact Item description (e.g. Rice (5kg), Sunflower Oil (1L), Bread (400g))",
              "quantity": 1.0,
              "unit_price": 420.0,
              "total_price": 420.0,
              "confidence": 0.98
            }
          ],
          "subtotal": 1023.0,
          "cgst": 24.33,
          "sgst": 24.33,
          "service_charge": 0.0,
          "discount": 0.0,
          "total": 1023.0
        }

        Important:
        1. Read every line item accurately from the receipt table.
        2. Keep unit_price and total_price matching the numbers printed on the receipt.
        3. Extract the actual merchant name (e.g. FRESH MART).
        4. Return ONLY valid JSON with no markdown formatting and no extra commentary.
        """
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": b64_img
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }
        
        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
            try:
                resp = requests.post(url, json=payload, timeout=25)
                if resp.status_code == 200:
                    res_json = resp.json()
                    candidates = res_json.get("candidates", [])
                    if not candidates:
                        continue
                    raw_content = candidates[0]["content"]["parts"][0]["text"]
                    clean_json = raw_content.replace("```json", "").replace("```", "").strip()
                    data = json.loads(clean_json)
                    
                    items = []
                    for idx, it in enumerate(data.get("items", [])):
                        q = float(it.get("quantity") or 1.0)
                        tot = float(it.get("total_price") or it.get("amount") or 0.0)
                        unit = float(it.get("unit_price") or (tot / q if q > 0 else tot))
                        items.append(
                            BillItem(
                                id=f"it_{idx+1}",
                                name=str(it.get("name") or f"Item {idx+1}").strip(),
                                quantity=q,
                                unit_price=unit,
                                total_price=tot,
                                confidence=float(it.get("confidence", 0.98)),
                            )
                        )
                    
                    calc_subtotal = sum(i.total_price for i in items)
                    subtotal_val = float(data.get("subtotal") or calc_subtotal or 0.0)
                    cgst_val = float(data.get("cgst") or 0.0)
                    sgst_val = float(data.get("sgst") or 0.0)
                    sc_val = float(data.get("service_charge") or 0.0)
                    disc_val = float(data.get("discount") or 0.0)
                    total_val = float(data.get("total") or (subtotal_val + cgst_val + sgst_val + sc_val - disc_val))

                    return OCRResult(
                        merchant_name=str(data.get("merchant_name") or "Store Receipt").strip(),
                        date=str(data.get("date") or "").strip() or None,
                        items=items,
                        subtotal=subtotal_val,
                        cgst=cgst_val,
                        sgst=sgst_val,
                        service_charge=sc_val,
                        discount=disc_val,
                        total=total_val,
                        confidence_score=0.98,
                        raw_text=raw_content,
                    )
                else:
                    print(f"[OCR] Gemini {model} error {resp.status_code}: {resp.text[:120]}")
            except Exception as ex:
                print(f"[OCR] Exception calling Gemini {model}: {ex}")
                continue

        return None

    @staticmethod
    def _call_openai_vision(image_bytes: bytes) -> OCRResult | None:
        """Extracts structured JSON from bill using OpenAI GPT-4o Vision API."""
        b64_img = base64.b64encode(image_bytes).decode("utf-8")
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        
        prompt = """
        Extract all items, quantities, unit prices, total prices, subtotal, taxes (CGST/SGST/VAT), service charges, discounts and grand total from this receipt image.
        Format strictly as JSON:
        {
          "merchant_name": "string",
          "date": "YYYY-MM-DD",
          "items": [{"name": "string", "quantity": 1.0, "unit_price": 100.0, "total_price": 100.0}],
          "subtotal": 100.0,
          "cgst": 2.5,
          "sgst": 2.5,
          "service_charge": 5.0,
          "discount": 0.0,
          "total": 110.0
        }
        """
        
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"},
                        },
                    ],
                }
            ],
            "response_format": {"type": "json_object"},
        }
        
        resp = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=25)
        if resp.status_code == 200:
            res_json = resp.json()
            content = res_json["choices"][0]["message"]["content"]
            data = json.loads(content)
            
            items = [
                BillItem(
                    id=f"it_{idx+1}",
                    name=it.get("name", "Item"),
                    quantity=float(it.get("quantity", 1.0)),
                    unit_price=float(it.get("unit_price", it.get("total_price", 0.0))),
                    total_price=float(it.get("total_price", 0.0)),
                    confidence=0.98,
                )
                for idx, it in enumerate(data.get("items", []))
            ]
            
            return OCRResult(
                merchant_name=data.get("merchant_name", "Receipt"),
                date=data.get("date"),
                items=items,
                subtotal=float(data.get("subtotal", sum(it.total_price for it in items))),
                cgst=float(data.get("cgst", 0.0)),
                sgst=float(data.get("sgst", 0.0)),
                service_charge=float(data.get("service_charge", 0.0)),
                discount=float(data.get("discount", 0.0)),
                total=float(data.get("total", 0.0)),
                confidence_score=0.99,
                raw_text=content,
            )
        return None
