
from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path

from config import DEBUG, HOST, PORT, DATABASE_PATH
from routes.logs import logs_bp

app = Flask(__name__)

CORS(app)

# Database schema file path
BASE_DIR = Path(__file__).resolve().parent.parent
SCHEMA_PATH = BASE_DIR / "database" / "schema.sql"


# Initialize SQLite Database
def initialize_database():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DATABASE_PATH)

    with open(SCHEMA_PATH, "r", encoding="utf-8") as schema_file:
        connection.executescript(schema_file.read())

    connection.close()

    print("SentinelAI database initialized successfully!")


# Initialize database when application starts
initialize_database()

# Register log collection API
app.register_blueprint(logs_bp)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Welcome to SentinelAI",
        "status": "Backend is running"
    })


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "SentinelAI Backend"
    })


if __name__ == "__main__":
    app.run(
        host=HOST,
        port=PORT,
        debug=DEBUG
    )
