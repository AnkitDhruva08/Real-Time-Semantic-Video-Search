import uuid
import os

from app.services.frame_extractor import FrameExtractor
from app.services.clip_embeddings import CLIPEmbeddingService
from app.services.storage_service import StorageService
from app.core.database import AsyncSessionLocal
from app.utils.logging import Logger
from app.models.frame_embedding import FrameEmbedding
from app.models.video import Video


logger = Logger.get_logger(__name__)


class VideoIngestionService:

    def __init__(self):
        self.frame_extractor = FrameExtractor()
        self.clip_service = CLIPEmbeddingService()
        self.storage = StorageService()

    async def process_video(self, upload_file):

        logger.info("Starting video ingestion")

        # ----------------------------------
        # 1️⃣ Save uploaded video
        # ----------------------------------
        filename = await self.storage.save_video(upload_file)

        video_path = os.path.join(self.storage.video_dir, filename)

        video_id = uuid.uuid4()

        frame_dir = f"/tmp/frames/{video_id}"
        os.makedirs(frame_dir, exist_ok=True)

        async with AsyncSessionLocal() as session:

            try:

                # ----------------------------------
                # 2️⃣ Create video record
                # ----------------------------------
                video = Video(
                    id=video_id,
                    title=upload_file.filename,
                    filename=filename,
                    video_url=self.storage.get_video_url(filename),
                    status="processing",
                    total_frames=0
                )

                session.add(video)
                await session.commit()

                # ----------------------------------
                # 3️⃣ Extract frames
                # ----------------------------------
                frames = self.frame_extractor.extract_frames(video_path, frame_dir)

                logger.info(f"Extracted {len(frames)} frames")

                batch_size = 32

                for batch_start in range(0, len(frames), batch_size):

                    batch_frames = frames[batch_start: batch_start + batch_size]

                    embeddings = self.clip_service.batch_image_embeddings(batch_frames)

                    objects = []

                    for i, (frame_path, emb) in enumerate(zip(batch_frames, embeddings)):

                        frame_number = batch_start + i
                        timestamp = frame_number * 1.0

                        thumb_filename = self.storage.save_thumbnail(frame_path)

                        frame_embedding = FrameEmbedding(
                            video_id=video_id,
                            frame_number=frame_number,
                            timestamp=timestamp,
                            thumbnail_url=self.storage.get_thumbnail_url(thumb_filename),
                            embedding=emb.tolist()
                        )

                        objects.append(frame_embedding)

                    session.add_all(objects)

                # ----------------------------------
                # 4️⃣ Update video metadata
                # ----------------------------------
                video.total_frames = len(frames)
                video.status = "ready"

                await session.commit()

                logger.info("Video ingestion completed successfully")

            except Exception as e:

                await session.rollback()

                logger.error("Video ingestion failed")
                logger.error(str(e))

                raise

        return str(video_id)