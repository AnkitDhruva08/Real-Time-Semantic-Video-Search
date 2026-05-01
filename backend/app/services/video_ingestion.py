import os
import asyncio
from app.services.frame_extractor import FrameExtractor
from app.services.storage_service import StorageService
from app.core.database import AsyncSessionLocal
from app.models.frame_embedding import FrameEmbedding
from app.models.video import Video
from app.utils.logging import Logger
import shutil
import cv2
from ultralytics import YOLO


logger = Logger.get_logger(__name__)


class VideoIngestionService:

    def __init__(self, clip_service):

        self.frame_extractor = FrameExtractor(fps=5, scene_detection=True)

        self.clip_service = clip_service

        self.storage = StorageService()

        # Load YOLO object detector once
        logger.info("Loading YOLO object detection model")

        self.detector = YOLO("yolov8n.pt")


     # ------------------------------------------------
    # Detect objects in frame
    # ------------------------------------------------

    def detect_objects(self, frame_path):

        try:

            frame = cv2.imread(frame_path)

            results = self.detector(frame)

            labels = []

            for r in results:
                for box in r.boxes:
                    cls = int(box.cls[0])
                    labels.append(self.detector.names[cls])

            return list(set(labels))

        except Exception as e:

            logger.warning(f"Object detection failed for {frame_path}: {e}")

            return []

    # ------------------------------------------------
    # Main processing pipeline
    # ------------------------------------------------

    def process_video_sync(self, video_path: str, video_id: str):

        print("========== VIDEO INGESTION START ==========")
        print("VIDEO PATH:", video_path)
        print("VIDEO ID:", video_id)

        logger.info(f"Processing video {video_id}")

        frame_dir = f"/tmp/frames/{video_id}"
        os.makedirs(frame_dir, exist_ok=True)

        try:

            print("STEP 1: Extracting frames...")

            frames = self.frame_extractor.extract_frames(video_path, frame_dir)

            print("Frames extracted:", len(frames))

            if not frames:
                print("ERROR: No frames extracted from video")
                logger.warning("No frames extracted")

            batch_size = 64
            embeddings_to_save = []

            for batch_start in range(0, len(frames), batch_size):

                batch_frames = frames[batch_start: batch_start + batch_size]

                print("START CLIP EMBEDDING")

                embeddings = self.clip_service.batch_image_embeddings(batch_frames)
                print("CLIP EMBEDDING DONE")

                for i, (frame_path, emb) in enumerate(zip(batch_frames, embeddings)):

                    frame_number = batch_start + i
                    timestamp = frame_number * 1.0

                    print("Saving thumbnail for frame:", frame_number)

                    thumb_filename = self.storage.save_thumbnail(frame_path)

                    print("Thumbnail saved:", thumb_filename)

                    embeddings_to_save.append(
                        FrameEmbedding(
                            video_id=video_id,
                            frame_number=frame_number,
                            timestamp=timestamp,
                            thumbnail_url=self.storage.get_thumbnail_url(thumb_filename),
                            embedding=emb.tolist()
                        )
                    )

            print("STEP 3: Saving embeddings to database")
            print("Total embeddings:", len(embeddings_to_save))

            asyncio.run(self._save_embeddings(video_id, embeddings_to_save))

            print("========== VIDEO INGESTION DONE ==========")

        except Exception as e:

            print("VIDEO INGESTION FAILED:", str(e))

            logger.error("Video ingestion failed")
            logger.error(str(e))
            raise

        finally:

            print("Cleaning frame directory")

            import shutil
            shutil.rmtree(frame_dir, ignore_errors=True)

            logger.info("Video ingestion completed")
    # ------------------------------------------------
    # Save embeddings to DB
    # ------------------------------------------------

    async def _save_embeddings(self, video_id, embeddings):

        async with AsyncSessionLocal() as session:

            await session.execute(
                Video.__table__.update()
                .where(Video.id == video_id)
                .values(
                    total_frames=len(embeddings),
                    status="processing"
                )
            )

            session.add_all(embeddings)

            # If we have at least one embedding, use its thumbnail as the video's thumbnail
            video_thumbnail = None
            if embeddings:
                # embeddings are FrameEmbedding instances; they should have thumbnail_url set
                try:
                    video_thumbnail = embeddings[0].thumbnail_url
                except Exception:
                    video_thumbnail = None

            await session.execute(
                Video.__table__.update()
                .where(Video.id == video_id)
                .values(status="ready", thumbnail_url=video_thumbnail)
            )

            await session.commit()