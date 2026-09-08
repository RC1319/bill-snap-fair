from pydantic import BaseModel, Field
from typing import Literal

class ItemShareAssignment(BaseModel):
    item_id: str
    person_ids: list[str]
    # optional custom proportions or ratios e.g. {"person_1": 0.5, "person_2": 0.5}
    custom_shares: dict[str, float] | None = None

class PersonBreakdown(BaseModel):
    person_id: str
    person_name: str
    items_subtotal: float = 0.0
    items: list[dict] = Field(default_factory=list)
    tax_share: float = 0.0
    service_charge_share: float = 0.0
    discount_share: float = 0.0
    tip_share: float = 0.0
    total_owed: float = 0.0
    percentage_of_bill: float = 0.0

class SettlementTransfer(BaseModel):
    from_person_id: str
    from_person_name: str
    to_person_id: str
    to_person_name: str
    amount: float
    status: Literal["pending", "paid"] = "pending"

class SplitCalculationRequest(BaseModel):
    bill_id: str | None = None
    subtotal: float
    cgst: float = 0.0
    sgst: float = 0.0
    service_charge: float = 0.0
    discount: float = 0.0
    tip: float = 0.0
    total: float
    items: list[dict] # list of items with id, name, price, quantity, assigned_to
    people: list[dict] # list of people with id, name
    payer_id: str | None = None

class SplitCalculationResponse(BaseModel):
    bill_total: float
    subtotal: float
    total_taxes_and_fees: float
    total_discounts: float
    breakdowns: list[PersonBreakdown]
    settlements: list[SettlementTransfer]
    is_balanced: bool = True
