import pickle
from pathlib import Path
from fastapi import FastAPI
from .config import settings

def load_model(app: FastAPI) -> None:
    path = Path(settings.model_path)
    if not path.exists():
        raise FileNotFoundError(f"Model bundle not found at {path}. Place ethical_risk_bundle.pkl in the Colab/ directory.")
    with open(path, "rb") as f:
        bundle = pickle.load(f)
    app.state.model = bundle["model"]
    app.state.vectorizer = bundle["vectorizer"]
