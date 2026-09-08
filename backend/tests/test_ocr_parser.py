import pytest
from app.utils.receipt_parser import ReceiptParser

def test_parse_structured_receipt_text():
    raw_sample = """
    TOKYO BISTRO
    12 MG Road, Bengaluru
    Date: 25/02/2026

    2 Chicken Ramen 500.00
    1 Veg Gyoza 220.00
    2 Iced Green Tea 180.00

    Subtotal 900.00
    CGST 2.5% 22.50
    SGST 2.5% 22.50
    Service Charge 45.00
    Total 990.00
    """
    
    result = ReceiptParser.parse_text(raw_sample)
    
    assert "TOKYO BISTRO" in result.merchant_name
    assert result.date == "25/02/2026"
    assert len(result.items) >= 3
    assert result.subtotal == 900.0
    assert result.cgst == 22.50
    assert result.sgst == 22.50
    assert result.service_charge == 45.00
    assert result.total == 990.0

def test_fallback_empty_receipt():
    result = ReceiptParser.parse_text("")
    assert result.items is not None
    assert len(result.items) > 0
    assert result.total > 0
