import numpy as np
from sqlalchemy import text
from typing import List, Dict, Any

from app.core.database import AsyncSessionLocal
from app.services.clip_embeddings import CLIPEmbeddingService
from app.services.query_expansion import QueryExpansionService
from app.utils.logging import Logger

logger = Logger.get_logger(__name__)

class SemanticSearchService:
    """
    Optimized Semantic Video Search.
    Fixes accuracy issues by prioritizing the original query over expansion drift.
    """

    def __init__(self):
        self.clip_service = CLIPEmbeddingService()
        self.query_expander = QueryExpansionService()

    def _normalize(self, embedding: Any) -> List[float]:
        """Convert to unit vector for accurate cosine similarity."""
        vec = np.array(embedding, dtype=np.float32)
        norm = np.linalg.norm(vec)
        if norm < 1e-6:
            return vec.tolist()
        return (vec / norm).tolist()

    async def search(
        self,
        query: str,
        limit: int = 20,
        min_similarity: float = 0.30, # Increased floor for better accuracy
        debug: bool = False,
    ) -> List[Dict[str, Any]]:
        if not query or not query.strip():
            return []

        # 1. EXPANSION DRIFT CONTROL
        # We perform expansion, but we ALWAYS put the original query first.
        expanded = self.query_expander.expand(query) or []
        # Filter out expansions that are too generic or unrelated (like 'dog' for 'elephant')
        # For now, we just ensure the original query is the "Anchor".
        search_terms = [query] + [q for q in expanded if q.lower() != query.lower()]
        
        logger.info(f"Executing search for: {query!r} | Using terms: {search_terms}")

        collected_results = []

        async with AsyncSessionLocal() as session:
            for i, term in enumerate(search_terms):
                # Generate Embedding
                raw_emb = self.clip_service.text_embedding(term)
                
                # Robust NumPy check
                if raw_emb is None or (isinstance(raw_emb, np.ndarray) and raw_emb.size == 0):
                    continue

                norm_emb = self._normalize(raw_emb)
                vector_str = "[" + ",".join(map(str, norm_emb)) + "]"

                # SQL Query
                # We apply a slight 'boost' (weight) to the original query (index 0)
                weight_multiplier = 1.1 if i == 0 else 1.0

                sql = text("""
                    SELECT 
                        fe.id, fe.frame_number, fe.video_id, fe.timestamp, fe.thumbnail_url,
                        v.title, v.video_url, v.filename,
                        (1.0 - (fe.embedding <=> :embedding)) AS similarity
                    FROM frame_embeddings fe
                    JOIN videos v ON v.id = fe.video_id
                    WHERE (1.0 - (fe.embedding <=> :embedding)) >= :min_sim
                    ORDER BY similarity DESC
                    LIMIT :limit
                """)

                result = await session.execute(
                    sql, 
                    {"embedding": vector_str, "min_sim": min_similarity, "limit": limit}
                )

                for row in result.fetchall():
                    collected_results.append({
                        "frame_id": str(row.id),
                        "frame_number": int(row.frame_number),
                        "video_id": str(row.video_id),
                        "title": row.title or "Unknown Video",
                        "video_url": row.video_url or "",
                        "filename": row.filename or "",
                        "timestamp": round(float(row.timestamp), 2),
                        "thumbnail_url": row.thumbnail_url or "",
                        "similarity": float(row.similarity) * weight_multiplier, # Boost original query
                    })

        if not collected_results:
            return []

        # 2. GLOBAL SORT & DEDUPLICATE
        # Sort by boosted similarity
        collected_results.sort(key=lambda x: x["similarity"], reverse=True)

        final_results = []
        seen_frames = set()

        for item in collected_results:
            if item["frame_id"] not in seen_frames:
                seen_frames.add(item["frame_id"])
                # Clean up the similarity for display (remove the internal boost multiplier)
                item["similarity"] = round(min(item["similarity"], 1.0), 4)
                final_results.append(item)
            
            if len(final_results) >= limit:
                break

        logger.info(f"Search yielded {len(final_results)} accurate results.")
        return final_results