import os
import uuid
import shutil
import hashlib
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

    # ---------------------------------------------
    # Save video with duplicate detection
    # ---------------------------------------------

    async def save_video(self, upload_file: UploadFile) -> str:

        extension = os.path.splitext(upload_file.filename)[1]

        sha256 = hashlib.sha256()
        chunks = []

        while True:

            chunk = await upload_file.read(1024 * 1024)

            if not chunk:
                break

            sha256.update(chunk)
            chunks.append(chunk)

        file_hash = sha256.hexdigest()

        filename = f"{file_hash}{extension}"
        path = os.path.join(self.video_dir, filename)

        if os.path.exists(path):
            logger.info(f"Duplicate video detected: {filename}")
            return filename

        logger.info(f"Saving video: {filename}")

        with open(path, "wb") as f:
            for chunk in chunks:
                f.write(chunk)

        return filename

    # ---------------------------------------------
    # Save thumbnail
    # ---------------------------------------------

    def save_thumbnail(self, image_path: str) -> str:

        file_id = str(uuid.uuid4())
        filename = f"{file_id}.jpg"

        dest = os.path.join(self.thumb_dir, filename)

        shutil.copy2(image_path, dest)

        return filename

    # ---------------------------------------------
    # URLs
    # ---------------------------------------------

    def get_video_url(self, filename: str) -> str:
        return f"/videos/{filename}"

    def get_thumbnail_url(self, filename: str) -> str:
        return f"/thumbnails/{filename}"