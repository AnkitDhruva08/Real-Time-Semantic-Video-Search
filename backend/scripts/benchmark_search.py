import asyncio
import time
from app.services.semantic_search import SemanticSearchService


async def benchmark():

    service = SemanticSearchService()

    queries = [
        "a dog running",
        "people walking on the street",
        "a car driving fast",
        "animals in the wild",
        "football match",
    ]

    for q in queries:

        start = time.time()

        results = await service.search(q, limit=10)

        duration = time.time() - start

        print(
            f"Query: {q}\n"
            f"Results: {len(results)}\n"
            f"Time: {duration:.4f}s\n"
        )


if __name__ == "__main__":
    asyncio.run(benchmark())