#!/usr/bin/env python3
"""
Verify a semantic search result by checking database row and thumbnail file.

Usage:
  python3 scripts/verify_search_result.py --frame-id <uuid>
  python3 scripts/verify_search_result.py --video-id <uuid> --frame-number <int>

This script uses the project's AsyncSessionLocal and models to locate the frame
embedding row and then checks that the thumbnail file exists under
`storage/thumbnails` (via `StorageService`).
"""
import os
import argparse
import asyncio
import uuid

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.frame_embedding import FrameEmbedding
from app.services.storage_service import StorageService


async def find_by_frame_id(frame_id: str):
    try:
        frame_uuid = uuid.UUID(frame_id)
    except Exception as e:
        print(f"Invalid frame_id: {e}")
        return 2

    async with AsyncSessionLocal() as session:
        row = await session.get(FrameEmbedding, frame_uuid)

        if row is None:
            print(f"No frame embedding found with id {frame_id}")
            return 1

        print("Found frame embedding:")
        print("  id:", row.id)
        print("  video_id:", row.video_id)
        print("  frame_number:", row.frame_number)
        print("  timestamp:", row.timestamp)
        print("  thumbnail_url:", row.thumbnail_url)

        storage = StorageService()

        # thumbnail_url expected like: /thumbnails/<filename>
        if not row.thumbnail_url:
            print("No thumbnail_url set for this frame.")
            return 0

        filename = os.path.basename(row.thumbnail_url)
        path = os.path.join(storage.thumb_dir, filename)

        if os.path.exists(path):
            print(f"Thumbnail file exists: {path}")
            return 0
        else:
            print(f"Thumbnail file NOT found at: {path}")
            return 1


async def find_by_video_and_frame(video_id: str, frame_number: int):
    try:
        video_uuid = uuid.UUID(video_id)
    except Exception as e:
        print(f"Invalid video_id: {e}")
        return 2

    async with AsyncSessionLocal() as session:
        stmt = select(FrameEmbedding).where(
            FrameEmbedding.video_id == video_uuid,
            FrameEmbedding.frame_number == frame_number,
        )
        result = await session.execute(stmt)
        row = result.scalars().first()

        if row is None:
            print(f"No frame embedding found for video {video_id} frame {frame_number}")
            return 1

        print("Found frame embedding:")
        print("  id:", row.id)
        print("  video_id:", row.video_id)
        print("  frame_number:", row.frame_number)
        print("  timestamp:", row.timestamp)
        print("  thumbnail_url:", row.thumbnail_url)

        storage = StorageService()
        if not row.thumbnail_url:
            print("No thumbnail_url set for this frame.")
            return 0

        filename = os.path.basename(row.thumbnail_url)
        path = os.path.join(storage.thumb_dir, filename)

        if os.path.exists(path):
            print(f"Thumbnail file exists: {path}")
            return 0
        else:
            print(f"Thumbnail file NOT found at: {path}")
            return 1


def main():
    parser = argparse.ArgumentParser(description="Verify search result by frame id or video+frame")
    parser.add_argument("--frame-id", help="Frame UUID returned as result_key/frame_id")
    parser.add_argument("--video-id", help="Video UUID")
    parser.add_argument("--frame-number", type=int, help="Frame number (int)")

    args = parser.parse_args()

    if args.frame_id:
        code = asyncio.run(find_by_frame_id(args.frame_id))
        raise SystemExit(code)

    if args.video_id and args.frame_number is not None:
        code = asyncio.run(find_by_video_and_frame(args.video_id, args.frame_number))
        raise SystemExit(code)

    parser.print_help()


if __name__ == "__main__":
    main()
