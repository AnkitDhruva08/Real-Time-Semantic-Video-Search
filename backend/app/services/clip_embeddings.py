import torch
import clip
import numpy as np
from PIL import Image
from app.utils.logging import Logger

logger = Logger.get_logger(__name__)


class CLIPEmbeddingService:

    def __init__(self, model_name="ViT-B/32"):

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        logger.info(f"Loading CLIP model {model_name} on {self.device}")

        self.model, self.preprocess = clip.load(model_name, device=self.device)
        self.model.eval()

    # ---------------------------------------------
    # Image embedding
    # ---------------------------------------------

    def image_embedding(self, image_path: str):

        image = Image.open(image_path).convert("RGB")
        image = self.preprocess(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            embedding = self.model.encode_image(image)

        embedding = embedding / embedding.norm(dim=-1, keepdim=True)

        return embedding.cpu().numpy()[0]

    # ---------------------------------------------
    # Text embedding
    # ---------------------------------------------

    def text_embedding(self, text: str):
        print('text:', text)
        print('Ankit Mishra')
        tokens = clip.tokenize([text]).to(self.device)

        with torch.no_grad():
            embedding = self.model.encode_text(tokens)

        embedding = embedding / embedding.norm(dim=-1, keepdim=True)

        return embedding.cpu().numpy()[0]

    # ---------------------------------------------
    # Batch embeddings
    # ---------------------------------------------

    def batch_image_embeddings(self, image_paths, batch_size=64):
        logger.info(f"Processing batch of {len(image_paths)} images")
        embeddings = []
        for i in range(0, len(image_paths), batch_size):
            batch_paths = image_paths[i:i + batch_size]
            logger.debug(f"Batch {i//batch_size + 1}: paths {batch_paths}")
            try:
                images = torch.stack([
                    self.preprocess(Image.open(p).convert("RGB")) for p in batch_paths
                ]).to(self.device)
                with torch.no_grad():
                    batch_embeddings = self.model.encode_image(images)
                batch_embeddings = batch_embeddings / batch_embeddings.norm(dim=-1, keepdim=True)
                embeddings.extend(batch_embeddings.cpu().numpy())
            except Exception as e:
                logger.exception(f"Error processing batch {i//batch_size + 1}: {e}")
                raise   # re-raise to stop processing
        logger.info(f"Completed embedding generation for {len(embeddings)} frames")
        return np.array(embeddings)