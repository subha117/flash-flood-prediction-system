import joblib
import os
import numpy as np

MODEL_FEATURES = [
    "rainfall_mm_hr",
    "elevation_m",
    "slope_degree",
    "rain_1h",
    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rainfall_change"
]

class MLService:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        model_path = os.path.join(os.path.dirname(__file__), "../../app/ml/model.pkl")
        if not os.path.exists(model_path):
            model_path = os.path.join(os.path.dirname(__file__), "../../ml/models/random_forest_flood.pkl")
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            print(f"[*] ML model loaded from {model_path}")
        else:
            print("[!] Warning: ML model not found. Predictions will return dummy data.")

    def predict(self, features_dict: dict):
        if not self.model:
            return {"prediction": 0, "flood_probability": 0.1, "risk_level": "LOW"}
            
        # Ensure exact order and no NaNs
        input_vector = []
        for feat in MODEL_FEATURES:
            val = features_dict.get(feat)
            if val is None or np.isnan(val):
                raise ValueError(f"Missing or invalid feature: {feat}")
            input_vector.append(float(val))
            
        try:
            arr = np.array([input_vector])
            pred = int(self.model.predict(arr)[0])
            prob = float(self.model.predict_proba(arr)[0][1])
            
            # Risk Level
            if prob < 0.3:
                risk = "LOW"
            elif prob < 0.6:
                risk = "MEDIUM"
            elif prob < 0.8:
                risk = "HIGH"
            else:
                risk = "CRITICAL"
                
            return {
                "prediction": pred,
                "flood_probability": prob,
                "risk_level": risk
            }
        except Exception as e:
            raise ValueError(f"Prediction failed: {str(e)}")

ml_service = MLService()
