    
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import sqlite3

from config import DATABASE_PATH
from utils.validators import validate_log_data

logs_bp = Blueprint("logs", __name__)


def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


@logs_bp.route("/logs", methods=["POST"])
def collect_log():

    data = request.get_json(silent=True)

    error = validate_log_data(data)

    if error:
        return jsonify({"error": error}), 400

    timestamp = datetime.now(timezone.utc).isoformat()

    connection = get_db_connection()

    cursor = connection.execute(
        """
        INSERT INTO logs (source, level, message, timestamp)
        VALUES (?, ?, ?, ?)
        """,
        (
            data["source"].strip(),
            data["level"].strip().upper(),
            data["message"].strip(),
            timestamp
        )
    )

    connection.commit()

    log_id = cursor.lastrowid
    connection.close()

    return jsonify({
        "message": "Log collected successfully",
        "log": {
            "id": log_id,
            "source": data["source"].strip(),
            "level": data["level"].strip().upper(),
            "message": data["message"].strip(),
            "timestamp": timestamp
        }
    }), 201


@logs_bp.route("/logs", methods=["GET"])
def get_logs():

    connection = get_db_connection()

    logs = connection.execute(
        "SELECT * FROM logs ORDER BY id ASC"
    ).fetchall()

    connection.close()

    return jsonify({
        "total": len(logs),
        "logs": [dict(log) for log in logs]
    }), 200
