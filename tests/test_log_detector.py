
import pytest

from backend.services.log_detector import detect_suspicious_activity


def test_detect_failed_login():
    log = {
        "message": "Multiple failed login attempts",
        "severity": "WARNING"
    }

    result = detect_suspicious_activity(log)

    assert result["suspicious"] is True
    assert "failed login" in result["reason"]


def test_normal_log():
    log = {
        "message": "User login successful",
        "severity": "INFO"
    }

    result = detect_suspicious_activity(log)

    assert result["suspicious"] is False
    assert result["reason"] == []


def test_critical_severity_log():
    log = {
        "message": "System activity detected",
        "severity": "CRITICAL"
    }

    result = detect_suspicious_activity(log)

    assert result["suspicious"] is True
    assert "Critical severity log" in result["reason"]


def test_invalid_log_input():
    with pytest.raises(ValueError):
        detect_suspicious_activity("invalid log")
