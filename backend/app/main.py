from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import (
    ocr_router,
    bills_router,
    people_router,
    splits_router,
    activity_router,
)

app = FastAPI(
    title="SplitSnap API",
    description="AI Receipt OCR & Proportional Expense Splitting Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for seamless frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api prefix
app.include_router(ocr_router, prefix="/api")
app.include_router(bills_router, prefix="/api")
app.include_router(people_router, prefix="/api")
app.include_router(splits_router, prefix="/api")
app.include_router(activity_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "SplitSnap API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs",
        "endpoints": {
            "ocr_upload": "POST /api/ocr/upload",
            "ocr_parse_text": "POST /api/ocr/parse-text",
            "split_calculate": "POST /api/split/calculate",
            "bills": "/api/bills",
            "people": "/api/people",
            "activity": "/api/activity",
        }
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
