import os
import shutil


TMP_FRAME_DIR = "/tmp/frames"


def cleanup():

    if not os.path.exists(TMP_FRAME_DIR):
        print("No frame directory found")
        return

    folders = os.listdir(TMP_FRAME_DIR)

    print(f"Cleaning {len(folders)} frame folders")

    for folder in folders:

        path = os.path.join(TMP_FRAME_DIR, folder)

        if os.path.isdir(path):
            shutil.rmtree(path)

    print("Frame cleanup completed")


if __name__ == "__main__":
    cleanup()