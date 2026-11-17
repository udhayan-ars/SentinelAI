import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_PATH = BASE_DIR / "database" / "sentinelai.db"


class Config:
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "sentinelai-development-secret-key"
    )

    SQLALCHEMY_DATABASE_URI = (
        "sqlite:///" + DATABASE_PATH.as_posix()
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"

    HOST = "127.0.0.1"

    PORT = 5000