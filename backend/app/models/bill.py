from pydantic import BaseModel, Field
from typing import Literal
import uuid
from datetime import datetime

class BillItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str
    quantity: float = 1.0
    unit_price: float
    total_price: float
    confidence: float = 1.0
    assigned_to: list[str] = Field(default_factory=list) # List of person IDs
    category: str | None = "general"

class TaxDetail(BaseModel):
    name: str = "GST"
    rate: float = 0.0 # percentage e.g. 5.0, 18.0
    amount: float = 0.0

class BillBase(BaseModel):
    title: str = "Receipt"
    merchant_name: str | None = None
    merchant_address: str | None = None
    date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    category: str = "Restaurant"
    currency: str = "INR"
    subtotal: float = 0.0
    cgst: float = 0.0
    sgst: float = 0.0
    service_charge: float = 0.0
    discount: float = 0.0
    tip: float = 0.0
    total: float = 0.0
    confidence_score: float = 1.0
    status: Literal["draft", "reviewed", "assigned", "settled"] = "draft"
    image_url: str | None = None
    payer_id: str | None = None

class BillCreate(BillBase):
    items: list[BillItem] = Field(default_factory=list)
    people: list[str] = Field(default_factory=list)

class Bill(BillBase):
    id: str = Field(default_factory=lambda: f"bill_{uuid.uuid4().hex[:6]}")
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    items: list[BillItem] = Field(default_factory=list)
    people: list[str] = Field(default_factory=list)

class OCRResult(BaseModel):
    merchant_name: str | None = None
    date: str | None = None
    items: list[BillItem] = Field(default_factory=list)
    subtotal: float = 0.0
    cgst: float = 0.0
    sgst: float = 0.0
    service_charge: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    confidence_score: float = 0.95
    raw_text: str | None = None
