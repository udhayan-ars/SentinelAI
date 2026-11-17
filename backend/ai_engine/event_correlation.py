
"""
SentinelAI - Event Correlation Engine
Member 2: AI Threat Detection and Investigation

Responsibilities:
1. Group related security events
2. Correlate events by source IP and username
3. Identify suspicious event sequences
4. Detect distributed login attacks
5. Generate correlated security alerts
"""

from datetime import datetime, timezone, timedelta
from collections import defaultdict
from typing import Any


# ==========================================
# CONFIGURATION
# ==========================================

CORRELATION_WINDOW_MINUTES = 10
MINIMUM_RELATED_EVENTS = 3
DISTRIBUTED_ATTACK_THRESHOLD = 5


# ==========================================
# TIMESTAMP HANDLING
# ==========================================

def parse_timestamp(value: Any) -> datetime:

    if isinstance(value, datetime):
        result = value

    elif isinstance(value, (int, float)):
        result = datetime.fromtimestamp(value, tz=timezone.utc)

    elif isinstance(value, str):
        result = datetime.fromisoformat(value.replace("Z", "+00:00"))

    else:
        raise ValueError("Invalid event timestamp")

    if result.tzinfo is None:
        result = result.replace(tzinfo=timezone.utc)

    return result


# ==========================================
# EVENT NORMALIZATION
# ==========================================

def normalize_event(event: dict) -> dict:

    if not isinstance(event, dict):
        raise ValueError("Event must be a dictionary")

    normalized = event.copy()

    normalized["source_ip"] = str(
        event.get("source_ip", "unknown")
    ).strip()

    normalized["username"] = str(
        event.get("username", "unknown")
    ).strip()

    normalized["event_type"] = str(
        event.get("event_type", "unknown")
    ).strip().lower()

    normalized["status"] = str(
        event.get("status", "unknown")
    ).strip().lower()

    normalized["_timestamp"] = parse_timestamp(
        event.get("timestamp")
    )

    return normalized


# ==========================================
# ALERT GENERATOR
# ==========================================

def create_correlation_alert(
    alert_type: str,
    severity: str,
    description: str,
    events: list[dict]
) -> dict:

    return {
        "alert_type": alert_type,
        "severity": severity,
        "description": description,
        "correlated_event_count": len(events),
        "source_ips": sorted({
            event["source_ip"] for event in events
        }),
        "usernames": sorted({
            event["username"] for event in events
        }),
        "event_types": sorted({
            event["event_type"] for event in events
        }),
        "first_seen": min(
            event["_timestamp"] for event in events
        ).isoformat(),
        "last_seen": max(
            event["_timestamp"] for event in events
        ).isoformat(),
        "evidence": [
            {
                "source_ip": event["source_ip"],
                "username": event["username"],
                "event_type": event["event_type"],
                "status": event["status"],
                "timestamp": event["_timestamp"].isoformat()
            }
            for event in events
        ],
        "status": "NEW"
    }


# ==========================================
# RULE 1: SOURCE IP CORRELATION
# ==========================================

def correlate_by_source_ip(events: list[dict]) -> list[dict]:

    grouped_events = defaultdict(list)

    for event in events:
        grouped_events[event["source_ip"]].append(event)

    alerts = []

    for source_ip, grouped in grouped_events.items():

        grouped.sort(key=lambda item: item["_timestamp"])

        for start_index, start_event in enumerate(grouped):

            window_end = (
                start_event["_timestamp"]
                + timedelta(minutes=CORRELATION_WINDOW_MINUTES)
            )

            matching = [
                event for event in grouped
                if start_event["_timestamp"]
                <= event["_timestamp"] <= window_end
            ]

            event_types = {
                event["event_type"] for event in matching
            }

            # Correlate multiple types of security activity.
            if (
                len(matching) >= MINIMUM_RELATED_EVENTS
                and len(event_types) >= 2
            ):

                alerts.append(
                    create_correlation_alert(
                        alert_type="SOURCE_IP_EVENT_CORRELATION",
                        severity="HIGH",
                        description=(
                            f"Multiple related security events detected "
                            f"from source IP {source_ip} within "
                            f"{CORRELATION_WINDOW_MINUTES} minutes."
                        ),
                        events=matching
                    )
                )

                break

    return alerts


