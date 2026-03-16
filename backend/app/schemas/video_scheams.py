from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


# ------------------------------------------------
# Base schema
# ------------------------------------------------

class VideoBase(BaseModel):
    title: str
    duration: Optional[float] = None


# ------------------------------------------------
# Full Video Response
# ------------------------------------------------

class VideoResponse(VideoBase):

    id: UUID
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: str
    total_frames: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ------------------------------------------------
# Upload Response
# ------------------------------------------------

class VideoUploadResponse(BaseModel):

    message: str
    video_id: UUID
    video_url: Optional[str] = None