import pytest
from app.models.split import SplitCalculationRequest
from app.services.split_service import SplitService

def test_equal_split_two_people():
    req = SplitCalculationRequest(
        subtotal=1000.0,
        cgst=25.0,
        sgst=25.0,
        service_charge=50.0,
        discount=0.0,
        tip=0.0,
        total=1100.0,
        items=[
            {"id": "1", "name": "Pizza", "quantity": 1, "unit_price": 600.0, "total_price": 600.0, "assigned_to": ["p1", "p2"]},
            {"id": "2", "name": "Pasta", "quantity": 1, "unit_price": 400.0, "total_price": 400.0, "assigned_to": ["p1", "p2"]},
        ],
        people=[
            {"id": "p1", "name": "Alice"},
            {"id": "p2", "name": "Bob"},
        ],
        payer_id="p1",
    )
    
    res = SplitService.calculate_split(req)
    assert len(res.breakdowns) == 2
    
    # Total owed by Alice and Bob should sum to 1100
    p1_breakdown = next(b for b in res.breakdowns if b.person_id == "p1")
    p2_breakdown = next(b for b in res.breakdowns if b.person_id == "p2")
    
    assert p1_breakdown.items_subtotal == 500.0
    assert p2_breakdown.items_subtotal == 500.0
    assert p1_breakdown.total_owed == 550.0
    assert p2_breakdown.total_owed == 550.0
    assert round(p1_breakdown.total_owed + p2_breakdown.total_owed, 2) == 1100.0

def test_proportional_tax_split_uneven_consumption():
    """
    Alice eats 800 worth, Bob eats 200 worth (Total 1000).
    Tax is 100 (50 CGST + 50 SGST).
    Alice should pay 80% of tax (80), Bob 20% of tax (20).
    Total Alice: 880, Total Bob: 220.
    """
    req = SplitCalculationRequest(
        subtotal=1000.0,
        cgst=50.0,
        sgst=50.0,
        service_charge=0.0,
        discount=0.0,
        tip=0.0,
        total=1100.0,
        items=[
            {"id": "1", "name": "Steak", "quantity": 1, "unit_price": 800.0, "total_price": 800.0, "assigned_to": ["p1"]},
            {"id": "2", "name": "Salad", "quantity": 1, "unit_price": 200.0, "total_price": 200.0, "assigned_to": ["p2"]},
        ],
        people=[
            {"id": "p1", "name": "Alice"},
            {"id": "p2", "name": "Bob"},
        ],
    )
    
    res = SplitService.calculate_split(req)
    p1_b = next(b for b in res.breakdowns if b.person_id == "p1")
    p2_b = next(b for b in res.breakdowns if b.person_id == "p2")
    
    assert p1_b.items_subtotal == 800.0
    assert p1_b.tax_share == 80.0
    assert p1_b.total_owed == 880.0
    
    assert p2_b.items_subtotal == 200.0
    assert p2_b.tax_share == 20.0
    assert p2_b.total_owed == 220.0
    
    assert round(p1_b.total_owed + p2_b.total_owed, 2) == 1100.0

def test_proportional_discount_deduction():
    req = SplitCalculationRequest(
        subtotal=1000.0,
        cgst=0.0,
        sgst=0.0,
        service_charge=0.0,
        discount=200.0,
        tip=0.0,
        total=800.0,
        items=[
            {"id": "1", "name": "Item A", "quantity": 1, "unit_price": 500.0, "total_price": 500.0, "assigned_to": ["p1"]},
            {"id": "2", "name": "Item B", "quantity": 1, "unit_price": 500.0, "total_price": 500.0, "assigned_to": ["p2"]},
        ],
        people=[
            {"id": "p1", "name": "Alice"},
            {"id": "p2", "name": "Bob"},
        ],
    )
    
    res = SplitService.calculate_split(req)
    p1_b = next(b for b in res.breakdowns if b.person_id == "p1")
    p2_b = next(b for b in res.breakdowns if b.person_id == "p2")
    
    assert p1_b.discount_share == 100.0
    assert p1_b.total_owed == 400.0
    assert p2_b.discount_share == 100.0
    assert p2_b.total_owed == 400.0
