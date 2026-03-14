import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_upload_video():

    async with AsyncClient(app=app, base_url="http://test") as ac:

        files = {
            "video": ("sample.mp4", b"fake video data", "video/mp4")
        }

        response = await ac.post("/api/videos/upload", files=files)

    assert response.status_code == 200

    data = response.json()

    assert "video_id" in data
    assert data["message"] == "Video uploaded and processing started"