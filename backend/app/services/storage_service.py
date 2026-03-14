import os
import uuid
import shutil
from fastapi import UploadFile
from app.utils.logging import Logger

logger = Logger.get_logger(__name__)


class StorageService:

    def __init__(
        self,
        video_dir: str = "storage/videos",
        thumb_dir: str = "storage/thumbnails",
    ):
        self.video_dir = video_dir
        self.thumb_dir = thumb_dir

        os.makedirs(self.video_dir, exist_ok=True)
        os.makedirs(self.thumb_dir, exist_ok=True)

    async def save_video(self, upload_file: UploadFile) -> str:
        """
        Save uploaded video file
        """

        file_id = str(uuid.uuid4())

        extension = os.path.splitext(upload_file.filename)[1]
        filename = f"{file_id}{extension}"

        path = os.path.join(self.video_dir, filename)

        logger.info(f"Saving video: {filename}")

        try:

            with open(path, "wb") as buffer:

                while True:
                    chunk = await upload_file.read(1024 * 1024)  # 1MB chunks
                    if not chunk:
                        break

                    buffer.write(chunk)

        except Exception as e:

            logger.error("Video save failed")
            logger.error(str(e))
            raise

        return filename

    def save_thumbnail(self, image_path: str) -> str:
        """
        Save generated frame thumbnail
        """

        if not os.path.exists(image_path):
            raise FileNotFoundError("Thumbnail source not found")

        file_id = str(uuid.uuid4())
        filename = f"{file_id}.jpg"

        dest = os.path.join(self.thumb_dir, filename)

        logger.info(f"Saving thumbnail: {filename}")

        shutil.copy(image_path, dest)

        return filename

    def delete_video(self, filename: str):
        """
        Delete stored video
        """

        path = os.path.join(self.video_dir, filename)

        if os.path.exists(path):
            os.remove(path)
            logger.info(f"Deleted video: {filename}")

    def get_video_url(self, filename: str) -> str:
        """
        Public video URL for frontend
        """

        return f"/storage/videos/{filename}"

    def get_thumbnail_url(self, filename: str) -> str:
        """
        Public thumbnail URL
        """

        return f"/storage/thumbnails/{filename}"