# ==========================================
# RULE 2: DISTRIBUTED LOGIN ATTACK
# ==========================================

def detect_distributed_login_attack(events: list[dict]) -> list[dict]:

    grouped_by_username = defaultdict(list)

    for event in events:

        is_failed_login = (
            event["event_type"] in (
                "login",
                "authentication",
                "login_failed"
            )
            and (
                event["status"] in ("failed", "failure", "denied")
                or event["event_type"] == "login_failed"
            )
        )

        if is_failed_login:
            grouped_by_username[event["username"]].append(event)

    alerts = []

    for username, attempts in grouped_by_username.items():

        attempts.sort(key=lambda item: item["_timestamp"])

        for start_event in attempts:

            window_end = (
                start_event["_timestamp"]
                + timedelta(minutes=CORRELATION_WINDOW_MINUTES)
            )

            matching = [
                event for event in attempts
                if start_event["_timestamp"]
                <= event["_timestamp"] <= window_end
            ]

            unique_ips = {
                event["source_ip"] for event in matching
            }

            if (
                len(unique_ips) >= 2
                and len(matching) >= DISTRIBUTED_ATTACK_THRESHOLD
            ):

                alerts.append(
                    create_correlation_alert(
                        alert_type="DISTRIBUTED_LOGIN_ATTACK",
                        severity="CRITICAL",
                        description=(
                            f"Multiple source IPs attempted to access "
                            f"account '{username}' within "
                            f"{CORRELATION_WINDOW_MINUTES} minutes."
                        ),
                        events=matching
                    )
                )

                break

    return alerts


# ==========================================
# MAIN CORRELATION ENGINE
# ==========================================

def correlate_events(events: list[dict]) -> dict:
    """
    Correlate security events and generate alerts.

    Returns correlated events and validation information.
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

    alerts.extend(
        correlate_by_source_ip(normalized_events)
    )

    alerts.extend(
        detect_distributed_login_attack(normalized_events)
    )

    return {
        "engine": "SentinelAI Event Correlation Engine",
        "total_events_received": len(events),
        "total_events_analyzed": len(normalized_events),
        "invalid_events": invalid_events,
        "total_correlated_alerts": len(alerts),
        "alerts": alerts,
        "status": "COMPLETED"
    }


# ==========================================
# LOCAL TESTING
# ==========================================

if __name__ == "__main__":

    current_time = datetime.now(timezone.utc)

    sample_events = [
        {
            "timestamp": (
                current_time + timedelta(seconds=index * 30)
            ).isoformat(),
            "event_type": event_type,
            "source_ip": "192.168.1.100",
            "username": "admin",
            "status": status
        }
        for index, (event_type, status) in enumerate([
            ("login", "failed"),
            ("port_scan", "detected"),
            ("login", "failed"),
            ("unauthorized_access", "denied")
        ])
    ]

    # Simulate distributed login attempts.
    for index, source_ip in enumerate([
        "10.0.0.1",
        "10.0.0.2",
        "10.0.0.3",
        "10.0.0.4",
        "10.0.0.5"
    ]):

        sample_events.append({
            "timestamp": (
                current_time + timedelta(seconds=index * 20)
            ).isoformat(),
            "event_type": "login",
            "source_ip": source_ip,
            "username": "administrator",
            "status": "failed"
        })

    result = correlate_events(sample_events)

    print("\n========== SENTINELAI EVENT CORRELATION ==========")
    print(f"Events Analyzed: {result['total_events_analyzed']}")
    print(f"Correlated Alerts: {result['total_correlated_alerts']}")

    for alert in result["alerts"]:

        print("\n----------------------------------------")
        print(f"Alert: {alert['alert_type']}")
        print(f"Severity: {alert['severity']}")
        print(f"Description: {alert['description']}")
        print(f"Related Events: {alert['correlated_event_count']}")
        print(f"Source IPs: {alert['source_ips']}")

    print("\n========== CORRELATION COMPLETED ==========")
