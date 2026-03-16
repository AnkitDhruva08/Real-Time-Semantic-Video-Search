import subprocess
import os
from typing import List
from app.utils.logging import Logger

logger = Logger.get_logger(__name__)


class FrameExtractor:
    """
    Extract frames from videos using FFmpeg.

    Features:
    - FPS extraction
    - Scene detection extraction
    - Hybrid mode (FPS + scene detection)
    - Automatic fallback if no frames extracted
    """

    def __init__(self, fps: float = 3.0, scene_detection: bool = True):
        self.fps = fps
        self.scene_detection = scene_detection

    # ------------------------------------------------
    # Frame extraction
    # ------------------------------------------------

    def extract_frames(self, video_path: str, output_dir: str) -> List[str]:

        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video not found: {video_path}")

        os.makedirs(output_dir, exist_ok=True)

        logger.info(f"Starting frame extraction: {video_path}")

        # ------------------------------------------------
        # Build filter expression
        # ------------------------------------------------

        if self.scene_detection:

            logger.info("Using hybrid extraction (fps + scene detection)")

            filter_expr = f"fps={self.fps},select='gt(scene,0.3)',scale=640:-1"

        else:

            logger.info(f"Using FPS extraction: {self.fps} fps")

            filter_expr = f"fps={self.fps},scale=640:-1"

        command = [
            "ffmpeg",
            "-hide_banner",
            "-loglevel", "error",
            "-y",
            "-i", video_path,
            "-vf", filter_expr,
            "-vsync", "vfr",
            "-q:v", "2",
            os.path.join(output_dir, "frame_%06d.jpg"),
        ]

        # ------------------------------------------------
        # Run FFmpeg
        # ------------------------------------------------

        try:

            subprocess.run(
                command,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                check=True,
            )

        except subprocess.CalledProcessError as e:

            logger.error("FFmpeg frame extraction failed")
            logger.error(e.stderr.decode())

            raise RuntimeError("Frame extraction failed")

        # ------------------------------------------------
        # Collect frames
        # ------------------------------------------------

        frames = sorted(
            os.path.join(output_dir, f)
            for f in os.listdir(output_dir)
            if f.endswith(".jpg")
        )

        # ------------------------------------------------
        # Fallback protection
        # ------------------------------------------------

        if len(frames) == 0:

            logger.warning(
                "Scene detection returned 0 frames. Falling back to pure FPS extraction."
            )

            fallback_command = [
                "ffmpeg",
                "-hide_banner",
                "-loglevel", "error",
                "-y",
                "-i", video_path,
                "-vf", f"fps={self.fps},scale=640:-1",
                "-q:v", "2",
                os.path.join(output_dir, "frame_%06d.jpg"),
            ]

            subprocess.run(
                fallback_command,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                check=True,
            )

            frames = sorted(
                os.path.join(output_dir, f)
                for f in os.listdir(output_dir)
                if f.endswith(".jpg")
            )

        logger.info(f"Extracted {len(frames)} frames")

        return frames

    # ------------------------------------------------
    # Get video duration
    # ------------------------------------------------

    def get_video_duration(self, video_path: str) -> float:

        command = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
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

            return float(result.stdout.strip())

        except Exception:

            logger.error("Failed to read video duration")

            return 0.0

    # ------------------------------------------------
    # Estimate frames
    # ------------------------------------------------

    def estimate_total_frames(self, video_path: str) -> int:

        duration = self.get_video_duration(video_path)

        if duration == 0:
            return 0

        estimated = int(duration * self.fps)

        logger.info(f"Estimated frames: {estimated}")

        return estimated