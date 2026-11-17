
import pytest

from app import create_app
from extensions import db


@pytest.fixture
def app():
    test_app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"
    })

    yield test_app

    with test_app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def incident_id(client):
    response = client.post("/api/incidents/", json={
        "title": "Test Incident",
        "severity": "high"
    })

    return response.json["incident"]["id"]


# CREATE ANALYST ACTION
def test_create_analyst_action(client, incident_id):
    response = client.post("/api/analyst-actions/", json={
        "incident_id": incident_id,
        "action": "Investigate suspicious activity",
        "notes": "Initial investigation"
    })

    assert response.status_code == 201
    assert response.json["analyst_action"]["action"] == (
        "Investigate suspicious activity"
    )
    assert response.json["analyst_action"]["approval_status"] == "pending"


# CREATE ACTION WITHOUT ACTION
def test_create_action_without_action(client, incident_id):
    response = client.post("/api/analyst-actions/", json={
        "incident_id": incident_id
    })

    assert response.status_code == 400
    assert response.json["error"] == "Action is required"


# CREATE ACTION WITH INVALID INCIDENT
def test_create_action_with_invalid_incident(client):
    response = client.post("/api/analyst-actions/", json={
        "incident_id": 999,
        "action": "Investigate activity"
    })

    assert response.status_code == 404
    assert response.json["error"] == "Incident not found"


# GET ALL ANALYST ACTIONS
def test_get_all_analyst_actions(client, incident_id):
    client.post("/api/analyst-actions/", json={
        "incident_id": incident_id,
        "action": "Review logs"
    })

    response = client.get("/api/analyst-actions/")

    assert response.status_code == 200
    assert response.json["count"] == 1


# GET ANALYST ACTION BY ID
def test_get_analyst_action_by_id(client, incident_id):
    created = client.post("/api/analyst-actions/", json={
        "incident_id": incident_id,
        "action": "Review logs"
    })

    action_id = created.json["analyst_action"]["id"]

    response = client.get(f"/api/analyst-actions/{action_id}")

    assert response.status_code == 200
    assert response.json["analyst_action"]["id"] == action_id


# GET NONEXISTENT ACTION
def test_get_nonexistent_analyst_action(client):
    response = client.get("/api/analyst-actions/999")

    assert response.status_code == 404
    assert response.json["error"] == "Analyst action not found"


# UPDATE APPROVAL STATUS
def test_update_approval_status(client, incident_id):
    created = client.post("/api/analyst-actions/", json={
        "incident_id": incident_id,
        "action": "Review logs"
    })

    action_id = created.json["analyst_action"]["id"]

    response = client.patch(
        f"/api/analyst-actions/{action_id}",
        json={"approval_status": "approved"}
    )

    assert response.status_code == 200
    assert response.json["analyst_action"]["approval_status"] == "approved"


# UPDATE WITH INVALID APPROVAL STATUS
def test_update_invalid_approval_status(client, incident_id):
    created = client.post("/api/analyst-actions/", json={
        "incident_id": incident_id,
        "action": "Review logs"
    })

    action_id = created.json["analyst_action"]["id"]

    response = client.patch(
        f"/api/analyst-actions/{action_id}",
        json={"approval_status": "unknown"}
    )

    assert response.status_code == 400
    assert response.json["error"] == "Invalid approval status"

