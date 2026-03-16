import uuid

from sqlalchemy import Column, Float, Integer, ForeignKey, TIMESTAMP, String, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class FrameEmbedding(Base):
    __tablename__ = "frame_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    video_id = Column(
        UUID(as_uuid=True),
        ForeignKey("videos.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    frame_number = Column(Integer, nullable=False)

    timestamp = Column(Float, nullable=False)

    thumbnail_url = Column(String, nullable=True)

    embedding = Column(Vector(512), nullable=False)

    created_at = Column(TIMESTAMP, server_default=func.now())

    video = relationship("Video", back_populates="frame_embeddings")


# Additional indexes
Index("idx_frame_video_frame", FrameEmbedding.video_id, FrameEmbedding.frame_number)