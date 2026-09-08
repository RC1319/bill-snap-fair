from pydantic import BaseModel, Field, ConfigDict
import uuid

class PersonBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    email: str | None = None
    avatar: str | None = None
    accent: str | None = "gold"

class PersonCreate(PersonBase):
    pass

class Person(PersonBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    bills_count: int = 0
    total_paid: float = 0.0
    total_owed: float = 0.0
