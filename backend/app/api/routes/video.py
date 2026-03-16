from fastapi import APIRouter, UploadFile, File, HTTPException
from sqlalchemy import select
import uuid
import os

from app.schemas.video_scheams import VideoUploadResponse
from app.models.video import Video
from app.core.database import AsyncSessionLocal
from app.services.storage_service import StorageService
from app.workers.ingestion_worker import process_video

router = APIRouter()

storage = StorageService()


# ------------------------------------------------------
# Upload Video
# ------------------------------------------------------

@router.post("/upload", response_model=VideoUploadResponse)
async def upload_video(file: UploadFile = File(...)):
    
    # ---------------------------------------
    # Validate video file
    # ---------------------------------------
    if not file.content_type.startswith("video/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be a video"
        )

    async with AsyncSessionLocal() as session:

        # ---------------------------------------
        # Check duplicate video by filename
        # ---------------------------------------
        result = await session.execute(
            select(Video).where(Video.title == file.filename)
        )

        existing = result.scalar_one_or_none()

        if existing:
            return VideoUploadResponse(
                message="Video already uploaded",
                video_id=str(existing.id),
                video_url=existing.video_url
            )

        # ---------------------------------------
        # Save video to storage
        # ---------------------------------------
        filename = await storage.save_video(file)

        video_url = storage.get_video_url(filename)

        # ---------------------------------------
        # Create DB record
        # ---------------------------------------
        video_id = uuid.uuid4()

        video = Video(
            id=video_id,
            title=file.filename,
            filename=filename,
            video_url=video_url,
            status="queued",
            total_frames=0
        )

        session.add(video)
        await session.commit()

    # ---------------------------------------
    # Trigger async video processing
    # ---------------------------------------
    process_video.delay(str(video_id), filename)

    return VideoUploadResponse(
        message="Video uploaded successfully. Processing started.",
        video_id=video_id,
        video_url=video_url
    )


# ------------------------------------------------------
# Get Video Info
# ------------------------------------------------------

@router.get("/{video_id}")
async def get_video(video_id: str):

    async with AsyncSessionLocal() as session:

        result = await session.execute(
            select(Video).where(Video.id == video_id)
        )

        video = result.scalar_one_or_none()

        if not video:
            raise HTTPException(
                status_code=404,
                detail="Video not found"
            )

        return {
            "id": str(video.id),
            "title": video.title,
            "video_url": video.video_url,
            "thumbnail_url": video.thumbnail_url,
            "status": video.status,
            "total_frames": video.total_frames
        }