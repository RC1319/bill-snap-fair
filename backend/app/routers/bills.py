from fastapi import APIRouter, HTTPException
from ..models.bill import Bill, BillCreate
from ..models.activity import ActivityLog
from ..services.storage_service import StorageService
import uuid
from datetime import datetime

router = APIRouter(prefix="/bills", tags=["Bills"])

@router.get("", response_model=list[Bill])
def list_bills():
    """Retrieves all saved bills."""
    return StorageService.get_bills()

@router.get("/{bill_id}", response_model=Bill)
def get_bill(bill_id: str):
    """Retrieves a single bill by ID."""
    bill = StorageService.get_bill(bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill

@router.post("", response_model=Bill, status_code=201)
def create_bill(payload: BillCreate):
    """Creates and saves a new bill."""
    bill_dict = payload.model_dump()
    bill_dict["id"] = f"bill_{uuid.uuid4().hex[:6]}"
    bill_dict["created_at"] = datetime.now().isoformat()
    
    saved = StorageService.save_bill(bill_dict)
    
    # Log activity
    StorageService.log_activity({
        "id": f"act_{uuid.uuid4().hex[:6]}",
        "type": "bill_created",
        "title": f"Bill Added: {saved.get('title', 'Receipt')}",
        "description": f"Added bill of ₹{saved.get('total', 0):,.2f} at {saved.get('merchant_name', 'Store')}",
        "amount": saved.get("total", 0.0),
        "bill_id": saved["id"],
        "created_at": datetime.now().isoformat(),
    })
    
    return saved

@router.put("/{bill_id}", response_model=Bill)
def update_bill(bill_id: str, payload: BillCreate):
    """Updates an existing bill."""
    existing = StorageService.get_bill(bill_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    bill_dict = payload.model_dump()
    bill_dict["id"] = bill_id
    bill_dict["created_at"] = existing.get("created_at", datetime.now().isoformat())
    
    return StorageService.save_bill(bill_dict)

@router.delete("/{bill_id}")
def delete_bill(bill_id: str):
    """Deletes a bill."""
    success = StorageService.delete_bill(bill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Bill not found")
    return {"ok": True, "message": "Bill deleted"}
