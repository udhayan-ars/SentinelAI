
from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path

from config import Config, DATABASE_PATH
from extensions import db
import models

from routes.alerts import alerts_bp
from routes.incidents import incidents_bp
from routes.analyst_actions import analyst_actions_bp
from routes.logs import logs_bp


def create_app(test_config=None):
    app = Flask(__name__)

    app.config.from_object(Config)

    if test_config is not None:
        app.config.update(test_config)

    CORS(app)
    db.init_app(app)

    app.register_blueprint(alerts_bp)
    app.register_blueprint(incidents_bp)
    app.register_blueprint(analyst_actions_bp)
    app.register_blueprint(logs_bp)

    with app.app_context():
        db.create_all()

        DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

        schema_path = (
            Path(__file__).resolve().parent.parent
            / "database"
            / "schema.sql"
        )

        connection = sqlite3.connect(DATABASE_PATH)

        with open(schema_path, "r", encoding="utf-8") as schema_file:
            connection.executescript(schema_file.read())

        connection.close()

    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "project": "SentinelAI",
            "module": "Backend API",
            "message": "SentinelAI Backend is running",
            "status": "success"
        }), 200

    @app.route("/api/health", methods=["GET"])
    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "SentinelAI Backend",
            "database": "connected"
        }), 200

    return app


if __name__ == "__main__":
    app = create_app()

    app.run(
        host=app.config.get("HOST", "127.0.0.1"),
        port=app.config.get("PORT", 5000),
        debug=app.config.get("DEBUG", True)
    )
