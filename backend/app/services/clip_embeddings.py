import torch
import clip
import numpy as np
from PIL import Image


class CLIPEmbeddingService:
    """
    Generate embeddings for images and text using CLIP
    """

    def __init__(self, model_name="ViT-B/32"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.model, self.preprocess = clip.load(
            model_name,
            device=self.device
        )

    def image_embedding(self, image_path: str):

        image = self.preprocess(Image.open(image_path)).unsqueeze(0).to(self.device)

        with torch.no_grad():
            embedding = self.model.encode_image(image)

        embedding = embedding / embedding.norm(dim=-1, keepdim=True)

        return embedding.cpu().numpy()[0]

    def text_embedding(self, text: str):

        text_tokens = clip.tokenize([text]).to(self.device)

        with torch.no_grad():
            embedding = self.model.encode_text(text_tokens)

        embedding = embedding / embedding.norm(dim=-1, keepdim=True)

        return embedding.cpu().numpy()[0]

    def batch_image_embeddings(self, image_paths, batch_size=32):

        embeddings = []

        for i in range(0, len(image_paths), batch_size):

            batch_paths = image_paths[i : i + batch_size]

            images = torch.stack(
                [self.preprocess(Image.open(p)) for p in batch_paths]
            ).to(self.device)

            with torch.no_grad():
                batch_embeddings = self.model.encode_image(images)

            batch_embeddings = batch_embeddings / batch_embeddings.norm(
                dim=-1, keepdim=True
            )

            embeddings.extend(batch_embeddings.cpu().numpy())

        return np.array(embeddings)