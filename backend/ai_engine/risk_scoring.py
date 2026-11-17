
"""
SentinelAI - Risk Scoring Engine
Member 2: AI Threat Detection and Investigation

Responsibilities:
1. Calculate numerical security risk scores
2. Evaluate alert severity
3. Consider event frequency
4. Consider suspicious indicators
5. Classify alerts into risk categories
"""


# ==========================================
# CONFIGURATION
# ==========================================

SEVERITY_WEIGHTS = {
    "LOW": 10,
    "MEDIUM": 25,
    "HIGH": 40,
    "CRITICAL": 60
}

FREQUENCY_WEIGHTS = {
    "LOW": 5,
    "MEDIUM": 15,
    "HIGH": 25
}

MAX_RISK_SCORE = 100


# ==========================================
# INPUT VALIDATION
# ==========================================

def validate_alert(alert: dict) -> None:
    """Validate an incoming security alert."""

    if not isinstance(alert, dict):
        raise ValueError("Alert must be a dictionary")

    severity = str(alert.get("severity", "")).upper()

    if severity not in SEVERITY_WEIGHTS:
        raise ValueError("Invalid alert severity")

    event_count = alert.get("event_count", 1)

    if isinstance(event_count, bool) or not isinstance(event_count, int):
        raise ValueError("event_count must be an integer")

    if event_count < 1:
        raise ValueError("event_count must be at least 1")

    indicators = alert.get("indicators", [])

    if not isinstance(indicators, list):
        raise ValueError("indicators must be a list")


# ==========================================
# FREQUENCY CLASSIFICATION
# ==========================================

def classify_frequency(event_count: int) -> str:
    """Classify the frequency of security events."""

    if event_count >= 10:
        return "HIGH"

    elif event_count >= 5:
        return "MEDIUM"

    return "LOW"


# ==========================================
# RISK CATEGORY
# ==========================================

def classify_risk(score: int) -> str:
    """Convert numerical risk into a risk category."""

    if score >= 80:
        return "CRITICAL"

    elif score >= 60:
        return "HIGH"

    elif score >= 30:
        return "MEDIUM"

    return "LOW"


# ==========================================
# INDICATOR SCORING
# ==========================================

def calculate_indicator_score(indicators: list) -> int:
    """Add risk points for recognized threat indicators."""

    indicator_weights = {
        "malware": 20,
        "brute_force": 15,
        "privilege_escalation": 20,
        "suspicious_ip": 10,
        "port_scan": 10,
        "unauthorized_access": 15,
        "sql_injection": 20
    }

    score = 0

    for indicator in indicators:

        normalized = str(indicator).strip().lower()

        score += indicator_weights.get(normalized, 0)

    return score


# ==========================================
# SINGLE ALERT RISK SCORING
# ==========================================

def calculate_risk_score(alert: dict) -> dict:
    """
    Calculate the risk score of one security alert.

    Scoring:
    Severity + Event Frequency + Threat Indicators

    Final score is capped at 100.
    """

    validate_alert(alert)

    severity = alert["severity"].upper()
    event_count = alert.get("event_count", 1)

    frequency = classify_frequency(event_count)

    severity_score = SEVERITY_WEIGHTS[severity]
    frequency_score = FREQUENCY_WEIGHTS[frequency]

    indicator_score = calculate_indicator_score(
        alert.get("indicators", [])
    )

    raw_score = (
        severity_score
        + frequency_score
        + indicator_score
    )

    final_score = min(raw_score, MAX_RISK_SCORE)

    return {
        "alert_type": alert.get("alert_type", "UNKNOWN"),
        "severity": severity,
        "severity_score": severity_score,
        "event_count": event_count,
        "frequency_level": frequency,
        "frequency_score": frequency_score,
        "indicator_score": indicator_score,
        "raw_score": raw_score,
        "risk_score": final_score,
        "risk_category": classify_risk(final_score),
        "source_ip": alert.get("source_ip", "unknown"),
        "recommendation": get_recommendation(
            classify_risk(final_score)
        )
    }


# ==========================================
# SECURITY RECOMMENDATIONS
# ==========================================

def get_recommendation(risk_category: str) -> str:
    """Provide a basic response recommendation."""

    recommendations = {
        "LOW": "Continue routine security monitoring.",
        "MEDIUM": "Review the alert and investigate suspicious activity.",
        "HIGH": "Prioritize investigation and verify affected systems.",
        "CRITICAL": (
            "Immediately investigate and follow the incident "
            "response process. Consider containment after verification."
        )
    }

    return recommendations[risk_category]


# ==========================================
# BATCH RISK SCORING
# ==========================================

def score_alerts(alerts: list[dict]) -> dict:
    """Calculate risk scores for multiple security alerts."""

    if not isinstance(alerts, list):
        raise ValueError("Alerts must be provided as a list")

    scored_alerts = []
    invalid_alerts = []

    for index, alert in enumerate(alerts):

        try:
            scored_alerts.append(
                calculate_risk_score(alert)
            )

        except (ValueError, TypeError) as error:

            invalid_alerts.append({
                "alert_index": index,
                "error": str(error)
            })

    scored_alerts.sort(
        key=lambda item: item["risk_score"],
        reverse=True
    )

    return {
        "engine": "SentinelAI Risk Scoring Engine",
        "total_alerts_received": len(alerts),
        "total_alerts_scored": len(scored_alerts),
        "invalid_alerts": invalid_alerts,
        "highest_risk_score": (
            scored_alerts[0]["risk_score"]
            if scored_alerts else 0
        ),
        "results": scored_alerts,
        "status": "COMPLETED"
    }


# ==========================================
# LOCAL TESTING
# ==========================================

if __name__ == "__main__":

    sample_alerts = [
        {
            "alert_type": "BRUTE_FORCE_ATTACK",
            "severity": "HIGH",
            "event_count": 8,
            "source_ip": "192.168.1.100",
            "indicators": ["brute_force", "suspicious_ip"]
        },
        {
            "alert_type": "MALWARE_DETECTED",
            "severity": "CRITICAL",
            "event_count": 12,
            "source_ip": "192.168.1.105",
            "indicators": ["malware", "suspicious_ip"]
        },
        {
            "alert_type": "PORT_SCAN",
            "severity": "MEDIUM",
            "event_count": 2,
            "source_ip": "10.0.0.20",
            "indicators": ["port_scan"]
        }
    ]

    result = score_alerts(sample_alerts)

    print("\n========== SENTINELAI RISK SCORING ==========")
    print(f"Alerts Received: {result['total_alerts_received']}")
    print(f"Alerts Scored: {result['total_alerts_scored']}")
    print(f"Highest Risk Score: {result['highest_risk_score']}")

    for alert in result["results"]:

        print("\n----------------------------------------")
        print(f"Alert: {alert['alert_type']}")
        print(f"Risk Score: {alert['risk_score']}/100")
        print(f"Risk Category: {alert['risk_category']}")
        print(f"Severity: {alert['severity']}")
        print(f"Recommendation: {alert['recommendation']}")

    print("\n========== RISK SCORING COMPLETED ==========")
