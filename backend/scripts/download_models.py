import torch
import clip


def download_clip_model(model_name="ViT-B/32"):

    device = "cuda" if torch.cuda.is_available() else "cpu"

    print(f"Downloading CLIP model ({model_name}) on {device}")

    model, preprocess = clip.load(model_name, device=device)

    print("Model downloaded successfully")


if __name__ == "__main__":
    download_clip_model()