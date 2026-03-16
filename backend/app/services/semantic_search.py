from sqlalchemy import text
from app.core.database import AsyncSessionLocal
from app.services.clip_embeddings import CLIPEmbeddingService
from app.utils.logging import Logger

logger = Logger.get_logger(__name__)


class SemanticSearchService:

    def __init__(self):
        # Load CLIP model once
        self.clip_service = CLIPEmbeddingService()

    async def search(
        self,
        query: str,
        limit: int = 20,
        min_similarity: float = 0.2,
        debug: bool = False,
    ):

        logger.info(f"Semantic search started for query: {query}")

        # -------------------------------------------------
        # Convert text → embedding
        # -------------------------------------------------

        embedding = self.clip_service.text_embedding(query)
        print('embedding:', embedding)

        emb_len = len(embedding) if embedding is not None else None
        logger.info(f"Text embedding length: {emb_len}")

        query_embedding = "[" + ",".join(map(str, embedding)) + "]"

        # -------------------------------------------------
        # Debug nearest neighbors
        # -------------------------------------------------

        if debug:
            async with AsyncSessionLocal() as session:

                debug_sql = text(
                    """
                    SELECT
                        id,
                        video_id,
                        frame_number,
                        thumbnail_url,
                        embedding <=> :embedding AS distance
                    FROM frame_embeddings
                    ORDER BY embedding <=> :embedding
                    LIMIT :limit
                    """
                )

                dbg_result = await session.execute(
                    debug_sql,
                    {"embedding": query_embedding, "limit": min(limit, 20)},
                )

                dbg_rows = dbg_result.fetchall()

                if not dbg_rows:
                    logger.info("Debug: no neighbors found")
                else:
                    distances = [float(r.distance) for r in dbg_rows]
                    similarities = [1 - d for d in distances]

                    logger.info(f"Debug distances: {distances[:10]}")
                    logger.info(f"Debug similarities: {similarities[:10]}")

        # -------------------------------------------------
        # Main semantic search query
        # -------------------------------------------------

        async with AsyncSessionLocal() as session:

            sql = text(
                """
                SELECT
                    fe.id AS frame_id,
                    fe.frame_number,
                    fe.video_id,
                    fe.timestamp,
                    fe.thumbnail_url,
                    v.title,
                    v.video_url,
                    v.filename,
                    1 - (fe.embedding <=> :embedding) AS similarity
                FROM frame_embeddings fe
                JOIN videos v
                ON v.id = fe.video_id
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

        # -------------------------------------------------
        # Format response
        # -------------------------------------------------

        results = [
            {
                "frame_id": str(row.frame_id),
                "frame_number": int(row.frame_number),
                "video_id": str(row.video_id),

                "title": row.title,
                "video_url": row.video_url,
                "filename": row.filename,

                "timestamp": float(row.timestamp),
                "thumbnail_url": row.thumbnail_url,
                "similarity": float(row.similarity),

                "result_key": str(row.frame_id),
            }
            for row in rows
        ]

        logger.info(f"Search returned {len(results)} results")

        return results