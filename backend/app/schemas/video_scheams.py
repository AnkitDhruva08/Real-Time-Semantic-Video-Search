from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class VideoBase(BaseModel):
    title: str
    duration: float | None = None


class VideoResponse(VideoBase):
    id: UUID
    video_url: str | None = None
    thumbnail_url: str | None = None
    status: str
    total_frames: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class VideoUploadResponse(BaseModel):
    message: str
    video_id: UUID