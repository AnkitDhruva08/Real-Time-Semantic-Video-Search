from celery import Celery
from app.core.config import settings
from app.services.video_ingestion import VideoIngestionService

celery_app = Celery(
    "video_ingestion",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.task_routes = {
    "process_video_task": {"queue": "video"}
}


@celery_app.task(name="process_video_task")
def process_video_task(video_path: str, video_id: str):

    service = VideoIngestionService()

    service.process_video_sync(video_path, video_id)