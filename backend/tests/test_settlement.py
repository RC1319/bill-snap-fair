import pytest
from app.models.split import SplitCalculationRequest
from app.services.split_service import SplitService

def test_single_payer_settlement():
    req = SplitCalculationRequest(
        subtotal=600.0,
        cgst=0.0,
        sgst=0.0,
        service_charge=0.0,
        discount=0.0,
        tip=0.0,
        total=600.0,
        items=[
            {"id": "1", "name": "Dish 1", "quantity": 1, "unit_price": 200.0, "total_price": 200.0, "assigned_to": ["p1"]},
            {"id": "2", "name": "Dish 2", "quantity": 1, "unit_price": 200.0, "total_price": 200.0, "assigned_to": ["p2"]},
            {"id": "3", "name": "Dish 3", "quantity": 1, "unit_price": 200.0, "total_price": 200.0, "assigned_to": ["p3"]},
        ],
        people=[
            {"id": "p1", "name": "Alice"},
            {"id": "p2", "name": "Bob"},
            {"id": "p3", "name": "Charlie"},
        ],
        payer_id="p1",
    )
    
    res = SplitService.calculate_split(req)
    # Alice paid, so Bob and Charlie should owe Alice 200 each
    assert len(res.settlements) == 2
    
    bob_transfer = next(s for s in res.settlements if s.from_person_id == "p2")
    charlie_transfer = next(s for s in res.settlements if s.from_person_id == "p3")
    
    assert bob_transfer.to_person_id == "p1"
    assert bob_transfer.amount == 200.0
    
    assert charlie_transfer.to_person_id == "p1"
    assert charlie_transfer.amount == 200.0
