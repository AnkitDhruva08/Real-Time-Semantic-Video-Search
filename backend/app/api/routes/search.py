from fastapi import APIRouter
from app.schemas.search_scheams import SearchRequest, SearchResponse
from app.services.semantic_search import SemanticSearchService

router = APIRouter()
service = SemanticSearchService()


@router.post("/", response_model=SearchResponse)
async def search(request: SearchRequest):

    results = await service.search(request.query, request.limit)

    return {
        "query": request.query,
        "results": results
    }