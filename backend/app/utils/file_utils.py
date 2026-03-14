import os
import uuid
import shutil


class FileUtils:

    @staticmethod
    def generate_id():
        return str(uuid.uuid4())

    @staticmethod
    def ensure_dir(path: str):
        os.makedirs(path, exist_ok=True)

    @staticmethod
    def save_file(upload_file, directory: str):

        FileUtils.ensure_dir(directory)

        file_id = FileUtils.generate_id()
        filename = f"{file_id}_{upload_file.filename}"

        path = os.path.join(directory, filename)

        with open(path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

        return path