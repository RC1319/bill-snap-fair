from .ocr import router as ocr_router
from .bills import router as bills_router
from .people import router as people_router
from .splits import router as splits_router
from .activity import router as activity_router

__all__ = [
    "ocr_router",
    "bills_router",
    "people_router",
    "splits_router",
    "activity_router",
]
