import pandas as pd
from pathlib import Path

INPUT_FILE = "data/rainfall/training_dataset_temp.csv"
TRAIN_FILE = "data/rainfall/train.csv"
TEST_FILE = "data/rainfall/test.csv"

print("Loading dataset...")

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(df["timestamp"])

# Sort chronologically
df = df.sort_values("timestamp").reset_index(drop=True)

# --------------------------------------------------
# FEATURES
# --------------------------------------------------

FEATURES = [
    "latitude",
    "longitude",
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

TARGET = "flood"

# --------------------------------------------------
# TIME-BASED SPLIT
# --------------------------------------------------

split_index = int(len(df) * 0.80)

train = df.iloc[:split_index].copy()
test = df.iloc[split_index:].copy()

# --------------------------------------------------
# Save
# --------------------------------------------------

Path("data/rainfall").mkdir(parents=True, exist_ok=True)

train[FEATURES + [TARGET]].to_csv(TRAIN_FILE, index=False)
test[FEATURES + [TARGET]].to_csv(TEST_FILE, index=False)

# --------------------------------------------------
# REPORT
# --------------------------------------------------

print("\n========== ML DATASET ==========")

print("Total:", len(df))
print("Training:", len(train))
print("Testing:", len(test))

print("\nTraining flood labels:")
print(train[TARGET].value_counts())

print("\nTesting flood labels:")
print(test[TARGET].value_counts())

print("\nTraining time:")
print(train["timestamp"].min(), "->", train["timestamp"].max())

print("\nTesting time:")
print(test["timestamp"].min(), "->", test["timestamp"].max())

print("\nSaved:")
print(TRAIN_FILE)
print(TEST_FILE)
