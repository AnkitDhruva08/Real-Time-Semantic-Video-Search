from fastapi import APIRouter, Query
from app.schemas.search_scheams import SearchResponse
from app.services.semantic_search import SemanticSearchService

router = APIRouter()
service = SemanticSearchService()


@router.get("/", response_model=SearchResponse)
async def search(
    q: str = Query(...),
    limit: int = 10,
    min_similarity: float = Query(0.2, ge=0.0, le=1.0),
    debug: bool = False
):
    results = await service.search(q, limit, min_similarity, debug)

    return {
        "query": q,
        "results": results
    }