import pandas as pd

INPUT_FILE = "data/rainfall/rainfall_terrain.csv"
OUTPUT_FILE = "data/rainfall/rainfall_features.csv"

print("Loading dataset...")

df = pd.read_csv(INPUT_FILE)

# Convert timestamp
df["timestamp"] = pd.to_datetime(df["timestamp"])

# Sort by location and time
df = df.sort_values(
    ["latitude", "longitude", "timestamp"]
)

print("Rows:", len(df))

# ------------------------------------------------
# Rainfall accumulation
# ------------------------------------------------

# Each observation represents 30 minutes.
# Therefore:
# 2 observations  = 1 hour
# 6 observations  = 3 hours
# 12 observations = 6 hours
# 24 observations = 12 hours
# 48 observations = 24 hours

group = df.groupby(
    ["latitude", "longitude"]
)["rainfall_mm_hr"]

df["rain_1h"] = group.transform(
    lambda x: x.rolling(2, min_periods=1).sum() * 0.5
)

df["rain_3h"] = group.transform(
    lambda x: x.rolling(6, min_periods=1).sum() * 0.5
)

df["rain_6h"] = group.transform(
    lambda x: x.rolling(12, min_periods=1).sum() * 0.5
)

df["rain_12h"] = group.transform(
    lambda x: x.rolling(24, min_periods=1).sum() * 0.5
)

df["rain_24h"] = group.transform(
    lambda x: x.rolling(48, min_periods=1).sum() * 0.5
)

# ------------------------------------------------
# Rainfall intensity change
# ------------------------------------------------

df["rainfall_change"] = group.transform(
    lambda x: x.diff()
)

# ------------------------------------------------
# Save
# ------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n========== SUCCESS ==========")

print("Saved to:")
print(OUTPUT_FILE)

print("\nColumns:")

print(df.columns.tolist())

print("\nFirst 10 rows:")

print(
    df[
        [
            "timestamp",
            "latitude",
            "longitude",
            "rainfall_mm_hr",
            "rain_1h",
            "rain_3h",
            "rain_6h",
            "rain_12h",
            "rain_24h",
            "elevation_m",
            "slope_degree"
        ]
    ].head(10)
)

print("\nRainfall feature statistics:")

print(
    df[
        [
            "rain_1h",
            "rain_3h",
            "rain_6h",
            "rain_12h",
            "rain_24h"
        ]
    ].describe()
)