from flask import Blueprint, request, jsonify
from extensions import db
from models import Incident

incidents_bp = Blueprint(
    "incidents",
    __name__,
    url_prefix="/api/incidents"
)

ALLOWED_SEVERITIES = ["low", "medium", "high", "critical"]
ALLOWED_STATUSES = ["open", "investigating", "resolved", "closed"]


# CREATE INCIDENT
@incidents_bp.route("/", methods=["POST"])
def create_incident():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "JSON object is required"}), 400

    title = data.get("title")

    if not isinstance(title, str) or not title.strip():
        return jsonify({"error": "Title is required"}), 400

    severity = data.get("severity", "low")

    if not isinstance(severity, str):
        return jsonify({"error": "Severity must be a string"}), 400

    severity = severity.strip().lower()

    if severity not in ALLOWED_SEVERITIES:
        return jsonify({
            "error": "Invalid severity",
            "allowed_severities": ALLOWED_SEVERITIES
        }), 400

    description = data.get("description")

    if description is not None and not isinstance(description, str):
        return jsonify({"error": "Description must be a string"}), 400

    incident = Incident(
        title=title.strip(),
        description=description,
        severity=severity
    )

    db.session.add(incident)
    db.session.commit()

    return jsonify({
        "message": "Incident created successfully",
        "incident": {
            "id": incident.id,
            "title": incident.title,
            "severity": incident.severity,
            "status": incident.status
        }
    }), 201


# GET ALL INCIDENTS
@incidents_bp.route("/", methods=["GET"])
def get_incidents():
    incidents = Incident.query.order_by(
        Incident.created_at.desc()
    ).all()

    return jsonify({
        "count": len(incidents),
        "incidents": [
            {
                "id": incident.id,
                "title": incident.title,
                "description": incident.description,
                "severity": incident.severity,
                "status": incident.status,
                "assigned_to": incident.assigned_to
            }
            for incident in incidents
        ]
    }), 200


# GET INCIDENT BY ID
@incidents_bp.route("/<int:incident_id>", methods=["GET"])
def get_incident_by_id(incident_id):
    incident = db.session.get(Incident, incident_id)

    if incident is None:
        return jsonify({"error": "Incident not found"}), 404

    return jsonify({
        "incident": {
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "severity": incident.severity,
            "status": incident.status,
            "assigned_to": incident.assigned_to
        }
    }), 200


# UPDATE INCIDENT STATUS
@incidents_bp.route("/<int:incident_id>", methods=["PATCH"])
def update_incident(incident_id):
    incident = db.session.get(Incident, incident_id)

    if incident is None:
        return jsonify({"error": "Incident not found"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "JSON object is required"}), 400

    status = data.get("status")

    if not isinstance(status, str):
        return jsonify({"error": "Status must be a string"}), 400

    status = status.strip().lower()

    if status not in ALLOWED_STATUSES:
        return jsonify({
            "error": "Invalid status",
            "allowed_statuses": ALLOWED_STATUSES
        }), 400

    incident.status = status
    db.session.commit()

    return jsonify({
        "message": "Incident status updated successfully",
        "incident": {
            "id": incident.id,
            "title": incident.title,
            "status": incident.status
        }
    }), 200
