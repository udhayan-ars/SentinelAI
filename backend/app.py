
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import db
import models

from routes.alerts import alerts_bp


def create_app(test_config=None):
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Apply test configuration when provided
    if test_config is not None:
        app.config.update(test_config)

    # Enable CORS
    CORS(app)

    # Initialize database
    db.init_app(app)

    # Register API blueprints
    app.register_blueprint(alerts_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    # Home API
    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "project": "SentinelAI",
            "module": "Backend API",
            "message": "SentinelAI Backend is running",
            "status": "success"
        }), 200

    # Health API
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

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
