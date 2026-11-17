
from flask import Blueprint, request, jsonify
from extensions import db
from models import Alert

alerts_bp = Blueprint("alerts", __name__, url_prefix="/api/alerts")


# CREATE ALERT
@alerts_bp.route("/", methods=["POST"])
def create_alert():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "JSON object is required"}), 400

    title = data.get("title")

    if not isinstance(title, str) or not title.strip():
        return jsonify({"error": "Title is required"}), 400

    severity = data.get("severity", "low")

    if not isinstance(severity, str):
        return jsonify({"error": "Severity must be a string"}), 400

    severity = severity.lower().strip()

    allowed_severities = ["low", "medium", "high", "critical"]

    if severity not in allowed_severities:
        return jsonify({
            "error": "Invalid severity",
            "allowed_severities": allowed_severities
        }), 400

    description = data.get("description")
    source = data.get("source")

    if description is not None and not isinstance(description, str):
        return jsonify({"error": "Description must be a string"}), 400

    if source is not None and not isinstance(source, str):
        return jsonify({"error": "Source must be a string"}), 400

    alert = Alert(
        title=title.strip(),
        description=description,
        severity=severity,
        source=source
    )

    db.session.add(alert)
    db.session.commit()

    return jsonify({
        "message": "Alert created successfully",
        "alert": {
            "id": alert.id,
            "title": alert.title,
            "severity": alert.severity,
            "status": alert.status
        }
    }), 201


# GET ALL ALERTS
@alerts_bp.route("/", methods=["GET"])
def get_alerts():
    alerts = Alert.query.order_by(Alert.created_at.desc()).all()

    return jsonify({
        "count": len(alerts),
        "alerts": [
            {
                "id": alert.id,
                "title": alert.title,
                "description": alert.description,
                "severity": alert.severity,
                "source": alert.source,
                "status": alert.status
            }
            for alert in alerts
        ]
    }), 200


# GET ALERT BY ID
@alerts_bp.route("/<int:alert_id>", methods=["GET"])
def get_alert_by_id(alert_id):
    alert = db.session.get(Alert, alert_id)

    if alert is None:
        return jsonify({"error": "Alert not found"}), 404

    return jsonify({
        "alert": {
            "id": alert.id,
            "title": alert.title,
            "description": alert.description,
            "severity": alert.severity,
            "source": alert.source,
            "status": alert.status
        }
    }), 200


# UPDATE ALERT STATUS
@alerts_bp.route("/<int:alert_id>", methods=["PATCH"])
def update_alert(alert_id):
    alert = db.session.get(Alert, alert_id)

    if alert is None:
        return jsonify({"error": "Alert not found"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "JSON object is required"}), 400

    status = data.get("status")

    allowed_statuses = [
        "new",
        "investigating",
        "resolved",
        "false_positive"
    ]

    if not isinstance(status, str) or status not in allowed_statuses:
        return jsonify({
            "error": "Invalid status",
            "allowed_statuses": allowed_statuses
        }), 400

    alert.status = status
    db.session.commit()

    return jsonify({
        "message": "Alert status updated successfully",
        "alert": {
            "id": alert.id,
            "title": alert.title,
            "status": alert.status
        }
    }), 200

