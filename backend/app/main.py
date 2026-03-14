from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from fastapi.staticfiles import StaticFiles

from app.core.database import engine
from app.api.routes import api_router


app = FastAPI(title="Semantic Video Search API")


# CORS (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/videos", StaticFiles(directory="storage/videos"), name="videos")
app.mount("/thumbnails", StaticFiles(directory="storage/thumbnails"), name="thumbnails")

app.include_router(api_router, prefix="/api/v1")


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