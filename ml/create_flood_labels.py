import pandas as pd

INPUT_FILE = "data/rainfall/rainfall_features.csv"
OUTPUT_FILE = "data/rainfall/training_dataset_temp.csv"

print("Loading rainfall features...")

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(df["timestamp"])

# --------------------------------------------------
# PROTOTYPE FLASH-FLOOD RISK LABEL
# --------------------------------------------------
#
# This is a proxy label for ML pipeline development.
# It is NOT an observed flood-event label.
#
# High short-duration rainfall:
#     3-hour accumulated rainfall >= 30 mm
#
# AND
#
# High daily accumulated rainfall:
#     24-hour accumulated rainfall >= 60 mm
#
# These thresholds were selected after inspecting
# the rainfall distribution of the study-area dataset.
# --------------------------------------------------

df["flood"] = (
    (df["rain_3h"] >= 30) &
    (df["rain_24h"] >= 60)
).astype(int)

# --------------------------------------------------
# Handle missing rainfall_change values
# --------------------------------------------------

df["rainfall_change"] = df["rainfall_change"].fillna(0)

# --------------------------------------------------
# Display label distribution
# --------------------------------------------------

print("\n========== FLOOD LABEL DISTRIBUTION ==========")

print(df["flood"].value_counts())

print("\nPercentage:")

print(
    df["flood"]
    .value_counts(normalize=True)
    .mul(100)
    .round(4)
)

print("\nPositive flood-risk samples:", int(df["flood"].sum()))
print("Total samples:", len(df))

# --------------------------------------------------
# Save
# --------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n========== SUCCESS ==========")
print("Temporary training dataset saved to:")
print(OUTPUT_FILE)
