from pydantic import BaseModel, Field
import uuid
from datetime import datetime

class ActivityLog(BaseModel):
    id: str = Field(default_factory=lambda: f"act_{uuid.uuid4().hex[:6]}")
    type: str # "bill_created", "bill_split", "payment_recorded", "settlement"
    title: str
    description: str
    amount: float | None = None
    bill_id: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
