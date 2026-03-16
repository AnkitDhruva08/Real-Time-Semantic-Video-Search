from pydantic import BaseModel
from uuid import UUID


class SearchRequest(BaseModel):
    query: str
    limit: int = 10
    min_similarity: float = 0.2


class FrameResult(BaseModel):
    video_id: UUID
    timestamp: float
    thumbnail_url: str
    similarity: float
    filename: str
    title: str
    video_url: str


class SearchResponse(BaseModel):
    query: str
    results: list[FrameResult]