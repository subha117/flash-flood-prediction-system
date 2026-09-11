from pathlib import Path

import joblib


MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "ml"
    / "models"
    / "random_forest_flood.pkl"
)


if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"ML model not found at: {MODEL_PATH}"
    )


model = joblib.load(MODEL_PATH)