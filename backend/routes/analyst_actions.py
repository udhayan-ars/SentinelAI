from flask import Blueprint, request, jsonify
from extensions import db
from models import AnalystAction, Incident, User

analyst_actions_bp = Blueprint(
    "analyst_actions",
    __name__,
    url_prefix="/api/analyst-actions"
)

ALLOWED_APPROVAL_STATUSES = [
    "pending",
    "approved",
    "rejected"
]


# CREATE ANALYST ACTION
@analyst_actions_bp.route("/", methods=["POST"])
def create_analyst_action():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "JSON object is required"}), 400

    incident_id = data.get("incident_id")
    analyst_id = data.get("analyst_id")
    action = data.get("action")
    notes = data.get("notes")

    if not isinstance(incident_id, int) or isinstance(incident_id, bool):
        return jsonify({"error": "Valid incident_id is required"}), 400

    incident = db.session.get(Incident, incident_id)

    if incident is None:
        return jsonify({"error": "Incident not found"}), 404

    if analyst_id is not None:
        if not isinstance(analyst_id, int) or isinstance(analyst_id, bool):
            return jsonify({"error": "Valid analyst_id is required"}), 400

        analyst = db.session.get(User, analyst_id)

        if analyst is None:
            return jsonify({"error": "Analyst not found"}), 404

    if not isinstance(action, str) or not action.strip():
        return jsonify({"error": "Action is required"}), 400

    if notes is not None and not isinstance(notes, str):
        return jsonify({"error": "Notes must be a string"}), 400

    analyst_action = AnalystAction(
        incident_id=incident_id,
        analyst_id=analyst_id,
        action=action.strip(),
        notes=notes
    )

    db.session.add(analyst_action)
    db.session.commit()

    return jsonify({
        "message": "Analyst action created successfully",
        "analyst_action": {
            "id": analyst_action.id,
            "incident_id": analyst_action.incident_id,
            "analyst_id": analyst_action.analyst_id,
            "action": analyst_action.action,
            "approval_status": analyst_action.approval_status
        }
    }), 201


# GET ALL ANALYST ACTIONS
@analyst_actions_bp.route("/", methods=["GET"])
def get_analyst_actions():
    actions = AnalystAction.query.order_by(
        AnalystAction.created_at.desc()
    ).all()

    return jsonify({
        "count": len(actions),
        "analyst_actions": [
            {
                "id": item.id,
                "incident_id": item.incident_id,
                "analyst_id": item.analyst_id,
                "action": item.action,
                "approval_status": item.approval_status,
                "notes": item.notes
            }
            for item in actions
        ]
    }), 200


# GET ANALYST ACTION BY ID
@analyst_actions_bp.route("/<int:action_id>", methods=["GET"])
def get_analyst_action_by_id(action_id):
    item = db.session.get(AnalystAction, action_id)

    if item is None:
        return jsonify({"error": "Analyst action not found"}), 404

    return jsonify({
        "analyst_action": {
            "id": item.id,
            "incident_id": item.incident_id,
            "analyst_id": item.analyst_id,
            "action": item.action,
            "approval_status": item.approval_status,
            "notes": item.notes
        }
    }), 200


# UPDATE APPROVAL STATUS
@analyst_actions_bp.route("/<int:action_id>", methods=["PATCH"])
def update_approval_status(action_id):
    item = db.session.get(AnalystAction, action_id)

    if item is None:
        return jsonify({"error": "Analyst action not found"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "JSON object is required"}), 400

    status = data.get("approval_status")

    if not isinstance(status, str):
        return jsonify({"error": "Approval status must be a string"}), 400

    status = status.strip().lower()

    if status not in ALLOWED_APPROVAL_STATUSES:
        return jsonify({
            "error": "Invalid approval status",
            "allowed_statuses": ALLOWED_APPROVAL_STATUSES
        }), 400

    item.approval_status = status
    db.session.commit()

    return jsonify({
        "message": "Approval status updated successfully",
        "analyst_action": {
            "id": item.id,
            "approval_status": item.approval_status
        }
    }), 200
