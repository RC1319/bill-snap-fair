from fastapi import APIRouter
from ..models.split import SplitCalculationRequest, SplitCalculationResponse
from ..services.split_service import SplitService

router = APIRouter(prefix="/split", tags=["Splitting"])

@router.post("/calculate", response_model=SplitCalculationResponse)
def calculate_split(payload: SplitCalculationRequest):
    """
    Computes fair item-based proportional split:
    - Calculates each person's consumed subtotal from assigned items
    - Proportionally distributes CGST, SGST, service charges, discounts, and tips
    - Generates optimized settlement transfers (who pays whom).
    """
    return SplitService.calculate_split(payload)
