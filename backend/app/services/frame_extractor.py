import subprocess
import os
from typing import List
from app.utils.logging import Logger

logger = Logger.get_logger(__name__)


class FrameExtractor:
    """
    Extract frames from videos using FFmpeg
    """

    def __init__(self, fps: int = 1):
        self.fps = fps

    def extract_frames(self, video_path: str, output_dir: str) -> List[str]:
        """
        Extract frames from video using FFmpeg
        """

        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video not found: {video_path}")

        os.makedirs(output_dir, exist_ok=True)

        logger.info(f"Starting frame extraction from: {video_path}")

        command = [
            "ffmpeg",
            "-y",
            "-i",
            video_path,
            "-vf",
            f"fps={self.fps}",
            "-q:v",
            "2",
            os.path.join(output_dir, "frame_%06d.jpg"),
        ]

        try:
            result = subprocess.run(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
            )

        except subprocess.CalledProcessError as e:
            logger.error("FFmpeg frame extraction failed")
            logger.error(e.stderr.decode())
            raise RuntimeError("Frame extraction failed")

        frames = sorted(
            [
                os.path.join(output_dir, f)
                for f in os.listdir(output_dir)
                if f.endswith(".jpg")
            ]
        )

        logger.info(f"Extracted {len(frames)} frames")

        return frames

    def get_video_duration(self, video_path: str) -> float:
        """
        Get video duration using ffprobe
        """

        command = [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            video_path,
        ]

        try:
            result = subprocess.run(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=True,
            )

            duration = float(result.stdout.strip())

        except Exception:
            logger.error("Failed to read video duration")
            duration = 0.0

        return duration

    def estimate_total_frames(self, video_path: str) -> int:
        """
        Estimate number of frames to be extracted
        """

        duration = self.get_video_duration(video_path)

        estimated_frames = int(duration * self.fps)

        logger.info(f"Estimated frames: {estimated_frames}")

        return estimated_frames