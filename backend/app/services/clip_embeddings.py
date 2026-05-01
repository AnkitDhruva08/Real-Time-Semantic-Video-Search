import torch
import clip
import numpy as np
from PIL import Image
from typing import List
from app.utils.logging import Logger

logger = Logger.get_logger(__name__)


class CLIPEmbeddingService:
    """
    CLIP embedding service for generating text and image embeddings.
    Supports batch processing and GPU acceleration.
    """

    def __init__(self, model_name: str = "ViT-B/32"):

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        logger.info(f"Loading CLIP model '{model_name}' on device: {self.device}")

        self.model, self.preprocess = clip.load(model_name, device=self.device)
        self.model.eval()

        # embedding dimension check
        dummy = clip.tokenize(["test"]).to(self.device)
        with torch.no_grad():
            emb = self.model.encode_text(dummy)

        self.embedding_dim = emb.shape[-1]

        logger.info(f"CLIP embedding dimension: {self.embedding_dim}")

    # --------------------------------------------------
    # Image Embedding
    # --------------------------------------------------

    def image_embedding(self, image_path: str):

        try:

            with Image.open(image_path) as img:

                image = img.convert("RGB")

            image = self.preprocess(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                embedding = self.model.encode_image(image)

            embedding = embedding / embedding.norm(dim=-1, keepdim=True)

            return embedding.cpu().numpy()[0]

        except Exception as e:

            logger.error(f"Image embedding failed for {image_path}: {e}")

            return None

    # --------------------------------------------------
    # Text Embedding
    # --------------------------------------------------

    def text_embedding(self, text: str):

        if not text:
            logger.warning("Empty text provided for embedding")
            return None

        try:

            tokens = clip.tokenize([text]).to(self.device)

            with torch.no_grad():
                embedding = self.model.encode_text(tokens)

            embedding = embedding / embedding.norm(dim=-1, keepdim=True)

            return embedding.cpu().numpy()[0]

        except Exception as e:

            logger.error(f"Text embedding failed for '{text}': {e}")

            return None

    # --------------------------------------------------
    # Batch Image Embeddings
    # --------------------------------------------------

    def batch_image_embeddings(
        self,
        image_paths: List[str],
        batch_size: int = 64
    ):

        if not image_paths:
            logger.warning("Empty image path list provided")
            return np.array([])

        logger.info(f"Generating embeddings for {len(image_paths)} frames")

        embeddings = []

        for i in range(0, len(image_paths), batch_size):

            batch_paths = image_paths[i:i + batch_size]

            images = []

            valid_paths = []

            for path in batch_paths:

                try:
                    with Image.open(path) as img:
                        img = img.convert("RGB")

                    images.append(self.preprocess(img))
                    valid_paths.append(path)

                except Exception as e:

                    logger.warning(f"Skipping corrupted frame {path}: {e}")

            if not images:
                continue

            images = torch.stack(images).to(self.device)

            try:

                with torch.no_grad():
                    batch_embeddings = self.model.encode_image(images)

                batch_embeddings = batch_embeddings / batch_embeddings.norm(
                    dim=-1, keepdim=True
                )

                embeddings.extend(batch_embeddings.cpu().numpy())

            except Exception as e:

                logger.error(f"Batch embedding failed: {e}")

        logger.info(f"Generated {len(embeddings)} embeddings")

        return np.array(embeddings)