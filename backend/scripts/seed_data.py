import asyncio
import uuid
from sqlalchemy import text
from app.core.database import AsyncSessionLocal


async def seed_videos():

    async with AsyncSessionLocal() as session:

        for i in range(3):

            video_id = str(uuid.uuid4())

            await session.execute(
                text(
                    """
                    INSERT INTO videos
                    (id, title, filename, duration, video_url, status)
                    VALUES
                    (:id, :title, :filename, :duration, :video_url, :status)
                    """
                ),
                {
                    "id": video_id,
                    "title": f"Demo Video {i+1}",
                    "filename": f"demo{i+1}.mp4",
                    "duration": 120,
                    "video_url": f"/videos/demo{i+1}.mp4",
                    "status": "ready",
                },
            )

        await session.commit()

    print("Seed data inserted successfully")


if __name__ == "__main__":
    asyncio.run(seed_videos())