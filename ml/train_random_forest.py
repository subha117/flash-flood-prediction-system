import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    average_precision_score,
    roc_auc_score
)

INPUT_FILE = "data/rainfall/training_dataset_temp.csv"
MODEL_FILE = "ml/models/random_forest_flood.pkl"

print("Loading dataset...")

df = pd.read_csv(INPUT_FILE)

# --------------------------------------------------
# Features
# --------------------------------------------------

FEATURES = [
    "rainfall_mm_hr",
    "elevation_m",
    "slope_degree",
    "rain_1h",
    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rainfall_change",
]

X = df[FEATURES]
y = df["flood"]

# Safety check
X = X.fillna(0)

print("\n========== DATA ==========")
print("Samples:", len(df))
print("Features:", len(FEATURES))
print("Flood:", int(y.sum()))
print("Normal:", int((y == 0).sum()))

# --------------------------------------------------
# Stratified split
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\n========== SPLIT ==========")
print("Training:", len(X_train))
print("Testing:", len(X_test))
print("Training floods:", int(y_train.sum()))
print("Testing floods:", int(y_test.sum()))

# --------------------------------------------------
# Random Forest
# --------------------------------------------------

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)

print("\nTraining Random Forest...")

model.fit(X_train, y_train)

print("Training complete.")

# --------------------------------------------------
# Prediction
# --------------------------------------------------

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

# --------------------------------------------------
# Evaluation
# --------------------------------------------------

print("\n========== CONFUSION MATRIX ==========")
print(confusion_matrix(y_test, y_pred))

print("\n========== CLASSIFICATION REPORT ==========")
print(
    classification_report(
        y_test,
        y_pred,
        digits=4,
        zero_division=0
    )
)

print("\n========== ADDITIONAL METRICS ==========")

print(
    "PR-AUC:",
    round(average_precision_score(y_test, y_prob), 4)
)

print(
    "ROC-AUC:",
    round(roc_auc_score(y_test, y_prob), 4)
)

# --------------------------------------------------
# Feature importance
# --------------------------------------------------

importance = pd.DataFrame({
    "feature": FEATURES,
    "importance": model.feature_importances_
}).sort_values(
    "importance",
    ascending=False
)

print("\n========== FEATURE IMPORTANCE ==========")
print(importance.to_string(index=False))

# --------------------------------------------------
# Save model
# --------------------------------------------------

joblib.dump(model, MODEL_FILE)

print("\n========== SUCCESS ==========")
print("Model saved to:")
print(MODEL_FILE)
