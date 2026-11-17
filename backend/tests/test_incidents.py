
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


# CREATE INCIDENT
def test_create_incident(client):
    response = client.post("/api/incidents/", json={
        "title": "Suspicious Login",
        "description": "Multiple failed login attempts",
        "severity": "high"
    })

    assert response.status_code == 201
    assert response.json["incident"]["title"] == "Suspicious Login"
    assert response.json["incident"]["severity"] == "high"


# CREATE INCIDENT WITHOUT TITLE
def test_create_incident_without_title(client):
    response = client.post("/api/incidents/", json={
        "severity": "high"
    })

    assert response.status_code == 400
    assert response.json["error"] == "Title is required"


# GET ALL INCIDENTS
def test_get_all_incidents(client):
    client.post("/api/incidents/", json={
        "title": "Test Incident",
        "severity": "medium"
    })

    response = client.get("/api/incidents/")

    assert response.status_code == 200
    assert response.json["count"] == 1


# GET INCIDENT BY ID
def test_get_incident_by_id(client):
    created = client.post("/api/incidents/", json={
        "title": "Test Incident"
    })

    incident_id = created.json["incident"]["id"]

    response = client.get(f"/api/incidents/{incident_id}")

    assert response.status_code == 200
    assert response.json["incident"]["id"] == incident_id


# GET NONEXISTENT INCIDENT
def test_get_nonexistent_incident(client):
    response = client.get("/api/incidents/999")

    assert response.status_code == 404
    assert response.json["error"] == "Incident not found"


# UPDATE INCIDENT STATUS
def test_update_incident_status(client):
    created = client.post("/api/incidents/", json={
        "title": "Test Incident"
    })

    incident_id = created.json["incident"]["id"]

    response = client.patch(
        f"/api/incidents/{incident_id}",
        json={"status": "investigating"}
    )

    assert response.status_code == 200
    assert response.json["incident"]["status"] == "investigating"


# UPDATE INCIDENT WITH INVALID STATUS
def test_update_incident_with_invalid_status(client):
    created = client.post("/api/incidents/", json={
        "title": "Test Incident"
    })

    incident_id = created.json["incident"]["id"]

    response = client.patch(
        f"/api/incidents/{incident_id}",
        json={"status": "unknown"}
    )

    assert response.status_code == 400
    assert response.json["error"] == "Invalid status"

