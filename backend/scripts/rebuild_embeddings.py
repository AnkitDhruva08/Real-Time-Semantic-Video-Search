import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal
from app.services.clip_embeddings import CLIPEmbeddingService


async def rebuild_embeddings():

    clip_service = CLIPEmbeddingService()

    async with AsyncSessionLocal() as session:

        result = await session.execute(
            text(
                """
                SELECT id, thumbnail_url
                FROM frame_embeddings
                """
            )
        )

        rows = result.fetchall()

        print(f"Rebuilding embeddings for {len(rows)} frames")

        for row in rows:

            new_embedding = clip_service.image_embedding(row.thumbnail_url)

            await session.execute(
                text(
                    """
                    UPDATE frame_embeddings
                    SET embedding = :embedding
                    WHERE id = :id
                    """
                ),
                {
                    "id": row.id,
                    "embedding": new_embedding.tolist(),
                },
            )

        await session.commit()

    print("Embeddings rebuilt successfully")


if __name__ == "__main__":
    asyncio.run(rebuild_embeddings())