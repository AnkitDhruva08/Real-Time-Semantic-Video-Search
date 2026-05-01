from fastapi import APIRouter, Query
from sqlalchemy import text

from app.schemas.search_scheams import SearchResponse
from app.services.semantic_search import SemanticSearchService
from app.core.database import AsyncSessionLocal

router = APIRouter()
service = SemanticSearchService()


@router.get("/", response_model=SearchResponse)
async def search(
    q: str | None = Query(default=None),
    limit: int = 10,
    min_similarity: float = Query(0.2, ge=0.0, le=1.0),
    debug: bool = False
):

    # -----------------------------------------
    # If query is empty → return all frames
    # -----------------------------------------

    if not q or not q.strip():

        async with AsyncSessionLocal() as session:

            sql = text(
                """
                SELECT
                    fe.id AS frame_id,
                    fe.video_id,
                    fe.frame_number,
                    fe.timestamp,
                    fe.thumbnail_url,
                    v.title,
                    v.video_url,
                    v.filename,
                    1.0 AS similarity
                FROM frame_embeddings fe
                JOIN videos v ON v.id = fe.video_id
                ORDER BY fe.created_at DESC
                LIMIT :limit
                """
            )

            result = await session.execute(sql, {"limit": limit})
            rows = result.fetchall()

        results = [
            {
                "frame_id": str(r.frame_id),
                "frame_number": int(r.frame_number),
                "video_id": str(r.video_id),

                "title": r.title,
                "video_url": r.video_url,
                "filename": r.filename,

                "timestamp": float(r.timestamp),
                "thumbnail_url": r.thumbnail_url,

                "similarity": float(r.similarity),
            }
            for r in rows
        ]

    else:

        # -----------------------------------------
        # Semantic search
        # -----------------------------------------

        results = await service.search(q, limit, min_similarity, debug)

    return {
        "query": q or "",
        "results": results
    }