from fastapi import APIRouter
from .health import router as health_router
from .video import router as video_router
from .search import router as search_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="/health", tags=["Health"])
api_router.include_router(video_router, prefix="/videos", tags=["Videos"])
api_router.include_router(search_router, prefix="/search", tags=["Search"])