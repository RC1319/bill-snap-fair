from fastapi import APIRouter
from ..models.activity import ActivityLog
from ..services.storage_service import StorageService

router = APIRouter(prefix="/activity", tags=["Activity"])

@router.get("", response_model=list[ActivityLog])
def list_activity():
    """Returns activity history."""
    return StorageService.get_activities()
