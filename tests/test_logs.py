
from backend.services.log_collector import collect_log
from backend.services.log_parser import parse_log


def test_collect_log():
    log = collect_log("Windows", "User login successful", "info")

    assert log["source"] == "Windows"
    assert log["message"] == "User login successful"
    assert log["severity"] == "INFO"
    assert "timestamp" in log


def test_parse_log():
    log = {
        "source": "Linux",
        "message": "SSH login failed",
        "severity": "warning",
        "timestamp": "2026-11-17T10:00:00+00:00"
    }

    parsed = parse_log(log)

    assert parsed["source"] == "Linux"
    assert parsed["severity"] == "WARNING"


def test_parse_log_missing_field():
    log = {
        "source": "Windows",
        "message": "Login failed"
    }

    try:
        parse_log(log)
        assert False, "Expected ValueError"
    except ValueError:
        assert True
