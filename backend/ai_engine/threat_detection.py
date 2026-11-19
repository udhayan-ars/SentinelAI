
"""
SentinelAI - Threat Detection Engine
Member 2: AI Threat Detection and Investigation

Responsibilities:
1. Analyze security events
2. Detect repeated failed login attempts
3. Identify suspicious activities
4. Generate security alerts
5. Assign alert severity
"""

from datetime import datetime, timezone, timedelta
from collections import defaultdict
from typing import Any


# ==========================================
# CONFIGURATION
# ==========================================

BRUTE_FORCE_THRESHOLD = 5
BRUTE_FORCE_WINDOW_MINUTES = 5

SEVERITY_LEVELS = {
    "LOW": 1,
    "MEDIUM": 2,
    "HIGH": 3,
    "CRITICAL": 4
}


# ==========================================
# EVENT NORMALIZATION
# ==========================================

def parse_timestamp(value: Any) -> datetime:
    """Convert an event timestamp into a timezone-aware datetime."""

    if isinstance(value, datetime):
        result = value

    elif isinstance(value, (int, float)):
        result = datetime.fromtimestamp(value, tz=timezone.utc)

    elif isinstance(value, str):
        result = datetime.fromisoformat(value.replace("Z", "+00:00"))

    else:
        raise ValueError("Invalid or missing event timestamp")

    if result.tzinfo is None:
        result = result.replace(tzinfo=timezone.utc)

    return result


def normalize_event(event: dict) -> dict:
    """Normalize security event fields for consistent analysis."""

    if not isinstance(event, dict):
        raise ValueError("Each security event must be a dictionary")

    event_type = str(event.get("event_type", "")).strip().lower()
    source_ip = str(event.get("source_ip", "unknown")).strip()
    username = str(event.get("username", "unknown")).strip()
    status = str(event.get("status", "")).strip().lower()

    timestamp = parse_timestamp(event.get("timestamp"))

    return {
        **event,
        "event_type": event_type,
        "source_ip": source_ip,
        "username": username,
        "status": status,
        "_parsed_timestamp": timestamp
    }


# ==========================================
# ALERT GENERATOR
# ==========================================

def generate_alert(
    alert_type: str,
    severity: str,
    description: str,
    source_ip: str,
    username: str,
    event_count: int,
    evidence: list
) -> dict:
    """Generate a standardized security alert."""

    return {
        "alert_type": alert_type,
        "severity": severity,
        "severity_level": SEVERITY_LEVELS[severity],
        "description": description,
        "source_ip": source_ip,
        "username": username,
        "event_count": event_count,
        "evidence": evidence,
        "detected_at": datetime.now(timezone.utc).isoformat(),
        "status": "NEW"
    }


# ==========================================
# RULE 1: BRUTE FORCE DETECTION
# ==========================================

def detect_brute_force(events: list[dict]) -> list[dict]:
    """
    Detect repeated failed login attempts.

    Default rule:
    5 or more failed login attempts
    from the same source IP
    within a 5-minute window.
    """

    failed_logins = defaultdict(list)

    for event in events:

        if event["event_type"] not in (
            "login",
            "authentication",
            "login_failed"
        ):
            continue

        is_failed = (
            event["status"] in ("failed", "failure", "denied")
            or event["event_type"] == "login_failed"
        )

        if is_failed:
            failed_logins[event["source_ip"]].append(event)

    alerts = []

    for source_ip, attempts in failed_logins.items():

        attempts.sort(key=lambda item: item["_parsed_timestamp"])

        for index, current_event in enumerate(attempts):

            window_start = current_event["_parsed_timestamp"]
            window_end = window_start + timedelta(
                minutes=BRUTE_FORCE_WINDOW_MINUTES
            )

            matching_events = [
                item for item in attempts
                if window_start <= item["_parsed_timestamp"] <= window_end
            ]

            if len(matching_events) >= BRUTE_FORCE_THRESHOLD:

                usernames = sorted({
                    item["username"] for item in matching_events
                })

                alert = generate_alert(
                    alert_type="BRUTE_FORCE_ATTACK",
                    severity="HIGH",
                    description=(
                        f"Detected {len(matching_events)} failed login "
                        f"attempts from {source_ip} within "
                        f"{BRUTE_FORCE_WINDOW_MINUTES} minutes."
                    ),
                    source_ip=source_ip,
                    username=", ".join(usernames),
                    event_count=len(matching_events),
                    evidence=[
                        {
                            "timestamp": item["_parsed_timestamp"].isoformat(),
                            "username": item["username"],
                            "event_type": item["event_type"],
                            "status": item["status"]
                        }
                        for item in matching_events
                    ]
                )

                alerts.append(alert)
                break

    return alerts


