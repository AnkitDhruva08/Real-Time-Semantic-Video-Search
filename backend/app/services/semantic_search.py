from sqlalchemy import text
from app.core.database import AsyncSessionLocal
from app.services.clip_embeddings import CLIPEmbeddingService
from app.utils.logging import Logger

logger = Logger.get_logger(__name__)


class SemanticSearchService:

    def __init__(self):
        self.clip_service = CLIPEmbeddingService()

    async def search(self, query: str, limit: int = 20, min_similarity: float = 0.7):

        logger.info(f"Semantic search started for query: {query}")

        # Convert query text to embedding
        query_embedding = self.clip_service.text_embedding(query).tolist()

        async with AsyncSessionLocal() as session:

            sql = text(
                """
                SELECT
                    fe.video_id,
                    fe.timestamp,
                    fe.thumbnail_url,
                    1 - (fe.embedding <=> :embedding) AS similarity
                FROM frame_embeddings fe
                WHERE 1 - (fe.embedding <=> :embedding) >= :min_similarity
                ORDER BY fe.embedding <=> :embedding
                LIMIT :limit
                """
            )

            result = await session.execute(
                sql,
                {
                    "embedding": query_embedding,
                    "limit": limit,
                    "min_similarity": min_similarity,
                },
            )

            rows = result.fetchall()

        results = [
            {
                "video_id": str(row.video_id),
                "timestamp": float(row.timestamp),
                "thumbnail_url": row.thumbnail_url,
                "similarity": float(row.similarity),
            }
            for row in rows
        ]

        logger.info(f"Search returned {len(results)} results")

        return results