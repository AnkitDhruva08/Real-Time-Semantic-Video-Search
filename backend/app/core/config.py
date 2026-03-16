from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):

    # ========================
    # API
    # ========================

    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True


    # ========================
    # DATABASE
    # ========================

    DATABASE_URL: str


    # ========================
    # REDIS / CELERY
    # ========================

    REDIS_URL: str


    # ========================
    # STORAGE
    # ========================

    VIDEO_STORAGE_PATH: str
    THUMBNAIL_STORAGE_PATH: str


    # ========================
    # AI MODEL
    # ========================

    CLIP_MODEL: str = "ViT-B/32"
    DEVICE: str = "cpu"


    # ========================
    # SEARCH
    # ========================

    FRAME_EXTRACTION_FPS: int = 1
    MAX_SEARCH_RESULTS: int = 20
    MIN_SIMILARITY: float = 0.2


    # ========================
    # CORS
    # ========================

    FRONTEND_URL: str = "http://localhost:5173"


    model_config = ConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()