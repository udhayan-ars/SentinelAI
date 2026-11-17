import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_PATH = BASE_DIR / "database" / "sentinelai.db"

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "sentinelai-development-secret-key"
)

DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"

HOST = "127.0.0.1"
PORT = 5000