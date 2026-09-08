from fastapi import APIRouter, HTTPException
from ..models.person import Person, PersonCreate
from ..services.storage_service import StorageService
import uuid

router = APIRouter(prefix="/people", tags=["People"])

@router.get("", response_model=list[Person])
def list_people():
    """Returns list of contacts / people."""
    return StorageService.get_people()

@router.post("", response_model=Person, status_code=201)
def create_person(payload: PersonCreate):
    """Adds a new person."""
    person_dict = payload.model_dump()
    person_dict["id"] = f"p_{uuid.uuid4().hex[:5]}"
    person_dict["bills_count"] = 0
    person_dict["total_paid"] = 0.0
    person_dict["total_owed"] = 0.0
    return StorageService.save_person(person_dict)

@router.get("/{person_id}", response_model=Person)
def get_person(person_id: str):
    """Retrieves a single person."""
    people = StorageService.get_people()
    for p in people:
        if p["id"] == person_id:
            return p
    raise HTTPException(status_code=404, detail="Person not found")
