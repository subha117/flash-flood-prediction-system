import json
from pathlib import Path



import certifi
import httpx


SERVICE_URL = (
    "https://mapservice.gov.in/gismapservice/rest/services/"
    "BharatMapService/Admin_Boundary_District/MapServer/1/query"
)

OUTPUT_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "bharatmaps_districts.geojson"
)


def download_district_geometry():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    params = {
        "where": "1=1",
        "outFields": "*",
        "returnGeometry": "true",
        "f": "geojson",
    }

    response = httpx.get(
        SERVICE_URL,
        params=params,
        timeout=60.0,
        verify=certifi.where(),
    )

    response.raise_for_status()

    data = response.json()

    if data.get("type") != "FeatureCollection":
        raise ValueError("Unexpected response from Bharat Maps service")

    with OUTPUT_PATH.open("w", encoding="utf-8") as file:
        json.dump(data, file)

    print(f"Saved district geometry to: {OUTPUT_PATH}")
    print(f"Features downloaded: {len(data.get('features', []))}")


if __name__ == "__main__":
    download_district_geometry()