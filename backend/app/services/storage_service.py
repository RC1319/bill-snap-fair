import json
from pathlib import Path
from typing import Any
from ..models.bill import Bill
from ..models.person import Person
from ..models.activity import ActivityLog

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

BILLS_FILE = DATA_DIR / "bills.json"
PEOPLE_FILE = DATA_DIR / "people.json"
ACTIVITY_FILE = DATA_DIR / "activity.json"

DEFAULT_PEOPLE = [
    {"id": "p_1", "name": "You (Me)", "email": "me@example.com", "avatar": None, "accent": "gold", "bills_count": 5, "total_paid": 4500.0, "total_owed": 0.0},
    {"id": "p_2", "name": "Aarav Sharma", "email": "aarav@example.com", "avatar": None, "accent": "teal", "bills_count": 4, "total_paid": 1200.0, "total_owed": 650.0},
    {"id": "p_3", "name": "Priya Patel", "email": "priya@example.com", "avatar": None, "accent": "rose", "bills_count": 3, "total_paid": 0.0, "total_owed": 420.0},
    {"id": "p_4", "name": "Rohan Mehta", "email": "rohan@example.com", "avatar": None, "accent": "emerald", "bills_count": 2, "total_paid": 800.0, "total_owed": 300.0},
    {"id": "p_5", "name": "Ananya Singh", "email": "ananya@example.com", "avatar": None, "accent": "amber", "bills_count": 2, "total_paid": 0.0, "total_owed": 580.0},
]

DEFAULT_BILLS = [
    {
        "id": "bill_001",
        "title": "Truffles Dinner",
        "merchant_name": "Truffles Bistro",
        "date": "2026-03-01",
        "category": "Restaurant",
        "currency": "INR",
        "subtotal": 1200.0,
        "cgst": 30.0,
        "sgst": 30.0,
        "service_charge": 60.0,
        "discount": 0.0,
        "tip": 0.0,
        "total": 1320.0,
        "status": "settled",
        "payer_id": "p_1",
        "created_at": "2026-03-01T20:30:00",
        "people": ["p_1", "p_2", "p_3"],
        "items": [
            {"id": "i1", "name": "All American Burger", "quantity": 2, "unit_price": 280.0, "total_price": 560.0, "confidence": 0.98, "assigned_to": ["p_1", "p_2"]},
            {"id": "i2", "name": "Peri Peri Fries", "quantity": 1, "unit_price": 160.0, "total_price": 160.0, "confidence": 0.95, "assigned_to": ["p_1", "p_2", "p_3"]},
            {"id": "i3", "name": "Cold Coffee with Ice Cream", "quantity": 2, "unit_price": 150.0, "total_price": 300.0, "confidence": 0.97, "assigned_to": ["p_1", "p_3"]},
            {"id": "i4", "name": "Chocolate Fantasy Shake", "quantity": 1, "unit_price": 180.0, "total_price": 180.0, "confidence": 0.94, "assigned_to": ["p_2"]},
        ]
    }
]

class StorageService:
    @staticmethod
    def _read_json(filepath: Path, default_data: Any) -> Any:
        if not filepath.exists():
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(default_data, f, indent=2)
            return default_data
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default_data

    @staticmethod
    def _write_json(filepath: Path, data: Any) -> None:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    # Bills
    @staticmethod
    def get_bills() -> list[dict]:
        return StorageService._read_json(BILLS_FILE, DEFAULT_BILLS)

    @staticmethod
    def get_bill(bill_id: str) -> dict | None:
        bills = StorageService.get_bills()
        for b in bills:
            if b["id"] == bill_id:
                return b
        return None

    @staticmethod
    def save_bill(bill_data: dict) -> dict:
        bills = StorageService.get_bills()
        existing_idx = next((i for i, b in enumerate(bills) if b["id"] == bill_data["id"]), None)
        if existing_idx is not None:
            bills[existing_idx] = bill_data
        else:
            bills.insert(0, bill_data)
        StorageService._write_json(BILLS_FILE, bills)
        return bill_data

    @staticmethod
    def delete_bill(bill_id: str) -> bool:
        bills = StorageService.get_bills()
        new_bills = [b for b in bills if b["id"] != bill_id]
        if len(new_bills) != len(bills):
            StorageService._write_json(BILLS_FILE, new_bills)
            return True
        return False

    # People
    @staticmethod
    def get_people() -> list[dict]:
        return StorageService._read_json(PEOPLE_FILE, DEFAULT_PEOPLE)

    @staticmethod
    def save_person(person_data: dict) -> dict:
        people = StorageService.get_people()
        existing_idx = next((i for i, p in enumerate(people) if p["id"] == person_data["id"]), None)
        if existing_idx is not None:
            people[existing_idx] = person_data
        else:
            people.append(person_data)
        StorageService._write_json(PEOPLE_FILE, people)
        return person_data

    # Activity
    @staticmethod
    def get_activities() -> list[dict]:
        return StorageService._read_json(ACTIVITY_FILE, [
            {
                "id": "act_1",
                "type": "bill_split",
                "title": "Truffles Dinner Split",
                "description": "Split of ₹1,320 among 3 people",
                "amount": 1320.0,
                "bill_id": "bill_001",
                "created_at": "2026-03-01T20:35:00",
            }
        ])

    @staticmethod
    def log_activity(activity_data: dict) -> dict:
        activities = StorageService.get_activities()
        activities.insert(0, activity_data)
        StorageService._write_json(ACTIVITY_FILE, activities)
        return activity_data
