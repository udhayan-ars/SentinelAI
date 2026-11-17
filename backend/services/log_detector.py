
def detect_suspicious_activity(log_entry):
    """
    Detect suspicious activities in a parsed log entry.
    """

    if not isinstance(log_entry, dict):
        raise ValueError("Log entry must be a dictionary")

    message = str(log_entry.get("message", "")).lower()
    severity = str(log_entry.get("severity", "")).upper()

    suspicious_keywords = [
        "failed login",
        "unauthorized access",
        "brute force",
        "multiple login failures",
        "suspicious activity"
    ]

    detected_keywords = [
        keyword
        for keyword in suspicious_keywords
        if keyword in message
    ]

    if detected_keywords or severity == "CRITICAL":
        return {
            "suspicious": True,
            "reason": detected_keywords or ["Critical severity log"]
        }

    return {
        "suspicious": False,
        "reason": []
    }
