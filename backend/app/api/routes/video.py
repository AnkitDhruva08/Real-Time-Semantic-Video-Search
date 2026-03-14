from fastapi import APIRouter, UploadFile, File, HTTPException
from sqlalchemy import select

from app.services.video_ingestion import VideoIngestionService
from app.schemas.video_scheams import VideoUploadResponse
from app.models.video import Video
from app.core.database import AsyncSessionLocal

router = APIRouter()

video_service = VideoIngestionService()


@router.post("/upload", response_model=VideoUploadResponse)
async def upload_video(video: UploadFile = File(...)):

    if not video.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")

    video_id = await video_service.process_video(video)

    return VideoUploadResponse(
        message="Video uploaded and processing started",
        video_id=video_id
    )


@router.get("/{video_id}")
async def get_video(video_id: str):

    async with AsyncSessionLocal() as session:

        result = await session.execute(
            select(Video).where(Video.id == video_id)
        )

        video = result.scalar_one_or_none()

        if not video:
            raise HTTPException(status_code=404, detail="Video not found")

        return {
            "id": str(video.id),
            "title": video.title,
            "video_url": video.video_url,
            "thumbnail_url": video.thumbnail_url,
            "status": video.status,
            "total_frames": video.total_frames,
        }