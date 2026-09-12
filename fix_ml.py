import re

with open("app/services/ml_service.py", "r") as f:
    content = f.read()

content = content.replace("import pickle", "import joblib")
content = content.replace("with open(model_path, \"rb\") as f:\n                self.model = pickle.load(f)", "self.model = joblib.load(model_path)")

with open("app/services/ml_service.py", "w") as f:
    f.write(content)