# ==========================================
# RULE 2: SUSPICIOUS ACTIVITY DETECTION
# ==========================================

def detect_suspicious_activity(events: list[dict]) -> list[dict]:
    """Detect predefined high-risk security activities."""

    suspicious_rules = {
        "port_scan": {
            "severity": "HIGH",
            "description": "Possible network port scanning activity detected."
        },
        "malware_detected": {
            "severity": "CRITICAL",
            "description": "Malware detection event reported."
        },
        "privilege_escalation": {
            "severity": "CRITICAL",
            "description": "Possible privilege escalation detected."
        },
        "unauthorized_access": {
            "severity": "HIGH",
            "description": "Unauthorized access attempt detected."
        },
        "sql_injection": {
            "severity": "HIGH",
            "description": "Possible SQL injection activity detected."
        },
        "suspicious_process": {
            "severity": "MEDIUM",
            "description": "Suspicious process execution detected."
        }
    }

    alerts = []

    for event in events:

        rule = suspicious_rules.get(event["event_type"])

        if not rule:
            continue

        alerts.append(
            generate_alert(
                alert_type=event["event_type"].upper(),
                severity=rule["severity"],
                description=rule["description"],
                source_ip=event["source_ip"],
                username=event["username"],
                event_count=1,
                evidence=[{
                    "timestamp": event["_parsed_timestamp"].isoformat(),
                    "event_type": event["event_type"],
                    "message": event.get("message", "No additional details")
                }]
            )
        )

    return alerts


# ==========================================
# MAIN THREAT DETECTION ENGINE
# ==========================================

def detect_threats(events: list[dict]) -> dict:
    """
    Analyze security events and return generated alerts.

    Input:
        List of security event dictionaries.

    Output:
        Detection summary and security alerts.
    """

    if not isinstance(events, list):
        raise ValueError("Events must be provided as a list")

    normalized_events = []
    invalid_events = []

    for index, event in enumerate(events):

        try:
            normalized_events.append(normalize_event(event))

        except (ValueError, TypeError, OverflowError) as error:
            invalid_events.append({
                "event_index": index,
                "error": str(error)
            })

    alerts = []

    alerts.extend(detect_brute_force(normalized_events))
    alerts.extend(detect_suspicious_activity(normalized_events))

    alerts.sort(
        key=lambda alert: alert["severity_level"],
        reverse=True
    )

    return {
        "engine": "SentinelAI Threat Detection Engine",
        "total_events_received": len(events),
        "total_events_analyzed": len(normalized_events),
        "invalid_events": invalid_events,
        "total_alerts": len(alerts),
        "alerts": alerts,
        "status": "COMPLETED"
    }


# ==========================================
# LOCAL TESTING
# ==========================================

if __name__ == "__main__":

    sample_events = []

    current_time = datetime.now(timezone.utc)

    # Generate 5 failed login attempts from one IP.
    for attempt in range(5):

        sample_events.append({
            "timestamp": (
                current_time + timedelta(seconds=attempt * 30)
            ).isoformat(),
            "event_type": "login",
            "source_ip": "192.168.1.100",
            "username": "admin",
            "status": "failed",
            "message": "Invalid password"
        })

    # Add a suspicious malware event.
    sample_events.append({
        "timestamp": current_time.isoformat(),
        "event_type": "malware_detected",
        "source_ip": "192.168.1.105",
        "username": "user01",
        "status": "detected",
        "message": "Test malware detection event"
    })

    result = detect_threats(sample_events)

    print("\n========== SENTINELAI DETECTION REPORT ==========")
    print(f"Events Analyzed: {result['total_events_analyzed']}")
    print(f"Alerts Generated: {result['total_alerts']}")

    for alert in result["alerts"]:
        print("\n----------------------------------------")
        print(f"Alert: {alert['alert_type']}")
        print(f"Severity: {alert['severity']}")
        print(f"Source IP: {alert['source_ip']}")
        print(f"Description: {alert['description']}")

    print("\n========== DETECTION COMPLETED ==========")
