from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import db
import models


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    with app.app_context():
        db.create_all()

    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "project": "SentinelAI",
            "module": "Backend API",
            "message": "SentinelAI Backend is running",
            "status": "success"
        })

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "SentinelAI Backend",
            "database": "connected"
        }), 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="127.0.0.1", port=5000, debug=True)
