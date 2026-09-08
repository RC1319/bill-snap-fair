import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

def test_list_people():
    res = client.get("/api/people")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_create_person():
    res = client.post("/api/people", json={"name": "Dev Tester", "accent": "teal"})
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Dev Tester"
    assert "id" in data

def test_list_bills():
    res = client.get("/api/bills")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_split_calculate_endpoint():
    payload = {
        "subtotal": 500.0,
        "cgst": 12.5,
        "sgst": 12.5,
        "service_charge": 25.0,
        "discount": 0.0,
        "tip": 0.0,
        "total": 550.0,
        "items": [
            {"id": "1", "name": "Coffee", "quantity": 2, "unit_price": 250.0, "total_price": 500.0, "assigned_to": ["p1", "p2"]}
        ],
        "people": [
            {"id": "p1", "name": "P1"},
            {"id": "p2", "name": "P2"}
        ],
        "payer_id": "p1"
    }
    res = client.post("/api/split/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["bill_total"] == 550.0
    assert len(data["breakdowns"]) == 2
    assert len(data["settlements"]) == 1

def test_ocr_parse_text_endpoint():
    res = client.post("/api/ocr/parse-text", json={"raw_text": "Sample Cafe\nCoffee 150.00\nTotal 150.00"})
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
