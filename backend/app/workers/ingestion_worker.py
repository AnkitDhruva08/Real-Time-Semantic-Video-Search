from celery import Celery
from app.services.video_ingestion import VideoIngestionService
from app.services.clip_embeddings import CLIPEmbeddingService
from app.core.config import settings

celery_app = Celery(
    "video-worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

clip_service = CLIPEmbeddingService()
ingestion_service = VideoIngestionService(clip_service)


@celery_app.task
def process_video(video_id: str, filename: str):

    video_path = f"storage/videos/{filename}"

    ingestion_service.process_video_sync(video_path, video_id)