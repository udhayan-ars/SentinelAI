
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


def test_create_alert(client):
    response = client.post("/api/alerts/", json={
        "title": "Test Alert",
        "description": "Suspicious activity detected",
        "severity": "high",
        "source": "Firewall"
    })

    assert response.status_code == 201
    assert response.json["alert"]["title"] == "Test Alert"


def test_create_alert_without_title(client):
    response = client.post("/api/alerts/", json={
        "severity": "high"
    })

    assert response.status_code == 400
    assert response.json["error"] == "Title is required"


def test_create_alert_with_invalid_severity(client):
    response = client.post("/api/alerts/", json={
        "title": "Test Alert",
        "severity": 123
    })

    assert response.status_code == 400
    assert response.json["error"] == "Severity must be a string"


def test_get_all_alerts(client):
    client.post("/api/alerts/", json={
        "title": "Test Alert",
        "severity": "high"
    })

    response = client.get("/api/alerts/")

    assert response.status_code == 200
    assert response.json["count"] == 1


def test_get_alert_by_id(client):
    create_response = client.post("/api/alerts/", json={
        "title": "Test Alert",
        "severity": "high"
    })

    alert_id = create_response.json["alert"]["id"]

    response = client.get(f"/api/alerts/{alert_id}")

    assert response.status_code == 200
    assert response.json["alert"]["id"] == alert_id


def test_get_nonexistent_alert(client):
    response = client.get("/api/alerts/999")

    assert response.status_code == 404
    assert response.json["error"] == "Alert not found"


def test_update_alert_status(client):
    create_response = client.post("/api/alerts/", json={
        "title": "Test Alert",
        "severity": "high"
    })

    alert_id = create_response.json["alert"]["id"]

    response = client.patch(
        f"/api/alerts/{alert_id}",
        json={"status": "investigating"}
    )

    assert response.status_code == 200
    assert response.json["alert"]["status"] == "investigating"


def test_update_alert_with_invalid_status(client):
    create_response = client.post("/api/alerts/", json={
        "title": "Test Alert",
        "severity": "high"
    })

    alert_id = create_response.json["alert"]["id"]

    response = client.patch(
        f"/api/alerts/{alert_id}",
        json={"status": "unknown"}
    )

    assert response.status_code == 400

