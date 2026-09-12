import os

with open("app/main.py", "r") as f:
    content = f.read()

# Replace the create_prediction logic
old_logic = """@app.post("/api/predictions", response_model=PredictionResponse)
def create_prediction(pred: PredictionCreate, db: Session = Depends(get_db)):
    db_pred = Prediction(**pred.dict())"""

new_logic = """@app.post("/api/predictions", response_model=PredictionResponse)
def create_prediction(pred: PredictionCreate, db: Session = Depends(get_db)):
    # Run ML Model
    ml_result = ml_service.predict(pred.dict())
    
    # Save to DB
    pred_data = pred.dict()
    pred_data["prediction"] = ml_result["prediction"]
    pred_data["flood_probability"] = ml_result["flood_probability"]
    pred_data["risk_level"] = ml_result["risk_level"]
    
    db_pred = Prediction(**pred_data)"""

content = content.replace(old_logic, new_logic)

with open("app/main.py", "w") as f:
    f.write(content)
