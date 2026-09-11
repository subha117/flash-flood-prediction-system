import os
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
# Fallback to sqlite if postgres is not provided in development
_default_db = "sqlite:///./flashflood.db" if ENVIRONMENT != "production" else ""
DATABASE_URL = os.getenv("DATABASE_URL", _default_db)
if not DATABASE_URL and ENVIRONMENT == "production":
    raise RuntimeError("DATABASE_URL must be set in production")

print(f"[*] Starting in {ENVIRONMENT} mode. DB: {DATABASE_URL}")

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")
