from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
import os

from app.core.database import engine
from app.core.config import settings
from app.api.routes import api_router


app = FastAPI(
    title="Real-Time Semantic Video Search",
    version="1.0.0",
)


# =========================================
# Ensure storage directories exist
# =========================================

BASE_DIR = os.getcwd()

VIDEO_DIR = os.path.join(BASE_DIR, "storage/videos")
THUMB_DIR = os.path.join(BASE_DIR, "storage/thumbnails")

os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(THUMB_DIR, exist_ok=True)


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================
# Static Files
# =========================================

app.mount("/videos", StaticFiles(directory=VIDEO_DIR), name="videos")
app.mount("/thumbnails", StaticFiles(directory=THUMB_DIR), name="thumbnails")


# =========================================
# API ROUTES
# =========================================

app.include_router(api_router, prefix="/api/v1")


# =========================================
# Startup Event
# =========================================

@app.on_event("startup")
async def startup_event():

    print("🚀 Starting Semantic Video Search Backend...")

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))

        print("✅ Database connected successfully")

    except Exception as e:
        print("❌ Database connection failed")
        print(e)