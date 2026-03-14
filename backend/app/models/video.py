import uuid

from sqlalchemy import Column, String, Float, Integer, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Video(Base):
    __tablename__ = "videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title = Column(String(500), nullable=False)
    filename = Column(String(255), nullable=False)

    duration = Column(Float, nullable=True)

    video_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)

    status = Column(String(50), default="processing")

    total_frames = Column(Integer, default=0)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )

    # relationship with embeddings
    frame_embeddings = relationship(
        "FrameEmbedding",
        back_populates="video",
        cascade="all, delete-orphan"
    )