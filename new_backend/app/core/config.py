import os

from dotenv import load_dotenv


load_dotenv()


def get_required_env(name: str) -> str:
    value = os.getenv(name)

    if not value:
        raise RuntimeError(f"{name} is not set in .env")

    return value


DATABASE_URL = get_required_env("DATABASE_URL")
JWT_SECRET_KEY = get_required_env("JWT_SECRET_KEY")