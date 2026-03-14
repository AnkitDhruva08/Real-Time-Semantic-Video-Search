import subprocess
import os


class FFmpegUtils:

    @staticmethod
    def extract_frames(video_path: str, output_dir: str, fps: int = 1):

        os.makedirs(output_dir, exist_ok=True)

        command = [
            "ffmpeg",
            "-i",
            video_path,
            "-vf",
            f"fps={fps}",
            "-q:v",
            "2",
            f"{output_dir}/frame_%06d.jpg"
        ]

        subprocess.run(command, check=True)

        frames = sorted(
            [
                os.path.join(output_dir, f)
                for f in os.listdir(output_dir)
                if f.endswith(".jpg")
            ]
        )

        return frames

    @staticmethod
    def get_video_duration(video_path: str):

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

        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        return float(result.stdout.strip())