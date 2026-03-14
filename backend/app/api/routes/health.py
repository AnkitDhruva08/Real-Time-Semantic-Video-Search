from fastapi import APIRouter
from app.core.database import engine

router = APIRouter()


@router.get("/health")
async def health_check():

    try:
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")

        return {
            "status": "healthy",
            "service": "Semantic Video Search API"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }