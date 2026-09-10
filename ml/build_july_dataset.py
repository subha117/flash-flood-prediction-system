import xarray as xr
import pandas as pd
import glob

INPUT_DIR = "data/rainfall/2024-07"
OUTPUT_FILE = "data/rainfall/july_2024_rainfall.csv"

files = sorted(
    glob.glob(f"{INPUT_DIR}/*.nc4")
)

print("Files found:", len(files))

ds = xr.open_mfdataset(
    files,
    combine="by_coords"
)

df = (
    ds["precipitation"]
    .to_dataframe()
    .reset_index()
)

df = df.rename(
    columns={
        "precipitation": "rainfall_mm_hr"
    }
)

df = df.dropna(
    subset=["rainfall_mm_hr"]
)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n========== SUCCESS ==========")
print("Rows:", len(df))
print("Columns:", df.columns.tolist())
print("Saved:", OUTPUT_FILE)

print("\nFirst 5 rows:")
print(df.head())

ds.close()